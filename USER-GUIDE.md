# RGB Mileage User Guide

Build: `v2.1.6l-wc10-f27-rc1`  
Cache: `216lwc10f27rc1`  
Guide release: `v2.1.6l-wc10-f27-rc1`  
Last User Guide content-change release: `v2.1.6l-wc10-f27-rc1`  
Source baseline: accepted `v2.1.6l-wc10-f26`  
Source SHA-256: `6011c1d5742b1dfb295f04849cb6fd0419bad0c629d2aac30a4d62e48603503b`  
Current status: `Release Candidate 1 / pending user validation`

Production URL:  
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-busted URL for this build:  
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f27rc1

## Backup before recovery

Yes, you can back up the data.

Use **Create JSON Backup** before cache reset, reinstall, or any recovery step. F27 RC1 also places a **Create JSON Backup First** button directly in Settings near the App Cache Reset control.

## App Cache Reset

Use this Settings feature when the installed Home Screen app opens an older version or wrong layout while Safari opens the correct version.

Steps:

1. Open Settings.
2. Tap **Create JSON Backup First**.
3. Save the downloaded JSON backup somewhere safe.
4. Tap **Reset App Cache / Reload Current Version**.
5. Confirm the reset.
6. Confirm the app reloads as `v2.1.6l-wc10-f27-rc1`.
7. Confirm vehicle data remains present.

This reset clears cached application files and service worker registrations for RGB Mileage. It does not intentionally clear vehicle records.

## Vehicle Detail odometer fields

Vehicle Detail groups these odometer fields together:

- Starting Odometer
- Last Refuel Mileage
- Last Maintenance Mileage
- Current Mileage

F26 odometer rules remain unchanged in this build.

## Mileage warnings

Mileage Error warnings remain informational only and do not block saving. Affected Fuel and Maintenance odometer fields and affected Previous Records rows remain highlighted yellow.
