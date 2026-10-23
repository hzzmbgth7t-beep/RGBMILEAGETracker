# CHANGELOG

## v2.1.6l-wc10-f29-rc9 — 2026-10-23

- Built from `v2.1.6l-wc10-f29-rc8` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Scan Receipt now has two buttons: **Take Photo** opens the camera; **Choose Photo** opens the camera roll / photo library. Same choice for Add Another Part and after a failed read.
- User Guide updated.

## v2.1.6l-wc10-f29-rc8 — 2026-10-23

- Built from `v2.1.6l-wc10-f29-rc7` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Added Scan Receipt on new Fuel and Maintenance entries. Reading happens on the phone (tesseract.js 5.1.1, English data, loaded from jsDelivr on first use). Method adapted from the SS Conferences card reader hand-off: paper crop, shadow clean-up, two passes (1000 and 700 px), word confidence ≥ 40, rows grouped with tilt correction.
- Fuel fills Date, Time, Station, Fuel Grade (and Ethanol Free for E0/REC 90), Gallons, Price/Gal, Total Cost; gallons × price/gal is checked against the total. Maintenance fills Date, Provider, Category, Odometer, Cost; subtotal + tax is checked against the total.
- Review sheet marks each value "read" or "check this", hides empty fields behind Show All Fields, shows the text read with Fill In Again, and supports Add Another Part for long receipts. Guessed values stay highlighted on the entry form until edited.
- The picture is never saved or uploaded; card numbers are not kept.
- Synthetic receipt bench: 95% of fields right on the tuning set, 93% on the held-back set (real receipts expected lower).
- User Guide: new "Scanning receipts" section.

## v2.1.6l-wc10-f29-rc7 — 2026-10-18

- Built from `v2.1.6l-wc10-f29-rc6` (rc6 was not deployed; rc7 includes it). Accepted baseline remains `v2.1.6l-wc10-f28`.
- Added Settings → Drop-Down Lists → Edit Lists for Fuel Grade, Station, Maintenance Category, Location, Provider, and Performed By: Edit (spelling, with optional record correction and combine-on-duplicate), Up/Down, Add, Delete, Sort A–Z, and per-entry usage counts.
- Edited lists are stored in their exact order (`state.customizedLists`); defaults are no longer re-added to a list once it has been edited.
- Cloud sync: after pushing, the comparison now includes app settings, so list and vehicle-order changes reach other devices without a record change.
- User Guide: new "Editing drop-down lists" section.

## v2.1.6l-wc10-f29-rc6 — 2026-10-18

- Built from `v2.1.6l-wc10-f29-rc5` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Maintenance Information (new entry and Edit Maintenance Record): Location, Provider, and Performed By are now drop-down lists. Choosing Other opens the same Use Once / Save To List dialog as Fuel Grade and Station.
- New saved lists `maintenanceLocations`, `maintenanceProviders`, `maintenancePerformers` (seeded once from values already in maintenance records); they sync with app settings and are included in JSON backups.
- A record's existing value is always shown, even when it is not in the saved list.
- User Guide: explains the drop-down lists and Save To List.
- No Home geometry, record schema, or calculation changes.

## v2.1.6l-wc10-f29-rc5 — 2026-10-17

- Built from `v2.1.6l-wc10-f29-rc4` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Added Settings → Manage Users (administrator only): list users, add a user with a generated temporary password, reset a user's password, and Share/Copy the sign-in details.
- Supabase side: `6_Enable_User_Admin.sql` (table `app_admins`) and Edge Function `admin-users`. The secret key stays in the function; the app sends only the signed-in user's token.
- User Guide: new "Managing users (administrator)" section; account and forgot-password steps updated.
- No Home geometry, record schema, or calculation changes.

## v2.1.6l-wc10-f29-rc4 — 2026-10-13

- Built from `v2.1.6l-wc10-f29-rc3` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Added in-app User Guide (Settings → User Guide; also on the Sign In screen and in the welcome popup). Includes Home Screen install steps for iPhone/iPad (Safari) and Android (Chrome, Samsung Internet).
- The in-app guide and USER-GUIDE.md are generated from one source for every release; the guide shows the version it matches.
- Added first-sign-in welcome popup (once per account per device): Set Up Face ID, Open User Guide, Later.
- Added multi-user safety: the device remembers which account owns its data (RGBM_CLOUD_OWNER). When a different account signs in, the app asks before replacing the device copy; nothing is uploaded into the wrong account. Face ID lock is cleared on switch.
- Added Change Password on the Cloud Sync screen (for users given a temporary password).
- No Home geometry, record schema, or calculation changes. No database changes.

## v2.1.6l-wc10-f29-rc3 — 2026-10-13

- Built from `v2.1.6l-wc10-f29-rc2` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- App opens on the Cloud Sync sign-in screen when no account is signed in; "Not Now — Use This Device Only" returns to Home and is remembered until sign-in.
- Fixed: the "Choose Which Data to Keep" card did not render when sign-in happened from the Cloud Sync screen.
- Fixed: the "Sync Paused" card now redraws immediately when the Cloud Sync screen is open.
- No Home geometry, record schema, or calculation changes.

## v2.1.6l-wc10-f29-rc2 — 2026-10-13

- Built from `v2.1.6l-wc10-f29-rc1` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Added vehicle photo sync through private Supabase Storage bucket `vehicle-photos` (per-user folders).
- Added Face ID app lock (passkey): on launch and after a chosen time in the background; cloud password fallback.
- Added Face ID sign-in for Cloud Sync using Supabase passkeys (beta).
- Added Settings > Face ID card (set up, require on open, lock-after time, turn off).
- Supabase side: `5_Enable_Photo_Storage.sql` applied; passkeys enabled with RP ID `hzzmbgth7t-beep.github.io`.
- No Home geometry, record schema, or calculation changes.

## v2.1.6l-wc10-f29-rc1 — 2026-10-12

- Built from accepted `v2.1.6l-wc10-f28`.
- Source SHA-256: `801f8b0f1993a0d09c9d18f0860c84414af7b857217978f40cfc3669f2600104`.
- Added Supabase cloud sync (offline-first; local storage remains the working copy).
- Added Settings > Cloud Sync card and Cloud Sync screen.
- Added sign-in, Set/Reset Password by email, invite/reset link handling, Sync Now, and Sign Out.
- Added automatic push after each save and push-then-pull sync on launch, foreground, and reconnect.
- Added first-link comparison with an explicit Use Cloud / Upload This Device choice when data differs.
- Added large-deletion safety pause (more than 10 cloud items or all vehicles).
- Vehicle photos remain device-only.
- Clear Local Data now also unlinks cloud sync on this device (cloud data is never deleted by it).
- Supabase side: `4_Enable_App_Sync.sql` adds list order/updated columns and fill triggers (applied 2026-10-12).
- No Home geometry, record schema, or calculation changes.

## Prior accepted baseline

- Previous accepted production baseline before this release: `v2.1.6l-wc10-f28`.
