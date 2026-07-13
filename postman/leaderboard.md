# LEADERBOARD

Base path: `/leaderboard/`. All endpoints require JWT authentication (`IsAuthenticated`).

There are 3 boards: **Deposit**, **Withdraw**, **Referral**. **Info** and **Campaign**
are per-board (selected by `leaderboard_type`). **Status** is a single **global**
open/closed flag shared by all boards.

Notes that apply to every endpoint:

* Admin list endpoints are **paginated** (`page` / `page_size`). Public endpoints are not paginated.
* GET responses never include `archived`.
* `leaderboard_type` is returned as the integer ID (1/2/3), not a display label.
* PUT is always a **partial** update — send only the fields you want to change.
* `archive` (PATCH) sets `archived` to now; archived rows disappear from all GET/list responses.

---

## Choices

### Leaderboard Type (`type` / `leaderboard_type`)

| ID | Type |
| ---: | :--- |
| 1 | DEPOSIT |
| 2 | WITHDRAW |
| 3 | REFERRAL |

### Item Type (`item_type`)

| ID | Item Type |
| ---: | :--- |
| 1 | FREE CREDIT |
| 2 | ITEM |
| 3 | TOKEN |
| 4 | OTHER |

---

## Summary

| Method | Path | Description |
| :--- | :--- | :--- |
| GET | `/leaderboard/info/` | List Info records (optional `?type=`) |
| GET | `/leaderboard/info/{uuid}/` | Retrieve one Info record |
| POST | `/leaderboard/info/` | Create an Info record |
| PUT | `/leaderboard/info/{uuid}/` | Update an Info record |
| PATCH | `/leaderboard/info/{uuid}/archive/` | Archive an Info record |
| GET | `/leaderboard/status/` | Read the global open/closed flag |
| PUT | `/leaderboard/status/` | Update the global open/closed flag |
| GET | `/leaderboard/campaign/` | List Campaign records (optional `?type=`) |
| GET | `/leaderboard/campaign/{uuid}/` | Retrieve one Campaign record |
| POST | `/leaderboard/campaign/` | Create a Campaign record |
| PUT | `/leaderboard/campaign/{uuid}/` | Update a Campaign record |
| PATCH | `/leaderboard/campaign/{uuid}/archive/` | Archive a Campaign record |
| GET | `/leaderboard/deposit-reward-items/` | List Deposit reward items |
| GET | `/leaderboard/deposit-reward-items/{uuid}/` | Retrieve one Deposit reward item |
| POST | `/leaderboard/deposit-reward-items/` | Create a Deposit reward item |
| PUT | `/leaderboard/deposit-reward-items/{uuid}/` | Update a Deposit reward item |
| PATCH | `/leaderboard/deposit-reward-items/{uuid}/archive/` | Archive a Deposit reward item |
| GET | `/leaderboard/deposit-fake-data/` | List Deposit fake rows |
| GET | `/leaderboard/deposit-fake-data/{uuid}/` | Retrieve one Deposit fake row |
| POST | `/leaderboard/deposit-fake-data/` | Create a Deposit fake row |
| PUT | `/leaderboard/deposit-fake-data/{uuid}/` | Update a Deposit fake row |
| PATCH | `/leaderboard/deposit-fake-data/{uuid}/archive/` | Archive a Deposit fake row |
| GET | `/leaderboard/withdraw-reward-items/` | List Withdraw reward items |
| GET | `/leaderboard/withdraw-reward-items/{uuid}/` | Retrieve one Withdraw reward item |
| POST | `/leaderboard/withdraw-reward-items/` | Create a Withdraw reward item |
| PUT | `/leaderboard/withdraw-reward-items/{uuid}/` | Update a Withdraw reward item |
| PATCH | `/leaderboard/withdraw-reward-items/{uuid}/archive/` | Archive a Withdraw reward item |
| GET | `/leaderboard/withdraw-fake-data/` | List Withdraw fake rows |
| GET | `/leaderboard/withdraw-fake-data/{uuid}/` | Retrieve one Withdraw fake row |
| POST | `/leaderboard/withdraw-fake-data/` | Create a Withdraw fake row |
| PUT | `/leaderboard/withdraw-fake-data/{uuid}/` | Update a Withdraw fake row |
| PATCH | `/leaderboard/withdraw-fake-data/{uuid}/archive/` | Archive a Withdraw fake row |
| GET | `/leaderboard/referral-reward-items/` | List Referral reward items |
| GET | `/leaderboard/referral-reward-items/{uuid}/` | Retrieve one Referral reward item |
| POST | `/leaderboard/referral-reward-items/` | Create a Referral reward item |
| PUT | `/leaderboard/referral-reward-items/{uuid}/` | Update a Referral reward item |
| PATCH | `/leaderboard/referral-reward-items/{uuid}/archive/` | Archive a Referral reward item |
| GET | `/leaderboard/referral-fake-data/` | List Referral fake rows |
| GET | `/leaderboard/referral-fake-data/{uuid}/` | Retrieve one Referral fake row |
| POST | `/leaderboard/referral-fake-data/` | Create a Referral fake row |
| PUT | `/leaderboard/referral-fake-data/{uuid}/` | Update a Referral fake row |
| PATCH | `/leaderboard/referral-fake-data/{uuid}/archive/` | Archive a Referral fake row |
| POST | `/leaderboard/generate-ranking/` | Compute & store the Top 20 batch for one board |
| GET | `/leaderboard/real-ranking/` | Live, unmasked ranking for one board — all real members, no fake rows, not capped at 20 |
| GET | `/leaderboard/public/info/` | Read Info (optional `?type=`) |
| GET | `/leaderboard/public/status/` | Read the global open/closed flag |
| GET | `/leaderboard/public/campaign/` | Read Campaign (optional `?type=`) |
| GET | `/leaderboard/public/deposit-ranking/` | Read latest Deposit Top 20 |
| GET | `/leaderboard/public/withdraw-ranking/` | Read latest Withdraw Top 20 |
| GET | `/leaderboard/public/referral-ranking/` | Read latest Referral Top 20 |

