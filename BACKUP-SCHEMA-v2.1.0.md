# BACKUP-SCHEMA-v2.1.0

Status: Final Planning
App: RGB Mileage
Target Version: v2.1.0
Based On: RGB Mileage Master Specification v1.0

## Purpose

Define the JSON backup schema for v2.1.0 so backups are predictable, restorable, and compatible with future versions.

## Backup Format

Primary backup format:

```text
JSON
```

ZIP/complete backup with external attachment packaging remains deferred.

## Root Backup Object

```json
{
  "app": "RGB Mileage",
  "schemaVersion": "2.1.0",
  "exportedAt": "ISO datetime",
  "exportedByVersion": "2.1.0",
  "backupType": "Full JSON",
  "settings": {},
  "vehicles": [],
  "vehicleAcquisitionRecords": [],
  "fuelRecords": [],
  "maintenanceRecords": [],
  "insuranceRecords": [],
  "attachments": [],
  "stations": [],
  "metadata": {}
}
```

## Required Root Fields

| Field | Required | Notes |
|---|---:|---|
| app | Yes | Must be RGB Mileage |
| schemaVersion | Yes | Backup schema version |
| exportedAt | Yes | ISO datetime |
| exportedByVersion | Yes | App version that created backup |
| backupType | Yes | Full JSON |
| settings | Yes | App settings |
| vehicles | Yes | Vehicle objects |
| vehicleAcquisitionRecords | Yes | Acquisition records |
| fuelRecords | Yes | Fuel records |
| maintenanceRecords | Yes | Maintenance records |
| insuranceRecords | Yes | Insurance history records |
| attachments | Yes | Attachment objects or embedded data |
| stations | Yes | Station dropdown/list data |
| metadata | Yes | Backup metadata |

## Backup Compatibility Policy

v2.1.0 must restore backups from v2.0.6 and newer whenever technically possible.

Compatibility with versions before v2.0.6 is not required.

## Restore Mode for v2.1.0

v2.1.0 restore behavior:

```text
Replace Entire Database
```

Merge restore remains deferred.

## Backup Metadata

Recommended metadata:

```json
{
  "vehicleCount": 2,
  "fuelRecordCount": 0,
  "maintenanceRecordCount": 0,
  "insuranceRecordCount": 0,
  "attachmentCount": 0,
  "estimatedSizeBytes": 0
}
```

## Backup Summary Before Export

Before export, show:

- Vehicles
- Fuel Records
- Maintenance Records
- Insurance Records
- Vehicle Acquisition Records
- Attachments
- Estimated backup size

Then ask user to confirm.

## Record Preservation Rules

Backups must preserve:

- recordId
- entrySequence
- recordType
- source
- classificationTags
- dataQuality
- createdAt
- modifiedAt
- attachments
- archived records
- historical records

## Archived Records in Backup

Archived records remain in the backup.

Archived records must not be stripped from JSON.

## Historical Records in Backup

Historical records remain in the backup.

Historical records must preserve entered values even when calculated values are missing or suspect.

## Attachments in Backup

For v2.1.0, attachments may remain embedded if that is the current implementation.

Attachment entries must preserve:

- attachmentId
- sourceRecordId
- filename
- fileType
- createdAt
- data
- optimized flag where available

## Image Optimization Requirement

Images stored in backup should be optimized where practical:

- Longest dimension: 1200 px
- Approximate quality: 85%
- Original full-size image is not retained after optimization

## Validation Before Restore

Restore must validate:

- File is valid JSON
- Root object is readable
- Version is supported or migratable
- Vehicle array exists or can be created
- Required record arrays exist or can be created
- Data can fit in local storage

## Restore Failure Messages

Restore errors must distinguish:

- Invalid JSON
- Unsupported version
- Storage quota / backup too large
- Missing required structure
- Corrupt attachment data
- User cancellation

## Restore Confirmation Summary

Before replacing current data, show:

- Backup version
- Export date
- Vehicles
- Fuel Records
- Maintenance Records
- Insurance Records
- Acquisition Records
- Attachments
- Warning that restore replaces local data

## Post-Restore Requirements

After restore:

- Save data to current v2.1.0 structure
- Rebuild any derived statistics
- Confirm restore success
- Return to Home or Data Management screen
- Confirm version remains current

## Backup Filename Standard

Recommended filename:

```text
RGBM_Backup_v2.1.0_YYYY-MM-DD.json
```

## Non-Backup Formats

CSV is not a full backup.

CSV is for fuel/import/export workflows only unless otherwise specified.

XLSX import is deferred.

PDF is for reports/documentation only.
