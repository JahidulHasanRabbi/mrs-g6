# Alert & Follow Up Feature Spec

> Branch: `feature/penalty-kick-admin`
> Last updated: 2026-05-27

---

## Overview

The Follow Up / Alert feature lets Retention PICs log and track interactions with members directly from the admin panel. It is an audit trail — every action taken by a PIC towards a member is recorded with timestamp and author.

**Core rule:** The alert page is for **viewing and actioning** alerts. Creating a new alert entry happens from the **Member Profile** page.

---

## Affected Files

| File | Change type |
|------|------------|
| `app/admin/retention/member-alert/page.jsx` | Major update — mock data, status column, View popup |
| `app/admin/retention/members/[slug]/page.jsx` | Add "Alert" option in More Options + Alert History section |
| `app/admin/retention/members/page.jsx` | Add 1 mock row at top of member list |

No new pages are created. Everything is modal/popup-driven.

---

## 1. Member Alert List Page

**File:** `app/admin/retention/member-alert/page.jsx`

### 1a. Mock Data

Comment out all API calls inside `FollowUpList` (getCrmMembers, getCrmUsers, getVipTierList). Replace with hardcoded `MOCK_MEMBERS` array (7 rows to match PAGE_SIZE).

Each mock row shape:
```js
{
  uuid: "mock-001",
  full_name: "Ah Chong 88",
  phone_number: "+6012-309 8765",
  vip_level: "VIP 4",
  daily_sales: 9999.88,
  daily_win_loss: 1023.13,
  priority: "High",         // "High" | "Medium" | "Low"
  retention: "Sarah",
  status: "In Progress",    // "New" | "In Progress" | "Snoozed" | "Resolved"
  last_action: "TG",        // last logged action type, null if none
  last_action_at: "2026-05-27 09:15",
  last_action_by: "Sarah",
}
```

Randomize across: priority (High/Medium/Low), status (New/In Progress/Snoozed/Resolved), retention names (Sarah/Eddie/Zoey/Candy/Marcus), VIP levels (VIP 1–7), realistic RM sales figures.

KPI summary cards (High Priority count etc.) keep the real API call — only the member list rows use mock data.

### 1b. Columns — add Status

Add a `status` column between Retention and Action:

```js
const COLUMNS = [
  { key: "name",     label: "Username",       minW: 200 },
  { key: "phone",    label: "Phone Number",   minW: 160 },
  { key: "vip",      label: "VIP Level",      minW: 100 },
  { key: "sales",    label: "Daily Sales",    minW: 120 },
  { key: "winloss",  label: "Daily Win/Loss", minW: 130 },
  { key: "priority", label: "Priority",       minW: 100 },
  { key: "pic",      label: "Retention",      minW: 120 },
  { key: "status",   label: "Status",         minW: 130 },
  { key: "action",   label: "Action",         minW: 100, align: "end" },
];
```

### 1c. Status Badge component

```
New        → bg #2a2a2a   text #a4a4a4
In Progress → bg #3d2e00  text #eaad2c
Snoozed    → bg #2a1a4a   text #d9acff
Resolved   → bg #003920   text #84ebb4
```

Pill shape: `rounded-[4px] px-2 py-0.5 text-[12px] font-semibold leading-[18px]`
Match the same pattern as `PriorityBadge` in `components/admin/retention/PriorityBadge.jsx`.

### 1d. Status filter

Add a "Status" FilterPill alongside existing Priority / VIP Level / All Retention filters.
Options: All · New · In Progress · Snoozed · Resolved
Filter is client-side only (filters the mock array, no API param needed).

### 1e. Action column — View button opens popup

The action column has one button: **View**. Same gold-bordered dark pill as current. Clicking it opens `AlertViewModal` (see 1f). Do not navigate to a detail page.

### 1f. AlertViewModal

A full-screen overlay modal. Structure from top to bottom:

```
╔══════════════════════════════════════════╗
║  [✕ close]                               ║
║  Member name  [Status badge]             ║
║  VIP Level · Priority badge · PIC name   ║
║  ─────────────────────────────────────── ║
║  Follow Up History         [+ Add Follow Up] ║
║  ─────────────────────────────────────── ║
║  [TG]  Sarah  •  27 May 2026, 09:15      ║
║  [WA]  Eddie  •  26 May 2026, 14:30      ║
║  [Others]  Zoey  •  25 May 18:05         ║
║    "Called but no answer"                ║
║  [Bonus]  Sarah  •  24 May 11:20         ║
║  ─────────────────────────────────────── ║
║  [Snooze — lower to Low]  [// Resolve //]║
╚══════════════════════════════════════════╝
```

