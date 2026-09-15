# Boss War API

Base path: `/bosswar/`
Auth required on every endpoint.
Image uploads: `multipart/form-data`. All other writes: `application/json`.

---

## Index

**Member**
| # | Method | Path |
|---|---|---|
| 1 | GET | `/bosswar/member/bosses/` |
| 2 | GET | `/bosswar/{uuid}/` |
| 3 | POST | `/bosswar/member/{boss_uuid}/attack/{member_uuid}/` |
| 4 | GET | `/bosswar/member/{boss_uuid}/ranking/` |
| 5 | GET | `/bosswar/member/{boss_uuid}/rank/{member_uuid}/` |
| 6 | GET | `/bosswar/member/{member_uuid}/balance/` |
| 7 | GET | `/bosswar/member/{member_uuid}/points/` |
| 8 | GET | `/bosswar/member/{boss_uuid}/{member_uuid}/attacks/` |
| 9 | GET | `/bosswar/member/{boss_uuid}/{member_uuid}/rewards/` |

**Admin — Boss**
| # | Method | Path |
|---|---|---|
| 10 | GET | `/bosswar/` |
| 11 | POST | `/bosswar/` |
| 12 | GET | `/bosswar/{uuid}/` |
| 13 | PUT | `/bosswar/{uuid}/` |
| 14 | PATCH | `/bosswar/{uuid}/archive/` |

**Admin — Reward Items**
| # | Method | Path |
|---|---|---|
| 15 | GET | `/bosswar/{boss_uuid}/reward-items/` |
| 16 | POST | `/bosswar/{boss_uuid}/reward-items/` |
| 17 | GET | `/bosswar/{boss_uuid}/reward-items/{uuid}/` |
| 18 | PUT | `/bosswar/{boss_uuid}/reward-items/{uuid}/` |
| 19 | PATCH | `/bosswar/{boss_uuid}/reward-items/{uuid}/archive/` |

**Admin — VIP Combat Bonus**
| # | Method | Path |
|---|---|---|
| 20 | GET | `/bosswar/vip-bonuses/` |
| 21 | POST | `/bosswar/vip-bonuses/` |
| 22 | GET | `/bosswar/vip-bonuses/{uuid}/` |
| 23 | PUT | `/bosswar/vip-bonuses/{uuid}/` |
| 24 | PATCH | `/bosswar/vip-bonuses/{uuid}/archive/` |

**Admin — Deposit To Attack Point**
| # | Method | Path |
|---|---|---|
| 25 | GET | `/bosswar/deposit-points/` |
| 26 | POST | `/bosswar/deposit-points/` |
| 27 | GET | `/bosswar/deposit-points/{uuid}/` |
| 28 | PUT | `/bosswar/deposit-points/{uuid}/` |
| 29 | PATCH | `/bosswar/deposit-points/{uuid}/archive/` |

**Admin — Settings**
| # | Method | Path |
|---|---|---|
| 30 | GET | `/bosswar/settings/` |
| 31 | PATCH | `/bosswar/settings/update_settings/` |

**Admin — Reports**
| # | Method | Path |
|---|---|---|
| 32 | GET | `/bosswar/attack-report/` |
| 33 | GET | `/bosswar/point-report/` |
| 34 | GET | `/bosswar/reward-report/` |

**Admin — Payout**
| # | Method | Path |
|---|---|---|
| 35 | POST | `/bosswar/settle-payouts/` |

---

## Choice values

`boss_type`
| Value | Label |
|---|---|
| 1 | DAILY |
| 2 | WEEKLY |
| 3 | EVENT |

`status`
| Value | Label |
|---|---|
| 1 | UPCOMING |
| 2 | ACTIVE |
| 3 | DEFEATED |
| 4 | ENDED |

`reward_gem`
| Value | Label |
|---|---|
| 1 | COMMON |
| 2 | RARE |
| 3 | PREMIUM |
| 4 | EPIC |
| 5 | LEGENDARY |

`reward_type`
| Value | Label |
|---|---|
| 1 | RANKING |
| 2 | KILL |
| 3 | PARTICIPATION |

`item_type`
| Value | Label |
|---|---|
| 1 | FREE CREDIT |
| 2 | TOKEN |
| 3 | PRIZE |
| 4 | BATTLE POINT |
| 5 | ATTACK POINT |

`game_status`
| Value | Label |
|---|---|
| 1 | OPEN |
| 2 | CLOSE |

