# DEPLOYMENT — v2.1.6l-wc10-f28-rc1

Build: `v2.1.6l-wc10-f28-rc1`  
Status: `Release Candidate 1 / pending user validation`  
Cache: `216lwc10f28rc1`  
Source baseline: accepted `v2.1.6l-wc10-f27`  
Source SHA-256: `97ce4d8ac0afb209879e2c9f68a2b976859c98af0a9e8311a13ed617f244a088`

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

https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f28rc1

Confirm displayed identity is `v2.1.6l-wc10-f28-rc1` and cache identity is `216lwc10f28rc1`.

## Cache-busting requirement

Every deployable release must include a cache-busting URL. For this version use:

https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f28rc1

## Installed app recovery

If Safari shows the correct version but the Home Screen app shows an old version, use Settings > App Cache Reset after creating a JSON backup.
