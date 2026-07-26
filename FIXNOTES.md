# WC-10 Flat02 Fix Notes

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat02`  
**Date:** 2026-07-25  
**Classification:** CURRENT  
**Status:** CURRENT  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat2

## Confirmed flat01 failure

The device screenshots showed:

- all circles stacked vertically in portrait
- all circles stacked vertically in landscape
- hidden labels
- dock overlap
- a narrow centered landscape application column

The cause was the unchanged two-vehicle Home CSS and retained portrait restrictions.

## flat02 correction

- Old Home/circle/dock selector ownership was removed before the new contract was added.
- Portrait and landscape use separate governed grid definitions.
- Runtime geometry measures the actual viewport, header, application padding, and dock.
- Circle sizes are written through CSS variables.
- Labels and dock clearance are included in the calculation.
- Data migration and record ownership logic are unchanged.
