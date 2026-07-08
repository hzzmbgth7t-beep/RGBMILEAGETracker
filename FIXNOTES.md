# FIXNOTES

## v2.1.7a - Home Screen Menu Hard Reset

### Reason For This Release
The prior v2.1.7 package still showed the Home Screen menu floating above the bottom edge. Inspection confirmed that the dedicated Home Screen shell wrappers were neutralized by `display: contents`, and the release documents/manifest were not fully aligned to the `v2.1.7a` release token.

### Fix Implemented
- corrected the Home Screen shell wrappers so they function as real layout boxes in the standalone path
- applied the Home Screen menu hard reset layout
- aligned the governed release documents to `v2.1.7a`
- aligned the manifest `start_url` and cache-buster token to `217a`
