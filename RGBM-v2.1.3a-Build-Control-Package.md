# RGBM-v2.1.3a-Build-Control-Package.md

Version: v2.1.3a  
Release Type: Corrective Stabilization Build  
Status: Draft for Review  
Base Build: RGB Mileage v2.1.3  
Purpose: Correct failed v2.1.3 acceptance review items only.

---

## 1. Build Rule

v2.1.3a is not a new feature release.

No deferred items may be implemented.  
No future-version decisions may be implemented.  
No unrelated refactoring may be performed.  
Every change must trace to one of the approved v2.1.3a defects listed in this document.

---

## 2. Authorized Scope

### Maintenance
- D-021 Maintenance Records Not Restored
- D-030 Maintenance Save Fails
- D-031 Maintenance Record View/Edit Testing Blocked

### Orientation
- D-022 Application Still Rotates

### Field / Layout
- D-023 Empty Date Fields Incorrect Height
- D-029 Maintenance Screen Still Not Using Multi-Column Layout
- D-032 Insurance Date Fields Incorrect Height
- D-033 Insurance Layout Regression

### Previous Record Interactions
- D-024 Previous Fuel Records Tap Action Not Working
- D-025 Previous Fuel Records Long Press Not Working
- D-034 Previous Insurance Records Tap Action Not Working
- D-035 Previous Insurance Records Long Press Not Working

### Other Workflow
- D-027 Fuel Grade Save To List Not Working

---

## 3. Explicitly Excluded

The following are not authorized for v2.1.3a:

- D-017 Circle Border Chrome Styling
- D-018 Vehicle Label Chrome Styling
- DEC-019 Move version/date under RGB Mileage title
- DEC-020 Station list ordering decision
- DEC-021 Fuel Grade / Maintenance Category ordering decision
- Backup architecture redesign
- Report redesign
- Master list administration
- Any new feature

---

## 4. Defect Implementation Map

### D-021 — Maintenance Records Not Restored

Root Cause To Investigate:
- Maintenance data may exist in backup/import structures but is not normalized into the displayed maintenance record array.
- Duplicate detection may be reading records from a different source than the Previous Maintenance Records display.

Files Likely Affected:
- app.js

Functions / Areas Likely Affected:
- normalizeData
- normMaint
- records
- recArray
- restoreBackup
- previousRecordsHtml

Required Outcome:
- Existing imported maintenance records display after restore.
- Duplicate detection and visible maintenance records use the same normalized source.

Verification:
- Restore reference backup.
- Confirm 3 imported maintenance records display.
- Confirm maintenance records are newest/highest-odometer first where applicable.

Regression Risk:
- Fuel restore
- Insurance restore
- Duplicate detection
- Record sorting

---

### D-022 — Application Still Rotates

Root Cause To Investigate:
- Manifest orientation may not be sufficient for iOS Home Screen PWA.
- CSS landscape media rules may still allow landscape visual relayout.

Files Likely Affected:
- manifest.json
- index.html
- styles.css
- app.js

Required Outcome:
- Physical rotation may occur, but app remains visually portrait-style.
- No landscape relayout.
- No content repositioning caused by rotation.

Verification:
- Rotate phone horizontally.
- Confirm app keeps portrait-style layout.

Regression Risk:
- Home Screen sizing
- Form layout
- Bottom navigation placement

---

### D-023 — Empty Date Fields Incorrect Height

Root Cause To Investigate:
- iOS date inputs render differently when empty.
- Existing CSS does not enforce fixed control height.

Files Likely Affected:
- styles.css

Required Outcome:
- All fields have the same height whether empty or populated.
- Applies to date, time, text, number, select, and email inputs.
- Notes textareas are exempt.

Verification:
- Review empty Acquisition Date, Maintenance Date, Effective Date, Expiration Date.
- Enter values and verify height does not change.

Regression Risk:
- iOS input rendering
- Form spacing

---

### D-024 — Previous Fuel Records Tap Action Not Working

Root Cause To Investigate:
- Tap handler may be blocked by pointer event handling.
- Long-press suppression logic may suppress normal tap.
- Record row markup may not route tap to View.

Files Likely Affected:
- app.js

Required Outcome:
- Single tap on previous Fuel record opens View mode.

Verification:
- Tap multiple fuel records.
- Confirm each opens View.

Regression Risk:
- Long press edit behavior
- Maintenance / Insurance previous record behavior

---

### D-025 — Previous Fuel Records Long Press Not Working

Root Cause To Investigate:
- Pointer handlers may not bind correctly.
- Long press timer may be cancelled before firing.
- Route to edit screen may be missing or unreachable.

Files Likely Affected:
- app.js

Required Outcome:
- 500ms long press on previous Fuel record opens Edit mode.

Verification:
- Long press multiple fuel records.
- Confirm Edit screen opens.

Regression Risk:
- Tap behavior
- Touch scrolling
- Previous record display

---

### D-027 — Fuel Grade Save To List Not Working

Root Cause To Investigate:
- Save To List may update select options but not persistent app state.
- Fuel grade list may not be backed by a saved state list.
- New value may not be included when rebuilding the form.

Files Likely Affected:
- app.js

Required Outcome:
- Fuel Grade Other opens standard Other form.
- Use Once selects temporary value but does not save permanently.
- Save To List saves value permanently and auto-selects it.
- Returning to new Fuel Entry shows saved value in Fuel Grade dropdown.

