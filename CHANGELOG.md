# Changelog

## v2.1.6l-wc10-f20 — 08/02/2026

- Built directly from accepted `v2.1.6l-wc10-f19`.
- Replaced the F19 portrait grid spacing path with one coherent portrait solver.
- Solves left, upper-right, and lower-right Home circle coordinates together.
- Maximizes one equal shared portrait circle diameter.
- Moves the right-side centers inward vertically through constraint solving instead of fixed offsets.
- Uses rendered display-label bounds, including Custom Label output, as solver input.
- Reports the next larger rejected diameter and the limiting constraint in Home diagnostics.
- Preserves Home landscape layout and all non-Home/menu/data/offline/update behavior from F19.

Cache URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f20


## v2.1.6l-wc10-f19 — 08/02/2026

**Governance:** `v1.7`  
**Classification:** ACCEPTED SOURCE BASELINE FOR F20

- Normalized every non-Home bottom menu to the accepted 58-pixel Home menu height.
- Added the 50-character `Custom Label` vehicle field.
- JSON backup and restore preserve custom labels; CSV behavior is unchanged.
- Device acceptance later confirmed by the user and supersedes the earlier pending audit note.
