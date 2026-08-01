# Fix Notes

**Build:** `v2.1.6l-wc10-f13`  
**Build date:** `07/31/2026`  
**Governance:** `v1.7`

## Offline boundary

F13 caches only executable application-shell resources. RGBM records remain in the existing local state and are never copied into Cache Storage.

```text
Cache Storage:
HTML, CSS, JavaScript, manifest, icons, static assets

Local storage:
vehicles, fuel, maintenance, insurance, acquisitions,
attachments, settings, backups, migration state
```

## Navigation

Online navigation uses the network first. When unavailable, the service worker returns the cached current shell, including for stale query strings and `index.html` paths.

## Updates

A newly installed worker waits. The user applies it from Settings, the worker receives `SKIP_WAITING`, and the page reloads only after `controllerchange`. This prevents an uncontrolled mid-session shell replacement.

## Preserved behavior

- installed Home height: `100vh`
- Safari Home height: `visualViewport.height`
- browser fallback: `100dvh`
- menu height: `58px`
- current circle arrangement
- all accepted data and recovery logic

## URLs

- Normal: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
- Cache refresh: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f13
