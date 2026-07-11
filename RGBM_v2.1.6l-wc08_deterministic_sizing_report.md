# RGBM WC-08 Deterministic Sizing Report

## Portrait formula

`diameter = min(heightLimit, widthLimit)`

Where:

- `heightLimit = (vehicleRegionHeight - bothLabelHeights - bothOwnLabelClearances - interUnitClearance) / 2`
- `widthLimit = viewportWidth - 2 * sideClearance`

## Landscape formula

`diameter = min(heightLimit, widthLimit)`

Where:

- `heightLimit = vehicleRegionHeight - tallestLabelHeight - ownLabelClearance`
- `widthLimit = (viewportWidth - 2 * sideClearance - centerClearance) / 2`

## Runtime behavior

The same diameter is applied to both circles through `--circle-diameter`.

Recalculation occurs on:

- initial Home render
- window resize
- orientation change
- visual viewport resize

## Shape guarantee

Circle width and height both derive from `--circle-diameter`; asymmetric growth is impossible under the WC-08 contract.
