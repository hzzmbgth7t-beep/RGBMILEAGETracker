# RGBMileage v2.2.0 Build Candidate

This package is the first Firebase-enabled build candidate for RGBMileage.

## Build status
- Baseline authority: v2.1.6c
- Candidate version: v2.2.0
- Build type: Firebase migration build candidate
- Hosting model: GitHub Pages / web PWA retained

## Approved scope in this build candidate
- Firebase Email/Password authentication
- Firestore connection
- Explicit local-to-cloud migration flow
- Preservation of accepted current behavior
- Import/export retained

## Explicitly out of scope
- Broad code cleanup/refactor
- UI redesign unrelated to Firebase migration
- Hosting move away from GitHub Pages
- Realtime Database adoption
- Analytics / unrelated Firebase products

## Runtime indicators for this candidate
Do not rely on this README alone to identify the active build.

Use these runtime indicators instead:
- index.html loads app.js?v=220
- manifest.json start_url includes ?v=220
- sw.js cache/version is aligned to 220
- Firebase/cloud/auth controls are present in the app UI
- CONFIG-PATCH-VERIFICATION.md exists in the config-patched candidate package

## Important note
This README corrects stale baseline wording that may still appear in earlier packaged copies derived from the v2.1.6c working baseline.
