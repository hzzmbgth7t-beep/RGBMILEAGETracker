# FIXNOTES

## v2.1.7 - Radical Home Screen Shell / Bottom Rail Rebuild

### Reason For This Release
Repeated menu-only fixes kept failing because the Home Screen still depended on stacked legacy bottom-padding and height-reservation rules.

### Fix Implemented
- isolated the Home Screen standalone layout from the legacy bottom-boundary chain
- created a dedicated bottom menu rail
- kept menu safe-area handling internal to the rail
