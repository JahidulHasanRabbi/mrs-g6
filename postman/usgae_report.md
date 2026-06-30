# USAGE REPORT

Base path: `/usage-report/`. All endpoints require JWT authentication (`IsAuthenticated`).

This is a **read-only analytics** module. It aggregates over the existing mini-game
logs — it never writes, has no model of its own, and does not touch any game flow.

There are 4 endpoints, each covering one or more sections of the Usage Report dashboard:
**Summary**, **Games**, **Retention**, **Insights**.

Notes that apply to every endpoint:

* `from_date` and `to_date` are **required** on every endpoint (format `YYYY-MM-DD`). The
  range is **inclusive** on both ends.
* The **Summary** endpoint returns a **single JSON object** (no pagination). Top-level fields are scalars; `leaderboard` and `mission` are nested objects.
* The **Games**, **Retention**, and **Insights** endpoints return the standard **paginated
  envelope** (`count`, `next`, `previous`, `results`), matching every other paginated list in
  the project. The row list lives under `results`. They accept `page` and `page_size`
  (default `20`, max `100`) query params, reusing the project-wide `StandardPagination`.
* There is no `archived` field anywhere.
* Money fields (`total_rewards_given`, `credit_rm`) are returned as **decimal strings** with
  2 decimal places (e.g. `"35.50"`).
* `game` is returned as the integer ID (1/2/3/4), with a `label` alongside it.
* All time bucketing uses the project timezone, **Asia/Kuala_Lumpur**.

---

## Choices

### Game (`game`)

| ID | Game | Has RM payout |
| ---: | :--- | :--- |
| 1 | Lucky Spin | No¹ |
| 2 | Penalty Kick | Yes |
| 3 | Smash Egg | Yes |
| 4 | Prediction | No |

