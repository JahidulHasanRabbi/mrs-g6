# USAGE REPORT

Base path: `/usage-report/`. All endpoints require JWT authentication (`IsAuthenticated`).

This is a **read-only analytics** module. It aggregates over the existing mini-game
logs — it never writes, has no model of its own, and does not touch any game flow.

There are 6 endpoints, each covering one or more sections of the Usage Report dashboard:
**Summary**, **Participation**, **Games**, **Retention**, **Insights**, **Members**.

Notes that apply to every endpoint:

* `from_date` and `to_date` are **required** on every endpoint (format `YYYY-MM-DD`). The
  range is **inclusive** on both ends.
* The **Summary** and **Participation** endpoints return a **single JSON object** (no
  pagination). Summary is flat scalars; Participation is two nested objects.
* The **Games**, **Retention**, **Insights** and **Members** endpoints return the standard **paginated
  envelope** (`count`, `next`, `previous`, `results`), matching every other paginated list in
  the project. The row list lives under `results`. They accept `page` and `page_size`
  (default `20`, max `100`) query params, reusing the project-wide `StandardPagination`.
* There is no `archived` field anywhere.
* Money fields (`total_rewards_given`, `credit_rm`, `total_rewards`) are returned as **decimal strings** with
  2 decimal places (e.g. `"35.50"`).
* `game` is returned as the integer ID (1/2/3/4/5), with a `label` alongside it.
* All time bucketing uses the project timezone, **Asia/Kuala_Lumpur**.

---

## Choices

### Game (`game`)

| ID | Game | Has RM payout |
| ---: | :--- | :--- |
| 1 | Lucky Spin | Yes |
| 2 | Penalty Kick | Yes |
| 3 | Smash Egg | Yes |
| 4 | Prediction | No |
| 5 | Avatar | Yes |

---

## Summary

| Method | Path | Description |
| :--- | :--- | :--- |
| GET | `/usage-report/summary/` | Overall usage KPIs + engagement breakdown (Reports 1 & 4) |
| GET | `/usage-report/participation/` | Leaderboard participation + mission activity |
| GET | `/usage-report/games/` | Per-game usage, rewards, new vs existing users (Reports 2, 5, 6, 7) |
| GET | `/usage-report/games/retention/` | Per-game D1 / D7 / D30 retention (Report 8) |
| GET | `/usage-report/insights/` | Daily trend over the range (Report 3) |
| GET | `/usage-report/members/` | One row per member: tokens, battle points, plays, most played game, rewards |

Common query parameters:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| from\_date | Date | Yes | Start of range, inclusive (`YYYY-MM-DD`) |
| to\_date | Date | Yes | End of range, inclusive (`YYYY-MM-DD`) |
| game | Int | No | Restrict to one game (1–5). Applies to `/summary/`, `/games/`, `/games/retention/`, `/insights/`, `/members/` — every endpoint except `/participation/`, which has no game dimension. Omit for all games |
| page | Int | No | Page number (paginated endpoints only: `/games/`, `/games/retention/`, `/insights/`, `/members/`). Default `1` |
| page\_size | Int | No | Rows per page (paginated endpoints only). Default `20`, max `100` |
| sort | Str | No | Column to order by (`/members/` only). See that section |
| direction | Str | No | `High` or `Low` (`/members/` only, default `High`). See that section |

Validation errors (any endpoint) return **400**:

* `from_date` or `to_date` missing → `"from_date and to_date are required (YYYY-MM-DD)"`
* Unparseable date → `"Invalid date format, use YYYY-MM-DD"`
* `from_date` after `to_date` → `"from_date must be before or equal to to_date"`
* `game` not an integer → `"game must be an integer"`
* `game` not 1–5 → `"Invalid game id: <value>"`
* `sort` not a sortable column → `"sort must be one of: ..."` (`/members/` only)
* `direction` not `High`/`Low` → `"direction must be one of: High, Low"` (`/members/` only)

Unauthenticated requests return **401**.

---

# SUMMARY

### GET /usage-report/summary/

Overall usage KPIs, plus the user-engagement breakdown by number of games played.

Query Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| from\_date | Date | Yes | Start of range, inclusive |
| to\_date | Date | Yes | End of range, inclusive |
| game | Int | No | Restrict to one game (1–5). Omit for all games |

