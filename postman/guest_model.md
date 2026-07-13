# GUEST MODE

Base path: `/guest/`.

Guest mode lets a visitor **play games without logging in**. The server records
what they win against an anonymous **guest session**. When the visitor later
registers / logs in (the normal wallet login at `/login/generate-token/`), they
**claim** those winnings onto their brand-new member account.

This document covers both the **public API** (for the frontend) and the
**internal design** (for backend maintainers).

---

## How it works

* **It's its own app** (`apps.guest`). It sits at the top of the import graph —
  it imports the game apps (`luckyspin`, `penaltykick`, `smashegg`), `members`,
  `settings`, `front_view`, `third_party`; nothing imports it back. This keeps
  guest mode isolated and avoids circular imports.
* **The client never sends the result.** It only sends `gametype`; the server
  decides the outcome, exactly like the logged-in games. This is the anti-cheat
  guarantee — a guest can never fabricate a reward.
* **Two phases — play now, materialise on claim.** A play stores a
  `GuestPendingReward` row (the *intent*). Nothing touches a real member, wallet,
  or token balance until `claim`, because the member does not exist yet.
* **Logic is mirrored, not shared.** The logged-in game views (`OneSpin`,
  `_play_smashes`, `OneKick`/`RedeemAllKicks`) are coupled to a logged-in member
  (they charge tokens and materialise rewards immediately), so they can't be
  called for a guest. Guest mode reuses each game's **data** (the `*Sequence` and
  `*Item` tables, goalkeeper probability, `get_random_withdraw()`, promo codes)
  and re-implements only the thin glue. The per-game reward rules
  (`item_type` → `reward_type`, token reason codes, `category` codes, the
  `WinningList` rule) are copied field-for-field into `GAME_CONFIG` in
  `apps/guest/games.py`. *Caveat: if a logged-in game changes its reward rules,
  this mirror must be updated to match.*

### Per-endpoint notes

* `start` and `play` are **public** (no token). `claim` requires a **member JWT**.
* The client must keep the `guest_token` (the session UUID) from `start` and send
  it back on every `play` and on `claim`. It is the only link between the
  anonymous play and the account — if it is lost (cleared storage / different
  device), the winnings cannot be claimed.
* **Each game can be played only once per guest session** (one spin, one kick,
  one smash, one check-in). A repeat `play` of the same `gametype` returns `400`.
  A missed penalty still uses up the attempt; a setup error (game closed / no
  sequence configured) does **not** consume the attempt.
