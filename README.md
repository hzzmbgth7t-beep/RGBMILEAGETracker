# RGBMileage v2.1.6l-wc10-f26

## URLs

Production URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-busting URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f26

Build: `v2.1.6l-wc10-f26`  
Status: `Accepted baseline`  
Cache: `216lwc10f26`  
Source baseline: accepted `v2.1.6l-wc10-f25`  
Source SHA-256: `6aad843c7db5135c98bf476ecf73e897a336a0d6b9345cf800a887c8d975e212`  
Accepted production baseline before F26: `v2.1.6l-wc10-f25`

## Locked release package rules

- Every package is a full package unless the assistant asks before creating it and the user explicitly approves a partial/special-purpose package.
- Standard package filename format is `RGBMileage_<version>.zip`.
- Do not include `FULL` or a date in standard package filenames.
- The README URLs section must be the first section after the title.
- All README URLs must be updated for every version and must remain before all non-URL README content.


## Purpose

F26 adds computed odometer summary fields to Vehicle Detail pages and mileage consistency warnings for Fuel and Maintenance records.

## Release status

This package is accepted baseline. It is not an accepted production baseline until the user reports PASS and explicitly promotes it.

## Changed scope

- Adds Last Refuel Mileage to Vehicle Detail, grouped with Starting Odometer.
- Adds Last Maintenance Mileage to Vehicle Detail, grouped with Starting Odometer.
- Adds Current Mileage to Vehicle Detail, grouped with Starting Odometer.
- Computes Last Refuel and Last Maintenance using dated-first logic: most recent dated entry with valid odometer, falling back to highest undated mileage only when that record type has no dated entries with odometer.
- Computes Current Mileage from the most recent valid odometer reading across Starting Odometer, Fuel, and Maintenance.
- Adds non-blocking Mileage Error warnings when a newer dated reading is lower than an older dated reading.
- Shows Mileage Error warnings on Vehicle Detail and affected Fuel/Maintenance record pages.

## Unchanged scope

- No Home geometry changes.
- No CSS layout overhaul.
- No data schema/storage migration.
- No bundled user backup data.
- Insurance delete/action parity from accepted F25 is preserved.

## Deployment

Deploy the 17 ZIP-root files to GitHub Pages. The eight support folders are retained for governed archive/audit use and are not required for GitHub Pages deployment.

Use the cache-busting URL after deployment:

https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f26

## F26 correction

- No-date Fuel and Maintenance entries are ignored when dated mileage readings exist.
- If no dated mileage readings exist for a field, the highest undated mileage is used as a fallback.
- No-date entries do not generate mileage-order errors.
- Affected Fuel and Maintenance odometer fields and previous-record rows are highlighted yellow when a mileage-order error is flagged.
