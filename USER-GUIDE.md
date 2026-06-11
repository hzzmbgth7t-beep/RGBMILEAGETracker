# RGB Mileage

Version: v2.1.3ob
Build Date: 09/06/26

Last Updated:
v2.1.3ob
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
