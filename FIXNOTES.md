# Fix Notes

**Build:** `v2.1.6l-wc10-flat10`  
**Build date:** `07/31/2026`
**Date display format:** `MM/DD/YYYY`  

## Home Screen correction

Flat10 does not extend the previous Home patches. It replaces the Home geometry model.

The new shell is:

```text
Compact title
Flexible responsive three-circle area
58-pixel bottom menu
```

Portrait uses one full-width primary circle and two equal secondary circles. Landscape uses three equal circles. The menu height is not increased; its bottom edge is anchored to the viewport bottom.

## Launch URL correction

A stale URL such as:

```text
.../index.html?v=216e
```

is normalized before data loading and evidence generation to:

```text
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat10
```

Migration evidence retains the originally observed URL separately.
