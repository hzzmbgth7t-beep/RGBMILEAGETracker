# Changelog — v2.1.6l-wc10-f22

## v2.1.6l-wc10-f22 — 08/02/2026

- Built from verified F19 source baseline.
- F20 and F21 portrait failures are treated as negative evidence only.
- Replaced portrait-only Home geometry with asymmetric circle-first optimization:
  - larger middle/primary circle
  - smaller upper-right and lower-right circles
  - upper pushed upward
  - lower pushed downward
  - label-footprint collision checks
- Preserved landscape and locked non-Home functionality.
