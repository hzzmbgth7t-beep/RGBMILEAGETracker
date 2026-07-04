# CHANGELOG

## v2.1.6e - 2026-06-12
### Release Type
Fuel Save-Time Calculation Release

### Summary
Corrected install package for the first v2.1.6e attempt. This package documents and delivers the actual Fuel save-time calculation enhancement.

### Changes
- Added save-time prompt to calculate **Price/Gal** when **Gallons** and **Total Cost** are present and **Price/Gal** is blank
- Added save-time prompt to calculate **Total Cost** when **Gallons** and **Price/Gal** are present and **Total Cost** is blank
- Added overwrite prompt for previously calculated Fuel cost fields
- Added clear-field prompt for previously calculated Fuel cost fields
- Added persistence of Fuel cost field source state (entered / calculated / blank)

### Not Changed
- Maintenance behavior
- Insurance behavior
- Firebase/database behavior
- cleanup/disconnection behavior
