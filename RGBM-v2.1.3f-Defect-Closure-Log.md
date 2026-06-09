# RGB Mileage Tracker — Defect Closure Log v2.1.3f

## D-047 — Tap-to-View Failure
Status: Ready for user verification

Expected:
- Tap Fuel previous record -> View screen.
- Tap Maintenance previous record -> View screen.
- Tap Insurance previous record -> View screen.
- View layout remains one field per row.
- Long press 750ms still opens Edit.

## D-049 — Orientation Lock Failure
Status: Test and close or defer

Expected if fixed:
- App remains portrait in Safari.
- App remains portrait from Home Screen.

If still rotating:
- Mark as deferred due to iOS/PWA limitation under approved Option B.

## D-052 — Version/Build Visibility Regression
Status: Ready for user verification

Expected:
- Home Screen title reads RGB Mileage Tracker.
- Version/build appears directly below title.
- Version/build visible in browser and Home Screen app.
