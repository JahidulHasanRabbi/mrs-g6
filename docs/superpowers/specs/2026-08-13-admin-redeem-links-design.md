# Admin Redeem Links Design

## Goal

Add an admin-only Redeem Links management area that follows the existing Penalty Kick admin structure and visual language. Admins can list, create, edit, archive, copy, and inspect redemption history for redeem-link campaigns using the live API documented in `postman/redemlink.md`.

The member landing and claim experience is explicitly out of scope.

## Existing Patterns to Preserve

The implementation must follow the established behavior across these existing layers:

- `app/admin/penalty-kick/layout.jsx`: page shell, responsive admin padding, system label, and gold page title.
- `app/admin/penalty-kick/page.jsx`: orchestration, loading and empty states, toast feedback, pagination placement, archive confirmation, and action-button styling.
- `app/admin/penalty-kick/add-reward/page.jsx`: dedicated add/edit route, `?id=<uuid>` edit lookup, responsive field grid, gold inputs, Back/Save actions, and disabled saving state.
- `app/components/admin/penalty-kick/RewardsTable.jsx`: dark gradient table header, row styling, responsive horizontal scrolling, gold Edit action, and dark Archive action.
- `app/components/admin/penalty-kick/ModalShell.jsx`: modal portal, backdrop, Escape handling, scroll locking, typography, and action area.
- `app/components/admin/ui/ConfirmDialog.jsx`, `Toast.jsx`, and `app/components/admin/members/DataTable.jsx`: confirmations, user feedback, and numbered pagination.
- `app/components/admin/Sidebar.jsx`, `app/config/adminNavigation.js`, and `app/config/adminPermissions.js`: navigation registration, active-route resolution, collapsed/search behavior, and existing permission-filter semantics.
- `app/api/api.js`, `app/api/adminApi.js`, `app/api/apiClient.js`, and `app/api/queryParams.js`: endpoint constants, authenticated admin requests, query construction, token refresh, and API error envelopes.

The feature must not refactor unrelated admin code or change existing routes, API functions, menu behavior, or shared visual primitives.

## Routes and Navigation

Add a primary MRS System sidebar item:

- Label: `Redeem Links`
- Route: `/admin/redeem-links`
- Active item ID: `redeem-links`
- Icon: an existing suitable link/gift icon asset if available; otherwise a small inline link SVG using `currentColor`, consistent with Sidebar icon handling.

`pathnameToActiveItem` must treat `/admin/redeem-links` and every child route as active for this item. Add the route to `ADMIN_NAVIGATION` for consistency with the repository's secondary navigation registry.

No new frontend permission name will be invented because the login response and current permission catalog do not define redeem-link permissions. Existing backend authentication and the current default route-access behavior remain authoritative.

## Page Architecture

Create a dedicated feature folder:

- `app/admin/redeem-links/layout.jsx`: Penalty Kick-style shell titled `Redeem Links`.
- `app/admin/redeem-links/page.jsx`: list orchestration, server pagination, archive confirmation, copy state, and history modal state.
- `app/admin/redeem-links/add/page.jsx`: create/edit form; editing is selected with `?id=<uuid>`.
- `app/components/admin/redeem-links/RedeemLinksTable.jsx`: presentation-only campaign table.
- `app/components/admin/redeem-links/RedeemLinkHistoryModal.jsx`: modal and independently paginated history table.
- `app/components/admin/redeem-links/redeemLinkUtils.js`: stable choice mappings, payload mapping, availability/status mapping, share-link construction, and API error description.

The list page owns network calls and mutation state. Table and modal components receive data and callbacks and do not import the API client directly. This mirrors the Penalty Kick orchestration boundary while keeping the history flow isolated.

## API Integration

Add endpoint constants under `ENDPOINTS.ADMIN`:

- `REDEEM_LINKS`: `/redemption/redeem-links/`
- `REDEEM_LINK(uuid)`: `/redemption/redeem-links/${uuid}/`
- `REDEEM_LINK_ARCHIVE(uuid)`: `/redemption/redeem-links/${uuid}/archive/`
- `REDEEM_LINK_HISTORY(uuid)`: `/redemption/redeem-links/${uuid}/history/`

Add authenticated admin API functions:

- `getRedeemLinks({ page, page_size })`
- `getRedeemLink(uuid)`
- `createRedeemLink(data)`
- `updateRedeemLink(uuid, data)` using full `PUT`
- `archiveRedeemLink(uuid)` using `PATCH` with no body
- `getRedeemLinkHistory(uuid, { page, page_size })`

Every retrieve, update, archive, and history request uses the link UUID, never its numeric `id`. List and history pagination use the server's `count`, `next`, `previous`, and `results`; the frontend must not slice a previously fetched list.

## Redeem Links List

The page uses the Penalty Kick card shell: `#041502`, 16px radius, gold upper shadow, a 26px `Redeem Links` card heading, and a gold-filled `Add Redeem Link` button.

The table is horizontally scrollable and contains:

- Name
- Station
- Reward
- Amount
- Quantity
- Redeemed
- Remaining
- Start Date
- End Date
- Status
- Share Link
- Action

Status derives from `unavailable_reason`:

- `null`: Available
- not started: Scheduled
- expired: Expired
- quota full: Quota Full
- archived: Archived (defensive only; archived records should not be returned by list)

Use a text-and-dot badge so status is not conveyed by color alone.

Each row provides:

