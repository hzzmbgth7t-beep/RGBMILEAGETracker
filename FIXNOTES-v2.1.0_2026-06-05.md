# RGB Mileage Fix Notes

Version: 2.1.0
Release Date: 2026-06-05

## Corrective Themes

- Reconciles prior build drift by implementing the v2.1.0 master architecture.
- Prevents accidental data modification by requiring View before Edit.
- Prevents data loss by archiving records instead of deleting them.
- Adds migration normalization for older supported data.
- Creates a new service worker cache: rgbm-v2.1.0-2026-06-05.

## Deployment Verification

- [ ] App opens from GitHub Pages URL.
- [ ] App opens from Home Screen icon.
- [ ] Version shown is 2.1.0.
- [ ] Existing data visible after migration.
- [ ] Vehicle circle Home Screen displays.
- [ ] Quick Fuel Entry saves.
- [ ] Previous Fuel row tap expands/collapses.
- [ ] Previous Fuel row long press opens View Fuel Record.
- [ ] Edit button unlocks edit workflow.
- [ ] Archive hides record.
- [ ] Maintenance record workflow works.
- [ ] Insurance record workflow works.
- [ ] JSON backup exports.
- [ ] JSON restore succeeds.
- [ ] CSV import preview works.
