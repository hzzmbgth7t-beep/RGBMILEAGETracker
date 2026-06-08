# MIGRATION-PLAN-v2.1.0

Status: Final Planning
App: RGB Mileage
Target Version: v2.1.0
Based On: RGB Mileage Master Specification v1.0

## Purpose

Define how v2.1.0 handles existing app data and JSON backups created by v2.0.6 or later.

## Supported Migration Sources

v2.1.0 must support migration from:

- v2.0.6
- v2.0.7
- v2.0.8
- v2.0.9
- v2.0.10
- v2.0.11
- Future v2.x backups where technically possible

Versions before v2.0.6 are not required.

## Migration Strategy

Migration occurs during:

1. App load from existing local data
2. JSON restore from backup

The migrated result should be saved in the v2.1.0 structure.

## General Migration Rules

- Preserve existing data whenever technically possible.
- Never silently discard records.
- Add missing fields with safe defaults.
- Preserve vehicle slots and vehicle photos.
- Preserve fuel, maintenance, insurance, attachments, stations, and settings.
- Add Record IDs when missing.
- Add Entry Sequence values when missing.
- Add classificationTags array when missing.
- Add dataQuality when missing.
- Add source when missing.
- Add createdAt and modifiedAt when missing.

## Default Values for Missing Fields

| Field | Default |
|---|---|
| recordId | New generated unique ID |
| entrySequence | Next available global sequence |
| source | JSON Restore for restored data; System Generated for migration-created records |
| classificationTags | [] |
| dataQuality | Review for migrated/imported records unless clearly manual/verified |
| createdAt | Restore/migration timestamp |
| modifiedAt | Restore/migration timestamp |
| recordType | Derived from storage location |
| status | Active unless archived flag exists |

## Vehicle Migration

Existing vehicle fields map to v2.1.0 vehicle object.

Preserve:

- vehicleId/id
- slot
- year
- make
- model
- badge
- primaryPhoto/photo
- photo zoom/crop values
- active/archive status

If acquisition data exists as loose vehicle fields, create a Vehicle Acquisition Record.

Loose fields to migrate:

- acquisitionDate
- startingOdometer
- purchaseDate
- purchaseCost
- seller

## Vehicle Acquisition Record Migration

If an acquisition record does not exist but acquisition fields are present:

Create one VehicleAcquisition record.

Classification:
- Imported if from restore/import
- Historical if values appear partial or old

Data Quality:
- Review by default

## Fuel Record Migration

Map existing fuel entries to fuelRecords.

Preserve:

- date
- time
- odometer
- miles
- gallons
- mpg
- fuelGrade
- ethanolFree
- station
- fuelPricePerGallon
- totalFuelCost
- fuelCostSource
- notes
- attachments

If miles/mpg is missing or suspect, add Historical tag.

If record came from existing app data and appears complete, do not automatically mark Historical.

## Maintenance Record Migration

Map maintenance entries to maintenanceRecords.

Preserve:

- dates
- odometer
- category
- cost
- location
- provider
- notes
- attachments

If missing values could distort calculations, add Historical tag.

## Insurance Migration

Convert current insurance data into Insurance History records.

If vehicle contains only one current insurance block, create one insurance record.

Preserve:

- company
- policyNumber
- effectiveDate
- expirationDate
- insuranceValue/agreedValue
- premium if available
- attachments
- notes

## Attachment Migration

Preserve existing attachment data.

For each attachment, ensure:

- attachmentId
- sourceRecordId
- filename
- fileType
- createdAt
- data

Image re-optimization may be applied only if technically safe and does not corrupt data.

## Archived Record Migration

If older records used delete flags or archive flags, convert to:

```json
"classificationTags": ["Archived"]
```

Do not physically remove archived records.

## Historical Migration Rules

Historical tag should be added when a record has useful data but calculated values are missing, incomplete, or unreliable.

Examples:

- Fuel record has odometer but no prior odometer for miles calculation
- Fuel record has abnormal MPG suggesting missing prior fill-up
- Maintenance record has known cost but missing mileage
- Insurance record has known policy but incomplete premium/coverage data

## Backup Restore Migration

When restoring an older supported backup:

1. Parse JSON
2. Detect version
3. Normalize root structure
4. Migrate vehicles
5. Migrate acquisition records
6. Migrate fuel records
7. Migrate maintenance records
8. Migrate insurance records
9. Migrate attachments
10. Validate required fields
11. Show restore summary
12. Replace current database after user confirmation

## Migration Error Handling

Do not silently discard bad records.

If a record cannot be fully migrated:

- Preserve raw values where possible
- Set dataQuality to Review
- Add Historical tag if needed
- Add migration note
- Include warning in restore summary

## Migration Summary

After migration/restore, show:

- Vehicles migrated
- Acquisition records created
- Fuel records migrated
- Maintenance records migrated
- Insurance records migrated
- Attachments migrated
- Records flagged Historical
- Records flagged Review
- Errors
- Warnings

## Rollback Behavior

Before replacing current local data during restore, require user confirmation.

If restore fails before replacement, keep current data unchanged.

If restore succeeds, current data is replaced.

## Testing Requirements

Test restore/migration with:

- v2.0.6 backup
- v2.0.7 backup
- v2.0.8 backup
- v2.0.9 backup
- v2.0.10 backup
- v2.0.11 backup where available

Also test:

- Missing Record IDs
- Missing Entry Sequence
- Missing classificationTags
- Missing dataQuality
- Existing vehicle photos
- Large attachments
- Archived records
- Historical fuel records
