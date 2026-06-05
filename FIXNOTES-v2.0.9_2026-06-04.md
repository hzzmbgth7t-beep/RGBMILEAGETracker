# RGB Mileage Fix Notes

Version: 2.0.9  
Release Date: 2026-06-04  
Build Type: Corrective / Stability Update  
Based On: v2.0.8

## Bugs / Issues Addressed

### Missing Miles and MPG Fields
Root Cause: Quick Fuel Entry saved calculated values but did not expose Miles and MPG fields clearly.

Resolution: Added visible Miles and MPG fields. MPG calculates from Miles divided by Gallons.

### First Fuel Entry Requires Manual Miles
Root Cause: No prior odometer exists for the first entry.

Resolution: Miles remains editable, allowing manual entry when no previous fuel entry exists.

### Historical Entry Recalculation
Root Cause: Adding older entries can change the correct Miles value for newer entries.

Resolution: The app prompts to update affected newer Miles and recalculates MPG if accepted.

### Large Photo Backup Risk
Root Cause: Full-size phone photos can make JSON backups large and unreliable.

Resolution: Imported images are optimized before storage and backup.

## Testing Performed

- app.js syntax validation.
- sw.js syntax validation.
- manifest JSON validation.
- Required file presence check.
- User Guide PDF render check.

## Known Issues

- XLSX import is not active.
- Supabase integration is not active.
- Receipt scanning is not active.

## Deployment Verification

- [ ] App opens from GitHub Pages URL.
- [ ] App opens from Home Screen icon.
- [ ] Version shown/confirmed.
- [ ] Existing data visible.
- [ ] Data Management screen opens.
- [ ] JSON backup summary appears.
- [ ] JSON backup exports with correct filename.
- [ ] Miles field appears on Quick Fuel Entry.
- [ ] MPG field appears on Quick Fuel Entry.
- [ ] Miles calculates from previous fuel entry.
- [ ] Manual Miles works for first entry.
- [ ] MPG recalculates after accepted Miles update.
- [ ] Photo optimization tested.
- [ ] New entry saves correctly.
