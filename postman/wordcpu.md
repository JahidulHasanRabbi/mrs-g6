# WORLD CUP

Base path: `/worldcup/`

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
| **1** | uuid | UUID | No |  |
| **2** | code | Str | No | e.g. "MYS" |
| **3** | name | Str | No |  |
| **4** | flag | Image | Yes |  |
| **5** | tier | Int | No |  |
| **6** | tier\_display | Str | No | e.g. "Tier 1" |

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

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | title | Str | No |  |
| **3** | subtitle | Str | No |  |
| **4** | label\_text | Str | No |  |
| **5** | section\_title | Str | No |  |
| **6** | description | Str | No |  |
| **7** | image | Image | Yes |  |
| **8** | location | Int | No |  |
| **9** | location\_display | Str | No | e.g. "Home" |

---

## Prize Pool

### /worldcup/prize-pool/ GET

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | type | Str | Yes | `prediction`, `top-country`, or `global-top-player` |
| **2** | country | UUID | Yes | Filter by country UUID |

### /worldcup/prize-pool/{uuid}/ GET

Output (both endpoints, single object or list)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | reward\_name | Str | No |  |
| **3** | quantity | Int | No |  |
| **4** | item\_type | Int | No | See Item Type Enum below |
| **5** | item\_type\_display | Str | No |  |
| **6** | country\_uuid | UUID | Yes | Only for top-country prizes |
| **7** | country\_code | Str | Yes |  |
| **8** | country\_flag | Image | Yes |  |
| **9** | country\_tier | Int | Yes |  |
| **10** | description | Str | No |  |
| **11** | image | Image | Yes |  |
| **12** | position | Int | Yes | Display order |
| **13** | win\_condition | Int | Yes | Streak milestone (for prediction prizes) |
| **14** | token\_amount | Int | Yes | Token reward amount (for prediction prizes) |

| ID | Item Type |
| ----- | ----- |
| 1 | Prediction |
| 2 | Top Country |
| 3 | Global Top Player |

---

## Leaderboard

### /worldcup/leaderboard/countries/ GET

Paginated output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | rank | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | code | Str | No |  |
| **4** | name | Str | No |  |
| **5** | flag | Image | Yes |  |
| **6** | total\_points | Int | No |  |
| **7** | total\_users | Int | No |  |

### /worldcup/leaderboard/players/ GET

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | country | UUID | Yes | Filter by country UUID |

Paginated output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | rank | Int | No |  |
| **2** | player\_name | Str | No |  |
| **3** | country\_uuid | UUID | No |  |
| **4** | country\_name | Str | No |  |
| **5** | country\_code | Str | No |  |
| **6** | flag | Image | Yes |  |
| **7** | total\_points | Int | No |  |
| **8** | total\_prediction | Int | No |  |
| **9** | total\_win | Int | No |  |
| **10** | winning\_streak | Int | No |  |

### /worldcup/leaderboard/top-per-country/ GET

Returns the single top player for each active country.

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | country\_uuid | UUID | No |  |
| **2** | country\_code | Str | No |  |
| **3** | country\_flag | Image | Yes |  |
| **4** | player\_name | Str | No |  |
| **5** | total\_points | Int | No |  |

---

## Choose Country

### /worldcup/{member\_uuid}/choose-country/ POST

Can only be called once per member. Cannot be changed after selection.

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | country\_uuid | UUID | No | From /worldcup/country-list/ |

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | player\_name | Str | No |  |
| **2** | country\_uuid | UUID | No |  |
| **3** | country\_code | Str | No |  |
| **4** | country\_name | Str | No |  |
| **5** | country\_flag | Image | Yes |  |
| **6** | total\_points | Int | No |  |
| **7** | global\_rank | Int | Yes | Null until member has points |
| **8** | country\_rank | Int | Yes | Null until member has points |
| **9** | total\_predictions | Int | No |  |
| **10** | total\_wins | Int | No |  |
| **11** | current\_streak | Int | No |  |
| **12** | best\_streak | Int | No |  |

---

## Profile

### /worldcup/{member\_uuid}/profile/ GET

Returns null country fields if member has not chosen a country yet.

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | player\_name | Str | No |  |
| **2** | country\_uuid | UUID | Yes |  |
| **3** | country\_code | Str | Yes |  |
| **4** | country\_name | Str | Yes |  |
| **5** | country\_flag | Image | Yes |  |
| **6** | total\_points | Int | No |  |
| **7** | global\_rank | Int | Yes | Null if no points yet |
| **8** | country\_rank | Int | Yes | Null if no points yet |
| **9** | total\_predictions | Int | No |  |
| **10** | total\_wins | Int | No |  |
| **11** | current\_streak | Int | No |  |
| **12** | best\_streak | Int | No |  |