**Modal shell** — same as existing modals in the profile page:
- Overlay: `rgba(0,0,0,0.65)` fixed full screen
- Card: `bg-[#05060a]` · `rounded-[16px]` · `shadow-[0_0_3px_0_#dea220]` · `max-w-lg w-full`
- Close button: top-right × icon

**Member header section:**
- Name: gold gradient text (`GRAD_GOLD` background-clip), DM Sans, 22px, bold
- Status badge inline next to name
- Second line: VIP level · PriorityBadge · "PIC: {name}" — all `text-[12px] text-white/60`

**History list:**
- Section label: `text-[12px] font-medium text-[#fbeed2]` + divider line `border-b border-white/10`
- Each entry (latest → oldest):
  - Action type chip (see Action Type Chips below)
  - PIC name `text-[12px] text-white`
  - Datetime `text-[11px] text-white/50`
  - Note text if present: `text-[12px] text-white/70 italic mt-1 pl-1`
- Empty state: `text-[12px] text-white/30 text-center py-6` "No follow ups yet."
- Mock history: 4–6 entries per member, randomized actions/PICs

**"+ Add Follow Up" button:**
- Top-right of history section header
- Small dark-gradient pill `border border-[#f2cb7a]` · `text-[11px] text-[#eaad2c]` · `px-3 py-1 rounded-[6px]`
- Opens `FollowUpCreateModal` (see 1g)

**Bottom actions:**
- `Snooze` button: `border border-[#d9acff]` · `text-[#d9acff]` · dark gradient bg — clicking sets status to "Snoozed" + lowers priority to "Low" in local mock state
- `{/* <button>Resolve</button> */}` — commented out, backend pending

### 1g. FollowUpCreateModal

Nested modal (opens on top of AlertViewModal, or closes AlertViewModal and opens standalone — either works).

```
╔═══════════════════════════════════╗
║  Add Follow Up — {member name}    ║
║  ────────────────────────────────  ║
║  What action did you take?        ║
║  [TG] [WA] [Bonus] [Event]        ║
║  [LiveChat] [Others]              ║
║                                   ║
║  (if Others selected)             ║
║  ┌─────────────────────────────┐  ║
║  │ Write your note here...     │  ║
║  └─────────────────────────────┘  ║
║  ────────────────────────────────  ║
║       [Cancel]    [Submit]        ║
╚═══════════════════════════════════╝
```

- Title: gold gradient text, DM Sans 20px bold
- Action chips: horizontal flex wrap, each chip styled per Action Type Chips spec below
- Selected chip: highlighted with full-opacity color + ring
- Unselected chip: 40% opacity
- Others textarea: `bg-[#141828]` · `border border-[#f2cb7a]` · `rounded-[8px]` · `text-[13px] text-white` · `placeholder:text-white/30` · min-h `80px` · `px-3 py-2` · `focus:outline-none focus:ring-1 focus:ring-[#eaad2c]`
- Submit: disabled until an action chip is selected. Adds entry to local mock history state. Logs: current user (hardcode "Sarah" for mock), current datetime.
- Cancel: closes modal, no changes

---

## 2. Member Profile Page

**File:** `app/admin/retention/members/[slug]/page.jsx`

### 2a. Add "Alert" to MORE_OPTIONS

```js
const MORE_OPTIONS = [
  // { key: "send-bonus",       label: "Send Bonus" },
  { key: "add-note",         label: "Add Note" },
  { key: "change-vip-level", label: "Change VIP Level" },
  { key: "alert",            label: "Create Alert" },          // ← new
  { key: "block-customer",   label: "Block Customer", danger: true },
];
```

Clicking "Create Alert" → opens `FollowUpCreateModal` (same component as 1g, same design).
On submit → prepends new entry to local `alertHistory` state in the profile page.
No API call (backend pending) — mock submit only.

### 2b. Alert History section

Add at the very bottom of the page, below `<NotesCard />`, above any modals.

