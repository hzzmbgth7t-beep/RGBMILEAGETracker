# RGBMileage v2.1.6j

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this release:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216j

## Purpose

This release refines the record-origin model and the CSV import workflow so the import feature asks what kind of data is being brought in, while stored/displayed origins better reflect what the records actually are.

## Release Type

Origin Model and Import Prompt Refinement

## What This Release Changes

This release updates the shared origin model used by Fuel and Maintenance.

Stored origins are now:
- Manual Entry
- Migration
- Other Data

Visible origin badges now display only when meaningful:
- Migration
- Other Data

Manual Entry remains stored but is not displayed as a badge.

Restore still must not overwrite an existing origin.

## Import Workflow Change

The CSV import feature now asks for the imported data type:
- Migrated Data
- Other Data

That choice sets the long-term record origin rather than using Import as both the action and the record label.

## Fallback Rule Preserved

If explicit origin metadata is missing and a current entry has no date, the record falls back to:
- Migration

## Review Focus

1. Manual Entry records show no Manual Entry badge
2. CSV import screen asks whether the import is Migrated Data or Other Data
3. Choosing Migrated Data produces Migration records
4. Choosing Other Data produces Other Data records
5. Undated legacy converted entries still resolve to Migration where appropriate
6. App shows v2.1.6j
