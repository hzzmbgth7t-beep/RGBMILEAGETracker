# RGBMileage v2.1.6l-wc10-f24

Build: `v2.1.6l-wc10-f24`  
Cache: `216lwc10f24`  
Source baseline: verified accepted `v2.1.6l-wc10-f19`  
Source SHA-256: `1e3e15e25b521e1098fae963d2a6b8b8224c0bee8e2ff4c13d982f296b3e4845`  
Actual iPhone acceptance: PENDING / USER DEVICE CHECK REQUIRED

## Purpose

F24 is a portrait Home geometry release candidate rebuilt directly from the accepted F19 archive.

## URLs

Production URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-busting URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f24

## Release status

This package is not device-accepted. It requires user verification on actual iPhone installed Home Screen mode and direct Safari mode before it can replace F19 as the accepted baseline.

## Changed scope

- Portrait-only Home circle-plus-own-label geometry.
- Upper and lower circles use equal radius.
- Middle/primary circle may be larger.
- Labels remain beneath their own circles.
- Lower circle validity includes below-label clearance above the bottom menu/browser boundary.

## Locked behavior

The release must preserve landscape Home layout, 58 px menus, Custom Label behavior, JSON backup/restore, CSV behavior, offline service worker, update control, data/recovery behavior, viewport behavior outside the approved portrait Home geometry scope, and the 17-root-file / 8-support-folder packaging structure.
