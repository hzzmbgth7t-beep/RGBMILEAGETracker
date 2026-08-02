# Fix Notes

**Build:** `v2.1.6l-wc10-f16`  
**Build date:** `08/01/2026`  
**Governance:** `v1.7`

F15 displayed the waiting-worker indicator as a noninteractive green shield. Its placement was accepted, but the indicator could not be selected and its visual treatment was rejected.

F16 keeps that placement and changes only the control itself:

```text
Update
Offline
Service
Worker
```

- semantic `button` element
- direct activation of the waiting offline service worker
- original rounded-pill shape
- original dark navy notification background
- original white text and blue update border
- unchanged portrait and landscape dimensions
- no participation in circle geometry

No circle, viewport, data-storage, backup, recovery, or menu behavior changed.

Normal URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
Cache URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f16