* **The outcome is the first configured item** of the game's sequence (ordered by
  `item_order`). Because each game is played once, there is no sequence-walking —
  every guest gets the same prize for a given game. Penalty adds a random
  goal/miss roll; check-in pays a random amount in the configured range
  (see [Outcome details](#outcome-details)).
* `claim` only succeeds for a **newly registered member** (account created within
  the claim window, default 24h) and **once per member**.
* Cash prizes are only credited to the wallet **at claim time** (they need the
  station the guest does not have yet); the pending row holds the intent and the
  amount, which is locked at play time.

---

## Data model

`apps/guest/models.py`

### `GuestSession`

One anonymous play session. Its `uuid` is the guest token the client holds.

| Field | Type | Notes |
| :--- | :--- | :--- |
| `uuid` | UUID | The `guest_token`. Primary handle for play/claim. |
| `lucky_played` | bool | One-play guard for Lucky Spin. |
| `penalty_played` | bool | One-play guard for Penalty Kick. |
| `smash_played` | bool | One-play guard for Smash Egg. |
| `checkin_played` | bool | One-play guard for Check-In. |
| `claimed` | bool | True once materialised onto a member. |
| `claimed_member` | FK → `Member` | Who claimed it (`SET_NULL`). |
| `created` | datetime | Session start. |

### `GuestPendingReward`

One row per reward a guest won. Materialised into the member on claim.

| Field | Type | Notes |
| :--- | :--- | :--- |
| `session` | FK → `GuestSession` | `related_name="rewards"`, cascade. |
| `gametype` | int | See [Game Type](#game-type-gametype). |
| `reward_type` | int | See [Reward Type](#reward-type-reward_type). |
| `amount` | Decimal/null | Cash or token amount, locked at play time. |
| `reward_name` | str | Display name of the prize. |
| `source_item_id` | int/null | PK of the source game item (plain int, no cross-app FK). |
| `created` | datetime | |

---

## Choices

### Game Type (`gametype`)

| ID | Game | One action = |
| ---: | :--- | :--- |
| 1 | LUCKY SPIN | one spin |
| 2 | PENALTY KICK | one kick (may miss → no reward) |
| 3 | SMASH EGG | one smash |
| 4 | CHECK IN | day-1 token reward, once per session |

**World Cup is intentionally not a guest game** — it is a prediction game tied to
scheduled matches that resolve asynchronously, so it does not fit play-now /
claim-later. Penalty kick is normally coupled to World Cup (it requires choosing a
country and one prize type awards WC score); in guest mode that coupling is
stripped: no country is required, and a WC-score outcome yields **no claimable
reward** (the kick still counts as a goal for the animation).

Each game numbers its own `item_type` differently, so guest mode maps each onto a
common `reward_type`:

| Game | item_type 1 | item_type 2 | item_type 3 | item_type 4 |
| :--- | :--- | :--- | :--- | :--- |
| Lucky Spin | cash | item | token | — |
| Penalty Kick | cash | token | item | WC score → skipped |
| Smash Egg | cash | token | item | — |

### Reward Type (`reward_type`)

Mirrors `LuckySpinItem.item_type`.

| ID | Reward Type | Materialised on claim as |
| ---: | :--- | :--- |
| 1 | CASH | `give_player_credit` (prod) + `MemberReward` (category 2) + `MemberCredit` |
| 2 | ITEM | `MemberReward` (category 1) + `WinningList` (lucky spin only) |
| 3 | TOKEN | `MemberToken` (type 1) |

Per-game token reason codes (set on the `MemberToken` created at claim) mirror the
logged-in games: **Lucky Spin 2, Penalty Kick 10, Smash Egg 14, Check-In 1**.

---

## Summary

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| POST | `/guest/start/` | Public | Create a guest session, return `guest_token` |
| POST | `/guest/play/` | Public | Play one round of a game (once per game); server stores the reward |
| POST | `/guest/claim/` | Member JWT | Move all pending rewards onto the new member |

---

# POST /guest/start/

Creates a new anonymous session. Call this once when guest mode begins.

Request body: *(none)*

Response `201 Created`

```json
{
  "guest_token": "0f4e2c8a-7b1d-4a6e-9c3f-2a5b8d1e6f90"
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| guest_token | UUID | The session id. Store it; send it on every `play` and on `claim`. |

---

# POST /guest/play/

Plays a single round. The server picks the outcome and saves one pending reward
to the session, then returns that reward so the frontend can play the animation.
Each `gametype` may be played **once** per session.

Request body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| guest_token | UUID | Yes | The session id from `start` |
| gametype | Int | Yes | Which game to play (see Game Type) |

```json
{
  "guest_token": "0f4e2c8a-7b1d-4a6e-9c3f-2a5b8d1e6f90",
  "gametype": 1
}
```

Response `200 OK`

```json
{
  "reward_type": 3,
  "reward_name": "Token Reward",
  "amount": 50
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| reward_type | Int/null | See Reward Type. `null` when nothing was won (penalty miss, or a skipped WC-score item). |
| reward_name | String/null | Display name of the prize won. |
| amount | Number/null | Tokens (type 3) or cash (type 1). `null` for an item (type 2) or no win. |
| result | Int | **Penalty kick only** — 1 = goal, 2 = miss. |

Penalty miss example:

```json
{ "reward_type": null, "reward_name": null, "amount": null, "result": 2 }
```

Errors `400 Bad Request`

| `details` | Cause |
| :--- | :--- |
| `gametype is required` | Missing/non-integer `gametype` |
| `Invalid or already claimed guest session` | Unknown/malformed token, or session already claimed |
| `Unsupported gametype` | `gametype` not in 1–4 |
| `This game has already been played` | That `gametype` was already played in this session |
| `No spin items configured` / `No kick sequence configured` / `No smash sequences found` | That game has no sequence set up |
| `Game is closed` / `Game is under maintenance` | Penalty/smash game status |
| `Check-in not set up` | No day-1 `CheckInReward` configured |

---

# POST /guest/claim/

Moves every pending reward from the session onto the **authenticated** member,
then marks the session claimed. Call this right after the guest registers / logs
in.

Headers: `Authorization: Bearer <member access token>`

Request body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| guest_token | UUID | Yes | The session id to claim |

```json
{
  "guest_token": "0f4e2c8a-7b1d-4a6e-9c3f-2a5b8d1e6f90"
}
```

Response `204 No Content` — rewards materialised (tokens credited, cash sent to
wallet in production, items recorded).

Errors

| Status | `details` | Cause |
| :--- | :--- | :--- |
| 401 | *(auth error)* | No / invalid member token |
| 400 | `Not a member account` | Token belongs to a non-member user |
| 400 | `Guest rewards can only be claimed by a new member` | Account older than the claim window (default 24h) |
| 400 | `Guest rewards already claimed` | This member already claimed a session |
| 400 | `Invalid or already claimed guest session` | Unknown token, or session already claimed |

---

## Outcome details

How `play()` decides each game's result (`apps/guest/games.py`). In all cases the
prize item is the **first** entry of the game's sequence (ordered by `item_order`).

| Game | Win logic | Amount |
| :--- | :--- | :--- |
| Lucky Spin | Always returns the first `SpinSequence` item. | cash via `get_random_withdraw()`, or `token_amount`. |
| Penalty Kick | Random goal/miss: `random() < probability/100` for the configured goalkeeper difficulty. On a goal, returns the first `KickSequence` item. | as above; miss → no reward. |
| Smash Egg | Always returns the first `SmashSequence` item. | as above. |
| Check-In | Always pays a token from the **day-1** `CheckInReward`. | `randint(reward_minimum, reward_maximum)`. |

To make penalty and check-in fully identical for every guest, configure them in
settings: set the goalkeeper probability to `100%` (always score) and set
`reward_minimum == reward_maximum` (fixed check-in amount).

---

# Flow

```
┌─────────┐                          ┌─────────┐                    ┌──────────────┐
│ Browser │                          │  Guest  │                    │ Wallet/Login │
│ (guest) │                          │   API   │                    │  + Member    │
└────┬────┘                          └────┬────┘                    └──────┬───────┘
     │  POST /guest/start/                │                                │
     │───────────────────────────────────>│  create GuestSession          │
     │  { guest_token }  <─────────────────│                               │
     │  (store guest_token locally)        │                                │
     │                                     │                                │
     │  POST /guest/play/ {guest_token,    │                                │
     │       gametype:1}                   │  server runs game logic,       │
     │───────────────────────────────────>│  saves GuestPendingReward      │
     │  { reward_type, name, amount } <────│  (once per game)               │
     │                                     │                                │
     │  user decides to keep winnings → register / log in on the wallet     │
     │────────────────────────────────────────────────────────────────────>│
     │  access/refresh JWT (+ new Member created)  <────────────────────────│
     │                                     │                                │
     │  POST /guest/claim/ {guest_token}   │                                │
     │  Authorization: Bearer <access>     │  verify member is new + unclaimed
     │───────────────────────────────────>│  loop rewards → MemberToken /  │
     │                                     │  MemberReward / give_player_credit
     │  204 No Content  <──────────────────│  mark session claimed          │
     └─                                    └─                               ─┘
```

Step by step:

1. **Start** — frontend calls `/guest/start/`, stores `guest_token`.
2. **Play** — each game calls `/guest/play/` with `guest_token` + `gametype`
   (once per game). The server computes the result and appends a
   `GuestPendingReward` to the session.
3. **Register / log in** — the user goes through the normal wallet login
   (`/login/generate-token/`), which creates the real `Member` and returns the
   member JWT. *(Guest mode does not change this step.)*
4. **Claim** — frontend calls `/guest/claim/` with `guest_token` and the member
   JWT. The server checks the member is newly registered and has not claimed
   before, materialises every pending reward onto the member, and locks the
   session.

---

## Security & anti-abuse

* **Server-authoritative outcomes** — the client sends only `gametype`, never a
  result. Rewards cannot be fabricated.
* **Bounded rewards** — one play per game per session caps a session at **4
  rewards** (one per game). Combined with **one claim per member**, a new account
  can never farm an unbounded pile.
* **New-member-only claim** — claiming requires a member whose account was created
  within the 24h `CLAIM_WINDOW` (`apps/guest/views.py`), and each member may claim
  **once**.
* **Concurrency** — `play` and `claim` take a `select_for_update` lock on the
  `GuestSession` (with `claimed=False`) inside a transaction.
* **Known residual** — `/guest/start/` itself is not throttled, so a script can
  create many sessions. This does **not** grant free rewards: each session still
  needs its own new member account to claim, so the limit is account creation, not
  rewards. Add DRF throttling if session spam becomes a concern.

### Why the token must be carried by the client

The wallet login knows nothing about the guest session — the only thing tying the
anonymous play to the new account is the `guest_token` the browser holds. There is
no identity verification beyond possession of that token, which is why claiming is
restricted to **new members, once**, within a short window. (The `RegisterWebhook`
can later be used to make the "new member" check server-confirmed rather than
time-based.)

---

## Tests

`apps/guest/tests/test_apis.py` (11 tests). Run with the module path:

```
python manage.py test apps.guest.tests.test_apis
```

Covers: session start, public play (no auth), bad/missing input, one-play-per-game
rejection, claim materialisation (token + cash), auth requirement, the
new-member/old-member gate, once-per-member claim, penalty goal + claim, smash
token mapping, and check-in.
