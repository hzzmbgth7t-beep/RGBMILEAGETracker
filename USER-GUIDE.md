# User Guide

**Build:** `v2.1.6l-wc10-f17`  
**Build date:** `08/01/2026`  
**Governance:** `v1.7`

## Home circles

Portrait uses three equal circles:

- your primary vehicle appears at left-center
- the other vehicles appear upper-right and lower-right
- the circles automatically grow to the largest safe common size
- labels remain beneath their circles

Landscape retains three equal circles in one horizontal row.

## Offline update notification

A rounded dark notification reading:

```text
Update
Offline
Service
Worker
```

means a newer offline service worker is waiting.

Select the notification to apply the update. RGB Mileage reloads after the new worker takes control, and the notification disappears.

The notification does not indicate data loss or a failed GitHub deployment. The same action remains available under **Settings → Offline Mode → Apply Offline Update**.

Cache-refresh URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f17
