# RGB Mileage User Guide

Build: `v2.1.6l-wc10-f28-rc4`  
Cache: `216lwc10f28rc4`  
Guide release: `v2.1.6l-wc10-f28-rc4`  
Last User Guide content-change release: `v2.1.6l-wc10-f28-rc4`  
Source baseline: accepted `v2.1.6l-wc10-f27`  
Source SHA-256: `97ce4d8ac0afb209879e2c9f68a2b976859c98af0a9e8311a13ed617f244a088`  
Current status: `Release Candidate 4 / pending user validation`

Production URL:  
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-busted URL for this build:  
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f28rc4

## Fuel MPG and Price/Gal formatting

MPG and Price/Gal values are displayed with three digits right of the decimal point.

Examples:

- MPG: `17.426`
- Price/Gal: `$3.499`

The formatting change is display-oriented. Existing stored record values are not migrated or rewritten.

When editing a Fuel record, related Fuel fields recalculate:
- Odometer updates Miles and MPG when a previous odometer is available.
- Miles and Gallons update MPG.
- Price/Gal updates Total Cost.
- Total Cost updates Price/Gal.

## Backup before recovery

Use **Create JSON Backup** before cache reset, reinstall, or recovery.

## App Cache Reset

Use Settings > App Cache Reset when the installed Home Screen app opens an older version or wrong layout while Safari opens the correct version.

Steps:

1. Open Settings.
2. Tap **Create JSON Backup First**.
3. Save the downloaded JSON backup somewhere safe.
4. Tap **Reset App Cache / Reload Current Version**.
5. Confirm the reset.
6. Confirm the app reloads as `v2.1.6l-wc10-f28-rc4`.
7. Confirm vehicle data remains present.

## Home circle mileage

The Home screen shows each configured vehicle’s last refuel mileage beside its circle. Circle 1 shows the mileage on the right side. Circles 2 and 3 show the mileage on the left side. The Home value uses zero decimal places and is display-only.
