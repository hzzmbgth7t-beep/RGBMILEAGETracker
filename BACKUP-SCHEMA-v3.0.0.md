# RGB Mileage Backup Schema v3.0.0

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat01`  
**Date:** 2026-07-25  
**Classification:** CURRENT  
**Status:** CURRENT BACKUP CONTRACT  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat1

Backups include schema version, migration version, three vehicle records, `vehicleOrder`, operational collections, attachments, settings, and metadata.

Restore rules:

- Replace validates and adopts the incoming state.
- Update and Skip merge vehicle definitions by `vehicleId`.
- Duplicate applies only to operational records.
- Vehicle definitions are never merged by array index.
- More than three source vehicle positions fails without truncation.
