# FIXNOTES — v2.1.6l-wc10-f25

Build: `v2.1.6l-wc10-f25`  
Status: `User validated / accepted baseline`  
Cache: `216lwc10f25`  
Source baseline: accepted `v2.1.6l-wc10-f24`  
Source SHA-256: `f90fe95495b9aba00530e8ca47ab95f3d58014a0a1624788209237b2df09bb32`  
Accepted production baseline: `v2.1.6l-wc10-f25`

## Fix scope

This release resolves action parity for Maintenance and Insurance records while keeping Fuel behavior as the reference model.

## Implementation notes

- Maintenance record titles now use date, category, and odometer when available.
- Maintenance category lookup tolerates older field names where practical.
- Maintenance odometer lookup tolerates `odometer` and `mileage` fields.
- Maintenance delete choices now provide Delete Permanently, Archive Instead, and Cancel.
- Insurance delete choices now provide Delete Permanently, Archive Instead, and Cancel.
- Existing generic archive behavior remains in use where appropriate.

## Unchanged scope

No Home geometry, CSS, schema, backup/restore, CSV, service-worker strategy, or viewport behavior change is intended.

## Rejected evidence excluded as source

F20, F21, F22, and F23 are rejected failure evidence only and are not implementation sources for this package.
