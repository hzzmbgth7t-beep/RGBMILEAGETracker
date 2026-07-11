# RGBM WC-08 Implementation Diff Report

## Source
Fresh extraction of locked baseline `v2.1.6l`.

## app.js
- Added `DISPLAY_VERSION="2.1.6l-wc08"` while retaining baseline schema version.
- Replaced old bottom-nav renderer with semantic bottom-dock markup.
- Replaced old Home renderer with header + two vehicle units.
- Added deterministic circle sizing and geometry diagnostics.
- Added Settings diagnostics control.
- Preserved routes, state model, and non-Home business logic.

## styles.css
- Removed all duplicated blocks for `#app`, `.screen.home`, `.home-head`, `.vehicle-area`, `.circleBtn`, `.vehicle-label`, and old bottom-nav selectors.
- Removed old bottom-nav pseudo-element fillers.
- Added one centralized fixed-clearance system.
- Added one portrait Home layout and one landscape Home layout.
- Added one bottom-dock contract.
- Added one neutral chrome material family.

## Explicitly not reused
No WC-01 through WC-07 implementation code or CSS was used as source.
