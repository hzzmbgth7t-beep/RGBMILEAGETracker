# RGBMileage v2.1.6s

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this release:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216s

## Purpose

This release performs a menu-only correction to lock the bottom navigation flush to the bottom edge of the visible screen.

## Release Type

Menu Bottom Lock

## Source Build

- current source build: `v2.1.6r`

## Controlling Scope

Change only the bottom navigation/menu position so it sits flush with the bottom edge of the visible screen.

If iPhone safe-area handling is required, it must be applied as internal padding inside the menu container, not as external margin or upward offset.

## Do Not Change

- title
- version line
- background
- vehicle images
- vehicle circles
- circle sizes
- circle positions
- labels
- label size
- label chrome/effect
- label wrapping
- spacing above the menu
- menu icon arrangement
- menu text labels

## Acceptance Standard

1. bottom menu touches the visible bottom edge
2. no unused blank space exists beneath the menu
3. menu background extends to the bottom of the screen
4. nothing above the menu changes
5. app shows `v2.1.6s`
