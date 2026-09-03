# ENHANCEMENT REQUESTS — BACKEND CONTRACT

Admin-panel enhancements requested 31/08/2026. The frontend for all of them is
already built and merged; each one is waiting on the backend change described below.
Until then the UI degrades cleanly (empty table / `N/A` cells / client-side totals /
absent filter option), so shipping these can happen in any order.

| # | Request | Backend change | Frontend status |
| :--- | :--- | :--- | :--- |
| 1 | Member Usage History table | **New endpoint** `GET /usage-report/members/` | Built; renders an empty state until the endpoint answers |
| 2 | Reward Report totals | *Optional* — two aggregate fields on `/member/reward-report/` | Built; computes the totals client-side meanwhile |
| 3 | Member List battle points | **New field** `current_battle_points` on `/member/member-list/` | Built; column reads `N/A` until the field arrives |
| 4 | Usage Report — Avatar as a game | **New game id `5`** across the `/usage-report/` module | Built; the filter builds itself from the API, so Avatar appears with no release |
| 5 | Usage Report — Total Withdrawal card | **New field** `total_withdrawal` on `/usage-report/summary/` | Built; card reads `N/A` until the field arrives |
| 6 | Usage Report — Avg. Session Duration card | **New field** `avg_session_duration` on `/usage-report/summary/` **and** each `/usage-report/games/` row | Built; card reads `N/A` until the fields arrive |

---

# 1. MEMBERS

### GET /usage-report/members/

One row per member who was active in the range, replacing the day-bucketed
"Daily Activity History" table on the Usage Report page. Follows every convention
already established in [usgae_report.md](./usgae_report.md): `from_date` / `to_date`
required and inclusive, standard paginated envelope, Asia/Kuala_Lumpur bucketing,
money as 2dp decimal strings.

Query Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| from\_date | Date | Yes | Start of range, inclusive (`YYYY-MM-DD`) |
| to\_date | Date | Yes | End of range, inclusive |
| game | Int | No | Restrict to one game (1–4), same semantics as the other endpoints |
| page | Int | No | Default `1` |
| page\_size | Int | No | Default `20`, max `100`. The UI requests `10` |
| ordering | Str | No | See **Ordering** below. Default `-tokens_used` |

Response — standard envelope (`count`, `next`, `previous`, `results`).

Each item in `results`

| Field | Type | Description |
| :--- | :--- | :--- |
| uuid | UUID | Member uuid (used as the row key) |
| phone\_number | Str | |
| username | Str / null | |
| station | Str / null | Station name |
| tokens\_used | Int | Tokens spent on mini-games in the range |
| battle\_points\_used | Int | Battle points spent in the range (avatar level-ups, challenges) |
| avg\_session\_duration | Int | **Seconds.** Member's total time in MRS ÷ member's total MRS sessions, over the range, across all mini-games. `null` if not measurable |
| most\_played\_game | Int / null | Game id 1–4, the member's most-played game in the range. `null` if none. A `most_played_game_label` string is also accepted and preferred if sent |
| total\_rewards | Str (Decimal) / null | Total RM rewarded to this member in the range |
| total\_withdrawal | Str (Decimal) / null | Total RM withdrawn by this member in the range |

**Avg. session duration** is the one figure with no existing source — nothing in MRS
currently records session start/end. Defining what counts as a session (and persisting
it) is part of this request; if a first cut has to omit it, send `null` and the column
renders `N/A` rather than a wrong number.

### Ordering

`ordering` takes a field name, `-` prefixed for descending, matching DRF's
`OrderingFilter` convention. The five sortable columns are the ones the spec calls out:

```
tokens_used  battle_points_used  avg_session_duration  total_rewards  total_withdrawal
```

Sorting must apply to the **whole filtered set**, not the page — the UI pages
server-side and never re-sorts locally. Clicking a column header opens on descending
(highest to lowest), clicking again flips to ascending.

Example

```json
{
  "count": 137,
  "next": "…?page=2",
  "previous": null,
  "results": [
    {
      "uuid": "0b3f…",
      "phone_number": "60112233440",
      "username": "player0",
      "station": "LV918",
      "tokens_used": 900,
      "battle_points_used": 480,
      "avg_session_duration": 1300,
      "most_played_game": 1,
      "total_rewards": "120.50",
      "total_withdrawal": "2400.75"
    }
  ]
}
```

---

# 2. REWARD REPORT TOTALS

### GET /member/reward-report/ — two extra envelope fields

The report needs a **Total Credit Amount** and a **Total Prizes Claimed** covering every
record matching the current filters, not just the visible page.

| Field | Type | Description |
| :--- | :--- | :--- |
| total\_credit\_amount | Str (Decimal) | Sum of the RM on `category = Credit` rows across the whole filtered set |
| total\_prizes\_claimed | Int | Count of `category = Prize` rows across the whole filtered set (physical prizes have no amount to sum) |

Both must honour every filter already applied (`start_date` / `end_date`, `category`,
`reward_details`, `reward_name`, `username`, `phone_number`, `station_uuid`), and must be
identical on every page of the same query.

