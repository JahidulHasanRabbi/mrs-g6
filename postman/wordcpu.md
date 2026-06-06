# WORLD CUP

Base path: `/worldcup/`

All endpoints require JWT authentication.

---

## Country Reference

Countries are represented as integers throughout all APIs. There are no country UUIDs, codes, or flags.

| ID | Country | Tier |
| --- | --- | --- |
| 1 | Spain | 1 |
| 2 | France | 1 |
| 3 | England | 1 |
| 4 | Brazil | 1 |
| 5 | Argentina | 1 |
| 6 | Portugal | 2 |
| 7 | Germany | 2 |
| 8 | Netherlands | 2 |
| 9 | Morocco | 3 |
| 10 | Japan | 3 |

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
| **4** | total\_points | Int | No | Combined real + dummy floor |
| **5** | total\_users | Int | No | Combined real + dummy floor |

### /worldcup/leaderboard/players/ GET

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | country | Int | Yes | Filter by country ID (1–10) |

Paginated output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | rank | Int | No |  |
| **2** | player\_name | Str | No |  |
| **3** | country | Int | No | Country ID (1–10) |
| **4** | country\_name | Str | No |  |
| **5** | total\_points | Int | No |  |
| **6** | total\_prediction | Int | No |  |
| **7** | total\_win | Int | No |  |
| **8** | winning\_streak | Int | No |  |

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
| **3** | team\_home | Int | No | Country ID |
| **4** | team\_away | Int | No | Country ID |
| **5** | kickoff\_at | Datetime | No |  |
| **6** | status | Int | No | 1 = Upcoming, 2 = Closed, 3 = Settled |
| **7** | status\_display | Str | No | e.g. "UPCOMING" |
| **8** | winner | Int | Yes | Country ID. Null until settled |
| **9** | settled\_at | Datetime | Yes | Null until settled |

### /worldcup/match-list/{match\_uuid}/ GET

Same output as single match object above.

---

## Predictions

### /worldcup/{member\_uuid}/predict/ POST

Requires member to have chosen a country. Requires current month deposit ≥ RM300. Cannot predict on a closed or settled match or after kickoff. Member must not be locked (lost last prediction without depositing RM50 to unlock).

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | match\_uuid | UUID | No |  |
| **2** | team | Int | No | Country ID. Must be one of the two teams in the match |

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
| **6** | team\_home | Int | No | Country ID |
| **7** | team\_away | Int | No | Country ID |
| **8** | winner | Int | Yes | Country ID. Null until match settled |
| **9** | predicted\_team | Int | No | Country ID |
| **10** | state | Int | No | See State Enum below |
| **11** | state\_display | Str | No |  |
| **12** | settled\_at | Datetime | Yes |  |
| **13** | created | Datetime | No |  |

| ID | Prediction State |
| --- | --- |
| 1 | PENDING |
| 2 | WIN |
| 3 | LOSE |

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
| **3** | state | Int | No | 1/2/3 |
| **4** | state\_display | Str | No |  |

### /worldcup/{member\_uuid}/prediction-status/ GET

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | eligible | Bool | No | True if current month deposit ≥ RM300 |
| **2** | monthly\_deposit | Str (Decimal) | No | Current month total deposit e.g. "350.00" |
| **3** | is\_locked | Bool | No | True if member lost last prediction and must deposit RM50 |
| **4** | needs\_deposit | Bool | No | Same as is\_locked |
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
| **1** | information | Str | No |  |

### /worldcup/settings/ POST

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | information | Str | Yes |  |

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
| **7** | position | Int | Yes | Display order |
| **8** | win\_condition | Int | Yes | Consecutive wins required (prediction prizes) |
| **9** | token\_amount | Int | Yes | Token reward for prediction prizes |

### /worldcup/reward-items/{uuid}/archive/ PATCH

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
| **1** | team\_home | Int | No (create) / Yes (update) | Country ID (1–10). Must differ from team\_away |
| **2** | team\_away | Int | No (create) / Yes (update) | Country ID (1–10). Must differ from team\_home |
| **3** | group\_label | Str | Yes | e.g. "GROUP A" |
| **4** | kickoff\_at | Datetime | No (create) / Yes (update) |  |
| **5** | status | Int | Yes | 1 = Upcoming, 2 = Closed. Default 1. Cannot set to 3 via this endpoint |

### /worldcup/matches/{uuid}/archive/ PATCH

Cannot archive a match that has pending predictions (state = 1).

### /worldcup/matches/{uuid}/settle/ POST

Transitions match from Closed (2) to Settled (3). Cannot settle an Upcoming (status = 1) match or a match already settled.

On settle the system automatically:
- Marks all pending predictions WIN or LOSE
- Updates each member's streak, total\_wins, and best\_streak
- Locks any member who predicted wrong (is\_locked = true, must deposit RM50 to unlock)
- Awards streak prizes: token prizes → credited immediately; physical prizes → logged as MemberReward for staff fulfilment

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | winner | Int | No | Country ID. Must be one of the two teams in the match |

Output — Match Object with status = 3.

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

## Dummy Countries

Dummy country rows set a **floor/minimum** for that country in the country leaderboard. If real data already exceeds the dummy value, real data shows instead. Enter the total you want the country to display — not an additional amount to add on top.

### /worldcup/dummy-countries/ GET

### /worldcup/dummy-countries/{uuid}/ GET

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | country | Int | No | Country ID (1–10) |
| **3** | total\_points | Int | No | Floor value for points |
| **4** | total\_users | Int | No | Floor value for user count |

### /worldcup/dummy-countries/ POST

### /worldcup/dummy-countries/{uuid}/ PUT (partial supported)

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | country | Int | No (create) / Yes (update) | Country ID (1–10) |
| **2** | total\_points | Int | Yes | Default 0 |
| **3** | total\_users | Int | Yes | Default 0 |

### /worldcup/dummy-countries/{uuid}/archive/ PATCH

---

## Ranking (Admin)

### /worldcup/ranking/ GET

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | scope | Str | Yes | `country` for country board. Any other value or omit for player board |
| **2** | country | Int | Yes | Filter players by country ID (player board only) |

Output — same format as `/worldcup/leaderboard/countries/` (scope=country) or `/worldcup/leaderboard/players/` (player board). Paginated.
