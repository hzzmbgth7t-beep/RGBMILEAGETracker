# Fix Notes

**Build:** `v2.1.6l-wc10-f17`  
**Build date:** `08/01/2026`  
**Governance:** `v1.7`

F14 used equal grid columns and rows. That layout was valid and collision-free, but its rectangular width rule prevented the staggered circles from using their true diagonal separation.

F17 changes only portrait circle geometry:

```text
        upper-right circle
primary circle
        lower-right circle
```

- all three circles retain one shared diameter
- upper-right and lower-right centers use their safe vertical limits
- the primary center remains exactly between them
- each candidate diameter is rejected if any circle, label, or edge clearance fails
- the first valid diameter found from largest to smallest is used
- labels remain fixed-height, two-line blocks beneath their circles
- symmetric top, bottom, left, and right insets remain after sizing

At the representative 410 × 817 rendered vehicle region, the common diameter is 228 pixels rather than the earlier 187-pixel rectangular-column limit.

F16 update-control placement and behavior are locked. No landscape, viewport, offline, data-storage, backup, recovery, or menu behavior changed.

Cache URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f17
