# RGB Mileage Migration Plan v3.0.0

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat02`  
**Date:** 2026-07-25  
**Classification:** CURRENT  
**Status:** IMPLEMENTED  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat2

Storage keys:

- active: `RGBM_DATA_v3`
- pending: `RGBM_DATA_v3_pending`
- retained legacy: `RGBM_DATA_v213d`

Migration remains pure, idempotent, validated, transactional, and nontruncating. The Home correction does not change migration behavior.
