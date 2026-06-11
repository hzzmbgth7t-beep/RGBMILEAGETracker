# RGB Mileage Tracker

Version: **v2.1.3oc**  
Release type: **Field Parity Release**

## Purpose
This release completes field parity work for Maintenance and Insurance before any section-screen consolidation. The goal is to ensure that the current separate View and Edit screens display the same intended user-facing record data while preserving existing screen behavior.

## What This Release Changes

### Maintenance
The following fields are now intended to appear on both View and Edit screens:
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
The following fields are now intended to appear on both View and Edit screens:
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

## Insurance Field Presentation
Insurance presentation is aligned toward the simplified field model:
- **Agency** is the primary visible organization field
- **Agreed Value** is the primary visible value field
- **Notes** is the single visible notes field

## What This Release Does Not Change
This release does **not**:
- merge View and Edit screens
- introduce unified Empty / View / Edit section states
- redesign tap / long-press behavior
- change the current section navigation model
- introduce broader responsive UI changes

## Current Live URL
Active URL:
`https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/`

Active cache-buster URL:
`https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=213oc`

Repository:
`https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker`

## Release Notes
Use this version as the field-parity checkpoint in the staged rollout:
- parity first
- cleanup/migration second
- section unification later
- shared prompt/state polish after that

## Historical README Content

# RGB Mileage

Version: v2.1.3oc
Build Date: 09/06/26
GitHub Pages URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
Cache-Buster URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=213oc
GitHub Repository URL: https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker

## Current Release Information

v2.1.3oc is a follow-on corrective build derived from v2.1.3oa.

Scope of this build:
- Preserve the stabilization work from v2.1.3oa.
- Correct back-navigation behavior for record and report flows.
- Add unsaved-changes protection for record edit screens.
- Keep the existing app structure and user workflows.
- Update all release documentation in sync with the build.

Included corrections and improvements:
- Back from Fuel, Maintenance, and Insurance record view/edit now returns to the true previous screen instead of cycling through records opened from the current screen.
- Back from a report detail now returns to the Reports screen.
- Back from the Reports screen returns to the prior screen, which is typically Home in the standard flow.
- Record edit screens now warn about unsaved changes and offer Save or Discard before leaving.
- Version labels, cache-buster references, and release notes were synchronized for this build.

Compatibility:
- Intended to run in modern desktop browsers and iOS Safari.
- Browser storage remains local to each browser/device.

## Release Control Rule

To avoid version-label inconsistencies, every future build must follow this rule:

1. Set the version once in the codebase source of truth.
2. Update all visible version references, cache-buster values, manifest/service-worker labels, and release documentation in the same change set.
3. Verify the package before release so only the current version appears active.
4. Do not package a build until code, docs, deployment references, and visible labels all match.

## Current Active URLs
- GitHub Pages: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
- Cache-Buster: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=213oc
- Repository: https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker

## Historical README Notes

Previous README details and older release references should be retained here as historical notes only.
