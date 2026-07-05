# RGBMileage v2.1.6k

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this release:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216k

## Purpose

This release corrects origin precedence so converted undated legacy records resolve to **Migration** instead of **Other Data**.

## Release Type

Migration Precedence Correction

## What This Release Changes

This release updates shared origin assignment for Fuel and Maintenance.

Corrected rule:
- if a Fuel or Maintenance record has no date
- treat it as **Migration**

This rule now takes precedence over older import-style markers for those undated legacy records.

## Stable Behavior Preserved

- stored origins remain:
  - Manual Entry
  - Migration
  - Other Data
- CSV import still asks:
  - Migrated Data
  - Other Data
- Manual Entry remains stored but hidden as a badge
- Restore still does not overwrite existing origin

## Review Focus

1. Undated converted Fuel records show Migration
2. Undated converted Maintenance records show Migration
3. Dated imported non-migration records can still show Other Data where appropriate
4. App shows v2.1.6k