---

## Matches

### /worldcup/match-list/ GET

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | status | Str | Yes | `upcoming`, `closed`, or `settled` |

Output (list)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | group\_label | Str | No | e.g. "Group A" |
| **3** | team\_home\_uuid | UUID | No |  |
| **4** | team\_home\_name | Str | No |  |
| **5** | team\_home\_flag | Image | Yes |  |
| **6** | team\_away\_uuid | UUID | No |  |
| **7** | team\_away\_name | Str | No |  |
| **8** | team\_away\_flag | Image | Yes |  |
| **9** | kickoff\_at | Datetime | No |  |
| **10** | status | Int | No | 1 = Upcoming, 2 = Closed, 3 = Settled |
| **11** | status\_display | Str | No |  |
| **12** | winner\_uuid | UUID | Yes | Null until settled |
| **13** | winner\_name | Str | Yes | Null until settled |
| **14** | winner\_flag | Image | Yes | Null until settled |
| **15** | settled\_at | Datetime | Yes | Null until settled |

### /worldcup/match-list/{match\_uuid}/ GET

Same output as single match object above.

---

## Predictions

### /worldcup/{member\_uuid}/predict/ POST

Requires member to have chosen a country. Requires current month deposit ≥ RM300. Cannot predict on a closed or settled match.

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | match\_uuid | UUID | No |  |
| **2** | team\_uuid | UUID | No | Must be one of the two teams in the match |

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No | Prediction UUID |
| **2** | match\_uuid | UUID | No |  |
| **3** | predicted\_team\_uuid | UUID | No |  |
| **4** | predicted\_team\_name | Str | No |  |
| **5** | state | Int | No | 1 = Pending |
| **6** | state\_display | Str | No | "PENDING" |
| **7** | created | Datetime | No |  |

### /worldcup/{member\_uuid}/predictions/ GET

Paginated list of all the member's predictions.

Output (paginated)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | match\_uuid | UUID | No |  |
| **3** | match\_status | Int | No |  |
| **4** | match\_status\_display | Str | No |  |
| **5** | match\_kickoff\_at | Datetime | No |  |
| **6** | team\_home\_uuid | UUID | No |  |
| **7** | team\_home\_name | Str | No |  |
| **8** | team\_away\_uuid | UUID | No |  |
| **9** | team\_away\_name | Str | No |  |
| **10** | winner\_uuid | UUID | Yes | Null until match settled |
| **11** | winner\_name | Str | Yes | Null until match settled |
| **12** | predicted\_team\_uuid | UUID | No |  |
| **13** | predicted\_team\_name | Str | No |  |
| **14** | state | Int | No | See State Enum below |
| **15** | state\_display | Str | No |  |
| **16** | settled\_at | Datetime | Yes |  |
| **17** | created | Datetime | No |  |

| ID | Prediction State |
| ----- | ----- |
| 1 | Pending |
| 2 | Win |
| 3 | Lose |

### /worldcup/{member\_uuid}/matches/{match\_uuid}/my-prediction/ GET

Returns the member's prediction for a specific match. Returns an **empty body** (HTTP 200, Content-Length: 0) if the member has not predicted for this match — not JSON null. Frontend must check for empty body before attempting to parse.

Output — same as single prediction object from `/predictions/` above, or empty body.

### /worldcup/{member\_uuid}/match-predictions/ GET

Lightweight map of all the member's predictions — match UUID to prediction state. Useful to check which matches the member has already predicted on.

Output (list)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | prediction\_uuid | UUID | No |  |
| **2** | match\_uuid | UUID | No |  |
| **3** | state | Int | No |  |
| **4** | state\_display | Str | No |  |

### /worldcup/{member\_uuid}/prediction-status/ GET

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | eligible | Bool | No | True if current month deposit ≥ RM300 |
| **2** | monthly\_deposit | Str (Decimal) | No | Current month total deposit |
| **3** | is\_locked | Bool | No | True if member lost and must deposit RM50 to unlock |
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

## Countries

### /worldcup/countries/ GET

### /worldcup/countries/{uuid}/ GET

Query Parameters (list only)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | tier | Int | Yes | Filter by tier |

