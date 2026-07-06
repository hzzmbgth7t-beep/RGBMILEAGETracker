# RGBMileage v2.1.6r

## URLs

GitHub Pages URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-buster URL for this release:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216r

## Purpose

This release is an evidence-based corrective build from `v2.1.6q` using the installed Home Screen screenshot as the controlling evidence.

## Controlling Evidence

- installed Home Screen screenshot showing:
  - version correct
  - top gap correct
  - upper-label to lower-circle gap correct
  - lower wrapped label not fully chrome
  - labels too large
  - lower label too far from the menu

## Locked As Correct From Evidence

- version behavior
- top gap above the upper circle
- gap between the upper label and the lower circle
- circle sizes
- title size and placement
- chrome title styling
- bottom navigation structure

## Corrective Scope Only

- reduce circle label size to approximately 75% of title size
- make chrome rendering robust for wrapped labels
- move the lower label closer to the menu
- do not change the validated top and middle gaps

## Implemented Values

Home Screen standalone mode:
- title remains `33px`
- circle labels reduced from `30px` to `25px`
- label min-height remains `38px` to preserve the validated stack spacing
- lower label rendered `8px` lower for tighter menu proximity
- wrapped labels now use inline-block + transparent text fill + balanced wrapping

## Review Focus

1. label size is now approximately 75% of the title size
2. lower label remains fully chrome even if wrapped
3. lower label sits closer to the menu
4. top and middle gaps remain unchanged
5. app shows `v2.1.6r`