Verification:
- Add new fuel grade with Use Once.
- Exit and return; confirm not saved.
- Add new fuel grade with Save To List.
- Exit and return; confirm saved.

Regression Risk:
- Station Other workflow
- Maintenance Category Other workflow
- Backup/restore of custom fuel grades

---

### D-029 — Maintenance Screen Still Not Using Multi-Column Layout

Root Cause To Investigate:
- Maintenance screen may use a different markup structure than Fuel/Insurance.
- CSS grid class may not be applied to Maintenance fields.
- Overrides may not target the active Maintenance form.

Files Likely Affected:
- app.js
- styles.css

Required Outcome:
- Maintenance form uses multi-column layout.
- Notes remains full width.
- No other Maintenance field is full width unless specifically required.

Verification:
- Open Quick Maintenance Entry.
- Confirm Date/Category share row.
- Confirm Odometer/Cost share row.
- Confirm Location/Provider share row.
- Confirm Notes full width.

Regression Risk:
- Maintenance save
- Maintenance category dropdown
- Notes display

---

### D-030 — Maintenance Save Fails

Root Cause To Investigate:
- Maintenance save function may reference incorrect field IDs.
- Field ID changes from layout updates may not match save function.
- Maintenance record may be saved to wrong array or missing required properties.

Files Likely Affected:
- app.js

Required Outcome:
- Save Maintenance creates visible maintenance record.
- Saved record persists after leaving screen.
- Saved record persists after refresh.

Verification:
- Create maintenance entry.
- Confirm appears in Previous Maintenance Records.
- Refresh and confirm still present.

Regression Risk:
- Maintenance restore
- Maintenance sorting
- Duplicate detection

---

### D-031 — Maintenance Record View/Edit Testing Blocked

Dependency:
- D-030

Required Outcome:
- Once maintenance records can be created and displayed, tap and long press behavior must be tested and corrected if needed.

Verification:
- Tap Maintenance record = View.
- Long press Maintenance record = Edit.

Regression Risk:
- Shared previous-record handler

---

### D-032 — Insurance Date Fields Incorrect Height

Root Cause To Investigate:
- Same iOS date input rendering issue as D-023.

Files Likely Affected:
- styles.css

Required Outcome:
- Effective Date and Expiration Date fields have same height whether empty or populated.

Verification:
- Open Quick Insurance Entry with empty dates.
- Enter dates.
- Confirm height remains constant.

Regression Risk:
- Other input sizing

---

### D-033 — Insurance Layout Regression

Root Cause To Investigate:
- Policy Number and Premium may be wrapped in full-width labels or CSS targeting incorrectly.
- Agency label may have replaced Company or markup order may be wrong.

Files Likely Affected:
- app.js
- styles.css

Required Outcome:
- Company / Policy Number share row.
- Effective Date / Expiration Date share row.
- Coverage Value / Premium share row.
- Agent / Phone share row.
- Email participates in grid as appropriate.
- Agency full width.
- Notes full width.

Verification:
- Open Quick Insurance Entry.
- Confirm Policy Number is not full width.
- Confirm Premium is not full width.
- Confirm Agency and Notes are full width.

Regression Risk:
- Insurance save
- Insurance display
- Insurance edit screen

---

### D-034 — Previous Insurance Records Tap Action Not Working

Root Cause To Investigate:
- Same shared interaction issue as D-024.

Files Likely Affected:
- app.js

Required Outcome:
- Single tap on previous Insurance record opens View mode.

Verification:
- Tap multiple insurance records.
- Confirm each opens View.

Regression Risk:
- Shared previous-record handler

---

### D-035 — Previous Insurance Records Long Press Not Working

Root Cause To Investigate:
- Same shared interaction issue as D-025.

Files Likely Affected:
- app.js

Required Outcome:
- 500ms long press on previous Insurance record opens Edit mode.

Verification:
- Long press multiple insurance records.
- Confirm Edit screen opens.

Regression Risk:
- Tap behavior
- Shared previous-record handler

---

## 5. Required Regression Testing

Before packaging v2.1.3a:

### Restore
- Current backup restores successfully.
- Vehicles restore.
- Vehicle images restore.
- Fuel records restore.
- Maintenance records restore.
- Insurance records restore.

### Existing Working Features
- Home Screen has no white top area.
- Home Screen does not move vertically.
- Double tap does not shift screen.
- Acquisition data saves.
- Fuel entry saves.
- Fuel fields remain correctly sized.
- Station Other workflow still works.
- Maintenance Category Other workflow still works.
- Insurance records display.
- Swap Vehicles works.
- JSON Backup works.
- JSON Restore works.

---

## 6. Acceptance Checklist

v2.1.3a may be accepted only if:

- D-021 passes
- D-022 passes
- D-023 passes
- D-024 passes
- D-025 passes
- D-027 passes
- D-029 passes
- D-030 passes
- D-031 passes
- D-032 passes
- D-033 passes
- D-034 passes
- D-035 passes
- No excluded items are implemented
- No new defects are introduced
- Regression tests pass

---

## 7. Build Freeze Rule

After implementation of the authorized v2.1.3a defects:

Only the following changes are permitted:
- Acceptance-test corrections
- Regression-test corrections
- Packaging corrections

No feature additions.  
No deferred items.  
No visual polish.  
No unrelated refactoring.

---

## 8. Release Status

Current status:
- v2.1.3 failed review
- v2.1.3a not yet authorized for implementation
- This package requires review and lock before coding

Next step after approval:
- Lock this Build Control Package
- Begin implementation from the v2.1.3 source package
