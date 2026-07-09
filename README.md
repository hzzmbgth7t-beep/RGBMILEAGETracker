# RGBMileage v2.1.6l-wc04 Working Copy

**Status:** Baseline-derived diagnostic working copy `v2.1.6l-wc04` (not a promoted release)

## Purpose
This package is a diagnostic-only build created to capture runtime layout evidence in the controlling environment instead of applying another speculative menu or circle correction.

## URLs
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc04

## What This Working Copy Changes
- Adds explicit working-copy identity `v2.1.6l-wc04`
- Adds a runtime diagnostics overlay that can be toggled on demand
- Adds a diagnostics copy action in Settings
- Logs computed runtime layout evidence for `#app`, `.screen.home`, `.bottom-nav`, viewport metrics, and safe-area probe values
- Does **not** apply any menu-position or circle-sizing correction

## Diagnostic capture steps
1. Install and launch the Home Screen app in standalone mode on the target iPhone
2. Go to **Settings**
3. Tap **Copy Layout Diagnostics**
4. Return to **Home**
5. Tap the version subtitle **5 times** to toggle the debug overlay
6. Capture:
   - one screenshot with overlay visible
   - copied diagnostics text
   - any Safari Web Inspector computed-style notes if available

## Working-copy identity
- Visible app label: `v2.1.6l-wc04`
- Cache token / URL token: `216lwc04`
- Service worker cache: `rgbm-v2.1.6l-wc04-2026-06-12`

## Scope
This working copy is for diagnostics only. It is not a promoted release and should not be treated as a correction build.
