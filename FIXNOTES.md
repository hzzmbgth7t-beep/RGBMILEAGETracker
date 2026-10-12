# FIXNOTES — v2.1.6l-wc10-f29-rc1

Build: `v2.1.6l-wc10-f29-rc1`  
Status: `Release candidate — pending user validation`  
Cache: `216lwc10f29rc1`  
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
