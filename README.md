# RGB Mileage WC-10 Flat Migration-Verification Install

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat01`  
**Date:** 2026-07-25  
**Classification:** CURRENT  
**Status:** CONTROLLED DEVICE TESTING ONLY — NOT PROMOTED  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat1

This package rebuilds the tested WC-10 migration-verification code under Governance v1.2.

## Flat-package guarantee

- Every file is at the install root.
- There are no folders.
- The ZIP contains no directory entries or nested member paths.
- Test scripts, fixtures, documentation, audits, and reference ZIPs use root-level prefixed filenames.

## Implemented

- schema `3.0.0`
- stable `vehicleId`
- separate persistent `vehicleOrder`
- explicit blank third vehicle
- ID-based restore and save behavior
- migration evidence export
- three-position non-drag reorder controls
- privacy-safe migration comparison

## Acceptance boundary

Automated and archive tests are rerun for this exact flat package. Real iPhone standalone migration, relaunch, portrait, landscape, shell, dock, and production acceptance remain N/A or blocked until performed.
