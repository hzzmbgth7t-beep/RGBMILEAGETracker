# CHANGELOG

## v2.1.6v - 2026-06-12
### Release Type
Home Screen Menu Root-Cause Cleanup

### Summary
Applied a menu-only correction that removes the standalone/Home Screen bottom reservation while keeping safe-area handling inside the menu.

### Changes
- cleared standalone-mode app bottom padding reservation
- cleared standalone-mode Home Screen bottom reservation
- kept menu anchored at the physical bottom edge
- kept safe-area handling internal to the menu