---

# ADMIN — INFO

### GET /leaderboard/info/ &nbsp;·&nbsp; GET /leaderboard/info/{uuid}/

Query Parameters (list only)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| type | Int | No | Filter by board. 1 = Deposit, 2 = Withdraw, 3 = Referral |
| page | Int | No | Page number (default 1) |
| page\_size | Int | No | Items per page (default 20, max 100) |

Paginated list response envelope

```json
{
  "count": 42,
  "next": "https://…/leaderboard/info/?page=2",
  "previous": null,
  "results": [ … ]
}
```

Response fields (each item in `results`)

| Field | Type | Description |
| :--- | :--- | :--- |
| uuid | UUID | |
| leaderboard\_type | Int | 1 = Deposit, 2 = Withdraw, 3 = Referral |
| information | Str | |
| terms\_and\_conditions | Str | |

### POST /leaderboard/info/ &nbsp;·&nbsp; PUT /leaderboard/info/{uuid}/

Request body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| leaderboard\_type | Int | Yes (create) | 1 = Deposit, 2 = Withdraw, 3 = Referral |
| information | Str | No | Defaults to `""` |
| terms\_and\_conditions | Str | No | Defaults to `""` |

Response: same as GET.

### PATCH /leaderboard/info/{uuid}/archive/

No body. Response: the archived record.

---

# ADMIN — STATUS

A single **global** open/closed flag. No `type`, no `uuid`, no create/archive — just read and update.

### GET /leaderboard/status/

No query parameters.

Response

| Field | Type | Description |
| :--- | :--- | :--- |
| is\_open | Bool | Global open/closed flag (default False) |

### PUT /leaderboard/status/

Request body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| is\_open | Bool | Yes | New value |

Response: `{ "is_open": <bool> }`

---

# ADMIN — CAMPAIGN

### GET /leaderboard/campaign/ &nbsp;·&nbsp; GET /leaderboard/campaign/{uuid}/

Query Parameters (list only)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| type | Int | No | 1 = Deposit, 2 = Withdraw, 3 = Referral |
| page | Int | No | Page number (default 1) |
| page\_size | Int | No | Items per page (default 20, max 100) |

Paginated list response envelope

```json
{
  "count": 42,
  "next": "https://…/leaderboard/campaign/?page=2",
  "previous": null,
  "results": [ … ]
}
```

Response fields (each item in `results`)

| Field | Type | Description |
| :--- | :--- | :--- |
| uuid | UUID | |
| leaderboard\_type | Int | 1 = Deposit, 2 = Withdraw, 3 = Referral |
| start\_date | Date | |
| end\_date | Date | |

### POST /leaderboard/campaign/ &nbsp;·&nbsp; PUT /leaderboard/campaign/{uuid}/

Request body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| leaderboard\_type | Int | Yes (create) | 1 = Deposit, 2 = Withdraw, 3 = Referral |
| start\_date | Date | Yes (create) | |
| end\_date | Date | Yes (create) | |

