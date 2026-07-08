# DEPLOYMENT

## v2.1.7b Deployment Notes

### Release Type
Home Screen Menu Hard Reset

### Deployment URL
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

### Cache-Buster URL
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=217b

### Files That Must Be Deployed
- index.html
- app.js
- styles.css
- manifest.json
- sw.js
- README.md
- CHANGELOG.md
- FIXNOTES.md
- DEPLOYMENT.md
- USER-GUIDE.md
- RGBM-v2.1.7b-Verification.md

### Post-Deployment Checks
1. Confirm app shows `v2.1.7b`
2. Confirm Home Screen menu touches the visible bottom edge
3. Confirm no blank space exists beneath the menu
4. Confirm safe-area handling is internal to the Home Screen menu rail path
5. Confirm the manifest start URL uses `?v=217b`