`game` behaves exactly as it does on `/games/`, `/games/retention/`, `/insights/` and
`/members/`: omit it and every game is rolled up; send `game=1` and the totals cover Lucky
Spin alone. An unknown id is a `400`, not a silently ignored filter — so the KPI cards and
the table beneath them can never disagree.

Response

| Field | Type | Description |
| :--- | :--- | :--- |
| total\_active\_users | Int | Distinct members who played in the range. Cross-game distinct when unfiltered; players of the selected game when filtered |
| total\_sessions | Int | Total plays |
| total\_tokens\_consumed | Int | Total tokens spent |
| total\_rewards\_given | Str (Decimal) | Total RM paid out (Penalty Kick + Smash Egg only; see Limitations) |
| average\_session\_per\_user | Float | `total_sessions / total_active_users` (0 if no users) |
| avg\_session\_duration | Float | Total time (seconds) spent in the range, divided by the number of days in the range. Same measure as on `/games/` and `/members/`, rolled up. `0` if no sessions were tracked. See **AVG. SESSION DURATION** |
| played\_1\_game | Int | Members who played exactly 1 distinct game. **All-games response only** |
| played\_2\_games | Int | Members who played exactly 2 distinct games. **All-games response only** |
| played\_3\_games | Int | Members who played exactly 3 distinct games. **All-games response only** |
| played\_4\_plus\_games | Int | Members who played 4 or more distinct games. **All-games response only** |

The first six fields always come back and follow `game`. The four `played_*` buckets are
**present only when no game is selected**, where they sum to `total_active_users`. Send
`game=N` and those four keys are **absent from the response entirely** — not zero, not
null, absent. Read them with `.get()` or guard on the filter.

> Why: they count how many *different* games each member played. Scope that to one game
> and every player has played exactly one, so the breakdown would collapse into
> `played_1_game` and stop meaning anything. Rather than return a misleading number, the
> block is left out.

> `total_rewards_given` is always a decimal string, including `"0.00"` for `game=4`
> (Prediction), which tracks no RM at all. That differs from `credit_rm` on `/games/`,
> which uses `null` for the same case. Summary keeps the type stable so the FE never has
> to null-check a money field; treat `"0.00"` on Prediction as "not tracked".

Example — all games

`GET /usage-report/summary/?from_date=2026-08-01&to_date=2026-08-31`

```json
{
  "total_active_users": 6,
  "total_sessions": 11,
  "total_tokens_consumed": 66,
  "total_rewards_given": "35.50",
  "avg_session_duration": 156.4,
  "average_session_per_user": 1.83,
  "played_1_game": 3,
  "played_2_games": 3,
  "played_3_games": 0,
  "played_4_plus_games": 0
}
```

Example — Lucky Spin only

`GET /usage-report/summary/?from_date=2026-08-01&to_date=2026-08-31&game=1`

```json
{
  "total_active_users": 4,
  "total_sessions": 5,
  "total_tokens_consumed": 30,
  "total_rewards_given": "0.00",
  "avg_session_duration": 61.2,
  "average_session_per_user": 1.25
}
```

Six keys, not ten — the `played_*` breakdown is gone.

---

# PARTICIPATION

### GET /usage-report/participation/

Leaderboard participation and mission activity for the range. These two blocks used to sit
inside `/summary/`; they were split out because neither has a game dimension, so they would
never respond to the dashboard's game filter. Load this endpoint only on the screens that
show leaderboard or mission figures.

The numbers themselves are unchanged — same fields, same calculations, same range handling.

Query Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| from\_date | Date | Yes | Start of range, inclusive |
| to\_date | Date | Yes | End of range, inclusive |

There is no `game` parameter. A leaderboard is not a game, and missions span all of them.

Response

| Field | Type | Description |
| :--- | :--- | :--- |
| leaderboard | Object | Leaderboard participation for the range (see below) |
| mission | Object | Mission activity for the range (see below) |

Both keys are always present. There are no top-level scalars.

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

`GET /usage-report/participation/?from_date=2026-08-01&to_date=2026-08-31`