- `Copy Link`: copies the generated member URL. On success, its icon/label animate briefly to a checkmark and `Copied`, then return to normal. Clipboard failure shows an error toast and does not show the success state.
- `Details / History`: opens the history modal for that row.
- `Edit`: routes to `/admin/redeem-links/add?id=<uuid>`.
- `Archive`: opens the shared confirmation dialog. Confirming archives the link, closes the dialog, shows a success toast, and reloads the current server page. If the last item on a non-first page disappears, reload the previous page.

The footer reports the server range, for example `Showing 21 to 27 of 27 Results`, and uses the existing numbered `Pagination` component.

## Share-Link Construction

The browser constructs the member URL only when the admin clicks Copy:

```text
window.location.origin/?o=<URL-encoded station_url>&reward=<URL-encoded uuid>
```

There is no hardcoded domain, environment-variable domain, or fallback domain. `window.location.origin` is the sole base, so copied links automatically match the frontend host currently serving the admin panel.

The utility accepts the origin as an explicit argument (`buildRedeemShareUrl(origin, stationUrl, uuid)`) so URL construction remains deterministic and testable without accessing `window` at module initialization.

## Add and Edit Form

The form follows the Penalty Kick dedicated form page rather than using an inline modal. It uses a responsive three-column grid, dark green card, gold border controls, dark date pickers, and Back/Save buttons.

Fields:

- Campaign Name: required text.
- Station: required select with exact API choices: `1 N1GANG`, `2 KGAME99`, `3 EP369`, `4 ACEBET77`, `5 UBETCLUB`, `6 LV918`.
- Station URL: required URL including `http://` or `https://`.
- Reward Type: required select with exact API choices: `1 TOKEN`, `2 BATTLE POINT`, `3 FREE CREDIT`.
- Amount: required integer, minimum 1.
- Quantity: required integer, minimum 1.
- Start Date: required `YYYY-MM-DD` date.
- End Date: required `YYYY-MM-DD` date and not earlier than Start Date.

Create posts all fields. Edit first retrieves by UUID, maps response labels back to integer select values, and submits every field using full `PUT`. A loading card is shown during edit retrieval. Save is disabled while submitting to prevent duplicate mutations.

Client validation provides immediate toast or inline feedback for missing fields, invalid integers, URL scheme, and date ordering. Backend validation remains authoritative. API errors must extract useful text from both documented shapes:

- `{ error, details: "message" }`
- `{ error, details: { field: ["message"] } }`
- `{ detail: "message" }`

Successful create/update shows a toast and returns to `/admin/redeem-links`.

Free Credit promotion-code configuration is out of scope because the documented redeem-link admin API does not expose an endpoint for it.

## Details and History Modal

The `Details / History` action opens a wide Penalty Kick-style modal. Its summary area shows campaign name, station, reward and amount, configured quantity, redeemed count, remaining count, and date range from the selected list row.

Opening the modal resets history to page 1 and calls the selected link's history endpoint. The paginated table shows:

- Member ID
- Member UUID
- Full Name (`-` when null)
- Phone Number (`-` when null)
- Redeemed At

The history uses its own loading, error, empty, page, total, and request lifecycle, independent from the main list. Changing history page keeps the modal open. Closing and reopening another row must not display stale records from the previous link. The modal has only a Close action because history is read-only.

## Loading, Errors, and Concurrency

- List, edit retrieval, history, create/update, and archive each expose an appropriate loading or saving state.
- All failures produce a toast with the most specific API detail available.
- Request results from an obsolete history selection must not overwrite the currently selected row; use cancellation/ignore cleanup in the effect or validate the selected UUID before applying results.
- Copy animation timers are cleared when a row changes or the page unmounts.
- Buttons involved in an active mutation are disabled to prevent duplicate requests.
- Empty list and empty history states use the same subdued text treatment as Penalty Kick tables.

## Testing and Verification

The repository currently has no configured automated test runner. To preserve test-first behavior without adding a new dependency solely for this feature, pure mapping/validation/share-link logic will live in `redeemLinkUtils.js` and be verified with Node's built-in test runner if the repository's module configuration supports it. If direct Node module loading is incompatible with the Next.js module setup, obtain explicit approval before treating lint/build plus browser verification as the feature's test strategy.

Required verification:

- Focused utility tests: choice label/value mapping, payload validation, API error extraction, availability mapping, and current-origin share URL encoding.
- `npm run lint` with no new errors.
- `npm.cmd run build` succeeds.
- Manual admin smoke test against staging: list pagination, create, edit, copy animation and exact URL, history pagination/empty state, archive confirmation, current-page correction, responsive table overflow, sidebar active state, collapsed sidebar, and mobile drawer.
- Confirm existing Penalty Kick and other admin routes still render and their sidebar active states remain unchanged.

## Acceptance Criteria

- A visible `Redeem Links` sidebar item opens `/admin/redeem-links` and stays active on its child form route.
- The list is driven by API pagination and displays the documented campaign fields and availability.
- Admins can create and fully edit campaigns using the documented integer choices and validations.
- Admins can archive after confirmation; archived links disappear after refresh.
- Every row can copy a correctly encoded URL based only on the current `window.location.origin`, with a short successful-copy animation.
- Every row can open a modal with independent paginated redemption history.
- All API operations use UUIDs and authenticated admin API helpers.
- No member-facing route or claim behavior is added.
- No unrelated admin behavior or existing navigation is changed.
