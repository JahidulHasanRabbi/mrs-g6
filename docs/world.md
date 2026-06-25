# WORLD CUP

Base path: `/worldcup/`

All endpoints require JWT authentication.

---

## Country Reference

Countries are represented as integers. There are two separate country lists with different purposes.

### Leaderboard Countries (10 countries — `COUNTRY_CHOICE`)

Used for: choosing a country affiliation, leaderboard ranking, top-per-country, dummy players.

| ID | Country | Tier |
| --- | --- | --- |
| 1 | Spain | 1 |
| 2 | France | 1 |
| 3 | England | 1 |
| 4 | Argentina | 1 |
| 5 | Portugal | 1 |
| 6 | Brazil | 1 |
| 7 | Germany | 2 |
| 8 | Netherlands | 2 |
| 9 | Norway | 3 |
| 10 | Belgium | 3 |

### Match / Prediction Countries (48 countries — `MATCH_COUNTRY_CHOICE`)

Used for: creating matches (`team_home`, `team_away`, `winner`) and placing predictions (`team`). Full list available via `GET /worldcup/match-country-list/`.

| ID | Country | ID | Country | ID | Country |
| --- | --- | --- | --- | --- | --- |
| 1 | Algeria | 17 | Egypt | 33 | Norway |
| 2 | Argentina | 18 | England | 34 | Panama |
| 3 | Australia | 19 | France | 35 | Paraguay |
| 4 | Austria | 20 | Germany | 36 | Portugal |
| 5 | Belgium | 21 | Ghana | 37 | Qatar |
| 6 | Bosnia and Herzegovina | 22 | Haiti | 38 | Saudi Arabia |
| 7 | Brazil | 23 | Iran | 39 | Scotland |
| 8 | Cabo Verde | 24 | Iraq | 40 | Senegal |
| 9 | Canada | 25 | Uruguay | 41 | South Africa |
| 10 | Colombia | 26 | Japan | 42 | Spain |
| 11 | Congo DR | 27 | Jordan | 43 | Sweden |
| 12 | Croatia | 28 | Korea Republic | 44 | Switzerland |
| 13 | Curacao | 29 | Mexico | 45 | Tunisia |
| 14 | Czechia | 30 | Morocco | 46 | Turkiye |
| 15 | Cote d'Ivoire | 31 | Netherlands | 47 | United States |
| 16 | Ecuador | 32 | New Zealand | 48 | Uzbekistan |

---

## Points & Ranking

`total_points` (and therefore `global_rank` / `country_rank`) for a real member is always:

```
total_points = WorldCupMemberScore.total_points (Penalty Kick "WORLD CUP SCORE" redemptions)
              + deposit points from the campaign window (computed live)
```

- **Deposit points** are converted from `MemberDeposit` amounts with `transaction_date` inside the World Cup campaign window (`WC_CAMPAIGN_PERIOD_START`–`WC_CAMPAIGN_PERIOD_END`, e.g. June 11 – July 19 in production), at a rate of RM10 = 100 points. This is computed fresh on every request, not stored.
- Deposit points count for the **entire campaign window**, even deposits made before the member selected a country - as soon as a member has a `WorldCupMemberScore` row, all of their in-window deposits are included.
- A member must select a country (`/choose-country/`) before they can place predictions, so `total_predictions` / `total_wins` / `current_streak` / `best_streak` only ever accumulate from the join date onward.
- `global_rank` / `country_rank` are recomputed from current data on every request - there is no cached/denormalized rank, so values are always up to date with the latest deposits, kick redemptions, and settled predictions.

---

# USER PAGE

## Country List

### /worldcup/country-list/ GET

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | tier | Int | Yes | Filter by tier. 1 = Tier 1, 2 = Tier 2, 3 = Tier 3 |

Output — **without** `?tier`: grouped by tier

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | tiers | List | No | List of tier objects |
| **1a** | tier | Int | No | Tier number |
| **1b** | count | Int | No | Number of countries in this tier |
| **1c** | countries | List | No | See Country Object below |

Output — **with** `?tier=N`: single tier

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | tier | Int | No |  |
| **2** | count | Int | No |  |
| **3** | countries | List | No | See Country Object below |

Country Object

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No | Country ID (1–10) |
| **2** | name | Str | No | e.g. "Spain" |

