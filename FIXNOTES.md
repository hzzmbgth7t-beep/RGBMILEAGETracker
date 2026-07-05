# FIXNOTES

## v2.1.6j - Origin Model and Import Prompt Refinement

### Reason For This Release
Import was being used both as the feature/action and as the long-term record label, which created confusion.

### Fix Implemented
The record-origin model now uses:
- Manual Entry
- Migration
- Other Data

The import feature now asks whether imported rows are:
- Migrated Data
- Other Data

### Important Rule
Restore still must not overwrite an existing origin.
