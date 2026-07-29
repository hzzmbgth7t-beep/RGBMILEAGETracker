# RGB Mileage Tracker — WC-10 flat07 recovery scroll

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat07`  
**Packaging governance:** `v1.5`  
**Status:** CONTROLLED RECONCILED RESTORE RETEST

## Review links

- Normal URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
- Cache-buster URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat7

## Purpose

flat07 corrects the flat06 Home Screen recovery interface:

- recovery is assigned its own route
- Home touch interception does not run on recovery
- the recovery app owns a dedicated iOS-style vertical scroller
- headings, filenames, labels, and buttons wrap inside the viewport
- horizontal overflow is eliminated rather than requiring horizontal scrolling

The reconciled candidate, source fingerprints, non-reduction checks, snapshot gate, archive transaction, and rollback logic are unchanged.

## Acceptance boundary

- executable tests: 140 PASS, 0 FAIL
- synthetic 430 × 932 touch/scroll audit: PASS
- actual iPhone standalone flat07: N/A
- production promotion: FAIL
