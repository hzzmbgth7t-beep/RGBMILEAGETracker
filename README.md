# RGBMileage v2.1.6v

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this release:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216v

## Purpose

This release is a menu-only root-cause correction for the Home Screen bottom boundary.

## Release Type

Home Screen Menu Root-Cause Cleanup

## Source Build

- current source build: `v2.1.6u`

## Controlling Evidence

- Home Screen screenshot showing blank space still beneath the menu in `v2.1.6u`

## Allowed Changes Only

- bottom menu location logic
- Home Screen standalone container bottom reservation cleanup
- internal safe-area handling inside the menu only

## Do Not Change

- title
- version line
- circles
- circle sizes
- circle positions
- labels
- label size
- label chrome/effect
- label wrapping
- background
- vehicle images
- spacing above the menu
- menu icon arrangement
- menu text labels

## Acceptance Standard

1. Home Screen menu touches the visible bottom edge
2. no unused blank space exists beneath the menu in Home Screen mode
3. nothing above the menu changes
4. app shows `v2.1.6v`
