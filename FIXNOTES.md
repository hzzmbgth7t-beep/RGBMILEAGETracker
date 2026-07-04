# FIXNOTES

## v2.1.6e - Fuel Save-Time Calculation Release

### Reason For This Release
The user wanted Fuel to support save-time calculation of a missing cost field when enough information is present, without forcing exact-match warnings for small rounding differences.

### Fix Implemented
Fuel now supports:
- Save-time calculation prompt for blank **Price/Gal**
- Save-time calculation prompt for blank **Total Cost**
- source-aware overwrite prompt for calculated fields
- source-aware clear prompt for calculated fields

### Accepted Rules Applied
- Calculation occurs **at Save**
- Warn only when a blank field could be calculated
- Do not warn over tiny rounding differences caused by two-decimal storage/display
- If all fields are entered manually, do not force recalculation

### Package Correction Note
This corrected package replaces the original v2.1.6e attempt because the first documentation set did not match the actual release scope.