```jsx
<AlertHistorySection memberUuid={memberUuid} />
```

**Collapsible behavior:** Same collapse pattern used throughout the profile — chevron toggle, open by default or closed, smooth height transition.

**Section header:**
- Title: `"Alert History"` · `text-[16px] font-bold text-white`
- Chevron icon right-aligned (rotates on open/close)
- Section wrapper: `rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220] p-6`

**Collapsed state:** Shows last 5 entries (latest → oldest).

Each history entry row:
```
[Action chip]  PIC name  •  datetime
               note snippet (max 1 line, ellipsis)
```
- Action chip: same as Action Type Chips spec
- PIC name: `text-[12px] font-medium text-white`
- Datetime: `text-[11px] text-white/50`
- Note: `text-[12px] text-white/60 italic truncate`
- Row hover: `hover:bg-white/5 rounded-[8px] cursor-pointer`
- Clicking any row → opens `AlertHistoryDetailModal` (see 2c)

**"See More" button** (shown only when history has more than 5 entries):
- `text-[12px] text-[#eaad2c] underline-offset-2 hover:underline`
- Opens `AlertHistoryFullModal` (see 2d)

**Empty state:** `text-[12px] text-white/30 text-center py-4` "No alert history yet."

**Mock data:** 6–8 entries per member, randomized, same shape as alert list history.

### 2c. AlertHistoryDetailModal

Opens when clicking a single history entry. Shows full details of one log entry.

```
╔═════════════════════════════════╗
║  Follow Up Detail    [✕]        ║
║  ───────────────────────────    ║
║  Action:  [TG badge]            ║
║  By:      Sarah                 ║
║  Date:    27 May 2026, 09:15    ║
║  Note:    (full text or "—")    ║
╚═════════════════════════════════╝
```

- Same modal shell as all other modals (dark bg, gold shadow)
- Fields: `text-[12px] text-white/50` labels, `text-[13px] text-white` values
- Two-column label/value grid with `gap-3`

### 2d. AlertHistoryFullModal

Opens when clicking "See More". Shows all entries paginated or scrollable.

```
╔════════════════════════════════════════╗
║  Alert History — {member name}  [✕]   ║
║  ─────────────────────────────────    ║
║  [TG]  Sarah  •  27 May 2026 09:15    ║
║  [WA]  Eddie  •  26 May 2026 14:30    ║
║  [Others]  Zoey  •  25 May 18:05      ║
║    "Called but no answer"             ║
║  ... (all entries, scrollable)        ║
╚════════════════════════════════════════╝
```

- `max-h-[70vh] overflow-y-auto` scrollable list
- Same entry row design as Alert History section
- Clicking a row → opens `AlertHistoryDetailModal` on top
- No pagination — scroll only (mock data is small)

---

## 3. Member List Page

**File:** `app/admin/retention/members/page.jsx`

Add 1 hardcoded mock row prepended to the API results so the table is never visually empty during development.

```js
const MOCK_FIRST_ROW = {
  uuid: "mock-preview-001",
  full_name: "Ah Chong 88",
  phone_number: "+6012-309 8765",
  vip_level: "VIP 4",
  daily_sales: 9999.88,
  daily_win_loss: 1023.13,
  priority: "High",
  retention: "Sarah",
};
```

Render it as `rows[0]` before the real API rows. The "View" button on this row links to `/admin/retention/members/mock-preview-001` (404 is fine — this is just for visual preview).

---

## Design Tokens

All styling must match the existing retention surface exactly.

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| Page bg | `#041502` | Section wrapper background |
| Dark gradient | `linear-gradient(178deg, #141828 0%, #333333 99.7%)` | Table header, buttons, dropdowns |
| Gold gradient | `linear-gradient(99deg, #DC9D16 1%, #F2CB7A 98%)` | KPI cards, edit button, gold text |
| Modal bg | `#05060a` | All modal card backgrounds |
| Gold border | `#f2cb7a` | Button borders, input borders, dropdown borders |
| Gold text | `#eaad2c` | Button labels, links |
| Light gold text | `#f6dda6` | Dropdown option text |
| Cream text | `#fbeed2` | Table headers, section labels |
| Page shadow | `0_-4px_12px_-2px_#dea220` | Outer section shadow |
| Modal shadow | `0_0_3px_0_#dea220` | Modal card shadow |
| Row divider | `border-white/5` | Table row bottom border |
| Overlay | `rgba(0,0,0,0.65)` | Modal background overlay |