`type` — attack point ledger event
| Value | Label |
|---|---|
| 1 | EARN |
| 2 | REDEEM |
| 3 | SET |
| 4 | ADJUST |
| 5 | LOSS |

`reason_type` — attack point ledger source
| Value | Label |
|---|---|
| 1 | CHECK-IN |
| 2 | MISSION |
| 3 | DEPOSIT |
| 4 | LUCKY-SPIN |
| 5 | PENALTY-KICK |
| 6 | SMASH-EGG |
| 7 | BOSS-BATTLE |
| 8 | MANUAL |

---

## 1. List bosses (member)
`GET /bosswar/member/bosses/`

Query
| Name | Required | Values |
|---|---|---|
| `status` | no | `1` `2` `3` `4` |
| `boss_type` | no | `1` `2` `3` |

Default with no query: excludes archived, excludes `status=4`, excludes `ends_at` in the past.

Response `200`
```json
[
  {
    "uuid": "3f1c8a92-5d44-4b71-9c02-8e6a1f0b4d33",
    "name": "Fire Dragon",
    "boss_type": "DAILY",
    "status": "ACTIVE",
    "hp_max": 5000000,
    "hp_remaining": 4821300,
    "starts_at": "2026-09-15T00:00:00Z",
    "ends_at": "2026-09-16T00:00:00Z",
    "reward_gem": "EPIC",
    "image": "http://localhost:8000/media/boss_war/a1b2c3.jpg"
  }
]
```

---

## 2. Retrieve boss
`GET /bosswar/{uuid}/`

Response `200`
```json
{
  "id": 1,
  "uuid": "3f1c8a92-5d44-4b71-9c02-8e6a1f0b4d33",
  "name": "Fire Dragon",
  "boss_type": "DAILY",
  "status": "ACTIVE",
  "hp_max": 5000000,
  "hp_remaining": 4821300,
  "starts_at": "2026-09-15T00:00:00Z",
  "ends_at": "2026-09-16T00:00:00Z",
  "min_damage": 100,
  "max_damage": 500,
  "base_critical_rate": "10.00",
  "critical_multiplier": "2.00",
  "reward_gem": "EPIC",
  "image": "http://localhost:8000/media/boss_war/a1b2c3.jpg",
  "created": "2026-09-14T08:12:00Z"
}
```

---

## 3. Attack boss
`POST /bosswar/member/{boss_uuid}/attack/{member_uuid}/`

Request — no body. Costs 1 attack point.

Response `200`
```json
{
  "uuid": "1d6e8f40-7c25-4b93-8a01-5f2d9c4e7b68",
  "damage": 840,
  "is_critical": true,
  "ap_used": 1,
  "attack_points": 9,
  "hp_remaining": 4820460,
  "hp_max": 5000000,
  "status": 2,
  "my_damage": 13240,
  "my_rank": 7
}
```

`status` is the numeric boss status after the hit.

Response `400`
```json
{ "error": "Invalid request", "details": "Boss is not active" }
```

| `details` |
|---|
| `Boss War is closed` |
| `Boss is not active` |
| `Boss War has not started yet` |
| `Boss War has ended` |
| `Boss has already been defeated` |
| `Not enough Attack Points` |
| `Boss {uuid}: does not exist` |
| `Member {uuid}: does not exist` |

---

## 4. Boss leaderboard
`GET /bosswar/member/{boss_uuid}/ranking/`

Top 20 by total damage. `display_name` is masked.

Response `200`
```json
[
  { "rank": 1, "display_name": "d***u", "amount": 184200 }
]
```

---

## 5. Member rank
`GET /bosswar/member/{boss_uuid}/rank/{member_uuid}/`

Response `200`
```json
{
  "uuid": "9a7b3e52-8d14-4f67-b025-6c1a4e8d3f90",
  "rank": 7,
  "amount": 13240,
  "next_rank": 6,
  "next_rank_amount": 15100
}
```

`rank`, `next_rank`, `next_rank_amount` are `null` when the member has not attacked or is rank 1.

---

## 6. Attack point balance
`GET /bosswar/member/{member_uuid}/balance/`

Response `200`
```json
{ "current": 9, "per_attack": 1 }
```

---

## 7. Attack point ledger
`GET /bosswar/member/{member_uuid}/points/`

Query
| Name | Required | Values |
|---|---|---|
| `start_date` | no | `YYYY-MM-DD`, requires `end_date` |
| `end_date` | no | `YYYY-MM-DD`, requires `start_date` |
| `category` | no | `reason_type` `1`–`8` |
| `type` | no | `1`–`5` |
| `page` | no | |
| `page_size` | no | default 20, max 100 |