---

## Match Country List

### /worldcup/match-country-list/ GET

Returns all 48 FIFA World Cup 2026 countries used for match creation and predictions. Use this to look up team names from their IDs.

Output (list, not paginated)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No | Country ID (1–48) |
| **2** | name | Str | No | e.g. "Argentina" |

---

## World Cup Info

### /worldcup/info/ GET

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | information | Str | No | General world cup information text |
| **2** | terms\_and\_conditions | Str | No | T\&C text (category 5) |

---

## Banners

### /worldcup/banner-list/ GET

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | location | Int | Yes | 1 = Home, 2 = Lobby, 3 = Prediction |

Output (list)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | title | Str | No |  |
| **3** | subtitle | Str | No |  |
| **4** | label\_text | Str | No |  |
| **5** | section\_title | Str | No |  |
| **6** | description | Str | No |  |
| **7** | image | Image | Yes |  |
| **8** | location | Int | No | 1 = Home, 2 = Lobby, 3 = Prediction |
| **9** | location\_display | Str | No | e.g. "HOME" |

---

## Prize Pool

### /worldcup/prize-pool/ GET

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | type | Str | Yes | `prediction`, `top-country`, or `global-top-player` |
| **2** | country | Int | Yes | Filter by country ID (1–10) |

### /worldcup/prize-pool/{uuid}/ GET

Output (both endpoints, single object or list)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | reward\_name | Str | No |  |
| **3** | quantity | Int | No |  |
| **4** | item\_type | Int | No | See Item Type Enum below |
| **5** | item\_type\_display | Str | No | e.g. "PREDICTION" |
| **6** | country | Int | Yes | Country ID. Only for top-country prizes |
| **7** | description | Str | No |  |
| **8** | image | Image | Yes |  |
| **9** | position | Int | Yes | Display order |
| **10** | win\_condition | Int | Yes | Consecutive wins required (prediction prizes) |
| **11** | token\_amount | Int | Yes | Token reward amount (prediction prizes) |

| ID | Item Type |
| --- | --- |
| 1 | PREDICTION |
| 2 | TOP COUNTRY |
| 3 | GLOBAL TOP PLAYER |

**PREDICTION prize delivery** — determined by `token_amount`:
- `token_amount` is set → system automatically credits tokens to the member on match settle
- `token_amount` is null → system logs a `MemberReward` record for staff to fulfil manually (physical prize e.g. Galaxy Buds, phone)

---

## Leaderboard

### /worldcup/leaderboard/countries/ GET

Paginated output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | rank | Int | No |  |
| **2** | country | Int | No | Country ID (1–10) |
| **3** | country\_name | Str | No | e.g. "Brazil" |
| **4** | total\_points | Int | No | Combined real + dummy player data |
| **5** | total\_users | Int | No | Combined real + dummy player data |

### /worldcup/leaderboard/players/ GET

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | country | Int | Yes | Filter by country ID (1–10) |

Paginated output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | global\_rank | Int | No | Rank across the whole board (all countries combined) |
| **2** | country\_rank | Int | No | Rank within the player's own country |
| **3** | player\_name | Str | No |  |
| **4** | country | Int | No | Country ID (1–10) |
| **5** | country\_name | Str | No |  |
| **6** | total\_points | Int | No |  |
| **7** | total\_prediction | Int | No |  |
| **8** | total\_win | Int | No |  |
| **9** | winning\_streak | Int | No |  |

### /worldcup/leaderboard/top-per-country/ GET

Returns the single top player for each country that has at least one player. Not paginated.

Output (list)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | country | Int | No | Country ID (1–10) |
| **2** | country\_name | Str | No |  |
| **3** | player\_name | Str | No |  |
| **4** | total\_points | Int | No |  |

---

## Choose Country

### /worldcup/{member\_uuid}/choose-country/ POST

Can only be called once per member. Cannot be changed after selection.

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | country | Int | No | Country ID (1–10) |

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | player\_name | Str | No |  |
| **2** | country | Int | No | Country ID |
| **3** | country\_name | Str | No |  |
| **4** | total\_points | Int | No | Always 0 on first selection |
| **5** | global\_rank | Int | Yes | Null until member has points |
| **6** | country\_rank | Int | Yes | Null until member has points |
| **7** | total\_predictions | Int | No |  |
| **8** | total\_wins | Int | No |  |
| **9** | current\_streak | Int | No |  |
| **10** | best\_streak | Int | No |  |