```json
{
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

Errors are the shared ones — missing dates, bad format, reversed range, and `401` without a
token.

---

# GAMES

### GET /usage-report/games/

One row per game (or just the selected game), with usage, the **money paid out** (`credit_rm`),
and the new-vs-existing user split. Sort the rows by `unique_players` descending to get the Top
Mini Game ranking (Report 5).

`credit_rm` is the actual money (FREE CREDIT) won, summed over the range. It is `null` for games
that pay no recoverable RM (Prediction only).

**Avatar** (`game=5`) is one row like any other. A *session* is one boss challenge attempt
(`MemberChallengeAttempt`). `tokens_consumed` covers both Avatar token spends — the extra
boss-attempt cost (reason 16) and the discard-equipment cost (reason 15); the daily free
attempt costs nothing. `credit_rm` is the FREE CREDIT paid out by the mystery box the
attempt hands out, and is therefore dated by the **battle**, not by when the box is opened.

Query Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| from\_date | Date | Yes | Start of range, inclusive |
| to\_date | Date | Yes | End of range, inclusive |
| game | Int | No | Restrict to one game (1–5) |

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
| game | Int | 1 = Lucky Spin, 2 = Penalty Kick, 3 = Smash Egg, 4 = Prediction, 5 = Avatar |
| label | Str | Display name |
| unique\_players | Int | Distinct members who played this game in the range |
| sessions | Int | Plays of this game in the range |
| avg\_sessions\_per\_player | Float | `sessions / unique_players` (0 if no players) |
| avg\_session\_duration | Float | Total time (seconds) spent on this game in the range, divided by the number of days in the range - mirrors how `sessions` used to be divided into a per-day figure, but for duration. `0` if no sessions were tracked. See **AVG. SESSION DURATION** below |
| tokens\_consumed | Int | Tokens **spent** to play this game in the range (entry cost) |
| rewards\_given | Int | Count of reward grants (= `sessions`; every play grants an outcome) |
| credit\_rm | Str (Decimal) / null | **Money** (FREE CREDIT) paid out by this game. `null` for games with no recoverable RM (Prediction only) |
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
      "avg_session_duration": 184.5,
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
      "avg_session_duration": 92.0,
      "tokens_consumed": 30,
      "rewards_given": 3,
      "credit_rm": "12.40",
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
| game | Int | No | Restrict to one game (1–5) |

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
| game | Int | 1–5 |
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
| game | Int | No | Restrict the trend to one game (1–5). Omit to combine all games |

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

# MEMBER USAGE HISTORY

### GET /usage-report/members/

One row per **member** who played anything in the range, with the tokens and battle points
they spent, how many times they played, their most played game and the RM they won. This is
the table that replaces the old date-bucketed Daily Activity History.

The date range is a filter over the whole table, not the row unit — every row is a person,
not a day.

Query Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| from\_date | Date | Yes | Start of range, inclusive |
| to\_date | Date | Yes | End of range, inclusive |
| game | Int | No | Restrict to one game (1–5). See **What the game filter scopes** below |
| sort | Str | No | Column to order by. One of `tokens_used`, `battle_point_used`, `sessions`, `avg_session_duration`, `total_rewards`. Default `sessions` |
| direction | Str | No | `High` or `Low` (matches the CRM member list convention). `High` = highest first (default), `Low` = lowest first |
| page | Int | No | Default `1` |
| page\_size | Int | No | Default `20`, max `100` |

Response

| Field | Type | Description |
| :--- | :--- | :--- |
| count | Int | Total members in the range (before paging) |
| next | Str / null | URL of the next page, or `null` |
| previous | Str / null | URL of the previous page, or `null` |
| results | List | One object per member on this page (below) |

Each item in `results`

| Field | Type | Description |
| :--- | :--- | :--- |
| no | Int | 1-based position in the **complete sorted set**, not within the page. Page 2 at `page_size=20` starts at `21` |
| member\_uuid | Str (UUID) | The member, for linking through to their profile |
| phone\_number | Str | `""` when the member has none |
| username | Str | The member's login username |
| station | Str / null | Name of the member's last system. `null` when unset |
| tokens\_used | Int | Tokens **spent playing** in the range (`type = 2`). Never counts tokens won, and never counts non-game spends such as mart redemptions - so this column reconciles with `total_tokens_consumed` |
| battle\_point\_used | Int | Battle points **spent** in the range (`type = 2`). Today that means avatar level-ups |
| sessions | Int | Number of plays in the range. One game log row = one play |
| avg\_session\_duration | Float | Total time (seconds) this member spent across the filtered games in the range, divided by the number of days in the range. `0` if no sessions were tracked. See **AVG. SESSION DURATION** below |
| most\_played\_game | Int / null | Game id with the highest play count. Ties go to the lower id |
| most\_played\_game\_label | Str / null | Display name for `most_played_game` |
| total\_rewards | Str (Decimal) | RM (FREE CREDIT) won in the range, summed across games |

Example

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "no": 1,
      "member_uuid": "9b1e6d5c-4a2f-4c1e-8f3a-7d2b5e9a0c11",
      "phone_number": "0121234567",
      "username": "ahmad92",
      "station": "Kingdom",
      "tokens_used": 1240,
      "battle_point_used": 300,
      "sessions": 42,
      "avg_session_duration": 143.2,
      "most_played_game": 1,
      "most_played_game_label": "Lucky Spin",
      "total_rewards": "85.00"
    },
    {
      "no": 2,
      "member_uuid": "3c2a1b09-8877-4d6e-9a5b-112233445566",
      "phone_number": "0139876543",
      "username": "siti_r",
      "station": "Kingdom",
      "tokens_used": 980,
      "battle_point_used": 0,
      "sessions": 17,
      "avg_session_duration": 61.0,
      "most_played_game": 3,
      "most_played_game_label": "Smash Egg",
      "total_rewards": "42.50"
    }
  ]
}
```

