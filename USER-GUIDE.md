# WC-10 Flat Controlled-Test User Guide

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat01`  
**Date:** 2026-07-25  
**Classification:** CURRENT  
**Status:** CURRENT  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat1

## Migration evidence

1. Launch the standalone app.
2. Open Settings.
3. Confirm three vehicle positions are shown.
4. Confirm `Current check: PASS`.
5. Confirm `Migration acceptance: PASS`.
6. Download the migration-evidence JSON.
7. Close and relaunch the standalone app.
8. Download a second evidence JSON.

Do not configure the new Jeep before the first evidence file passes.

## Blank third vehicle

The unconfigured third position shows `Add Vehicle` and opens vehicle setup. It must not appear in operational import selectors or configured-vehicle reports.

## Reordering

Settings provides Move Up and Move Down. Reordering changes display position, not vehicle identity or record ownership.
