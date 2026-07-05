# RGBMileage v2.1.6l

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this release:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216l

## Purpose

This release rolls the accepted shared origin model into Insurance so Fuel, Maintenance, and Insurance all use the same refined origin framework before any future section-specific status refinements.

## Release Type

Insurance Label Model Rollout

## What This Release Changes

This release updates **Insurance only**.

Implemented:
- applies the shared accepted origin model to Insurance:
  - Manual Entry
  - Migration
  - Other Data
- Manual Entry remains stored but is not displayed as a badge
- only meaningful origin badges display:
  - Migration
  - Other Data
- Restore does not act as a permanent visible origin
- undated legacy Insurance records resolve to Migration
- preserves meaningful Insurance statuses already present:
  - Review
  - Historical
  - Archived

## Important Scope Boundary

Insurance-specific Incomplete rules were not invented in this build because those criteria have not been separately locked.

So this rollout implements the shared framework and accepted origin model for Insurance without guessing new section-specific Incomplete rules.

## Stable Behavior Preserved

- Fuel accepted origin model and migration precedence
- Maintenance accepted origin model and migration precedence
- CSV import prompt:
  - Migrated Data
  - Other Data
- shared metadata panel structure

## Review Focus

1. Manual Entry insurance records show no Manual Entry badge
2. Undated legacy converted Insurance entries show Migration
3. True non-migration imported Insurance rows can still show Other Data where appropriate
4. Existing meaningful Review/Historical statuses are preserved
5. App shows v2.1.6l