Response: same as GET.

### PATCH /leaderboard/campaign/{uuid}/archive/

No body. Response: the archived record.

---

# ADMIN — REWARD ITEMS (Deposit / Withdraw / Referral)

Same request/response for all three boards — only the path prefix differs:
`deposit-reward-items`, `withdraw-reward-items`, `referral-reward-items`.

### GET .../{board}-reward-items/ &nbsp;·&nbsp; GET .../{board}-reward-items/{uuid}/

No additional query parameters (beyond pagination). List ordered by `position`, then `reward_name`.

| Pagination param | Type | Description |
| :--- | :--- | :--- |
| page | Int | Page number (default 1) |
| page\_size | Int | Items per page (default 20, max 100) |

Paginated list response envelope

```json
{
  "count": 42,
  "next": "https://…/leaderboard/deposit-reward-items/?page=2",
  "previous": null,
  "results": [ … ]
}
```

Response fields (each item in `results`)

| Field | Type | Description |
| :--- | :--- | :--- |
| id | Int | |
| uuid | UUID | |
| reward\_name | Str | |
| position | Int / null | Rank position this reward applies to |
| quantity | Int | |
| item\_type | Int | 1 = Free Credit, 2 = Item, 3 = Token, 4 = Other |
| credit\_amount | Str (Decimal) / null | RM amount; only meaningful when `item_type` = Free Credit |
| image | Image / null | |

### POST .../{board}-reward-items/ &nbsp;·&nbsp; PUT .../{board}-reward-items/{uuid}/

Request body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| reward\_name | Str | Yes (create) | |
| position | Int | No | Minimum 0 |
| quantity | Int | Yes (create) | |
| item\_type | Int | No | 1 = Free Credit, 2 = Item, 3 = Token, 4 = Other (default) |
| credit\_amount | Str (Decimal) | No | RM amount for a Free Credit reward |
| image | Image | No | |

Response: same as GET.

### PATCH .../{board}-reward-items/{uuid}/archive/

No body. Response: the archived record.

---

# ADMIN — FAKE DATA (Deposit / Withdraw)

Same shape for both boards, path prefix differs:

| Board | Path prefix | Score field |
| :--- | :--- | :--- |
| Deposit | `deposit-fake-data` | `total_deposit` |
| Withdraw | `withdraw-fake-data` | `total_withdraw` |

### GET .../{board}-fake-data/ &nbsp;·&nbsp; GET .../{board}-fake-data/{uuid}/

No additional query parameters (beyond pagination). List ordered by `rank`.

| Pagination param | Type | Description |
| :--- | :--- | :--- |
| page | Int | Page number (default 1) |
| page\_size | Int | Items per page (default 20, max 100) |

Paginated list response envelope

```json
{
  "count": 42,
  "next": "https://…/leaderboard/deposit-fake-data/?page=2",
  "previous": null,
  "results": [ … ]
}
```

Response fields (each item in `results`)

| Field | Type | Description |
| :--- | :--- | :--- |
| id | Int | |
| uuid | UUID | |
| rank | Int | |
| player | Str | Display name (shown as-is) |
| *score field* | Str (Decimal) | `total_deposit` / `total_withdraw` — the ranking score |

### POST .../{board}-fake-data/ &nbsp;·&nbsp; PUT .../{board}-fake-data/{uuid}/

Request body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| rank | Int | Yes (create) | |
| player | Str | Yes (create) | |
| *score field* | Str (Decimal) | Yes (create) | `total_deposit` / `total_withdraw` |

Response: same as GET.

### PATCH .../{board}-fake-data/{uuid}/archive/

No body. Response: the archived record.

---

# ADMIN — FAKE DATA (Referral)

### GET /leaderboard/referral-fake-data/ &nbsp;·&nbsp; GET /leaderboard/referral-fake-data/{uuid}/

No additional query parameters (beyond pagination). List ordered by `rank`.

| Pagination param | Type | Description |
| :--- | :--- | :--- |
| page | Int | Page number (default 1) |
| page\_size | Int | Items per page (default 20, max 100) |

Paginated list response envelope

```json
{
  "count": 42,
  "next": "https://…/leaderboard/referral-fake-data/?page=2",
  "previous": null,
  "results": [ … ]
}
```

Response fields (each item in `results`)

