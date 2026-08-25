# MIB Changelog

## V1.0 - 2026-08-04

### Added

- Contacts CRM
- Buyer Management
- Owner Management
- Automatic Draft Property Creation
- Listings Module
- Dashboard
- Buyer Matching
- Contact Profile
- Owner Properties

### Fixed

- Next.js App Router cache issue using force-dynamic
- Dashboard live refresh
- Contacts live refresh

### Known Issues

- Tenant module not implemented
- Listing → Buyer matching postponed
- Dashboard analytics postponed

---

## V1.0.2 - Contacts UI Redesign

### Added / Changed

- Redesigned Contacts list UI
- Compact horizontal contact layout
- Owner property information restored
- Added 3-dot action menu
- Added View/Edit/Delete menu with icons
- Improved typography and spacing
- Card clickable to open Contact Profile
- Preserved buyer/owner/tenant filtering

---

## V1.0.3 - Mobile UI Foundation

### Added / Changed

- Added responsive mobile sidebar
- Added hamburger navigation
- Added AppShell architecture
- Added Listing action menu
- Made listing cards clickable
- Fixed mobile horizontal scrolling on listings
- Improved responsive layout foundation
- Updated Next.js allowedDevOrigins for local device testing
- Verified on iPhone Safari

---

## V1.0.4 - Buyer Matching & Contact Profile

### Added

- Implemented automatic Buyer → Listing matching
- Implemented Listing → Buyer matching
- Added centralized matching engine in `src/lib/matching.ts`
- Added weighted matching score system
- Added Property Category matching
- Added Purpose matching
- Added Location matching
- Added Budget matching
- Added Category-specific requirement matching
- Added Residential matching
- Added Commercial matching
- Added Industrial matching
- Added Land matching
- Added matched requirement reporting
- Added failed requirement reporting
- Added minimum matching threshold
- Added ranked matching results by score

### Buyer Matching

- Added Matching Buyers section to Listing Profile
- Displays matching buyer count
- Displays buyer matching percentage
- Displays matched requirements
- Displays failed requirements
- Added View Buyer action from Listing Profile
- Added return navigation from Buyer Profile back to originating Listing

### Contact Profile

- Added Matching Listings section to Buyer Profile
- Displays number of matched listings
- Displays best matching listing score
- Added View Matching Listings action
- Added Buyer Requirement section
- Added Owner Properties section
- Added buyer / owner / tenant role handling
- Added owner property display inside Contact Profile

### Fixed

- Fixed Contact Profile matching navigation
- Fixed 404 issue for Matching Listings route
- Fixed incorrect debug information displayed on Contact Profile
- Removed temporary red diagnostic text
- Fixed matching navigation between Listing Profile and Contact Profile

---

## V1.0.5 - PDF Generator

### Added

- Added PDF Brochure Generator
- Added Internal Property Sheet Generator
- Added downloadable PDF generation from Listing Profile
- Added 2-page brochure structure
- Added maximum 9 property photos to brochure
- Added property hero / cover photo
- Added property title
- Added asking price
- Added property information
- Added property overview
- Added location information
- Added property description
- Added property photo gallery
- Added listing agent section
- Added MIB branding
- Added FOR SALE presentation
- Added brochure footer

### Brochure Design

- Introduced dedicated MIB property brochure layout
- Added full-width hero property image
- Added dark hero image overlay
- Added property title overlay
- Added pricing and key-facts section
- Added Page 2 photo gallery
- Added description and location layout
- Added agent/contact section
- Limited brochure to maximum 2 pages
- Limited brochure gallery to maximum 9 photos

### Listing Actions

- Added Generate Brochure action to Listing Profile
- Added Internal Sheet action to Listing Profile
- Added 3-dot Listing Actions menu
- Moved Edit Listing into 3-dot action menu
- Reduced Back button size
- Added click-outside behaviour to close action menu
- Cleaned up action menu spacing and presentation

### Fixed

- Fixed `PDFDownloadLink` runtime error
- Fixed React PDF web-build issue
- Fixed TypeScript errors in brochure components
- Fixed brochure generation after page refresh
- Confirmed generated PDFs download successfully
- Confirmed generated PDFs open correctly
- Confirmed current TypeScript Problems count is 0

### Brochure Polish

- Improved hero title wrapping
- Widened hero title area
- Reduced hero overlay darkness
- Reduced bottom hero overlay darkness
- Adjusted hero height
- Improved price/key-facts proportions
- Improved key-facts spacing
- Adjusted fact label and value sizing

### Design Decisions

- Brochure and Flyer will use the same main marketing document concept
- Separate Flyer generator is not required at this stage
- Internal Sheet remains a separate internal-use document
- QR Code postponed
- Public property listing/search page postponed
- Brochure will not depend on a public listing URL at this stage
- Property Highlights will eventually be managed from the Listing module and pulled automatically into the brochure

### Current Status

- PDF Generator functional
- Brochure functional
- Internal Sheet functional
- Brochure visual polishing ongoing
- Property Highlights integration pending
- Property overview icon refinement pending
- Final brochure visual approval pending

---

## Known Issues / Future Work

- Tenant module not implemented
- Dashboard analytics postponed
- Property Highlights input/integration pending
- Brochure visual polishing ongoing
- Public property search/listing system not implemented
- QR Code functionality postponed