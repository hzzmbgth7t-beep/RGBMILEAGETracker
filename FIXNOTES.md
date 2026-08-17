# FIXNOTES — v2.1.6l-wc10-f26

Build: `v2.1.6l-wc10-f26`  
Status: `Accepted baseline`  
Cache: `216lwc10f26`  
Source baseline: accepted `v2.1.6l-wc10-f25`  
Source SHA-256: `6aad843c7db5135c98bf476ecf73e897a336a0d6b9345cf800a887c8d975e212`

## Fix scope

This version adds computed odometer summary fields and mileage consistency warnings.

## Implementation notes

- Vehicle Detail now displays Last Refuel Mileage, Last Maintenance Mileage, and Current Mileage near Starting Odometer.
- Last Refuel Mileage is computed from active Fuel records with valid odometer values.
- Last Maintenance Mileage is computed from active Maintenance records with valid odometer values.
- Last Refuel, Last Maintenance, and Current Mileage use dated-first logic.
- Dated entries are preferred and selected by most recent date/time.
- Undated entries are ignored while dated readings exist.
- If no dated readings exist for a field, the highest undated mileage is used as a fallback.
- Mileage Error warnings are informational only and do not block saving.
- A warning is raised when a newer dated odometer reading is lower than an older dated reading.
- Affected Fuel and Maintenance record pages display their related Mileage Error warnings.

## Unchanged scope

No Home geometry, CSS layout overhaul, data schema migration, backup/restore change, CSV import change, or service-worker strategy change is intended.

## Validation focus

- Confirm Vehicle Detail shows the three new odometer fields near Starting Odometer.
- Confirm Last Refuel Mileage updates after adding/editing/deleting Fuel records.
- Confirm Last Maintenance Mileage updates after adding/editing/deleting Maintenance records.
- Confirm Current Mileage follows the most recent valid dated reading.
- Confirm Mileage Error appears when a newer dated reading is lower than an older dated reading.

## F26 correction

- No-date entries do not generate mileage-order warnings.
- Mileage-order warnings compare dated readings only.
- Affected Fuel and Maintenance odometer fields are highlighted yellow.
- Affected previous-record rows are highlighted yellow on Fuel and Maintenance pages.

## Release-process correction

- Every package is a full package unless a partial package is explicitly requested and approved before creation.
- Standard package filenames use `RGBMileage_<version>.zip` with no `FULL` and no date.
- README URLs are locked as the first README section after the title and must be updated every version.
