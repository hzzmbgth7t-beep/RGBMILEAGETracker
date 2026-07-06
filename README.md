# RGBMileage v2.1.6p

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this release:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216p

## Purpose

This release applies a controlled Home Screen correction using the user's actual phone screenshot as the controlling evidence.

## Release Type

Phone Screenshot Home Screen Correction

## Controlling Evidence

- User-provided iPhone Home Screen screenshot

## Locked Elements

- chrome styling on circle labels must match the title
- two-circle Home Screen structure
- top gap above the first circle
- bottom gap below the second label
- bottom menu structure
- Home Screen only; no section workflow changes

## Allowed Changes Only

- Home Screen title size
- circle size
- circle label size
- Home Screen vertical spacing

## Implemented Values

- title: `33px`
- circles: `min(44dvh,61vw,268px)`
- labels: `30px`
- label min-height: `38px`

## Review Focus

1. title is larger and still chrome
2. circle labels are larger and chrome
3. circles are larger
4. top and bottom spacing still match the phone screenshot intent
5. app shows `v2.1.6p`