### Sorting

Sorting happens on the server across the **complete filtered set**, then the result is paged.
Selecting a sort therefore reorders every member in the range, not just the rows currently on
screen. `no` is assigned after sorting, so it keeps counting across pages.

`direction=High` (default) sorts highest to lowest; `direction=Low` sorts lowest to highest.
If `sort` is omitted, `direction` still applies to the default `sessions` ordering.

Ties are broken by username then member uuid (always ascending, regardless of `direction`),
so paging is stable between requests.

### What the game filter scopes

`?game=N` narrows some columns and leaves others alone:

| Column | With `?game=N` |
| :--- | :--- |
| Which members appear | Only members who played **that** game |
| sessions | Plays of that game only |
| avg\_session\_duration | Follows `sessions`, so that game only |
| total\_rewards | RM won in that game only |
| tokens\_used | That game's token reasons only (already games-only without the filter) |
| battle\_point\_used | **Unchanged** — always MRS-wide |
| most\_played\_game | **Unchanged** — always across all games |

`battle_point_used` ignores the filter because no mini-game charges battle points. They are
spent on avatar level-ups, so scoping them to "Lucky Spin" would always return `0`.
`most_played_game` ignores it because it describes the member, not the filter — it stays
useful as context when you are looking at a single game.

### Errors

`400` — same validation as the other endpoints, plus:

```json
{ "error": "Invalid request", "details": "sort must be one of: tokens_used, battle_point_used, sessions, avg_session_duration, total_rewards" }
```

### Notes

* **Avg. Session Duration (`avg_session_duration`)** is a real duration now, in seconds. It
  is computed from `GameSession` rows (`apps/front_view`), fed by a client heartbeat, not
  from game log timestamps. See **AVG. SESSION DURATION** below.
* **There is no Total Withdrawal column.** Withdrawal figures were deliberately left out of
  this module.
* Query cost is fixed, not per member: two grouped queries per game plus one each for
  tokens, battle points, session duration and member details. The same number of queries
  whether the range holds 5 members or 5,000.

---

# LIMITATIONS

* **Lucky Spin wins from before this field was added are not counted.** `LuckySpinLog` only
  gained a `won_amount` column once Usage Report needed it; spins logged before that
  migration have no amount on the row and are excluded from `credit_rm` /
  `total_rewards_given` for those older dates. Reporting periods starting after the
  migration date are complete.
* `credit_rm` distinguishes two kinds of `null`/zero: `null` means the game tracks no
  recoverable RM (Prediction only); `"0.00"` means the game tracks RM but paid out nothing
  in the range.
* **`sessions` is still a play count, not a duration.** One game log row = one play. That
  figure is unrelated to `avg_session_duration`, which is measured separately (see below).
* This module itself is still read-only: no models, no migrations, no writes of its own, and
  no changes to any game's runtime flow. `avg_session_duration` is the one field it now
  reads from outside its own app - `GameSession` rows written by `apps/front_view`.

---

# AVG. SESSION DURATION

