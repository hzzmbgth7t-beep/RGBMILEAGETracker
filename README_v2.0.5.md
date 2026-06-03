# RGB Mileage v2.0.5

Clean build from scratch based on the locked RGB Mileage v2.0.5 specification.

## Core Design
- Vehicle-centric application
- Two fixed vehicle circles
- Tap occupied circle: Quick Fuel Entry
- Long press occupied circle: Vehicle Details
- Rustic light theme
- Chrome RGB title and black Mileage subtitle
- Bottom icon-only navigation row
- Reports dashboard moved off Home Screen

## Deployment
This is a flat-file build for iPhone-to-GitHub uploads.

No required folders.
All files are in the root directory.
Manifest references root-level icon files only.

## Included Systems
- Vehicle setup
- Quick Fuel Entry
- Station dropdown workflow
- Fuel receipts/attachments
- Vehicle Details with tabs
- Reports Dashboard
- CSV/JSON import preview
- JSON data backup/restore
- Settings
- Record ID
- Entry Sequence
- Entry Type
- Data Quality
- Historical Marker support
- Fuel price at 2 decimals

## Deferred
- Supabase/cloud sync
- Receipt OCR/scanning
- Bulk attachment import
- Inspection tracking
- More than two vehicle slots