---

## Profile

### /worldcup/{member\_uuid}/profile/ GET

Returns null country fields if member has not chosen a country yet.

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | player\_name | Str | No |  |
| **2** | country | Int | Yes | Null if no country chosen |
| **3** | country\_name | Str | Yes | Null if no country chosen |
| **4** | total\_points | Int | No | 0 if no country chosen |
| **5** | global\_rank | Int | Yes | Null if no points yet |
| **6** | country\_rank | Int | Yes | Null if no points yet |
| **7** | total\_predictions | Int | No |  |
| **8** | total\_wins | Int | No |  |
| **9** | current\_streak | Int | No |  |
| **10** | best\_streak | Int | No |  |

---

## Matches

### /worldcup/match-list/ GET

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | status | Str | Yes | `upcoming`, `closed`, or `settled` |

Output (list, ordered by kickoff\_at asc)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | group\_label | Str | No | e.g. "GROUP A" |
| **3** | team\_home | Int | No | Country ID (1–48) |
| **4** | team\_away | Int | No | Country ID (1–48) |
| **5** | kickoff\_at | Datetime | No |  |
| **6** | status | Int | No | 1 = Upcoming, 2 = Closed, 3 = Settled |
| **7** | status\_display | Str | No | e.g. "UPCOMING" |
| **8** | winner | Int | Yes | Country ID (1–48). Null when not yet settled **or** when the result is a draw. To tell draw from unsettled: check `status == 3 && winner == null` |
| **9** | settled\_at | Datetime | Yes | Null until settled |

### /worldcup/match-list/{match\_uuid}/ GET

Same output as single match object above.

---

## Predictions

### /worldcup/{member\_uuid}/predict/ POST

Requires member to have chosen a country. Requires Total Points (Penalty Kick points + campaign deposit points) ≥ required points, where required points = `WC_PREDICTION_BASE_REQUIRED_POINTS` (3000) + (`current_loss_streak` × `WC_PREDICTION_LOSS_PENALTY_POINTS` (500)) — i.e. each consecutive lost prediction raises the bar by 500 points. Cannot predict on a closed or settled match or after kickoff.

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | match\_uuid | UUID | No |  |
| **2** | team | Int | No | **0 = Draw** or Country ID (1-48, from match country list). Country ID must be one of the two teams in the match |

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No | Prediction UUID |
| **2** | match\_uuid | UUID | No |  |
| **3** | predicted\_team | Int | No | Country ID |
| **4** | predicted\_team\_name | Str | No |  |
| **5** | state | Int | No | 1 = Pending |
| **6** | state\_display | Str | No | "PENDING" |
| **7** | created | Datetime | No |  |

### /worldcup/{member\_uuid}/predictions/ GET

Paginated list of all the member's predictions, ordered by created desc.

Output (paginated)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | match\_uuid | UUID | No |  |
| **3** | match\_status | Int | No | 1/2/3 |
| **4** | match\_status\_display | Str | No |  |
| **5** | match\_kickoff\_at | Datetime | No |  |
| **6** | team\_home | Int | No | Country ID (1–48) |
| **7** | team\_away | Int | No | Country ID (1–48) |
| **8** | winner | Int | Yes | Country ID (1–48). Null when unsettled or draw |
| **9** | predicted\_team | Int | No | Country ID (1–48) |
| **10** | state | Int | No | See State Enum below |
| **11** | state\_display | Str | No |  |
| **12** | settled\_at | Datetime | Yes |  |
| **13** | created | Datetime | No |  |

| ID | Prediction State |
| --- | --- |
| 1 | PENDING |
| 2 | WIN |
| 3 | LOSE |
| 4 | DRAW (defined on the model; never assigned by the Settle endpoint — see below) |

### /worldcup/{member\_uuid}/matches/{match\_uuid}/my-prediction/ GET

Returns the member's prediction for a specific match, or `null` data if the member has not predicted for this match.

Output — same shape as single prediction object from `/predictions/` above, or `null`.

