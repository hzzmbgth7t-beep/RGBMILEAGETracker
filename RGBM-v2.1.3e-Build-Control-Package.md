# RGB Mileage v2.1.3e Build Control Package

Build type: Stabilization patch
Base package: RGBM_v2.1.3d_2026-06-07.zip
Version: v2.1.3e
Build date: 2026-06-08

## Scope Lock

Included in this patch:

- D-046: Main/Home screen vertical movement and bounce stabilization.
- D-047: Record interaction correction.
  - Tap opens View.
  - Long press opens Edit.
  - Record long press duration is 750ms.
  - Long press to Edit returns focus to the edit form/top of the screen.
- D-048: Restore missing Cancel button on Edit screens only.
  - Fuel Edit.
  - Maintenance Edit.
  - Insurance Edit.
  - Layout remains Save followed by Cancel beneath it.
- D-049: Orientation lock attempt retained/strengthened through manifest and runtime request.
- D-050: Back button returns to prior app screen/menu, not record-session history.
- Version metadata corrected to v2.1.3e / 2026-06-08.

Deferred:

- Previous Record button.
- Session record-history navigation function.
- New feature additions.
- Side-by-side Save/Cancel layout.

## Data Preservation Decision

The active localStorage key remains `RGBM_DATA_v213d` intentionally. This avoids creating a new empty storage bucket on upgrade and is intended to preserve existing local data across the v2.1.3d to v2.1.3e deployment.

