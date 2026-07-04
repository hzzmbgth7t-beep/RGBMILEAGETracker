# FIXNOTES.md

## v2.1.6d — Insurance Screen Merger Release Notes

### Summary
This build replaces the old Insurance view/edit split with one unified Insurance screen while leaving the accepted Fuel and Maintenance merged flows intact.

### What Was Implemented
- Empty / View / Edit Insurance states
- Insurance-specific record open routing
- Insurance-specific dirty-state handling
- Data Information on Insurance View and Insurance Edit
- Insurance Save / Cancel / Back / Home flow aligned to the accepted merged-screen model
- compatibility-aware use of Agency, Agreed Value, and one Notes field

### Not Included
- Delete / Deleted Items
- legacy-code cleanup
- broader responsive work
- new fuel or maintenance workflow changes


## v2.1.6d Fuel Delete Workflow
- Previous Fuel Records long press now opens a row actions modal with Edit / Delete / Cancel.
- Choosing Delete opens a confirmation modal with Delete Permanently / Archive Instead / Cancel.
- Fuel Edit screen now includes a Delete button for reviewing data before deleting.
