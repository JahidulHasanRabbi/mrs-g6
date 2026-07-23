# MRS – G6: Leaderboard Token & Promotion API Changes

Documents the API changes from this work. Two areas changed, plus one background
task (no HTTP endpoint).

- **Auth:** every endpoint below requires `Authorization: Bearer <access_token>`.
- **Success body:** the response body is the data itself (no `{"data": ...}` wrapper). `200` for GET/PUT/PATCH, `201` for POST create.
- **Error body:** `{ "error": "<message>", "details": <detail> }` with status `400`.

---

## 1. Leaderboard Reward Items — new `token_amount` field

A new field **`token_amount`** (integer, nullable) was added to the deposit,
referral, and withdraw reward-item endpoints. It holds how many tokens to award
when **`item_type = 3` (TOKEN)** — the field that was previously missing from the
"Add Reward" form.

`item_type` values: `1 = FREE CREDIT`, `2 = ITEM`, `3 = TOKEN`, `4 = OTHER` (default).
`credit_amount` is used when `item_type = 1`; `token_amount` is used when `item_type = 3`.

The three boards share the exact same shape. Base prefix: `/leaderboard/`.

| Board | Base path |
|-------|-----------|
| Deposit | `/leaderboard/deposit-reward-items/` |
| Referral | `/leaderboard/referral-reward-items/` |
| Withdraw | `/leaderboard/withdraw-reward-items/` |

### Endpoints (each board)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/leaderboard/{board}-reward-items/` | List active reward items (paginated) |
| GET | `/leaderboard/{board}-reward-items/{uuid}/` | Retrieve one |
| POST | `/leaderboard/{board}-reward-items/` | Create |
| PUT | `/leaderboard/{board}-reward-items/{uuid}/` | Update (partial — all fields optional) |
| PATCH | `/leaderboard/{board}-reward-items/{uuid}/archive/` | Archive (soft delete) |

### POST / PUT request body

```json
{
  "reward_name": "50 Tokens",   // required (string)
  "quantity": 1,                 // required (integer)
  "position": 1,                 // optional (integer, unique among active items; may be null)
  "item_type": 3,                // optional (integer, default 4)
  "credit_amount": null,         // optional (decimal) — used when item_type = 1
  "token_amount": 50,            // optional (integer) — used when item_type = 3   <-- NEW
  "image": null                  // optional (image upload)
}
```

> PUT is applied partially, so on update every field is optional; send only what changes.

### Response body (GET item / POST / PUT)

```json
{
  "id": 1,
  "uuid": "58d27746-01eb-42d1-9b2d-a43d43274e34",
  "reward_name": "50 Tokens",
  "position": 1,
  "quantity": 1,
  "item_type": 3,
  "credit_amount": null,
  "token_amount": 50,            //  <-- NEW
  "image": null
}
```

GET list returns the paginated wrapper with these objects in `results`.

---

## 2. Settings — Promotions (3 new leaderboard types)

Three new promotion types were added so leaderboard reward items can be mapped to a
third-party promotion code per station. Base prefix: `/settings/`.

New `promotion_type` values:

| Value | Label | Maps to reward item |
|-------|-------|---------------------|
| 9 | Deposit Leaderboard Bonus | `deposit-reward-items` |
| 10 | Referral Leaderboard Bonus | `referral-reward-items` |
| 11 | Withdraw Leaderboard Bonus | `withdraw-reward-items` |

(Existing 1–8 unchanged: 1 Monthly VIP, 2 Upgrade VIP, 3 Birthday Bonus,
4 Lucky Spin Item, 5 Redemption Item, 6 Penalty Kick Bonus, 7 Manual Bonus,
8 Smash Egg Bonus.)

### GET `/settings/available-promotions/`

Returns the selectable promotion types — now including 9/10/11.

```json
[
  { "value": 1,  "label": "Monthly VIP" },
  { "value": 2,  "label": "Upgrade VIP" },
  { "value": 3,  "label": "Birthday Bonus" },
  { "value": 4,  "label": "Lucky Spin Item" },
  { "value": 5,  "label": "Redemption Item" },
  { "value": 6,  "label": "Penalty Kick Bonus" },
  { "value": 7,  "label": "Manual Bonus" },
  { "value": 8,  "label": "Smash Egg Bonus" },
  { "value": 9,  "label": "Deposit Leaderboard Bonus" },   // NEW
  { "value": 10, "label": "Referral Leaderboard Bonus" },  // NEW
  { "value": 11, "label": "Withdraw Leaderboard Bonus" }   // NEW
]
```

### GET `/settings/promotions/get-by-station/{station_id}/`