**This is an optimisation, not a blocker.** The frontend already produces both numbers by
paging the filtered set at `page_size=100` and summing client-side — it parses the RM out
of `reward_details` — and it stops after 5,000 records, marking the total `≥`. It checks
for `total_credit_amount` / `total_prizes_claimed` on the first response and, if either is
present, uses them and skips the sweep entirely. So adding the fields turns ~3 requests
into 1 and removes the cap, with no frontend change needed.

With no date filter the frontend scopes the totals to the current calendar month
(per the spec) and captions the panel with the period it used.

---

# 3. MEMBER LIST — CURRENT BATTLE POINTS

### GET /member/member-list/ — one extra row field

| Field | Type | Description |
| :--- | :--- | :--- |
| current\_battle\_points | Int | The member's current battle point balance, alongside the existing `current_tokens` |

Same treatment as `current_tokens`: present on both the list and the single-member
detail response. The frontend reads `current_battle_points`, falling back to
`battle_points` / `current_battle_point`, and shows `N/A` while none of them exist.

---

# 4. USAGE REPORT — AVATAR AS A GAME

Avatar (Phase 3 planet RPG, `/avatar/`) is live but absent from every Usage Report
figure. It needs to join the game enum in [usgae_report.md](./usgae_report.md) as
**id 5**, which covers all three places the client asked about at once:

| Where | What appears | Endpoint |
| :--- | :--- | :--- |
| Game filter dropdown | An "Avatar" option | `/usage-report/games/` (the row is what the option is built from) |
| Game Performance table | An Avatar row | `/usage-report/games/` |
| Cohort Retention | An Avatar card | `/usage-report/games/retention/` |

So the change is:

1. Add `5 = Avatar` to the game choices, with `label: "Avatar"`.
2. Return an Avatar row from `/usage-report/games/` and `/usage-report/games/retention/`
   — **including when it has no activity**, exactly as Prediction does today (a
   zero row, not an omitted one).
3. Accept `game=5` on `/games/`, `/games/retention/`, `/insights/` and
   `/members/`. The validation message becomes `game` not 1–**5**.

**No frontend release is needed for any of this.** The filter's options, the table
rows and the retention cards are all built from `results`, so Avatar appears the
moment the backend returns it. The frontend deliberately does *not* hardcode id 5
into the dropdown — offering an id the API rejects would 400 the whole page.

### What counts as an Avatar "session"

Avatar has no single "play" the way a spin or a kick is one. The mapping that matches
how the other four games are counted:

| Usage Report field | Avatar source |
| :--- | :--- |
| sessions | Challenge attacks + mystery box opens (the token/battle-point-spending actions) |
| unique\_players | Distinct members with at least one such action in the range |
| tokens\_consumed | Tokens spent on Avatar in the range |
| credit\_rm | RM won from mystery boxes, or `null` if not attributable read-only |

Battle points spent are already reported per-member as `battle_points_used` (§1) and
are **not** part of `tokens_consumed` — keep the two separate.

---

# 5. USAGE REPORT — TOTAL WITHDRAWAL

### GET /usage-report/summary/ — one extra field

The "Tokens Consumed" KPI card has been **replaced** by "Total Withdrawal" at the
client's request. The tokens figure is not lost — it still appears per-game as
`tokens_consumed` in the Game Performance table and as the Tokens series on the
Daily Usage Trend chart.

| Field | Type | Description |
| :--- | :--- | :--- |
| total\_withdrawal | Str (Decimal) / null | Total RM withdrawn by all members in the range |

Scope is the **period, not the game**: the card keeps showing the range-wide figure
when a specific game is selected, because a withdrawal is not attributable to a game.
`/summary/` already ignores the `game` parameter, so no new filtering is needed.

Until the field exists the card renders `N/A` (with no `RM` prefix).

---

# 6. USAGE REPORT — AVG. SESSION DURATION

### GET /usage-report/summary/ and /usage-report/games/ — one extra field each

A new sixth KPI card. Unlike Total Withdrawal, this one **follows the game filter**:

| Selection | Reads from |
| :--- | :--- |
| All Games | `avg_session_duration` on `/usage-report/summary/` |
| A specific game | `avg_session_duration` on that game's `/usage-report/games/` row |

| Field | Type | Description |
| :--- | :--- | :--- |
| avg\_session\_duration | Int / null | **Seconds.** Total time spent ÷ total sessions, over the range. On `/summary/` that is across all games; on a `/games/` row it is that game alone. `null` if not measurable |

The client's stated calculation is *total time spent in the selected game ÷ total
sessions for that game*, which is exactly the per-row form.

**This is the same blocker already flagged in §1**: nothing in MRS records session
start/end, so there is no time-spent source yet. Defining a session and persisting
its duration is the actual work; the three places it is then needed
(`/members/` per member, `/summary/` overall, `/games/` per game) all fall out of
that one change. Send `null` rather than a guess — the card renders `N/A`.
