# FIXNOTES

## v2.1.6l - Insurance Label Model Rollout

### Reason For This Release
Fuel and Maintenance already used the accepted origin model. Insurance needed the same shared framework before any later section-specific refinements.

### Fix Implemented
Insurance now uses:
- Manual Entry
- Migration
- Other Data

Manual Entry remains stored but is not shown as a visible badge.
Restore does not overwrite origin.
Undated legacy Insurance entries resolve to Migration.

### Scope Boundary
This build does not invent Insurance-specific Incomplete rules.
