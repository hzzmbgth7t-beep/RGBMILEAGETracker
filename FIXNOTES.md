# FIXNOTES — v2.1.6l-wc10-f26-rc1

Build: `v2.1.6l-wc10-f26-rc1`  
Status: `Release Candidate 1 / pending user validation`  
Cache: `216lwc10f26rc1`  
Source baseline: accepted `v2.1.6l-wc10-f25`  
Source SHA-256: `6aad843c7db5135c98bf476ecf73e897a336a0d6b9345cf800a887c8d975e212`

## Fix scope

This candidate adds computed odometer summary fields and mileage consistency warnings.

## Implementation notes

- Vehicle Detail now displays Last Refuel Mileage, Last Maintenance Mileage, and Current Mileage near Starting Odometer.
- Last Refuel Mileage is computed from active Fuel records with valid odometer values.
- Last Maintenance Mileage is computed from active Maintenance records with valid odometer values.
- Current Mileage is computed from the most recent valid dated mileage reading across Starting Odometer, Fuel records, and Maintenance records.
- Date/time ordering uses each record date and time where available, with deterministic fallback to entry sequence/modified order.
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
