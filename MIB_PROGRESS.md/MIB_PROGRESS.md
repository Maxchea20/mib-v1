MIB DEVELOPMENT ROADMAP
Version V1.0.7
Last Updated: 2026-08-20


CURRENT STATUS

Phase 1 — Foundation 🟡
Phase 2 — Contacts ✅
Phase 3 — Listings ✅
Phase 4 — Matching ✅
Phase 5 — Dashboard 🚧
Phase 6 — Sales 🚧 Bug Fix / Finalisation
Phase 7 — PDF Generator 🚧 Functional / Polish Later
Phase 8 — Mobile 🚧 Design Ready
Phase 9 — AI Video Studio 🎬 Phase 1 Complete / Phase 2 Active
Phase 10 — CRM 🔜
Phase 11 — AI 🔜
Phase 12 — Reports 🔜
Phase 13 — Performance 🔜


==================================================
PHASE 1 — FOUNDATION 🟡
==================================================

Status: Frozen

Core architecture is stable.

Do not modify foundation unless a real bug requires it.


==================================================
PHASE 2 — CONTACTS ✅
==================================================

Completed:

[x] Contact List
[x] Contact Profile
[x] Add Contact
[x] Edit Contact
[x] Delete Contact
[x] Buyer Matching
[x] Owner Property Preview
[x] Contact Action Menu
[x] Clickable Contact Card
[x] Mobile Responsive

Remaining:

[ ] Profile Polish


==================================================
PHASE 3 — LISTINGS ✅
==================================================

Completed:

[x] Listing List
[x] Listing Profile
[x] Add Listing
[x] Edit Listing
[x] Owner Link
[x] Photo Upload
[x] Mobile Responsive
[x] Clickable Listing Card
[x] Listing Action Menu
[x] Tenure
[x] Facing
[x] Property Highlights
[x] Highlights displayed on Listing Profile

Listing Agent:

[x] Listing Agent dropdown
[x] Max option
[x] Cobroke Agent option
[x] Cobroke Agent Name field
[x] Cobroke Agent Name stored in Supabase
[x] Cobroke Agent Name excluded from generated PDF
[x] PDF shows Max when Cobroke Agent is selected

Remaining:

[ ] Property Timeline
[ ] Duplicate Detection
[ ] Archive
[ ] Listing History


==================================================
PHASE 4 — MATCHING ✅
==================================================

Completed:

[x] Buyer → Listing
[x] Listing → Buyer
[x] Matching Score
[x] Matching Requirements
[x] Matching Listings Page
[x] Matching Buyers Page
[x] Dashboard Matched Listings & Buyers
[x] Dashboard Top Match Display
[x] Match Score Display
[x] Reuse existing calculateMatchScore() engine
[x] Match threshold ≥ 60%
[x] Top 5 Dashboard Matches

Deferred:

[ ] Live Refresh
[ ] Notifications


==================================================
PHASE 5 — DASHBOARD 🚧
==================================================

Completed:

[x] KPI Cards
[x] Recent Contacts
[x] Recent Listings
[x] 2026 Gross Commission
[x] 2026 Gross Commission Target
[x] Remaining to Target
[x] Target Progress %
[x] Matched Listings & Buyers
[x] Top 5 Buyer → Listing Matches
[x] Match Score Display
[x] Link to Buyer
[x] Link to Listing

Remaining:

[ ] Monthly Performance
[ ] Recent Activities

Notes:

Dashboard currently acts as the main operational overview:

Core KPIs
↓
2026 Sales Performance
↓
Matched Listings & Buyers
↓
Recent Contacts / Listings


==================================================
PHASE 6 — SALES 🚧
==================================================

Status:

Functionally built.
Currently finishing Deal Number behaviour and testing.

Completed:

