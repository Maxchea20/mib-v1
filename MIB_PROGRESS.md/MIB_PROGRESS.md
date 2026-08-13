# MIB Development Workflow

## Current Version

**V1.0.6**

Last Updated:
2026-08-13

---

# Daily Development

1. Open VS Code

```bash
npm run dev
```

2. Verify Branch

```bash
git branch
```

3. Check Status

```bash
git status
```

4. Stage Changes

```bash
git add .
```

5. Commit

```bash
git commit -m "Your commit message"
```

6. Push Development

```bash
git push origin develop
```

7. Merge Production

```bash
git checkout main
git merge develop
git push origin main
```

8. Vercel Auto Deploy

9. Test

* Desktop
* Mobile

---

# MIB Development Roadmap

## Phase 1 — Foundation 🟡

**Frozen**

---

# Phase 2 — Contacts ✅

### Completed

* [x] Contact List
* [x] Contact Profile
* [x] Add Contact
* [x] Edit Contact
* [x] Delete Contact
* [x] Buyer Matching
* [x] Owner Property Preview
* [x] Contact Action Menu
* [x] Clickable Contact Card
* [x] Mobile Responsive

### Remaining

* [ ] Profile Polish

---

# Phase 3 — Listings ✅

### Completed

* [x] Listing List
* [x] Listing Profile
* [x] Add Listing
* [x] Edit Listing
* [x] Owner Link
* [x] Photo Upload
* [x] Mobile Responsive
* [x] Clickable Listing Card
* [x] Listing Action Menu (⋮)
* [x] Tenure
* [x] Facing
* [x] Property Highlights
* [x] Highlights displayed on Listing Profile

### Remaining

* [ ] Property Timeline
* [ ] Duplicate Detection
* [ ] Archive
* [ ] Listing History

---

# Phase 4 — Matching ✅

### Completed

* [x] Buyer → Listing
* [x] Listing → Buyer
* [x] Matching Score
* [x] Matching Requirements
* [x] Matching Listings Page
* [x] Matching Buyers Page
* [x] Dashboard Matched Listings & Buyers
* [x] Dashboard Top Match Display
* [x] Reuse Existing `calculateMatchScore()` Engine
* [x] Match threshold ≥ 60%
* [x] Top 5 Dashboard Matches

### Deferred

* [ ] Live Refresh
* [ ] Notifications

---

# Phase 5 — Dashboard 🚧

### Completed

* [x] KPI Cards
* [x] Recent Contacts
* [x] Recent Listings
* [x] 2026 Gross Commission
* [x] 2026 Gross Commission Target
* [x] Remaining to Target
* [x] Target Progress %
* [x] Matched Listings & Buyers
* [x] Top 5 Buyer → Listing Matches
* [x] Match Score Display
* [x] Link to Buyer
* [x] Link to Listing

### Remaining

* [ ] Monthly Performance
* [ ] Recent Activities

### Notes

Dashboard now acts as the main operational overview:

```text
Core KPIs
    ↓
2026 Sales Performance
    ↓
Matched Listings & Buyers
    ↓
Recent Contacts / Listings
```

Monthly performance was intentionally deferred for now.

---

# Phase 6 — Sales 🚧

### Completed

* [x] Deals Table
* [x] CSV Import
* [x] Sales Module
* [x] KPI Cards
* [x] Yearly Gross Commission Chart
* [x] Monthly Multi-Year Line Chart
* [x] Recharts Integration
* [x] Mobile Chart Support
* [x] Sales List
* [x] Latest Year Automatically Selected
* [x] Deal Number Ordering
* [x] Add Sale
* [x] Edit Sale
* [x] Delete Sale
* [x] Save Deal
* [x] Save Success Confirmation
* [x] Highest Gross Commission
* [x] Lowest Gross Commission
* [x] Average Gross Commission
* [x] Claimed Gross Commission
* [x] Potential / Unclaimed Gross Commission
* [x] Claimed vs Potential Display
* [x] 2026 Gross Commission Target
* [x] Target Progress
* [x] Remaining to Target
* [x] Projected Year-End Gross Commission
* [x] Monthly Average Gross Commission
* [x] Projected Target Progress

