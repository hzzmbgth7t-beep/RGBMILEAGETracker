# FIXNOTES

## v2.1.6v - Home Screen Menu Root-Cause Cleanup

### Reason For This Release
Prior menu-only versions changed menu anchoring without removing the standalone-mode container reservation that kept blank space beneath the menu.

### Fix Implemented
- standalone-mode `#app` bottom reservation removed
- standalone-mode `.screen.home` bottom reservation removed
- standalone-mode menu remains fixed at `bottom: 0`
- safe-area handling remains internal to the menu only
