# Sequence Import API

Base host: `<host>`
Auth: `Authorization: Bearer <access_token>` on every endpoint.
Content type: `application/json`

## Endpoint map

| # | Method | Lucky Spin | Smash Egg | Penalty Kick |
|---|--------|-----------|-----------|--------------|
| 1 | POST | `/lucky-spin/lucky-spin-sequence-imports/` | `/smash-egg/smash-sequence-imports/` | `/penalty-kick/kick-sequence-imports/` |
| 2 | GET | `/lucky-spin/lucky-spin-sequence-imports/` | `/smash-egg/smash-sequence-imports/` | `/penalty-kick/kick-sequence-imports/` |
| 3 | GET | `/lucky-spin/lucky-spin-sequence-imports/{uuid}/` | `/smash-egg/smash-sequence-imports/{uuid}/` | `/penalty-kick/kick-sequence-imports/{uuid}/` |
| 4 | PATCH | `/lucky-spin/lucky-spin-sequence-imports/{uuid}/archive/` | `/smash-egg/smash-sequence-imports/{uuid}/archive/` | `/penalty-kick/kick-sequence-imports/{uuid}/archive/` |
| 5 | GET | `/lucky-spin/lucky-spin-sequences/current/` | `/smash-egg/smash-sequences/current/` | `/penalty-kick/kick-sequences/current/` |

All five behave identically across the three games. Examples below use Lucky Spin.

---

## 1. POST — import a sequence

`POST /lucky-spin/lucky-spin-sequence-imports/`

Replaces the whole live sequence with the rows that pass validation.

### Request

