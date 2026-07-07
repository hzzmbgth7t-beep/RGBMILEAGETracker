# RGBMileage v2.1.6u

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this release:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216u

## Purpose

This release is a menu-only Home Screen correction intended to strengthen standalone/Home Screen detection and apply the bottom menu lock specifically to standalone mode.

## Release Type

Home Screen Menu Detection Lock

## Source Build

- current source build: `v2.1.6s`

## Controlling Evidence

- Home Screen screenshot showing the menu still floating above the bottom edge in `v2.1.6s`
- Safari screenshot used only to distinguish browser behavior from Home Screen behavior

## Allowed Changes Only

- bottom menu location logic
- Home Screen environment detection as needed for the menu correction
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
3. Safari behavior may differ, but Home Screen mode is the target
4. nothing above the menu changes
5. app shows `v2.1.6u`
