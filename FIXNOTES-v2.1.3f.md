# RGB Mileage Tracker — FIXNOTES v2.1.3f

Build Date: 2026-06-08
Baseline: v2.1.3e

## v2.1.3e Final Status
PASS WITH NEW DEFECTS LOGGED

Carried forward into v2.1.3f:
- D-047 — Tap-to-View Failure
- D-049 — Orientation Lock Failure
- D-052 — Version/Build Visibility Regression

## D-047 Root Cause and Fix

### Root Cause
The previous-record row system used overlapping interaction paths:
- onclick for tap-to-view.
- pointerdown timer for long-press-to-edit.
- shared suppressTap state to prevent tap firing after long press.

On iPhone testing, long press worked, but short tap did not reliably route to View. The mixed event system allowed the click path to be lost or suppressed on touch devices.

### Fix
Record rows now use a single pointer-controlled system:
- pointerdown starts a 750ms timer.
- pointerup before 750ms opens View.
- timer completion opens Edit.
- pointercancel clears the timer.

### Expected Behavior
Fuel, Maintenance, and Insurance:
- Tap opens View.
- Long Press 750ms opens Edit.
- Tap does not open Edit.
- Long Press does not open View.

## D-049 Root Cause and Disposition

### Root-Cause Finding
The app already includes the standard reasonable PWA orientation controls:
- manifest orientation: portrait.
- screen.orientation.lock("portrait") attempt.
- viewport restrictions.
- Home Screen capable metadata.

If the app continues to rotate in Safari and from the Home Screen on iPhone, the most likely cause is platform behavior outside app control. iOS does not consistently honor web app orientation lock in all Safari/PWA contexts.

### Decision
Per approved Option B:
- If testing confirms continued rotation, document the limitation and defer D-049.
- Do not continue spending stabilization releases on an OS-level limitation.

## D-052 Root Cause and Fix

### Root Cause
The version/build display was placed in the lower Home Screen region. After the Home Screen movement-lock corrections, that lower region could be hidden or visually obscured by the fixed bottom navigation.

### Fix
The version/build information was moved under the Home Screen title:

RGB Mileage Tracker
v2.1.3f • Build 2026-06-08

## Regression Protection
- Data key preserved: RGBM_DATA_v213d.
- Existing storage location intentionally unchanged to reduce upgrade data-loss risk.
- v2.1.3e Home Screen movement, Back button, Cancel button, and data persistence fixes preserved.