### /worldcup/{member\_uuid}/match-predictions/ GET

Lightweight map of all the member's predictions — useful for checking which matches the member has already predicted on.

Output (list, not paginated)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | prediction\_uuid | UUID | No |  |
| **2** | match\_uuid | UUID | No |  |
| **3** | predicted\_team | Int | No | Country ID (1–48) the member picked |
| **4** | predicted\_team\_name | Str | No | e.g. "Argentina" |
| **5** | state | Int | No | 1 = PENDING, 2 = WIN, 3 = LOSE, 4 = DRAW |
| **6** | state\_display | Str | No |  |

### /worldcup/{member\_uuid}/prediction-status/ GET

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | eligible | Bool | No | True if total\_points ≥ required\_points |
| **2** | total\_points | Int | No | Combined Total Points (Penalty Kick points + campaign deposit points) |
| **3** | required\_points | Int | No | `WC_PREDICTION_BASE_REQUIRED_POINTS` (3000) + (current\_loss\_streak × `WC_PREDICTION_LOSS_PENALTY_POINTS` (500)) |
| **4** | current\_loss\_streak | Int | No | Consecutive lost predictions; raises required\_points by 500 each |
| **5** | current\_streak | Int | No |  |
| **6** | best\_streak | Int | No |  |
| **7** | total\_predictions | Int | No |  |
| **8** | total\_wins | Int | No |  |

---

---

# BACK OFFICE

## World Cup Settings

### /worldcup/settings/ GET

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | maintenance_mode | Bool | No | false = Maintenance OFF, true = Maintenance ON |

### /worldcup/settings/ POST

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | maintenance_mode | Bool | Yes | false = Maintenance OFF, true = Maintenance ON |

---

## Banners (Admin)

### /worldcup/banners/ GET

### /worldcup/banners/{uuid}/ GET

Output — same as Banner Object (see User Page — Banners).

### /worldcup/banners/ POST

### /worldcup/banners/{uuid}/ PUT (partial supported)

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | title | Str | No (create) / Yes (update) |  |
| **2** | subtitle | Str | Yes |  |
| **3** | label\_text | Str | Yes |  |
| **4** | section\_title | Str | Yes |  |
| **5** | description | Str | Yes |  |
| **6** | image | Image | Yes |  |
| **7** | location | Int | Yes | 1 = Home, 2 = Lobby, 3 = Prediction |

### /worldcup/banners/{uuid}/archive/ PATCH

---

## Reward Items

### /worldcup/reward-items/ GET

### /worldcup/reward-items/{uuid}/ GET

Query Parameters (list only)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | type | Int | Yes | 1 = Prediction, 2 = Top Country, 3 = Global Top Player |
| **2** | country | Int | Yes | Filter by country ID (1–10) |

Output — same as Prize Pool Object (see User Page — Prize Pool).

### /worldcup/reward-items/ POST

### /worldcup/reward-items/{uuid}/ PUT (partial supported)

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | reward\_name | Str | No (create) / Yes (update) |  |
| **2** | quantity | Int | Yes | Default 0 |
| **3** | item\_type | Int | No (create) / Yes (update) | 1 = Prediction, 2 = Top Country, 3 = Global Top Player |
| **4** | country | Int | Yes | Country ID (1–10). Use for Top Country prizes |
| **5** | description | Str | Yes |  |
| **6** | image | Image | Yes |  |
| **7** | position | Int | Yes | Display order. For Global Top Player items, also the rank slot (e.g. 1 = 1st place) |
| **8** | win\_condition | Int | Yes | Consecutive wins required (prediction prizes) |
| **9** | token\_amount | Int | Yes | Token reward for prediction prizes |

### /worldcup/reward-items/{uuid}/archive/ PATCH

---

## Global Top Player Reward Distribution (Automatic)

Global Top Player rewards (item\_type = 3) are granted automatically by a periodic
background task (`distribute_global_top_player_rewards`, run via the
`run_global_top_player_reward_task` management command) - there is no claim
endpoint for members.

- Each `WorldCupRewardItem` with `item_type = 3` defines a `position` (rank
  slot, e.g. 1, 2, 3 for 1st/2nd/3rd place).
- Ranking for eligibility is computed from **real members only**
  (`WorldCupDummyPlayer` entries are excluded and never receive rewards).