### Current Behaviour

The Sales module automatically uses the **latest year available** in the database.

Example:

```text
2026 → active year
2022–2025 → historical data
```

When a new year is added, MIB automatically detects the latest year.

There is intentionally **no manual year selector** for the main Sales view.

### Current Target

```text
2026 Gross Commission Target
RM 200,000
```

### Remaining

* [ ] Auto-refresh charts after Add/Edit/Delete

### Future

* [ ] Claimed Series
* [ ] Upcoming / Unclaimed Series
* [ ] Potential Gross Commission refinement
* [ ] Target Projection refinement

---

# Phase 7 — PDF Generator 🚧 **PAUSED**

### Completed

* [x] Brochure PDF generation
* [x] 2-page brochure structure
* [x] Maximum 9 photos
* [x] Cover photo selection by property category
* [x] Photo gallery
* [x] Property Overview
* [x] Dynamic property information
* [x] Tenure
* [x] Facing
* [x] Property Highlights
* [x] Listing Profile → PDF data flow
* [x] Native PDF vector icons
* [x] MIB branding structure
* [x] Agent section
* [x] Listing action menu
* [x] Generate Brochure action
* [x] Internal Sheet action

### Paused

* [ ] Final brochure visual polishing
* [ ] Exact reference-design matching
* [ ] Final spacing/alignment polish
* [ ] Final typography polish

### Not Started / Deferred

* [ ] Flyer
* [ ] QR Code

**Phase 7 status: PAUSED — functional, but visual polish intentionally postponed.**

---

# Phase 8 — Mobile 🚧

The mobile system will follow the approved MIB mobile UI direction.

### Mobile UI Reference

The current visual reference includes:

* Light Mode
* Dark Mode
* Mobile Dashboard
* Mobile Listings
* Listing Profile
* Buyer Profile
* Matching Listings
* Generate PDF
* PDF Preview
* Bottom Navigation
* Modern premium real-estate app interface

### Visual Direction

```text
Mobile MIB
    │
    ├── Home / Dashboard
    ├── Listings
    ├── Listing Profile
    ├── Buyers
    ├── Buyer Profile
    ├── Matches
    ├── Generate PDF
    └── PDF Preview
```

### Completed

* [x] Mobile Sidebar
* [x] Mobile Contacts
* [x] Mobile Listings
* [x] Responsive Listing Action Menu
* [x] Mobile UI/UX Design Reference

### Remaining

* [ ] Mobile Dashboard
* [ ] Mobile Listing Profile
* [ ] Mobile Buyer Profile
* [ ] Mobile Matching
* [ ] Mobile Generate PDF
* [ ] Mobile PDF Preview
* [ ] Bottom Navigation
* [ ] Light Mode Implementation
* [ ] Dark Mode Implementation
* [ ] Full mobile system review

**Phase 8 status: DESIGN DIRECTION ESTABLISHED — implementation not yet completed.**

---

# Phase 9 — CRM 🔜

This remains the next major operational phase after the current Dashboard / Sales work.

### Core CRM

* [ ] Follow Up
* [ ] Reminder
* [ ] Activity Timeline
* [ ] Activity Log
* [ ] WhatsApp
* [ ] Call Button
* [ ] Follow-up Status
* [ ] Follow-up History
* [ ] Contact → Listing activity
* [ ] Listing → Contact activity

### Mobile Behaviour

* [ ] WhatsApp button on phone
* [ ] Call button on phone
* [ ] Hide WhatsApp/Call buttons on desktop browser

---

# Phase 10 — AI 🤖

* [ ] AI Listing
* [ ] AI Facebook
* [ ] AI WhatsApp
* [ ] AI Matching
* [ ] AI Listing Description
* [ ] AI Property Highlights
* [ ] AI Buyer Recommendation

---

# Phase 11 — Reports 📊

* [ ] Sales Reports
* [ ] Commission Reports
* [ ] Monthly Reports
* [ ] Yearly Reports
* [ ] Excel Export

---

# Phase 12 — Performance ⚡

