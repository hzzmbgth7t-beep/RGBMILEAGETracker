# RGB Mileage Tracker — WC-10 flat03

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat03`  
**Packaging governance:** `v1.5`  
**Status:** CONTROLLED DEVICE RETESTING ONLY

## Review links

- Normal application URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
- Cache-buster URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat3

## flat03 correction

flat03 preserves the accepted three-position Home layout and corrects the non-Home regressions found during device testing:

- vehicle-detail photos use a dedicated circular frame
- Home circle rules cannot affect detail or edit screens
- Back remains outside the scrolling content layer
- the dock remains outside the scrolling content layer
- non-Home landscape uses the available viewport
- Add Vehicle and vehicle-detail screens scroll between the fixed header and dock
- pointer hit testing remains active for Back and dock controls

## Clean installation

Upload exactly the 17 files at this archive’s root to a blank GitHub application folder.

Do not upload the support folders. Retain them locally for tests, evidence, maintenance, and future handoffs.

## Acceptance boundary

- Home three-position layout: retained
- Automated regression tests: PASS
- Synthetic non-Home browser geometry: PASS
- Real iPhone flat03 retest: N/A
- Third-vehicle entry: NOT STARTED
- Production promotion: FAIL
