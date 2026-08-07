# MIB Development Workflow

## Current Version

**V1.0.3**

Last Updated:
2026-08-07

---

# Daily Development

1. Open VS Code

2. Start Development Server

```bash
npm run dev
```

For iPhone testing

```bash
npm run dev -- --hostname 172.20.10.4
```

3. Verify Current Branch

```bash
git branch
```

4. Check Status

```bash
git status
```

5. Stage Changes

```bash
git add .
```

6. Commit

```bash
git commit -m "Your commit message"
```

7. Push Development

```bash
git push origin develop
```

8. Merge to Production

```bash
git checkout main
git merge develop
git push origin main
```

9. Vercel automatically deploys Production

10. Test on

- Chrome Desktop
- Chrome Responsive Mode
- iPhone Safari
- Vercel Production

---

# Production Status

## Production

✅ main

## Development

✅ develop

## Deployment

✅ Vercel Production
✅ Vercel Preview

---

# Phase 1 - Foundation

Status

🟡 Frozen until Commercial Release

## Authentication

- [ ] Login
- [ ] Register
- [ ] Forgot Password
- [ ] User Roles
- [ ] Subscription

---

# Phase 2 - Contacts ✅

## Contact Management

- [x] Contact List
- [x] Add Contact
- [x] Edit Contact
- [x] Delete Contact
- [x] Contact Profile
- [x] Search
- [x] Lead Source
- [x] Status
- [x] Responsive Contact Cards
- [x] Mobile Sidebar
- [x] Hamburger Navigation

## Contact Roles

- [x] Buyer
- [x] Owner
- [x] Tenant
- [ ] Investor

## Buyer

- [x] Residential
- [x] Commercial
- [x] Industrial
- [x] Land
- [x] Buyer → Listing Matching
- [x] Matching Score
- [x] Matching Page

## Owner

- [x] Owner Role
- [x] Auto Draft Property
- [x] Owner Properties
- [x] Owner Property Link
- [x] Compact Contact Card
- [x] Owner Property Preview
- [x] Contact Action Menu (⋮)
- [x] Clickable Contact Card

Remaining

- [ ] Owner Profile Layout Polish
- [ ] Buyer + Owner Dual Profile
- [ ] Matching Buyers

## Tenant

- [x] Tenant Role

Deferred

- [ ] Tenant Requirement
- [ ] Rental Matching

---

# Phase 3 - Listings 🚧

Completed

- [x] Listing List
- [x] Listing Profile
- [x] Add Listing
- [x] Edit Listing
- [x] Draft Status
- [x] Available Status
- [x] Owner Link
- [x] Photo Upload
- [x] Listing Action Menu (⋮)
- [x] Clickable Listing Card
- [x] Mobile Horizontal Scroll Fix

Remaining

- [ ] Mobile Listing Layout
- [ ] Listing Profile Mobile Layout
- [ ] Property Timeline
- [ ] Duplicate Detection
- [ ] Archive
- [ ] Listing History

---

# Phase 4 - Matching

Completed

- [x] Buyer → Listing

Remaining

- [ ] Listing → Buyer
- [ ] Live Refresh
- [ ] Match Notification

---

# Phase 5 - Dashboard

Completed

- [x] KPI Cards
- [x] Recent Contacts
- [x] Recent Listings

Remaining

- [ ] Mobile Dashboard
- [ ] Remaining Commission
- [ ] Monthly Performance
- [ ] Recent Activities

---

# Phase 6 - Sales (V1.1)

- [ ] Deals
- [ ] Commission
- [ ] Timeline
- [ ] Monthly Graph
- [ ] Annual Target

---

# Phase 7 - PDF Generator (V1.1)

- [ ] Brochure
- [ ] Internal Sheet
- [ ] Flyer
- [ ] QR Code

---

# Phase 8 - Mobile First 🚧

Completed

- [x] Mobile Sidebar
- [x] Hamburger Menu
- [x] Responsive Contact Cards
- [x] iPhone Safari Testing Environment

Remaining

- [ ] Mobile Contacts Polish
- [ ] Mobile Listings
- [ ] Mobile Listing Profile
- [ ] Mobile Dashboard
- [ ] Mobile Sales
- [ ] Responsive Forms
- [ ] Bottom Navigation

---

# Phase 9 - CRM

- [ ] Follow Up
- [ ] Reminder
- [ ] Timeline
- [ ] Activity Log
- [ ] WhatsApp Integration

---

# Phase 10 - AI

- [ ] AI Listing
- [ ] AI Facebook
- [ ] AI WhatsApp
- [ ] AI Matching

---

# Phase 11 - Reports

- [ ] Sales
- [ ] Commission
- [ ] Monthly
- [ ] Yearly
- [ ] Excel Export

---

# Phase 12 - Performance

- [ ] Faster Queries
- [ ] Lazy Loading
- [ ] Mobile Optimization

---

# Future

- [ ] Facebook Publishing
- [ ] PropertyGuru Export
- [ ] iProperty Export
- [ ] Google Maps
- [ ] WhatsApp Automation
- [ ] Android App
- [ ] iPhone App

---

# Current Sprint (V1.0.3)

## Mobile First

Completed

- [x] Responsive Contact Cards
- [x] Mobile Sidebar
- [x] Hamburger Menu
- [x] Clickable Contact Cards
- [x] Listing Action Menu
- [x] Clickable Listing Cards
- [x] Fixed Mobile Horizontal Scrolling
- [x] iPhone Safari Testing

In Progress

- [ ] Mobile Listing Layout
- [ ] Mobile Listing Profile
- [ ] Mobile Dashboard

---

# Next Sprint (V1.0.4)

1. Mobile Listing Layout
2. Mobile Listing Profile
3. Mobile Dashboard
4. Listing → Buyer Matching
5. Owner Profile Polish