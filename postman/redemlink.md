# REDEMPTION — REDEEM LINKS

A shareable link that grants a fixed reward (Tokens, Battle Points or Free Credit) to a
limited number of members. The admin creates the reward and the quota once; members who
open the link before the quota or the date window runs out receive the reward
automatically. The reward comes from MRS, not from the third-party system.

This is **not** the Redemption Mart (`RedemptionItem`), where a member spends tokens they
already own to buy from a catalogue. Here the member spends nothing — the link itself is
the grant.

Notes that apply to every endpoint:

* Links are addressed by **`uuid`**, never by `id`. The link is meant to be broadcast, so
  the integer PK must never appear in a shared URL — it would let anyone reach the next
  campaign by incrementing a number.
* **Quota counts people, not redemptions.** `quantity: 10` means ten *different* members
  can each claim once. A member who claims twice is rejected and the slot count does not
  move. Enforced by a DB unique constraint on `(link, member)`.
* The redeem endpoint runs inside a transaction with a row lock on the link, so
  simultaneous clicks cannot oversell the quota. Verified with 12 parallel redeems against
  a `quantity: 5` link — exactly 5 succeeded.
* Admin endpoints require JWT authentication (`IsAuthenticated`). `info/` is public
  (`AllowAny`) so the landing page can render before anyone has logged in.
* **Archived links are excluded from everywhere** — list, retrieve, history, public info
  and redeem all treat them as non-existent.
* Errors use the project envelope `{"error": …, "details": …}` and return **400**,
  including "does not exist". A malformed UUID in the path returns **404** (rejected by
  the URL converter before the view runs).
* The admin list is paginated (`page` / `page_size`).

---

## Summary

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| GET | `/redemption/redeem-links/` | Admin | List active links |
| POST | `/redemption/redeem-links/` | Admin | Create a link |
| GET | `/redemption/redeem-links/{uuid}/` | Admin | Retrieve one link |
| PUT | `/redemption/redeem-links/{uuid}/` | Admin | Edit a link (full replace) |
| PATCH | `/redemption/redeem-links/{uuid}/archive/` | Admin | Archive a link |
| GET | `/redemption/redeem-links/{uuid}/history/` | Admin | Who redeemed this link |
| GET | `/redemption/redeem-link/{uuid}/info/` | **Public** | Landing-page data for the shared link |
| POST | `/redemption/{member_uuid}/redeem-link/{uuid}/redeem/` | Member | Claim the reward |

---

## Choices

`station` — `apps/redemption/choices.py` → `STATION_CHOICES`

| Value | Label |
| :--- | :--- |
| 1 | N1GANG |
| 2 | KGAME99 |
| 3 | EP369 |
| 4 | ACEBET77 |
| 5 | UBETCLUB |
| 6 | LV918 |

`reward_type` — `apps/redemption/choices.py` → `REDEEM_LINK_REWARD_CHOICES`

| Value | Label | What is written on redeem |
| :--- | :--- | :--- |
| 1 | TOKEN | `MemberToken` — `type=1` (EARN), `reason_type=18` |
| 2 | BATTLE POINT | `MemberBattlePoint` via `credit_battle_points` — `type=1`, `reason_type=6` |
| 3 | FREE CREDIT | `MemberReward` (`category=2`), plus `give_player_credit` + `MemberCredit` **in production only** |

Requests send the **integer**; responses return the **label**.

New reason codes added for this feature: `18 REDEEM-LINK` in
`apps/members/choices.py` → `REASON_TYPE_CHOICE`, and `6 REDEEM-LINK` in
`apps/avatar/choices.py` → `BP_REASON_TYPE_CHOICE`. Both carry
`reason_uuid = <redeem link uuid>` so a ledger row can be traced back to its campaign.

---

## POST /redemption/redeem-links/

Request body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| name | Str | Yes | Campaign name. Shown to the member on the landing page |
| station | Int | Yes | See choices. Used as the redirect target for logged-out visitors — **not** an eligibility rule |
| station\_url | URL | Yes | Where to send a logged-out visitor. **Must include the scheme** — `https://n1gang.net/`, not `n1gang.net` |
| reward\_type | Int | Yes | See choices |
| amount | Int | Yes | Reward given per member. Minimum 1 |
| quantity | Int | Yes | How many **people** may claim. Minimum 1 |
| start\_date | Date | Yes | `YYYY-MM-DD`. Inclusive |
| end\_date | Date | Yes | `YYYY-MM-DD`. Inclusive. Must be ≥ `start_date` |

