# RGBMileage Working Upgrade Notes

## Working-copy package
WC-02

## Baseline reference
v2.1.6l

## Status
This is a baseline-derived working-copy test package.
It is not a new version and not a promoted release artifact.

## Applied change
- File: `styles.css`
- Scope: Home/menu interaction only
- Change: removed the explicit `.screen.home` `height` declaration from the active Home/menu interaction block
- Preserved: `.screen.home` `min-height`, nav cleanup from prior working-copy package, circle rules, label rules

## Why this package exists
The prior nav-only attempt failed environment verification.
The next smallest approved scope is Home/menu interaction only.

## Verification target
- Home Screen standalone
- phone
- portrait

## Acceptance focus
- menu bottom anchoring
- no gap beneath menu
- circle preservation
- label preservation
- no unrelated geometry drift
