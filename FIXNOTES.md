# FIXNOTES — v2.1.6l-wc10-f28-rc1

Build: `v2.1.6l-wc10-f28-rc1`  
Status: `Release Candidate 1 / pending user validation`  
Cache: `216lwc10f28rc1`  
Source baseline: accepted `v2.1.6l-wc10-f27`  
Source SHA-256: `97ce4d8ac0afb209879e2c9f68a2b976859c98af0a9e8311a13ed617f244a088`

## Fix scope

This version updates display formatting for Fuel MPG and Price/Gal values.

## Implementation notes

- MPG display helpers now render three decimal places.
- Price/Gal display helpers now render three decimal places.
- Calculated MPG values display as three decimals.
- Calculated Price/Gal values display as three decimals.
- Total fuel cost remains currency-formatted to two decimals.
- Existing stored record values are not migrated or bulk-rounded.
- No Home geometry logic was changed.
- No data schema migration was added.

## Validation focus

Confirm Fuel Entry, Fuel Record Detail, Previous Fuel Records/report displays, and MPG reports show MPG and Price/Gal to three decimal places where those values appear.
