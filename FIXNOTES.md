# FIXNOTES

App Site Address: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Current Version: 2.1.2a
Release Date: 2026-06-05

## v2.1.2a Fix Notes

- Tightened Home Screen layout to keep version/build date visible without scrolling.
- Moved bottom navigation flush to the bottom while preserving safe-area padding.
- Added Edit Vehicle image preview when a primary image exists.
- Increased default image fill inside circular vehicle display to avoid square-edge visibility.
- Added previous-record sort helper using date, odometer for undated fuel/maintenance records, entry sequence, and timestamps.
- Retained working Swap Vehicles button and removed Move Up / Move Down from current implementation scope.

## Verification Required

- Home Screen visible without scrolling.
- No blank space below navigation bar.
- Edit Vehicle shows current image.
- Fuel and Maintenance records sort newest/highest-odometer first where undated.