```json
{
  "name": "Merdeka BP Giveaway",
  "station": 1,
  "station_url": "https://n1gang.net/",
  "reward_type": 2,
  "amount": 10,
  "quantity": 10,
  "start_date": "2026-08-12",
  "end_date": "2026-08-19"
}
```

Response — **201**, the object shape below.

Error — **400**

```json
{ "error": "Data submitted is invalid",
  "details": { "end_date": ["End date cannot be earlier than start date."] } }
```

Also 400 for a `station_url` without a scheme, `amount`/`quantity` below 1, and a
`station` or `reward_type` outside the choice list.

---

## GET /redemption/redeem-links/ &nbsp;·&nbsp; GET /redemption/redeem-links/{uuid}/

Query parameters (list only)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| page | Int | No | Page number (default 1) |
| page\_size | Int | No | Items per page (default 20, max 100) |

Paginated envelope

```json
{ "count": 3, "next": "https://…/redemption/redeem-links/?page=2", "previous": null, "results": [ … ] }
```

Response fields

| Field | Type | Description |
| :--- | :--- | :--- |
| id | Int | Internal only. Never put this in a shared link |
| uuid | UUID | Use this in the shareable link and for every other call |
| name | Str | |
| station | Str | Label, e.g. `"N1GANG"` |
| station\_url | Str | |
| reward\_type | Str | Label, e.g. `"BATTLE POINT"` |
| amount | Int | Reward per member |
| quantity | Int | Configured headcount cap |
| redeemed\_count | Int | Distinct members who have claimed |
| remaining | Int | `quantity - redeemed_count`, floored at 0 |
| start\_date | Date | |
| end\_date | Date | |
| unavailable\_reason | Str | `null` when claimable, otherwise why not — see the table below |

```json
{
  "id": 4,
  "uuid": "9f2c1e4a-6b3d-4c8e-a1f0-77d2b91c5e40",
  "name": "Merdeka BP Giveaway",
  "station": "N1GANG",
  "station_url": "https://n1gang.net/",
  "reward_type": "BATTLE POINT",
  "amount": 10,
  "quantity": 10,
  "redeemed_count": 4,
  "remaining": 6,
  "start_date": "2026-08-12",
  "end_date": "2026-08-19",
  "unavailable_reason": null
}
```

`unavailable_reason` values, checked in this order:

| Value | Condition |
| :--- | :--- |
| `"Redeem link is no longer available"` | Archived |
| `"Redeem link has not started yet"` | `today < start_date` |
| `"Redeem link has expired"` | `today > end_date` |
| `"Redeem link quota is full"` | `remaining <= 0` |
| `null` | Claimable |

Archived links never appear here.

---

## PUT /redemption/redeem-links/{uuid}/

Full replace — send every field, same body as create. There is no PATCH.

Response — **200**, the object shape above.

Quantity may be raised or lowered freely, including **below** `redeemed_count`. Lowering it
does not affect anyone already paid; `remaining` simply floors at 0 and the link reads as
`"Redeem link quota is full"`, so no new member can claim.

To stop a live campaign early, set `end_date` to yesterday — reversible, unlike archive.

Error — **400** if the uuid does not exist or is archived, or on any validation failure.

---

## PATCH /redemption/redeem-links/{uuid}/archive/

No body. Soft delete — the link disappears from every endpoint immediately, including its
own history report.

Response — **200**, the archived object.

Error — **400**

```json
{ "error": "Invalid request", "details": "Redeem Link: 9f2c… is already archived" }
```

---

## GET /redemption/redeem-links/{uuid}/history/

The per-link report: which members claimed, and when. Paginated, newest first. Returns
**only** the redeemers — the link's own counters come from list/retrieve.

Response fields (each item in `results`)

| Field | Type | Description |
| :--- | :--- | :--- |
| id | Int | |
| uuid | UUID | The history row |
| member\_id | Int | MRS `Member.id` — not the third-party user ID |
| member\_uuid | UUID | |
| full\_name | Str | `null` if the member has no name |
| phone\_number | Str | `null` if not set |
| created | DateTime | When they claimed |

