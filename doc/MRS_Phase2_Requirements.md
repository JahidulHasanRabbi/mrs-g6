# MRS Phase 2 — Module Requirements Document

**Document Date:** 24/04/2026  
**Source:** [G6] MRS Phase 2 Mini Game (PPTX) + Project Details (XLSX)  

---

## Overview

Phase 2 is split into two sub-phases:

**Phase 2a (Urgent)**
- Mini Game: Penalty Kick
- Mission Games
- Leaderboard: World Cup Leaderboard System
- Prediction: World Cup Tournament

**Phase 2b**
- Mini Game: Smash Egg
- Leaderboard: Top 20 Deposit, Top 20 Win, Top 20 Referral
- Guest Mode

---

## Phase 2a

---

### Module 1 — Penalty Kick (Mini Game)

**Access Route:** `/kick`  
**Involves:** Member-facing game page + Admin back-office settings

#### What It Is
A football-themed mini game where members spend tokens to kick a penalty shot. The ball can go left, middle, or right. The outcome (which prize the member wins) is determined by a pre-configured kick sequence set by the admin. There is a goalkeeper with configurable difficulty levels.

Reference UI: https://poki.com/en/g/penalty-kicks

#### Member-Facing Requirements

**Home Page (Landing)**
- Loading screen/animation on entry
- Top-right: `[i]` icon button — taps open a **Game Description** pop-out (text editable from backend)
- Side Menu Bar for navigation

**Gameplay Screen**
- Swipe gesture to kick the ball in one of 3 positions: Left / Middle / Right
- Display: `My Token/s: [amount]`
- `–` and `+` buttons to adjust the number of tokens to bet per kick
- Display: `Tokens Per Round: 10.00` (default/admin-set value)

**Game Description (Pop-out)**
- Triggered by `[i]` icon
- Shows game rules/description text
- Text is CMS-editable from admin backend

**Game History Screen**
- Shows a list of prizes the member has won
- Buttons present: **Back to Homepage**, **Redeem All** (one-click redemption of all prizes)

#### Admin Back-Office Requirements

**Reward Management**
- List view of all rewards (Reward Name, Quantity, Item Type, Image, Edit/Archive action)
- Create New Reward:
  - Reward Name
  - Quantity + Unlimited toggle (checkbox)
  - Item Type: Free Credit / Min Withdraw / Max Withdraw / Token / Prize / Worldcup Leaderboard Score
  - Image upload
- Edit and Archive existing rewards

**Kick Sequence Setting** *(button in top-right of admin page)*
- Admin sets the sequence of prizes for each kick position
- Fields: Position → Reward Selection

**Game Status Setting**
- Open / Close toggle
- Maintenance Mode toggle

**Cost Setting**
- Cost per kick (in tokens)

**Goalkeeper Difficulty Setting**
- Easy — 75% chance member scores
- Medium — 50%
- Hard — 25%

---

### Module 2 — Mission Games

**Access Route:** `/mission`  
**Involves:** Member-facing mission page + Admin mission configuration panel

#### What It Is
A mission/quest system where members complete defined tasks (login, deposit, play games, etc.) to earn tokens. Missions are categorised into Daily, Weekly, and Challenge types. Admins can create and manage missions with a flexible condition builder.

#### Member-Facing Requirements

**Mission Page Tabs**
- Daily Mission
- Weekly Mission
- Challenge Mission
- Mission Progress History

**Behaviour**
- When a mission is completed, member can **claim tokens** via a claim button
- Mission Progress History shows: Date Range, Mission Name, Progress/Status

#### Admin Back-Office Requirements

**Mission List View**
- Columns: Mission Name, Category, Description, Mission Type, Reset Type, Condition, Reward, Limit Control, Edit/Archive action

**Create / Edit Mission Fields**
1. Mission Name
2. Mission Category — Daily / Weekly / Challenge
3. Description (visible to member on front-end)
4. Mission Type — One Time / Repeatable / Recurring
5. Reset Type — Daily / Weekly / Monthly / None
6. Condition Builder:
   - **Action triggers:** Login, Deposit Amount, Play Spin, Play Smash, Check In, Play Kick, Withdraw Amount, Referral Friend, Redemption
   - **Time-based** condition option
   - **Accumulate** condition option
7. Reward — Token Quantity
8. Limit Control (cap on how many times a reward can be claimed)

- Archive button to deactivate missions

---

### Module 3 — World Cup Leaderboard System

**Access Route:** `/worldcupleaderboard`  
**Involves:** Member-facing leaderboard + Admin content and reward management

#### What It Is
A football World Cup themed leaderboard where members join by selecting a country (from 3 tiers of 10 total countries). Members accumulate points and are ranked individually and by country. Includes prize pools for the top country and individual MVP players. Real-time data, with optional fake data seeding by admin.

#### Member-Facing Requirements

**Entry / Country Selection**
- When member first accesses the leaderboard, if they haven't selected a country → pop-up window prompts country selection
- 3 tiers of countries, 10 countries total
- Each country displayed with flag icon + country name

