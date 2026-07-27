# RGB Mileage Tracker — WC-10 flat06 reconciled recovery

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat06`  
**Packaging governance:** `v1.5`  
**Status:** CONTROLLED RECONCILED RESTORE

## Review links

- Normal application URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
- Reconciliation cache-buster URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat6

## Purpose

flat06 restores the third vehicle without discarding the larger standalone record set.

The verified standalone snapshot contains:

- 2 configured vehicles
- 46 fuel records
- 13 maintenance records
- 7 insurance records
- 1 acquisition record

The Safari three-vehicle backup contains the configured 2018 Jeep Wrangler Unlimited but fewer operational records.

The reconciled candidate contains:

- 3 configured vehicles
- 48 fuel records
- 13 maintenance records
- 8 insurance records
- 1 corrected acquisition record

## Controlled candidate

`RGBM_Reconciled_Recovery_Candidate_3Vehicles_48Fuel_13Maintenance_8Insurance_2026-07-27.json`

SHA-256: `c259641e38f07f9c87161a1615329269981c478e30765006ea697d3d04f0814e`

The candidate is not embedded in the deployment archive. Select it from Files on the recovery screen.

## Transaction safety

- validates the pending and legacy fingerprints against the uploaded snapshot
- preserves the first two vehicle IDs and order
- blocks any record-count reduction
- requires a fresh external snapshot
- removes pending and legacy local copies before writing the larger active state
- restores the exact original keys when writing or read-back validation fails
- records reconciliation provenance inside the active state

## Acceptance boundary

- automated tests: PASS
- actual-data transaction simulation: PASS
- actual Home Screen restore: N/A
- production promotion: FAIL