Returns the station's promotions grouped by type. Three new groups were added:
`deposit_leaderboard`, `referral_leaderboard`, `withdraw_leaderboard`. For each, `item`
is the reward item's UUID.

```json
[
  { "type": "VIP Type",        "promotions": [ { "item": 1, "name": "Monthly VIP", "code": 123 } ] },
  { "type": "Lucky Spin",      "promotions": [ { "item": "<uuid>", "name": "…", "code": 123 } ] },
  { "type": "Redemption Item", "promotions": [ { "item": "<uuid>", "name": "…", "code": 123 } ] },
  { "type": "penalty_kick",    "promotions": [ { "item": "<uuid>", "name": "…", "code": 123 } ] },
  { "type": "smash_egg",       "promotions": [ { "item": "<uuid>", "name": "…", "code": 123 } ] },
  { "type": "deposit_leaderboard",  "promotions": [ { "item": "<reward_uuid>", "name": "…", "code": 123 } ] },  // NEW
  { "type": "referral_leaderboard", "promotions": [ { "item": "<reward_uuid>", "name": "…", "code": 123 } ] },  // NEW
  { "type": "withdraw_leaderboard", "promotions": [ { "item": "<reward_uuid>", "name": "…", "code": 123 } ] },  // NEW
  { "type": "manual_code",     "promotions": [ { "item": "<promo_uuid>", "name": "…", "code": 123 } ] }
]
```

### POST `/settings/promotions/`

Bulk-set a station's promotions. Now accepts `promotion_type` 9/10/11, where
`item_uuid` is the UUID of the matching leaderboard reward item.

> **Destructive:** this replaces the station's promotions — it deletes all existing
> `PromotionCode` rows for the station and recreates them from the payload.

Request:

```json
{
  "station_id": "<station_uuid>",
  "promotions": [
    { "promotion_type": 9,  "item_uuid": "<deposit_reward_uuid>",  "promotion_code": 12345 },
    { "promotion_type": 10, "item_uuid": "<referral_reward_uuid>", "promotion_code": 12346 },
    { "promotion_type": 11, "item_uuid": "<withdraw_reward_uuid>", "promotion_code": 12347 }
  ]
}
```

Per-item fields: `promotion_type` (required int), `promotion_code` (required int),
`item_uuid` (uuid — required for item-backed types incl. 9/10/11), `item_name`
(string — used by manual type 7 only).

Response (`201`):

```json
{ "status": "SUCCESS" }
```

---

## 3. Token payout — background task (no HTTP endpoint)

The monthly leaderboard payout now pays **TOKEN** rewards in addition to FREE CREDIT.

- Trigger: management command `run_leaderboard_payout_task` (run by external cron),
  which enqueues the Celery task `settle_all_leaderboard_payouts`. **Not** an HTTP endpoint.
- For a winning member whose rank maps to an `item_type = 3` reward, the payout writes
  a `MemberToken` (type `1 = EARN`, `reason_type = 17 = LEADERBOARD`) **directly to the
  member profile** — no third-party wallet call, no promotion code needed — plus a
  `MemberReward` history row (`reward_details` = `"<n> Tokens"`).
- FREE CREDIT (`item_type = 1`) payout is unchanged: routed through the third-party
  wallet using the mapped promotion code.

### Open item (not implemented)

The payout has **no idempotency guard**: if the task runs more than once for the same
month (manual re-run, cron double-fire, or a crash-and-restart mid-run), the same
winners are paid again — credit **and** tokens. It is safe for the normal once-a-month
run. Recommended follow-up: a `LeaderboardPayout(leaderboard_type, member, period_start)`
ledger with a unique constraint + a `get_or_create` skip check, so re-runs pay each
winner at most once.

---

## Files changed

**Leaderboard token field**
- `apps/leaderboard/models.py` — `token_amount` on Deposit / Referral / Withdraw reward items
- `apps/leaderboard/serializers_create.py` — accept `token_amount`
- `apps/leaderboard/serializers_get.py` — return `token_amount`
- `apps/leaderboard/migrations/0005_depositleaderboardrewarditem_token_amount_and_more.py`

**Settings promotion types**
- `apps/settings/choices.py` — `PROMOTION_TYPES` 9/10/11
- `apps/settings/viewsets.py` — create branches + `get_by_station` groups for 9/10/11

**Token payout**
- `apps/members/choices.py` — `REASON_TYPE_CHOICE` `(17, "LEADERBOARD")`
  (migration folded into `apps/members/migrations/0071_membertier_check_in_battle_point_and_more.py`)
- `apps/leaderboard/ranking.py` — include TOKEN reward items in payout; token payout branch

**Tests**
- `apps/leaderboard/tests/test_apis.py` — `LeaderboardTokenPayoutTest` (token credited to profile; zero-amount skipped)
