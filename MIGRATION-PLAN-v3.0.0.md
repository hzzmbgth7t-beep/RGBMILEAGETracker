# RGB Mileage Migration Plan v3.0.0

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat01`  
**Date:** 2026-07-25  
**Classification:** CURRENT  
**Status:** IMPLEMENTED  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat1

## Storage keys

- Active: `RGBM_DATA_v3`
- Pending: `RGBM_DATA_v3_pending`
- Retained legacy: `RGBM_DATA_v213d`

## Required guarantees

- no source mutation
- no silent truncation
- stable existing IDs
- one expected blank third position
- validated record ownership
- idempotent repeat migration
- retained rollback source
