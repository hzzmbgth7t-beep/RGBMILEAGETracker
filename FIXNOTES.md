# RGB Mileage Tracker flat06 Fix Notes

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat06`  
**Status:** CURRENT  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat6

## Reconciliation basis

The standalone and Safari sessions diverged:

- standalone retained 46/13/7 operational records
- Safari retained the configured third vehicle and 41/3/5 records

Directly choosing either state would lose data.

## Merge result

The candidate uses the standalone pending state as its base, then:

- preserves both original vehicle IDs and order
- inserts the Safari Wrangler and its photo in position 3
- adds two Safari-only fuel record IDs
- adds one Safari-only insurance record ID
- retains all standalone fuel, maintenance, and insurance records
- selects the corrected 2024-09-22 acquisition record and seller
- unions custom fuel grades, stations, and maintenance categories

The superseded acquisition value remains archived in the recovery snapshot.

## Storage correction

The reconciled active payload and retained legacy copy are too large to safely keep together. After a fresh snapshot and explicit confirmation, flat06 removes source keys, writes active, validates read-back, and restores exact originals if any step fails.