`avg_session_duration` (on both `/games/` and `/members/`) is measured from `GameSession`
rows in `apps/front_view`, not derived from game log timestamps. The client sends a
heartbeat while a player is on any of the 5 games:

### POST /front-view/game-sessions/ping/

Requires member auth (same as other member-facing endpoints). Always returns `200 {}` on
success.

| Field | Type | Description |
| :--- | :--- | :--- |
| game | Int | 1 = Lucky Spin, 2 = Penalty Kick, 3 = Smash Egg, 4 = Prediction, 5 = Avatar |
| type | Int | 1 = start, 2 = heartbeat, 3 = end |

* `type=1` opens a new session (start time = `created`, via `TimeStampedModel`). If a `start`
  arrives within `GAME_SESSION_RESUME_WINDOW` (120s, `apps/front_view/choices.py`) of the
  same game's last heartbeat, it continues that session instead of opening a new one.
* **A member can only have one open session at a time.** If `type=1` arrives for a
  different game than the one currently open (i.e. not a resume), that other open session
  is closed first - `ended_at` set to its own last heartbeat - before the new one starts.
  This mirrors reality: a player can't be actively in two games at once, so opening one
  ends whatever else was open.
* `type=2` should be sent periodically (well under 120s) while the player stays on the game;
  it just updates the session's `last_seen_at`.
* `type=3` closes the session immediately and is the accurate way to end one - but it is
  best-effort (the client may not always be able to fire it, e.g. a killed tab). It has no
  minimum-time assumption: an `end` seconds after `start` closes with an accurate short
  duration. If `end` never arrives, the session's effective end is simply its last
  heartbeat, so duration is still bounded without any backend timeout/cleanup job.
* Concurrency-safe: a DB-level partial unique index allows at most one open session per
  `(member, game)`; a race between two simultaneous `start`/heartbeat calls falls back to
  updating whichever row won, instead of erroring or creating a duplicate.
* Per-session length = `(ended_at or last_seen_at) - created`. The reported field sums
  those across all sessions in the range, then divides by the number of days in the
  range (same as the old `sessions / days` pattern, applied to total duration instead of
  play count). A one-day filter divides by 1, so the total comes back unchanged.
* **The Reward Report KPI depends on a backfill.** `MemberReward.amount` was added after
  those rows already existed, so historic Credit rows carry `NULL` until
  `python manage.py backfill_reward_amount` has been run. `SUM` skips `NULL` without
  error, so an un-backfilled database reports a total that is too low and looks correct.
  Deploy order is: migrate, dry-run the backfill, review, then `--apply`.

---

# REWARD REPORT KPI

Base path: `/member/`, **not** `/usage-report/`. This endpoint lives in the members app
and is documented here for convenience — it is the summary card row above the existing
Reward Report table, not part of the read-only usage report module.

Covers requirement rows 38–43.

### GET /member/reward-report-kpi/

The two totals shown above the Reward Report table. They are calculated over **every
record matching the current filters**, not just the rows on the visible page.

Requires JWT authentication (`IsAuthenticated`).

Query Parameters

Identical to `GET /member/reward-report/` (the table), so the frontend sends one filter
set to both and the numbers can never disagree.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| start\_date | Date | No | Start of range, inclusive (`YYYY-MM-DD`). Must be sent with `end_date` |
| end\_date | Date | No | End of range, inclusive (`YYYY-MM-DD`). Must be sent with `start_date` |
| category | Int | No | `1` Prize, `2` Credit, `3` Token |
| reward\_details | Str | No | Case-insensitive contains |
| reward\_name | Str | No | Case-insensitive contains |
| username | Str | No | Case-insensitive contains, on the third-party account id |
| phone\_number | Str | No | Case-insensitive contains |
| station\_uuid | UUID | No | Exact match on the member's station |

Every supplied filter is combined with AND. Sending five filters narrows on all five.

Response

| Field | Type | Description |
| :--- | :--- | :--- |
| total\_credit\_amount | Str (Decimal) | Ringgit paid out, summed over **Credit** rows only. Always 2 decimal places |
| total\_prizes\_claimed | Int | **Count** of Prize rows. Physical items have no monetary value, so they are counted, never summed |

Both keys are always present, whichever category is selected — that is requirement 43,
so the frontend can render one card or both without a second request.

Example

`GET /member/reward-report-kpi/?start_date=2026-08-01&end_date=2026-08-31&category=2`

