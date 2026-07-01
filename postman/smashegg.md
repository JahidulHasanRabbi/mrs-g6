# SMASH EGG

Base path: `/smash-egg/` for admin and the public winning-list feed.
Play and smash-history endpoints live under `/member/` instead (same convention as Lucky
Spin's `one-spin`/`ten-spin`/`fifty-spin` and Penalty Kick's `kick`/`kick-history`) — see
the USER PAGE section below for exact paths.

All endpoints require JWT authentication.

---

## Reference

### Item Type (`SMASH_EGG_ITEM_CHOICE`)

| ID | Item Type | Notes |
| --- | --- | --- |
| 1 | FREE CREDIT | Awards a random amount between `min_withdraw`–`max_withdraw`. Only this type is eligible for promotion-code crediting (real money via third-party API in production) |
| 2 | TOKEN | Awards `token_amount` tokens, credited immediately |
| 3 | PRIZE | Logged as a `MemberReward` (category "Prize") for staff to fulfil manually |

### Game Status (`GAME_STATUS_CHOICE`)

| ID | Status |
| --- | --- |
| 1 | OPEN |
| 2 | CLOSE |

### How a smash resolves

Each smash advances the member's personal pointer (`MemberSmashSequence.current_sequence`) through the **admin-defined sequence** (`SmashSequence`, ordered by `item_order`), wrapping back to the start once the end is reached — i.e. every member cycles through the same fixed sequence of items rather than landing on a fully random item each time. Cost is charged in **tokens**: `total_cost = cost_per_smash × smashes_required`, deducted as a `MemberToken` (type 2, reason "SMASH-EGG"). A smash request fails with `"Member doesn't have enough points"` if the member's current token balance is below `total_cost`.

---

# USER PAGE

## Play

### /member/{member\_uuid}/one-smash/ POST

### /member/{member\_uuid}/ten-smash/ POST

### /member/{member\_uuid}/fifty-smash/ POST

### /member/{member\_uuid}/hundred-smash/ POST

Runs 1 / 10 / 50 / 100 smashes in a single atomic call. Fails if the game is closed or under maintenance (`game_status`/`maintenance_mode` from Smash Egg Settings), if no `SmashSequence` rows exist, or if the member's token balance is below the total cost.

Output — **one-smash**: single object. **ten-smash** / **fifty-smash** / **hundred-smash**: list of 10 / 50 / 100 objects, one per smash, in play order.

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No | The won item's UUID (not a per-smash log UUID) |
| **2** | image | Str | Yes | Item image **path** — relative (e.g. `/media/smashegg/xxxx.png`), **not** an absolute URL. Unlike the admin item endpoints below, this serializer never receives request context, so the domain is never prepended; the frontend must prefix its own API base URL |
| **3** | reward\_name | Str | No | Item reward name. For FREE CREDIT items, this is replaced with the formatted amount, e.g. `"RM12.50"` |

Notes
- The per-smash result does **not** include `item_type` or a raw numeric `amount` field — for FREE CREDIT wins, the only place the amount appears is baked into `reward_name` as `"RM{amount}"`. Use `/member/{member_uuid}/smash-history/` if you need the type and raw amount separately.
- Side effects per smash: a `SmashEggLog` row is always created; a `MemberReward` is logged for FREE CREDIT (category 2) and PRIZE (category 1) wins; tokens are credited immediately for TOKEN wins; in production, FREE CREDIT wins additionally call the third-party credit API and log a `MemberCredit` if a matching promotion code exists for the member's station.

---

## Smash History

### /member/{member\_uuid}/smash-history/ GET

Paginated list of the member's own smash results, most recent first.

Output (paginated)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No | Smash log UUID |
| **2** | reward\_name | Str | No | Raw item reward name (not reformatted for credit wins) |
| **3** | item\_type | Str | No | e.g. "FREE CREDIT", "TOKEN", "PRIZE" |
| **4** | amount | Float | Yes | Won amount. Only set for FREE CREDIT wins, null otherwise |
| **5** | created | Datetime | No | |

---

## Winning List

### /smash-egg/winning-list/ GET

Public feed of the 200 most recent FREE CREDIT / PRIZE wins across all members (TOKEN wins are excluded). Not paginated, not scoped to a single member.

Output (list)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No | Smash log UUID |
| **2** | datetime\_obtained | Datetime | No | |
| **3** | display\_name | Str | No | Member's full name, or masked phone number if no name set |
| **4** | prize\_name | Str | No | `"RM {amount}"` for FREE CREDIT wins, otherwise the item's `reward_name` |

---

---

# BACK OFFICE

## Smash Egg Settings

### /smash-egg/smash-egg-settings/ GET

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | game\_status | Int | No | 1 = OPEN, 2 = CLOSE |
| **2** | game\_status\_display | Str | No | e.g. "OPEN" |
| **3** | maintenance\_mode | Bool | No | |
| **4** | cost\_per\_smash | Int | No | Token cost per smash |
| **5** | description | Str | No | Game description text |