- A member qualifies for a reward item once their global rank reaches
  `<= position` **at any point** - this is a one-time milestone (ratchet):
  if the member later drops in rank, the reward is not revoked, and it is
  never paid out twice for the same member/reward item. This is tracked via
  an internal `WorldCupRewardClaim` record (member + reward item, unique).
- Delivery follows the same rule as prediction prizes: `token_amount` set →
  tokens are credited automatically (`MemberToken`, reason "WORLDCUP-TOP-PLAYER");
  `token_amount` null → a `MemberReward` (category "Prize") is logged for staff
  to fulfil manually.
- Top Country (item\_type = 2) rewards are **not** automated and remain
  manually administered.

---

## Matches (Admin)

### /worldcup/matches/ GET

### /worldcup/matches/{uuid}/ GET

Query Parameters (list only)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | status | Int | Yes | 1 = Upcoming, 2 = Closed, 3 = Settled |

Output — same as Match Object (see User Page — Matches).

### /worldcup/matches/ POST

### /worldcup/matches/{uuid}/ PUT (partial supported)

Cannot edit a settled match (status = 3).

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | team\_home | Int | No (create) / Yes (update) | Country ID (1–48, from match country list). Must differ from team\_away |
| **2** | team\_away | Int | No (create) / Yes (update) | Country ID (1–48, from match country list). Must differ from team\_home |
| **3** | group\_label | Str | Yes | e.g. "GROUP A" |
| **4** | kickoff\_at | Datetime | No (create) / Yes (update) |  |
| **5** | status | Int | Yes | 1 = Upcoming, 2 = Closed. Default 1. Cannot set to 3 via this endpoint |

### /worldcup/matches/{uuid}/archive/ PATCH

Cannot archive a match that has pending predictions (state = 1).

### /worldcup/matches/{uuid}/settle/ POST

Transitions match from Closed (2) to Settled (3). Cannot settle an Upcoming (status = 1) match or a match already settled.

On settle the system automatically:
- Marks all pending predictions WIN or LOSE. A prediction is a WIN when `predicted_team` matches the settled result — either the winning team, or `0` (Draw) when the match itself ends in a draw.
- Updates each member's streak, total\_wins, and best\_streak on a WIN
- Increments `current_loss_streak` on a LOSE (resets to 0 on a WIN) — each consecutive loss raises the points required for future predictions by 500
- Awards streak prizes on win: token prizes → credited immediately; physical prizes → logged as MemberReward for staff fulfilment
- **Draw result**: members who predicted Draw are scored WIN (streak/prizes apply as normal); members who predicted a team are scored LOSE (their `current_loss_streak` increments same as any other loss). State 4 (DRAW) is defined on the model but is never assigned by this endpoint.

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | winner | Int | No | **0 = DRAW** (explicit sentinel). **1–48 = winning team** (Country ID from match country list, must be one of the two teams in the match). Field is required — omitting it returns 400 |

Output — Match Object with status = 3. On draw: `winner` is null, `settled_at` is set.

---

## Dummy Players

### /worldcup/dummy-players/ GET

### /worldcup/dummy-players/{uuid}/ GET

Query Parameters (list only)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | country | Int | Yes | Filter by country ID (1–10) |

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | player\_name | Str | No |  |
| **3** | country | Int | No | Country ID (1–10) |
| **4** | total\_points | Int | No |  |
| **5** | total\_prediction | Int | No |  |
| **6** | total\_win | Int | No |  |
| **7** | winning\_streak | Int | No |  |

### /worldcup/dummy-players/ POST

### /worldcup/dummy-players/{uuid}/ PUT (partial supported)

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | player\_name | Str | No (create) / Yes (update) |  |
| **2** | country | Int | No (create) / Yes (update) | Country ID (1–10) |
| **3** | total\_points | Int | Yes | Default 0 |
| **4** | total\_prediction | Int | Yes | Default 0 |
| **5** | total\_win | Int | Yes | Default 0 |
| **6** | winning\_streak | Int | Yes | Default 0 |

### /worldcup/dummy-players/{uuid}/archive/ PATCH

---

## Ranking (Admin)

### /worldcup/ranking/realtime/ GET

