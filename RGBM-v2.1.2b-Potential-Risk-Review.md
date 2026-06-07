# RGBM-v2.1.2b-Potential-Risk-Review.md

App Site Address:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Version: v2.1.2b
Status: Locked Draft

## Purpose

Identify risks likely to cause another failed stabilization build if not addressed before packaging.

---

# Risk 1 — Safe Area / Viewport Miscalculation

## Concern
Previous builds fixed top spacing but left bottom spacing incorrect.

## Mitigation
Use one authoritative app-shell layout calculation.
Avoid multiple competing height formulas.
Test Home Screen before packaging.

---

# Risk 2 — Background Double-Tap / iOS Scroll Behavior

## Concern
Double tap on non-interactive area causes unintended viewport movement.

## Mitigation
Suppress touch-action behavior on non-editable app shell.
Keep input/select/textarea editable.
Test on iPhone Home Screen PWA.

---

# Risk 3 — Separate Render Paths

## Concern
Home Screen after vehicle save may use a path that omits bottom navigation.

## Mitigation
All Home Screen returns must call the same render function.
No partial Home Screen rendering.

---

# Risk 4 — Data Model Inconsistency

## Concern
Insurance and maintenance records may exist in different arrays or legacy names.

## Mitigation
Normalize records from:
- insurance
- insuranceRecords
- maintenance
- maintenanceRecords
- entries where recordType/entryType indicates Maintenance or Insurance

---

# Risk 5 — Save Does Not Match Reload

## Concern
Vehicle acquisition and insurance save functions may write fields that the view function does not read.

## Mitigation
Verify every saved field is read back by the same field name or normalized alias.

---

# Risk 6 — Import Duplicate Detection Not Connected to Display

## Concern
App detects duplicate maintenance records but does not display them.

## Mitigation
Duplicate detection must use same normalized record arrays that display functions use.

---

# Risk 7 — Gesture Conflict

## Concern
Tap and long press are easy to conflict on mobile.

## Mitigation
Use shared pointer/long-press helper.
After long press fires, suppress next tap.

---

# Risk 8 — Scope Creep

## Concern
v2.1.2b could accidentally absorb deferred visual improvements or backup redesign.

## Mitigation
Only SB-001 through SB-016 are allowed.
Chrome border/label styling remains deferred unless explicitly promoted.
Backup split remains deferred.

---

# Risk 9 — Version / Cache Drift

## Concern
User may see older version due to cache or stale service worker.

## Mitigation
Update:
- app.js version constant
- index.html query strings
- sw.js cache name
- manifest where applicable
- README/CHANGELOG/FIXNOTES/DEPLOYMENT
