# RGB Mileage Tracker flat04 Fix Notes

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat04`  
**Status:** CURRENT  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat4

## Failure addressed

The Home Screen app reported:

`A pending migration exists and requires recovery.`

Safari testing had already produced a valid three-vehicle backup, but Safari and the installed Home Screen app were not using the same visible storage state.

## Transaction correction

The earlier migration transaction attempted to keep pending data while writing the same large payload to active storage. Large embedded images can make that duplicate-write pattern exceed browser storage capacity.

flat04 requires an external recovery snapshot first, then:

1. retains active and pending values in memory
2. removes only the volatile active and pending keys
3. writes and validates the selected recovery candidate as active
4. restores the exact prior active and pending values when any step fails
5. leaves all legacy keys untouched

## Evidence correction

A user-configured third vehicle no longer causes migration acceptance to fail solely because the original blank position is no longer blank.
