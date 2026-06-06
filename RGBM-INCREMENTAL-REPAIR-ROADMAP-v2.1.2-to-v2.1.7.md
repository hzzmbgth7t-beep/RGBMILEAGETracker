# RGBM-INCREMENTAL-REPAIR-ROADMAP-v2.1.2-to-v2.1.7.md

App Site Address:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Status: Locked
Purpose: Replace the prior monolithic v2.1.2 repair plan with a staged incremental correction roadmap.

## Governing Principle

Each version must repair one narrow subsystem or tightly related group of defects.

No unrelated new features may be added.

Each version must complete:
- Build
- Static review
- Device testing
- Defect log update
- Deployment verification

before the next version begins.

---

# v2.1.2 — Shell Repair

## Scope

Navigation:
- Navigation stack
- Back button
- Route parameters
- Cancel behavior
- Long-press suppression

Safe Area / App Shell:
- Dynamic Island safe area
- Bottom white area
- Footer placement
- Bottom navigation placement

## Excluded

- Home circle resizing beyond safe-area needs
- Vehicle ordering
- Image cropping
- Image editor
- Dropdown framework
- Reports
- Form layout redesign

## Acceptance Goal

Stable application shell.

---

# v2.1.3 — Home Screen Repair

## Scope

Home Screen:
- Entire screen visible
- No clipping
- No scrolling
- Largest possible circles after higher priorities are met

Priority Order:
1. Entire screen visible
2. No clipping
3. No scrolling
4. Largest possible circles

Vehicle Order:
- Move Up
- Move Down

Vehicle Actions:
- Tap vehicle circle = Quick Fuel Entry
- Long press vehicle circle = View Vehicle

## Acceptance Goal

Stable Home Screen and vehicle ordering.

---

# v2.1.4 — Image System Repair

## Scope

Vehicle Images:
- Upload
- Replace
- Remove
- Preview
- Pan
- Zoom
- Reset
- Save placement
- Restore placement
- Correct circle crop

## Acceptance Goal

Stable vehicle image subsystem.

---

# v2.1.5 — Forms & Dropdowns

## Scope

Form Layout:
- Vehicle
- Fuel
- Maintenance
- Insurance

Dropdown Framework:
- Add Once
- Add Permanently
- Edit Existing
- Global master lists

Affected dropdowns:
- Fuel Stations
- Fuel Grades
- Maintenance Categories
- Maintenance Providers
- Insurance Companies
- Insurance Agencies

## Acceptance Goal

Stable data-entry subsystem.

---

# v2.1.6 — Reports & Restore

## Scope

Reports:
- Fuel History
- Fuel Cost History
- MPG History
- Maintenance History
- Maintenance Cost Summary
- Insurance History
- Vehicle Summary

Filters:
- Vehicle
- Date Range
- Include Historical
- Include Archived

Restore Modes:
- Replace
- Update
- Duplicate
- Skip

## Acceptance Goal

Stable reporting and restore subsystem.

---

# v2.1.7 — Stabilization

## Scope

- Regression fixes only
- Documentation review
- Full acceptance test pass
- Deployment verification
- Final cleanup

## Acceptance Goal

Production candidate.

---

# Release Control

Before each release:
- Define exact scope.
- Confirm excluded items.
- Build only scoped corrections.
- Review against current locked documents.
- Run focused acceptance test for that version.
- Update defect tracker.
- Do not proceed to next version until current release is verified.
