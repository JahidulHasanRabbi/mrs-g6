# Mission API Documentation

# Table of Contents

[**MISSION**](#mission)

[Mission Management - GET](#mission-management---get)

[Mission Management - POST/PUT](#mission-management---post/put)

[Mission Management - ARCHIVE](#mission-management---archive)

[My Missions](#my-missions)

[Claim Mission Reward](#claim-mission-reward)

[Mission Progress History](#mission-progress-history)

[Terms and Conditions](#terms-and-conditions)

---

# MISSION {#mission}

Missions are tasks members can join, progress through, and claim token rewards from once completed. A member must explicitly **join** a mission before any progress is tracked for them - progress is never started automatically.

| ID | Mission Category |
| ----- | ----- |
| 1 | Daily Mission |
| 2 | Weekly Mission |
| 3 | Challenge Mission |

| ID | Mission Type |
| ----- | ----- |
| 1 | One Time |
| 2 | Repeatable |
| 3 | Recurring |

| ID | Mission Reset Type |
| ----- | ----- |
| 1 | Daily |
| 2 | Weekly |
| 3 | Monthly |
| 4 | None |

| ID | Mission Condition Action |
| ----- | ----- |
| 1 | Login |
| 2 | Deposit Amount |
| 3 | Play Spin |
| 4 | Play Smash |
| 5 | Check In |
| 6 | Play Kick |
| 7 | Withdraw Amount |
| 8 | Referral Friend |
| 9 | Redemption |

| ID | Mission Progress Status |
| ----- | ----- |
| 1 | In Progress |
| 2 | Completed |
| 3 | Claimed |

## Mission Management - GET {#mission-management---get}

#### /mission/missions/ GET {#/mission/missions/-get}

#### /mission/missions/{uuid}/ GET {#/mission/missions/{uuid}/-get}

Query Parameters (list only)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | Yes | For Pagination |
| **2** | page_size | Int | Yes | For Pagination |
| **3** | category | Int | Yes | 1 = Daily Mission 2 = Weekly Mission 3 = Challenge Mission |

Output (List is paginated, has count, next, previous, and results)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | mission_name | Str | No |  |
| **4** | category | Int | No | 1 = Daily Mission 2 = Weekly Mission 3 = Challenge Mission |
| **5** | description | Str | Yes |  |
| **6** | mission_type | Int | No | 1 = One Time 2 = Repeatable 3 = Recurring |
| **7** | reset_type | Int | No | 1 = Daily 2 = Weekly 3 = Monthly 4 = None |
| **8** | condition_action | Int | No | 1 = Login 2 = Deposit Amount 3 = Play Spin 4 = Play Smash 5 = Check In 6 = Play Kick 7 = Withdraw Amount 8 = Referral Friend 9 = Redemption |
| **9** | is_time_based | Bool | No | If True, mission is only live between start_date and end_date |
| **10** | start_date | Date | Yes | Only set when is_time_based is True |
| **11** | end_date | Date | Yes | Only set when is_time_based is True |
| **12** | accumulate_target | Int | No | Progress value required to complete the mission |
| **13** | reward_token_quantity | Int | No | Tokens awarded on claim |
| **14** | limit_control | Int | Yes | Max number of times a member may claim this mission. Null = unlimited |

## Mission Management - POST/PUT {#mission-management---post/put}

#### /mission/missions/ POST {#/mission/missions/-post}

#### /mission/missions/{uuid}/ PUT {#/mission/missions/{uuid}/-put}

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | mission_name | Str | No |  |
| **2** | category | Int | No | 1 = Daily Mission 2 = Weekly Mission 3 = Challenge Mission |
| **3** | description | Str | Yes |  |
| **4** | mission_type | Int | No | 1 = One Time 2 = Repeatable 3 = Recurring |
| **5** | reset_type | Int | No | 1 = Daily 2 = Weekly 3 = Monthly 4 = None |
| **6** | condition_action | Int | No | 1 = Login 2 = Deposit Amount 3 = Play Spin 4 = Play Smash 5 = Check In 6 = Play Kick 7 = Withdraw Amount 8 = Referral Friend 9 = Redemption |
| **7** | is_time_based | Bool | Yes | Defaults to False. If True, start_date and end_date are required |
| **8** | start_date | Date | Yes | Required if is_time_based is True. Must not be provided otherwise |
| **9** | end_date | Date | Yes | Required if is_time_based is True, and must not be before start_date. Must not be provided otherwise |
| **10** | accumulate_target | Int | No | Minimum value 1 |
| **11** | reward_token_quantity | Int | No | Minimum value 0 |
| **12** | limit_control | Int | Yes | Minimum value 1. Null = unlimited claims |

## Mission Management - ARCHIVE {#mission-management---archive}

#### /mission/missions/{uuid}/archive/ PATCH {#/mission/missions/{uuid}/archive/-patch}

## My Missions {#my-missions}

#### /mission/missions/my-missions/ GET {#/mission/missions/my-missions/-get}

Can only be triggered by members. Returns missions that are currently live (within start_date / end_date, if time based), along with the member's own joined/progress state for each.

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | Yes | For Pagination |
| **2** | page_size | Int | Yes | For Pagination |
| **3** | category | Int | Yes | 1 = Daily Mission 2 = Weekly Mission 3 = Challenge Mission |

Output (Is paginated, has count, next, previous, and results)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | mission_name | Str | No |  |
| **3** | category | Int | No | 1 = Daily Mission 2 = Weekly Mission 3 = Challenge Mission |
| **4** | description | Str | Yes |  |
| **5** | accumulate_target | Int | No |  |
| **6** | reward_token_quantity | Int | No |  |
| **7** | joined | Bool | No | True if the member has joined this mission for the current period |
| **8** | current_value | Int | No | 0 if not joined |
| **9** | status | Int | Yes | Null if not joined. 1 = In Progress 2 = Completed 3 = Claimed |

## Join Mission {#join-mission}

#### /mission/missions/{uuid}/join/ POST {#/mission/missions/{uuid}/join/-post}

(uuid is mission uuid)
Can only be triggered by members. No input body required.

> **Auto-join:** Members are automatically enrolled into a mission the first time they perform the mission's condition action (e.g. first login, first deposit). This endpoint is optional — it can be used to manually join a mission before triggering any action, but it is not required.

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No | Progress record uuid |
| **2** | mission_name | Str | No |  |
| **3** | mission_uuid | UUID | No |  |
| **4** | current_value | Int | No |  |
| **5** | target_value | Int | No | mission.accumulate_target |
| **6** | status | Int | No | 1 = In Progress 2 = Completed 3 = Claimed |
| **7** | completed_at | DateTime | Yes |  |
| **8** | claimed_at | DateTime | Yes |  |

Returns 400 if the member has already joined this mission for the current period

## Claim Mission Reward {#claim-mission-reward}

#### /mission/missions/{uuid}/claim/ POST {#/mission/missions/{uuid}/claim/-post}

(uuid is mission uuid)
Can only be triggered by members. Mission must be joined and completed, not yet claimed, and within the mission's claim limit (limit_control) if one is set. On success, awards reward_token_quantity tokens to the member. No input body required.

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No | Claim record uuid |
| **2** | mission_name | Str | No |  |
| **3** | mission_uuid | UUID | No |  |
| **4** | category | Int | No | 1 = Daily Mission 2 = Weekly Mission 3 = Challenge Mission |
| **5** | token_amount | Int | No | Tokens awarded for this claim |
| **6** | created | DateTime | No |  |

Returns 400 if: not joined for the current period, mission not yet completed, reward already claimed, or claim limit reached

## Mission Progress History {#mission-progress-history}

#### /mission/missions/progress-history/ GET {#/mission/missions/progress-history/-get}

Can only be triggered by members. Returns the member's past mission reward claims.

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | Yes | For Pagination |
| **2** | page_size | Int | Yes | For Pagination |
| **3** | start_date | Date | Yes | Must be provided together with end_date |
| **4** | end_date | Date | Yes | Must be provided together with start_date |

Output (Is paginated, has count, next, previous, and results)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | mission_name | Str | No |  |
| **3** | mission_uuid | UUID | No |  |
| **4** | category | Int | No | 1 = Daily Mission 2 = Weekly Mission 3 = Challenge Mission |
| **5** | token_amount | Int | No |  |
| **6** | created | DateTime | No |  |

---

# REUSED APIS

## Terms and Conditions {#terms-and-conditions}

Mission uses category **10** in the shared T&C system. Full endpoint docs are in the main API documentation.

/settings/terms-and-conditions/ POST — set Mission T&C (admin)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | terms_and_conditions | Text | No |  |
| **2** | category | Int | No | Use **10** for Mission |

/settings/terms-and-conditions/public/10/ GET — read Mission T&C (public, no auth required)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | terms_and_conditions | Text | No |  |
