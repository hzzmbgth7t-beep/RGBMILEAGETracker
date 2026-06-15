# CHANGELOG

## v2.2.0a
- Added visible Firebase Cloud Sync controls to the Data Management screen
- Added email/password inputs for account creation and sign-in
- Added visible actions for sign out, refresh cloud status, migrate local data to cloud, and load cloud data to device
- Added visible Firebase/cloud status display sourced from runtime state
- Corrected build-date display from `DD/MM/YY` to `MM/DD/YY`
- Preserved Backup & Restore and CSV Import behavior

## Reason for corrective release
- `v2.2.0` contained Firebase code paths without complete user-visible controls
- `v2.2.0` displayed build date in the wrong format relative to the desired `MM/DD/YY`
