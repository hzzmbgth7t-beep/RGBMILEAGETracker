# RGB Mileage Tracker — FIXNOTES v2.1.3g

Build date: 2026-06-08

## D-047 — Record View Launch Failure

### User-observed behavior in v2.1.3f
- Tap highlighted/outlined a previous record.
- Tap did not open View.
- Long press opened Edit correctly.

### Root cause direction
Pointer/touch selection was firing, but the view launch depended on the same pointer-up timing path as long press. On iPhone, the row could receive focus/highlight without reliably completing the view navigation.

### Correction
Added an explicit record-row tap handler that launches `navRecord(type, id, "view")` when the long-press suppression flag is not active. Long press remains 750ms and still opens Edit.

## D-053 — Fuel Edit Field Parity Failure

### User-observed behavior
Fuel Quick Entry included fields that Fuel Edit did not expose.

### Fields restored
- Ethanol Free
- Cost Source
- Price/Gal
- Total Cost

### Correction
Fuel Edit now saves these fields back to the same record properties used by Quick Fuel Entry.

## D-049 — Orientation Lock
Status: Deferred.

Reason: User confirmed rotation lock is not important enough to continue consuming stabilization releases.

## D-054 — Landscape Layout Failure
Status: Deferred to v2.2.0 or future UI modernization.