[x] Deals Table
[x] CSV Import
[x] Sales Module
[x] KPI Cards
[x] Yearly Gross Commission Chart
[x] Monthly Multi-Year Line Chart
[x] Recharts Integration
[x] Mobile Chart Support
[x] Sales List
[x] Latest Year Automatically Selected
[x] Deal Number Ordering
[x] Add Sale
[x] Edit Sale
[x] Delete Sale
[x] Save Deal
[x] Save Success Confirmation
[x] Highest Gross Commission
[x] Lowest Gross Commission
[x] Average Gross Commission
[x] Claimed Gross Commission
[x] Potential / Unclaimed Gross Commission
[x] Claimed vs Potential Display
[x] 2026 Gross Commission Target
[x] Target Progress
[x] Remaining to Target
[x] Projected Year-End Gross Commission
[x] Monthly Average Gross Commission
[x] Projected Target Progress

New Sales Improvements:

[x] Deal Type dropdown — Sale / Rent
[x] Claim Month dropdown
[x] Automatic Deal No. on Add
[x] Deal No. locked during Edit
[x] Supabase deal_no confirmed as text field

Current fixes:

[ ] Restore affected Rent Deal No. 15
[ ] Verify Edit preserves Deal No.
[ ] Verify Sales list remains ordered by Deal No. after Edit
[ ] Test Delete + automatic renumbering
[ ] Test Add → Edit → Delete → Add cycle

Deal Number Behaviour:

New deals automatically receive the next Deal No.

Example:

#1
#2
#3

New Deal → #4

When a deal is deleted:

Before:

#1
#2
#3
#4
#5

Delete #3

After:

#1
#2
#3
#4

The remaining deals are automatically renumbered.

Claim Month Behaviour:

Claim Month is a dropdown.

For August 2026, new deals show:

August 2026
September 2026
October 2026
November 2026
December 2026

Past months are not offered for new deals.

Existing historical claim months remain available when editing older deals.

Deal Type:

Sale
Rent

Current Target:

RM200,000 Gross Commission

Future:

[ ] Auto-refresh charts after Add/Edit/Delete
[ ] Claimed Series
[ ] Upcoming / Unclaimed Series
[ ] Potential Gross Commission refinement
[ ] Target Projection refinement


==================================================
PHASE 7 — PDF GENERATOR 🚧
==================================================

Status:

Functional foundation complete.
Visual polishing later.

Completed:

[x] Brochure PDF generation
[x] 2-page brochure structure
[x] Maximum 9 photos
[x] Cover photo selection by property category
[x] Photo gallery
[x] Property Overview
[x] Dynamic property information
[x] Tenure
[x] Facing
[x] Property Highlights
[x] Listing Profile → PDF data flow
[x] Native PDF vector icons
[x] MIB branding structure
[x] Agent section
[x] Listing action menu
[x] Generate Brochure action
[x] Internal Sheet action
[x] Cobroke Agent excluded from PDF

Paused:

[ ] Final brochure visual polishing
[ ] Exact reference-design matching
[ ] Final spacing/alignment polish
[ ] Final typography polish

Deferred:

[ ] Flyer
[ ] QR Code


==================================================
PHASE 8 — MOBILE 🚧
==================================================

Status:

Design direction established.
Implementation not yet completed.

Completed:

[x] Mobile Sidebar
[x] Mobile Contacts
[x] Mobile Listings
[x] Responsive Listing Action Menu
[x] Mobile UI/UX Design Reference

Remaining:

[ ] Mobile Dashboard
[ ] Mobile Listing Profile
[ ] Mobile Buyer Profile
[ ] Mobile Matching
[ ] Mobile Generate PDF
[ ] Mobile PDF Preview
[ ] Bottom Navigation
[ ] Light Mode
[ ] Dark Mode
[ ] Full mobile system review


==================================================
PHASE 9 — AI VIDEO STUDIO 🎬
==================================================

PHASE 1 — AI PROPERTY VIDEO

Status: COMPLETE AND FROZEN

Completed:

