# FIXNOTES — v2.1.6l-wc10-f28-rc3

Build: `v2.1.6l-wc10-f28-rc3`  
Status: `Release Candidate 3 / pending user validation`  
Cache: `216lwc10f28rc3`  
Source baseline: accepted `v2.1.6l-wc10-f27`  
Source SHA-256: `97ce4d8ac0afb209879e2c9f68a2b976859c98af0a9e8311a13ed617f244a088`

## Fix scope

This version updates display formatting for Fuel MPG and Price/Gal values and corrects Fuel edit recalculation behavior.

## Implementation notes

- MPG display helpers now render three decimal places.
- Price/Gal display helpers now render three decimal places.
- Calculated MPG values display as three decimals.
- Calculated Price/Gal values display as three decimals.
- Total fuel cost remains currency-formatted to two decimals.
- Existing stored record values are not migrated or bulk-rounded.
- No Home geometry logic was changed.
- Fuel edit odometer changes now recalculate miles and MPG.
- Fuel edit miles/gallons changes now recalculate MPG.
- Fuel edit Price/Gal changes now recalculate Total Cost.
- Fuel edit Total Cost changes now recalculates Price/Gal.
- No data schema migration was added.

## Validation focus

Confirm Fuel Entry, Fuel Record Detail, Previous Fuel Records/report displays, and MPG reports show MPG and Price/Gal to three decimal places where those values appear.

## Home circle mileage display

- Added each configured vehicle’s last refuel mileage beside its Home circle.
- Circle 1 displays mileage to the right; Circles 2 and 3 display mileage to the left.
- Mileage is display-only, zero-decimal, and does not move existing circles or descriptions.
