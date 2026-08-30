# RGBMileage v2.1.6l-wc10-f27-rc1

## URLs

Production URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-busting URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f27rc1

Build: `v2.1.6l-wc10-f27-rc1`  
Status: `Release Candidate 1 / pending user validation`  
Cache: `216lwc10f27rc1`  
Source baseline: accepted `v2.1.6l-wc10-f26`  
Source SHA-256: `6011c1d5742b1dfb295f04849cb6fd0419bad0c629d2aac30a4d62e48603503b`  
Accepted production baseline before F27: `v2.1.6l-wc10-f26`

## Locked release package rules

- Every package is a full package unless the assistant asks before creating it and the user explicitly approves a partial/special-purpose package.
- Standard package filename format is `RGBMileage_<version>.zip`.
- Do not include `FULL` or a date in standard package filenames.
- Version numbers are never reused.
- The README URLs section must be the first section after the title.
- All README URLs must be updated for every version and must remain before all non-URL README content.

## Purpose

F27 RC1 adds a Settings app-cache reset/update-recovery feature for stale iPhone Home Screen installations.

## Release status

This package is a release candidate pending user validation. The accepted baseline remains `v2.1.6l-wc10-f26` until this candidate is validated and promoted.

## User-data safety

Vehicle records are stored in local browser/app storage and are not placed in Cache Storage. The new app-cache reset feature clears cached application files and service worker registrations only. It does not intentionally clear vehicle data.

Before using the reset feature, create a JSON backup from Settings or Data Management.

## Settings app-cache reset

Settings now includes an **App Cache Reset** card with:

- **Create JSON Backup First**
- **Reset App Cache / Reload Current Version**

Use this if Safari opens the current version but the installed Home Screen app opens an older version or wrong Home layout.

The reset action:

1. saves the current data state,
2. deletes `rgbm-app-shell-*` caches,
3. unregisters service workers scoped to this app,
4. reloads the current cache-busting URL.

## Validation focus

- Confirm app shows `v2.1.6l-wc10-f27-rc1`.
- Confirm README URLs are first.
- Confirm Settings includes App Cache Reset.
- Create a JSON backup before resetting.
- Use Reset App Cache / Reload Current Version.
- Confirm the app reloads with `v2.1.6l-wc10-f27-rc1`.
- Confirm vehicle data remains present.
- Confirm Home portrait and landscape still display correctly.
