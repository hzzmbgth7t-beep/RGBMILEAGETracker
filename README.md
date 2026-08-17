# RGBMileage v2.1.6l-wc10-f26-rc1

Build: `v2.1.6l-wc10-f26-rc1`  
Status: `Release Candidate 1 / pending user validation`  
Cache: `216lwc10f26rc1`  
Source baseline: accepted `v2.1.6l-wc10-f25`  
Source SHA-256: `6aad843c7db5135c98bf476ecf73e897a336a0d6b9345cf800a887c8d975e212`  
Accepted production baseline before this candidate: `v2.1.6l-wc10-f25`

## Purpose

F26 RC1 adds computed odometer summary fields to Vehicle Detail pages and mileage consistency warnings for Fuel and Maintenance records.

## URLs

Production URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-busting URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f26rc1

## Release status

This package is pending user validation. It is not an accepted production baseline until the user reports PASS and explicitly promotes it.

## Changed scope

- Adds Last Refuel Mileage to Vehicle Detail, grouped with Starting Odometer.
- Adds Last Maintenance Mileage to Vehicle Detail, grouped with Starting Odometer.
- Adds Current Mileage to Vehicle Detail, grouped with Starting Odometer.
- Computes Last Refuel and Last Maintenance from the most recent active entry by date/time that has valid odometer data.
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

https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f26rc1
