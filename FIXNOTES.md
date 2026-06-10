# FIXNOTES

App Site Address: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Current Version: 2.1.2d
Release Date: 2026-06-06

## v2.1.2d Fix Notes

The backup JSON is valid. v2.1.2c reached the restore confirmation stage, proving JSON parsing and normalization worked. The later error, "The quota has been exceeded," occurred when Safari refused the localStorage write.

The likely cause is accumulated storage from multiple RGB Mileage versions and previous restore attempts. v2.1.2d clears stale RGBM/rgbMileage localStorage keys before Replace restore and retries after cleanup if Safari still raises a quota error.
