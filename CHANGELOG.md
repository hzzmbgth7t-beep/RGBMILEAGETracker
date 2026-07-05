# CHANGELOG

## v2.1.6k - 2026-06-12
### Release Type
Migration Precedence Correction

### Summary
Corrected origin precedence so undated converted legacy records resolve to Migration instead of Other Data.

### Changes
- Fuel undated records now resolve to Migration with higher precedence
- Maintenance undated records now resolve to Migration with higher precedence
- Preserved the Other Data import path for true non-migration imports
