# Changelog — RGB Mileage v2.1.3e

Date: 2026-06-08
Type: Stabilization patch
Base: v2.1.3d

## Changed

- Updated app version metadata to v2.1.3e.
- Updated build date metadata to 2026-06-08.
- Changed previous-record long press threshold from 500ms to 750ms.
- Added record-specific navigation routing to prevent record-session history from controlling Back behavior.

## Fixed

- Previous-record tap now opens View.
- Previous-record long press opens Edit.
- Edit screen focus/top position is restored after long press.
- Cancel button restored beneath Save on Fuel, Maintenance, and Insurance Edit screens.
- Home screen vertical bounce/movement stabilization applied only to the main/Home screen.

## Preserved

- Content screen scrolling.
- Existing quick-add Cancel button placement.
- Existing View / Quick Add layouts.
- Existing Previous Records headers.
- Existing data model and storage key.

## Deferred

- Previous Record button.
- Session record-history workflow.
- Side-by-side Save/Cancel layout.

