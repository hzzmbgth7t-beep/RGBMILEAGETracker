# RGB Mileage

**Build:** `v2.1.6l-wc10-f20`  
**Build date:** `08/02/2026`  
**Governance:** `v1.7`  
**Status:** RELEASE CANDIDATE — ACTUAL IPHONE ACCEPTANCE REQUIRED

F20 was built from the accepted `v2.1.6l-wc10-f19` archive.

Source SHA-256:

```text
1e3e15e25b521e1098fae963d2a6b8b8224c0bee8e2ff4c13d982f296b3e4845
```

Purpose:

- portrait-only Home circle and label geometry
- one coherent solver applied to F19
- no F17/F18 runtime code used

What changed:

- Home portrait now solves all three circle positions jointly.
- All three Home portrait circles use one equal shared diameter.
- The upper-right circle center moves inward/lower when the solved maximum allows it.
- The lower-right circle center moves inward/higher when the solved maximum allows it.
- Display-label measurement is passed into the portrait solver, including Custom Label output.
- The solver records the real constraint that rejects the next larger diameter.

Locked from F19:

- 58 px menus on every screen
- Custom Label behavior
- JSON backup and restore
- CSV behavior
- offline service worker
- update control
- data and recovery behavior
- viewport handling
- Home landscape layout

Normal URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
Cache URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f20

Upload only the 17 files at the ZIP root.
