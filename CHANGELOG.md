# CHANGELOG

App Site Address: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Current Version: 2.1.2d
Release Date: 2026-06-06

## v2.1.2d

### Fixed
- Restore failure caused by Safari localStorage quota after repeated app versions.
- Replace restore now clears stale RGB Mileage storage keys before writing restored data.
- saveData now retries after old-cache cleanup if quota is exceeded.
- Restore confirmation now displays normal line breaks instead of literal backslash-n.
- Added Clear Old Cached Storage button on Data Management screen.