Response `200`
```json
{
  "count": 58,
  "next": null,
  "previous": null,
  "results": [
    {
      "uuid": "4b9c2d71-6a38-4e50-9f17-2d5b8c1a6e34",
      "member_uuid": "9a7b3e52-8d14-4f67-b025-6c1a4e8d3f90",
      "username": "john88",
      "type": "EARN",
      "amount": 4,
      "reason_type": "DEPOSIT",
      "reason_uuid": "8e3f1a04-5c92-4d76-b810-7a2c6f9b4d51",
      "created": "2026-09-15T09:15:42Z"
    }
  ]
}
```

---

## 8. Member attack history
`GET /bosswar/member/{boss_uuid}/{member_uuid}/attacks/`

Query
| Name | Required | Values |
|---|---|---|
| `page` | no | |
| `page_size` | no | default 20, max 100 |

Response `200`
```json
{
  "count": 142,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "uuid": "1d6e8f40-7c25-4b93-8a01-5f2d9c4e7b68",
      "created": "2026-09-15T10:32:18Z",
      "damage": 840,
      "is_critical": true,
      "ap_used": 1
    }
  ]
}
```

---

## 9. Member rewards for a boss
`GET /bosswar/member/{boss_uuid}/{member_uuid}/rewards/`

Query
| Name | Required | Values |
|---|---|---|
| `page` | no | |
| `page_size` | no | default 20, max 100 |

Response `200`
```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "uuid": "6f4a8b23-1d59-4c07-ae36-9b2e5d8f1a47",
      "created": "2026-09-16T00:05:11Z",
      "reward_type": "RANKING",
      "reward_name": "Legendary Reward",
      "item_type": "FREE CREDIT",
      "image": "http://localhost:8000/media/boss_war/d4e5f6.jpg"
    }
  ]
}
```

---

## 10. List bosses (admin)
`GET /bosswar/`

Response `200` — array of the object in §2.

---

## 11. Create boss
`POST /bosswar/`

Request
```json
{
  "name": "Fire Dragon",
  "boss_type": 1,
  "status": 2,
  "hp_max": 5000000,
  "hp_remaining": 5000000,
  "starts_at": "2026-09-15T00:00:00Z",
  "ends_at": "2026-09-16T00:00:00Z",
  "min_damage": 100,
  "max_damage": 500,
  "base_critical_rate": "10.00",
  "critical_multiplier": "2.00",
  "reward_gem": 4,
  "image": "<file>"
}
```

| Field | Required | Type / Values |
|---|---|---|
| `name` | yes | string |
| `boss_type` | yes | `1` `2` `3` |
| `status` | yes | `1` `2` `3` `4` |
| `hp_max` | yes | integer |
| `hp_remaining` | no | integer |
| `starts_at` | yes | ISO 8601 |
| `ends_at` | yes | ISO 8601 |
| `min_damage` | no | integer |
| `max_damage` | no | integer |
| `base_critical_rate` | no | decimal 5,2 |
| `critical_multiplier` | no | decimal 5,2 |
| `reward_gem` | yes | `1` `2` `3` `4` `5` |
| `image` | no | file |

Response `201` — object in §2.

---

## 12. Retrieve boss (admin)
`GET /bosswar/{uuid}/`

Response `200` — object in §2.

---

## 13. Update boss
`PUT /bosswar/{uuid}/`

Request — same fields as §11.
Response `200` — object in §2.

---

## 14. Archive boss
`PATCH /bosswar/{uuid}/archive/`

Request — no body.
Response `200` — object in §2.

---

## 15. List reward items
`GET /bosswar/{boss_uuid}/reward-items/`

Response `200`
```json
[
  {
    "id": 1,
    "uuid": "7a2e4c18-9b36-4f52-a1d7-0c3b8e5f9a24",
    "boss_uuid": "3f1c8a92-5d44-4b71-9c02-8e6a1f0b4d33",
    "boss_name": "Fire Dragon",
    "reward_type": "RANKING",
    "reward_name": "Legendary Reward",
    "position_start": 1,
    "position_end": null,
    "item_type": "FREE CREDIT",
    "credit_amount": "500.00",
    "token_amount": null,
    "battle_point_amount": null,
    "attack_point_amount": null,
    "image": "http://localhost:8000/media/boss_war/d4e5f6.jpg",
    "archived": null
  }
]
```

