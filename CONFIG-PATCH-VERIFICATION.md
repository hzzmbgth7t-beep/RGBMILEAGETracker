# v2.2.0a Firebase Config Patch Verification

Patch date: 2026-06-14T01:44:42.461356Z

## Source inputs
- Baseline candidate: `RGBMileage_v2.2.0a_build_candidate_1.zip`
- Controlled config source: `RGBMileage_Firebase_Web_Config_v2.2.0a.txt`

## Authorized target
- `index.html` only

## Replacement performed
- Replaced the placeholder `window.RGBM_FIREBASE_CONFIG` block in `index.html`
- Inserted the verified Firebase config block
- Left the Firebase module import block in place immediately after the config block

## Evidence
- Modified file count versus baseline candidate: `1`
- Modified file: `index.html`
- No added files
- No removed files

## Hash evidence
- Baseline `index.html` SHA-256: `9a8498a910213bfa4f2cbcaa935e8d3f888097767a64c5f3662c62cacef21618`
- Patched `index.html` SHA-256: `056464cdacb697a163b79f0bb69ea5b9c98a53401c82d40848dd9c1955064d26`

## Placement verification
Patched config block now appears at `index.html` lines 9-21.
Firebase module import block starts at line 22.

## Control conclusion
The patch stayed within the approved boundary and only changed the exact active code path authorized for Firebase config insertion.
