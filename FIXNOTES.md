# RGB Mileage Tracker flat07 Fix Notes

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat07`  
**Status:** CURRENT  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat7

## Root cause

The recovery CSS was not the only scroll controller. The application still held `route.screen === "home"`, and the Home stabilization listener prevented every `touchmove`.

Long recovery strings also expanded their minimum-content width and were clipped by horizontal overflow protection.

## Correction

- set `route.screen` to `recovery`
- bypass Home touch prevention while recovery is active
- explicitly override inline shell styles
- use a fixed recovery viewport with `overflow-y: scroll`
- keep the body locked behind the recovery viewport
- force every recovery child to shrink and wrap
- keep horizontal overflow hidden because horizontal scrolling is not required
