# RGBMileage v2.1.6l-wc10-f29-rc3

## URLs

Production URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-busting URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f29rc3

Supabase project URL: https://nlfivcxlzmivjzwlhlot.supabase.co

Build: `v2.1.6l-wc10-f29-rc3`  
Status: `Release candidate — pending user validation`  
Cache: `216lwc10f29rc3`  
Source baseline: accepted `v2.1.6l-wc10-f28`  
Source SHA-256: `801f8b0f1993a0d09c9d18f0860c84414af7b857217978f40cfc3669f2600104`  
Previous accepted production baseline: `v2.1.6l-wc10-f28`

## Locked release package rules

- Every package is a full package unless the assistant asks before creating it and the user explicitly approves a partial/special-purpose package.
- Standard package filename format is `RGBMileage_<version>.zip`.
- Do not include `FULL` or a date in standard package filenames.
- Version numbers are never reused.
- The README URLs section must be the first section after the title.
- All README URLs must be updated for every version and must remain before all non-URL README content.

## Purpose

F29 connects RGB Mileage to its Supabase database. RC2 adds vehicle photo sync and Face ID. The device keeps working offline from local storage; when signed in, changes sync to Supabase and changes made on another device sync back.

## F29 changes

- New Settings > Cloud Sync card and Cloud Sync screen (sign in, set/reset password by email, Sync Now, Sign Out).
- Every save is pushed to Supabase about one second later when signed in and online.
- On launch, return to the app, reconnect, and Sync Now: local changes are pushed first, then cloud changes are pulled.
- First sign-in on a device compares device and cloud data. If they match, sync starts. If they differ, the user chooses which data to keep; nothing is overwritten without a choice.
- Safety pause: a save that would remove more than 10 cloud items (or every vehicle) is held until the user chooses.
- Invite and password-reset email links open a Set Password screen in the app.
- RC2: vehicle photos sync through a private Supabase Storage bucket, so every signed-in device shows them.
- RC2: Face ID (passkey) can lock the app on open and after time in the background, with the cloud password as a fallback.
- RC2: Face ID sign-in for Cloud Sync (Supabase passkeys, beta).
- RC3: when not signed in, the app opens on the Cloud Sync sign-in screen; "Not Now — Use This Device Only" skips it until you sign in.
- RC3: fixed the "Choose Which Data to Keep" card not appearing when signing in from the Cloud Sync screen.
- Clear Local Data unlinks the device from cloud sync; it never deletes cloud data.
- Home geometry, circles, descriptions, and mileage labels are unchanged.

## Deploy

Deploy all 17 ZIP-root files to GitHub Pages. Do not deploy only a partial file set.

Validation URL:

https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f29rc3
