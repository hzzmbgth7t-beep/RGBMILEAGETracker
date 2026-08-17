# DEPLOYMENT — v2.1.6l-wc10-f26-rc3

Build: `v2.1.6l-wc10-f26-rc3`  
Status: `Release Candidate 3 / pending user validation`  
Cache: `216lwc10f26rc3`  
Source baseline: accepted `v2.1.6l-wc10-f25`  
Source SHA-256: `6aad843c7db5135c98bf476ecf73e897a336a0d6b9345cf800a887c8d975e212`


## Locked package and README rules

- Every package is a full package unless the assistant asks before creating it and the user explicitly approves a partial/special-purpose package.
- Standard package filename format is `RGBMileage_<version>.zip`.
- Do not include `FULL` or a date in standard package filenames.
- README URLs must be updated for every version.
- README URLs must be the first README section after the title.

## Deploy

Deploy only the 17 ZIP-root files to GitHub Pages. Do not deploy the eight support folders.

Open the cache-busting URL after deployment:

https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f26rc3

Confirm displayed identity is `v2.1.6l-wc10-f26-rc3` and cache identity is `216lwc10f26rc3`.

## Cache-busting requirement

Every deployable candidate or release must include a cache-busting URL. For this candidate use:

https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f26rc3

If an older installed app continues to load stale files, remove the Home Screen icon, clear the site data for the GitHub Pages site in Safari, reopen the cache-busting URL, then add the app to Home Screen again.

## F26 RC3 validation

- Confirm Vehicle Detail shows Last Refuel Mileage, Last Maintenance Mileage, and Current Mileage grouped with Starting Odometer.
- Confirm Last Refuel Mileage uses the most recent active Fuel/Refuel entry with odometer by date/time.
- Confirm Last Maintenance Mileage uses the most recent active Maintenance entry with odometer by date/time.
- Confirm Current Mileage uses the most recent valid odometer reading across Starting Odometer, Fuel, and Maintenance.
- Confirm a newer lower odometer reading triggers a Mileage Error warning.
- Confirm warnings appear on Vehicle Detail and the affected Fuel/Maintenance record pages.
- Confirm Fuel, Maintenance, and Insurance delete behavior from accepted F25 still works.
- Confirm Home portrait and landscape still display correctly.
