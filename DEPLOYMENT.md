## v2.2.0BC Deployment Notes

### Release Type
Firebase Migration Build Candidate

### Purpose
Deploy v2.2.0BC only for controlled Firebase authentication, Firestore connection, explicit migration-flow verification, and preservation testing of accepted current behavior.

### Links
GitHub Pages: [https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/](https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/)

Cache-buster URL: [https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=220](https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=220)

GitHub repository: [https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker](https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker)

### Active Runtime Indicators
- `index.html` loads `app.js?v=220`
- `manifest.json` start URL includes `?v=220`
- `sw.js` cache/version is aligned to `220`
- real Firebase config block is present in `index.html`

### Control Note
This is a build-candidate deployment path. Stable installed authority remains v2.1.6c until runtime verification, acceptance, and EMR/PMR closure are completed.
