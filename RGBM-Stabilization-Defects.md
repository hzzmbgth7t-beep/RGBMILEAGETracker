# RGBM Stabilization Defects

**Governance version:** 1.1  
**Status:** APPROVED ACTIVE DEFECT REGISTER  
**Controlling baseline:** `v2.1.6l`

## D-HOME-001 — Integrated Home layout and bottom dock do not satisfy the approved visual contract

### Portrait failures observed

- Dock does not consistently read as a native bottom bar.
- Title remains too far below the Dynamic Island reference position.
- Circles do not maximize available height.
- Lower label can approach or touch dock-related lines.
- Labels do not consistently use chrome.
- Circle borders read as pale blue rather than chrome.

### Landscape failures observed

- Title remains too far below the top edge.
- Circles do not maximize available width and height.
- Some attempts stacked circles instead of placing them left/right.
- Some attempts allowed circles to crowd or touch the dock.
- Dock controls have appeared visually inconsistent.
- Circle borders and labels have not met the chrome material standard.

### Root-cause status

The baseline Home and nav surface contains historical assumptions and contradictory behavior from earlier adjustment cycles.

The accepted remedy is an integrated deterministic Home-and-dock implementation from the locked baseline.

### Negative evidence

- WC-01: nav-only cleanup had no successful effect.
- WC-02: Home-height change failed.
- WC-03: introduced larger gap and nav resizing.
- WC-04: diagnostics only; useful evidence.
- WC-05: vehicle alignment had partial effect only.
- WC-06: Home rebuild failed top placement, circle utilization, dock target, and chrome target.
- WC-07: dock rebuild failed the bottom-bar target and regressed Home behavior.

None of these working copies is an implementation source.

### Closure conditions

D-HOME-001 closes only when every mandatory portrait and landscape criterion passes:

- fixed title clearance
- maximum valid circle diameter
- attached circle/label movement
- fixed own-label clearance
- fixed inter-unit clearance
- fixed label-to-dock clearance
- left/right landscape layout
- true bottom dock ownership
- chrome title
- chrome labels
- chrome circle borders
- no overlap
- no contact
- no unexplained large unused region
