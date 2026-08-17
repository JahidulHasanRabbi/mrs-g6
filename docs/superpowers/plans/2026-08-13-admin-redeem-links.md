# Admin Redeem Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Penalty Kick-styled admin Redeem Links area with API-backed pagination, create/edit/archive, animated current-origin link copying, and paginated history details.

**Architecture:** Register the feature in the existing sidebar and API layers, keep pure mappings and validation in a testable `.mjs` utility, and keep network orchestration in route pages while table/history components remain presentational. Reuse the existing Penalty Kick modal shell, confirmation, toast, and pagination components without changing their behavior.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, existing admin API client, Node built-in test runner.

## Global Constraints

- Match the existing Penalty Kick admin layout, form, table, modal, loading, toast, confirmation, and pagination patterns.
- Use UUIDs for all link-specific API operations.
- Use server-side pagination for both campaigns and history.
- Build copied URLs only from `window.location.origin`; no fallback or configured domain.
- Do not add member-facing redeem or claim behavior.
- Do not refactor unrelated code or introduce new permission names.

---

### Task 1: Pure Redeem-Link Domain Utilities

**Files:**
- Create: `app/components/admin/redeem-links/redeemLinkUtils.mjs`
- Test: `app/components/admin/redeem-links/redeemLinkUtils.test.mjs`

**Interfaces:**
- Produces: `STATION_OPTIONS`, `REWARD_TYPE_OPTIONS`, `mapRedeemLinkToForm(item)`, `validateRedeemLinkForm(form)`, `buildRedeemLinkPayload(form)`, `describeRedeemLinkError(error)`, `getRedeemLinkStatus(reason)`, and `buildRedeemShareUrl(origin, stationUrl, uuid)`.

- [ ] Write Node tests for label-to-value mapping, validation, integer payloads, API envelope extraction, status mapping, and encoded current-origin URL construction.
- [ ] Run `node --test app/components/admin/redeem-links/redeemLinkUtils.test.mjs` and confirm failure because the utility is missing.
- [ ] Implement the minimal pure utilities.
- [ ] Re-run the focused tests and confirm all pass.

### Task 2: API Endpoints and Admin Methods

**Files:**
- Modify: `app/api/api.js`
- Modify: `app/api/adminApi.js`

**Interfaces:**
- Produces: `ENDPOINTS.ADMIN.REDEEM_LINKS`, `REDEEM_LINK(uuid)`, `REDEEM_LINK_ARCHIVE(uuid)`, `REDEEM_LINK_HISTORY(uuid)` and six authenticated admin methods described in the design.

- [ ] Add exact redeem-link endpoint constants without changing existing constants.
- [ ] Add list/retrieve/create/update/archive/history functions using `buildQueryParams`, UUIDs, and documented HTTP methods.
- [ ] Run focused lint on both API files.

### Task 3: Sidebar and Navigation Registration

**Files:**
- Modify: `app/components/admin/Sidebar.jsx`
- Modify: `app/config/adminNavigation.js`

**Interfaces:**
- Produces: visible `redeem-links` navigation entry and active matching for every `/admin/redeem-links` route.

- [ ] Add the active-route mapping before the broader `/admin/redemption` match.
- [ ] Add a primary MRS menu item with a current-color link icon and no invented permission mapping.
- [ ] Add the same route to `ADMIN_NAVIGATION`.
- [ ] Run focused lint on the navigation files.

### Task 4: Feature Layout and Campaign Table

**Files:**
- Create: `app/admin/redeem-links/layout.jsx`
- Create: `app/components/admin/redeem-links/RedeemLinksTable.jsx`

**Interfaces:**
- Consumes: `getRedeemLinkStatus(reason)` and row callbacks.
- Produces: Penalty Kick-styled route shell and responsive campaign table with Copy, Details/History, Edit, and Archive actions.

- [ ] Implement the exact Penalty Kick route shell titled `Redeem Links`.
- [ ] Implement the presentation-only table, defensive empty state, status badge, and animated copied state controlled by props.
- [ ] Run focused lint on the new files.

### Task 5: Paginated History Modal

**Files:**
- Create: `app/components/admin/redeem-links/RedeemLinkHistoryModal.jsx`

**Interfaces:**
- Consumes: selected link, `open`, `onClose`, and `getRedeemLinkHistory` through page-provided loading/data callbacks or direct orchestration props.
- Produces: isolated modal state with summary, server pagination, loading/error/empty states, and stale-result protection.

- [ ] Build a wide modal using the Penalty Kick `ModalShell` visual contract and a Close-only footer.
- [ ] Fetch/reset history by UUID and page, preserve modal state during pagination, and ignore stale requests.
- [ ] Render documented member and timestamp fields with null fallbacks.
- [ ] Run focused lint on the modal.

### Task 6: API-Paginated List Page

**Files:**
- Create: `app/admin/redeem-links/page.jsx`

**Interfaces:**
- Consumes: admin API methods, `RedeemLinksTable`, history modal, utility share URL builder, shared pagination/toast/confirmation.
- Produces: complete list/copy/history/archive workflow.

- [ ] Fetch `page` and `page_size` from the server and render correct result ranges.
- [ ] Implement current-origin clipboard copying with per-row timeout cleanup and error toast.
- [ ] Route Add/Edit actions, open the selected history modal, and archive after confirmation.
- [ ] Correct to the prior page when archiving removes the last row from a non-first page.
- [ ] Run focused lint on the list page.

### Task 7: Dedicated Create/Edit Form

**Files:**
- Create: `app/admin/redeem-links/add/page.jsx`

**Interfaces:**
- Consumes: utility choices/mappers/validation and admin create/retrieve/update functions.
- Produces: responsive Penalty Kick-style form with complete POST/PUT payloads.

- [ ] Implement form state and exact station/reward choices.
- [ ] Load UUID from `?id=`, retrieve the record, and map response labels back to integer choices.
- [ ] Validate all required fields, scheme, positive integers, and date ordering before mutation.
- [ ] Implement create/full-update with saving guard, API error toast, success toast, and return navigation.
- [ ] Run focused lint on the form.

### Task 8: Full Verification and Cleanup

**Files:**
- Verify all files above.

- [ ] Run `node --test app/components/admin/redeem-links/redeemLinkUtils.test.mjs`.
- [ ] Run `npm run lint` and confirm no new errors.
- [ ] Run `npm.cmd run build` and confirm success.
- [ ] Inspect `git diff --check`, full diff, and status to ensure only scoped files changed and user-owned Postman files remain untouched.
- [ ] If the app can be launched safely, smoke-check the new list/form routes and confirm Penalty Kick still resolves independently.