[x] Runway API integration
[x] Director style system
[x] Professional Real Estate style
[x] Dynamic Action Tour style
[x] POV Property Walkthrough style
[x] Social Reel style
[x] AI Director property/photo analysis
[x] Director Action Scripts
[x] Photo-to-shot planning
[x] Sequential Runway generation
[x] 1-concurrency protection
[x] Automatic project creation
[x] Automatic status polling
[x] Automatic shot completion detection
[x] Automatic final video assembly
[x] No manual browser refresh required
[x] Final assembled MP4 generation
[x] Final Video Gallery
[x] Final Video history
[x] Final assembled video download
[x] Final assembled video delete
[x] Compact Director Shot thumbnails
[x] Expandable Director Action Script
[x] Mobile-friendly Director Plan UI
[x] Runway generated shots hidden from main UI
[x] Final Property Video displayed as completed marketing output

Architecture:

Property Photos
↓
AI Director
↓
Director Style
↓
Director Action Scripts
↓
Runway
↓
Individual AI Shots
↓
Automatic Polling
↓
Automatic Assembly
↓
Final Assembled Video
↓
Final Video Gallery

IMPORTANT:

Phase 1 is COMPLETE and FROZEN.

Do not unnecessarily modify the Runway generation pipeline during Phase 2.


==================================================
PHASE 9 — PHASE 2
AI VIDEO POST-PRODUCTION 🎬🚧
==================================================

Goal:

Transform the existing clean assembled video into a finished real-estate marketing video without regenerating Runway footage.

Architecture:

Existing Clean Video
↓
AI Post-Production Director
↓
Text Plan
+
Music Plan
+
CTA
+
Branding
↓
FFmpeg
↓
Final Marketing Video


STEP 1 — AI POST-PRODUCTION DIRECTOR

Completed / Built:

[x] Load existing assembled video
[x] Load property data
[x] Load original Director Plan
[x] Determine shots requiring text
[x] Determine marketing text
[x] Determine text timing
[x] Determine text position
[x] Determine when no text should be used
[x] Structured post-production plan architecture

Remaining:

[ ] Finalize reliable AI post-production JSON
[ ] Make AI planning resilient against malformed responses
[ ] Validate all generated timing/position values before FFmpeg


STEP 2 — PROPERTY TEXT ENGINE

Completed / Built:

[x] Read property information from Supabase
[x] Select useful marketing facts
[x] Price
[x] Location
[x] Property type
[x] Bedrooms
[x] Bathrooms
[x] Tenure
[x] Land / built-up size
[x] Property highlights
[x] Concise marketing text

Remaining:

[ ] Improve marketing-text selection
[ ] Avoid repetitive overlays
[ ] Avoid unnecessary text on every shot


STEP 3 — CREATIVE TEXT DESIGN SYSTEM

Goal:

Text must NOT simply appear as boring centered captions.

AI should decide where and how text fits the actual shot.

Requirements:

[ ] MIB typography system
[ ] Font selection
[ ] Text sizing
[ ] Shot-aware text position
[ ] Safe margins
[ ] Background / gradient treatment
[ ] Opacity
[ ] Fade in
[ ] Fade out
[ ] Text animation
[ ] Avoid covering important property details
[ ] Different compositions across shots
[ ] Creative placement based on shot composition

Style Behaviour:

Professional Real Estate
→ Elegant / minimal

Dynamic Action Tour
→ Stronger / punchier

POV Property Walkthrough
→ Subtle / lifestyle

Social Reel
→ Bold / fast / attention-first


STEP 4 — MUSIC SYSTEM 🎵

Goal:

Music should feel like modern TikTok / Reels-quality background music, NOT generic dull corporate music.

Requirements:

[ ] MIB music library
[ ] Cinematic
[ ] Luxury
[ ] Lifestyle
[ ] Modern
[ ] Energetic
[ ] Social
[ ] Calm
[ ] Automatic music selection by Director Style
[ ] Music volume control
[ ] Fade in
[ ] Fade out
[ ] Preserve original video audio where appropriate
[ ] Beat-aware editing
[ ] Rhythm-aware cuts
[ ] Music timing aligned to shot changes
[ ] Avoid repetitive / dull tracks
[ ] Licensed music only
[ ] Automatic track discovery from Supabase ai-music bucket
[ ] Graceful fallback when no suitable track exists

