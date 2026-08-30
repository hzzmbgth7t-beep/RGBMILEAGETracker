# CHANGELOG

## v2.1.6l-wc10-f27-rc1 — 08/30/2026

- Built from accepted `v2.1.6l-wc10-f26`.
- Source SHA-256: `6011c1d5742b1dfb295f04849cb6fd0419bad0c629d2aac30a4d62e48603503b`.
- Added Settings App Cache Reset feature.
- Added Settings shortcut to create a JSON backup before cache reset.
- App cache reset clears cached app-shell files and unregisters service workers scoped to RGB Mileage.
- App cache reset preserves vehicle data stored in local app storage.
- App cache reset reloads the current cache-busting URL.
- Updated build/cache references to `v2.1.6l-wc10-f27-rc1` and `216lwc10f27rc1`.
- Preserved F26 odometer fields, mileage-error warnings, delete parity, and accepted Home geometry.

## v2.1.6l-wc10-f26 — 08/30/2026

- Accepted baseline before F27 RC1.
- Added Vehicle Detail odometer summary fields.
- Added mileage consistency warnings and yellow highlights.
- Added dated-first / undated-fallback odometer logic.
