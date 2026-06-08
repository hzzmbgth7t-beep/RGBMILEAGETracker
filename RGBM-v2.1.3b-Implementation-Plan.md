# RGBM-v2.1.3b-Implementation-Plan.md

Version: v2.1.3b
Status: DRAFT FOR REVIEW
Base Version: v2.1.3a
Build Type: Corrective Stabilization Release

Purpose:
Define the implementation strategy for the approved v2.1.3b scope.

This plan follows:

- RGBM-v2.1.3b-Build-Control-Package.md
- RGBM-v2.1.3b-Consistency-Review.md
- UI Consistency Rule
- Stabilization Rule
- Code Freeze Rule

---

# Implementation Philosophy

v2.1.3b will be implemented by correcting shared systems rather than isolated pages.

Objective:

One behavior

One workflow

One visual standard

One implementation

whenever practical.

---

# System 1 — Layout System

Affected Defects:

- D-036
- D-037

---

## D-036

Navigation Bar Not Anchored To Bottom

Issue:

Bottom navigation is positioned above the bottom edge of the viewport.

Implementation Goal:

Anchor navigation to the bottom edge of the visible viewport.

Required Outcome:

- No visible gap below navigation.
- Consistent behavior across all screens.

Verification:

Review:

- Home
- Reports
- Data
- Settings
- Entry Screens
- View Screens
- Edit Screens

Regression Risk:

Medium

---

## D-037

Vehicle View Layout Not Matching Vehicle Edit

Issue:

Vehicle Edit uses multi-column layout.

Vehicle View remains single-column.

Implementation Goal:

Apply same layout standard to Vehicle View.

Approved Exception:

Seller remains full width.

Verification:

Vehicle View visually mirrors Vehicle Edit.

Regression Risk:

Low

---

# System 2 — Record Interaction System

Affected Defects:

- D-040
- D-042
- D-045

Current Standard:

Tap

→ View

Long Press (500ms)

→ Edit

Implementation Goal:

Ensure all record types use the same interaction handler.

Participating Areas:

- Fuel Records
- Maintenance Records
- Insurance Records

Required Outcome:

Tap = View

Long Press = Edit

Verification:

All three record types behave identically.

Regression Risk:

Medium

---

# System 3 — Other Workflow System

Affected Defects:

- D-041
- D-043

Implementation Goal:

Ensure all Other workflows use the same persistence model.

---

## D-041

Fuel Grade Default List Lost

Required Outcome:

Dropdown contains:

- Default values
- User values
- Other

Verification:

Default list remains available after Save To List.

Regression Risk:

Medium

---

## D-043

Use Once Value Not Preserved

Required Outcome:

Use Once value remains attached to saved record.

Use Once does not permanently modify dropdown list.

Verification:

Save record.

Reopen record.

Selected value remains visible.

Regression Risk:

Medium

---

# System 4 — Edit Workflow System

Affected Defect:

- D-039

Locked Standard:

Save Edit

→ Success Notification

→ Clear Form

→ Remain On Screen

Participating Areas:

- Fuel Edit
- Maintenance Edit
- Insurance Edit

Implementation Goal:

Create one edit-save workflow used by all edit screens.

Required Outcome:

- Notification displayed.
- Form cleared.
- User remains on screen.

Verification:

All edit screens behave identically.

Regression Risk:

Medium

---

# Required Regression Testing

The following items must remain functional:

## Restore

- Vehicle restore
- Fuel restore
- Maintenance restore
- Insurance restore

## Home Screen

- No white area
- No vertical movement
- No double-tap movement

## Orientation

- Portrait-style behavior maintained

## Vehicle

- Acquisition save
- Seller full width

## Fuel

- Entry save
- Long Press edit
- Station Other workflow

## Maintenance

- Save
- Display
- Long Press edit
- Multi-column layout

## Insurance

- Save
- Display
- Long Press edit
- Layout corrections

---

# Acceptance Gate

v2.1.3b may be accepted only if:

- D-036 passes
- D-037 passes
- D-039 passes
- D-040 passes
- D-041 passes
- D-042 passes
- D-043 passes
- D-045 passes

and

- No excluded items implemented
- No new defects introduced
- Regression tests pass

---

# Code Freeze Rule

After implementation of approved defects:

Permitted:

- Acceptance corrections
- Regression corrections
- Packaging corrections

Not Permitted:

- New features
- Deferred items
- Future decisions
- Unrelated visual enhancements
- Unrelated refactoring

---

# Review Conclusion

v2.1.3b consists of four shared-system corrections:

1. Layout System
2. Record Interaction System
3. Other Workflow System
4. Edit Workflow System

Implementation should occur at the system level rather than the page level.

---

Status:

READY FOR REVIEW
