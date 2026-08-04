run vs - npm run dev
Check Git status - git status
Stage everything - git add .
Commit - git commit -m
Push to GitHub - git push

# MIB Development Roadmap

---

# Phase 1 - Foundation ✅

## Authentication
- [ ] Login
- [ ] Register
- [ ] Forgot Password
- [ ] User Roles
- [ ] Subscription Control

Status:
🟡 Freeze until V1 launch.

---

# Phase 2 - Contacts ✅

## Contact Management
- [x] Contact List
- [x] Add Contact
- [x] Edit Contact
- [x] Delete Contact
- [x] Contact Profile
- [x] Search
- [x] Status
- [x] Lead Source
- [x] Buyer / Owner / Tenant Roles

---

## Buyer Module ✅

- [x] Residential Requirements
- [x] Commercial Requirements
- [x] Industrial Requirements
- [x] Land Requirements
- [x] Matching Engine
- [x] Matching Score
- [x] Matching Listing Page

Status:
✅ Complete for V1

---

## Owner Module ✅

- [x] Owner checkbox
- [x] Owner Information
    - Purpose
    - Category
    - Area
    - Price
- [x] Auto Create Draft Property
- [x] Link Property using owner_id
- [x] Owner Properties shown in Contact Profile
- [x] Edit Listing shortcut

Status:
✅ Complete for V1

---

## Tenant Module

- [x] Tenant Role
- [ ] Tenant Requirement
- [ ] Rental Matching

Status:
🟡 Deferred to V1.1

---

# Phase 3 - Listings 🚧

## Listings

- [x] Listing Table
- [x] Listing Profile
- [x] Add Listing
- [x] Edit Listing
- [x] Draft Status
- [x] Published Status
- [x] Owner Link

Remaining

- [ ] Property Timeline
- [ ] Duplicate Detection
- [ ] Archive Listing
- [ ] Listing History

Status:
🟡 In Progress

---

# Phase 4 - Matching 🚧

- [x] Buyer → Listing
- [ ] Listing → Buyers
- [ ] Live Match Refresh
- [ ] Match Notifications

---

# Phase 5 - Dashboard

- [ ] KPI
- [ ] Active Contacts
- [ ] Active Listings
- [ ] Matching Overview
- [ ] Pipeline
- [ ] Weekly Statistics

---

# Phase 6 - Media

- [x] Photo Upload
- [x] Media Manager
- [x] Templates

Remaining

- [ ] Video Upload
- [ ] Auto Resize
- [ ] Watermark

---

# Phase 7 - AI

- [ ] AI Listing Description
- [ ] AI FB Post
- [ ] AI WhatsApp Reply
- [ ] AI Property Matching Explanation

---

# Phase 8 - CRM

- [ ] Follow Up
- [ ] Reminder
- [ ] Notes Timeline
- [ ] Activity History
- [ ] WhatsApp Integration

---

# Phase 9 - Reports

- [ ] Commission
- [ ] Sales Report
- [ ] Monthly Performance
- [ ] Export PDF
- [ ] Export Excel

---

# Phase 10 - Deployment

- [ ] Domain
- [ ] Production Database
- [ ] Backup
- [ ] SSL
- [ ] Launch

---

# V1 Launch Checklist

## Core CRM
- [x] Contacts
- [x] Buyer
- [x] Owner
- [ ] Tenant

## Listings
- [x] Draft Listing
- [x] Edit Listing
- [x] Owner Link
- [ ] Listing Profile Polish

## Matching
- [x] Buyer → Listing
- [ ] Listing → Buyer

## Dashboard
- [ ] Basic Dashboard

## Deployment
- [ ] Production Build
- [ ] Domain
- [ ] Launch

---

# RULES

✅ No more architecture changes before V1.

Only:
- Finish remaining features
- Fix bugs
- Deploy

Refactoring and UI polish move to V1.1.