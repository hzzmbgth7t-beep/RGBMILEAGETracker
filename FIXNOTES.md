# FIXNOTES — v2.1.6l-wc10-f29-rc3

Build: `v2.1.6l-wc10-f29-rc3`  
Status: `Release candidate — pending user validation`  
Cache: `216lwc10f29rc3`  
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

## RC3 additions

- initCloudSync opens the Cloud Sync screen on launch when there is no session and RGBM_CLOUD_SKIP_SIGNIN is not set; signing in (password or Face ID) clears the flag.
- cloudSync now calls render() when the choice card is set while already on the Cloud Sync screen; cloudPush does the same for the Sync Paused card.
- Test evidence: TESTS/test_rc3.py 12/12; TESTS/test_rc2.py 28/28; TESTS/test_sync.py 33/33 (two expectations updated for the new launch screen).
