# RGBM-v2.1.2b-Repair-Spec.md

App Site Address:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Version: v2.1.2b
Release Type: Stabilization Release
Status: Locked Draft

## Purpose

v2.1.2b exists solely to correct stabilization defects discovered during v2.1.2a testing.

No new features.
No UI enhancements outside the locked SB scope.
No backup architecture redesign.
No roadmap items.

---

# SB-001 — Bottom Navigation Positioning

## Problem
Bottom navigation remains too far above the bottom edge, leaving excessive blank space underneath.

## Required Fix
Position the bottom navigation flush with the safe-area-aware bottom edge.

## Acceptance Criteria
- Navigation bar sits at bottom of visible app area.
- No excessive blank space below navigation.
- No controls are obscured by the iPhone home indicator.

---

# SB-002 — Unintended Double-Tap Screen Movement

## Problem
Double tapping/clicking a blue background area shifts the app vertically and creates a black bar at the top.

## Required Fix
Suppress unintended double-tap zoom/scroll behavior on the non-editable app shell.

## Acceptance Criteria
- Double tap on background does not move the screen.
- No black bar appears at top.
- Input fields remain editable.

---

# SB-003 — Vehicle Circle Sizing

## Problem
Vehicle circles are not using the maximum available vertical space between title and navigation.

## Required Fix
Calculate circle size based on available Home Screen space after title, labels, version, and navigation are accounted for.

## Acceptance Criteria
- Circles are as large as possible.
- Labels remain visible.
- Version/date remain visible.
- No scrolling required.

---

# SB-004 — Fuel Form Layout

## Problem
Fuel form still displays one field per line.

## Required Fix
Restore two-column form layout except Notes full width.

## Acceptance Criteria
- Date / Time
- Odometer / Miles
- Gallons / MPG
- Fuel Grade / Ethanol Free
- Station / Cost Source
- Price/Gallon / Total Cost
- Notes full width

---

# SB-005 — Maintenance Form Layout

## Problem
Maintenance form still displays one field per line.

## Required Fix
Restore two-column form layout except Notes full width.

## Acceptance Criteria
- Date / Category
- Odometer / Cost
- Location / Provider
- Notes full width

---

# SB-006 — Insurance Form Layout

## Problem
Insurance form still displays one field per line.

## Required Fix
Restore two-column form layout with Agency and Notes full width.

## Acceptance Criteria
- Company / Policy Number
- Effective Date / Expiration Date
- Coverage Value / Premium
- Agent / Phone
- Email
- Agency full width
- Notes full width

---

# SB-007 — Vehicle Acquisition Data Not Saving

## Problem
Acquisition Date, Purchase Price, and Seller do not persist after save.

## Required Fix
Save acquisition fields as part of the vehicle record or one-to-one vehicle acquisition object.

## Acceptance Criteria
- Acquisition Date saves.
- Purchase Price saves.
- Seller saves.
- Values reload when returning to Edit Vehicle.
- Values display on Vehicle View or Vehicle Summary where applicable.

---

# SB-008 — Navigation Bar Missing After Vehicle Save

## Problem
After saving Vehicle Acquisition information, app returns to Home Screen without menu bar.

## Required Fix
Ensure Home Screen render path always includes bottom navigation.

## Acceptance Criteria
- Save vehicle.
- Return to Home Screen.
- Navigation bar visible.

---

# SB-009 — Previous Fuel Long Press Workflow

## Problem
Previous Fuel record tap opens View, but long press does not open the intended workflow.

## Required Fix
Previous Fuel records must use the standard Previous Record interaction model.

## Acceptance Criteria
- Tap expands or opens view according to current standard.
- Long press opens View Record workflow.
- Edit is accessible from View Record.

---

# SB-010 — Previous Insurance Long Press Workflow

## Problem
Previous Insurance record tap opens View, but long press does not open the intended workflow.

## Required Fix
Previous Insurance records must use the standard Previous Record interaction model.

## Acceptance Criteria
- Tap expands or opens view according to current standard.
- Long press opens View Record workflow.
- Edit is accessible from View Record.

---

# SB-011 — Insurance Persistence Failure

## Problem
Insurance information entered and saved is not retained.

## Required Fix
Correct Insurance save, normalization, storage, and reload path.

## Acceptance Criteria
- Insurance entry saves.
- Insurance entry reloads.
- Insurance entry appears in Previous Insurance Records.
- Insurance entry survives app refresh.
- Insurance entry survives backup/restore when backup supports it.

---

# SB-012 — Historical Insurance Records Do Not Display

## Problem
Historical Insurance Records do not display correctly.

## Required Fix
Display insurance records from existing backup/import structures and current insuranceRecords storage.

## Acceptance Criteria
- Existing insurance records display.
- Newly saved insurance records display.
- Historical insurance records display where present.

---

# SB-013 — Imported Maintenance Records Do Not Display

## Problem
Maintenance records exist according to import duplicate detection, but do not display.

## Required Fix
Normalize and render maintenance records from all supported structures.

## Acceptance Criteria
- Imported maintenance records display.
- Duplicate detection aligns with visible records.
- Maintenance records can be viewed.

---

# SB-014 — Duplicate Import Workflow Incomplete

## Problem
Duplicate import detection occurs, but user is not offered Cancel, Replace, Update, Duplicate, or Skip.

## Required Fix
Import/restore duplicate conflict workflow must present the required options.

## Acceptance Criteria
- Duplicate detection summary appears.
- User can Cancel.
- User can Replace.
- User can Update.
- User can Duplicate.
- User can Skip.

---

# SB-015 — Remove Acquisition Records as Previous Records

## Problem
Acquisition was incorrectly treated as a Previous Records section.

## Required Fix
Remove any Previous Acquisition Records concept.

## Acceptance Criteria
- No Previous Acquisition Records section.
- Acquisition data appears only in Vehicle data and Vehicle Summary report.

---

# SB-016 — Remove Move Up / Move Down

## Problem
Move Up / Move Down remains in planning artifacts despite Swap Vehicles being the locked workflow.

## Required Fix
Remove Move Up / Move Down references from implementation and review materials.

## Acceptance Criteria
- Swap Vehicles remains.
- Move Up absent.
- Move Down absent.
