# RGB Mileage Fix Notes

Version: 2.0.8  
Release Date: 2026-06-04  
Build Type: Incremental Update  
Based On: v2.0.7

## Bugs / Issues Addressed

### Older JSON Backup Restore Fails
Root Cause: v1.0 backups used a different data structure with vehicle data stored directly inside vehicle records.

Resolution: Added legacy backup detection and conversion for v1.0 backups.

### Import / Backup Confusion
Root Cause: Import and Backup were split into separate screens and import contained placeholder text.

Resolution: Consolidated into Data Management and separated JSON backup/restore from CSV fuel import/export.

## Testing Performed

- app.js syntax validation.
- sw.js syntax validation.
- manifest JSON validation.
- Legacy v1.0 backup parse check.
- Legacy v1.0 backup conversion logic presence check.
- Required file presence check.
- User Guide PDF render check.

## Known Issues

- XLSX import is not active in this release.
- Supabase integration is not active in this release.
- Receipt scanning is not active in this release.

## Deployment Verification

- [ ] App opens from GitHub Pages URL.
- [ ] App opens from Home Screen icon.
- [ ] Version shown/confirmed.
- [ ] Existing data visible.
- [ ] Data Management screen opens.
- [ ] JSON backup exports with correct filename.
- [ ] v1.0 JSON backup restore preview appears.
- [ ] v1.0 JSON backup restores and converts.
- [ ] New entry saves correctly.
- [ ] CSV export test performed.
- [ ] CSV import preview test performed if needed.