### Typography

| Usage | Style |
|-------|-------|
| Page / modal title | DM Sans · bold · 22–26px · `letter-spacing: -1.5px to -2px` · gold gradient clip |
| Section label | 12px · font-medium · `text-[#fbeed2]` |
| Table body | 12px · font-medium · `text-white` · `leading-[18px]` |
| Secondary text | 11–12px · `text-white/50` to `text-white/60` |
| Button label | 12px · font-medium · `text-[#eaad2c]` |
| Badge / chip label | 12px · font-semibold · `leading-[18px]` |

### Spacing & Shape

| Element | Value |
|---------|-------|
| Section border radius | `rounded-[16px]` |
| Button / input / badge border radius | `rounded-[8px]` |
| Priority / status badge border radius | `rounded-[4px]` |
| Section inner padding | `p-6` |
| Table cell padding | `px-4 py-4` |
| Button padding | `px-4 py-2` |
| Small button padding | `px-3 py-1` |

### Action Type Chips

Used in Follow Up history rows and the action picker.

| Action | bg | text color |
|--------|----|-----------|
| TG | `#1a3a5c` | `#4188ff` |
| WA | `#0a2e1a` | `#84ebb4` |
| Bonus | `#3d2e00` | `#eaad2c` |
| Event | `#2a1a4a` | `#d9acff` |
| LiveChat | `#0a2e30` | `#67e8f9` |
| Others | `#2a2a2a` | `#a4a4a4` |

Chip shape: `rounded-[6px] px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap`

In the action picker (FollowUpCreateModal), chips are larger:
`rounded-[8px] px-4 py-2 text-[12px] font-semibold`

### Status Badges

| Status | bg | text color |
|--------|----|-----------|
| New | `#2a2a2a` | `#a4a4a4` |
| In Progress | `#3d2e00` | `#eaad2c` |
| Snoozed | `#2a1a4a` | `#d9acff` |
| Resolved | `#003920` | `#84ebb4` |

Same pill shape as `PriorityBadge`: `rounded-[4px] px-2 py-0.5 text-[12px] font-semibold leading-[18px]`

### Existing Components to Reuse

| Component | Path | Use for |
|-----------|------|---------|
| `PriorityBadge` | `components/admin/retention/PriorityBadge.jsx` | Priority display in modal |
| `Pagination` | `components/admin/retention/Pagination.jsx` | (if paginating history) |
| `GRAD_DARK`, `GRAD_GOLD`, `GRAD_CARD` | `components/admin/retention/constants.js` | All gradient backgrounds |
| `FilterPill` | inline in `member-alert/page.jsx` | Status filter dropdown |

---

## Mock Data Spec

### MOCK_MEMBERS (7 rows for alert list)

```js
const MOCK_MEMBERS = [
  { uuid: "mock-001", full_name: "Ah Chong 88",   phone_number: "+6012-309 8765", vip_level: "VIP 4", daily_sales: 9999.88,  daily_win_loss: 1023.13,   priority: "High",   retention: "Sarah",  status: "In Progress", last_action: "TG",       last_action_at: "2026-05-27 09:15", last_action_by: "Sarah" },
  { uuid: "mock-002", full_name: "Jason Win",      phone_number: "+6011-111 1111", vip_level: "VIP 5", daily_sales: 4000.00,  daily_win_loss: -600.00,   priority: "High",   retention: "Sarah",  status: "New",         last_action: null,       last_action_at: null,               last_action_by: null },
  { uuid: "mock-003", full_name: "Peter Lee",      phone_number: "+6012-353 2148", vip_level: "VIP 6", daily_sales: 5000.00,  daily_win_loss: 1000.00,   priority: "Medium", retention: "Eddie",  status: "Snoozed",     last_action: "WA",       last_action_at: "2026-05-26 14:30", last_action_by: "Eddie" },
  { uuid: "mock-004", full_name: "Star99",         phone_number: "+6016-778 4521", vip_level: "VIP 2", daily_sales: 2500.50,  daily_win_loss: -300.00,   priority: "Medium", retention: "Zoey",   status: "In Progress", last_action: "Bonus",    last_action_at: "2026-05-26 09:00", last_action_by: "Zoey" },
  { uuid: "mock-005", full_name: "MegaKing",       phone_number: "+6019-234 5678", vip_level: "VIP 3", daily_sales: 8750.00,  daily_win_loss: 450.00,    priority: "Low",    retention: "Candy",  status: "Resolved",    last_action: "LiveChat", last_action_at: "2026-05-25 16:45", last_action_by: "Candy" },
  { uuid: "mock-006", full_name: "LuckyDragon",    phone_number: "+6013-987 6543", vip_level: "VIP 1", daily_sales: 1200.00,  daily_win_loss: -150.00,   priority: "Low",    retention: "Marcus", status: "New",         last_action: null,       last_action_at: null,               last_action_by: null },
  { uuid: "mock-007", full_name: "GoldFish77",     phone_number: "+6017-456 7890", vip_level: "VIP 7", daily_sales: 15000.00, daily_win_loss: 2300.00,   priority: "High",   retention: "Sarah",  status: "In Progress", last_action: "Event",    last_action_at: "2026-05-24 11:20", last_action_by: "Sarah" },
];
```

