# Fix Notes

**Build:** `v2.1.6l-wc10-f12`  
**Build date:** `07/31/2026`  
**Governance:** `v1.7`

## Evidence-based defect

Flat11 fixed installed Home Screen safe-area behavior. The supplied Safari browser screenshots then showed a separate failure: the Home container retained a full-screen height while Safari controls reduced the visible browser area. Portrait clipped the lower vehicles and hid the menu; landscape hid the menu.

## F12 correction

Standalone and browser modes now have independent height owners:

```text
Standalone: 100vh
Browser: visualViewport.height
Browser fallback: 100dvh
```

Browser mode writes the measured height to `--home-browser-viewport-height`. It refreshes on Safari viewport changes and samples multiple frames because browser controls can settle after the initiating event.

The correction changes browser height only. It does not add a toolbar top offset and does not change standalone `100vh`.

## Deferred design work

The new left-center primary circle with upper-right and lower-right secondary circles is deferred to the next build after F12 browser acceptance.

## URLs

- Normal: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
- Cache refresh: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f12
