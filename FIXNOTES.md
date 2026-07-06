# FIXNOTES

## v2.1.6s - Menu Bottom Lock

### Reason For This Release
The bottom menu was floating above the physical bottom edge of the visible screen and leaving unused blank space below it.

### Fix Implemented
- menu anchored flush to the bottom edge
- no external bottom margin or upward offset
- safe-area spacing handled as internal menu padding only

### Scope Note
This is a menu-only correction. No circles, labels, title, spacing above the menu, or other visual elements were changed intentionally.
