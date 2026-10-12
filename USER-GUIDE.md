# RGB Mileage User Guide

Build: `v2.1.6l-wc10-f29-rc1`  
Cache: `216lwc10f29rc1`  
Guide release: `v2.1.6l-wc10-f29-rc1`  
Last User Guide content-change release: `v2.1.6l-wc10-f29-rc1`  
Source baseline: accepted `v2.1.6l-wc10-f28`  
Source SHA-256: `801f8b0f1993a0d09c9d18f0860c84414af7b857217978f40cfc3669f2600104`  
Current status: `Release candidate — pending user validation`

Production URL:  
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-busted URL for this build:  
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f29rc1

## Cloud Sync

Your data is saved on the device first, then copied to your RGB Mileage cloud database when you are signed in and online. Another signed-in device picks up the changes the next time it opens or you tap **Sync Now**.

- Open: Settings > Open Cloud Sync.
- First time: enter your email, tap **Set or Reset Password by Email**, open the email on this device, and save a password.
- Status shows who is signed in and when the last sync happened.
- Offline is fine. Changes wait on the device and sync when you are back online.
- Vehicle photos stay on each device.
- If a device and the cloud disagree the first time, the app asks which data to keep.
- If a save would remove more than 10 items from the cloud, sync pauses and asks first.
- **Sign Out** stops syncing on this device. Your data stays on the device.

## Fuel MPG and Price/Gal formatting

MPG and Price/Gal values are displayed with three digits right of the decimal point. Editing a Fuel record recalculates related fields.

## Backup before recovery

Use **Create JSON Backup** before cache reset, reinstall, recovery, or choosing which data to keep in Cloud Sync.

## App Cache Reset

Use Settings > App Cache Reset when the installed Home Screen app opens an older version or wrong layout while Safari opens the correct version. Create a JSON backup first, reset, and confirm the app reloads as `v2.1.6l-wc10-f29-rc1`.

## Home circle mileage

The Home screen shows each configured vehicle's last refuel mileage beside its circle. This is unchanged in F29.
