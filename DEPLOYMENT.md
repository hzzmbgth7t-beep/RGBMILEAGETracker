# DEPLOYMENT — v2.1.6l-wc10-f29-rc18

Build: `v2.1.6l-wc10-f29-rc18`  
Status: `Release candidate — pending user validation`  
Cache: `216lwc10f29rc18`  
Source baseline: accepted `v2.1.6l-wc10-f28`  
Source SHA-256: `801f8b0f1993a0d09c9d18f0860c84414af7b857217978f40cfc3669f2600104`

## Locked package and README rules

- Every package is a full package unless the assistant asks before creating it and the user explicitly approves a partial/special-purpose package.
- Standard package filename format is `RGBMileage_<version>.zip`.
- Do not include `FULL` or a date in standard package filenames.
- Version numbers are never reused.
- README URLs must be updated for every version.
- README URLs must be the first README section after the title.

## Release rule: User Guide

Every release updates the User Guide. Edit the guide source, then run `build_guide.py <package> <version> <cache>`; it rewrites the guide block in app.js and USER-GUIDE.md together. A release is not complete until the in-app guide shows the new version and describes every change in that release.

## Adding users (invite only)

In the app: Settings → **Manage Users** (administrator only) → enter the email → **Add User** → **Share** the details. **Reset Password** sets a new temporary password.

This needs, once: `6_Enable_User_Admin.sql` run in the SQL Editor, and the Edge Function `admin-users` (DOCUMENTATION/SUPABASE/admin-users/index.ts) deployed with "Verify JWT with legacy secret" turned off (the function checks the user's token itself). Administrators are the rows in `public.app_admins`.

Fallback without the app: Supabase → Authentication → Users → **Add user** → **Create new user** with a temporary password and **Auto Confirm User** ticked.

Each user sees only their own data (row level security).

## Before deploying

1. In the current app, create a JSON backup (Settings > App Cache Reset > Create JSON Backup First) and save it outside the app.
2. Supabase is already prepared (tables, data import, sync triggers, sign-ups off, app URL allowed for email links).

## Deploy

Deploy only the 17 ZIP-root files to GitHub Pages. Do not deploy the eight support folders.

Open the cache-busting URL after deployment:

https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f29rc18

Confirm displayed identity is `v2.1.6l-wc10-f29-rc18` and cache identity is `216lwc10f29rc18`.

## First sign-in

1. Settings > Open Cloud Sync.
2. Enter your email and tap **Set or Reset Password by Email**.
3. Open the email link on the same device; the app opens the Set Password screen.
4. Save a password. Sync starts.
5. If the device and cloud match, status shows "Synced — this device matches the cloud."
6. If they differ, choose **Use Cloud Data on This Device** or **Upload This Device's Data to Cloud**.

## Face ID (RC2)

1. Sign in to Cloud Sync in the Home Screen app.
2. Settings > Face ID > **Set Up Face ID** and approve the Face ID prompt.
3. Close and reopen the app: it should ask for Face ID before showing data.

## Installed app recovery

If Safari shows the correct version but the Home Screen app shows an old version, use Settings > App Cache Reset after creating a JSON backup.

## Home validation

Validate that Home circle positions, descriptions, and mileage labels are unchanged in portrait and landscape.
