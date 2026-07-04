# RGBMileage v2.1.6e

## Purpose

This release corrects the original v2.1.6e package and is the actual install package for the Fuel save-time calculation enhancement.

## Release Type

Fuel Save-Time Calculation Release

## What This Release Changes

This release updates **Fuel only**.

New Fuel behavior:
- At **Save**, if **Gallons** and **Total Cost** are entered but **Price/Gal** is blank, the app now offers:
  - **Calculate Value**
  - **Leave Field Blank**
  - **Cancel**
- At **Save**, if **Gallons** and **Price/Gal** are entered but **Total Cost** is blank, the app now offers:
  - **Calculate Value**
  - **Leave Field Blank**
  - **Cancel**
- If a previously **calculated** Fuel cost field is overwritten, the app offers:
  - **Change The Value**
  - **Keep The Value**
  - **Cancel**
- If a previously **calculated** Fuel cost field is cleared, the app offers:
  - **Leave Field Blank**
  - **Recalculate**
  - **Restore Original Value**

## Stable Behavior Preserved

This release keeps the accepted:
- Fuel merged screen
- Maintenance merged screen
- Insurance merged screen
- Previous Records scroll guard
- Fuel delete workflow added in v2.1.6d

## Scope

In scope:
- Fuel save-time calculation prompts
- calculated-field overwrite / clear handling
- Fuel source tracking for calculated vs entered cost fields

Out of scope:
- Maintenance calculation logic
- Insurance calculation logic
- Firebase/database migration
- cleanup/disconnection work
- broader UI redesign

## URLs

GitHub Pages URL:
https://<YOUR-GITHUB-PAGES-URL>/

Cache-buster URL for this release:
https://<YOUR-GITHUB-PAGES-URL>/?v=216e

## Install Notes

Use this corrected v2.1.6e package in place of the earlier v2.1.6e attempt.
The earlier v2.1.6e package should be treated as documentation-misaligned and not authoritative.

## Required Review Focus

1. Fuel save with Gallons + Total Cost and blank Price/Gal
2. Fuel save with Gallons + Price/Gal and blank Total Cost
3. Overwrite prompt for previously calculated values
4. Clear-field prompt for previously calculated values
5. Confirm Fuel / Maintenance / Insurance still behave as accepted

## Documentation Rule Reminder

All release documentation for this corrected package has been updated to match the actual change scope for v2.1.6e.
