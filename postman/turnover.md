# Turnover Leaderboard API

Base path: `/leaderboard/`

Choices used below:

**item_type**
| Value | Label |
|---|---|
| 1 | FREE CREDIT |
| 2 | ITEM |
| 3 | TOKEN |
| 4 | OTHER |

(Only `1` FREE CREDIT and `3` TOKEN are actually paid out automatically. `2` and `4` are display-only.)

**TurnoverPayoutLog.status**
| Value | Label |
|---|---|
| 1 | PAID |
| 2 | SKIPPED - FAKE RANK |
| 3 | FAILED |

---

## Public / Member APIs

### GET `/leaderboard/public/status/`
Returns maintenance flags for all boards, including Turnover.

**Response**
```json
{
  "is_open": false,
  "is_turnover_open": true
}
```

---

### GET `/leaderboard/public/turnover-ranking/`
Top 20 ranking, combining real members and fake/seeded entries in one sorted list.

**Response**
```json
[
  {
    "rank": 1,
    "display_name": "J**********n",
    "amount": "12500.00",
    "count": 34
  }
]
```
- `display_name`: masked name (fake entries look identical to real ones — not distinguishable by the frontend, by design).
- `amount`: total turnover (bet amount) in the campaign window.
- `count`: number of bet-total records summed for that member (`0` for fake entries).

---

### GET `/leaderboard/turnover/member-rank/<uuid>/`
A member's own rank against the combined (real + fake) ranking.

**Response**
```json
{
  "uuid": "8b11935d-2106-476d-aaaf-b9997d2064da",
  "rank": 18,
  "amount": "3200.00",
  "upgrade_rank_amount": "150.00"
}
```
- `rank`: `null` if the member has no turnover in the campaign window.
- `upgrade_rank_amount`: extra turnover needed to reach the next rank up. If already rank 1, or `rank` is `null`, this is `null`. If outside the top 20, the target is rank 20 instead of rank 1 above.

---

## Admin APIs

### GET `/leaderboard/turnover/admin-ranking/`
Full ranking of real members only (no fake entries), paginated.

**Response**
```json
{
  "count": 42,
  "next": "http://.../leaderboard/turnover/admin-ranking/?page=2",
  "previous": null,
  "results": [
    {
      "rank": 1,
      "member_id": 102,
      "full_name": "John Tan",
      "amount": "12500.00",
      "count": 34
    }
  ]
}
```
- `full_name`: real name, falls back to phone number, then `"Unknown"`.
- Ranking here is independent from the public ranking's rank numbers (fakes are excluded, so numbers shift).

---

### GET / PUT `/leaderboard/status/`
Shared maintenance toggle for all boards.

**GET response**
```json
{
  "is_open": false,
  "is_turnover_open": true
}
```

**PUT request** (send only the field(s) you want to change)
```json
{
  "is_turnover_open": false
}
```

**PUT response:** same shape as GET.

---

### GET / PUT `/leaderboard/turnover/payout-schedule/`
Sets the exact date/time to automatically run Turnover payout settlement.

**GET response**
```json
{
  "payout_at": "2026-09-18T00:00:00+08:00"
}
```

**PUT request**
```json
{
  "payout_at": "2026-09-18T00:00:00+08:00"
}
```
- Send `"payout_at": null` to cancel any scheduled settlement.
- Setting a new value replaces any previously scheduled time.

**PUT response:** same shape as GET.

---

### POST `/leaderboard/turnover/settle-payouts/`
Manually triggers payout settlement immediately (in addition to the scheduled auto-run). Safe to call more than once — already-paid ranks are skipped.

**Response**
```json
{
  "credited": 3
}
```
- `credited`: number of real members newly paid in this run.

---

### Turnover Reward Items — `/leaderboard/turnover-reward-items/`

| Method | Path | Purpose |
|---|---|---|
| GET | `/leaderboard/turnover-reward-items/` | List (paginated) |
| POST | `/leaderboard/turnover-reward-items/` | Create |
| PUT | `/leaderboard/turnover-reward-items/<uuid>/` | Update |
| PATCH | `/leaderboard/turnover-reward-items/<uuid>/archive/` | Archive (soft delete) |

**Request body** (POST / PUT)
```json
{
  "reward_name": "Rank 1 Prize",
  "position": 1,
  "quantity": 1,
  "item_type": 3,
  "credit_amount": null,
  "token_amount": 500,
  "image": null
}
```
- `position`: the rank this reward is paid to. Must be unique among active reward items.
- `credit_amount`: required for `item_type` = 1 (FREE CREDIT), otherwise `null`.
- `token_amount`: required for `item_type` = 3 (TOKEN), otherwise `null`.

**Response** (single item)
```json
{
  "id": 1,
  "uuid": "ed5f1508-4399-47a8-b3de-f3019872bb80",
  "reward_name": "Rank 1 Prize",
  "position": 1,
  "quantity": 1,
  "item_type": 3,
  "credit_amount": null,
  "token_amount": 500,
  "image": null
}
```

---

### Turnover Fake Data — `/leaderboard/turnover-fake-data/`

| Method | Path | Purpose |
|---|---|---|
| GET | `/leaderboard/turnover-fake-data/` | List (paginated) |
| POST | `/leaderboard/turnover-fake-data/` | Create |
| PUT | `/leaderboard/turnover-fake-data/<uuid>/` | Update |
| PATCH | `/leaderboard/turnover-fake-data/<uuid>/archive/` | Archive (soft delete) |

**Request body** (POST / PUT)
```json
{
  "rank": 1,
  "player": "TopFake",
  "total_turnover": "5000.00"
}
```

**Response** (single item)
```json
{
  "id": 1,
  "uuid": "2fe2e858-815b-498f-94c8-d0d98d803660",
  "rank": 1,
  "player": "TopFake",
  "total_turnover": "5000.00"
}
```

---

### GET `/leaderboard/turnover-payout-logs/`
Read-only audit log of every payout attempt, ordered by rank. Paginated.

**Response**
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "uuid": "00634039-22a6-42e1-a2f3-6071f6f64d4c",
      "rank": 1,
      "member_id": 32,
      "display_name": "H**************r",
      "total_turnover": "777.00",
      "reward_name": "Rank1 Tokens",
      "status": 1,
      "notes": "500 Tokens credited.",
      "created": "2026-08-27T16:13:12.222526+08:00"
    }
  ]
}
```
- `member_id`: `null` when `status` = 2 (SKIPPED - FAKE RANK) or the member couldn't be found.