**Promotion/Landing Page**
- Must have a promotional banner (provided by Eddie)
- Needs T&C section (Eddie to provide copy)
- Redirect link to the leaderboard (link-based)
- Football theme required throughout

**About / Information Page**
- Static information page with layout editable from backend (all text CMS-managed)

**Ranking — Country View**
- Profile section (top of page): shows member's country flag, member ranking, member points
- Country leaderboard table columns:
  - Rank
  - Country (with flag icon)
  - Total Users
  - Total Points
- Real-time data

**Ranking — Top Player View**
- Profile section: country flag, ranking, points
- Country filter (dropdown for player to choose which country's players to view)
- Top Player leaderboard table columns:
  - Rank
  - Player (username)
  - Total Points
- Country flag shown next to each player
- Real-time data
- Supports fake/seeded data injection

**Prize Pool — Country Prize**
- Shows Top 1 Country prize
- Table: Rank, Prize Name
- Click on a prize → shows Prize Info modal
- Prize data fully editable via backend

**Prize Pool — MVP Prize (Per Country)**
- Shows Top 3 players from Top 1 country (MVP)
- Fields: Prize Name, Prize Info (shown on click)
- Prize data fully editable via backend

#### Admin Back-Office Requirements

**Information & T&C Setting** *(Sidebar → Leaderboard → World Cup → Information)*
- Text box for Information
- Text box for Terms and Conditions
- Edit and Save actions

**Reward Pool Setting** *(Sidebar → Leaderboard → World Cup → Reward Pool)*
- List of prizes with: Reward Name, Quantity, Item Type, Image
- Create New Reward and Edit/Archive existing rewards

**Fake Data Input** *(Sidebar → Leaderboard → World Cup → Fake Data Input)*
- Fields: Country, Rank, Player, Total Points
- Create, Edit, Archive fake player entries for seeding leaderboard appearance

---

### Module 4 — World Cup Prediction (Add-on)

**Access Route:** Part of the World Cup Leaderboard section (tab: `My Predictions`)

#### What It Is
A prediction feature added to the World Cup Leaderboard. Members predict match outcomes to earn points. Visible as a third tab alongside the leaderboard tabs.

#### Member-Facing Requirements

**Tabs (within leaderboard section)**
- All Countries
- Global Top Players
- My Predictions *(new tab)*

**My Predictions View**
- Shows a list of the member's predictions
- Each entry shows the match and the member's predicted result
- Possible result states: **Win / Lose / Draw / Pending**

---

## Phase 2b

---

### Module 5 — Smash Egg (Mini Game)

**Access Route:** `/smashegg`  
**Involves:** Member-facing game page + Admin back-office settings

#### What It Is
A prize-based egg smashing game where members spend tokens to smash an egg and reveal a prize. The UI and copy should replicate the existing BolaKing888 reference design exactly. Admin can configure prize pools, sequences, and rewards (1–20 prizes supported).

Reference Design: BolaKing888 Lucky Smash UI (provided as screenshots in PPTX slides 24–29)

#### Member-Facing Requirements
- Prize List display
- Winning List (recent winners — real-time)
- Winning Record (member's own history)
- Terms and Conditions section
- Smash button
- Token cost per round display
- **COPY ALL SENTENCE & DESIGN** from the BolaKing888 reference
- Prize slots: must support 1 to 20 prizes (flexible, admin-set)
- Player live total deposit shown in real-time for catch-up progress

#### Admin Back-Office Requirements

**Reward Management** *(Sidebar → Smash Egg Setting)*
- List of rewards: Reward Name, Quantity, Item Type, Image, Edit/Archive
- Create New Reward:
  - Reward Name
  - Quantity + Unlimited toggle (checkbox)
  - Item Type: Free Credit / Min Withdraw / Max Withdraw / Token / Prize
  - Image upload
- Edit and Archive rewards

**Smash Sequence Setting**
- Admin sets which reward appears at which position (egg slot)
- Fields: Position → Reward Selection

---

### Module 6 — Top 20 Deposit Leaderboard

**Access Route:** `/depositleaderboard`  
**Involves:** Member-facing leaderboard + Admin management

#### What It Is
A leaderboard showing the top 20 members by total deposit amount. Runs on a monthly basis, resets monthly. Copy and design directly mirrored from the BolaKing888 reference.

Reference: BolaKing888 Top 20 Deposit Leaderboard UI (PPTX slides 26–30)

#### Member-Facing Requirements
- Page sections: Title, Information, Ranking table, Prize Pool, Terms & Conditions
- **COPY ALL SENTENCE & DESIGN** from reference
- Ranking Table columns: Rank, Player, Total Deposit
- Player live total deposit catch-up (real-time progress)
- Prize support: 1 to 20 prizes (configurable)
- Fake/seeded data support

#### Admin Back-Office Requirements

**Information & T&C** *(Sidebar → Leaderboard → Top 20 Deposit → Information)*
- Text box: Information
- Text box: Terms and Conditions

**Reward Pool** *(Sidebar → Leaderboard → Top 20 Deposit → Reward Pool)*
- Reward Name, Quantity, Item Type, Image
- Create, Edit, Archive

**Fake Data Input** *(Sidebar → Leaderboard → Top 20 Deposit → Fake Data Input)*
- Fields: Rank, Player, Total Deposit

---

### Module 7 — Top 20 Referrer Leaderboard

**Access Route:** `/referrerleaderboard`  
**Involves:** Member-facing leaderboard + Admin management

#### What It Is
A leaderboard showing the top 20 members by number of successful referrals. Structure mirrors the Top 20 Deposit Leaderboard.

Reference: BolaKing888 Referrer Leaderboard UI (PPTX slides 31–35)

#### Member-Facing Requirements
- Sections: Title, Information, Ranking, Prize Pool, T&C
- **COPY ALL SENTENCE & DESIGN** from reference
- Ranking Table: Rank, Player, New Members Referred
- Player live total referral catch-up (real-time)
- Prize support: 1 to 20 prizes
- Fake/seeded data support

#### Admin Back-Office Requirements

**Information & T&C** *(Sidebar → Leaderboard → Top 20 Referrer → Information)*
- Text box: Information
- Text box: Terms and Conditions

**Reward Pool**
- Reward Name, Quantity, Item Type, Image

**Fake Data Input**
- Fields: Rank, Player, New Members

---

### Module 8 — Top 20 Win (Top Withdrawal) Leaderboard

**Access Route:** Not explicitly defined — inferred from PPTX slide 33 (Top Withdrawal reference)

#### What It Is
A leaderboard showing the top 20 members by total withdrawal/win amount. Same structural pattern as Deposit and Referrer leaderboards.

#### Member-Facing Requirements
- Player live total withdrawal catch-up
- Prize range: 1–20 configurable prizes
- Top 20 list required
- **COPY ALL SENTENCE & DESIGN** from reference

#### Admin Back-Office Requirements
- Same structure as other leaderboards (Information, T&C, Reward Pool, Fake Data Input)

---

### Module 9 — Guest Mode

**Access Route:** Via homepage — guests can enter without logging in

#### What It Is
A mode that allows non-registered or non-logged-in visitors to browse and play MRS mini games (Lucky Spin, Check-In, etc.) without an account. If a guest wins any prize, they are redirected to the Register/Login flow to claim it.

#### Requirements
- Guest can access homepage and view MRS content without registering
- Guest can click into and play any mini game (Lucky Spin, Penalty Kick, etc.)
- **After playing:** if the guest wins/earns any prize → redirect to Register/Login page to claim
- This creates a conversion funnel: play → win → register

---

## Summary Table — All Modules

| # | Phase | Module | Member Route | Admin Location | Type |
|---|-------|--------|-------------|----------------|------|
| 1 | 2a | Penalty Kick | `/kick` | Sidebar → Penalty Kick Setting | Mini Game |
| 2 | 2a | Mission Games | `/mission` | Sidebar → Mission Setting | Mission System |
| 3 | 2a | World Cup Leaderboard | `/worldcupleaderboard` | Sidebar → Leaderboard → Worldcup | Leaderboard |
| 4 | 2a | World Cup Prediction | (tab within leaderboard) | N/A | Prediction Feature |
| 5 | 2b | Smash Egg | `/smashegg` | Sidebar → Smash Egg Setting | Mini Game |
| 6 | 2b | Top 20 Deposit Leaderboard | `/depositleaderboard` | Sidebar → Leaderboard → Top 20 Deposit | Leaderboard |
| 7 | 2b | Top 20 Referrer Leaderboard | `/referrerleaderboard` | Sidebar → Leaderboard → Top 20 Referrer | Leaderboard |
| 8 | 2b | Top 20 Win/Withdrawal Leaderboard | TBD | Sidebar → Leaderboard → Top 20 Win | Leaderboard |
| 9 | 2b | Guest Mode | Homepage (no auth) | N/A | Access Control |

---

## Shared / Cross-Module Technical Notes

**Real-Time Data:** Modules 3, 5, 6, 7, 8 all require live/real-time leaderboard updates.

**Fake Data Seeding:** Modules 3, 6, 7, 8 need admin-side fake data input for seeding visible leaderboard entries before real data accumulates.

**CMS-Editable Content:** All game descriptions, T&C text, information pages, and prize details must be editable from the admin backend — no hardcoding of visible text.

**Prize Flexibility:** Smash Egg and all leaderboards must support 1–20 prize slots, with coding always allowing this range to be changed without a redeploy.

**Token Economy:** Token cost per game round is admin-configurable for both Penalty Kick and Smash Egg.

**Reward Item Types (common across games):**
- Free Credit (with Min Withdraw, Max Withdraw)
- Token
- Prize
- Worldcup Leaderboard Score *(Penalty Kick only)*

**Design Reference Sites:**
- Penalty Kick gameplay: https://poki.com/en/g/penalty-kicks
- Leaderboard reference: https://www.bk8mlysia.com/en-my/leaderboard
- Smash Egg + Leaderboard copy: BolaKing888 (screenshots in PPTX)
- Top Referrer reference: https://asia99myr.com/ or referralballframe

**Glossary (from XLSX)**
- Date Format: DD/MM/YYYY
- Date Time Format: DD/MM/YYYY HH:MM AM/PM
