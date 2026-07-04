# CHANGELOG.md

## v2.1.6d — Insurance Screen Merger Release
Date: 2026-06-12

### Purpose
This release applies the accepted merged-screen model to Insurance, completing the section merger work across Fuel, Maintenance, and Insurance.

### Added / Changed
- unified Insurance screen with Empty / View / Edit states
- Insurance tap -> View
- Insurance long press -> Edit
- New button for new Insurance entry
- Data Information available in Insurance View and Insurance Edit
- Insurance-specific unsaved-change handling
- Insurance-specific Save / Cancel / Back / Home prompt flow aligned to the accepted Fuel and Maintenance model
- Insurance compatibility-aware field loading for legacy values

### Scope Notes
This release updates Insurance only. Fuel and Maintenance remain on their accepted merged-screen models.


## v2.1.6d Fuel Delete Workflow
- Previous Fuel Records long press now opens a row actions modal with Edit / Delete / Cancel.
- Choosing Delete opens a confirmation modal with Delete Permanently / Archive Instead / Cancel.
- Fuel Edit screen now includes a Delete button for reviewing data before deleting.