| Field | Type | Description |
| :--- | :--- | :--- |
| id | Int | |
| uuid | UUID | |
| rank | Int | |
| player | Str | Display name (shown as-is) |
| total\_referral\_deposit | Str (Decimal) | Total qualifying deposit amount used for ranking |
| total\_member | Int | Number of qualified referred members (used as tiebreaker) |

### POST /leaderboard/referral-fake-data/ &nbsp;·&nbsp; PUT /leaderboard/referral-fake-data/{uuid}/

Request body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| rank | Int | Yes (create) | |
| player | Str | Yes (create) | |
| total\_referral\_deposit | Str (Decimal) | Yes (create) | Total qualifying referral deposit in RM |
| total\_member | Int | No | Number of qualified referred members (default 0) |

Response: same as GET.

### PATCH /leaderboard/referral-fake-data/{uuid}/archive/

No body. Response: the archived record.

---

# ADMIN — GENERATE RANKING

### POST /leaderboard/generate-ranking/

Computes the Top 20 for one board and stores it as a new batch, then returns it.

Request body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| leaderboard\_type | Int | Yes | 1 = Deposit, 2 = Withdraw, 3 = Referral |

Response (list, up to 20, rank ascending)

| Field | Type | Description |
| :--- | :--- | :--- |
| rank | Int | 1–20 |
| display\_name | Str | Masked real member name (e.g. `J**n`) or the fake row's `player` |
| amount | Str (Decimal) | Deposit/Withdraw total, or referral qualifying deposit total, in RM |
| count | Int | Deposit/Withdraw: number of qualifying transactions. Referral: number of qualified referred members (each must deposit ≥ RM 200 within the same calendar month). |

Returns **400** if `leaderboard_type` is missing, not an integer, or not 1/2/3.

---

# ADMIN — REAL RANKING

### GET /leaderboard/real-ranking/

Computed live on every request from this calendar month's transactions/referrals —
nothing is read from or written to `LeaderboardRecord`. Excludes fake rows entirely and
is **not** capped at 20; every real member with qualifying activity this month appears.
Names are the member's real `full_name` (unmasked).

Query Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| type | Int | Yes | 1 = Deposit, 2 = Withdraw, 3 = Referral |

Returns **400** if `type` is missing, not an integer, or not 1/2/3.

Response (list, ordered by amount desc, then count desc, then earliest-to-reach-it first; not paginated)

Deposit (`type=1`) / Withdraw (`type=2`)

| Field | Type | Description |
| :--- | :--- | :--- |
| rank | Int | 1-based, no cap |
| member\_id | Int | |
| full\_name | Str | Member's real name (or phone number / "Unknown" fallback) — unmasked |
| amount | Str (Decimal) | Deposit/Withdraw total in RM for this calendar month |
| count | Int | Number of qualifying transactions this month |

Referral (`type=3`)

| Field | Type | Description |
| :--- | :--- | :--- |
| rank | Int | 1-based, no cap |
| member\_id | Int | The referrer |
| full\_name | Str | Referrer's real name — unmasked |
| amount | Str (Decimal) | Total qualifying deposit made by this referrer's downlines this month, in RM |
| new\_member | Int | Number of downlines who qualified this month (each must deposit ≥ RM 200 within the same calendar month) |

---

# PUBLIC — INFO / STATUS / CAMPAIGN

### GET /leaderboard/public/info/ &nbsp;·&nbsp; GET /leaderboard/public/campaign/

Query Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| type | Int | No | 1 = Deposit, 2 = Withdraw, 3 = Referral. Omit to return all. Returns **400** if not an integer |

Response: same fields as the matching ADMIN — INFO / CAMPAIGN GET response.

### GET /leaderboard/public/status/

No query parameters.

| Field | Type | Description |
| :--- | :--- | :--- |
| is\_open | Bool | Global open/closed flag |

---

# PUBLIC — RANKING

Three per-board endpoints (no query parameters). Each returns the latest generated Top 20
batch for its board, or an empty list if none has been generated yet.

* GET `/leaderboard/public/deposit-ranking/`
* GET `/leaderboard/public/withdraw-ranking/`
* GET `/leaderboard/public/referral-ranking/`

Response (list, up to 20, rank ascending)

| Field | Type | Description |
| :--- | :--- | :--- |
| rank | Int | 1–20 |
| display\_name | Str | Masked real member name or fake row's `player` |
| amount | Str (Decimal) | Deposit/Withdraw total, or referral qualifying deposit total, in RM |
| count | Int | Deposit/Withdraw: number of qualifying transactions. Referral: number of qualified referred members (each must deposit ≥ RM 200 within the same calendar month). |
