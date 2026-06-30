# USAGE REPORT

Base path: `/usage-report/`. All endpoints require JWT authentication (`IsAuthenticated`).

There are 4 GET endpoints: **Summary**, **Games**, **Retention**, **Insights**.

Notes that apply to every endpoint:

* `from_date` and `to_date` are **required** (format `YYYY-MM-DD`). The range is **inclusive** on both ends.
* **Summary** returns a flat object. **Games**, **Retention**, and **Insights** return the standard
  paginated envelope (`count`, `next`, `previous`, `results`) and accept `page` / `page_size`.
* Money fields (`total_rewards_given`, `credit_rm`) are returned as **decimal strings** with 2 decimals (e.g. `"35.50"`).
* `game` is returned as the integer ID (1/2/3/4) with a `label` alongside it.
* All dates/times are in **Asia/Kuala_Lumpur**.

---

## Choices

### Game (`game`)

| ID | Game | `credit_rm` |
| ---: | :--- | :--- |
| 1 | Lucky Spin | `null` |
| 2 | Penalty Kick | RM string |
| 3 | Smash Egg | RM string |
| 4 | Prediction | `null` |

---

## Endpoints

| Method | Path | Description |
| :--- | :--- | :--- |
| GET | `/usage-report/summary/` | Overall usage KPIs + engagement breakdown |
| GET | `/usage-report/games/` | Per-game usage, rewards, new vs existing users |
| GET | `/usage-report/games/retention/` | Per-game D1 / D7 / D30 retention |
| GET | `/usage-report/insights/` | Daily trend over the range |

Common query parameters:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| from\_date | Date | Yes | Start of range, inclusive (`YYYY-MM-DD`) |
| to\_date | Date | Yes | End of range, inclusive (`YYYY-MM-DD`) |
| game | Int | No | Restrict to one game (1–4). Applies to `/games/`, `/games/retention/`, `/insights/` |
| page | Int | No | Page number (paginated endpoints only). Default `1` |
| page\_size | Int | No | Rows per page (paginated endpoints only). Default `20`, max `100` |

Error responses:

| Status | When | Body |
| :--- | :--- | :--- |
| 400 | `from_date`/`to_date` missing | `{"error":"Invalid request","details":"from_date and to_date are required (YYYY-MM-DD)"}` |
| 400 | Unparseable date | `details: "Invalid date format, use YYYY-MM-DD"` |
| 400 | `from_date` after `to_date` | `details: "from_date must be before or equal to to_date"` |
| 400 | `game` not an integer | `details: "game must be an integer"` |
| 400 | `game` not 1–4 | `details: "Invalid game id: <value>"` |
| 401 | Not authenticated | DRF default |

---

# SUMMARY

### GET /usage-report/summary/

Query Parameters: `from_date`, `to_date` (the `game` parameter is ignored — summary always covers all games).

Response

| Field | Type | Description |
| :--- | :--- | :--- |
| total\_active\_users | Int | Distinct members who played any game in the range |
| total\_sessions | Int | Total plays across all games |
| total\_tokens\_consumed | Int | Total tokens spent across all games |
| total\_rewards\_given | Str (Decimal) | Total RM paid out (Penalty Kick + Smash Egg) |
| average\_session\_per\_user | Float | `total_sessions / total_active_users` (0 if no users) |
| played\_1\_game | Int | Members who played exactly 1 distinct game |
| played\_2\_games | Int | Members who played exactly 2 distinct games |
| played\_3\_games | Int | Members who played exactly 3 distinct games |
| played\_4\_plus\_games | Int | Members who played 4 or more distinct games |

Example

```json
{
  "total_active_users": 6,
  "total_sessions": 11,
  "total_tokens_consumed": 66,
  "total_rewards_given": "35.50",
  "average_session_per_user": 1.83,
  "played_1_game": 3,
  "played_2_games": 3,
  "played_3_games": 0,
  "played_4_plus_games": 0
}
```

---

# GAMES

### GET /usage-report/games/

Query Parameters: `from_date`, `to_date`, optional `game`, `page`, `page_size`.

Response envelope: `count`, `next`, `previous`, `results`.

Each item in `results`