### /smash-egg/smash-egg-settings/ POST (also accepts PATCH / PUT — all three behave identically)

Singleton record, created automatically on first access. All fields optional — only send what you want to change; omitted fields are left untouched.

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | game\_status | Int | Yes | 1 = OPEN, 2 = CLOSE |
| **2** | maintenance\_mode | Bool | Yes | |
| **3** | cost\_per\_smash | Int | Yes | Must be ≥ 1 |
| **4** | description | Str | Yes | |

Output — same shape as GET above.

---

## Smash Egg Items (Admin)

### /smash-egg/smash-egg-items/ GET

### /smash-egg/smash-egg-items/{uuid}/ GET

Not paginated — returns a plain list. Excludes archived items, ordered by `reward_name`.

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No | Internal numeric ID (in addition to `uuid`) |
| **2** | uuid | UUID | No | |
| **3** | reward\_name | Str | No | |
| **4** | item\_type | Str | No | Display value, e.g. "FREE CREDIT" |
| **5** | min\_withdraw | Decimal | Yes | FREE CREDIT items only |
| **6** | max\_withdraw | Decimal | Yes | FREE CREDIT items only. If null, `get_random_withdraw()` always returns 0 |
| **7** | token\_amount | Int | Yes | TOKEN items only |
| **8** | unlimited | Bool | No | |
| **9** | quantity | Int | No | Ignored — **not currently enforced** as a stock limit anywhere in the smash flow (same as Lucky Spin's `quantity` field) |
| **10** | image | Image | Yes | Returned as a full **absolute URL** (domain included) — this serializer always gets request context, unlike the one-smash/ten-smash/fifty-smash/hundred-smash play results above |

### /smash-egg/smash-egg-items/ POST

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | reward\_name | Str | No | |
| **2** | unlimited | Bool | No | |
| **3** | quantity | Int | No (No when `unlimited=False`) | **Must be omitted** when `unlimited=True` (rejected with 400 otherwise). **Required** when `unlimited=False` |
| **4** | item\_type | Int | Yes | 1 = FREE CREDIT, 2 = TOKEN, 3 = PRIZE. Defaults to 3 (PRIZE) if omitted |
| **5** | min\_withdraw | Decimal | Yes | |
| **6** | max\_withdraw | Decimal | Yes | |
| **7** | token\_amount | Int | Yes | |
| **8** | image | Image | Yes | |

### /smash-egg/smash-egg-items/{uuid}/ PUT

⚠️ **Known issue** — although this endpoint is called with `partial=True`, the serializer's `validate()` does not fall back to the existing item's current `unlimited`/`quantity` values. In practice this means **any partial update that doesn't resend both `unlimited` and `quantity` together fails** with `400 {"quantity": "This field is required when unlimited is False."}` — including edits that have nothing to do with stock, e.g. renaming an item or changing its withdraw range. Workaround: always include the item's current `unlimited` and (if `unlimited=False`) `quantity` value in every PUT, even when you're only changing an unrelated field.

Input — same fields as POST above (all effectively required together due to the issue above).

Output — same shape as the GET object above.

### /smash-egg/smash-egg-items/{uuid}/archive/ PATCH

---

## Smash Sequences (Admin)

The sequence is the fixed loop every member's smashes walk through, in `item_order` ascending order.

### /smash-egg/smash-sequences/ GET

### /smash-egg/smash-sequences/{uuid}/ GET

Paginated, ordered by `item_order`.

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No | |
| **2** | uuid | UUID | No | |
| **3** | item\_order | Int | No | Position in the sequence |
| **4** | item\_name | Str | No | The linked item's `reward_name` |
| **5** | item\_uuid | UUID | No | The linked item's UUID |

### /smash-egg/smash-sequences/ POST

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | item\_order | Int | No | |
| **2** | item\_uuid | UUID | No | Must reference an existing `SmashEggItem` |

### /smash-egg/smash-sequences/change-smash-sequences/ PATCH

Bulk-reorders existing sequence rows in one call (e.g. drag-and-drop reordering in an admin UI).

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | smashes | List | No | List of `{sequence_uuid, item_order}` objects |

Returns `204 No Content` on success. If any `sequence_uuid` doesn't exist, the whole request fails with `400` and **no rows are updated** (validated before the bulk update runs).

### /smash-egg/smash-sequences/{uuid}/ DELETE

Permanently removes a sequence slot (not a soft-archive). Returns `204 No Content`. Removing a slot shrinks the total sequence length — members' stored `current_sequence` pointer is a raw position index, so it is automatically taken modulo the new (shorter) length on their next smash; no manual fix-up needed.

---

## Promotion Codes

FREE CREDIT items (`item_type = 1`) can be linked to a per-station promotion code via the shared Settings → Promotions endpoint (`promotion_type = 8`, see `apps/settings`), exactly mirroring how Lucky Spin items are linked (`promotion_type = 4`). Only FREE CREDIT items participate in promotion-code lookups during a smash — PRIZE/TOKEN items are unaffected by any promotion code you assign them.
