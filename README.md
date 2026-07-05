# RGBMileage v2.1.6i

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this release:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216i

## Purpose

This release rolls the refined label model into Maintenance so Fuel remains the completed template and Maintenance becomes the next section using the shared framework before Insurance.

## Release Type

Maintenance Label Model Rollout

## What This Release Changes

This release updates **Maintenance only**.

Implemented:
- applies the shared refined origin model to Maintenance:
  - Manual Entry
  - Import
  - Migration
- Manual Entry remains stored but is not displayed as a badge
- only meaningful origin badges display:
  - Import
  - Migration
- Restore does not act as a permanent visible origin
- missing-origin undated current Maintenance entries fall back to Migration
- removes default Verified-style display from Maintenance by normalizing into the shared status model
- preserves meaningful Maintenance statuses already present:
  - Review
  - Historical
  - Archived

## Important Scope Boundary

Maintenance-specific Incomplete rules were not invented in this build because those criteria have not yet been separately locked.

So this rollout implements the shared framework and refined origin model for Maintenance without guessing new section-specific Incomplete rules.

## Stable Behavior Preserved

- Fuel refined label model from v2.1.6h
- Fuel save-time calculation
- Fuel delete workflow
- Fuel edit button layout
- shared metadata panel structure

## Review Focus

1. Manual Entry maintenance records show no Manual Entry badge
2. Legacy converted maintenance entries show Migration where appropriate
3. Missing-origin undated current Maintenance entries show Migration
4. Existing meaningful Review/Historical maintenance statuses are preserved
5. App shows v2.1.6i
