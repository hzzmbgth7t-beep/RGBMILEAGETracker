# DEPLOYMENT — v2.1.6l-wc10-f27-rc1

Build: `v2.1.6l-wc10-f27-rc1`  
Status: `Release Candidate 1 / pending user validation`  
Cache: `216lwc10f27rc1`  
Source baseline: accepted `v2.1.6l-wc10-f26`  
Source SHA-256: `6011c1d5742b1dfb295f04849cb6fd0419bad0c629d2aac30a4d62e48603503b`

## Locked package and README rules

- Every package is a full package unless the assistant asks before creating it and the user explicitly approves a partial/special-purpose package.
- Standard package filename format is `RGBMileage_<version>.zip`.
- Do not include `FULL` or a date in standard package filenames.
- Version numbers are never reused.
- README URLs must be updated for every version.
- README URLs must be the first README section after the title.

## Deploy

Deploy only the 17 ZIP-root files to GitHub Pages. Do not deploy the eight support folders.

Open the cache-busting URL after deployment:

https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f27rc1

Confirm displayed identity is `v2.1.6l-wc10-f27-rc1` and cache identity is `216lwc10f27rc1`.

## Cache-busting requirement

Every deployable release must include a cache-busting URL. For this version use:

https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f27rc1

## Installed Home Screen recovery

If Safari shows `v2.1.6l-wc10-f27-rc1` but the Home Screen app shows an older version:

1. Open the Home Screen app.
2. Create a JSON backup if the old app supports backup.
3. Deploy/open this version using the cache-busting URL.
4. In Settings, use **App Cache Reset**.
5. Confirm the app reloads as `v2.1.6l-wc10-f27-rc1`.
6. Confirm vehicle data remains present.