| Field | Type | Description |
| :--- | :--- | :--- |
| game | Int | 1 = Lucky Spin, 2 = Penalty Kick, 3 = Smash Egg, 4 = Prediction |
| label | Str | Display name |
| unique\_players | Int | Distinct members who played this game in the range |
| sessions | Int | Plays of this game in the range |
| avg\_sessions\_per\_player | Float | `sessions / unique_players` (0 if no players) |
| tokens\_consumed | Int | Tokens spent to play this game in the range |
| rewards\_given | Int | Count of reward grants (equals `sessions`) |
| credit\_rm | Str (Decimal) / null | RM paid out by this game; `null` for Lucky Spin and Prediction |
| new\_users | Int | Players in this range who did not play this game in the previous equal-length period |
| existing\_users | Int | Players who played this game in both this range and the previous equal-length period |

Example

```json
{
  "count": 4,
  "next": null,
  "previous": null,
  "results": [
    {
      "game": 1,
      "label": "Lucky Spin",
      "unique_players": 3,
      "sessions": 3,
      "avg_sessions_per_player": 1.0,
      "tokens_consumed": 30,
      "rewards_given": 3,
      "credit_rm": null,
      "new_users": 3,
      "existing_users": 0
    },
    {
      "game": 2,
      "label": "Penalty Kick",
      "unique_players": 4,
      "sessions": 6,
      "avg_sessions_per_player": 1.5,
      "tokens_consumed": 30,
      "rewards_given": 6,
      "credit_rm": "25.00",
      "new_users": 3,
      "existing_users": 1
    },
    {
      "game": 3,
      "label": "Smash Egg",
      "unique_players": 2,
      "sessions": 2,
      "avg_sessions_per_player": 1.0,
      "tokens_consumed": 6,
      "rewards_given": 2,
      "credit_rm": "10.50",
      "new_users": 2,
      "existing_users": 0
    },
    {
      "game": 4,
      "label": "Prediction",
      "unique_players": 0,
      "sessions": 0,
      "avg_sessions_per_player": 0,
      "tokens_consumed": 0,
      "rewards_given": 0,
      "credit_rm": null,
      "new_users": 0,
      "existing_users": 0
    }
  ]
}
```

---

# RETENTION

### GET /usage-report/games/retention/

Query Parameters: `from_date`, `to_date`, optional `game`, `page`, `page_size`.

Response envelope: `count`, `next`, `previous`, `results`.

Each item in `results`

| Field | Type | Description |
| :--- | :--- | :--- |
| game | Int | 1–4 |
| label | Str | Display name |
| cohort | Int | New players whose first-ever play of this game is in the range |
| d1 | Float / null | Fraction of cohort who returned on day +1. `null` if cohort is 0 |
| d7 | Float / null | Fraction who returned on day +7 |
| d30 | Float / null | Fraction who returned on day +30 |

Example

```json
{
  "count": 4,
  "next": null,
  "previous": null,
  "results": [
    { "game": 1, "label": "Lucky Spin", "cohort": 3, "d1": 0.0, "d7": 0.0, "d30": 0.0 },
    { "game": 2, "label": "Penalty Kick", "cohort": 3, "d1": 0.3333, "d7": 0.0, "d30": 0.0 },
    { "game": 3, "label": "Smash Egg", "cohort": 2, "d1": 0.0, "d7": 0.0, "d30": 0.0 },
    { "game": 4, "label": "Prediction", "cohort": 0, "d1": null, "d7": null, "d30": null }
  ]
}
```

---

# INSIGHTS

### GET /usage-report/insights/

Query Parameters: `from_date`, `to_date`, optional `game`, `page`, `page_size`. Every day in the range is returned (zero-filled).

Response envelope: `count`, `next`, `previous`, `results`.

Each item in `results`

| Field | Type | Description |
| :--- | :--- | :--- |
| date | Date | The day (`YYYY-MM-DD`) |
| players | Int | Distinct players active that day |
| sessions | Int | Plays that day |
| tokens\_consumed | Int | Tokens spent that day |

Example

```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    { "date": "2026-06-10", "players": 3, "sessions": 3, "tokens_consumed": 15 },
    { "date": "2026-06-11", "players": 1, "sessions": 1, "tokens_consumed": 5 },
    { "date": "2026-06-15", "players": 3, "sessions": 3, "tokens_consumed": 30 },
    { "date": "2026-06-19", "players": 0, "sessions": 0, "tokens_consumed": 0 }
  ]
}
```
