# RGB Mileage Data Model v3.0.0

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat01`  
**Date:** 2026-07-25  
**Classification:** CURRENT  
**Status:** CURRENT DATA MODEL  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat1

## Canonical identity

- `vehicleId` is permanent identity.
- `vehicleOrder` is presentation order.
- Array position and legacy `slot` are not identity.
- Canonical data contains exactly three explicit vehicle records.

## Blank state

An unconfigured record has:

```text
setupComplete = false
```

It has a stable ID, empty identity/image fields, and no acquisition, fuel, maintenance, or insurance records.

## Operational ownership

Every operational record references a canonical `vehicleId`. Reordering changes only `vehicleOrder`.
