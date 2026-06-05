# RGB Mileage Fix Notes

Version: 2.0.11  
Release Date: 2026-06-04  
Build Type: Corrective / Stability Update  
Based On: v2.0.10

## Bugs / Issues Addressed

### Prompt-Based Fuel Entry Editing
Root Cause: v2.0.10 used prompt dialogs to edit previous fuel entries, which did not match the Quick Fuel Entry form.

Resolution: Editing now populates the Quick Fuel Entry form and changes Save Entry to Save Edit.

### Edit and Add Workflow Drift
Root Cause: Separate edit behavior could drift away from Quick Fuel Entry fields and logic.

Resolution: New fuel entry and edit now share the same visible form and calculation workflow.

## Known Issues

- Existing attachment editing is append-only in this corrective build. Replacing/removing individual receipt attachments should be improved later.

## Deployment Verification

- [ ] App opens from GitHub Pages URL.
- [ ] App opens from Home Screen icon.
- [ ] Version shown/confirmed.
- [ ] Previous Entries section opens.
- [ ] Edit opens selected entry in Quick Fuel Entry form.
- [ ] Save button changes to Save Edit.
- [ ] Cancel Edit exits edit mode.
- [ ] Save Edit shows acknowledgment.
- [ ] Save Edit clears form and remains on Quick Fuel Entry page.
- [ ] Save Entry shows acknowledgment and returns Home.
- [ ] Miles and MPG still calculate correctly.
