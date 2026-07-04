# DATA-MODEL-v2.1.0

Status: Final Planning
App: RGB Mileage
Target Version: v2.1.0
Based On: RGB Mileage Master Specification v1.0

## Purpose

Define the v2.1.0 data model before implementation so the build uses a controlled schema and does not rely on assumptions.

## Core Principles

- RGB Mileage is a vehicle record-preservation system.
- Records are preserved whenever possible.
- Vehicles and records are archived instead of hard deleted.
- Record ID is the primary identity field.
- Entry Sequence preserves order when dates are missing, duplicated, or unreliable.
- Historical data is preserved but excluded from normal calculations unless requested.

## Universal Record Fields

Every record type must include:

| Field | Required | Notes |
|---|---:|---|
| recordId | Yes | Globally unique, immutable |
| entrySequence | Yes | Global sequence, never reused |
| recordType | Yes | VehicleAcquisition, Fuel, Maintenance, Insurance |
| vehicleId | Yes | Links record to vehicle |
| source | Yes | Controlled source value |
| classificationTags | Yes | Array of tags |
| dataQuality | Yes | Verified, Review, Estimated |
| createdAt | Yes | ISO datetime |
| modifiedAt | Yes | ISO datetime |
| notes | No | Free text |

## Controlled Source Values

- Manual Entry
- CSV Import
- JSON Restore
- CJ7 Conversion
- System Generated

## Classification Tags

Stored as an array.

Allowed initial tags:

- Imported
- Historical
- Archived

Examples:

```json
["Imported", "Historical"]
```

```json
["Archived"]
```

## Data Quality Values

- Verified
- Review
- Estimated

Defaults:

| Scenario | Default |
|---|---|
| Manual Entry | Verified |
| Imported Entry | Review |
| Migrated/Restored Entry | Preserve existing; otherwise Review |
| System Generated | Verified unless derived from incomplete data |

## Vehicle Object

Vehicles are parent objects, not ordinary records.

Required fields:

| Field | Notes |
|---|---|
| vehicleId | Unique ID |
| slot | 0 or 1 for current two-circle layout |
| displayName | Derived or user-defined |
| nickname | Optional |
| year | Optional |
| make | Optional |
| model | Optional |
| badge | Initials/short label |
| status | Active or Archived |
| primaryPhoto | Optimized image data or reference |
| primaryPhotoZoom | Numeric |
| primaryPhotoOffsetX | Numeric |
| primaryPhotoOffsetY | Numeric |
| createdAt | ISO datetime |
| modifiedAt | ISO datetime |

## Vehicle Acquisition Record

Record type: VehicleAcquisition

Fields:

| Field | Notes |
|---|---|
| acquisitionDate | Date |
| startingOdometer | Numeric, two decimals |
| purchasePrice | Numeric, two decimals |
| seller | Text |
| attachments | Array |
| notes | Text |

Vehicle acquisition information is a preserved record, not loose vehicle metadata.

## Fuel Record

Record type: Fuel

Fields:

| Field | Notes |
|---|---|
| date | Editable date |
| time | Editable time |
| odometer | Numeric, two decimals |
| miles | Numeric, two decimals; manual allowed |
| gallons | Numeric |
| mpg | Numeric, two decimals; calculated from Miles / Gallons |
| fuelGrade | 87, 89, 90, 91, 93, Other, blank |
| ethanolFree | Yes/No/blank |
| station | Text |
| fuelPricePerGallon | Numeric, two decimals |
| totalFuelCost | Numeric, two decimals |
| fuelCostSource | Calculated or Entered Manually |
| attachments | Array |
| notes | Text |

Historical classification applies when mileage/MPG calculations are missing, suspect, or likely distorted by missing prior entries.

## Maintenance Record

Record type: Maintenance

Fields:

| Field | Notes |
|---|---|
| dropOffDate | Date |
| pickUpDate | Date |
| category | Text |
| status | Planned, Fix, Other |
| odometer | Numeric, optional |
| location | Text |
| serviceProvider | Text |
| performedBy | Shop, Self, Friend, Other |
| totalCost | Numeric, two decimals |
| lineItems | Optional array |
| attachments | Array |
| notes | Text |

Historical classification applies when partial maintenance records could distort maintenance totals, intervals, or cost-per-mile calculations.

## Insurance Record

Record type: Insurance

RGB Mileage uses an Insurance History model. Each policy period is a preserved record.

Fields:

| Field | Notes |
|---|---|
| company | Text |
| policyNumber | Text |
| effectiveDate | Date |
| expirationDate | Date |
| coverageValue | Numeric, two decimals |
| agreedValue | Numeric, two decimals |
| premium | Numeric, two decimals |
| agentName | Text |
| agency | Text |
| phone | Text |
| email | Text |
| coverageNotes | Text |
| attachments | Array |
| notes | Text |

## Attachment Object

Attachments may belong to Fuel, Maintenance, Insurance, Vehicle Acquisition, or future records.

Fields:

| Field | Notes |
|---|---|
| attachmentId | Unique ID |
| sourceRecordId | Parent record |
| filename | Original filename |
| fileType | MIME/file type |
| createdAt | ISO datetime |
| data | Stored data or local reference |
| optimized | Boolean for images |
| notes | Optional |

Image attachments must be optimized on import where practical:
- Longest side: 1200 px
- Approximate quality: 85%
- Store optimized copy only

## Archive Behavior

Archived records keep their existing record type and add:

```json
"classificationTags": ["Archived"]
```

Archived records:
- Are hidden by default
- Are excluded from standard reports
- Are excluded from calculations
- Are included in backups
- Are restorable

## Reporting Defaults

Default reports include records without Historical or Archived tags.

Default reports exclude:
- Historical
- Archived

Historical records may be included via report toggle.

Archived records should normally be restored before reporting.

## Open Implementation Notes

- v2.1.0 may implement only the fields needed for stabilization but must use names compatible with this model.
- Any missing field during migration must be created with a safe default.
