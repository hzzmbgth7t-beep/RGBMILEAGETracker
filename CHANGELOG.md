# CHANGELOG

## v2.1.6s - 2026-06-12
### Release Type
Menu Bottom Lock

### Summary
Applied a menu-only correction so the bottom navigation sits flush with the visible bottom edge, with safe-area handling kept inside the menu container.

### Changes
- locked bottom navigation to `bottom: 0`
- removed external bottom spacing behavior
- applied safe-area handling as internal bottom padding only
- left all non-menu Home Screen elements unchanged
