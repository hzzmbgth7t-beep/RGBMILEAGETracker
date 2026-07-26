# WC-10 Flat Package Fix Notes

**Build:** `v2.1.6l-wc10`  
**Package revision:** `flat01`  
**Date:** 2026-07-25  
**Classification:** CURRENT  
**Status:** CURRENT  
**Normal URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/  
**Cache-buster URL:** https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10flat1

## Corrected release defects

- Nested `tests/`, fixture, documentation, and reference folders are removed.
- Prior unclassified legacy documents are not included.
- Reference packages are root-level ZIP files.
- Test harnesses run directly from the install root.
- Every included file is classified in the current document index.
- Flat-source and flat-archive checks are build-blocking.

No Home geometry, orientation, dock, shell, or chrome change is included.
