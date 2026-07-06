# RGBMileage v2.1.6n

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this release:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216n

## Purpose

This corrected reuse-version `v2.1.6n` package refines the Home Screen using the user's actual phone screenshot as the layout reference rather than a generic mockup.

## Release Type

Home Screen Phone-Referenced Size Refinement

## What This Release Changes

This release updates the **Home Screen only**.

Implemented:
- increased the Home Screen title by about 10%
- increased the Home Screen circle labels by about 10%
- increased the Home Screen circles further while preserving the approved top and bottom spacing intent from the user's actual phone screenshot
- rebalanced Home Screen spacing for the iPhone screen reference rather than a generic Safari/mockup approximation

## Important Version Rule

The version number remains `v2.1.6n` because prior `v2.1.6n` attempts were not accepted or implemented.

## Implemented Home Screen Targets

- title increased from `30px` to `33px`
- circle labels increased from `27px` to `30px`
- circle label minimum height increased from `34px` to `38px`
- circles increased from `min(42dvh,58vw,252px)` to `min(44dvh,61vw,268px)`

## Review Focus

1. title appears about 10% larger
2. circle labels appear about 10% larger
3. circles are larger while still respecting the approved spacing
4. top spacing and bottom spacing match the phone screenshot intent
5. app shows v2.1.6n
