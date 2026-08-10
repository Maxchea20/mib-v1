# MIB Development Workflow

## Current Version

**V1.0.5**

Last Updated:
2026-08-08

---

# Daily Development

1. Open VS Code

```bash
npm run dev
````

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

# MIB Development Roadmap

## Phase 1 — Foundation 🟡

**Frozen**

---

## Phase 2 — Contacts ✅

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

### Deferred

* [ ] Live Refresh
* [ ] Notifications

---

# Phase 5 — Dashboard 🚧

### Completed

* [x] KPI Cards
* [x] Recent Contacts
* [x] Recent Listings

### Remaining

* [ ] 2026 Gross Commission Target
* [ ] Remaining to Target
* [ ] Progress %
* [ ] Monthly Performance
* [ ] Recent Activities

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

### Remaining

* [ ] Highest Gross Commission
* [ ] Lowest Gross Commission
* [ ] Average Gross Commission
* [ ] Sales List
* [ ] Sales Profile
* [ ] Search
* [ ] Filters
* [ ] Add Sales
* [ ] Edit Sales
* [ ] Delete Sales

### Future

* [ ] Save Deal
* [ ] "Deal Saved Successfully"
* [ ] Auto Refresh Charts
* [ ] Claimed Series
* [ ] Upcoming / Unclaimed Series
* [ ] Potential Gross Commission
* [ ] Target Projection

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

### Completed

* [x] Mobile Sidebar
* [x] Mobile Contacts
* [x] Mobile Listings
* [x] Responsive Listing Action Menu

### Remaining

* [ ] Mobile Dashboard
* [ ] Bottom Navigation
* [ ] Full mobile system review

---

# Phase 9 — CRM 🔜

This is the next major phase.

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

### Mobile behaviour

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
Phase 8  Mobile           🚧
Phase 9  CRM              🔜 NEXT
Phase 10 AI               🔜
Phase 11 Reports          🔜
Phase 12 Performance      🔜
```

### The important decision

**Phase 7 does NOT need to be perfect before moving on.**

We now have the important foundation:

> **Listing data → Supabase → Listing Profile → Brochure**

That's working. The brochure can be cosmetically upgraded later without redesigning the underlying data structure.

So I would officially move the focus to **Phase 9 — CRM** when you're ready. That gets directly at the operational pain points of the system instead of burning another night fighting PDF spacing. 😅
