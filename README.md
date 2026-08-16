# RGBMileage v2.1.6l-wc10-f25-rc1

Build: `v2.1.6l-wc10-f25-rc1`  
Status: `Release Candidate 1 / pending user validation`  
Cache: `216lwc10f25rc1`  
Source baseline: accepted `v2.1.6l-wc10-f24`  
Source SHA-256: `f90fe95495b9aba00530e8ca47ab95f3d58014a0a1624788209237b2df09bb32`  
Accepted production baseline remains: `v2.1.6l-wc10-f24`

## Purpose

F25 RC1 is a full packaged maintenance/insurance action-parity release candidate built from the accepted F24 baseline. It corrects Maintenance record-list labeling and adds matching delete/archive/cancel choices for Maintenance and Insurance.

## URLs

Production URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-busting URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f25rc1

## Release status

This package is not the accepted production baseline until the user completes validation and explicitly accepts it. The accepted baseline remains `v2.1.6l-wc10-f24`.

## Changed scope

- Maintenance previous-record rows show date, category, and odometer when odometer data exists.
- Maintenance row/edit actions now include delete behavior matching Fuel.
- Insurance row/edit actions now include delete behavior matching Fuel.
- Delete choices are aligned for Fuel, Maintenance, and Insurance: Delete Permanently, Archive Instead, and Cancel.
- Cache-busting deployment URL is included for this candidate.

## Locked behavior

Home geometry, CSS, data schema/storage, backup/restore, CSV behavior, offline service worker model, Custom Label behavior, viewport behavior, 58 px menus, and package structure remain outside this change scope.

## Rejected-build handling

F20, F21, F22, and F23 remain rejected portrait failure evidence only and are not runtime sources for this package.
