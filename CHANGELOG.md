# CHANGELOG

## v2.1.6g - 2026-06-12
### Release Type
Fuel-First Label Model Cleanup

### Summary
Implemented the Fuel-first label model cleanup, removed Verified from Fuel, and normalized older Fuel records into the new shared model.

### Changes
- Added shared label framework fields for Origin / Status / Lifecycle
- Applied the framework to Fuel
- Removed Verified from Fuel display behavior
- Added Fuel status handling for Incomplete / Historical / Review
- Preserved Archived as lifecycle
- Added legacy Fuel normalization rules for older records
