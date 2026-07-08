# RGBM v2.1.7a Verification

## Controlling Evidence
- Installed iPhone 17 Pro Max Home Screen screenshot for v2.1.7
- Source code from v2.1.7

## Root Cause Confirmed
The dedicated standalone Home Screen shell existed in markup, but both `.home-content-shell` and `.home-menu-rail` were set to `display: contents`, which removed their layout boxes. In addition, standalone rules still allowed bottom safe-area padding within the rail path.

## Corrective Action
- Updated app version to v2.1.7a
- Removed the effective `display: contents` behavior by overriding both shell wrappers as real boxes in standalone Home Screen mode
- Rebuilt the standalone Home Screen as a three-row grid: header/content/menu
- Set the Home Screen bottom rail to a fixed 56px row
- Removed `env(safe-area-inset-bottom)` from the Home Screen bottom rail and menu padding
- Forced the Home Screen menu to render inside the dedicated rail instead of relying on the legacy global fixed menu path

## Evidence-Based Pass Conditions Checked in Code
- Home Screen shell has a real bottom row
- Home Screen menu rail is a real box with fixed height
- Menu rail ends at the shell bottom edge
- Home Screen rail no longer includes bottom safe-area padding
- Menu buttons render inside the fixed-height bottom rail

## Remaining User Validation
Final acceptance still requires user confirmation from the installed Home Screen screenshot on iPhone 17 Pro Max.
