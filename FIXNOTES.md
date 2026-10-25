# FIXNOTES — v2.1.6l-wc10-f29-rc16

Build: `v2.1.6l-wc10-f29-rc16`  
Status: `Release candidate — pending user validation`  
Cache: `216lwc10f29rc16`  
Source baseline: accepted `v2.1.6l-wc10-f28`  
Source SHA-256: `801f8b0f1993a0d09c9d18f0860c84414af7b857217978f40cfc3669f2600104`

## Scope

Connect the app to its Supabase database without changing how the app looks or calculates.

## Implementation notes

- Cloud code lives in app.js (section "F29 Cloud Sync"); no new root files, so the package stays at 17 root files.
- No third-party library: the app calls the Supabase Auth and REST endpoints directly with the project's publishable key. Row level security limits every row to the signed-in owner; anonymous access is denied.
- saveData() schedules a push. Pushes send only rows whose fingerprint changed since the last successful sync, then deletes rows removed locally.
- The original record JSON is sent as raw_json; database triggers fill the readable columns.
- Pull rebuilds state from the cloud rows, keeps local vehicle photos, validates with RGBMDataV3.validateStateV3, then saves locally.
- Session is stored in localStorage key RGBM_CLOUD_SESSION; sync bookkeeping uses RGBM_CLOUD_SYNCED, RGBM_CLOUD_LINKED, RGBM_CLOUD_LAST.
- Email-link tokens are read from the address bar on launch and removed immediately.

## Test evidence

TESTS/test_sync.py runs the app in Chromium against TESTS/mock_supabase.py: 33/33 checks passed (first link, push add/edit/delete, pull from another device, photo retention, deletion pause, offline then reconnect, clear-and-restore, conflicting second device, invite and expired links, no page errors).

## RC2 additions

- Photos: uploaded to Storage at `<user id>/<vehicle id>`; `vehicles.primary_photo_md5` holds the photo fingerprint. RGBM_CLOUD_PHOTOS tracks the last synced local/cloud fingerprints so photos upload once and download only when changed.
- Face ID: a Supabase passkey is registered while signed in. The same passkey signs in (server-verified) and unlocks the app (checked on the phone). The lock hides the screen; it does not encrypt data on the phone.
- Test evidence: TESTS/test_rc2.py — 28/28 checks (photo upload/download/change/removal across two devices, no re-sync loops, Face ID setup, lock on launch and after background, password fallback, Face ID sign-in, removal) plus the RC1 suite rerun on RC2: 33/33.

## RC16 additions

