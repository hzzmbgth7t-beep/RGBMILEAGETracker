# RGB Mileage

Version: v2.1.3m
Build Date: 09/06/26
GitHub Pages URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
Cache-Buster URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=213m
GitHub Repository URL: https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker

## Current Release Information

v2.1.3m is built from v2.1.3l and corrects the shared tap/long-press interaction issue affecting vehicle-circle tap and previous-record tap.

## Previous README History

---

## v2.1.3l
09/06/26

# RGB Mileage

Version: v2.1.3l
Build Date: 09/06/26
GitHub Pages URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
Cache-Buster URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=213l
GitHub Repository URL: https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker

## Current Release Information

v2.1.3l is built from v2.1.3h and corrects only the Home Screen Vehicle Circle long-press regression.

## Previous README History

---

## v2.1.3h
09/06/26

# RGB Mileage v2.1.3h

GitHub Pages URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
GitHub Repository URL: https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker

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
