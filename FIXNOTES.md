# FIXNOTES — v2.1.6l-wc10-f29-rc8

Build: `v2.1.6l-wc10-f29-rc8`  
Status: `Release candidate — pending user validation`  
Cache: `216lwc10f29rc8`  
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
