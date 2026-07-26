# RGB Mileage Tracker flat04 Recovery Guide

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat04`  
**Status:** RECOVERY TEST REQUIRED  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat4

## First action

Launch the Home Screen app after deploying flat04.

## On the recovery screen

1. Read the Active and Pending summaries.
2. Tap `Download Recovery Snapshot`.
3. Confirm the snapshot exists in Files or Downloads.
4. Check `I saved the recovery snapshot file`.

## Choose the correct path

### Pending summary shows the expected complete data

Use `Recover Valid Pending Migration`.

### Pending summary is missing the third vehicle or is invalid

Choose the latest full backup:

`RGBM_Backup_v2.1.6l-wc10_2026-07-26 3.json`

Validate that the screen reports:

- 3 configured vehicles
- 41 fuel records
- 3 maintenance records
- 5 insurance records

Then tap `Restore Validated Backup`.

## After reload

Verify:

- all three vehicle names and photos
- the two original vehicles retain their records
- the Wrangler remains the third vehicle
- Home, Settings, Data, and Reports open
- no recovery screen returns after fully closing and reopening the app

Then export a new full backup and migration-evidence JSON.
