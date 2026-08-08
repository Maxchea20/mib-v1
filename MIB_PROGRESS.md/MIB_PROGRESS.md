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

---

# Production

✅ main

# Development

✅ develop

# Deployment

✅ Vercel Production
✅ Vercel Preview

---

# Phase 1 - Foundation

🟡 Frozen

---

# Phase 2 - Contacts ✅

Completed

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

Remaining

* [ ] Profile Polish

---

# Phase 3 - Listings ✅

Completed

* [x] Listing List
* [x] Listing Profile
* [x] Add Listing
* [x] Edit Listing
* [x] Owner Link
* [x] Photo Upload
* [x] Mobile Responsive
* [x] Clickable Listing Card
* [x] Listing Action Menu (⋮)

Remaining

* [ ] Property Timeline
* [ ] Duplicate Detection
* [ ] Archive
* [ ] Listing History

---

# Phase 4 - Matching ✅

Completed

* [x] Buyer → Listing
* [x] Listing → Buyer
* [x] Matching Score
* [x] Matching Requirements
* [x] Matching Listings Page
* [x] Matching Buyers Page

Deferred

* [ ] Live Refresh
* [ ] Notifications

---

# Phase 5 - Dashboard

Completed

* [x] KPI Cards
* [x] Recent Contacts
* [x] Recent Listings

Next

* [ ] 2026 Gross Commission Target
* [ ] Remaining to Target
* [ ] Progress %
* [ ] Monthly Performance
* [ ] Recent Activities

---

# Phase 6 - Sales 🚧

Completed

* [x] Deals Table
* [x] CSV Import
* [x] Sales Module
* [x] KPI Cards
* [x] Yearly Gross Commission Chart
* [x] Monthly Multi-Year Line Chart
* [x] Recharts Integration
* [x] Mobile Chart Support

Next

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

Future

* [ ] Save Deal
* [ ] "Deal Saved Successfully"
* [ ] Auto Refresh Charts
* [ ] Claimed Series
* [ ] Upcoming / Unclaimed Series
* [ ] Potential Gross Commission
* [ ] Target Projection

---

# Phase 7 - PDF Generator 🚧

Completed

* [x] Brochure PDF Generator
* [x] Internal Sheet PDF Generator
* [x] 2-page Brochure
* [x] Maximum 9 Photos
* [x] Dynamic Listing Information
* [x] Property Hero Image
* [x] Property Overview
* [x] Property Description
* [x] Property Gallery
* [x] Location Information
* [x] Listing Agent Section
* [x] MIB Branding
* [x] PDF Download
* [x] Listing 3-dot Action Menu Integration

Brochure Polish Completed

* [x] Hero title wrapping
* [x] Hero overlay adjustment
* [x] Hero height adjustment
* [x] Price / key-facts spacing
* [x] Fact label sizing
* [x] Fact value sizing
* [x] Back button reduced
* [x] Action menu click-outside closing
* [x] PDF generation runtime issue fixed
* [x] TypeScript errors resolved

Remaining

* [ ] Property Overview proper icons
* [ ] Page 1 visual polish
* [ ] Page 2 visual polish
* [ ] Agent section polish
* [ ] Property Highlights integration

Deferred

* [ ] Flyer
* [ ] QR Code
* [ ] Public Property Listing URL

Notes

* Brochure and Flyer will not be maintained as separate generators for now.
* Brochure is the main external property document.
* Internal Sheet remains an internal-use document.
* QR Code is postponed because the system is currently internal.
* Public property listing/search functionality is postponed.
* Property Highlights will eventually be entered from the Listing module and pulled automatically into the brochure.

---

# Phase 8 - Mobile

Completed

* [x] Mobile Sidebar
* [x] Mobile Contacts
* [x] Mobile Listings

Remaining

* [ ] Mobile Dashboard
* [ ] Bottom Navigation

---

# Phase 9 - CRM

* [ ] Follow Up
* [ ] Reminder
* [ ] Timeline
* [ ] Activity Log
* [ ] WhatsApp

---

# Phase 10 - AI

* [ ] AI Listing
* [ ] AI Facebook
* [ ] AI WhatsApp
* [ ] AI Matching

---

# Phase 11 - Reports

* [ ] Sales
* [ ] Commission
* [ ] Monthly
* [ ] Yearly
* [ ] Excel Export

---

# Phase 12 - Performance

* [ ] Query Optimization
* [ ] Lazy Loading
* [ ] Mobile Optimization

---

# Future

* [ ] Facebook Publishing
* [ ] PropertyGuru Export
* [ ] iProperty Export
* [ ] Google Maps
* [ ] WhatsApp Automation
* [ ] Android App
* [ ] iPhone App

---

# Current Sprint (V1.0.5)

Module:

**Phase 7 - PDF Generator**

Completed

* [x] Brochure Generator
* [x] Internal Sheet Generator
* [x] 2-page Brochure
* [x] Maximum 9 Photos
* [x] Listing Profile PDF Actions
* [x] PDF Download
* [x] Brochure Initial Design
* [x] Brochure Visual Polish Pass

Remaining

* [ ] Proper Property Overview Icons
* [ ] Page 1 Polish
* [ ] Page 2 Polish
* [ ] Agent Section Polish
* [ ] Property Highlights Integration
* [ ] Final Brochure Approval

Deferred

* [ ] Flyer
* [ ] QR Code
* [ ] Public Listing Page

---

# Next Sprint (V1.0.6)

1. Finish Brochure Visual Polish
2. Replace Overview Placeholder Icons
3. Polish Page 2
4. Improve Agent Section
5. Add Property Highlights to Listing
6. Connect Property Highlights to Brochure
7. Final Brochure Approval

---

# Development Rules

* Work on one task at a time.
* Do not skip steps.
* Do not make multiple unrelated code changes at once.
* Test after every code change.
* Keep Problems at 0 before moving to the next task.
* Do not build future features before the current module is stable.
* Keep MIB internal-first until public functionality is intentionally introduced.

```

### One thing I deliberately changed

I changed:

> **Current Version V1.0.3 → V1.0.5**

because your changelog now has **V1.0.4 Buyer Matching & Contact Profile** and **V1.0.5 PDF Generator**.

And I moved the **Current Sprint** from Sales to **Phase 7 PDF Generator**, because that's where we actually stopped tonight.

So when we come back, there should be **zero confusion**: we're not going back to Sales unless you specifically tell me to. We're continuing the brochure polish.
```