```json
{
  "total_credit_amount": "13.70",
  "total_prizes_claimed": 10
}
```

### Date range

`start_date` and `end_date` must be sent **together** — one alone is a `400`. Without that
rule a half-filled date picker would silently return all-time totals with a `200`.

The range covers whole days in **Asia/Kuala_Lumpur**: from `00:00:00.000000` on
`start_date` through `23:59:59.999999` on `end_date`. Both ends are inclusive.

**If no dates are sent, no date filter is applied** and the totals cover every record.
Defaulting to the current month is handled by the frontend.

### What each category contributes

| Category | total\_credit\_amount | total\_prizes\_claimed |
| :--- | :--- | :--- |
| `2` Credit | Its `amount` is summed | — |
| `1` Prize | — | Counted |
| `3` Token | — | — |

Token rewards (leaderboard token payouts) belong to neither total. They are not money and
not a physical item. Before this was fixed they were filed as Credit, which would have
added token counts to the ringgit figure.

### Errors

`400`

```json
{ "error": "Invalid request", "details": "start_date and end_date must be given together" }
{ "error": "Invalid request", "details": "Invalid date format, use YYYY-MM-DD" }
{ "error": "Invalid request", "details": "start_date must be before or equal to end_date" }
{ "error": "Invalid request", "details": "category must be an integer" }
{ "error": "Invalid request", "details": "station_uuid must be a valid UUID" }
```

`401` — missing or invalid JWT.

### Notes

* **Credit rows with no `amount` contribute nothing.** `MemberReward.amount` was added
  after the fact; rows written before it exist with `amount = NULL` and `SUM` skips them
  silently. Run `python manage.py backfill_reward_amount` after migrating, or the total
  will be quietly too low with no error to indicate it. See LIMITATIONS.
* One database query. Both figures come from a single pass of conditional aggregates, so
  the cost is the same whether the filter matches 100 rows or a million.
* The response is deliberately limited to these two fields, matching the approved design.

---

# MEMBER LIST — BATTLE POINTS

Base path: `/member/`. Covers requirement row 44.

### GET /member/member-list/

One field was added to the existing endpoint. Everything else is unchanged.

| Field | Type | Description |
| :--- | :--- | :--- |
| current\_bp | Int | The member's current Battle Point balance, returned directly after `current_tokens` |

```json
{
  "vip_tier": "UNIVERSE",
  "current_tokens": 100,
  "current_bp": 10,
  "registered_datetime": "2026-05-20T07:35:00+08:00"
}
```

### Notes

* There is no stored battle point balance. Like tokens, it is a ledger: the most recent
  `SET` entry forms a baseline, then earns are added and spends subtracted from the
  entries after it. `current_bp` calls the same
  `apps.avatar.helper_functions.get_current_battle_points()` used by the avatar profile
  endpoint, so the member list and the app can never show different numbers.
* The field is named `current_bp` here while the avatar endpoint returns the same value as
  `current_battle_points`. Two names, one number.
* Both `current_tokens` and `current_bp` are computed per row, so a page costs roughly
  4 queries per member. Fine at the default page size of 20; worth folding into the
  queryset if the page size is raised.

---

# MISSION PROMOTION

Base path: `/mission/`. Covers requirement rows 2–18 (MRS Mission Promotion Pop-up).

A **Promotion** is an optional, admin-configured deposit campaign attached to exactly one
**Mission** (`OneToOneField`). Most missions have none. When a member claims a mission that
has an active, eligible promotion, a pop-up is shown asking them to deposit; once they do,
the reward is credited automatically — no further member action required.

## Choices

### Deposit Mode (`deposit_mode`)

| ID | Meaning |
| ---: | :--- |
| 1 | Single Deposit — count of individual deposits each `>= deposit_amount`, must reach `deposit_times` |
| 2 | Accumulated Deposit — sum of all deposits (any size) must reach `deposit_amount`; `deposit_times` is ignored |

### Limit Type (`display_frequency_type` / `claim_limit_type` — same choice set, two independent uses)

| ID | Meaning |
| ---: | :--- |
| 1 | Once per member |
| 2 | Once per member per day |
| 3 | Limited times during the promotion period — requires `display_frequency_limit` / `claim_limit_value` |

### Reward Type (`reward_type`)

| ID | Meaning |
| ---: | :--- |
| 1 | Token |
| 2 | Battle Point |

