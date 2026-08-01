# Fix Notes

**Build:** `v2.1.6l-wc10-flat11`  
**Build date:** `07/31/2026`

## Evidence-based correction

Flat10 used `visualViewport.height` for the Home canvas. WebKit bug 254868 documents that installed web apps using `viewport-fit=cover` can receive a height that excludes safe-area space from `visualViewport.height`, `100svh`, and related values.

Flat11 uses the documented standalone workaround:

```css
@media all and (display-mode: standalone) {
  #app.screen-home {
    height: 100vh;
  }
}
```

Circle geometry is calculated from the rendered Home container, not from the JavaScript visual viewport.

## Prohibited regressions

- Do not restore Home sizing from `visualViewport.height`.
- Do not make `100svh` or `100dvh` the standalone height owner.
- Do not treat Chromium safe-area-zero screenshots as iPhone acceptance.
- Do not increase the 58-pixel menu height to cover missing viewport space.

## URLs

- Normal: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
- Cache refresh: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat11
