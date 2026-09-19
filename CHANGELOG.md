# CHANGELOG

## v2.1.6l-wc10-f28-rc1 — 2026-09-18

- Built from accepted `v2.1.6l-wc10-f27`.
- Source SHA-256: `97ce4d8ac0afb209879e2c9f68a2b976859c98af0a9e8311a13ed617f244a088`.
- Updated build/cache references to `v2.1.6l-wc10-f28-rc1` and `216lwc10f28rc1`.
- Changed MPG display formatting to three decimal places.
- Changed Price/Gal display formatting to three decimal places.
- No data migration was added; existing stored values are not rewritten.
- Preserved F27 Settings App Cache Reset, F26 odometer fields, delete parity, and accepted Home geometry.

## v2.1.6l-wc10-f27 — 08/30/2026

- Built from accepted `v2.1.6l-wc10-f26`.
- Source SHA-256: `6011c1d5742b1dfb295f04849cb6fd0419bad0c629d2aac30a4d62e48603503b`.
- Added Settings App Cache Reset feature.
- Added Settings shortcut to create a JSON backup before cache reset.
- App cache reset clears cached app-shell files and unregisters service workers scoped to RGB Mileage.
- App cache reset preserves vehicle data stored in local app storage.
- App cache reset reloads the current cache-busting URL.
- Updated build/cache references to `v2.1.6l-wc10-f27` and `216lwc10f27`.
- Preserved F26 odometer fields, mileage-error warnings, delete parity, and accepted Home geometry.

## v2.1.6l-wc10-f26 — 08/30/2026

- Accepted baseline before F27.
- Added Vehicle Detail odometer summary fields.
- Added mileage consistency warnings and yellow highlights.
- Added dated-first / undated-fallback odometer logic.
