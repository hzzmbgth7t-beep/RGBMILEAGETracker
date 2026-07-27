# RGB Mileage Tracker flat05 Fix Notes

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat05`  
**Status:** CURRENT  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat5

## flat04 failure

The fixed-height recovery app layer did not scroll in the installed Home Screen app, leaving the snapshot control unreachable.

## flat05 correction

- `body.recovery-active` uses normal document flow.
- Recovery height is `auto`, with `min-height: 100svh`.
- The app is relative and uses `overflow: visible`.
- The document owns vertical scrolling.
- The warning card is compact.
- Snapshot controls precede storage inspection.
- Direct recovery actions remain disabled when they would omit vehicles or records.

## Data-safety correction

The displayed standalone state has more operational records than the Safari backup. The next safe step is snapshot collection and reconciliation, not replacement.