- Vehicle vin field (already in the data model) is edited (#vehVin, spaces removed, upper case) and shown (viewField "VIN").
- Receipt crop onSave keeps a JPEG (0.85) of each cropped part in RECEIPT.blobs (memory only). Review sheet: #rcSaveDrive checkbox (localStorage RGBM_RC_SAVE_DRIVE remembers the choice; disabled until a folder is set). receiptUse → docSaveBlobs(blobs, vid) after filling the form: reconnects Google if needed (GIS preloaded when the sheet opens), then docSend() per part. docSend/docRefreshList/docRemove use docRecType() (Fuel / Maintenance / Insurance from the current screen). Fuel and Maintenance saves take DOC.pending; DOC.pending is reset when those forms open. Docs list on Fuel/Maintenance shows only when links exist.
- Test evidence: TESTS/test_rc16.py 15/15 (VIN; receipt picture to Drive for Fuel new entry, Maintenance existing record, unchecked = no upload, no folder = disabled); against RC16: test_rc15 16/16, test_rc14r 31/31, test_rc14d 39/40 (only the old guide-title check: section renamed "Documents and receipt pictures (Google Drive)"), touch_press14 9/9, rc7 19/19, rc6 24/24, rc5 25/25, rc4 36/36, rc3 12/12, rc2 28/28.

## RC15 additions

- vehicleTap → vehicleView, vehicleLong → openFuelFromHome (configured vehicles only).
- vehicleView: .vehicle-detail-actions rendered first in the card; CSS two columns, 9px padding / 14px text; photo frame min(50%, 210px). Landscape: actions grid-row 1, details row 2, photo spans.
- receiptPickHtml(key, value): selects for station (stations), fuelGrade (fuelGrades), provider (maintenanceProviders), category (maintenanceCategories), ethanolFree (Yes/No). Uses selectOther → the existing Other modal (Use Once / Save To List), z-index above the receipt sheet. Read value matched to the list case-insensitively; unmatched value kept as an extra option. receiptUse sets the form's Category from any chosen value.
- Test evidence: TESTS/test_rc15.py 16/16 (touch tap/hold on circles, vehicle page layout, review drop-downs with Use Once / Save To List); regressions against RC15: test_rc14r 31/31, test_rc14d 40/40, touch_press14 9/9, rc7 19/19, rc6 24/24, rc5 25/25, rc4 36/36, rc3 12/12, rc2 28/28.

## RC14 additions

- iOS Safari (confirmed on Ronnie's iPhone) ignores input.click() made at touchend after a hold, so RC10–RC13 holds did nothing. Hold now calls pbChooser(): a sheet whose buttons are <label>s wrapping real <input type=file> (opacity 0, full size), so the picker opens from the user's own tap with no script click. receiptStart/docStart with src "library" route there; camera tap path unchanged.
- Test evidence: TESTS/test_rc14r.py 31/31, TESTS/test_rc14d.py 40/40, TESTS/touch_press14.py 9/9 (touch: hold shows the sheet, no script-opened picker; tapping Choose From Photos opens the picker) against RC14.

## RC13 additions

- pressButton(label, act, extra): touchstart (preventDefault — stops iOS/Android long-press callout, selection and pointercancel), touchmove (>24 px cancels), touchend (preventDefault, decides tap vs hold ≥ 500 ms and opens the picker; touchend is a user-activation event), mousedown/mouseup for mouse, click for keyboard (ignored for 1.5 s after a handled press). RC10–RC12 used pointer events; on phones the system long-press fired pointercancel, so release did nothing.
- cropOpen(file, {title, hint, save, onSave(canvas)}) shared by Scan Document (onSave → JPEG → docSend) and Read Receipt (onSave → receiptReadCanvas, the former receiptRead after image loading).
- Test evidence: TESTS/test_rc13r.py 31/31 (receipts with crop), TESTS/test_rc13d.py 39/39 (documents), TESTS/touch_press.py 8/8 (real touch events: tap → camera, 0.8 s hold → photos, for Read Receipt and Scan Document; crop screen before reading), plus test_rc12.py, test_rc7.py, test_rc6.py against RC13.

## RC12 additions

- docCrop(file, vid): picture drawn to a canvas (max 2400 px), frame starts from RGBMReceipt.paperBox (auto paper detection), pointer events with touch-action:none for drag on touch screens; 28 px grab tolerance; minimum frame 5% of the picture. Rotate turns the picture 90° and keeps the frame. cropSave() → JPEG 0.85 of the frame only → docSend() (the former upload path).
- Test evidence: TESTS/test_rc12.py 39/39, TESTS/touch_crop.py (touch drag moves the corner) (crop by dragging, rotate, whole picture, cancel uploads nothing; uploaded JPEG size matches the frame) plus test_rc11.py, all against RC12.

## RC11 additions

- Google Cloud project "RGB Mileage" (rgb-mileage, number 174154543708) owned by the administrator's personal Gmail: Drive API + Picker API enabled; OAuth consent External / Testing (only listed test users can connect — add each user's Gmail under Google Auth Platform → Audience → Test users); Web client "RGB Mileage web" with JS origin https://hzzmbgth7t-beep.github.io; API key "RGB Mileage Picker" limited to the Picker API and https://hzzmbgth7t-beep.github.io/*.
- Google Identity Services token client (accounts.google.com/gsi/client) + Google Picker (apis.google.com/js/api.js), scope drive.file. DRIVE_CONFIG {clientId, apiKey, appId} in app.js; until filled, the feature shows "not set up".
- Access token kept per RGBM user (localStorage RGBM_DRIVE_TOKEN_<uid>, ~1 hour); when expired, the next tap reconnects (Google window), then asks again how to add the document.
- state.driveDocs {mode: subfolders|perVehicle, parent, vehicles{vid:folder}, sub{vid:folder}, account} syncs with the user's settings row.
- Test evidence: TESTS/test_rc11.py 34/34 (simulated Google: connect, picker, subfolder creation and reuse, per-vehicle folders, tap/hold, link-only storage, remove link, expired/revoked sign-in, per-user settings), test_rc10.py 30/30, test_rc7.py 19/19, test_rc6.py 24/24.
- Upload: Drive v3 multipart, JPEG (max 2400 px, quality 0.85). Link stored on the insurance record as attachments[] {attachmentId, kind:"Google Drive", name, url, driveFileId, mimeType, addedAt}. Existing record: saved at once. New record: held until Save (leaving prompts as unsaved changes).

## RC10 additions

- receiptButton(kind, append, label) renders one button with pointer handlers. The picker opens on pointerup (a user-activation event on touch), so iOS and Android allow it; hold ≥ 500 ms → library (no capture attribute), shorter → camera (capture="environment"). Click fallback (keyboard/mouse) → camera. Long-press callout and text selection are disabled on the button.
- Review sheet fields sit in a two-column grid (.rc-grid).
- Test evidence: TESTS/test_rc10.py 30/30, TESTS/touch_check.py (real touch events: tap → camera, 0.8 s hold → photos), test_rc7.py 19/19, test_rc6.py 24/24, all against RC10.

## RC9 additions

- receiptStart(kind, append, src): src "camera" sets capture="environment" on the hidden file input; "library" removes it, so the phone shows its photo picker. Reading is unchanged.
- Test evidence: TESTS/test_rc9.py 27/27 (both buttons, capture attribute, library read fills the form) plus test_rc7.py 19/19 and test_rc6.py 24/24, all against RC9.

## RC8 additions

- Reader core lives between /*RGBM_RECEIPT_START*/ and /*RGBM_RECEIPT_END*/ in app.js; source and bench in TESTS/receipt_bench (receipt_core.js, gen.py, bench.mjs). The bench runs the same core in Node with tesseract.js 5.1.1 and @napi-rs/canvas.
- Tesseract page mode 6 (one block) with row grouping; default mode 3/4 dropped right-aligned amounts. Background outside the paper is blanked rather than inverted.
- Reader assets are fetched only when Scan Receipt is used: tesseract.js@5.1.1 dist, tesseract.js-core@5.1.1, @tesseract.js-data/eng@1.0.0 4.0.0_best_int. Offline first use shows a clear message.
- Test evidence: TESTS/test_rc8.py 25/25 (real reader in Chromium on bench receipts, fill-in, corrections, Fill In Again, maintenance, offline failure, no picture stored); test_rc7.py 19/19; test_rc6.py 24/24; test_rc5.py 25/25; test_rc4.py 36/36; test_rc3.py 12/12; test_rc2.py 28/28; test_sync.py 33/33 — all against RC8. Bench: tune 309/324 (95%), held-back 235/252 (93%).

## RC7 additions

- LIST_DEFS maps each list to its record collection and fields. listMaterialize copies the current displayed order into state[key] and sets state.customizedLists[key]; activeList returns that order exactly (plus Other) for customized lists.
- Rename updates records whose field equals the old value exactly (Provider updates serviceProvider and provider) and stamps modifiedAt, so they sync.
- Linked sync compares settings too when the cloud has a settings row.
- Test evidence: TESTS/test_rc7.py 19/19; test_rc6.py 24/24; test_rc5.py 25/25; test_rc4.py 36/36; test_rc3.py 12/12; test_rc2.py 28/28; test_sync.py 33/33 — all against RC7.

## RC6 additions

- maintPickSelect(id, listName, value) renders a select with a blank first option, the saved list, the record's current value if missing from the list, and Other; onchange uses the existing selectOther/openOtherModal flow. saveOtherValueToState already handled any list name.
- maintPickList seeds state[listName] once from distinct record values when the list does not exist yet.
- Test evidence: TESTS/test_rc6.py 24/24; test_rc5.py 25/25; test_rc4.py 36/36; test_rc3.py 12/12; test_rc2.py 28/28; test_sync.py 33/33 — all against RC6.

## RC5 additions

- Users screen (route "users") calls POST /functions/v1/admin-users with actions list, create, set_password. The function verifies the caller's token with auth.getUser, requires a row in public.app_admins, and uses the project secret key (SUPABASE_SECRET_KEYS.default, falling back to SUPABASE_SERVICE_ROLE_KEY) for auth.admin calls.
- The app shows Manage Users only when GET /rest/v1/app_admins returns the caller's row (cached per user as RGBM_IS_ADMIN_<user id>, re-checked after each sync). Missing table or function → no admin UI and no errors.
- Temporary passwords: 12 random characters from crypto.getRandomValues (no look-alike characters), shown once with Share/Copy.
- Test evidence: TESTS/test_rc5.py 25/25 (admin detection, list, add, duplicate, invalid email, reset, share/copy, new user sign-in, non-admin blocked in app and in function, missing table); test_rc4.py 36/36; test_rc3.py 12/12; test_rc2.py 28/28; test_sync.py 33/33 — all against RC5.

## RC4 additions

- RGBM_GUIDE (between /*RGBM_GUIDE_START*/ and /*RGBM_GUIDE_END*/ in app.js) is generated by build_guide.py from USER-GUIDE.source.md; route "guide" renders it as collapsible sections with a contents list.
- cloudMarkLinked() records RGBM_CLOUD_OWNER alongside RGBM_CLOUD_LINKED. Sign-out keeps the owner. An unlinked sign-in by a different account with local data shows the switch card; cloudSwitchAccount() resets the device to blank, adopts the new account's cloud rows, and clears photo/sync bookkeeping and the Face ID lock. Upgraded devices copy LINKED into OWNER on launch.
- Welcome popup: CLOUD.welcomePending is set by password, Face ID, and email-link sign-in; shown after sync when no choice/switch/pause card is open; flag RGBM_WELCOME_<user id>. Already-signed-in devices are marked done on upgrade.
- Change Password uses PUT /auth/v1/user (CLOUD.passwordMode="change").
- Test evidence: TESTS/test_rc4.py 36/36 (guide, welcome, change password, second user, shared-device switch both ways, upgrade path); test_rc3.py 12/12; test_rc2.py 28/28; test_sync.py 33/33 — all run against RC4. TESTS/mock_supabase.py now models two users with row level security.

## RC3 additions

- initCloudSync opens the Cloud Sync screen on launch when there is no session and RGBM_CLOUD_SKIP_SIGNIN is not set; signing in (password or Face ID) clears the flag.
- cloudSync now calls render() when the choice card is set while already on the Cloud Sync screen; cloudPush does the same for the Sync Paused card.
- Test evidence: TESTS/test_rc3.py 12/12; TESTS/test_rc2.py 28/28; TESTS/test_sync.py 33/33 (two expectations updated for the new launch screen).
