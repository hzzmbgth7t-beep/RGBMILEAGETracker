# CHANGELOG

## v2.1.6q - 2026-06-12
### Release Type
Mode-Aware Home Screen Correction

### Summary
Built a mode-aware Home Screen correction so Safari browser mode and Home Screen standalone mode no longer share one guessed layout.

### Changes
- Added explicit browser-mode vs standalone-mode detection
- Added Home Screen-specific standalone sizing
- Preserved chrome title and chrome circle labels
- Kept changes isolated to Home Screen selectors and mode detection support
