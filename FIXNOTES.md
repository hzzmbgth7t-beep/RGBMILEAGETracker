# RGB Mileage Tracker flat03 Fix Notes

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat03`  
**Status:** CURRENT  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat3

## Device defects corrected

flat02 device evidence showed:

- elliptical vehicle-detail images
- non-Home landscape content hidden behind the dock
- Back and dock controls temporarily failing hit tests
- Add Vehicle landscape sizing failure

## Root causes

- Home circle CSS was global.
- The fixed dock was inside the same scrolling application layer.
- Non-Home screens used the application element itself as the scroller.
- landscape sizing did not use a dedicated header/content/dock shell.

## flat03 implementation

- Home visuals now use `home-circle-visual`.
- Detail photos use `vehicle-detail-photo-frame`.
- Edit previews use `vehicle-edit-photo-frame`.
- Back and dock are direct application children.
- Only `non-home-scroll` scrolls.
- visual viewport height governs the non-Home shell.
