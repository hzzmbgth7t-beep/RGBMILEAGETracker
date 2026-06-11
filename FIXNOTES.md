# FIXNOTES

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