Real-time ranking — **real members only**, no dummy data merged in (unlike the member-facing `/worldcup/leaderboard/...` endpoints, which merge in `WorldCupDummyPlayer` rows).

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | scope | Str | Yes | `country` for country board. Any other value or omit for player board |
| **2** | country | Int | Yes | Filter players by country ID (player board only) |
| **3** | period | Int | Yes | `1` = today, `2` = rolling 30 days, `3` = rolling 365 days. Omit (with no `from_date`/`to_date`) for all-time/lifetime totals |
| **4** | from\_date | Str (YYYY-MM-DD) | Yes | Custom range start. Must be paired with `to_date`; takes priority over `period` |
| **5** | to\_date | Str (YYYY-MM-DD) | Yes | Custom range end. Must be paired with `from_date`; takes priority over `period` |
| **6** | total\_win | Int | Yes | Player board only. Shows players with **at least** this many wins within the selected window |
| **7** | winning\_streak | Int | Yes | Player board only. Shows players whose **longest win streak within the selected window** is at least this value |

Notes
- When `period`/`from_date`+`to_date` is supplied, `total_points`, `total_prediction`, `total_win`, and `winning_streak` are all scoped to that window (sourced from settled predictions and World Cup score redemptions in that range — not lifetime cumulative values). With no date filter, lifetime totals are returned (same values as `WorldCupMemberScore.total_points`).
- Sort order on the player board follows whichever threshold filter is active: `winning_streak` (if set) → `total_win` (if set, and `winning_streak` not set) → `total_points` (default, when neither is set). All high → low.
- `total_win`/`winning_streak` filters and sorting only apply to the player board (`scope` ≠ `country`).

Output — same row format as `/worldcup/leaderboard/players/` (`scope` ≠ `country`) or `/worldcup/leaderboard/countries/` (`scope=country`), but built from real-member data only (no dummy rows). Paginated.

---

## KPI Dashboard (Admin)

### /worldcup/dashboard/kpi/ GET

Returns key metrics for the World Cup feature. **All metrics are scoped to the World Cup campaign window** (`WC_CAMPAIGN_PERIOD_START`..`WC_CAMPAIGN_PERIOD_END` - production: 2026-06-11 to 2026-07-19). Any `period`/`from_date`/`to_date` range is intersected with the campaign window; a range that falls entirely outside it returns all KPI values as 0 with no comparison.

When a date filter is supplied, each metric is compared against the immediately-preceding period of equal length (also clamped to the campaign window - e.g. `period=1` compares today vs yesterday; a custom `from_date`/`to_date` range is compared against an equal-length range immediately before it). With no filter, the full campaign window is used and comparison fields are null.

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | period | Int | Yes | `1` = daily (today vs yesterday). Omit (with no `from_date`/`to_date`) for the full campaign window |
| **2** | from\_date | Str (YYYY-MM-DD) | Yes | Custom range start. Must be paired with `to_date`; takes priority over `period`. Compared against an equal-length range immediately preceding it |
| **3** | to\_date | Str (YYYY-MM-DD) | Yes | Custom range end. Must be paired with `from_date`; takes priority over `period` |

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | total\_sales | Object | No | KPI Entry — sum of `MemberDeposit.amount` (World Cup participants only) in the period |
| **2** | total\_participants | Object | No | KPI Entry — members who joined the World Cup (`WorldCupMemberScore` created) in the period |
| **3** | new\_depositing\_users | Object | No | KPI Entry — distinct members whose first-ever deposit falls within the period |
| **4** | returning\_depositing\_users | Object | No | KPI Entry — distinct members who deposited in the period AND had deposited before it |
| **5** | prediction\_users | Object | No | KPI Entry — distinct members who made a World Cup prediction in the period |
| **6** | predicted\_matches | Object | No | KPI Entry — distinct matches that received at least one prediction in the period |

KPI Entry Object

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | value | Int / Str (Decimal) | No | Current period's value (`total_sales` is a Decimal string, others are integers) |
| **2** | change\_percent | Float | Yes | `% change vs. previous period`, rounded to 2dp. Null when no comparison period applies, or when the previous period's value is 0 |
| **3** | change\_direction | Int | Yes | `1` = up (current ≥ previous), `2` = down (current < previous). Null when no comparison period applies |
