# WC-10 Flat Upgrade Notes

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat01`  
**Date:** 2026-07-25  
**Classification:** CURRENT  
**Status:** CURRENT  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat1

The app reads valid `RGBM_DATA_v3` data first. Otherwise it migrates retained legacy data beginning with `RGBM_DATA_v213d`.

Migration is performed in memory, validated, written to `RGBM_DATA_v3_pending`, read back, promoted to `RGBM_DATA_v3`, and validated again. The legacy key is retained.

The canonical result contains exactly three explicit vehicle records and three unique `vehicleOrder` entries. Existing records remain attached by `vehicleId`.
