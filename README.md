# RGB Mileage

Version: v2.1.3oa
Build Date: 09/06/26
GitHub Pages URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
Cache-Buster URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=213oa
GitHub Repository URL: https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker

## Current Release Information

v2.1.3oa is a corrective stabilization build derived from v2.1.3o.

Scope of this build:
- Correct concrete defects identified during review.
- Tighten validation and input consistency.
- Centralize version/schema references.
- Reduce obvious regression risk without redesigning the app.
- Preserve the existing app structure and user workflows.

Included corrections:
- Restored CSV preview/import sequence fallback by replacing the undefined seq() call with nextSeq().
- Corrected Quick Fuel so Cost Source saves the selected field value.
- Centralized schema/version handling so schema display and backup metadata align with the build version.
- Updated Settings schema display to match the active build.
- Hardened storage quota recovery to reduce risk to existing saved data.
- Added low-risk validation improvements for Fuel, Maintenance, and Insurance save paths.

Compatibility:
- Existing saved data is intended to remain compatible.
- This build is intended to run in modern desktop browsers and iOS Safari.
- Local browser storage remains device/browser specific.

Deployment verification:
1. Deploy all updated files.
2. Open with the cache-buster URL shown above.
3. Confirm the title/build displays v2.1.3oa.
4. Confirm Previous Records view, Quick Fuel save, CSV preview, backup creation, and Settings schema display.


## Previous README History

The links and cache-buster URLs below are preserved as historical release references only. Only the URLs listed at the top of this README should be used as the current live deployment addresses.

---

## v2.1.3n
09/06/26

# RGB Mileage

Version: v2.1.3n
Build Date: 09/06/26
Historical GitHub Pages URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
Historical Cache-Buster URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=213n
Historical GitHub Repository URL: https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker

## Current Release Information

v2.1.3n is built from v2.1.3h and corrects only:
- Home Screen vehicle-circle long press support.
- Previous Records tap-to-view behavior.

## Previous README History

---

## v2.1.3h
09/06/26

# RGB Mileage v2.1.3h

Historical GitHub Pages URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
Historical GitHub Repository URL: https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker

Build Date: 09/06/26  
Internal Build Date: 2026-06-09

## Scope

v2.1.3h is a stabilization candidate built from the confirmed installed v2.1.3g baseline.

Authorized corrections:
- D-047: Record Interaction System — Tap opens View; Long Press opens Edit.
- D-054: App Identity System — RGB Mileage is the single visible app name.
- D-055: Build Display System — build date displays as DD/MM/YY.
- D-056: Navigation Layout System — bottom navigation uses one authoritative layout override.

## Data Compatibility

The storage key is intentionally reviewed for continuity with the stabilization series. Existing user data should remain compatible.

## Deployment Verification

Open with cache buster:

https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=213h


---

# Previous README History

## v2.1.3g
08/06/26

# RGB Mileage Tracker v2.1.3g

Patch release built from accepted v2.1.3f baseline.

## Scope
- D-047: repair tap-to-view launch for Fuel, Maintenance, and Insurance previous records.
- D-053: restore Fuel Edit field parity with Quick Fuel Entry.
- D-049: orientation lock remains deferred.
- D-054: landscape overlap remains deferred.

## Data Compatibility
The localStorage key remains `RGBM_DATA_v213d` to preserve deployed user data across the stabilization series.