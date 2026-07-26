# WC-10 Flat Deployment Instructions

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat01`  
**Date:** 2026-07-25  
**Classification:** CURRENT  
**Status:** CONTROLLED DEVICE TESTING ONLY  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat1

## Upload

Upload every file from the extracted folder to the application origin. No folders need to be created.

Do not upload the outer install ZIP as the website itself. Extract it first, then upload its root-level files.

## Existing-data safeguards

- Do not remove the iPhone Home Screen app.
- Do not clear Safari website data.
- Create a full JSON backup before deployment.
- Launch the existing standalone app after deployment.
- Stop if `Data Recovery Required` appears.
- Export migration evidence before entering the new Jeep.

## Cache identity

- Manifest start URL: `./index.html?v=216lwc10flat1`
- Service-worker cache: `rgbm-v2.1.6l-wc10-flat01-2026-07-25`
