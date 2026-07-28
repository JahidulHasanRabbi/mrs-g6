# MISSION, PENALTY KICK, CHECK-IN & REDEMPTION — API Reference

---

## Mission

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| GET | `/mission/missions/?category=` | Member/Admin | List missions (category optional: 1 Daily, 2 Weekly, 3 Challenge) |
| GET | `/mission/missions/{uuid}/` | Member/Admin | Retrieve one mission |
| GET | `/mission/missions/my-missions/` | Member | Live missions + caller's progress |
| POST | `/mission/missions/{uuid}/join/` | Member | Enroll in a mission for the current period |
| POST | `/mission/missions/{uuid}/claim/` | Member | Claim a completed mission's reward |
| GET | `/mission/missions/progress-history/?start_date=&end_date=` | Member | Paginated claim history |
| GET | `/mission/game-status/` | Auth | `{game_status, maintenance_mode}` |

### GET `/mission/missions/my-missions/`
```json
{
  "results": [
    {
      "uuid": "...",
      "mission_name": "Daily Login",
      "category": 1,
      "description": "Log in once today",
      "accumulate_target": 1,
      "reward_token_quantity": 0,
      "reward_battle_point_quantity": 100,
      "joined": true,
      "current_value": 1,
      "status": 2
    }
  ]
}
```
`status`: 1 In Progress, 2 Completed, 3 Claimed. Only one of
`reward_token_quantity` / `reward_battle_point_quantity` is ever nonzero.

### POST `/mission/missions/{uuid}/join/`
No body. Errors `400`: `Mission is closed` / `Mission is under maintenance` /
`You have already joined this mission for the current period`.

### POST `/mission/missions/{uuid}/claim/`
No body.
```json
{
  "uuid": "...",
  "mission_name": "Daily Login",
  "mission_uuid": "...",
  "category": 1,
  "token_amount": 0,
  "battle_point_amount": 100,
  "created": "..."
}
```
Errors `400`: `Mission is closed` / `Mission is under maintenance` /
`You have not joined this mission for the current period` /
`Mission has not been completed yet` / `Mission reward has already been claimed` /
`Claim limit reached for this mission`.

### GET `/mission/missions/progress-history/`
```json
{
  "results": [
    {
      "uuid": "...",
      "mission_name": "Daily Login",
      "mission_uuid": "...",
      "current_value": 1,
      "target_value": 1,
      "status": 3,
      "completed_at": "...",
      "claimed_at": "..."
    }
  ]
}
```

### GET `/mission/game-status/`
```json
{ "game_status": 1, "maintenance_mode": false }
```
`game_status`: 1 OPEN, 2 CLOSE.

---

## Penalty Kick

| Method | Path | Description |
| :--- | :--- | :--- |
| POST | `/member/{uuid}/kick/` | Take one kick |
| GET | `/member/{uuid}/kick-history/` | Paginated **unredeemed** wins |
| GET | `/member/{uuid}/kick-full-history/` | Paginated full history (goal + miss) |
| POST | `/member/{uuid}/kick/redeem-all/` | Redeem every outstanding win |
| GET | `/penalty-kick/game-status/` | `{game_status, maintenance_mode}` |

### POST `/member/{uuid}/kick/`
Request:
```json
{ "direction": 2 }
```
`direction`: 1 Left, 2 Middle, 3 Right.

Response `200`:
```json
{
  "result": 1,
  "direction": 2,
  "item_uuid": "...",
  "reward_name": "Battle Point Prize",
  "item_type": "BATTLE POINT",
  "image": null,
  "amount": null,
  "my_tokens": 340
}
```
`result`: 1 goal, 2 miss. **`amount` is only populated when `item_type` is
`FREE CREDIT`** — Token/Score/Battle Point wins show `amount: null` here; the
real payout amount only appears at `redeem-all`.

Errors `400`: `Please choose a World Cup country first` / `Game is closed` /
`Game is under maintenance` / `No kick sequence configured` /
`Member doesn't have enough points` /
`direction must be 1 (Left), 2 (Middle), or 3 (Right)`.

### GET `/member/{uuid}/kick-history/`
```json
{
  "results": [
    { "uuid": "...", "reward_name": "RM5 Cash", "item_type": "FREE CREDIT", "amount": 5.0, "created": "..." }
  ]
}
```

### GET `/member/{uuid}/kick-full-history/`
```json
{
  "results": [
    { "uuid": "...", "result": 1, "reward_name": "RM5 Cash", "item_type": "FREE CREDIT", "token_cost": null, "created": "..." },
    { "uuid": "...", "result": 2, "reward_name": null, "item_type": null, "token_cost": 10, "created": "..." }
  ]
}
```

### POST `/member/{uuid}/kick/redeem-all/`
No body.
```json
{
  "redeemed_count": 3,
  "total_credit": "5.00",
  "total_tokens": 20,
  "total_battle_points": 500,
  "prizes": ["Mystery Prize"],
  "wc_score": 10
}
```
Error `400`: `No outstanding rewards to redeem`.

### GET `/penalty-kick/game-status/`
```json
{ "game_status": 1, "maintenance_mode": false }
```

---

## Check-In

| Method | Path | Description |
| :--- | :--- | :--- |
| POST | `/member/members/check-in/` | Daily check-in |

No body. Pays **Token and Battle Point together** (not one-or-the-other like
Mission).

Response `200`:
```json
{
  "member_id": "...",
  "tokens_obtained": 55,
  "battle_points_obtained": 12
}
```
Errors `400`: `Already checked in today` / `Checkin Not Setup Yet`.

---

## Redemption / Mart

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| GET | `/redemption/redemption-items/available-items/` | Member | List redeemable items open right now |
| POST | `/redemption/redemption-items/{uuid}/redeem/` | Member | Redeem an item |
| GET/POST | `/redemption/settings/` | Admin | Read/update `RedemptionSettings` |
| GET | `/redemption/game-status/` | Auth | `{game_status}` |

Redemption only has `game_status` (no separate `maintenance_mode` — one field
covers it).

### GET `/redemption/redemption-items/available-items/`
Errors `400`: `Redemption is closed`.

### POST `/redemption/redemption-items/{uuid}/redeem/`
Request:
```json
{ "member_uuid": "..." }
```
Errors `400`: `Redemption is closed` / `Item not available to redeem` /
`Not enough tokens available` / `Redeem unsuccessful, please try again later`.

### GET `/redemption/game-status/`
```json
{ "game_status": 1 }
```
`game_status`: 1 OPEN, 2 CLOSE.

---

## Public feature status

| Method | Path | Description |
| :--- | :--- | :--- |
| GET | `/front-view/feature-status/` | Combined open/closed status for every game feature |

```json
{
  "penalty_kick": 1,
  "mission": 1,
  "leaderboard": 1,
  "smash_egg": 1,
  "rpg": 1,
  "redemption": 1
}
```
`1` = open, `2` = closed.
