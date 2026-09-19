# CHANGELOG

## v2.1.6l-wc10-f28-rc4 — 2026-09-18

- Built from accepted `v2.1.6l-wc10-f27`.
- Source SHA-256: `97ce4d8ac0afb209879e2c9f68a2b976859c98af0a9e8311a13ed617f244a088`.
- Updated build/cache references to `v2.1.6l-wc10-f28-rc4` and `216lwc10f28rc4`.
- Changed MPG display formatting to three decimal places.
- Changed Price/Gal display formatting to three decimal places.
- Corrected Fuel record edit recalculation parity:
  - odometer updates miles and MPG
  - miles/gallons update MPG
  - Price/Gal updates Total Cost
  - Total Cost updates Price/Gal
- Added Home circle last-refuel mileage beside each circle: Circle 1 displays to the right; Circles 2 and 3 display to the left without moving circles or descriptions.
- No data migration was added; existing stored values are not rewritten.
- Preserved F27 Settings App Cache Reset, F26 odometer fields, delete parity, and accepted Home geometry.

## Prior accepted baseline

- Previous accepted production baseline before this candidate: `v2.1.6l-wc10-f27`.
- Earlier F26 and F27 notes are preserved in the accepted release packages for those versions.