```json
{
  "rows": [
    { "item_uuid": "0f8c1a2e-1111-4a1b-9c1d-aaaaaaaaaaaa", "item_name": "RM 5",  "item_order": 1 },
    { "item_uuid": "0f8c1a2e-2222-4a1b-9c1d-bbbbbbbbbbbb", "item_name": "RM 10", "item_order": 2 },
    { "item_uuid": "0f8c1a2e-3333-4a1b-9c1d-cccccccccccc", "item_name": "RM 20", "item_order": 5 }
  ]
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `rows` | array | yes | Must not be empty. |
| `rows[].item_uuid` | uuid string | yes | The reward's `uuid`. |
| `rows[].item_name` | string | no | Stored for history only. `null`, `""` and omitted are all accepted and stored as `""`. |
| `rows[].item_order` | integer | yes | Position in the sequence. Must be >= 1. |

Notes for frontend:

- Send parsed rows as JSON. There is no file upload.
- `item_order` is stored exactly as sent. Gaps are kept as gaps — nothing is renumbered.
- Position in the `rows` array is the `row_number` used in the response (1-based).
- 5000 rows in a single call is fine.

### Response `200`

```json
{
  "success_count": 3,
  "failed_count": 2,
  "failed_rows": [
    { "row_number": 4, "reason": "Reward not found" },
    { "row_number": 7, "reason": "Duplicate item_order 5" }
  ]
}
```

| Field | Type | Notes |
|---|---|---|
| `success_count` | integer | Rows written to the live sequence. |
| `failed_count` | integer | Rows skipped. |
| `failed_rows` | array | Empty array when nothing failed. |
| `failed_rows[].row_number` | integer | 1-based index in the submitted `rows` array. |
| `failed_rows[].reason` | string | See values below. |

### `reason` values

| Value | Cause |
|---|---|
| `item_order must be 1 or higher` | `item_order` < 1 |
| `Duplicate item_order {n}` | The same `item_order` appeared earlier in the same payload |
| `Reward is archived` | UUID matches a reward that is archived |
| `Reward not found` | UUID matches no reward |

### Behaviour

- Rows are checked one by one. A bad row is skipped, never aborts the request.
- On success the old sequence is purged and replaced with the new rows.
- If **every** row fails, nothing is purged — the previous live sequence stays untouched. The import is still saved to history with `status = FAILED`.
- Every submitted row is saved to history, passed or failed.
- Concurrent imports on the same game are serialised; two simultaneous imports cannot double the sequence.

### Errors

`400` — payload invalid (bad uuid format, `item_order` not an integer, `rows` missing or empty)

```json
{
  "error": "Data submitted is invalid",
  "details": {
    "rows": {
      "0": { "item_uuid": ["Must be a valid UUID."] }
    }
  }
}
```

`401` — missing or invalid token

```json
{ "detail": "Authentication credentials were not provided." }
```

---

## 2. GET — import history list

`GET /lucky-spin/lucky-spin-sequence-imports/`

Newest first. Archived imports are excluded.

### Query params

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | integer | 1 | |
| `page_size` | integer | 20 | Max 100. |

### Response `200`

```json
{
  "count": 42,
  "next": "http://<host>/lucky-spin/lucky-spin-sequence-imports/?page=2",
  "previous": null,
  "results": [
    {
      "uuid": "9b1e6d5c-4a2f-4c1e-8f3a-7d2b5e9a0c11",
      "created": "2026-09-01T10:14:33.512345Z",
      "imported_by": "admin",
      "total_rows": 500,
      "success_count": 498,
      "failed_count": 2,
      "status": "PARTIAL",
      "archived": null
    }
  ]
}
```

| Field | Type | Notes |
|---|---|---|
| `uuid` | uuid string | Use for detail and archive. |
| `created` | datetime | ISO 8601 UTC. |
| `imported_by` | string | Username, `""` if unknown. |
| `total_rows` | integer | `success_count + failed_count`. |
| `success_count` | integer | |
| `failed_count` | integer | |
| `status` | string | `SUCCESS` \| `PARTIAL` \| `FAILED` |
| `archived` | datetime \| null | Always `null` in this list. |

`status`: `SUCCESS` = every row saved, `PARTIAL` = some rows failed, `FAILED` = every row failed (live sequence unchanged).

---

## 3. GET — import detail

`GET /lucky-spin/lucky-spin-sequence-imports/{uuid}/`

Same header fields as the list, plus a paginated `rows` block.

### Query params

| Param | Type | Default | Notes |
|---|---|---|---|
| `status` | string | — | `saved` or `failed`. Any other value returns `400`. |
| `page` | integer | 1 | Applies to `rows`. |
| `page_size` | integer | 20 | Max 100. |

### Response `200`

```json
{
  "uuid": "9b1e6d5c-4a2f-4c1e-8f3a-7d2b5e9a0c11",
  "created": "2026-09-01T10:14:33.512345Z",
  "imported_by": "admin",
  "total_rows": 500,
  "success_count": 498,
  "failed_count": 2,
  "status": "PARTIAL",
  "archived": null,
  "rows": {
    "count": 500,
    "next": "http://<host>/lucky-spin/lucky-spin-sequence-imports/9b1e6d5c-4a2f-4c1e-8f3a-7d2b5e9a0c11/?page=2",
    "previous": null,
    "results": [
      {
        "uuid": "3c2a1b09-8877-4d6e-9a5b-112233445566",
        "row_number": 1,
        "item_uuid": "0f8c1a2e-1111-4a1b-9c1d-aaaaaaaaaaaa",
        "item_name": "RM 5",
        "item_order": 1,
        "status": "SAVED",
        "reason": ""
      },
      {
        "uuid": "4d3b2c10-9988-4e7f-8b6c-223344556677",
        "row_number": 4,
        "item_uuid": "0f8c1a2e-9999-4a1b-9c1d-dddddddddddd",
        "item_name": "RM 99",
        "item_order": 4,
        "status": "FAILED",
        "reason": "Reward not found"
      }
    ]
  }
}
```

| Field | Type | Notes |
|---|---|---|
| `rows.count` | integer | Total after the `status` filter. |
| `rows.next` / `rows.previous` | string \| null | |
| `rows.results[].uuid` | uuid string | Row id. |
| `rows.results[].row_number` | integer | 1-based index in the original payload. |
| `rows.results[].item_uuid` | uuid string \| null | Exactly as submitted. |
| `rows.results[].item_name` | string | `""` when not supplied. |
| `rows.results[].item_order` | integer \| null | Exactly as submitted. |
| `rows.results[].status` | string | `SAVED` \| `FAILED` |
| `rows.results[].reason` | string | `""` when saved. |

Rows are always ordered by `row_number`.

### Errors

`400` — unknown, malformed or archived uuid

```json
{
  "error": "Data does not exist",
  "details": "Lucky Spin Sequence Import 9b1e6d5c-...: does not exist"
}
```

`400` — bad `status` value

```json
{ "error": "Invalid request", "details": "status must be saved or failed" }
```

---

## 4. PATCH — archive an import

`PATCH /lucky-spin/lucky-spin-sequence-imports/{uuid}/archive/`

No request body. Soft delete: the record is hidden from the list and from detail. The live sequence is not affected.

### Response `200`

```json
{
  "uuid": "9b1e6d5c-4a2f-4c1e-8f3a-7d2b5e9a0c11",
  "created": "2026-09-01T10:14:33.512345Z",
  "imported_by": "admin",
  "total_rows": 500,
  "success_count": 498,
  "failed_count": 2,
  "status": "PARTIAL",
  "archived": "2026-09-01T11:02:07.884210Z"
}
```

### Errors

`400` — unknown uuid, malformed uuid, or already archived

```json
{
  "error": "Invalid request",
  "details": "Lucky Spin Sequence Import 9b1e6d5c-...: does not exist or is archived"
}
```

---

## 5. GET — current live sequence

`GET /lucky-spin/lucky-spin-sequences/current/`

The sequence the game is running right now. Plain array, no pagination, no query params. Ordered by `item_order` ascending.

### Response `200`

```json
[
  { "item_order": 1, "item_id": 12, "item_uuid": "0f8c1a2e-1111-4a1b-9c1d-aaaaaaaaaaaa", "item_name": "RM 5" },
  { "item_order": 5, "item_id": 13, "item_uuid": "0f8c1a2e-2222-4a1b-9c1d-bbbbbbbbbbbb", "item_name": "RM 10" },
  { "item_order": 9, "item_id": 14, "item_uuid": "0f8c1a2e-3333-4a1b-9c1d-cccccccccccc", "item_name": "RM 20" }
]
```

| Field | Type | Notes |
|---|---|---|
| `item_order` | integer | As stored. Gaps are shown as gaps. |
| `item_id` | integer | Reward id. |
| `item_uuid` | uuid string | Reward uuid — the value to send back in an import. |
| `item_name` | string | Reward name. |

Empty sequence returns `[]`.

The payload maps straight back into endpoint 1: drop `item_id`, keep `item_order`, `item_uuid`, `item_name`.
