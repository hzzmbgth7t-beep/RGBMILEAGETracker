# FIXNOTES

## v2.1.6i - Maintenance Label Model Rollout

### Reason For This Release
Fuel already used the refined origin/status/lifecycle model. Maintenance needed the same shared framework before moving on to Insurance.

### Fix Implemented
Maintenance now uses:
- Manual Entry
- Import
- Migration

Manual Entry remains stored but is not shown as a visible badge.
Restore does not overwrite origin.
Undated current Maintenance entries with missing origin metadata fall back to Migration.

### Scope Boundary
This build does not invent Maintenance-specific Incomplete rules.
