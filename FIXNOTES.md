# Fix Notes

**Build:** `v2.1.6l-wc10-f14`  
**Build date:** `08/01/2026`  
**Governance:** `v1.7`

## Portrait geometry

F14 measures the rendered vehicle area directly:

```text
vehicleArea.getBoundingClientRect()
```

It computes one maximum common diameter from width and height constraints. The remaining width and height are divided into three equal spaces on each axis.

```text
horizontal: left edge / between columns / right edge
vertical: top edge / between right items / bottom edge
```

The primary circle spans both portrait rows and centers within that span. Its center aligns with the midpoint between the two right-side circle centers.

## Preserved behavior

- standalone `100vh`
- Safari `visualViewport.height`
- browser `100dvh` fallback
- 58-pixel menu
- F13 offline application shell
- current data and recovery behavior
- landscape three-across layout

## URLs

- Normal: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
- Cache refresh: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f14
