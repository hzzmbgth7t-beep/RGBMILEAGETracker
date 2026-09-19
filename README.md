# RGBMileage v2.1.6l-wc10-f28-rc1

## URLs

Production URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-busting URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f28rc1

Build: `v2.1.6l-wc10-f28-rc1`  
Status: `Release Candidate 1 / pending user validation`  
Cache: `216lwc10f28rc1`  
Source baseline: accepted `v2.1.6l-wc10-f27`  
Source SHA-256: `97ce4d8ac0afb209879e2c9f68a2b976859c98af0a9e8311a13ed617f244a088`  
Previous accepted production baseline: `v2.1.6l-wc10-f27`

## Locked release package rules

- Every package is a full package unless the assistant asks before creating it and the user explicitly approves a partial/special-purpose package.
- Standard package filename format is `RGBMileage_<version>.zip`.
- Do not include `FULL` or a date in standard package filenames.
- Version numbers are never reused.
- The README URLs section must be the first section after the title.
- All README URLs must be updated for every version and must remain before all non-URL README content.

## Purpose

RGB Mileage is a standalone GitHub Pages app for vehicle mileage, refuel, maintenance, insurance, backup, restore, and recovery workflows.

## F28 RC1 changes

- MPG display now uses three digits right of the decimal point.
- Price/Gal display now uses three digits right of the decimal point.
- The change is display-oriented; stored record values are not migrated or rewritten.
- Existing F27 App Cache Reset behavior is preserved.
- Existing F26 odometer summary and mileage-warning behavior is preserved.
- Accepted Home geometry is preserved.

## Deploy

Deploy all 17 ZIP-root files to GitHub Pages. Do not deploy only a partial file set.

Validation URL:

https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f28rc1