---

## 16. Create reward item
`POST /bosswar/{boss_uuid}/reward-items/`

Request
```json
{
  "boss_uuid": "3f1c8a92-5d44-4b71-9c02-8e6a1f0b4d33",
  "reward_type": 1,
  "reward_name": "Legendary Reward",
  "position_start": 1,
  "position_end": null,
  "item_type": 1,
  "credit_amount": "500.00",
  "token_amount": null,
  "battle_point_amount": null,
  "attack_point_amount": null,
  "image": "<file>"
}
```

| Field | Required | Type / Values |
|---|---|---|
| `boss_uuid` | yes | uuid, must exist |
| `reward_type` | yes | `1` `2` `3` |
| `reward_name` | yes | string |
| `position_start` | no | integer, nullable |
| `position_end` | no | integer, nullable |
| `item_type` | yes | `1` `2` `3` `4` `5` |
| `credit_amount` | no | decimal 14,2, nullable |
| `token_amount` | no | integer, nullable |
| `battle_point_amount` | no | integer, nullable |
| `attack_point_amount` | no | integer, nullable |
| `image` | no | file |

`position_start` / `position_end` apply to `reward_type=1` only.
Send the amount field matching `item_type`; leave the others `null`.
`item_type=3` (PRIZE) carries no amount.

Response `201` — object in §15.

---

## 17. Retrieve reward item
`GET /bosswar/{boss_uuid}/reward-items/{uuid}/`

Response `200` — object in §15.

---

## 18. Update reward item
`PUT /bosswar/{boss_uuid}/reward-items/{uuid}/`

Request — same fields as §16.
Response `200` — object in §15.

---

## 19. Archive reward item
`PATCH /bosswar/{boss_uuid}/reward-items/{uuid}/archive/`

Request — no body.
Response `200` — object in §15.

---

## 20. List VIP bonuses
`GET /bosswar/vip-bonuses/`

Response `200`
```json
[
  {
    "id": 1,
    "uuid": "b8d1f307-42a9-4e65-8c13-7f9a2d6b5e01",
    "member_tier_uuid": "e5c3a719-6b28-4d90-af14-3c8e7b2d9f46",
    "member_tier_name": "VIP 3",
    "critical_rate": "15.00",
    "damage_bonus": "1.20"
  }
]
```

---

## 21. Create VIP bonus
`POST /bosswar/vip-bonuses/`

Request
```json
{
  "member_tier_uuid": "e5c3a719-6b28-4d90-af14-3c8e7b2d9f46",
  "critical_rate": "15.00",
  "damage_bonus": "1.20"
}
```

| Field | Required | Type / Values |
|---|---|---|
| `member_tier_uuid` | yes | uuid, must exist |
| `critical_rate` | yes | decimal 5,2 |
| `damage_bonus` | yes | decimal 5,2 |

Response `201` — object in §20.

---

## 22. Retrieve VIP bonus
`GET /bosswar/vip-bonuses/{uuid}/`

Response `200` — object in §20.

---

## 23. Update VIP bonus
`PUT /bosswar/vip-bonuses/{uuid}/`

Request — same fields as §21.
Response `200` — object in §20.

---

## 24. Archive VIP bonus
`PATCH /bosswar/vip-bonuses/{uuid}/archive/`

Request — no body.
Response `200` — object in §20.

---

## 25. List deposit bands
`GET /bosswar/deposit-points/`

Response `200`
```json
[
  {
    "id": 1,
    "uuid": "c9f2b481-3e57-4a06-9d28-1b4c6a8e3f57",
    "deposit_amount": "50.00",
    "attack_point_amount": 4
  }
]
```

---

## 26. Create deposit band
`POST /bosswar/deposit-points/`

Request
```json
{ "deposit_amount": "50.00", "attack_point_amount": 4 }
```

| Field | Required | Type / Values |
|---|---|---|
| `deposit_amount` | yes | decimal 10,2 |
| `attack_point_amount` | yes | integer |

Bands are thresholds: the highest band `<=` the deposit is used.

Response `201` — object in §25.

---

## 27. Retrieve deposit band
`GET /bosswar/deposit-points/{uuid}/`

Response `200` — object in §25.

---

## 28. Update deposit band
`PUT /bosswar/deposit-points/{uuid}/`

Request — same fields as §26.
Response `200` — object in §25.

---

## 29. Archive deposit band
`PATCH /bosswar/deposit-points/{uuid}/archive/`

