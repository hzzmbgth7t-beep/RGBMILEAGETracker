# WC-10 Three-Vehicle Home Layout Specification

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat02`  
**Date:** 2026-07-25  
**Classification:** CURRENT  
**Status:** IMPLEMENTED  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat2

## Geometry inputs

The runtime measures:

- visual viewport width and height
- application padding
- Home header height
- dock height
- orientation

## Portrait calculation

- lower width limit is half the usable width after one column gap
- the top circle uses up to 94% of usable width
- label heights and row gap are removed from the circle-height budget
- the top circle remains at least 25% larger when geometry is constrained

## Landscape calculation

```text
widthLimit =
  (contentWidth - 2 × columnGap) / 3

heightLimit =
  vehicleAreaHeight - labelHeight

sharedDiameter =
  floor(min(widthLimit, heightLimit))
```

## Invariants

- all circles remain circular
- lower portrait diameters are equal
- all landscape diameters are equal
- selection does not change dimensions
- labels remain inside their allocated rows
