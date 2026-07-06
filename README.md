# RGBMileage v2.1.6q

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this release:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216q

## Purpose

This release applies a mode-aware Home Screen correction from the last accepted baseline.

## Release Type

Mode-Aware Home Screen Correction

## Controlling Evidence

- user-provided **Home Screen screenshot**
- Safari browser view is treated separately and must not control Home Screen sizing

## Locked Elements

- chrome title styling
- chrome circle label styling matching the title
- two-circle Home Screen structure
- top gap above the first circle
- bottom gap below the second label
- bottom navigation structure
- Home Screen only

## Allowed Changes Only

- Home Screen title size/position
- circle size
- circle label size
- Home Screen vertical spacing
- mode-aware layout handling for Safari browser vs Home Screen standalone

## Implemented Mode-Aware Layout

### Browser Mode
- title: `31px`
- circles: `min(41dvh,57vw,248px)`
- labels: `26px`

### Home Screen Standalone Mode
- title: `33px`
- circles: `min(46dvh,63vw,280px)`
- labels: `30px`

## Review Focus

1. Home Screen standalone mode shows the larger target layout
2. Safari browser mode remains usable without forcing Home Screen sizing assumptions
3. title is chrome
4. labels are chrome
5. app shows `v2.1.6q`