### Station (`eligibility_stations` — a fixed enum, not a live lookup of `Station` rows)

| ID | Brand | Station.domain |
| ---: | :--- | :--- |
| 1 | N1GANG | n1gang |
| 2 | KGAME99 | kgame99 |
| 3 | EP369 | ep369 |
| 4 | ACEBET77 | acebet77 |
| 5 | UBETCLUB | ubetclub |
| 6 | LV918 | lv918 |

### Weekday (`days_of_week`)

Monday = 1 ... Sunday = 7. Empty list means every day.

---

## Admin

### GET /mission/missions/{mission_uuid}/promotion/

Retrieve the promotion attached to a mission. **400** if none exists.

```json
{
  "uuid": "...", "mission_uuid": "...", "mission_name": "Daily Deposit RM100",
  "enabled": true,
  "start_date": "2026-09-01T00:00:00Z", "end_date": "2026-09-30T23:59:59Z",
  "days_of_week": [1, 2, 3, 4, 5], "daily_start_time": "09:00:00", "daily_end_time": "17:00:00",
  "banner_image": "https://.../mission_promotion/xxxx.png",
  "content_text": "Deposit RM200 & Get Extra 50 Tokens",
  "deposit_amount": "200.00", "deposit_times": 1, "deposit_mode": 1,
  "display_frequency_type": 2, "display_frequency_limit": null,
  "claim_limit_type": 1, "claim_limit_value": null,
  "reward_type": 1, "reward_amount": 50,
  "eligibility_stations": [1, 4],
  "eligibility_wallet_vip_tiers": ["uuid1"], "eligibility_mrs_tiers": ["uuid2"],
  "archived": null
}
```

### PATCH /mission/missions/{mission_uuid}/promotion/

Create or update (upsert on whether one already exists for this mission). Despite the verb,
this is **not a partial update** — every required field must be sent on every call, including
updates. Same convention as the existing `Mission` update endpoint.

Request — same shape as the GET response, plus these two swapped for write:

```json
{
  "eligibility_wallet_vip_tier_uuids": ["uuid1"],
  "eligibility_mrs_tier_uuids": ["uuid2"],
  "...rest": "same fields as the GET response above (enabled, start_date, end_date, days_of_week, daily_start_time, daily_end_time, banner_image, content_text, deposit_amount, deposit_times, deposit_mode, display_frequency_type, display_frequency_limit, claim_limit_type, claim_limit_value, reward_type, reward_amount, eligibility_stations)"
}
```

Validation (**400**):

* `end_date` before `start_date`
* `daily_end_time` before or equal to `daily_start_time`
* `display_frequency_type == 3` without `display_frequency_limit`
* `claim_limit_type == 3` without `claim_limit_value`

### PATCH /mission/missions/{mission_uuid}/promotion/archive/

Soft-delete. Same response shape as GET, with `archived` now set.

---

## Member

### POST /mission/missions/{mission_uuid}/claim/ (extended)

The existing claim endpoint now returns one extra field:

| Field | Type | Description |
| :--- | :--- | :--- |
| promotion\_available | Bool | Whether this mission has an active, in-window, eligible promotion for this member right now. Does **not** create a participation record or schedule the recheck task — it's a lightweight signal telling the frontend whether to call `promotion/check/` next |

```json
{
  "uuid": "...", "mission_name": "...", "mission_uuid": "...", "category": 1,
  "token_amount": 5, "battle_point_amount": 0, "created": "...",
  "promotion_available": true
}
```

### GET /mission/missions/{mission_uuid}/promotion/check/

Call this when `promotion_available` is `true`. Runs the full eligibility chain (schedule
window → station/wallet-tier/MRS-tier eligibility → display-frequency cap), creates the
per-member participation record on first call, and schedules the deposit recheck task. The
frontend decides which pop-up scenario to render from `wallet_balance` — the backend does not
make that call.

```json
{
  "banner_image": "https://.../xxxx.png",
  "content_text": "Deposit RM200 & Get Extra 50 Tokens",
  "deposit_amount": "200.00", "deposit_times": 1, "deposit_mode": 1,
  "reward_type": 1, "reward_amount": 50,
  "wallet_balance": "0.00",
  "participation_uuid": "..."
}
```

Returns `null` (still **200**) if there's nothing to show — no promotion, disabled, outside
its schedule window, member not eligible, already completed/expired, or the display-frequency
cap has been reached.

