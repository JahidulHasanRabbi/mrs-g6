# Redeem Link API

All endpoints under `/redemption/`. Admin endpoints require `Authorization: Bearer <access_token>` (`IsAuthenticated`). The public info endpoint requires no auth.

## Choices

**`reward_type`**

| Value | Meaning |
|---|---|
| 1 | TOKEN |
| 2 | BATTLE POINT |
| 3 | FREE CREDIT |

**`recurrence`**

| Value | Meaning |
|---|---|
| 1 | ONE TIME |
| 2 | DAILY |
| 3 | WEEKLY |
| 4 | MONTHLY |

**`station`**

| Value | Meaning |
|---|---|
| 1 | N1GANG |
| 2 | KGAME99 |
| 3 | EP369 |
| 4 | ACEBET77 |
| 5 | UBETCLUB |
| 6 | LV918 |

---

## Admin — List Redeem Links

`GET /redemption/redeem-links/`

Response `200`:
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "uuid": "5de36029-7804-4e65-85a8-bb74c8d7a59d",
      "name": "Monday Token Giveaway",
      "station": "N1GANG",
      "station_url": "https://station.example.com",
      "reward_type": "TOKEN",
      "amount": 30,
      "quantity": 3,
      "redeemed_count": 1,
      "remaining": 2,
      "start_date": "2026-08-17T08:00:00+08:00",
      "end_date": "2026-08-24T07:59:59+08:00",
      "recurrence": "DAILY",
      "redeem_per_recurrence": false,
      "unavailable_reason": null
    }
  ]
}
```

`unavailable_reason` is `null` when the link is currently redeemable, otherwise one of: `"Redeem link is no longer available"` (archived), `"Redeem link has not started yet"`, `"Redeem link has expired"`, `"Redeem link quota is full"`.

---

## Admin — Get One Redeem Link

`GET /redemption/redeem-links/{uuid}/`

Response `200`: same object shape as one item in the list above.

---

## Admin — Create Redeem Link

`POST /redemption/redeem-links/`

Request body:
```json
{
  "name": "Monday Token Giveaway",
  "station": 1,
  "station_url": "https://station.example.com",
  "reward_type": 1,
  "amount": 30,
  "quantity": 3,
  "start_date": "2026-08-17T00:00:00Z",
  "end_date": "2026-08-24T23:59:59Z",
  "recurrence": 2,
  "redeem_per_recurrence": false
}
```

| Field | Required | Notes |
|---|---|---|
| `name` | yes | |
| `station` | yes | see Station choices |
| `station_url` | yes | must be a valid URL |
| `reward_type` | yes | see reward_type choices |
| `amount` | yes | integer, min 1 — amount given per redemption |
| `quantity` | yes | integer, min 1 — quota per period (or for the whole campaign if `recurrence=1`) |
| `start_date` | yes | ISO 8601 datetime |
| `end_date` | yes | ISO 8601 datetime, must not be earlier than `start_date` |
| `recurrence` | no (default `1`) | see recurrence choices |
| `redeem_per_recurrence` | no (default `false`) | admin-only flag — if `true`, a member may redeem again each time the period resets instead of only once for the whole campaign |

Response `201`: same object shape as Get One.

If `reward_type=3` (FREE CREDIT), a matching `PromotionCode` (station + this link) must also be configured separately, otherwise redemption will fail at redeem time with `"No promotion code configured for this station"`.

---

## Admin — Update Redeem Link

`PUT /redemption/redeem-links/{uuid}/`

Request body: same fields as Create.

Response `200`: same object shape as Get One.

---

## Admin — Archive Redeem Link

`PATCH /redemption/redeem-links/{uuid}/archive/`

No request body.

Response `200`: same object shape as Get One, with `unavailable_reason` now `"Redeem link is no longer available"`.

---

## Admin — Redemption History

`GET /redemption/redeem-links/{uuid}/history/`

Optional query param: `?period_key=2026-08-17` — filters to redemptions made in that specific period (see period key format below).

Response `200`:
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 5,
      "uuid": "d924e4ae-5fe0-41c1-910c-987512987ae7",
      "member_id": 22,
      "member_uuid": "13639893-2393-49bd-8ad8-78a17c565d3d",
      "full_name": null,
      "phone_number": "60123456789",
      "period_key": "2026-08-17",
      "created": "2026-08-17T14:11:02.198899+08:00"
    }
  ]
}
```

**Period key format:** `"lifetime"` for `recurrence=1` (one time), `YYYY-MM-DD` for Daily, `YYYY-Www` (ISO week) for Weekly, `YYYY-MM` for Monthly.

---

## Admin — Redemption History Summary

`GET /redemption/redeem-links/{uuid}/history-summary/`

No request body.

Response `200`:
```json
{
  "recurrence": "DAILY",
  "quantity_per_period": 2,
  "current_period_key": "2026-08-17",
  "breakdown": [
    { "period_key": "2026-08-15", "redeemed_count": 1, "remaining": 1 },
    { "period_key": "2026-08-16", "redeemed_count": 1, "remaining": 1 },
    { "period_key": "2026-08-17", "redeemed_count": 2, "remaining": 0 }
  ]
}
```

---

## Admin — KPI Dashboard

`GET /redemption/dashboard/kpi/`

Optional query params: `?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD` (both required together — omit both for all-time totals).

Response `200`:
```json
{
  "total_tokens_given": 60,
  "total_battle_points_given": 300,
  "total_credit_given": 0,
  "total_redemptions": 3,
  "unique_users_redeemed": 3,
  "active_links": 2
}
```

---

## Public — Get Link Info

`GET /redemption/redeem-link/{uuid}/info/`

No auth required. No request body.

Response `200`:
```json
{
  "uuid": "5de36029-7804-4e65-85a8-bb74c8d7a59d",
  "name": "Monday Token Giveaway",
  "station": "N1GANG",
  "station_url": "https://station.example.com",
  "reward_type": "TOKEN",
  "amount": 30,
  "start_date": "2026-08-17T08:00:00+08:00",
  "end_date": "2026-08-24T07:59:59+08:00"
}
```

---

## Member — Redeem

`POST /redemption/{member_uuid}/redeem-link/{uuid}/redeem/`

Requires auth (member's own token). No request body.

Response `200` (success): same shape as Public — Get Link Info.

Response `400` (failure), `details` is one of:
- `"Redeem link is no longer available"` — archived
- `"Redeem link has not started yet"`
- `"Redeem link has expired"`
- `"Redeem link quota is full"`
- `"You have already redeemed this link"`
- `"Member is not linked to a station"` — FREE CREDIT only, member has no `MemberThirdPartyData` for their station
- `"No promotion code configured for this station"` — FREE CREDIT only, admin hasn't set up a `PromotionCode` for this link+station
- `"Redeem Link: {uuid} does not exist"` — invalid uuid (returned as 400, not 404, per this project's convention)
