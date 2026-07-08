# RGBM v2.1.7b Deletion Audit

## Controlling Evidence
- Installed iPhone 17 Pro Max Home Screen screenshot for v2.1.7a
- Current v2.1.7a stylesheet showing many competing bottom-boundary rules

## Deletions Performed
Removed the appended Home Screen/menu experimental rule blocks from:
- v2.1.6q
- v2.1.6u
- v2.1.6v
- v2.1.7
- v2.1.7a

Also removed the legacy `.bottom-nav::after` filler path from the stylesheet.

## Single Authoritative Standalone Path Added
A single standalone Home Screen path was added for:
- `#app`
- `.screen.home.home-shell`
- `.home-content-shell`
- `.home-menu-rail`
- `.home-menu-rail .bottom-nav`

## Release Alignment
- version: v2.1.7b
- cache token: 217b
- manifest start_url: `./index.html?v=217b`
- governed docs aligned to v2.1.7b

## Packaging Standard
One flat ZIP only.
