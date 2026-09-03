# Requirement 1 — rows 27–46 status tracker

Source: `doc/[MRS] - Project Details -  Bug & Enhancement - Requirement 1 (1).tsv` +
`doc/[MRS] -  New Requirement & Enhancement (1).pptx` (slide 12 covers row 31/32).
Cross-checked against `postman/usage-report-api-reference.md` and live staging
(`https://staging-api.kinggroup44.com`) on 2026-09-02.

Update this file as each row is finished — that's its whole job.

| Row | Requirement | Status | Notes |
|---|---|---|---|
| 27 | Sequence Import Template | ✅ Done | Shipped in the sequence-import work (see `postman/sequence-import-format.md`) |
| 28 | Usage Report – add Avatar to Game filter | ✅ Done | Avatar (`game=5`) confirmed live in `/usage-report/games/` — filter is built from that response |
| 29 | Add Avatar to Game Performance | ✅ Done | Confirmed live |
| 30 | Add Avatar to Cohort Retention | ✅ Done | Confirmed live in `/usage-report/games/retention/` |
| 31 | Rename "Tokens Consumed" → "Total Withdrawal" | ✅ Done | Slide 12 confirmed: label-only rename of the existing `total_tokens_consumed` field, no new backend metric. Card now reads that field |
| 32 | Add Avg. Session Duration (per selected game) | ✅ Done | Wired to the real `avg_sessions_per_day` field (Games endpoint, confirmed live); "All Games" derives the same ratio from `total_sessions ÷ days in range` since the API only reports it per-game |
| 33 | Avg. Session Duration calculation/display | ⏸ Placeholder in place | Field is correct now; display is a plain "X.XX / day" — user said the final visual treatment is a separate task for later |
| 34 | Rename Daily Activity History → Member Usage History | ✅ Done | |
| 35 | Member Usage History columns | ✅ Done | "Total Withdrawal" column removed per user (no per-member field exists for it) — the other 9 columns unchanged |
| 36 | Member Usage History sorting | ✅ Done | Now sends `sort=<key>` (no direction — the API always sorts high→low, confirmed live). Sort keys fixed to the API's real names (`battle_point_used`, `avg_sessions_per_day`); the asc/desc toggle UI is gone since there's no ascending mode |
| 37 | Member Avg. Session Duration | ✅ Done | Same `avg_sessions_per_day` fix as #32, applied to the table column |
| 38 | Reward Report Summary totals | ✅ Done | Swapped the client-side sweep for the real `/member/reward-report-kpi/` endpoint (confirmed live); totals now render as gold KpiCards (same pattern as Member Alert / PIC Dashboard) instead of the old thin bar |
| 39 | Totals default to current month when no date picked | ✅ Done | Reward Report now shares Usage Report's Daily/Monthly/Yearly + custom range picker; loads on "Monthly" (day 1 of the current month → today) by default |
| 40 | All filters affect the totals | ✅ Done | Same filter object goes to both the table and the KPI call |
| 41 | Total Credit Amount | ✅ Done | Now exact, straight from the KPI endpoint instead of regex-parsed off `reward_details` text |
| 42 | Total Prizes Claimed (count) | ✅ Done | Same as #41 |
| 43 | Show both totals when no category selected | ✅ Carries over | Existing show/hide-by-category logic is correct and unaffected |
| 44 | Member List – Current Battle Points | ✅ Done | Shipped in a prior commit (`current_bp`) |
| 45 | MRS Homepage – move "Special For You" banner | 📝 Noted, not started | User: "Special For You" is just the section name/label on the Homepage; the actual banner *items* shown there come from an existing API — likely the same one driving banners on the current main/location page today (`ENDPOINTS.ADMIN.BANNERS` / `/settings/banners/`?) — needs tracing before implementing |
| 46 | MRS Homepage – remove brand character art from theme | 📝 Noted, not started | Not yet investigated |

## Separate, non-tsv item: mission start/end date → datetime

`POST/PUT /mission/missions/` and `POST/PUT /avatar/avatar-missions/` now require a full
ISO-8601 datetime for `start_date`/`end_date` (was date-only). Confirmed live: a
time-based mission's response already returns e.g. `"2026-06-09T08:00:00+08:00"`, and
there is **no** separate `start_time`/`end_time` field on the model.

| File | Status | Notes |
|---|---|---|
| `app/admin/mission-game/add/page.jsx` | ✅ Done | `toPayload()` now combines the existing Date+Time inputs into one ISO datetime string per field (`start_date`/`end_date`); dropped the stale `start_time`/`end_time` keys |
| `app/admin/avatar/missions/add/page.jsx` | ✅ Done | Added Start Time / End Time inputs next to each date (new `TimeField` in `GameUI.jsx`); combined into one ISO datetime string on save; reads the time back out correctly when editing |

## Reward Report ⇄ Usage Report date range unification

✅ Done — both pages now share `app/components/admin/reports/ReportRangeBar.jsx`
(Daily/Monthly/Yearly presets + custom range), factored out of what was Usage Report's
own `FilterBar`. Reward Report's old plain from/to filter and its separate
"no date = this month, no date on table = unfiltered" special-casing are gone; both
pages default to "Monthly" (day 1 of the current month → today) on first load, and every
API call on each page reads from that one shared `range` state.
