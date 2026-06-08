# RGBM-v2.1.3d-Build-Control-Package.md

Version: v2.1.3d  
Release Type: Corrective Stabilization Build  
Status: Draft for Review  
Base Build: RGB Mileage v2.1.3c

Purpose: Correct only the verified remaining defects from v2.1.3c review, using the locked root-cause verification results.

---

## 1. Authority Documents

This build control package is derived from:

- RGBM-v2.1.3d-Failure-Analysis.md
- RGBM-v2.1.3d-Root-Cause-Verification.md
- RGBM-v2.1.3d-Root-Cause-Verification-Results.md
- UI Consistency Rule
- Duplicate-Definition Audit Rule
- Stabilization Rule
- Code Freeze Rule

---

## 2. Build Rule

v2.1.3d is not a feature release.

No deferred items may be implemented.

No future-version decisions may be implemented.

No unrelated refactoring may be performed.

Every change must trace directly to one of the verified defects listed in this document.

---

## 3. Authorized Scope

### D-046 — Home Screen Movement Regression

Correct:

- Horizontal Home Screen movement
- Vertical Home Screen movement
- Home Screen bounce / drift

Verified Root Cause:

The root scroll model is global instead of screen-specific. `#app` remains a scrollable fixed container, while the Home Screen needs locked viewport behavior.

Required Outcome:

- Home Screen has no horizontal movement.
- Home Screen has no vertical movement.
- Home Screen does not bounce or drift.
- Content screens may still scroll vertically where required.
- No screen permits horizontal movement.

---

### D-047 — Tap-To-View Not Functioning

Correct:

- Fuel tap-to-view
- Maintenance tap-to-view
- Insurance tap-to-view

Verified Root Cause:

Previous record rows use touchstart/touchend and mouse events without reliable plain tap/click routing on iPhone PWA. Long press works, but normal tap does not consistently reach View routing.

Required Outcome:

- Fuel: Tap = View, Long Press = Edit.
- Maintenance: Tap = View, Long Press = Edit.
- Insurance: Tap = View, Long Press = Edit.
- Long press must continue to work.
- Long press must suppress only the follow-up tap/click caused by that long press.

---

### D-048 — Previous Records Missing From Edit Screens

Correct:

- Fuel Edit missing Previous Records
- Maintenance Edit missing Previous Records
- Insurance Edit missing Previous Records

Verified Root Cause:

`recordEdit()` renders the edit form and bottom navigation but does not append the matching `previousRecordsHtml()` section.

Required Outcome:

- Fuel Edit includes Previous Fuel Records.
- Maintenance Edit includes Previous Maintenance Records.
- Insurance Edit includes Previous Insurance Records.
- Edit save notification/clear behavior remains unchanged.

---

### D-050 — Navigation Interaction Inconsistency

Correct:

- Back button requires repeated taps.
- Back button does not behave as reliably as bottom navigation buttons.

Verified Root Cause:

Back button and bottom navigation buttons are not implemented as one shared navigation interaction standard. Back button is embedded in a header context with different hit area / touch behavior.

Required Outcome:

- Back button activates reliably with one tap.
- Back button uses the same interaction principles as other navigation controls.
- Back button has adequate iPhone touch target.
- No overlay or header layout interferes with activation.

---

## 4. Explicitly Excluded

The following are not authorized for v2.1.3d:

- D-017 Chrome Circle Border Styling
- D-018 Chrome Vehicle Label Styling
- D-049 Orientation Lock
- DEC-019 Move Version/Date Under Title
- DEC-020 Station List Ordering Review
- DEC-021 Fuel Grade / Maintenance Category Sorting Review
- DEC-022 Insurance Company / Agency Model Review

Also excluded:

- Backup redesign
- Report redesign
- New fields
- New record types
- Master list administration
- Any new feature
- Any visual polish unrelated to the verified defects

---

## 5. Required Duplicate-Definition Audit

Before packaging v2.1.3d:

- Search for duplicate function names.
- Search for duplicate event handlers.
- Search for duplicate workflow implementations.
- Remove obsolete definitions.
- Confirm final active definitions are the corrected shared-system versions.
- Validate behavior, not just code presence.

Target areas:

- Home screen layout functions
- Root layout / app shell functions
- Previous record row functions
- Tap / long-press functions
- Edit screen functions
- Navigation / back button functions

Packaging is not authorized unless the duplicate-definition audit passes.

---

## 6. Implementation Systems

### Layout System

Applies to:

- D-046

Required Strategy:

Use screen-specific scroll handling:

- Home Screen locked
- Content screens scroll vertically where needed
- Horizontal movement blocked globally

---

### Record Interaction System

Applies to:

- D-047

Required Strategy:

Use one shared row interaction model:

- Tap/click routes to View
- Long press routes to Edit
- Long press suppresses follow-up click
- Same implementation for Fuel, Maintenance, Insurance

---

### Edit Screen Layout System

Applies to:

- D-048

Required Strategy:

Edit screens must include:

- Edit form
- Save button
- Previous Records section
- Bottom navigation

Same pattern for Fuel, Maintenance, Insurance.

---

### Navigation Interaction System

Applies to:

- D-050

Required Strategy:

Create one navigation interaction standard:

- Back
- Bottom navigation
- Save
- Cancel

Back button must have a consistent hit area and reliable activation.

---

## 7. Required Regression Testing

The following previously-passing areas must remain functional:

### Deployment / Restore

- Version displays correctly.
- Backup restores successfully.
- Vehicles restore.
- Vehicle images restore.
- Fuel records restore.
- Maintenance records restore.
- Insurance records restore.

### Layout

- Navigation remains visually at bottom.
- Vehicle View remains multi-column.
- Seller remains full width.

### Other Workflows

- Fuel Grade default values remain.
- Fuel Grade user values remain.
- Fuel Grade Other remains.
- Maintenance Category Use Once remains attached to saved record.
- Maintenance Category Save To List remains functional.

### Edit Workflow

- Fuel Edit saves.
- Fuel Edit notification displays.
- Fuel Edit form clears.
- Fuel Edit remains on screen.
- Maintenance Edit saves.
- Maintenance Edit notification displays.
- Maintenance Edit form clears.
- Maintenance Edit remains on screen.
- Insurance Edit saves.
- Insurance Edit notification displays.
- Insurance Edit form clears.
- Insurance Edit remains on screen.

### Records

- Previous Fuel Records visible.
- Previous Maintenance Records visible.
- Previous Insurance Records visible.
- Long Press = Edit remains functional for all three record types.

---

## 8. Acceptance Gate

v2.1.3d may be accepted only if:

- D-046 passes.
- D-047 passes.
- D-048 passes.
- D-050 passes.
- Duplicate-definition audit passes.
- No excluded item is implemented.
- No new defect is introduced.
- Regression testing passes.

---

## 9. Build Freeze Rule

After implementation of authorized defects:

Permitted:

- Acceptance-test corrections
- Regression-test corrections
- Packaging corrections

Not permitted:

- New features
- Deferred items
- Future decisions
- Unrelated refactoring
- Unrelated visual enhancements

---

## 10. Release Status

Current Status:

- v2.1.3c: PASS WITH DEFECTS
- v2.1.3d: PLANNING

Next Step:

Review and lock this Build Control Package.

After lock:

- Create RGBM-v2.1.3d-Consistency-Review.md
- Create RGBM-v2.1.3d-Implementation-Plan.md
- Build only after both are locked
