# RGBMileage v2.1.6g

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this release:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216g

## Purpose

This release implements the Fuel-first label model cleanup and legacy Fuel record transition.

## Release Type

Fuel-First Label Model Cleanup

## What This Release Changes

This release updates **Fuel only**.

Implemented:
- removes **Verified** from the Fuel model
- introduces shared label framework fields for:
  - **Origin**
  - **Status / Condition**
  - **Lifecycle**
- applies the new framework to Fuel
- normalizes older Fuel records into the new model
- uses:
  - **Incomplete**
  - **Historical**
  - **Review**
  - **Archived**
- keeps the structure reusable for later Maintenance and Insurance rollout

### Fuel meanings
- **Incomplete** = newest active manual Fuel record missing Odometer or Gallons
- **Historical** = retained incomplete Fuel record that may distort calculations if treated as normal
- **Review** = Fuel record that already appears flagged as needing attention
- **Archived** = lifecycle only, hidden from normal Previous Records

## Transition Notes

Older Fuel records are normalized to:
- remove **Verified**
- preserve **Archived**
- preserve meaningful **Review**
- convert retained incomplete records to **Historical**
- keep normal complete records unlabeled

## Scope

In scope:
- shared label-model framework
- Fuel label assignment
- Fuel label display
- legacy Fuel transition

Out of scope:
- Maintenance label rollout
- Insurance label rollout
- Firebase/database migration
- broader UI redesign

## Review Focus

1. Complete manual Fuel record shows no unnecessary status label
2. New incomplete manual Fuel record shows **Incomplete**
3. Older retained incomplete Fuel record shows **Historical**
4. Archived Fuel record still disappears from normal Previous Records
5. Existing Fuel records no longer show **Verified**
6. App version shows **v2.1.6g**
