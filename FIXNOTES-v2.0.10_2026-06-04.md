# RGB Mileage Fix Notes

Version: 2.0.10  
Release Date: 2026-06-04  
Build Type: Corrective / Stability Update  
Based On: v2.0.9

## Bugs / Issues Addressed

### No Way to Enter Previous Fuel Stops
Root Cause: Quick Fuel Entry used the current date/time automatically without visible editable Date and Time fields.

Resolution: Added editable Date and Time fields that auto-populate but can be modified before saving.

### No Edit/Delete Controls for Previous Fuel Entries
Root Cause: The prior Recent Entries list was read-only.

Resolution: Replaced it with a collapsible Previous Entries section and added Edit/Delete buttons for each fuel entry.

## Known Issues

- Edit workflow uses prompt dialogs in this corrective build; a dedicated edit screen may be preferred later.

## Deployment Verification

- [ ] Date field appears and auto-populates.
- [ ] Time field appears and auto-populates.
- [ ] Date and Time can be modified.
- [ ] Previous Entries section appears and collapses.
- [ ] Edit button updates a fuel entry.
- [ ] Delete button removes a fuel entry.
- [ ] Miles/MPG recalculation prompt appears when applicable.