```json
{
  "count": 4,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 12,
      "uuid": "3b7e…",
      "member_id": 4021,
      "member_uuid": "c81a…",
      "full_name": "Ahmad bin Ali",
      "phone_number": "60123456789",
      "created": "2026-08-12T14:33:07+08:00"
    }
  ]
}
```

Error — **400** if the uuid does not exist or is archived.

---

## GET /redemption/redeem-link/{uuid}/info/ — public

What the shared link's landing page calls. **No authentication.**

Deliberately exposes nothing but what the page needs: no `id`, no `quantity`, no stock
level, no availability flag, no redeemer list. A link that is expired or full still renders
as a normal page — the member finds out by attempting the redeem and reading the error.

Response fields

| Field | Type | Description |
| :--- | :--- | :--- |
| uuid | UUID | Post this back to the redeem endpoint |
| name | Str | |
| station | Str | Label |
| station\_url | Str | Where to send a logged-out visitor for login |
| reward\_type | Str | Label |
| amount | Int | |
| start\_date | Date | |
| end\_date | Date | |

```json
{
  "uuid": "9f2c1e4a-6b3d-4c8e-a1f0-77d2b91c5e40",
  "name": "Merdeka BP Giveaway",
  "station": "N1GANG",
  "station_url": "https://n1gang.net/",
  "reward_type": "BATTLE POINT",
  "amount": 10,
  "start_date": "2026-08-12",
  "end_date": "2026-08-19"
}
```

Error — **400** if the uuid does not exist or is archived. **404** if the path segment is
not a valid UUID.

---

## POST /redemption/{member_uuid}/redeem-link/{uuid}/redeem/

Claims the reward. **Empty body** — both identifiers are in the path, following the same
pattern as `/member/{uuid}/one-spin/`.

Path parameters

| Field | Type | Description |
| :--- | :--- | :--- |
| member\_uuid | UUID | The claiming member |
| uuid | UUID | The redeem link |

Requires a JWT (`IsAuthenticated`). Note that the token proves *someone* is logged in,
while the member acted on is whoever's uuid is in the path — identical to how
`one-spin`, `ten-spin` and `kick/redeem-all` already behave.

Response — **200**, the same shape as `info/`.

Error — **400**, `{"error": "Invalid request", "details": "<one of>"}`

| `details` | Condition |
| :--- | :--- |
| `Redeem link has not started yet` | Before `start_date` |
| `Redeem link has expired` | After `end_date` |
| `Redeem link quota is full` | Headcount reached |
| `Redeem link is no longer available` | Archived |
| `You have already redeemed this link` | One claim per member |
| `Member is not linked to a station` | Free Credit only — no `MemberThirdPartyData` for the member's `last_system` |
| `No promotion code configured for this station` | Free Credit only — no `PromotionCode` row for this link + station |
| `Member UUID: … does not exist` | Unknown `member_uuid` |
| `Redeem Link: … does not exist` | Unknown or archived link |

Both Free Credit failures are checked **before** anything is written, so a misconfigured
link can never burn a quota slot.

---

## Free Credit setup

Free Credit links need a `PromotionCode` row per station, created after the link exists:

| Field | Value |
| :--- | :--- |
| promotion\_code | The third-party promotion ID |
| station | `members.Station` FK — matched against the member's `last_system` at redeem time |
| redeem\_link | FK to the `RedeemLink` |

A partial unique constraint (`unique_station_redeem_link`) allows one promotion code per
`(station, link)`. Without a matching row the redeem fails with
`"No promotion code configured for this station"`.

The third-party call only fires when `ENVIRONMENT == "production"`. On staging the
`MemberReward` row is still written but no credit leaves MRS and no `MemberCredit` row is
created — same behaviour as lucky spin.

---

## Building the shareable link

The API returns `uuid` and `station_url`; the frontend assembles the link:

```
https://member.kinggroup44.com/?o=<station_url>&reward=<uuid>
```

`o=` is the same station parameter `GenerateToken` already consumes. A logged-out visitor
is bounced to `station_url` for login and returns to claim.
