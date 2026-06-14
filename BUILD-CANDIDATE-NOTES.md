# RGBMileage v2.2.0 Build Candidate 1

Baseline source: confirmed `v2.1.6c` controlled working copy.

Implemented code scope:
- Firebase Email/Password auth entry points
- Firestore connection scaffold
- Explicit local-to-cloud migration controls
- Explicit cloud-to-device load control
- Local-first persistence preserved until cloud link is resolved
- Import/export retained
- Fuel / Maintenance / Insurance merged-screen flows preserved via centralized save path

Patched files:
- `app.js`
- `index.html`
- `sw.js`
- `manifest.json`

Important:
- Firebase config values are placeholders in `index.html` under `window.RGBM_FIREBASE_CONFIG`
- Until valid Firebase config is provided, the app remains local-only
- This is a coded build candidate and still requires run-sheet verification and EMR/PMR closure

SHA-256:
- `app.js`: `fc4c5dad637ab3e408c95d5315004aeb42e863937b9d98f2f530889ce1601bb2`
- `index.html`: `9a8498a910213bfa4f2cbcaa935e8d3f888097767a64c5f3662c62cacef21618`
- `sw.js`: `c6e0fc4e5a1fe1328029373dd403d02bc09f648960d533a776ae1e6ce99e2c55`
- `manifest.json`: `ef7be2cc881a1e9b4b3badff0df2455ac7d9467f21c63ca799b855da44b0be38`