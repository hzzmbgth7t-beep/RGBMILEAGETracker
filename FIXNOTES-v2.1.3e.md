# Fix Notes — RGB Mileage v2.1.3e

## Summary

v2.1.3e is a targeted stabilization patch created from v2.1.3d. It addresses record interaction regressions, Home screen bounce, missing Edit-screen Cancel buttons, Back behavior, and version/build-date metadata.

## Deployment Verification

Use the following checklist after upload to GitHub Pages:

- GitHub files uploaded.
- GitHub Pages deployment complete.
- Open using cache-buster URL.
- Version displays as v2.1.3e.
- Build date displays as 2026-06-08.
- Existing data remains visible without restore.
- If data is missing, import the latest reference backup and log as D-051.
- Home Screen app refreshed/recreated.
- Home Screen app version matches browser version.

## D-046 Verification

Home Screen:

- No horizontal movement.
- No vertical movement.
- No bounce.
- No drift.
- Double-tap does not shift screen.
- Navigation bar remains attached to bottom edge.
- No new white-space issue.

Content Screens:

- Vehicle screens scroll correctly.
- Fuel screens scroll correctly.
- Maintenance screens scroll correctly.
- Insurance screens scroll correctly.
- Reports scroll correctly after report is opened.
- No horizontal movement.

## D-047 Verification

For Fuel, Maintenance, and Insurance previous records:

- Tap opens View.
- Long press opens Edit.
- Long press feels closer to 750ms than 500ms.
- Long press lands at the Edit form/top of screen.
- Tap does not open Edit.
- Long press does not open View.

## D-048 Verification

Edit screens only:

- Fuel Edit has Save and Cancel.
- Maintenance Edit has Save and Cancel.
- Insurance Edit has Save and Cancel.
- Cancel remains beneath Save.

## D-049 Verification

- App remains portrait in normal iPhone/Home Screen use.
- If rotation still occurs, keep D-049 open as platform-limited or unresolved.

## D-050 Verification

- Back returns to the previous app screen/menu.
- Back does not cycle through every record opened during the session.
- Previous Record button is not present in v2.1.3e.

