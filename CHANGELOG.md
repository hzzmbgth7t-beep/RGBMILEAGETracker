# CHANGELOG

## v2.1.3oa — 09/06/26

### Fixed
- Replaced the undefined `seq()` fallback in CSV preview/import with `nextSeq()`.
- Corrected Quick Fuel to save the selected Cost Source value.
- Aligned backup schema metadata with the active build version.
- Aligned Settings schema display with the active build version.
- Improved storage quota recovery to avoid clearing the active storage key first.

### Improved
- Centralized app version/schema handling.
- Tightened low-risk validation and trimming for Fuel, Maintenance, and Insurance save flows.
- Preserved the existing app structure while reducing obvious regression risk.

### Notes
- v2.1.3oa is a corrective stabilization build derived from v2.1.3o.
- No new feature scope or architecture redesign was introduced.
