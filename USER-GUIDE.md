# USER GUIDE

## v2.1.6i Addendum - Maintenance Label Model Rollout

Maintenance now uses the refined shared origin model:
- Manual Entry
- Import
- Migration

Visible origin badges display only when meaningful:
- Import
- Migration

Manual Entry remains stored but is not shown as a badge.
Restore must not overwrite an existing record origin.
Undated current Maintenance entries with missing origin metadata are treated as Migration.

This build preserves meaningful existing Maintenance statuses such as Review and Historical without inventing new unapproved Maintenance-specific Incomplete rules.
