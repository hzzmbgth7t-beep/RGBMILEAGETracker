## v2.1.3oc User Guide Addendum
Release type: **Field Parity Release**

### What changed in this version
This release improves field consistency in the current Maintenance and Insurance screens. The app still uses separate View and Edit screens for these sections, but more record details are now intended to appear consistently in both.

### Maintenance
Maintenance records now include these user-facing fields across the current screen set:
- Date
- Category
- Odometer
- Cost
- Location
- Provider
- Pickup Date
- Performed By
- Notes

### Insurance
Insurance records now include these user-facing fields across the current screen set:
- Agency
- Policy Number
- Effective Date
- Expiration Date
- Agreed Value
- Premium
- Agent
- Phone
- Email
- Notes

### Insurance field naming
Insurance screens are being aligned to a simpler naming model:
- **Agency** is used as the main organization field
- **Agreed Value** is used as the main value field
- **Notes** is the single user-facing notes field

### What did not change
This release does not change the basic screen flow:
- View and Edit remain separate screens
- tapping a record still opens View
- long pressing a record still opens Edit
- existing navigation patterns are intended to remain the same

### Purpose of this release
This version is part of a staged rollout. It prepares the app for later simplification by making sure the current screens expose the intended record information before any larger UI consolidation takes place.


# RGB Mileage

Version: v2.1.3oc
Build Date: 09/06/26

Last Updated:
v2.1.3oc
Build 09/06/26

## What This Build Changes
- Preserves the stabilization work from v2.1.3oa.
- Corrects back-navigation behavior for record and report flows.
- Adds unsaved-changes protection for record edit screens.
- Does not add new feature scope or redesign the app.

## Home Screen
- Tap vehicle circle: Quick Fuel Entry.
- Long press vehicle circle: Vehicle menu.

## Previous Records
- Tap record: View.
- Long press record: Edit.
- When opened from Vehicle, Back returns to Vehicle.
- Opening additional records from a record screen does not create a Back cycle through those records.

## Reports
- Open a report from the Reports screen to view it.
- Back from a report detail returns to Reports.
- Back from Reports returns to the previous screen, typically Home.

## Edit Screens
- If you press Back with unsaved changes, the app warns you and offers Save or Discard.
- If there are no changes, Back returns directly to the previous screen.

## Quick Fuel
- Cost Source saves the selected choice correctly.
- Required and invalid values are checked more consistently.

## Maintenance and Insurance
- Save flows include stronger basic validation.
- Insurance expiration date cannot be earlier than the effective date.

## Import / Export / Backup
- CSV preview/import retains sequence fallback behavior.
- Backup metadata matches the active build version.

## Browser Use
- The app is intended to run in modern desktop browsers and iOS Safari.
- Saved data is stored locally in the browser you use.
