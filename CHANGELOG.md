# CHANGELOG

## v2.1.7 - 2026-06-12
### Release Type
Radical Home Screen Shell / Bottom Rail Rebuild

### Summary
Stopped the prior menu-fix path and rebuilt the Home Screen standalone layout around an isolated content shell and dedicated bottom menu rail.

### Changes
- created standalone Home Screen content shell
- created standalone Home Screen bottom menu rail
- moved Home Screen menu out of the legacy bottom-boundary path
- kept safe-area handling inside the menu rail


## v2.1.7a
- Extreme Home Screen bottom rail reset for standalone mode.
- Removes Home Screen bottom safe-area reservation from the menu rail.
- Converts the Home Screen rail into a real layout box and resets the menu to a fixed-height bottom row.