IMPORTANT:

The system must NOT assume music exists.

If the required music library is unavailable, the system must fail gracefully and explain exactly what is missing rather than silently breaking the assembly.


STEP 5 — FFMPEG POST-PRODUCTION

Completed / Built:

[x] Load existing assembled video
[x] Apply post-production plan architecture
[x] Add text overlays
[x] Apply text timing
[x] Apply text animations
[x] Apply camera motion effects

Remaining:

[ ] Robust FFmpeg filter escaping
[ ] Fix dynamic scale expressions
[ ] Fix drawtext expression escaping
[ ] Prevent malformed filter graphs
[ ] Add background music
[ ] Mix audio
[ ] Apply branding
[ ] Render reliable final MP4
[ ] Preserve original assembled video if post-production fails

CRITICAL RULE:

A post-production failure must NEVER make the existing working video disappear from the Listing page.

The original assembled video must remain available until the new final video has successfully rendered and been stored.


STEP 6 — FINAL CTA / BRANDING

Requirements:

[ ] Property name
[ ] Price
[ ] Bedrooms / bathrooms
[ ] Location
[ ] Sale / Rent status
[ ] Agent branding
[ ] Agent name
[ ] Company branding
[ ] Final call-to-action


STEP 7 — FINAL MARKETING VIDEO

Existing Clean Video
↓
AI Post-Production Director
↓
Creative Text
↓
Creative Positioning
↓
Music Selection
↓
Beat / Rhythm Timing
↓
Branding
↓
CTA
↓
FFmpeg
↓
Final Marketing Video
↓
Final Video Gallery
↓
Listing Page


IMPORTANT PHASE 2 RULE:

Do NOT regenerate Runway footage for Phase 2 changes.

Changes to:

- Property price
- Text
- Music
- CTA
- Branding
- Text style
- Overlay position
- Overlay timing

should be handled by the post-production layer whenever possible.

This keeps Runway generation costs low.


==================================================
PHASE 10 — CRM 🔜
==================================================

Core CRM:

[ ] Follow Up
[ ] Reminder
[ ] Activity Timeline
[ ] Activity Log
[ ] WhatsApp
[ ] Call Button
[ ] Follow-up Status
[ ] Follow-up History
[ ] Contact → Listing activity
[ ] Listing → Contact activity

Mobile Behaviour:

[ ] WhatsApp button on phone
[ ] Call button on phone
[ ] Hide WhatsApp / Call buttons on desktop browser


==================================================
PHASE 11 — AI 🤖
==================================================

[ ] AI Listing
[ ] AI Facebook
[ ] AI WhatsApp
[ ] AI Matching
[ ] AI Listing Description
[ ] AI Property Highlights
[ ] AI Buyer Recommendation


==================================================
PHASE 12 — REPORTS 📊
==================================================

[ ] Sales Reports
[ ] Commission Reports
[ ] Monthly Reports
[ ] Yearly Reports
[ ] Excel Export


==================================================
PHASE 13 — PERFORMANCE ⚡
==================================================

[ ] Query Optimization
[ ] Lazy Loading
[ ] Database Optimization
[ ] Mobile Optimization
[ ] Large Dataset Testing
[ ] 10,000+ Transaction Data Testing


==================================================
FUTURE — EXTERNAL INTEGRATIONS
==================================================

[ ] Facebook Publishing
[ ] PropertyGuru Export
[ ] iProperty Export
[ ] Google Maps
[ ] WhatsApp Automation
[ ] Android App
[ ] iPhone App


==================================================
FUTURE — COMMERCIALISATION
==================================================

Separate roadmap.

Not part of the current personal MIB system.

[ ] Multi-agent accounts
[ ] Agent permissions
[ ] Admin panel
[ ] Company-level data
[ ] Subscription tiers
[ ] Payment system
[ ] Usage limits
[ ] Gatherian-wide listings
[ ] Gatherian-wide transaction database
[ ] Security / Row Level Access
[ ] Audit logs
[ ] Agent billing
[ ] Company reporting
[ ] SaaS infrastructure


