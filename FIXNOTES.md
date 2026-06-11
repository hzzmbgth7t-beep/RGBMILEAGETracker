# FIXNOTES

## v2.1.3ob — 09/06/26

This build is a follow-on corrective pass based on v2.1.3oa.

Verified issues corrected:
- Back from Fuel, Maintenance, and Insurance record view/edit now returns to the true prior screen.
- Opening additional records from a record screen no longer creates a back-stack cycle through those records.
- Back from report detail now returns to the Reports screen before returning to Home.
- Record edit screens now warn about unsaved changes and offer Save or Discard before leaving.

Release-control correction:
- Version labels, cache-buster references, and release documentation were synchronized for v2.1.3ob.
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
