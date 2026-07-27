# RGB Mileage Tracker — WC-10 flat05 recovery UI

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat05`  
**Packaging governance:** `v1.5`  
**Status:** CONTROLLED SNAPSHOT COLLECTION ONLY

## Review links

- Normal application URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
- Recovery cache-buster URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat5

## Purpose

flat05 corrects the clipped flat04 recovery page.

- `Download Recovery Snapshot` appears before storage inspection.
- The recovery page uses native document scrolling.
- Pending recovery is locked when fewer than three vehicles are configured.
- Backup restore is locked when a backup would reduce standalone record counts.
- Inspection and backup comparison do not mutate storage.

## Current preservation conflict

The Home Screen storage inspection showed:

- 2 configured vehicles
- 46 fuel records
- 13 maintenance records
- 7 insurance records

The latest Safari three-vehicle evidence contains:

- 3 configured vehicles
- 41 fuel records
- 3 maintenance records
- 5 insurance records

A direct pending promotion would omit vehicle 3. A direct backup restore would reduce record counts. flat05 therefore collects the exact standalone snapshot before reconciliation.

## Required next action

Deploy flat05, launch the existing Home Screen app, tap `Download Recovery Snapshot`, and preserve that file.

Do not recover pending data and do not restore a backup yet.

## Acceptance boundary

- automated tests: PASS
- synthetic recovery UI audit: PASS
- actual iPhone standalone scrolling: N/A
- data reconciliation: NOT STARTED
- production promotion: FAIL