Request — no body.
Response `200` — object in §25.

---

## 30. Get settings
`GET /bosswar/settings/`

Response `200`
```json
{ "game_status": 1 }
```

---

## 31. Update settings
`PATCH /bosswar/settings/update_settings/`

Request
```json
{ "game_status": 2 }
```

| Field | Required | Type / Values |
|---|---|---|
| `game_status` | no | `1` `2` |

Response `200`
```json
{ "game_status": 2 }
```

`PATCH /bosswar/settings/` is not routed and returns `405`.

---

## 32. Attack report
`GET /bosswar/attack-report/`

Query
| Name | Required | Values |
|---|---|---|
| `start_date` | no | `YYYY-MM-DD`, requires `end_date` |
| `end_date` | no | `YYYY-MM-DD`, requires `start_date` |
| `boss_uuid` | no | uuid |
| `is_critical` | no | `true` `false` |
| `username` | no | partial match |
| `phone_number` | no | partial match |
| `page` | no | |
| `page_size` | no | default 20, max 100 |

Response `200`
```json
{
  "count": 142,
  "next": null,
  "previous": null,
  "results": [
    {
      "uuid": "1d6e8f40-7c25-4b93-8a01-5f2d9c4e7b68",
      "boss_uuid": "3f1c8a92-5d44-4b71-9c02-8e6a1f0b4d33",
      "boss_name": "Fire Dragon",
      "member_uuid": "9a7b3e52-8d14-4f67-b025-6c1a4e8d3f90",
      "username": "john88",
      "damage": 840,
      "is_critical": true,
      "ap_used": 1,
      "created": "2026-09-15T10:32:18Z"
    }
  ]
}
```

---

## 33. Attack point report
`GET /bosswar/point-report/`

Query
| Name | Required | Values |
|---|---|---|
| `start_date` | no | `YYYY-MM-DD`, requires `end_date` |
| `end_date` | no | `YYYY-MM-DD`, requires `start_date` |
| `category` | no | `reason_type` `1`–`8` |
| `type` | no | `1`–`5` |
| `username` | no | partial match |
| `phone_number` | no | partial match |
| `page` | no | |
| `page_size` | no | default 20, max 100 |

Response `200` — same shape as §7.

---

## 34. Reward report
`GET /bosswar/reward-report/`

Query
| Name | Required | Values |
|---|---|---|
| `start_date` | no | `YYYY-MM-DD`, requires `end_date` |
| `end_date` | no | `YYYY-MM-DD`, requires `start_date` |
| `boss_uuid` | no | uuid |
| `category` | no | `reward_type` `1` `2` `3` |
| `reward_name` | no | partial match |
| `username` | no | partial match |
| `phone_number` | no | partial match |
| `page` | no | |
| `page_size` | no | default 20, max 100 |

Response `200`
```json
{
  "count": 12,
  "next": null,
  "previous": null,
  "results": [
    {
      "uuid": "6f4a8b23-1d59-4c07-ae36-9b2e5d8f1a47",
      "boss_uuid": "3f1c8a92-5d44-4b71-9c02-8e6a1f0b4d33",
      "boss_name": "Fire Dragon",
      "member_uuid": "9a7b3e52-8d14-4f67-b025-6c1a4e8d3f90",
      "username": "john88",
      "reward_item_uuid": "7a2e4c18-9b36-4f52-a1d7-0c3b8e5f9a24",
      "reward_name": "Legendary Reward",
      "reward_type": "RANKING",
      "won_amount": "500.00",
      "token_amount": null,
      "battle_point_amount": null,
      "attack_point_amount": null,
      "created": "2026-09-16T00:05:11Z"
    }
  ]
}
```

---

## 35. Trigger payouts
`POST /bosswar/settle-payouts/`

Request — settle everything due
```json
{}
```

Request — settle one boss
```json
{ "boss_uuid": "3f1c8a92-5d44-4b71-9c02-8e6a1f0b4d33" }
```

| Field | Required | Type / Values |
|---|---|---|
| `boss_uuid` | no | uuid |

Response `200`
```json
{ "settled_bosses": 1, "credited": 42 }
```

`settled_bosses` is `null` for the bulk form.

Response `400`
| `details` |
|---|
| `Boss has not been defeated yet` |
| `Boss War has not ended yet` |
| `Boss {uuid}: does not exist or is archived` |

---

## Errors

