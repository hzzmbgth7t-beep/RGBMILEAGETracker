# FIXNOTES

## v2.1.6q - Mode-Aware Home Screen Correction

### Reason For This Release
Prior builds treated Safari browser view and Home Screen standalone view too similarly, which caused repeated layout mismatches.

### Fix Implemented
- detect standalone/Home Screen mode
- apply separate Home Screen sizing for browser mode and standalone mode
- preserve chrome title and chrome labels
- limit changes to Home Screen layout selectors and mode handling only
