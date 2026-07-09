# RGBMileage v2.1.6l-wc06 Working Copy

**Status:** Baseline-derived Home rebuild working copy `v2.1.6l-wc06` (not a promoted release)

## Purpose
Implement the first full Home-screen rebuild from the locked baseline with explicit portrait, landscape, responsive sizing, and shared chrome styling.

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this working copy:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc06

## What This Working Copy Changes
- Rebuilds the Home screen structure in `app.js`
- Rebuilds the Home-only CSS model in `styles.css`
- Places the title directly under the top safe-area / black top island region
- Uses a vertical vehicle stack in portrait
- Uses a left/right vehicle arrangement in landscape
- Auto-sizes circles to fit the available portrait and landscape space
- Uses the title chrome effect as the visual reference for title, circle borders, and vehicle labels
- Leaves bottom nav, `#app`, manifest behavior, service worker behavior, and non-Home screens unchanged
