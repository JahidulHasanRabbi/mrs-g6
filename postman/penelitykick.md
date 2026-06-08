# Penalty Kick API Documentation

# Table of Contents

[**BACK OFFICE**](#back-office)

[Penalty Kick Settings - GET](#penalty-kick-settings---get)

[Penalty Kick Settings - POST](#penalty-kick-settings---post)

[Penalty Kick Items - GET](#penalty-kick-items---get)

[Penalty Kick Items - POST](#penalty-kick-items---post)

[Penalty Kick Items - PUT](#penalty-kick-items---put)

[Penalty Kick Items - ARCHIVE](#penalty-kick-items---archive)

[Kick Sequences - GET](#kick-sequences---get)

[Kick Sequences - POST](#kick-sequences---post)

[Kick Sequences - DELETE](#kick-sequences---delete)

[Kick Sequences - Reorder](#kick-sequences---reorder)

[**USER PAGE**](#user-page)

[Game Status - GET](#game-status---get)

[Kick - POST](#kick---post)

[Kick History - GET](#kick-history---get)

[Kick Full History - GET](#kick-full-history---get)

[Redeem All - POST](#redeem-all---post)

[**REUSED APIS**](#reused-apis)

[Terms and Conditions](#terms-and-conditions)

---

# BACK OFFICE

## Penalty Kick Settings - GET

/penalty-kick/penalty-kick-settings/ GET

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | game\_status | Int | No | 1 = OPEN  2 = CLOSE |
| **2** | game\_status\_display | Str | No |  |
| **3** | maintenance\_mode | Bool | No |  |
| **4** | cost\_per\_kick | Int | No | Tokens deducted per kick |
| **5** | goalkeeper\_difficulty | Int | No | 1 = EASY  2 = MEDIUM  3 = HARD |
| **6** | goalkeeper\_difficulty\_display | Str | No |  |
| **7** | easy\_probability | Int | No | Goal % when difficulty = EASY. Default 75 |
| **8** | medium\_probability | Int | No | Goal % when difficulty = MEDIUM. Default 50 |
| **9** | hard\_probability | Int | No | Goal % when difficulty = HARD. Default 25 |
| **10** | description | Str | No |  |

## Penalty Kick Settings - POST

/penalty-kick/penalty-kick-settings/ POST

All fields are optional. Only fields provided will be updated.

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | game\_status | Int | Yes | 1 = OPEN  2 = CLOSE |
| **2** | maintenance\_mode | Bool | Yes |  |
| **3** | cost\_per\_kick | Int | Yes | Min value: 1 |
| **4** | goalkeeper\_difficulty | Int | Yes | 1 = EASY  2 = MEDIUM  3 = HARD |
| **5** | easy\_probability | Int | Yes | 1–100. Goal % when difficulty = EASY |
| **6** | medium\_probability | Int | Yes | 1–100. Goal % when difficulty = MEDIUM |
| **7** | hard\_probability | Int | Yes | 1–100. Goal % when difficulty = HARD |
| **8** | description | Str | Yes |  |

Returns same fields as GET

## Penalty Kick Items - GET

/penalty-kick/penalty-kick-items/ GET  
/penalty-kick/penalty-kick-items/{uuid}/ GET

Archived items are excluded from the list. A single archived item returns 404.

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | reward\_name | Str | No |  |
| **4** | item\_type | Str | No | See Item Type Enum below |
| **5** | unlimited | Bool | No |  |
| **6** | quantity | Int | No | 0 if unlimited is True |
| **7** | image | Image | Yes |  |
| **8** | min\_withdraw | Str (Decimal) | Yes | Only if item\_type = FREE CREDIT |
| **9** | max\_withdraw | Str (Decimal) | Yes | Only if item\_type = FREE CREDIT |
| **10** | token\_amount | Int | Yes | Only if item\_type = TOKEN |
| **11** | score\_amount | Int | Yes | Only if item\_type = WORLD CUP SCORE |

| ID | Item Type |
| ----- | ----- |
| 1 | FREE CREDIT |
| 2 | TOKEN |
| 3 | PRIZE |
| 4 | WORLD CUP SCORE |

## Penalty Kick Items - POST

/penalty-kick/penalty-kick-items/ POST

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | reward\_name | Str | No |  |
| **2** | unlimited | Bool | No |  |
| **3** | quantity | Int | ? | Required if unlimited = False. Must not be provided if unlimited = True. |
| **4** | item\_type | Int | Yes | See Item Type Enum above |
| **5** | image | Image | Yes |  |
| **6** | min\_withdraw | Str (Decimal) | Yes | For item\_type = 1 (FREE CREDIT) |
| **7** | max\_withdraw | Str (Decimal) | Yes | For item\_type = 1 (FREE CREDIT) |
| **8** | token\_amount | Int | Yes | For item\_type = 2 (TOKEN) |
| **9** | score\_amount | Int | Yes | For item\_type = 4 (WORLD CUP SCORE) |

Returns 201 with same fields as GET

## Penalty Kick Items - PUT

/penalty-kick/penalty-kick-items/{uuid}/ PUT

Same input fields as POST. Returns 200 with same fields as GET.

## Penalty Kick Items - ARCHIVE

/penalty-kick/penalty-kick-items/{uuid}/archive/ PATCH

No request body. Returns 200 with the item's final state.  
Returns 400 if item is already archived or does not exist.

## Kick Sequences - GET

/penalty-kick/kick-sequences/ GET  
/penalty-kick/kick-sequences/{uuid}/ GET

Is paginated. Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | Yes | For Pagination |
| **2** | page\_size | Int | Yes | For Pagination |

Output (Is paginated, has count, next, previous, and results)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | item\_order | Int | No | Position in the kick reward cycle |
| **4** | item\_name | Str | No |  |
| **5** | item\_uuid | UUID | No |  |

The kick sequence cycles through items in ascending item\_order. After the last item, it wraps back to the first. Only goals advance the sequence; misses do not.

## Kick Sequences - POST

/penalty-kick/kick-sequences/ POST

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | item\_order | Int | No |  |
| **2** | item\_uuid | UUID | No | Must be an existing non-archived item |

Returns 201 with same fields as GET.

## Kick Sequences - DELETE

/penalty-kick/kick-sequences/{uuid}/ DELETE

No request body. Returns 204 on success. Returns 400 if sequence does not exist.

## Kick Sequences - Reorder

/penalty-kick/kick-sequences/change-kick-sequences/ PATCH

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | kicks | List | No | List of reorder entries below |

kicks entries

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | sequence\_uuid | UUID | No |  |
| **2** | item\_order | Int | No | New order value to assign |

Returns 204 on success. Returns 400 if any sequence\_uuid does not exist.

---

# USER PAGE

## Game Status - GET

/penalty-kick/game-status/ GET

Requires member authentication.

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | game\_status | Int | No | 1 = OPEN  2 = CLOSE |
| **2** | maintenance\_mode | Bool | No |  |

## Kick - POST

/member/\<member\_uuid\>/kick/ POST

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | direction | Int | No | 1 = LEFT  2 = MIDDLE  3 = RIGHT |

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | result | Int | No | 1 = goal  2 = saved |
| **2** | direction | Int | No | Echoes the direction sent |
| **3** | item\_uuid | UUID | Yes | Null if result = 2 (saved) |
| **4** | reward\_name | Str | Yes | Null if result = 2 (saved) |
| **5** | item\_type | Str | Yes | FREE CREDIT / TOKEN / PRIZE / WORLD CUP SCORE. Null if result = 2 (saved) |
| **6** | image | Image | Yes |  |
| **7** | amount | Float | Yes | Only if item\_type = 1 (FREE CREDIT). Null otherwise |
| **8** | my\_tokens | Int | No | Member's remaining token balance after this kick |

Returns 400 if:
- direction is not 1, 2, or 3
- member does not have enough tokens
- game\_status = CLOSE
- maintenance\_mode = True
- no kick sequences are configured

## Kick History - GET

/member/\<member\_uuid\>/kick-history/ GET

Returns only unredeemed goals. Is paginated.

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | Yes | For Pagination |
| **2** | page\_size | Int | Yes | For Pagination |

Output (Is paginated, has count, next, previous, and results)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No | Kick log UUID |
| **2** | reward\_name | Str | No |  |
| **3** | item\_type | Str | No | FREE CREDIT / TOKEN / PRIZE / WORLD CUP SCORE |
| **4** | amount | Float | Yes | Only if item\_type = FREE CREDIT. Null otherwise |
| **5** | created | Datetime | No |  |

## Kick Full History - GET

/member/\<member\_uuid\>/kick-full-history/ GET

Returns all kicks — both goals and saves. Is paginated.

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | Yes | For Pagination |
| **2** | page\_size | Int | Yes | For Pagination |

Output (Is paginated, has count, next, previous, and results)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No | Kick log UUID |
| **2** | result | Int | No | 1 = goal  2 = saved |
| **3** | reward\_name | Str | Yes | Populated if result = 1. Null if result = 2 |
| **4** | item\_type | Str | Yes | FREE CREDIT / TOKEN / PRIZE / WORLD CUP SCORE. Null if result = 2 |
| **5** | token\_cost | Int | Yes | Populated if result = 2 (tokens deducted on miss). Null if result = 1 |
| **6** | created | Datetime | No |  |

## Redeem All - POST

/member/\<member\_uuid\>/kick/redeem-all/ POST

No request body. Redeems all outstanding (unredeemed) goals at once.

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | redeemed\_count | Int | No | Number of kick logs redeemed |
| **2** | total\_credit | Str (Decimal) | No | Total FREE CREDIT amount across all redeemed logs |
| **3** | total\_tokens | Int | No | Total TOKEN amount across all redeemed logs |
| **4** | prizes | List (Str) | No | List of PRIZE reward names redeemed |

Returns 400 if there are no outstanding rewards to redeem.

---

# REUSED APIS

## Terms and Conditions

Penalty Kick uses category **7** in the shared T&C system. Full endpoint docs are in the main API documentation.

/settings/terms-and-conditions/ POST — set Penalty Kick T&C (admin)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | terms\_and\_conditions | Text | No |  |
| **2** | category | Int | No | Use **7** for Penalty Kick |

/settings/terms-and-conditions/public/7/ GET — read Penalty Kick T&C (public, no auth required)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | terms\_and\_conditions | Text | No |  |
