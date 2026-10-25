# RGBMileage v2.1.6l-wc10-f29-rc17

## URLs

Production URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-busting URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f29rc17

Supabase project URL: https://nlfivcxlzmivjzwlhlot.supabase.co

Build: `v2.1.6l-wc10-f29-rc17`  
Status: `Release candidate — pending user validation`  
Cache: `216lwc10f29rc17`  
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
- RC4: User Guide built into the app (Settings → User Guide and the Sign In screen), including Home Screen install steps for iPhone/iPad and Android.
- RC4: first sign-in shows a welcome popup offering Face ID setup and the User Guide.
- RC4: multiple users with separate data (invite only); a device holding another account's data asks before switching; Change Password on the Cloud Sync screen.
- RC5: administrator can add users and reset their passwords from the app (Settings → Manage Users), through the admin-users Supabase Edge Function.
- RC6: Maintenance Location, Provider, and Performed By are drop-down lists with Other → Use Once / Save To List, like Fuel Grade and Station.
- RC7: Settings → Edit Lists to rename (optionally correcting records), reorder, add, delete, and sort all six drop-down lists. List and vehicle-order changes now sync between devices on their own.
- RC8: Scan Receipt on new Fuel and Maintenance entries — read on the phone (tesseract.js 5.1.1 from jsDelivr), reviewed before use; the picture is never saved or uploaded.
- RC9: Scan Receipt offers Take Photo (camera) or Choose Photo (camera roll / photo library).
- RC10: one green Read Receipt button beside the Fuel/Maintenance Information title — tap for the camera, press and hold for the camera roll. Receipt review shows two fields per row.
- RC11: Scan Document on the Insurance screen saves the picture (JPEG) to the user's own Google Drive and keeps only a link on the record. Settings → Insurance Documents sets the folder once (one folder with a subfolder per vehicle, or a folder per vehicle); folders are per user.
- RC12: Scan Document shows a crop screen (drag corners/edges, move, Rotate, Auto Frame, Whole Picture) before the picture is saved to Drive.
- RC13: Read Receipt also opens a crop screen before reading; press-and-hold fixed on phones (touch handling).
- RC14: press and hold now opens a small sheet (Choose From Photos / Take Photo) — iPhone will not open the photo picker straight from a long press.
- RC15: Home circles — tap opens the vehicle page, press and hold opens a new Fuel entry. Vehicle page buttons at the top, two per row, smaller photo. Receipt review uses the drop-down lists (with Other → Use Once / Save To List).
- RC16: VIN on the vehicle page and edit form. Scanned Fuel and Maintenance receipts can be saved to Google Drive (link kept on the record), like Insurance documents. Settings card renamed Google Drive Documents.
- RC17: the field being typed in is moved near the top of the visible screen, above the keyboard, on every screen.
- Clear Local Data unlinks the device from cloud sync; it never deletes cloud data.
- Home geometry, circles, descriptions, and mileage labels are unchanged.

## Deploy

Deploy all 17 ZIP-root files to GitHub Pages. Do not deploy only a partial file set.

Validation URL:

https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f29rc17
