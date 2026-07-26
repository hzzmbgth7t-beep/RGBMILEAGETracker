# RGB Mileage Tracker Fix Notes

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat02`  
**Status:** CURRENT  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat2

## Layout correction

flat02 replaces the rejected vertical three-circle layout with:

- one large top circle and two equal lower circles in portrait
- three equal circles in one row in landscape
- runtime viewport-based sizing
- visible labels and dock clearance
- no portrait lock
- no 430-pixel landscape cap

## Packaging correction

Earlier packages were either too large at the GitHub root or too narrow for review.

The locked method is now:

- 17 root files for a blank clean install
- 13 root files for a normal update when icons are unchanged
- organized support folders retained in every archive
- no runtime dependency on support folders