Output — same as Country Object (see User Page — Country List).

### /worldcup/countries/ POST

### /worldcup/countries/{uuid}/ PUT (partial supported)

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | code | Str | No (create) / Yes (update) | Auto-uppercased. Must be unique. |
| **2** | name | Str | No (create) / Yes (update) |  |
| **3** | flag | Image | Yes |  |
| **4** | tier | Int | No (create) / Yes (update) | 1, 2, or 3 |

### /worldcup/countries/{uuid}/archive/ PATCH

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
| **2** | country | UUID | Yes | Filter by country UUID |

Output — same as Prize Pool Object (see User Page — Prize Pool).

### /worldcup/reward-items/ POST

### /worldcup/reward-items/{uuid}/ PUT (partial supported)

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | reward\_name | Str | No (create) / Yes (update) |  |
| **2** | quantity | Int | Yes | Default 0 |
| **3** | item\_type | Int | No (create) / Yes (update) | 1 = Prediction, 2 = Top Country, 3 = Global Top Player |
| **4** | country\_uuid | UUID | Yes | Required for Top Country prizes |
| **5** | description | Str | Yes |  |
| **6** | image | Image | Yes |  |
| **7** | position | Int | Yes | Display order |
| **8** | win\_condition | Int | Yes | Streak number for prediction prizes (e.g. 1, 2, 3…) |
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
| **1** | team\_home\_uuid | UUID | No (create) / Yes (update) | Country UUID |
| **2** | team\_away\_uuid | UUID | No (create) / Yes (update) | Country UUID. Must differ from home. |
| **3** | group\_label | Str | Yes | e.g. "Group A" |
| **4** | kickoff\_at | Datetime | No (create) / Yes (update) |  |
| **5** | status | Int | Yes | 1 = Upcoming, 2 = Closed |

### /worldcup/matches/{uuid}/archive/ PATCH

Cannot archive a match that has pending predictions.

### /worldcup/matches/{uuid}/settle/ POST

Transitions match from Closed (2) to Settled (3). Cannot settle an Upcoming (status = 1) match.

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | winner\_uuid | UUID | No | Must be one of the two teams in the match |

Output — Match Object with status = 3.

---

## Dummy Players

### /worldcup/dummy-players/ GET

### /worldcup/dummy-players/{uuid}/ GET

Query Parameters (list only)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | country | UUID | Yes | Filter by country UUID |

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | player\_name | Str | No |  |
| **3** | country\_uuid | UUID | No |  |
| **4** | country\_code | Str | No |  |
| **5** | country\_flag | Image | Yes |  |
| **6** | total\_points | Int | No |  |
| **7** | total\_prediction | Int | No |  |
| **8** | total\_win | Int | No |  |
| **9** | winning\_streak | Int | No |  |

### /worldcup/dummy-players/ POST

### /worldcup/dummy-players/{uuid}/ PUT (partial supported)

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | player\_name | Str | No (create) / Yes (update) |  |
| **2** | country\_uuid | UUID | No (create) / Yes (update) |  |
| **3** | total\_points | Int | Yes | Default 0 |
| **4** | total\_prediction | Int | Yes | Default 0 |
| **5** | total\_win | Int | Yes | Default 0 |
| **6** | winning\_streak | Int | Yes | Default 0 |

### /worldcup/dummy-players/{uuid}/archive/ PATCH

---

## Dummy Countries

### /worldcup/dummy-countries/ GET

### /worldcup/dummy-countries/{uuid}/ GET

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | country\_uuid | UUID | No |  |
| **3** | country\_code | Str | No |  |
| **4** | country\_flag | Image | Yes |  |
| **5** | total\_points | Int | No |  |
| **6** | total\_users | Int | No |  |

### /worldcup/dummy-countries/ POST

### /worldcup/dummy-countries/{uuid}/ PUT (partial supported)

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | country\_uuid | UUID | No (create) / Yes (update) |  |
| **2** | total\_points | Int | Yes | Default 0 |
| **3** | total\_users | Int | Yes | Default 0 |

### /worldcup/dummy-countries/{uuid}/archive/ PATCH

---

## Ranking (Admin)

### /worldcup/ranking/ GET

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | scope | Str | Yes | `country` for country board, omit for player board |
| **2** | country | UUID | Yes | Filter players by country (player board only) |

Output — same format as `/worldcup/leaderboard/countries/` or `/worldcup/leaderboard/players/` respectively.
