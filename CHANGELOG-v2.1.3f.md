# RGB Mileage Tracker — CHANGELOG v2.1.3f

Build Date: 2026-06-08
Build Type: Stabilization Build
Baseline: RGBM v2.1.3e

## Final Status Target
v2.1.3f is intended to close the active stabilization series defects that remained after v2.1.3e, except orientation lock if confirmed to be an iOS/PWA limitation.

## Changes

### D-047 — Tap-to-View Restoration
- Replaced the prior click-plus-pointer long-press record-row interaction with a single pointer-based handler.
- Short tap now routes to the existing one-field-per-row View screen.
- Long press remains 750ms and routes to the existing Edit screen.
- Keyboard activation with Enter/Space routes to View.
- Fuel, Maintenance, and Insurance previous-record rows use the same shared row interaction implementation.

### D-049 — Orientation Lock Investigation
- Confirmed existing orientation-lock attempts remain in place:
  - manifest orientation set to portrait.
  - viewport locking settings present.
  - screen.orientation.lock("portrait") attempted where browser support allows it.
- D-049 should be considered fixed only if user testing confirms portrait lock.
- If iPhone Safari/Home Screen still rotates, document as an iOS/PWA limitation and defer under the approved Option B decision.

### D-052 — Version/Build Visibility Regression
- Moved version/build display from the lower Home Screen area to the Home Screen title area.
- Home Screen now displays:
  - RGB Mileage Tracker
  - v2.1.3f • Build 2026-06-08
- This avoids bottom navigation overlap and keeps deployment verification visible.

## Deferred
- Combined View/Edit Record screens.
- Delete danger section.
- Edit-mode background color.
- Unsaved-changes workflow.
- Previous Record button/session-history feature.
- Full Record Management modernization planned for v2.2.0.
