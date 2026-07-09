# RGBMileage v2.1.6l-wc05 Working Copy

**Status:** Baseline-derived correction working copy `v2.1.6l-wc05` (not a promoted release)

## Purpose
Apply the first correction supported by runtime evidence from standalone iPhone portrait.

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this working copy:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc05

## Root cause established
Runtime measurements proved the bottom nav is already flush to the viewport bottom. The visible issue is excess unused vertical space inside the Home content area above the nav. The most likely active cause is `.vehicle-area` vertical centering.

## What This Working Copy Changes
- Visible working-copy identity updated to `v2.1.6l-wc05`
- Keeps diagnostic tools from WC-04 for continued measurement
- Changes only `.vehicle-area` from `justify-content:center` to `justify-content:flex-start`
- Makes no nav, circle, label, shell, rail, or safe-area correction

## Test intent
Use this build to verify whether moving the Home content stack from centered placement to top-driven placement removes the perceived menu-gap issue without changing circles or labels.

