# Feature Status API Documentation

# Table of Contents

[**FEATURE STATUS**](#feature-status)

[Member Feature Status - GET](#member-feature-status---get)

[Mission Settings - GET/POST](#mission-settings---get/post)

[World Cup Leaderboard Settings - GET/POST](#world-cup-leaderboard-settings---get/post)

[Penalty Kick Settings - GET/POST](#penalty-kick-settings---get/post)

---

# FEATURE STATUS {#feature-status}

Feature status controls whether member-facing features are available or under maintenance.

For the combined member status API:

| ID | Status |
| ----- | ----- |
| 1 | Available |
| 2 | Unavailable / Closed / Under Maintenance |

For admin settings APIs, `maintenance_mode` follows the existing penalty kick format:

| Value | Description |
| ----- | ----- |
| false | Maintenance OFF |
| true | Maintenance ON |

## Member Feature Status - GET {#member-feature-status---get}

#### /front-view/feature-status/ GET {#/front-view/feature-status/-get}

Returns one combined status response for penalty kick, mission, and leaderboard.

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | penalty_kick | Int | No | 1 = Available, 2 = Closed or under maintenance |
| **2** | mission | Int | No | 1 = Available, 2 = Under maintenance |
| **3** | leaderboard | Int | No | 1 = Available, 2 = Under maintenance |

Example Response

```json
{
  "penalty_kick": 1,
  "mission": 2,
  "leaderboard": 1
}
```

## Mission Settings - GET/POST {#mission-settings---get/post}

#### /mission/settings/ GET {#/mission/settings/-get}

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | maintenance_mode | Bool | No | false = Maintenance OFF, true = Maintenance ON |

Example Response

```json
{
  "maintenance_mode": false
}
```

#### /mission/settings/ POST {#/mission/settings/-post}

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | maintenance_mode | Bool | Yes | false = Maintenance OFF, true = Maintenance ON |

Example Request

```json
{
  "maintenance_mode": true
}
```

When mission maintenance is ON, member mission list, join, claim, mission progress side effects, and mission bulk enrollment are blocked.

## World Cup Leaderboard Settings - GET/POST {#world-cup-leaderboard-settings---get/post}

#### /worldcup/settings/ GET {#/worldcup/settings/-get}

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | maintenance_mode | Bool | No | false = Maintenance OFF, true = Maintenance ON |

Example Response

```json
{
  "maintenance_mode": false
}
```

#### /worldcup/settings/ POST {#/worldcup/settings/-post}

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | maintenance_mode | Bool | Yes | false = Maintenance OFF, true = Maintenance ON |

Example Request

```json
{
  "maintenance_mode": true
}
```

When leaderboard maintenance is ON, World Cup country leaderboard, player leaderboard, top-player-per-country, and real-time ranking endpoints are blocked.

## Penalty Kick Settings - GET/POST {#penalty-kick-settings---get/post}

#### /penalty-kick/penalty-kick-settings/ GET {#/penalty-kick/penalty-kick-settings/-get}

Output includes the existing penalty kick settings fields. Relevant status fields:

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | game_status | Int | No | 1 = OPEN, 2 = CLOSE |
| **2** | maintenance_mode | Bool | No | false = Maintenance OFF, true = Maintenance ON |

#### /penalty-kick/penalty-kick-settings/ POST {#/penalty-kick/penalty-kick-settings/-post}

Input can include any penalty kick settings fields. Relevant status fields:

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | game_status | Int | Yes | 1 = OPEN, 2 = CLOSE |
| **2** | maintenance_mode | Bool | Yes | false = Maintenance OFF, true = Maintenance ON |

Example Request

```json
{
  "game_status": 1,
  "maintenance_mode": false
}
```
