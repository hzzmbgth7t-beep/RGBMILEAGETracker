## v2.1.3oc — Field Parity Release Notes

### Summary
This build focuses on field parity only. It ensures that Maintenance and Insurance records expose the intended user-facing fields consistently across the current separate View and Edit screens.

### What Was Corrected

#### Maintenance
Added missing Maintenance fields to the current screen set so both View and Edit expose the same intended data:
- Location
- Provider
- Pickup Date
- Performed By

#### Insurance
Added and aligned Insurance fields so both View and Edit expose the same intended data:
- Agency
- Agreed Value
- Agent
- Phone
- Email
- Notes

### Presentation Cleanup
Insurance presentation is simplified to use:
- Agency instead of Company as the primary visible organization field
- Agreed Value instead of Coverage Value as the primary visible value field
- one Notes field for user-facing display

### What This Release Does Not Change
- no screen consolidation
- no unified section-screen behavior
- no new save/cancel prompt model
- no button-layout redesign
- no responsive layout changes

### Verification Focus
Primary verification for this release should confirm:
- all parity fields are visible in both View and Edit
- saved values persist correctly
- existing navigation behavior remains unchanged
- no unrelated regressions were introduced


# FIXNOTES

## v2.1.3oc — 09/06/26

This build is a follow-on corrective pass based on v2.1.3oa.

Verified issues corrected:
- Back from Fuel, Maintenance, and Insurance record view/edit now returns to the true prior screen.
- Opening additional records from a record screen no longer creates a back-stack cycle through those records.
- Back from report detail now returns to the Reports screen before returning to Home.
- Record edit screens now warn about unsaved changes and offer Save or Discard before leaving.

Release-control correction:
- Version labels, cache-buster references, and release documentation were synchronized for v2.1.3oc.
- A standing release rule was added requiring a single version source of truth and synchronized label verification before packaging.

Non-scope items:
- No architecture redesign.
- No module split.
- No new user-facing feature expansion.

## v2.1.3oa — 09/06/26

This build is a corrective stabilization pass based on v2.1.3o.

Verified issues corrected:
- CSV preview/import referenced an undefined `seq()` fallback. The fallback now uses `nextSeq()`.
- Quick Fuel saved Cost Source based on Total Cost presence instead of the selected field value. The selected Cost Source is now saved correctly.
- Backup payload schema metadata did not match the active build. It now uses the current schema version.
- Settings displayed an outdated schema version. It now displays the current schema version.
- Storage quota recovery previously risked clearing the active storage key too early. Recovery now clears legacy storage first.

Low-risk quality improvements:
- Added trimming and required-field checks on key save flows.
- Added non-negative numeric checks where applicable.
- Added insurance effective/expiration date order validation.

Non-scope items:
- No architecture redesign.
- No module split.
- No new user-facing feature expansion.
