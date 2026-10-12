# CHANGELOG

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
