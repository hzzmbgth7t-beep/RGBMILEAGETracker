# USER GUIDE

**Status:** Baseline-derived working copy `v2.1.6l-wc03` (not a promoted release)

## v2.1.6l-wc03 Addendum - Insurance Label Model Rollout

Insurance now uses the accepted shared origin model:
- Manual Entry
- Migration
- Other Data

Visible origin badges display only when meaningful:
- Migration
- Other Data

Manual Entry remains stored but is not shown as a badge.
Restore must not overwrite an existing record origin.
Undated legacy Insurance entries are treated as Migration.

This build preserves meaningful existing Insurance statuses such as Review and Historical without inventing new unapproved Insurance-specific Incomplete rules.