* [ ] Query Optimization
* [ ] Lazy Loading
* [ ] Database Optimization
* [ ] Mobile Optimization
* [ ] Large Dataset Testing
* [ ] 10,000+ Transaction Data Testing

---

# Future — External Integrations

* [ ] Facebook Publishing
* [ ] PropertyGuru Export
* [ ] iProperty Export
* [ ] Google Maps
* [ ] WhatsApp Automation
* [ ] Android App
* [ ] iPhone App

---

# Future — Commercialisation

**Separate roadmap. Not part of your current personal MIB system.**

* [ ] Multi-agent accounts
* [ ] Agent permissions
* [ ] Admin panel
* [ ] Company-level data
* [ ] Subscription tiers
* [ ] Payment system
* [ ] Usage limits
* [ ] Gatherian-wide listings
* [ ] Gatherian-wide transaction database
* [ ] Security / row-level access
* [ ] Audit logs
* [ ] Agent billing
* [ ] Company reporting
* [ ] SaaS infrastructure

---

# 🎯 Current Position

```text
Phase 1  Foundation       🟡 Frozen
Phase 2  Contacts         ✅
Phase 3  Listings         ✅
Phase 4  Matching         ✅
Phase 5  Dashboard        🚧
Phase 6  Sales            🚧
Phase 7  PDF Generator    🚧 PAUSED
Phase 8  Mobile           🚧 DESIGN READY
Phase 9  CRM              🔜
Phase 10 AI               🔜
Phase 11 Reports          🔜
Phase 12 Performance      🔜
```

---

# Current Development Focus

The immediate development focus is:

> **Dashboard → CRM → Mobile**

Sales is functionally built for the current requirements and should not be expanded unnecessarily.

The mobile UI has an approved visual direction, but implementation should happen after the relevant underlying functionality is stable.

---

# Important Development Principles

### 1. Do not overbuild

Build the feature that solves the current operational problem.

Do not add complexity just because it may be useful someday.

### 2. Reuse existing logic

If a function already exists, reuse it.

Example:

```text
calculateMatchScore()
```

is the single matching engine used by:

```text
Listing → Matching Buyers
Buyer → Matching Listings
Dashboard → Matched Listings & Buyers
```

Do not create duplicate matching algorithms.

### 3. Data first, UI second

The system should maintain a clean flow:

```text
Supabase
   ↓
Data / Business Logic
   ↓
Components
   ↓
Desktop / Mobile UI
```

### 4. Historical data stays historical

Sales data from 2022–2025 remains available for charts and analysis.

The active Sales view automatically uses the latest year.

### 5. Functional before cosmetic

A feature does not need to be visually perfect before moving to the next important system.

This applies especially to:

* PDF visual polish
* Dashboard cosmetics
* Mobile visual polish

---

# Current MIB Architecture

```text
                    MIB
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
     Contacts     Listings      Buyers
        │            │            │
        └────────────┼────────────┘
                     ↓
                  Matching
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
      Dashboard              Sales
          │                     │
          ├── KPIs              ├── Deals
          ├── Matches           ├── Commission
          ├── Contacts          ├── Claims
          └── Listings          └── Target
                     │
                     ↓
                    CRM
                     │
                     ↓
                   Mobile
                     │
                     ↓
                     AI
```

---

# Phase 7 Decision

**Phase 7 does NOT need to be perfect before moving forward.**

The important foundation is already working:

> **Listing data → Supabase → Listing Profile → Brochure**

The brochure can be cosmetically upgraded later without redesigning the underlying data structure.

---

# Phase 6 Decision

The Sales system is now sufficiently functional for daily use:

> **Deals → Supabase → Sales KPIs → Claims → Target → Sales List → Add/Edit/Delete**

The current target remains:

> **RM200,000 Gross Commission**

The system automatically detects the latest sales year.

No manual year selector is required.

---

# Phase 8 Decision

The mobile visual direction is now established.

The approved reference is a modern, premium MIB mobile application supporting:

* Light Mode
* Dark Mode
* Dashboard
* Listings
* Buyers
* Matching
* PDF generation
* PDF preview
* Bottom navigation

Implementation will be done progressively rather than rebuilding the entire application at once.
