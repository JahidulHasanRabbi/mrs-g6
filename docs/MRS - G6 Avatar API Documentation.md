# Table of Contents {#table-of-contents}

[**Changelog**](#changelog)

[**Initial Setup**](#initial-setup)

[Base Domain](#base-domain)

[Base Path](#base-path)

[Paginated Results](#paginated-results)

[**ENUMS**](#enums)

[**GAME SETTINGS**](#game-settings)

[/avatar/game-status/ GET](#/avatar/game-status/-get)

[/avatar/settings/ GET](#/avatar/settings/-get)

[/avatar/settings/ POST](#/avatar/settings/-post)

[/avatar/check-in-settings/ GET](#/avatar/check-in-settings/-get)

[/avatar/check-in-settings/ POST](#/avatar/check-in-settings/-post)

[**USER PAGE \- AVATAR**](#user-page---avatar)

[/avatar/member-avatar/profile/ GET](#/avatar/member-avatar/profile/-get)

[/avatar/member-avatar/start-journey/ POST](#/avatar/member-avatar/start-journey/-post)

[/avatar/member-avatar/level-up/ POST](#/avatar/member-avatar/level-up/-post)

[/avatar/member-avatar/my-equipment/ GET](#/avatar/member-avatar/my-equipment/-get)

[/avatar/member-avatar/equip/ POST](#/avatar/member-avatar/equip/-post)

[/avatar/member-avatar/unequip/ POST](#/avatar/member-avatar/unequip/-post)

[/avatar/member-avatar/discard/ POST](#/avatar/member-avatar/discard/-post)

[/avatar/member-avatar/battle-point-history/ GET](#/avatar/member-avatar/battle-point-history/-get)

[**USER PAGE \- CHECK-IN**](#user-page---check-in)

[/avatar/member-check-in/status/ GET](#/avatar/member-check-in/status/-get)

[/avatar/member-check-in/claim/ POST](#/avatar/member-check-in/claim/-post)

[**USER PAGE \- MISSIONS**](#user-page---missions)

[/avatar/avatar-missions/my-missions/ GET](#/avatar/avatar-missions/my-missions/-get)

[/avatar/avatar-missions/{uuid}/claim/ POST](#/avatar/avatar-missions/{uuid}/claim/-post)

[/avatar/avatar-missions/claim-history/ GET](#/avatar/avatar-missions/claim-history/-get)

[**USER PAGE \- CHALLENGE**](#user-page---challenge)

[/avatar/member-challenge/status/ GET](#/avatar/member-challenge/status/-get)

[/avatar/member-challenge/attack/ POST](#/avatar/member-challenge/attack/-post)

[/avatar/member-challenge/open-box/ POST](#/avatar/member-challenge/open-box/-post)

[/avatar/member-challenge/my-boxes/ GET](#/avatar/member-challenge/my-boxes/-get)

[/avatar/member-challenge/battle-history/ GET](#/avatar/member-challenge/battle-history/-get)

[**BACK OFFICE \- EQUIPMENT ITEMS**](#back-office---equipment-items)

[**BACK OFFICE \- AVATAR MISSIONS**](#back-office---avatar-missions)

[**BACK OFFICE \- BOSSES**](#back-office---bosses)

[**BACK OFFICE \- MYSTERY BOX ITEMS**](#back-office---mystery-box-items)

[**OTHER MODULES \- BATTLE POINT ADDITIONS**](#other-modules---battle-point-additions)

[Lucky Spin](#lucky-spin)

[Smash Egg](#smash-egg)

[Penalty Kick](#penalty-kick)

[Missions](#missions)

[Member Token Reason Type](#member-token-reason-type)

# Changelog {#changelog}

| Date | Changes Made | Modules |
| :---- | :---- | :---- |
| 2026-07-23 | Full rewrite to match the current implementation. Bosses and equipment items are now a fixed seeded catalog (GET \+ PUT/PATCH only, no create or archive). Boss fields changed to planet enum (name/theme/style/order removed). Added unequip, member check-in (status/claim) and admin check-in-settings endpoints. Attack response gained dice\_threshold and dice\_rounds. free\_attempts\_remaining moved to the top level of challenge status. Admin list endpoints (bosses, equipment-items, mystery-box-items) are now paginated. Mystery box items gained unlimited and quantity. Settings gained check\_in\_terms. | Avatar |

# Initial Setup {#initial-setup}

### Base Domain {#base-domain}

Staging: [staging-api.kinggroup44.com](http://staging-api.kinggroup44.com)
Production: production-api.kinggroup44.com

### Base Path {#base-path}

All endpoints below are prefixed with `/avatar/` unless written otherwise.
All endpoints require authentication.

Member-only endpoints return 400 `"Can only be triggered by members"` when called by a non-member user.

When `game_status` is 2, these endpoints return 400 `"Game is closed"`:
start-journey, level-up, equip, unequip, discard, my-missions, mission claim, check-in claim, attack, open-box.
All other endpoints keep working while closed, including profile, challenge status, check-in status, my-equipment, my-boxes and every history endpoint.

The fixed catalog (4 bosses, 4 equipment items, 7 check-in days, 12 mystery box items and the settings row) is created by the `seedavatar` management command. Run it once per environment; it never overwrites admin edits.

### Paginated Results {#paginated-results}

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | count | Int | Shows number of items |
| **2** | next | Str (URL) | Shows url to input for next page |
| **3** | previous | Str (URL) | Shows url to input for previous page |
| **4** | results | List of Objects |  |

Default page\_size is 20, max 100

# ENUMS {#enums}

| ID | Game Status |
| ----- | ----- |
| 1 | OPEN |
| 2 | CLOSE |

| ID | Avatar Gender |
| ----- | ----- |
| 1 | MALE |
| 2 | FEMALE |

| ID | Equipment Slot |
| ----- | ----- |
| 1 | WEAPON |
| 2 | HELMET |
| 3 | ARMOR |
| 4 | BOOTS |

| ID | Planet |
| ----- | ----- |
| 1 | STARLIGHT |
| 2 | COMET |
| 3 | METEOR |
| 4 | NEBULA |

| ID | Battle Point Event Type |
| ----- | ----- |
| 1 | EARN |
| 2 | REDEEM |
| 3 | SET |
| 4 | ADJUST |
| 5 | LOSS |

| ID | Battle Point Reason Type |
| ----- | ----- |
| 1 | CHECK-IN |
| 2 | MISSION |
| 3 | MINI-GAME |
| 4 | LEVEL-UP |
| 5 | CHALLENGE |

| ID | Mission Category |
| ----- | ----- |
| 1 | Daily Mission |
| 2 | Weekly Mission |
| 3 | Monthly Mission |
| 4 | Achievement |

| ID | Mission Condition Action |
| ----- | ----- |
| 1 | Login |
| 2 | Deposit Amount |
| 3 | Boss Battle |
| 4 | Obtain Equipment |
| 5 | Full Equipment Set |
| 6 | Complete Missions |

| ID | Mission Progress Status |
| ----- | ----- |
| 1 | In Progress |
| 2 | Completed |
| 3 | Claimed |

| ID | Mystery Box Reward Type |
| ----- | ----- |
| 1 | TOKEN |
| 2 | BATTLE-POINT |
| 3 | FREE-CREDIT |
| 4 | EQUIPMENT |
| 5 | LEVEL-UP |
| 6 | GOLD-BAR |

| ID | Avatar Log Action |
| ----- | ----- |
| 1 | LEVEL-UP |
| 2 | EQUIP |
| 3 | DISCARD |
| 4 | UNEQUIP |

# GAME SETTINGS {#game-settings}

### /avatar/game-status/ GET {#/avatar/game-status/-get}

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | game\_status | Int | No | 1 \= OPEN 2 \= CLOSE |

### /avatar/settings/ GET {#/avatar/settings/-get}

One settings row is shared by Avatar (3a), Challenge (3b) and the avatar missions. Setting `game_status` to 2 closes all of them at once (this also drives the `rpg` flag in /front-view/feature-status/).

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | game\_status | Int | No | 1 \= OPEN 2 \= CLOSE |
| **2** | max\_level | Int | No | Default 100 |
| **3** | battle\_point\_per\_level\_multiplier | Int | No | Default 100\. Next level cost \= level × multiplier |
| **4** | battle\_power\_per\_level | Int | No | Default 500\. Battle power \= level × this \+ equipped power\_bonus |
| **5** | equipment\_slot\_count | Int | No | Default 4 |
| **6** | discard\_equipment\_cost | Int | No | Tokens charged per discard. Default 10 |
| **7** | backpack\_capacity | Int | No | Default 100\. Max unequipped equipment held |
| **8** | dice\_count | Int | No | Dice rolled per turn. Default 1 |
| **9** | dice\_sides | Int | No | Default 6 |
| **10** | free\_daily\_attempts | Int | No | Default 1\. Shared across all bosses per day |
| **11** | extra\_attempt\_token\_cost | Int | No | Tokens. Default 10 |
| **12** | description | Text | No | Can be blank |
| **13** | check\_in\_terms | Text | No | Can be blank. Also editable via check-in-settings |

### /avatar/settings/ POST {#/avatar/settings/-post}

Input (all fields optional, partial update)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | game\_status | Int (Enum) | \- | 1 \= OPEN 2 \= CLOSE |
| **2** | max\_level | Int | \- | Min 1 |
| **3** | battle\_point\_per\_level\_multiplier | Int | \- | Min 1 |
| **4** | battle\_power\_per\_level | Int | \- | Min 0 |
| **5** | equipment\_slot\_count | Int | \- | Min 1 |
| **6** | discard\_equipment\_cost | Int | \- | Min 0 |
| **7** | backpack\_capacity | Int | \- | Min 1 |
| **8** | dice\_count | Int | \- | Min 1 |
| **9** | dice\_sides | Int | \- | Min 2 |
| **10** | free\_daily\_attempts | Int | \- | Min 0 |
| **11** | extra\_attempt\_token\_cost | Int | \- | Min 0 |
| **12** | description | Text | \- | Can be blank |
| **13** | check\_in\_terms | Text | \- | Can be blank |

Returns the same output as /avatar/settings/ GET

### /avatar/check-in-settings/ GET {#/avatar/check-in-settings/-get}

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | check\_in\_terms | Text | No | Can be blank |
| **2** | rewards | List | \- | See Reward Day below, ordered by day |

Reward Day

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | day | Int | No | 1 to 7 |
| **2** | battle\_point\_minimum | Int | No |  |
| **3** | battle\_point\_maximum | Int | No |  |
| **4** | is\_special | Bool | No |  |
| **5** | multiplier | Int | No | Claim amount \= random(min, max) × multiplier |
| **6** | display\_text | Str | Yes |  |

### /avatar/check-in-settings/ POST {#/avatar/check-in-settings/-post}

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | check\_in\_terms | Text | Yes | Only updated when sent |
| **2** | day\_settings | List | No | Full replacement, see below. Days missing from the list are deleted |

day\_settings item

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | day | Int | No | 1 to 7 |
| **2** | battle\_point\_minimum | Int | No | Min 0 |
| **3** | battle\_point\_maximum | Int | No | Min 0\. Must not be below minimum |
| **4** | is\_special | Bool | Yes | Default false |
| **5** | multiplier | Int | Yes | Min 1\. Default 1 |
| **6** | display\_text | Str | Yes |  |

Returns the same output as /avatar/check-in-settings/ GET

# USER PAGE \- AVATAR {#user-page---avatar}

### /avatar/member-avatar/profile/ GET {#/avatar/member-avatar/profile/-get}

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | journey\_started | Bool | No | If False, this is the only field returned |
| **2** | uuid | UUID | No |  |
| **3** | gender | Int | Yes | 1 \= MALE 2 \= FEMALE |
| **4** | level | Int | No |  |
| **5** | max\_level | Int | No | From settings |
| **6** | current\_battle\_points | Int | No | Sum of the battle point ledger |
| **7** | next\_level\_cost | Int | No | level × battle\_point\_per\_level\_multiplier |
| **8** | battle\_power | Int | No | level × battle\_power\_per\_level \+ equipped power\_bonus |

### /avatar/member-avatar/start-journey/ POST {#/avatar/member-avatar/start-journey/-post}

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | gender | Int (Enum) | No | 1 \= MALE 2 \= FEMALE |

Returns 201 with the same output as /avatar/member-avatar/profile/
Returns 400 `"Journey has already been started"` if the member already has an avatar

### /avatar/member-avatar/level-up/ POST {#/avatar/member-avatar/level-up/-post}

No input

Returns the same output as /avatar/member-avatar/profile/
Deducts `next_level_cost` battle points (ledger type 2, reason\_type 4\)

| Error | Condition |
| :---- | :---- |
| 400 Journey has not been started | Member has no avatar |
| 400 Avatar has reached the maximum level | level \>= max\_level |
| 400 Member doesn't have enough battle points | current\_battle\_points \< next\_level\_cost |

### /avatar/member-avatar/my-equipment/ GET {#/avatar/member-avatar/my-equipment/-get}

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | is\_equipped | Bool | Yes | true / false |

Output (not paginated, returns a list ordered by slot, equipped first)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No | Member equipment uuid, used for equip / unequip / discard |
| **2** | item\_uuid | UUID | No | Catalog item uuid |
| **3** | item\_name | Str | No |  |
| **4** | slot\_type | Int | No | 1 \= WEAPON 2 \= HELMET 3 \= ARMOR 4 \= BOOTS |
| **5** | power\_bonus | Int | No |  |
| **6** | is\_equipped | Bool | No |  |

The same catalog item can be owned multiple times, each copy is its own row. Only equipped items count towards battle power.

### /avatar/member-avatar/equip/ POST {#/avatar/member-avatar/equip/-post}

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | equipment\_uuid | UUID | No | Member equipment uuid, not catalog item uuid |

Output is a single member equipment object (see my-equipment)
Any item already equipped in the same slot is automatically unequipped first

| Error | Condition |
| :---- | :---- |
| 400 Member Equipment: {uuid} does not exist | equipment\_uuid not owned by the member |
| 400 Equipment is already equipped | Item is already equipped |

### /avatar/member-avatar/unequip/ POST {#/avatar/member-avatar/unequip/-post}

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | equipment\_uuid | UUID | No | Member equipment uuid |

Output is a single member equipment object (see my-equipment)
The item goes back into the backpack, so the backpack must have space

| Error | Condition |
| :---- | :---- |
| 400 Member Equipment: {uuid} does not exist | equipment\_uuid not owned by the member |
| 400 Equipment is not equipped | Item is not currently equipped |
| 400 Backpack is full | Unequipped count \>= backpack\_capacity |

### /avatar/member-avatar/discard/ POST {#/avatar/member-avatar/discard/-post}

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | equipment\_uuid | UUID | No | Member equipment uuid |

Returns 204 No Content
Charges `discard_equipment_cost` tokens (token ledger type 2, reason 15 AVATAR) and deletes the equipment permanently

| Error | Condition |
| :---- | :---- |
| 400 Member Equipment: {uuid} does not exist | equipment\_uuid not owned by the member |
| 400 Equipment is currently equipped | Must be unequipped first |
| 400 Member doesn't have enough tokens | Balance \< discard\_equipment\_cost |

### /avatar/member-avatar/battle-point-history/ GET {#/avatar/member-avatar/battle-point-history/-get}

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | Yes | For Pagination |
| **2** | page\_size | Int | Yes | For Pagination |
| **3** | start\_date | date | Yes | Both dates required to filter |
| **4** | end\_date | date | Yes | Both dates required to filter |
| **5** | reason\_type | Int | Yes | 1 \= CHECK-IN 2 \= MISSION 3 \= MINI-GAME 4 \= LEVEL-UP 5 \= CHALLENGE |

Output (Is paginated, has count, next, previous, and results)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | created | datetime | No |  |
| **4** | type | Int | No | 1 \= EARN 2 \= REDEEM 3 \= SET 4 \= ADJUST 5 \= LOSS |
| **5** | category | Str | No | Display name of reason\_type |
| **6** | reason\_type | Int | No | 1 \= CHECK-IN 2 \= MISSION 3 \= MINI-GAME 4 \= LEVEL-UP 5 \= CHALLENGE |
| **7** | reason\_uuid | UUID | Yes |  |
| **8** | amount | Int | No | Negative when type is 2 or 5 |

# USER PAGE \- CHECK-IN {#user-page---check-in}

The check-in streak is 7 days. Missing a day restarts the streak at day 1\. After day 7 the next check-in starts a new cycle at day 1\. The streak is derived from the last check-in row, no scheduled reset is involved.

### /avatar/member-check-in/status/ GET {#/avatar/member-check-in/status/-get}

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | check\_in\_terms | Text | No | Can be blank |
| **2** | days | List | \- | See Day below, ordered by day |
| **3** | checked\_count | Int | No | Days claimed in the current cycle |
| **4** | today\_checked | Bool | No |  |
| **5** | history | List | \- | Last 30 check-ins, newest first, same fields as claim output |

Day

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | day | Int | No | 1 to 7 |
| **2** | battle\_point\_minimum | Int | No |  |
| **3** | battle\_point\_maximum | Int | No |  |
| **4** | is\_special | Bool | No |  |
| **5** | multiplier | Int | No |  |
| **6** | display\_text | Str | Yes |  |
| **7** | is\_claimed | Bool | No | Claimed in the current cycle |
| **8** | battle\_point\_amount | Int | No | Amount received, 0 if not claimed |

### /avatar/member-check-in/claim/ POST {#/avatar/member-check-in/claim/-post}

No input

Credits random(battle\_point\_minimum, battle\_point\_maximum) × multiplier battle points (reason\_type 1\) and feeds mission condition 1 (Login)

Output (201)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | check\_in\_date | date | No |  |
| **3** | day | Int | No | 1 to 7 |
| **4** | period\_key | date | No | First day of the current cycle |
| **5** | battle\_point\_amount | Int | No |  |
| **6** | created | datetime | No |  |

| Error | Condition |
| :---- | :---- |
| 400 Already checked in today | One claim per day |
| 400 Avatar Check-In Not Setup Yet | No settings or no reward days configured |

# USER PAGE \- MISSIONS {#user-page---missions}

Mission progress is tracked per period: daily missions reset every day, weekly every ISO week, monthly every month, achievements never. A new period starts with fresh progress automatically, nothing needs to be reset by cron.

Progress is only recorded for members who have started their journey. Triggers: Login (login or check-in claim, counts once per day), Deposit Amount, Boss Battle (each attack), Obtain Equipment (equipment from a mystery box), Full Equipment Set (equipping the 4th distinct slot), Complete Missions (claiming any other mission).

### /avatar/avatar-missions/my-missions/ GET {#/avatar/avatar-missions/my-missions/-get}

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | category | Int | Yes | 1 \= Daily 2 \= Weekly 3 \= Monthly 4 \= Achievement |

Only returns missions live today (start\_date / end\_date)

Output (not paginated, returns a list)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | mission\_name | Str | No |  |
| **3** | category | Int | No | 1 \= Daily 2 \= Weekly 3 \= Monthly 4 \= Achievement |
| **4** | description | Text | No | Can be blank |
| **5** | accumulate\_target | Int | No |  |
| **6** | reward\_battle\_point\_quantity | Int | No |  |
| **7** | reward\_token\_quantity | Int | No |  |
| **8** | joined | Bool | No | False until the member starts their journey |
| **9** | current\_value | Int | No | 0 if not joined |
| **10** | status | Int | Yes | 1 \= In Progress 2 \= Completed 3 \= Claimed. Null if not joined |

### /avatar/avatar-missions/{uuid}/claim/ POST {#/avatar/avatar-missions/{uuid}/claim/-post}

uuid is the mission uuid
No input

Credits battle points (reason\_type 2\) and tokens (reason 15 AVATAR) when the amounts are above 0\. Claiming also feeds mission condition 6 (Complete Missions) on other missions.

Output (201)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No | Claim uuid |
| **2** | mission\_name | Str | No |  |
| **3** | mission\_uuid | UUID | No |  |
| **4** | category | Int | No | 1 \= Daily 2 \= Weekly 3 \= Monthly 4 \= Achievement |
| **5** | battle\_point\_amount | Int | No |  |
| **6** | token\_amount | Int | No |  |
| **7** | created | datetime | No |  |

| Error | Condition |
| :---- | :---- |
| 400 Avatar Mission: {uuid} does not exist | Mission uuid not found or archived |
| 400 You have not joined this mission for the current period | No progress row for the current period |
| 400 Mission has not been completed yet | current\_value \< accumulate\_target |
| 400 Mission reward has already been claimed | Already claimed this period |

### /avatar/avatar-missions/claim-history/ GET {#/avatar/avatar-missions/claim-history/-get}

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | Yes | For Pagination |
| **2** | page\_size | Int | Yes | For Pagination |
| **3** | start\_date | date | Yes | Both dates required to filter |
| **4** | end\_date | date | Yes | Both dates required to filter |

Output (Is paginated, has count, next, previous, and results)
Same fields as the claim output above. Keeps claims from every period.

# USER PAGE \- CHALLENGE {#user-page---challenge}

### /avatar/member-challenge/status/ GET {#/avatar/member-challenge/status/-get}

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | journey\_started | Bool | No |  |
| **2** | game\_status | Int | No | 1 \= OPEN 2 \= CLOSE |
| **3** | battle\_power | Int | No | 0 if journey not started |
| **4** | free\_attempts\_remaining | Int | No | Shared daily allowance across all bosses |
| **5** | extra\_attempt\_token\_cost | Int | No |  |
| **6** | unopened\_boxes | Int | No |  |
| **7** | bosses | List | \- | See Bosses below, ordered by planet |

Bosses

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | planet | Int | No | 1 \= STARLIGHT 2 \= COMET 3 \= METEOR 4 \= NEBULA |
| **3** | power\_required | Int | No |  |
| **4** | hp | Int | No | Display only |
| **5** | dice\_threshold | Int | No | Dice total needed to defeat |
| **6** | equipment\_reward\_slot | Int | No | 1 \= WEAPON 2 \= HELMET 3 \= ARMOR 4 \= BOOTS |
| **7** | is\_unlocked | Bool | No | battle\_power \>= power\_required |
| **8** | total\_defeats | Int | No |  |

### /avatar/member-challenge/attack/ POST {#/avatar/member-challenge/attack/-post}

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | boss\_uuid | UUID | No |  |

Dice are rolled repeatedly until the cumulative total passes `dice_threshold`, so the boss is always defeated and one unopened mystery box is always created.
Free while `free_attempts_remaining` \> 0 (shared across bosses), otherwise charges `extra_attempt_token_cost` tokens (token ledger type 2, reason 16 CHALLENGE). Each attack feeds mission condition 3 (Boss Battle).

Output (201)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | boss\_uuid | UUID | No |  |
| **3** | planet | Int | No | 1 \= STARLIGHT 2 \= COMET 3 \= METEOR 4 \= NEBULA |
| **4** | is\_free | Bool | No |  |
| **5** | token\_cost | Int | No | 0 when is\_free |
| **6** | dice\_rolls | Int | No | Number of rolls until threshold passed |
| **7** | dice\_total | Int | No |  |
| **8** | battle\_power | Int | No | Battle power at time of attempt |
| **9** | mystery\_box\_uuid | UUID | Yes | Pass to open-box |
| **10** | created | datetime | No |  |
| **11** | dice\_threshold | Int | No | The threshold that was beaten |
| **12** | dice\_rounds | List | \- | One object per roll: `{roll, cumulative}`, for the dice animation |

| Error | Condition |
| :---- | :---- |
| 400 Boss: {uuid} does not exist | boss\_uuid not found or inactive |
| 400 Journey has not been started | Member has no avatar |
| 400 Battle power is too low to challenge this boss | battle\_power \< power\_required |
| 400 Member doesn't have enough tokens | No free attempt left and balance \< extra\_attempt\_token\_cost |

### /avatar/member-challenge/open-box/ POST {#/avatar/member-challenge/open-box/-post}

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | box\_uuid | UUID | No |  |

Reward is drawn by `probability` weight across all active mystery box items. Items with probability 0 are never drawn but still appear in the possible rewards list.
Equipment rewards are excluded from the draw when the backpack is full, the box is still opened with the remaining reward types.
Rewards are applied immediately: tokens (reason 16), battle points (reason\_type 5), level ups (capped at max\_level), equipment (one item matching the boss `equipment_reward_slot`, feeds mission conditions 4 and 5), free credit (random amount between min and max withdraw).

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | boss\_uuid | UUID | No |  |
| **3** | planet | Int | No | 1 \= STARLIGHT 2 \= COMET 3 \= METEOR 4 \= NEBULA |
| **4** | is\_opened | Bool | No |  |
| **5** | opened\_at | datetime | Yes |  |
| **6** | reward\_type | Int | Yes | 1 \= TOKEN 2 \= BATTLE-POINT 3 \= FREE-CREDIT 4 \= EQUIPMENT 5 \= LEVEL-UP 6 \= GOLD-BAR |
| **7** | reward\_name | Str | Yes |  |
| **8** | token\_amount | Int | Yes | Only if reward\_type is 1 |
| **9** | battle\_point\_amount | Int | Yes | Only if reward\_type is 2 |
| **10** | level\_up\_count | Int | Yes | Only if reward\_type is 5 |
| **11** | reward\_credit\_amount | Decimal | Yes | Only if reward\_type is 3\. Random between min\_withdraw and max\_withdraw |
| **12** | equipment\_name | Str | Yes | Only if reward\_type is 4 |
| **13** | equipment\_slot | Int | Yes | Only if reward\_type is 4 |
| **14** | created | datetime | No |  |

| Error | Condition |
| :---- | :---- |
| 400 Mystery Box: {uuid} does not exist | box\_uuid not owned by the member |
| 400 Mystery box has already been opened | Box already opened |
| 400 No mystery box rewards configured | No active mystery box items |
| 400 Backpack is full | Backpack full and only equipment rewards remain |
| 400 Drawn reward is not configured correctly | Reward amount is 0 for its type |
| 400 No equipment reward configured for this boss | No item exists for the boss equipment\_reward\_slot |

### /avatar/member-challenge/my-boxes/ GET {#/avatar/member-challenge/my-boxes/-get}

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | Yes | For Pagination |
| **2** | page\_size | Int | Yes | For Pagination |
| **3** | is\_opened | Bool | Yes | true / false |

Output (Is paginated, has count, next, previous, and results)
Same fields as the open-box output above. Reward fields are null while the box is unopened.

### /avatar/member-challenge/battle-history/ GET {#/avatar/member-challenge/battle-history/-get}

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | Yes | For Pagination |
| **2** | page\_size | Int | Yes | For Pagination |
| **3** | start\_date | date | Yes | Both dates required to filter |
| **4** | end\_date | date | Yes | Both dates required to filter |

Output (Is paginated, has count, next, previous, and results)
Fields 1 to 10 of the attack output. `dice_threshold` and `dice_rounds` are only returned by the attack endpoint itself.

# BACK OFFICE \- EQUIPMENT ITEMS {#back-office---equipment-items}

The catalog is fixed at 4 items, one per slot, created by `seedavatar`. There is no create or archive endpoint, admins can only rename and re-balance the existing items.

### Equipment Items \- GET

/avatar/equipment-items/ GET
/avatar/equipment-items/{uuid}/ GET
Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | Yes | For Pagination |
| **2** | page\_size | Int | Yes | For Pagination |
| **3** | slot\_type | Int | Yes | 1 \= WEAPON 2 \= HELMET 3 \= ARMOR 4 \= BOOTS |

Output (Is paginated, has count, next, previous, and results)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | name | Str | No |  |
| **4** | slot\_type | Int | No | 1 \= WEAPON 2 \= HELMET 3 \= ARMOR 4 \= BOOTS |
| **5** | power\_bonus | Int | No | Default 1000 |

### Equipment Items \- PUT/PATCH

/avatar/equipment-items/{uuid}/ PUT
/avatar/equipment-items/{uuid}/ PATCH
Input (all fields optional, partial update)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | name | Str | \- |  |
| **2** | power\_bonus | Int | \- | Min 0 |

`slot_type` cannot be changed.

# BACK OFFICE \- AVATAR MISSIONS {#back-office---avatar-missions}

Creating a mission enrols all existing journey-started members in the background. This requires the celery worker (redis) to be running.

### Avatar Missions \- GET

/avatar/avatar-missions/ GET
/avatar/avatar-missions/{uuid}/ GET
Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | Yes | For Pagination |
| **2** | page\_size | Int | Yes | For Pagination |
| **3** | category | Int | Yes | 1 \= Daily 2 \= Weekly 3 \= Monthly 4 \= Achievement |

Output (Is paginated, has count, next, previous, and results)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | mission\_name | Str | No |  |
| **4** | category | Int | No | 1 \= Daily 2 \= Weekly 3 \= Monthly 4 \= Achievement |
| **5** | description | Text | No | Can be blank |
| **6** | condition\_action | Int | No | 1 \= Login 2 \= Deposit Amount 3 \= Boss Battle 4 \= Obtain Equipment 5 \= Full Equipment Set 6 \= Complete Missions |
| **7** | accumulate\_target | Int | No |  |
| **8** | reward\_battle\_point\_quantity | Int | No |  |
| **9** | reward\_token\_quantity | Int | No |  |
| **10** | start\_date | date | Yes |  |
| **11** | end\_date | date | Yes |  |

### Avatar Missions \- POST/PUT

/avatar/avatar-missions/ POST
/avatar/avatar-missions/{uuid}/ PUT
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | mission\_name | Str | No |  |
| **2** | category | Int (Enum) | No | 1 \= Daily 2 \= Weekly 3 \= Monthly 4 \= Achievement |
| **3** | description | Text | Yes | Can be blank |
| **4** | condition\_action | Int (Enum) | No | 1 \= Login 2 \= Deposit Amount 3 \= Boss Battle 4 \= Obtain Equipment 5 \= Full Equipment Set 6 \= Complete Missions |
| **5** | accumulate\_target | Int | No | Min 1 |
| **6** | reward\_battle\_point\_quantity | Int | No | Min 0 |
| **7** | reward\_token\_quantity | Int | Yes | Min 0 |
| **8** | start\_date | date | Yes |  |
| **9** | end\_date | date | Yes | Must not be before start\_date |

### Avatar Missions \- ARCHIVE

/avatar/avatar-missions/{uuid}/archive/ PATCH

# BACK OFFICE \- BOSSES {#back-office---bosses}

The 4 bosses (one per planet) are created by `seedavatar`. There is no create or archive endpoint, admins can only re-balance them or toggle `is_active`.

### Bosses \- GET

/avatar/bosses/ GET
/avatar/bosses/{uuid}/ GET
Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | Yes | For Pagination |
| **2** | page\_size | Int | Yes | For Pagination |

Output (Is paginated, has count, next, previous, and results, ordered by planet)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | planet | Int | No | 1 \= STARLIGHT 2 \= COMET 3 \= METEOR 4 \= NEBULA |
| **4** | power\_required | Int | No |  |
| **5** | hp | Int | No | Display only |
| **6** | dice\_threshold | Int | No |  |
| **7** | equipment\_reward\_slot | Int | No | 1 \= WEAPON 2 \= HELMET 3 \= ARMOR 4 \= BOOTS |
| **8** | is\_active | Bool | No | Inactive bosses are hidden from members |

### Bosses \- PUT/PATCH

/avatar/bosses/{uuid}/ PUT
/avatar/bosses/{uuid}/ PATCH
Input (all fields optional, partial update)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | power\_required | Int | \- | Min 0 |
| **2** | hp | Int | \- | Min 0\. Display only |
| **3** | dice\_threshold | Int | \- | Min 1 |
| **4** | equipment\_reward\_slot | Int (Enum) | \- | 1 \= WEAPON 2 \= HELMET 3 \= ARMOR 4 \= BOOTS |
| **5** | is\_active | Bool | \- |  |

`planet` cannot be changed.

# BACK OFFICE \- MYSTERY BOX ITEMS {#back-office---mystery-box-items}

The 12 spec rewards are created by `seedavatar`. Admins can add, edit and archive items freely, the probabilities of all active items should sum to exactly 1\.

### Mystery Box Items \- GET

/avatar/mystery-box-items/ GET
/avatar/mystery-box-items/{uuid}/ GET
Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | Yes | For Pagination |
| **2** | page\_size | Int | Yes | For Pagination |
| **3** | reward\_type | Int | Yes | 1 \= TOKEN 2 \= BATTLE-POINT 3 \= FREE-CREDIT 4 \= EQUIPMENT 5 \= LEVEL-UP 6 \= GOLD-BAR |

Output (Is paginated, has count, next, previous, and results, ordered by probability descending)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | reward\_name | Str | No |  |
| **4** | reward\_type | Int | No | 1 \= TOKEN 2 \= BATTLE-POINT 3 \= FREE-CREDIT 4 \= EQUIPMENT 5 \= LEVEL-UP 6 \= GOLD-BAR |
| **5** | probability | Float | No | 0 to 1\. All active items should sum to 1\. Items at 0 are shown but never drawn |
| **6** | token\_amount | Int | No |  |
| **7** | battle\_point\_amount | Int | No |  |
| **8** | level\_up\_count | Int | No |  |
| **9** | unlimited | Bool | No |  |
| **10** | quantity | Int | No |  |
| **11** | min\_withdraw | Decimal | Yes |  |
| **12** | max\_withdraw | Decimal | Yes |  |
| **13** | image | Image | Yes |  |

### Mystery Box Items \- POST/PUT

/avatar/mystery-box-items/ POST
/avatar/mystery-box-items/{uuid}/ PUT
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | reward\_name | Str | No |  |
| **2** | reward\_type | Int (Enum) | No | 1 \= TOKEN 2 \= BATTLE-POINT 3 \= FREE-CREDIT 4 \= EQUIPMENT 5 \= LEVEL-UP 6 \= GOLD-BAR |
| **3** | probability | Decimal | No | 0 to 1, 4 decimal places |
| **4** | token\_amount | Int | Yes | Required if reward\_type is 1 |
| **5** | battle\_point\_amount | Int | Yes | Required if reward\_type is 2 |
| **6** | level\_up\_count | Int | Yes | Required if reward\_type is 5 |
| **7** | unlimited | Bool | No |  |
| **8** | quantity | Int | Yes | Required when unlimited is false. Min 0 |
| **9** | min\_withdraw | Decimal | Yes | Only if reward\_type is 3 |
| **10** | max\_withdraw | Decimal | Yes | Required if reward\_type is 3\. Must not be below min\_withdraw |
| **11** | image | Image | Yes |  |

### Mystery Box Items \- ARCHIVE

/avatar/mystery-box-items/{uuid}/archive/ PATCH

### Mystery Box Items \- PROBABILITY TOTAL

/avatar/mystery-box-items/probability-total/ GET
Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | total | Float | No | Sum of probability across all active items |
| **2** | is\_valid | Bool | No | True when total is exactly 1 |

# OTHER MODULES \- BATTLE POINT ADDITIONS {#other-modules---battle-point-additions}

Existing endpoints in other modules that gained battle point fields. Only the new fields are listed, everything else in those endpoints is unchanged.

Battle points earned this way are written to the avatar ledger and show up in /avatar/member-avatar/battle-point-history/ with reason\_type 3 (MINI-GAME) or 2 (MISSION).

## Lucky Spin {#lucky-spin}

### /lucky-spin/lucky-spin-items/ GET, POST, PUT

New field on input and output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | battle\_point\_amount | Int | Yes | Battle points awarded. Only used when item\_type is 5 |

Item Type now has a new option

| ID | Lucky Spin Item Type |
| ----- | ----- |
| 1 | FREE CREDIT |
| 2 | ITEM |
| 3 | TOKEN |
| 4 | OTHER |
| 5 | BATTLE POINT |

Battle points are credited when a spun item has `item_type` 5\. Applies to /member/{uuid}/one-spin/, /member/{uuid}/ten-spin/ and /member/{uuid}/fifty-spin/ POST.
The spin response is unchanged, battle points are not returned in it.

## Smash Egg {#smash-egg}

### /smash-egg/smash-egg-items/ GET, POST, PUT

New field on input and output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | battle\_point\_amount | Int | Yes | Battle points awarded. Only used when item\_type is 4 |

Item Type now has a new option

| ID | Smash Egg Item Type |
| ----- | ----- |
| 1 | FREE CREDIT |
| 2 | TOKEN |
| 3 | PRIZE |
| 4 | BATTLE POINT |

Battle points are credited when a smashed item has `item_type` 4\. Applies to /member/{uuid}/one-smash/, /member/{uuid}/ten-smash/, /member/{uuid}/fifty-smash/ and /member/{uuid}/hundred-smash/ POST.
The smash response is unchanged, battle points are not returned in it.

## Penalty Kick {#penalty-kick}

### /penalty-kick/penalty-kick-items/ GET, POST, PUT

New field on input and output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | battle\_point\_amount | Int | Yes | Battle points awarded. Only used when item\_type is 5 |

Item Type now has a new option

| ID | Penalty Kick Item Type |
| ----- | ----- |
| 1 | FREE CREDIT |
| 2 | TOKEN |
| 3 | PRIZE |
| 4 | WORLD CUP SCORE |
| 5 | BATTLE POINT |

### /member/{uuid}/kick/redeem-all/ POST

Battle points are credited when a redeemed item has `item_type` 5\.
New field on output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | total\_battle\_points | Int | No | Total battle points credited in this redeem batch |

## Missions {#missions}

This is the platform mission module, not /avatar/avatar-missions/.

### /mission/missions/ GET, POST, PUT

New field on input and output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | reward\_battle\_point\_quantity | Int | Yes | Min 0\. Default 0 |

### /mission/missions/my-missions/ GET

New field on output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | reward\_battle\_point\_quantity | Int | No |  |

### /mission/missions/{uuid}/claim/ POST

New field on output, also present in claim history

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | battle\_point\_amount | Int | No | Battle points credited by this claim |

Tokens are only created when `reward_token_quantity` is above 0, battle points only when `reward_battle_point_quantity` is above 0\.

## Member Token Reason Type {#member-token-reason-type}

Two new reason types were added for token movements caused by the avatar module

| ID | Reason Type |
| ----- | ----- |
| 15 | AVATAR |
| 16 | CHALLENGE |