`400`
```json
{
  "error": "Data submitted is invalid",
  "details": { "name": ["This field is required."] }
}
```
```json
{
  "error": "Invalid request",
  "details": "Item with uuid 3f1c8a92-...: does not exist or is archived"
}
```

`401`
```json
{ "detail": "Authentication credentials were not provided." }
```

`404`
```json
{ "detail": "Not found." }
```

---

## Related endpoints to update

These existing endpoints gained attack point fields. The model and database
columns exist; the serializer column says whether the field is currently
exposed by the API.

| Endpoint | Field added | Type |
|---|---|---|
| `GET/POST/PUT /settings/` | `attack_point_minimum` | integer |
| `GET/POST/PUT /settings/` | `attack_point_maximum` | integer |
| `GET/POST/PUT /member/vip-tier/` | `check_in_attack_point` | integer |
| `POST /member/members/check-in/` | `attack_points_obtained` | integer, response only |
| `GET/POST/PUT /lucky-spin/lucky-spin-items/` | `attack_point_amount` | integer, nullable |
| `GET/POST/PUT /smash-egg/smash-egg-items/` | `attack_point_amount` | integer, nullable |
| `GET/POST/PUT /penalty-kick/penalty-kick-items/` | `attack_point_amount` | integer, nullable |
| `GET/POST/PUT /mission/missions/` | `reward_attack_point_quantity` | integer, default 0 |
| `GET /mission/missions/my-missions/` | `reward_attack_point_quantity` | integer, read only |
| `GET /mission/missions/{uuid}/claim/` | `attack_point_amount` | integer, response only |

`attack_point_minimum` / `attack_point_maximum` sit on each day row of the
check-in reward list. `attack_point_maximum` must be `>=`
`attack_point_minimum` or the request is rejected.

Each mini game has its own `item_type` scale — the same number means
different things per game. Send the value that means ATTACK POINT for that
game, or the amount is stored but never granted:

| `item_type` | Lucky spin | Smash egg | Penalty kick |
|---|---|---|---|
| 1 | FREE CREDIT | FREE CREDIT | FREE CREDIT |
| 2 | ITEM | TOKEN | TOKEN |
| 3 | TOKEN | PRIZE | PRIZE |
| 4 | OTHER | BATTLE POINT | WORLD CUP SCORE |
| 5 | BATTLE POINT | **ATTACK POINT** | BATTLE POINT |
| 6 | **ATTACK POINT** | — | **ATTACK POINT** |

`reward_attack_point_quantity` on a mission can be combined with a token or
battle point reward.

`POST /member/members/check-in/` response gained:
```json
{ "attack_points_obtained": 3 }
```

---

## Changelog

### 1 — Boss War

**Added — endpoints**
- `GET /bosswar/member/bosses/`
- `POST /bosswar/member/{boss_uuid}/attack/{member_uuid}/`
- `GET /bosswar/member/{boss_uuid}/ranking/`
- `GET /bosswar/member/{boss_uuid}/rank/{member_uuid}/`
- `GET /bosswar/member/{member_uuid}/balance/`
- `GET /bosswar/member/{member_uuid}/points/`
- `GET /bosswar/member/{boss_uuid}/{member_uuid}/attacks/`
- `GET /bosswar/member/{boss_uuid}/{member_uuid}/rewards/`
- `GET/POST/PUT/PATCH /bosswar/` and `/bosswar/{uuid}/archive/`
- `GET/POST/PUT/PATCH /bosswar/{boss_uuid}/reward-items/`
- `GET/POST/PUT/PATCH /bosswar/vip-bonuses/`
- `GET/POST/PUT/PATCH /bosswar/deposit-points/`
- `GET /bosswar/settings/`, `PATCH /bosswar/settings/update_settings/`
- `GET /bosswar/attack-report/`
- `GET /bosswar/point-report/`
- `GET /bosswar/reward-report/`
- `POST /bosswar/settle-payouts/`

**Added — fields on existing endpoints**
- `attack_point_minimum`, `attack_point_maximum` on check-in settings
- `check_in_attack_point` on member tier
- `attack_points_obtained` in the check-in response
- `attack_point_amount` on lucky spin, smash egg, penalty kick items
- `reward_attack_point_quantity` on mission, admin and member views
- `attack_point_amount` on mission claim response

**Added — choice values**
- Member token `reason_type` `20` BOSS-WAR
- Battle point `reason_type` `13` BOSS-WAR

**Removed**
- Nothing.

**Changed**
- Nothing existing. All entries above are additive.
