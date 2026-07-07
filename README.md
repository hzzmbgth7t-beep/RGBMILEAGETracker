# RGBMileage v2.1.7

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this release:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=217

## Purpose

This release abandons the prior layered menu-fix method and introduces a radical Home Screen standalone shell with a dedicated bottom menu rail.

## Release Type

Radical Home Screen Shell / Bottom Rail Rebuild

## Source Build

- source build: `v2.1.6v`

## Controlling Evidence

- installed Home Screen screenshots from `v2.1.6s`, `u`, and `v`
- repeated failure of the legacy menu override path

## Build Method

This version does **not** continue the old menu override chain.  
It creates:
- a dedicated Home Screen standalone content shell
- a dedicated Home Screen standalone bottom menu rail

The goal is to bypass the legacy bottom-boundary reservation logic for Home Screen mode rather than continuing to fight it with more overrides.

## Allowed Changes

- Home Screen standalone shell structure
- Home Screen bottom menu rail structure
- Home Screen bottom boundary logic
- internal safe-area handling inside the menu rail

## Do Not Change Intentionally

- title styling
- version line styling
- circles
- labels
- label chrome/effect
- label wrapping
- background
- vehicle images
- menu icon arrangement
- menu text labels

## Acceptance Standard

1. Home Screen menu touches the visible bottom edge
2. no unused blank space exists beneath the menu
3. safe-area handling is internal to the menu rail
4. Home Screen above-menu content remains substantially preserved
5. app shows `v2.1.7`
