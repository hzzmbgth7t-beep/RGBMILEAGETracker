# RGB Mileage v2.1.3e Defect Closure Log

Version: v2.1.3e
Build date: 2026-06-08
Base: v2.1.3d

## D-046 — Home Screen Movement Regression

Status: Patched; requires iPhone/Home Screen verification.

Changes:

- Added Home-screen-specific movement lock.
- Added runtime touchmove prevention only while route is `home`.
- Preserved vertical scrolling on non-Home/content screens.

Expected result:

- Main/Home screen has no vertical movement and no bounce.
- Content screens remain scrollable.

## D-047 — Record Interaction System

Status: Patched; requires iPhone verification.

Changes:

- Replaced mixed touch/mouse row handling with pointer-based row handling.
- Tap now routes through `navRecord(..., "view")`.
- Long press now routes through `navRecord(..., "edit")`.
- Record long press duration set to 750ms.
- Long press to Edit triggers top/edit-form focus behavior.

Expected result:

- Tap opens View.
- Long press opens Edit.
- Tap does not open Edit.
- Long press does not open View.

## D-048 — Previous Records on Edit Screens

Status: Patched; requires verification.

Changes:

- Restored Cancel button beneath Save on:
  - Fuel Edit.
  - Maintenance Edit.
  - Insurance Edit.

No change made to Previous Records headers because they were confirmed correct in-app.

## D-049 — Orientation Lock

Status: Attempted; requires iPhone/Home Screen verification.

Changes:

- Manifest orientation remains portrait.
- Runtime portrait lock request added where browser support allows.

Note:

- iOS Safari/Home Screen orientation support may not fully honor runtime orientation lock. Test result should determine whether this remains open.

## D-050 — Navigation Interaction System

Status: Patched; requires workflow verification.

Changes:

- Added `navRecord()` so switching between record View/Edit screens does not keep stacking records onto the Back history.
- Back now returns to the prior app screen/menu instead of stepping through every record opened during the session.
- Previous Record button remains deferred.

## D-051 — Deployment Data Persistence Verification

Status: Added as verification item.

Reason:

- v2.1.3d testing required backup restoration after cache/Safari behavior.

Patch decision:

- Active localStorage key was intentionally retained as `RGBM_DATA_v213d` to avoid data loss caused by changing the storage key during a patch release.

