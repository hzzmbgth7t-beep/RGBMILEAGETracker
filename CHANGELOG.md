# CHANGELOG

## v2.1.6l-wc10-f30-rc1 — 2026-11-08

- Built from `v2.1.6l-wc10-f29` (release candidate; accepted baseline remains `v2.1.6l-wc10-f29`).
- Read Receipt grade: a product code printed on a line of its own (Circle K's second receipt layout: "B89 [70/30]" above "PUMP No.") now gives 89. "UNL-NO-ETH" (QuikTrip) now gives grade 87 and ticks Ethanol Free — "UNL" is the unleaded/regular grade.
- Read Receipt station: names must match as whole words, so the card line "ARC: 00" is no longer read as Arco; city/ZIP, terminal and card-data lines are never used as a station. When the station name can't be read, Station is left for you to pick instead of filling in a wrong guess.

## v2.1.6l-wc10-f29 — 2026-11-08 (release)

- Full release of `v2.1.6l-wc10-f29-rc26`, validated by the owner on iPhone on 2026-11-08. Becomes the accepted baseline (replaces `v2.1.6l-wc10-f28`).
- No code changes from rc26; only the version name, cache revision and status change.
- Includes everything from rc1–rc26: cloud sync and multi-user accounts, Face ID, receipt reading with crop, stored receipt and document pictures, VIN and vehicle Notes with named links, collapsible Settings and Data pages, and the iPhone keyboard fixes.

## v2.1.6l-wc10-f29-rc26 — 2026-11-08

- Built from `v2.1.6l-wc10-f29-rc25` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- iPhone keyboard: fields near the bottom of a form (e.g. Purchase Price, Seller, Notes on Edit Vehicle) were left half behind the keyboard because iOS scrolled the whole page after the app placed the field. The app now measures from its own position on screen, puts the page back if iOS scrolled it, and moves only the form, also while iOS is still adjusting the view. Scrolling the form yourself stops the automatic positioning.
- Notes: **Add Link** button under every Notes box, and pasting a web address into Notes opens the same pop-up. Enter the address and a short name to show (e.g. "Parts order"); the note then shows only the name, and tapping it opens the page. **Keep Full Address** inserts the address as before.
- In the Notes box itself the link is stored as [Name](address) so it can be edited or removed like any other text.

## v2.1.6l-wc10-f29-rc25 — 2026-11-07

- Built from `v2.1.6l-wc10-f29-rc24` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- iPhone keyboard: when a field is tapped (e.g. Custom Label on Edit Vehicle), the screen now moves with the visible area, so the form stays above the keyboard. Before, iOS slid the view down and the menu bar ended up mid-screen with a blank area under it.
- The bottom menu bar hides while the keyboard is open and comes back when you're done typing.
- Home screen unchanged.

## v2.1.6l-wc10-f29-rc24 — 2026-11-06

- Built from `v2.1.6l-wc10-f29-rc23` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Pictures can only be deleted while editing an entry: the **Delete** button beside a picture and **Delete Picture** in the viewer appear on the edit screen only. Viewing an entry still lets you open, share and save pictures.

## v2.1.6l-wc10-f29-rc23 — 2026-11-05

- Built from `v2.1.6l-wc10-f29-rc22` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Read Receipt: when the camera blurs a digit in the gallons or price (e.g. 11.809 for 11.609, 4.889 for 4.809), the reader now tries one-digit fixes that make gallons × price equal the total and fills them in marked "check this".
- Read Receipt: "UNL-NO-ETH", "NON-ETH", "ETH FREE", "E0" now tick Ethanol Free. The grade is only filled in when an octane number (or REC 90) is printed.
- Documents: every saved picture has a **Delete** button beside it, on both the view and edit screens; the picture viewer always shows **Delete Picture**. The picture is removed from the phone and the cloud; the rest of the entry is unchanged.

## v2.1.6l-wc10-f29-rc22 — 2026-11-02

- Built from `v2.1.6l-wc10-f29-rc21` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Settings: sections start collapsed — tap a heading to open it. The version box at the top stays open. New order: User Guide, Drop-Down Lists, Vehicle Order, Face ID, Users (admin), About.
- Data page: sections start collapsed. Order: App Cache Reset, Backup & Restore, CSV Import, Cloud Sync, Offline Mode, WC-10 Migration Evidence. Cloud Sync, Offline Mode, App Cache Reset and WC-10 Migration Evidence moved here from Settings.
- Vehicle Order positions are now inside the Vehicle Order section.
- An open section stays open while you work in it and starts closed again the next time you open the page.

## v2.1.6l-wc10-f29-rc21 — 2026-11-01

- Built from `v2.1.6l-wc10-f29-rc20` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Read Receipt: the fuel grade is now read from pump product codes on the pump or gallons line, e.g. Circle K "Pump # 1  B89 [70/30]" → 89 (also U87, P93, a bare 89 next to the pump). Ethanol Free is only set when the receipt says so (E0, Ethanol Free, Non-Ethanol, REC 90).

## v2.1.6l-wc10-f29-rc20 — 2026-11-01

- Built from `v2.1.6l-wc10-f29-rc19` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Notes: web addresses (https://…, www.…) and email addresses show as tappable links when viewing a vehicle or a Fuel, Maintenance or Insurance record. Web links open in the browser; email links open a new email. Line breaks in notes are kept.
- Home screen and screen titles unchanged.

## v2.1.6l-wc10-f29-rc19 — 2026-11-01

- Built from `v2.1.6l-wc10-f29-rc18` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Vehicle page and Edit Vehicle: **VIN** uses a full row.
- New vehicle **Notes**: shown as one row; tap it to open it full size while typing (Edit Vehicle) or reading (vehicle page). Syncs with the vehicle.
- Vehicle page: the **Previous Fuel / Maintenance / Insurance Records** sections start collapsed; tap a heading to open it.

## v2.1.6l-wc10-f29-rc18 — 2026-10-30

- Built from `v2.1.6l-wc10-f29-rc17` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Pictures are now stored with the app's data instead of Google Drive: kept on the phone and copied to the user's private cloud storage (Supabase bucket "documents") when signed in, like vehicle photos. No Google sign-in or folders needed. Pictures taken while offline or signed out upload at the next sync.
- Smaller pictures: receipts are saved black-and-white (contrast evened), insurance documents in colour, both at most 1600 px (receipts typically 50–150 KB).
- Under **Documents**, tap a picture to view it full size, **Share / Save to Phone**, or (when editing) **Delete Picture** (removes it from the phone and the cloud).
- Receipt review: **Save the receipt picture with this entry** (shows the size).
- Settings: the Google Drive card is removed. Links to pictures already saved in Drive still open.
- Supabase: run DOCUMENTATION/SUPABASE/7_Enable_Document_Storage.sql once (creates the private bucket and per-user rules).

## v2.1.6l-wc10-f29-rc17 — 2026-10-25

- Built from `v2.1.6l-wc10-f29-rc16` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Typing: when a text box, number box, date or drop-down is tapped anywhere in the app (entry forms, Edit Vehicle, Settings, sign-in, review and pop-up sheets), the screen scrolls so that field sits near the top of the visible area, above the keyboard. Extra space is added at the bottom while the keyboard is up so the last fields can move up too.

## v2.1.6l-wc10-f29-rc16 — 2026-10-25

- Built from `v2.1.6l-wc10-f29-rc15` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Vehicles: **VIN** field on Edit Vehicle (up to 17 characters, saved in capitals) and shown on the vehicle page.
- Fuel and Maintenance: after a receipt is read, **Save the receipt picture to Google Drive** (on by default once a Drive folder is set; the choice is remembered). On **Use These** the cropped picture is uploaded to the vehicle's Drive folder as "<vehicle> Fuel Receipt …jpg" / "Maintenance Receipt …jpg" and the link appears under **Documents** on the entry (kept on Save; saved at once for an existing record). Unchecked: the picture is not kept.
- Settings card renamed **Google Drive Documents** (same folders for Insurance documents and receipt pictures).
- User Guide updated.

## v2.1.6l-wc10-f29-rc15 — 2026-10-25

- Built from `v2.1.6l-wc10-f29-rc14` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Home: tapping a vehicle circle now opens the vehicle page; press and hold opens a new Fuel entry (swapped). Empty circles still open Add Vehicle.
- Vehicle page: Edit Vehicle, Fuel Entry, Maintenance Entry and Insurance Entry moved to the top, smaller, two per row. Vehicle photo is half the size.
- Receipt review: Station, Fuel Grade, Provider and Category are drop-down lists (same lists as the entry forms). **Other** asks for a name with **Use Once** or **Save To List**. A value read from the receipt that isn't in the list is shown as "(read)". Ethanol Free is Yes/No.
- User Guide updated.

## v2.1.6l-wc10-f29-rc14 — 2026-10-24

- Built from `v2.1.6l-wc10-f29-rc13` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Fixed on iPhone: press and hold on Read Receipt, Add Another Part, Try Again and Scan Document still did nothing. iPhone only opens the photo picker from a normal tap, not after a long press. Holding now opens a small sheet with **Choose From Photos** and **Take Photo**; one tap there opens the picker. A quick tap on the green button still opens the camera directly.
- User Guide updated.

## v2.1.6l-wc10-f29-rc13 — 2026-10-24

- Built from `v2.1.6l-wc10-f29-rc12` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Fuel and Maintenance **Read Receipt** now open a **Crop Receipt** screen first (same tools as Crop Document: drag corners/edges, move, Rotate, Auto Frame, Whole Picture). Only the framed part is read, so other papers or background can be cropped out.
- Fixed: press and hold on Read Receipt, Add Another Part, Try Again and Scan Document did nothing on phones. The buttons now use touch events (the phone's own long-press is blocked) and open the photo picker when the finger is lifted after the button says "Release for Photos".
- User Guide updated.

## v2.1.6l-wc10-f29-rc12 — 2026-10-24

- Built from `v2.1.6l-wc10-f29-rc11` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Scan Document: after taking or choosing the picture, a **Crop Document** screen opens. Drag the corners or edges to frame the document, drag inside to move the frame, **Rotate ↻**, **Auto Frame** (finds the paper), or **Whole Picture**. **Save to Drive** saves only the cropped part. Cancel saves nothing.
- User Guide updated.

## v2.1.6l-wc10-f29-rc11 — 2026-10-24

- Built from `v2.1.6l-wc10-f29-rc10` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Insurance: green **Scan Document** button beside the Insurance Information title (tap = camera, press and hold = photos/files). The picture is saved as a JPEG to the user's Google Drive; the record keeps only the link (Documents list, opens in Drive). Remove Link removes it from the app only.
- Settings → **Insurance Documents**: connect Google Drive (each user's own Google account), choose one folder with a subfolder per vehicle (created automatically) or a separate folder per vehicle. Set once; Change any time. Stored with the signed-in user's data, so each user has their own folders.
- Google access uses the drive.file permission: the app can only see folders the user picks and files it creates.
- User Guide updated.

## v2.1.6l-wc10-f29-rc10 — 2026-10-24

- Built from `v2.1.6l-wc10-f29-rc9` (release candidate; accepted baseline remains `v2.1.6l-wc10-f28`).
- Take Photo / Choose Photo replaced by one green **Read Receipt** button on the same row as the Fuel Information (and Maintenance Information) title. Tap opens the camera; press and hold (0.5 s, label changes to "Release for Photos") opens the camera roll.
- Same tap / hold button for Add Another Part and Try Again.
- Receipt review shows two fields per row.
- User Guide updated.

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