==================================================
CURRENT DEVELOPMENT PRIORITY
==================================================

1. FINISH SALES

[ ] Restore affected Rent Deal No. 15
[ ] Verify Edit preserves Deal No.
[ ] Verify Sales list remains ordered by Deal No. after Edit
[ ] Test Delete + automatic renumbering
[ ] Test Add → Edit → Delete → Add
[ ] Freeze Sales


2. FINISH AI VIDEO PHASE 2

[ ] Reliable AI post-production JSON
[ ] Creative property text
[ ] Creative text positioning
[ ] Text animation
[ ] TikTok/Reels-quality music
[ ] Beat / rhythm timing
[ ] Audio mixing
[ ] Branding
[ ] CTA
[ ] Final reliable FFmpeg render
[ ] Preserve working video if rendering fails


3. CRM

[ ] Follow-up
[ ] Activity Timeline
[ ] Activity Log
[ ] WhatsApp
[ ] Calls
[ ] Reminders


4. MOBILE

[ ] Dashboard
[ ] Listings
[ ] Buyers
[ ] Matching
[ ] PDF
[ ] Bottom Navigation
[ ] Light / Dark Mode


5. AI MARKETING

MIB Data
↓
AI
├── Listing Content
├── Facebook Content
├── WhatsApp
├── Buyer Matching
└── Property Recommendations


==================================================
MIB END GOAL
==================================================

PROPERTY DATABASE
↓
CONTACT DATABASE
↓
BUYER / PROPERTY MATCHING
↓
SALES / COMMISSION MANAGEMENT
↓
CRM / FOLLOW-UP
↓
AI CONTENT GENERATION
↓
AI VIDEO
↓
SOCIAL MEDIA MARKETING
↓
LEAD GENERATION
↓
SALES


==================================================
DEVELOPMENT PRINCIPLES
==================================================

1. Do not overbuild.

Build the feature that solves the current operational problem.

Do not add unnecessary complexity.

2. Reuse existing logic.

If a function already exists, reuse it.

Example:

calculateMatchScore()

should remain the single matching engine.

3. Data first, UI second.

Supabase
↓
Data / Business Logic
↓
Components
↓
Desktop / Mobile UI

4. Historical data stays historical.

Sales data from previous years remains available for charts and analysis.

5. Functional before cosmetic.

A feature does not need to be visually perfect before moving to the next important system.

6. Do not break working systems.

When adding a new layer, existing working functionality must remain available until the replacement is confirmed working.

Especially:

- Listing videos
- Supabase records
- Generated PDFs
- Sales records
- Uploaded photos

7. One complete implementation at a time.

Do not build a half-feature and then redesign it three times.

When a feature is started:

1. Understand the complete requirement.
2. Modify all necessary files together.
3. Preserve existing working functionality.
4. Test the complete workflow.
5. Fix bugs.
6. Freeze it.
7. Move to the next module.

NO UNNECESSARY SIDE QUESTS.


==================================================
MIB CURRENT ARCHITECTURE
==================================================

                    MIB
                     |
          +----------+----------+
          |          |          |
       Contacts   Listings   Buyers
          |          |          |
          +----------+----------+
                     |
                  Matching
                     |
          +----------+----------+
          |                     |
      Dashboard               Sales
          |                     |
          |                     |
          +----------+----------+
                     |
                    CRM
                     |
                  Mobile
                     |
                    AI
                     |
             Marketing Machine


==================================================
FINAL OBJECTIVE
==================================================

MIB should become a complete one-man AI real-estate operating system.

The system should progressively reduce repetitive manual work and allow one agent to manage:

- Listings
- Buyers
- Owners
- Contacts
- Matching
- Sales
- Commission
- Claims
- CRM
- Follow-ups
- Property marketing
- AI content
- AI video
- Social media marketing
- Lead generation

with as little repetitive manual work as possible.


END OF ROADMAP