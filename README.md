# RGB Mileage Tracker — WC-10 flat04 recovery

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat04`  
**Packaging governance:** `v1.5`  
**Status:** CONTROLLED STANDALONE RECOVERY ONLY

## Review links

- Normal application URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
- Recovery cache-buster URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat4

## Purpose

flat04 addresses the standalone `RECOVERY_REQUIRED` screen without clearing, deleting, or automatically overwriting storage.

The recovery screen:

- inspects active, pending, and retained legacy storage
- does not mutate storage during inspection
- downloads an exact recovery snapshot before recovery
- validates pending migration data
- validates a selected full JSON backup
- avoids active/pending duplicate storage during promotion
- restores exact active and pending values when a transaction fails
- never deletes retained legacy keys

## Known external backup target

The latest known three-vehicle backup is:

`RGBM_Backup_v2.1.6l-wc10_2026-07-26 3.json`

Expected summary:

- configured vehicles: 3
- vehicle positions: 3
- fuel records: 41
- maintenance records: 3
- insurance records: 5

The earlier file ending in `2.json` is the pre-third-vehicle backup.

## Clean install

Upload exactly the 17 files at this archive's root to the blank GitHub application folder. Retain the support folders locally.

## Acceptance boundary

- automated tests: PASS
- storage rollback tests: PASS
- quota-safe pending promotion: PASS
- real Home Screen recovery: N/A
- production promotion: FAIL
