# CHANGELOG

## v2.1.3ob — 09/06/26

### Fixed
- Corrected record back-navigation so Fuel, Maintenance, and Insurance record screens return to the true prior screen instead of cycling through records opened from the current screen.
- Corrected report back-navigation so report detail returns to the Reports screen before the user returns to Home.

### Improved
- Added unsaved-changes protection for record edit screens with Save or Discard options before leaving.
- Synchronized visible version labels, cache-buster references, and release documentation for this build.

### Release Control
- Added a standing rule that future builds must update code labels, deployment references, and documentation together from a single version source of truth.

### Notes
- v2.1.3ob is a follow-on corrective build derived from v2.1.3oa.
- No architecture redesign or feature expansion was introduced.

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
