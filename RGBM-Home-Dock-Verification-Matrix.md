# RGBM Home and Dock Verification Matrix

**Version:** 1.0  
**Status:** APPROVED  
**Allowed results:** `PASS`, `FAIL`, `N/A`

No result such as “better,” “partial,” or “close” is permitted.

## Portrait acceptance

| ID | Mandatory criterion | Evidence |
|---|---|---|
| P-01 | Dock background visually touches and owns the bottom edge | Standalone screenshot |
| P-02 | Dock safe-area region uses the dock background | Screenshot + runtime geometry |
| P-03 | Title matches the approved fixed Dynamic Island clearance | Screenshot comparison |
| P-04 | Version line maintains fixed spacing below title | Screenshot comparison |
| P-05 | Upper and lower vehicle units are vertically stacked | Screenshot |
| P-06 | Circles are 1:1 | Runtime geometry |
| P-07 | Circles use the maximum valid diameter | Runtime calculation record |
| P-08 | Each label remains attached to its own circle | Screenshot + DOM geometry |
| P-09 | Upper label maintains fixed clearance from lower circle | Runtime geometry |
| P-10 | Lower label maintains fixed clearance from dock | Runtime geometry |
| P-11 | No circle or label touches dock lines, shadows, borders, or highlights | Screenshot |
| P-12 | Title, labels, and circle borders use the approved chrome family | Screenshot comparison |
| P-13 | Circle borders read as neutral chrome, not light blue | Screenshot comparison |
| P-14 | No unexplained large unused vertical region remains | Screenshot + geometry |

## Landscape acceptance

| ID | Mandatory criterion | Evidence |
|---|---|---|
| L-01 | Dock background visually touches and owns the bottom edge | Standalone screenshot |
| L-02 | Title matches the approved fixed top-edge clearance | Screenshot comparison |
| L-03 | Vehicle 1 is left and Vehicle 2 is right | Screenshot |
| L-04 | Each vehicle unit is circle above label | Screenshot |
| L-05 | Circles are 1:1 | Runtime geometry |
| L-06 | Circles use the maximum valid diameter | Runtime calculation record |
| L-07 | Portrait diameter is retained only when already optimal | Calculation comparison |
| L-08 | Labels maintain fixed own-circle and dock clearances | Runtime geometry |
| L-09 | Circle borders and labels use approved chrome | Screenshot comparison |
| L-10 | Dock buttons remain normal, readable, and evenly aligned | Screenshot |
| L-11 | No vehicle unit overlaps or touches the dock | Screenshot + geometry |
| L-12 | No unexplained large unused region remains | Screenshot + geometry |

## Build authorization

Handoff is approved only when:

- every mandatory portrait criterion is `PASS`
- every mandatory landscape criterion is `PASS`
- package and documentation audits pass
- recipient confirms the archive is downloadable
