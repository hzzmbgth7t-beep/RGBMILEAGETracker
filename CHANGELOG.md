# CHANGELOG

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
