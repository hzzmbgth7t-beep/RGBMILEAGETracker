# RGB Mileage

Version: v2.1.3ob
Build Date: 09/06/26
GitHub Pages URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
Cache-Buster URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=213ob
GitHub Repository URL: https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker

## Current Release Information

v2.1.3ob is a follow-on corrective build derived from v2.1.3oa.

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
- Cache-Buster: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=213ob
- Repository: https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker

## Historical README Notes

Previous README details and older release references should be retained here as historical notes only.
