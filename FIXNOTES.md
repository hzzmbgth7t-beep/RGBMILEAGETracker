# FIXNOTES

## v2.1.6k - Migration Precedence Correction

### Reason For This Release
Converted undated legacy records were still displaying Other Data instead of Migration.

### Fix Implemented
For Fuel and Maintenance:
- no date => Migration

This precedence now overrides older import-style markers on those undated converted records.