### MOCK_FOLLOWUP_HISTORY (shared across alert modal + profile history)

```js
const MOCK_FOLLOWUP_HISTORY = [
  { uuid: "fh-001", action_type: "TG",       note: "",                                                        pic: "Sarah",  datetime: "2026-05-27 09:15" },
  { uuid: "fh-002", action_type: "WA",       note: "",                                                        pic: "Eddie",  datetime: "2026-05-26 14:30" },
  { uuid: "fh-003", action_type: "Others",   note: "Called but member did not pick up. Will retry tomorrow.", pic: "Sarah",  datetime: "2026-05-25 18:05" },
  { uuid: "fh-004", action_type: "Bonus",    note: "",                                                        pic: "Zoey",   datetime: "2026-05-24 11:20" },
  { uuid: "fh-005", action_type: "Event",    note: "",                                                        pic: "Sarah",  datetime: "2026-05-23 09:00" },
  { uuid: "fh-006", action_type: "LiveChat", note: "Member interested in new slot games.",                    pic: "Candy",  datetime: "2026-05-22 16:45" },
];
```

Use this same array for both the AlertViewModal history and the Member Profile Alert History section.

---

## API Contract (for backend reference)

These endpoints do not exist yet. Frontend uses mock state. When backend is ready, replace mock state with real API calls.

### Create follow up entry
```
POST /crm-members/members/{uuid}/followup/
Body: {
  action_type: "TG" | "WA" | "Bonus" | "Event" | "LiveChat" | "Others",
  note: ""   // required if action_type is "Others", optional otherwise
}
Response: { uuid, action_type, note, created_by_name, created_at }
```

### Get follow up history
```
GET /crm-members/members/{uuid}/followup/
Query: { page, page_size }
Response: {
  count: 12,
  results: [
    { uuid, action_type, note, created_by_name, created_at }
  ]
}
```

### Update member status (Snooze / Resolve)
```
PATCH /crm-members/members/{uuid}/
Body: {
  status: "Snoozed" | "Resolved" | "In Progress" | "New",
  priority: 3   // send 3 (Low) when Snoozing
}
```

---

## Implementation Notes

1. **No new pages** — everything is modal. Do not create `member-alert/[uuid]/page.jsx`.
2. **API calls commented out** — wrap existing getCrmMembers etc. in block comments `/* ... */`, leave them visible so backend integration is trivial.
3. **Local state only** — when PIC submits a Follow Up or clicks Snooze, update React state (prepend to history array, update status badge). No persistence across page reload — intentional for mock phase.
4. **Resolve button** — render the button but wrap in `{/* */}` comment with a `// TODO: wire to API` note.
5. **Mock user** — hardcode `"Sarah"` as the logged-in PIC name for all mock-submitted follow ups.
6. **FilterPill for Status** — client-side filter only. `filter((m) => !statusFilter || m.status === statusFilter)` on the mock array.
7. **History order** — always latest → oldest (newest `datetime` first).
8. **DM Sans heading font** — use `fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif"` inline for all h1/h2 modal titles, matching existing pages.