¹ Lucky Spin pays RM, but the amount is not recoverable read-only (it is written to shared
reward/credit tables with no game discriminator). Its `credit_rm` is reported as `null`, and
its payout is **excluded** from `total_rewards_given`. See [Limitations](#limitations).

---

## Summary

| Method | Path | Description |
| :--- | :--- | :--- |
| GET | `/usage-report/summary/` | Overall usage KPIs + engagement breakdown (Reports 1 & 4) |
| GET | `/usage-report/games/` | Per-game usage, rewards, new vs existing users (Reports 2, 5, 6, 7) |
| GET | `/usage-report/games/retention/` | Per-game D1 / D7 / D30 retention (Report 8) |
| GET | `/usage-report/insights/` | Daily trend over the range (Report 3) |

Common query parameters:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| from\_date | Date | Yes | Start of range, inclusive (`YYYY-MM-DD`) |
| to\_date | Date | Yes | End of range, inclusive (`YYYY-MM-DD`) |
| game | Int | No | Restrict to one game (1–4). Applies to `/games/`, `/games/retention/`, `/insights/`. Omit for all games |
| page | Int | No | Page number (paginated endpoints only: `/games/`, `/games/retention/`, `/insights/`). Default `1` |
| page\_size | Int | No | Rows per page (paginated endpoints only). Default `20`, max `100` |

Validation errors (any endpoint) return **400**:

* `from_date` or `to_date` missing → `"from_date and to_date are required (YYYY-MM-DD)"`
* Unparseable date → `"Invalid date format, use YYYY-MM-DD"`
* `from_date` after `to_date` → `"from_date must be before or equal to to_date"`
* `game` not an integer → `"game must be an integer"`
* `game` not 1–4 → `"Invalid game id: <value>"`

Unauthenticated requests return **401**.

---

# SUMMARY

### GET /usage-report/summary/

Overall usage KPIs across all games, plus the user-engagement breakdown by number of
games played.

Query Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| from\_date | Date | Yes | Start of range, inclusive |
| to\_date | Date | Yes | End of range, inclusive |

> Note: `/summary/` always rolls up **all** games; it ignores the `game` parameter.

Response

| Field | Type | Description |
| :--- | :--- | :--- |
| total\_active\_users | Int | Distinct members who played **any** game in the range (cross-game distinct) |
| total\_sessions | Int | Total plays across all games |
| total\_tokens\_consumed | Int | Total tokens spent across all games |
| total\_rewards\_given | Str (Decimal) | Total RM paid out (Penalty Kick + Smash Egg only; see Limitations) |
| average\_session\_per\_user | Float | `total_sessions / total_active_users` (0 if no users) |
| played\_1\_game | Int | Members who played exactly 1 distinct game |
| played\_2\_games | Int | Members who played exactly 2 distinct games |
| played\_3\_games | Int | Members who played exactly 3 distinct games |
| played\_4\_plus\_games | Int | Members who played 4 or more distinct games |
| leaderboard | Object | Leaderboard participation summary for the range (see below) |
| mission | Object | Mission activity summary for the range (see below) |

The four `played_*` buckets sum to `total_active_users`.

**`leaderboard` object**

| Field | Type | Description |
| :--- | :--- | :--- |
| total\_participants | Int | Distinct real members who appeared in any leaderboard ranking generated in the range |
| deposit\_participants | Int | Distinct real members in the Deposit leaderboard rankings generated in the range |
| withdraw\_participants | Int | Distinct real members in the Withdraw leaderboard rankings generated in the range |
| referral\_participants | Int | Distinct real members in the Referral leaderboard rankings generated in the range |

> Note: leaderboard rankings are batch-generated (weekly display, monthly settlement). Counts reflect members in batches whose generation timestamp falls within the reporting range. Monthly reporting periods aligned to the calendar month are the most reliable interval.

**`mission` object**

| Field | Type | Description |
| :--- | :--- | :--- |
| total\_completions | Int | Mission progress records where `completed_at` falls in the range |
| unique\_members\_completed | Int | Distinct members who completed at least one mission in the range |
| total\_claims | Int | Mission reward claims created in the range |
| total\_tokens\_awarded | Int | Total tokens awarded via mission claims in the range |
| unique\_members\_claimed | Int | Distinct members who claimed at least one mission reward in the range |

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
  "played_4_plus_games": 0,
  "leaderboard": {
    "total_participants": 18,
    "deposit_participants": 10,
    "withdraw_participants": 5,
    "referral_participants": 3
  },
  "mission": {
    "total_completions": 45,
    "unique_members_completed": 20,
    "total_claims": 38,
    "total_tokens_awarded": 950,
    "unique_members_claimed": 18
  }
}
```

---

# GAMES

### GET /usage-report/games/

One row per game (or just the selected game), with usage, the **money paid out** (`credit_rm`),
and the new-vs-existing user split. Sort the rows by `unique_players` descending to get the Top
Mini Game ranking (Report 5).

`credit_rm` is the actual money (FREE CREDIT) won, summed over the range. It is `null` for games
that pay no recoverable RM (Lucky Spin, Prediction).

Query Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| from\_date | Date | Yes | Start of range, inclusive |
| to\_date | Date | Yes | End of range, inclusive |
| game | Int | No | Restrict to one game (1–4) |

Response

| Field | Type | Description |
| :--- | :--- | :--- |
| count | Int | Total number of game rows (before paging) |
| next | Str / null | URL of the next page, or `null` |
| previous | Str / null | URL of the previous page, or `null` |
| results | List | One object per game on this page (below) |

Each item in `results`

| Field | Type | Description |
| :--- | :--- | :--- |
| game | Int | 1 = Lucky Spin, 2 = Penalty Kick, 3 = Smash Egg, 4 = Prediction |
| label | Str | Display name |
| unique\_players | Int | Distinct members who played this game in the range |
| sessions | Int | Plays of this game in the range |
| avg\_sessions\_per\_player | Float | `sessions / unique_players` (0 if no players) |
| tokens\_consumed | Int | Tokens **spent** to play this game in the range (entry cost) |
| rewards\_given | Int | Count of reward grants (= `sessions`; every play grants an outcome) |
| credit\_rm | Str (Decimal) / null | **Money** (FREE CREDIT) paid out by this game. `null` for games with no recoverable RM (Lucky Spin, Prediction) |
| new\_users | Int | Players who played this game this range but **not in the previous equal-length period** |
| existing\_users | Int | Players who played this game in **both** this range and the previous equal-length period |

`new_users + existing_users == unique_players` for every row. The "previous period" is the
same number of days immediately before the selected range (Today → Yesterday, This Week →
last week, a custom N-day range → the previous N days).

Example

```json
{
  "count": 4,
  "next": null,
  "previous": null,
  "results": [
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
    }
  ]
}
```

---

# RETENTION

### GET /usage-report/games/retention/

Per-game cohort retention. The cohort for each game is the set of **new** players whose
first-ever play of that game falls inside the range (players with any prior play are
excluded). This is the classic **Day-N retention curve**: for each cohort member it measures
whether they came back to play the same game **on** a given day-offset (Asia/Kuala_Lumpur) —
`d1` = day +1 (the next day), `d7` = day +7, `d30` = day +30 — looking ahead up to 30 days
past the end of the range. Because each `dN` is activity *on* that day, the curve falls off
over time (`d1 >= d7 >= d30` in practice). **Same-day replays (day 0) never count.**

Query Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| from\_date | Date | Yes | Start of range, inclusive |
| to\_date | Date | Yes | End of range, inclusive |
| game | Int | No | Restrict to one game (1–4) |

Response

| Field | Type | Description |
| :--- | :--- | :--- |
| count | Int | Total number of game rows (before paging) |
| next | Str / null | URL of the next page, or `null` |
| previous | Str / null | URL of the previous page, or `null` |
| results | List | One object per game on this page (below) |

Each item in `results`

| Field | Type | Description |
| :--- | :--- | :--- |
| game | Int | 1–4 |
| label | Str | Display name |
| cohort | Int | New players in the range for this game |
| d1 | Float / null | Fraction of cohort who came back the **next day**. `null` if cohort is 0 |
| d7 | Float / null | Fraction who came back on some later day **within 7 days** |
| d30 | Float / null | Fraction who came back on some later day **within 30 days** |

`d1`, `d7`, `d30` are cumulative rates (`d1 ≤ d7 ≤ d30`), rounded to 4 decimals.

Example

```json
{
  "count": 4,
  "next": null,
  "previous": null,
  "results": [
    {
      "game": 2,
      "label": "Penalty Kick",
      "cohort": 3,
      "d1": 0.3333,
      "d7": 0.6667,
      "d30": 0.6667
    },
    {
      "game": 1,
      "label": "Lucky Spin",
      "cohort": 0,
      "d1": null,
      "d7": null,
      "d30": null
    }
  ]
}
```

---

# INSIGHTS

### GET /usage-report/insights/

Daily trend across the range. Every day in the range is returned (days with no activity are
filled with zeros), so the series is always continuous and safe to plot directly.

Query Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| from\_date | Date | Yes | Start of range, inclusive |
| to\_date | Date | Yes | End of range, inclusive |
| game | Int | No | Restrict the trend to one game (1–4). Omit to combine all games |

Response

| Field | Type | Description |
| :--- | :--- | :--- |
| count | Int | Total number of days in the range (before paging) |
| next | Str / null | URL of the next page, or `null` |
| previous | Str / null | URL of the previous page, or `null` |
| results | List | One object per day on this page, ascending (below) |

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
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    { "date": "2026-06-10", "players": 0, "sessions": 0, "tokens_consumed": 0 },
    { "date": "2026-06-11", "players": 0, "sessions": 0, "tokens_consumed": 0 },
    { "date": "2026-06-12", "players": 1, "sessions": 1, "tokens_consumed": 5 }
  ]
}
```

---

# LIMITATIONS

* **Lucky Spin RM is not included in payout figures.** Lucky Spin records its RM win to
  shared reward/credit tables that have no game discriminator, so it cannot be attributed
  read-only. As a result its `credit_rm` is `null`, and `total_rewards_given` covers
  **Penalty Kick + Smash Egg only**. This is a partial total by design — it will become
  complete automatically if Lucky Spin ever records its win amount on its own log.
* `credit_rm` distinguishes two kinds of `null`/zero: `null` means the game tracks no
  recoverable RM (Lucky Spin, Prediction); `"0.00"` means the game tracks RM but paid out
  nothing in the range.
* This module is strictly read-only: no models, no migrations, no writes, and no changes to
  any game's runtime flow.
