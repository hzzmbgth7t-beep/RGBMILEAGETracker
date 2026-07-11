# RGBM Deterministic Layout Algorithm

**Version:** 1.0  
**Status:** APPROVED FOR IMPLEMENTATION

## Inputs

- viewport width
- viewport height
- safe-area top
- safe-area bottom
- orientation
- title measured height
- version-line measured height
- label measured heights
- dock measured height
- fixed design clearances
- side margins

## Fixed design constants

- portrait top-title clearance
- landscape top-title clearance
- title-version clearance
- version-circle clearance
- circle-own-label clearance
- portrait inter-unit clearance
- lower-label-dock clearance
- landscape center clearance
- side clearance

These values are established from the approved visual reference and remain constant during resizing.

## Portrait calculation

1. Measure viewport and safe areas.
2. Calculate dock top edge.
3. Place title at:
   `safeAreaTop + portraitTopTitleClearance`
4. Place version line below title using fixed title-version clearance.
5. Define usable vehicle region from:
   `versionBottom + versionCircleClearance`
   to
   `dockTop - lowerLabelDockClearance`
6. Subtract:
   - two label heights
   - two circle-own-label clearances
   - one inter-unit clearance
7. Divide the remaining height by two.
8. Apply side-width limit:
   `viewportWidth - 2 * sideClearance`
9. Circle diameter is:
   `min(heightDerivedDiameter, widthDerivedDiameter)`
10. Place the upper vehicle unit.
11. Place the lower vehicle unit.
12. Verify all fixed clearances.
13. Reduce diameter only if verification fails.

## Landscape calculation

1. Measure viewport and safe areas.
2. Place title using fixed landscape top clearance.
3. Place version line below title.
4. Define vehicle region above the dock.
5. Split available width into left and right regions after subtracting:
   - side clearances
   - center clearance
6. Calculate height-limited diameter from:
   - header bottom
   - label height
   - own-label clearance
   - label-to-dock clearance
7. Calculate width-limited diameter from each side region.
8. Circle diameter is:
   `min(heightDerivedDiameter, widthDerivedDiameter)`
9. Use the same diameter for both circles.
10. Preserve portrait diameter when it equals the maximum valid landscape diameter.
11. Place Vehicle 1 left and Vehicle 2 right.
12. Verify all boundaries.
13. Recalculate on resize or orientation change.

## Shape rule

A circle is always rendered with equal width and height.

When growth reaches a limit:

- the vehicle unit may reposition if all clearances remain valid
- the circle may not continue growing in only one axis
- no oval or stretched state is permitted
