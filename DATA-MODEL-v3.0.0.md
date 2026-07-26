# RGB Mileage Data Model v3.0.0

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat02`  
**Date:** 2026-07-25  
**Classification:** CURRENT  
**Status:** CURRENT DATA MODEL  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat2

- `vehicleId` is permanent identity.
- `vehicleOrder` is presentation order.
- Canonical data contains exactly three explicit vehicle records.
- An unconfigured vehicle uses `setupComplete:false`.
- Operational records remain attached by `vehicleId`.
- Reordering does not modify operational ownership.
- Home position 1 maps to the large portrait position and left landscape position.