`wallet_balance` is the member's live balance on their **current station**
(`member.last_system`) — matching the same station every other reward-crediting flow in this
codebase uses, not a cross-station total. Fetched via the third-party platform
(`get_player_details`), same call the `GetMemberWallet` endpoint uses internally.

**How the frontend picks the scenario** — the API does not return a `scenario` field; derive
it from `wallet_balance`:

* `wallet_balance == "0.00"` → **Scenario 1 (eligible)**. Render `banner_image` +
  `content_text` from this response (e.g. "Deposit RM200 & Get Extra 50 Tokens") with
  **Unlock Reward** (→ Deposit page) and **Skip** (→ close) buttons.
* `wallet_balance > "0.00"` → **Scenario 2 (not yet eligible)**. Render the fixed message
  "Clear your wallet balance to unlock this reward." with **Clear Now** (→ NS Wallet Profile)
  and **Skip** (→ close) buttons.

`banner_image` and `content_text` only apply to Scenario 1 — admin configures a banner/image
for the deposit-CTA pop-up alone. Scenario 2's copy is **fixed system text, not
admin-configurable**; there is no equivalent content field for it anywhere in this API. Do not
use `banner_image`/`content_text` when rendering Scenario 2 — ignore them in that branch.

### GET /mission/promotions/pending-completions/

Promotions this member has qualified for (reward already auto-credited) that haven't been
acknowledged yet. Call this when the member opens the Mission page and show a "Mission
Completed" pop-up for each row returned.

```json
[
  {
    "uuid": "...", "mission_uuid": "...", "mission_name": "...",
    "reward_type": 1, "reward_amount": 50,
    "completed_at": "2026-09-02T10:00:00Z"
  }
]
```

### PATCH /mission/promotions/{participation_uuid}/acknowledge/

The "Got It" button. Marks the completion pop-up as seen — the participation stops appearing
in `pending-completions`. **400** if the participation hasn't been completed yet.

**Completion pop-up copy**: same as Scenario 2, this is **fixed system text, not
admin-configurable** — there is no content field for it anywhere in this API. Render it from
`reward_type` / `reward_amount` on the `pending-completions` row, e.g. "Mission Completed! You
earned 50 Tokens — auto-credited to your account." with a **Got It** button that calls
`acknowledge`.

---

## Notes

* **Eligibility logic**: empty on `eligibility_stations` / `eligibility_wallet_vip_tiers` /
  `eligibility_mrs_tiers` means "applies to all" for that dimension. If **both**
  `eligibility_wallet_vip_tiers` and `eligibility_mrs_tiers` are set, the member must satisfy
  **both** (AND), not either.
* **Deposit crediting is asynchronous, not real-time**: a Celery task
  (`check_promotion_completion`) rechecks every 12 hours from when the participation was
  created, until either the deposit requirement is met (reward credited, `completed_at` set)
  or `end_date` passes (`expired_at` set, no reward). It is not triggered by the deposit
  webhook directly.
* Only successful deposits count toward the requirement — `MemberDeposit` rows only ever
  exist for webhook-validated successful deposits, so failed/pending/cancelled ones are
  already excluded with no extra filtering needed.
* **Claim limit enforcement**: `claim_limit_type` is fully enforced per member per promotion.
  `1` (once per member) allows exactly one completed cycle ever. `2` (once per member per day)
  allows one completed cycle per local calendar day. `3` (limited times during the promotion
  period) allows up to `claim_limit_value` completed cycles total. A member can have multiple
  `MemberPromotionParticipation` rows over time for the same promotion — a new cycle starts
  the next time `promotion/check/` is called after the previous cycle completed (or expired),
  gated by whichever `claim_limit_type` rule applies. An expired, never-completed cycle does
  **not** consume a claim-limit slot — only completions count.
* Reward crediting reason types: Token credits use `reason_type=19` ("MISSION-PROMOTION" in
  `apps.members.choices.REASON_TYPE_CHOICE`); Battle Point credits use `reason_type=12`
  ("MISSION-PROMOTION" in `apps.avatar.choices.BP_REASON_TYPE_CHOICE`) — distinct from a
  regular mission claim's reward (`11` / `2` respectively), so promotion-driven rewards are
  traceable separately from normal mission-claim rewards in reporting.
