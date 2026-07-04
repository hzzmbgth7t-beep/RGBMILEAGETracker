# RGBMileage v2.1.6f

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this release:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216f

## Purpose

This release adjusts the Fuel edit-screen button layout after walkthrough review.

## Release Type

Fuel Edit Button Layout Adjustment

## What This Release Changes

This release updates **Fuel Edit mode only**.

For existing Fuel records in Edit mode:
- Row 1: **New** | **View**
- Row 2: **Delete** | **Save**
- Row 3: blank | **Cancel**

## Stable Behavior Preserved

This release keeps the accepted:
- Fuel save-time calculation behavior from v2.1.6e
- Fuel delete workflow
- Maintenance merged screen
- Insurance merged screen
- Previous Records scroll guard

## Scope

In scope:
- Fuel edit-screen button order/layout adjustment for existing records

Out of scope:
- Maintenance button layout changes
- Insurance button layout changes
- Firebase/database migration
- cleanup/disconnection work
- broader UI redesign

## Required Review Focus

1. Open an existing Fuel record in Edit mode
2. Confirm Row 2 is **Delete** on the left and **Save** on the right
3. Confirm Row 3 is blank on the left and **Cancel** on the right
4. Confirm Save still works
5. Confirm Delete still opens the same confirmation modal
