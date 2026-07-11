# RGBM Stabilization Decisions

**Governance version:** 1.1  
**Status:** APPROVED  
**Effective date:** 2026-07-10

## 1. Source-control decisions

1. All implementation starts from locked baseline `v2.1.6l`.
2. Failed working copies are negative evidence only.
3. No failed working copy may become an edit base.
4. Specification requirements may not be weakened to accommodate implementation difficulty.
5. The implementation changes when it conflicts with the specification.

## 2. Vehicle-unit model

A vehicle unit consists of:

- one circle
- its own label

The circle and label move together.

The circle may resize, and the whole vehicle unit may reposition, but:

- the label may not detach from the circle
- the circle may not touch its own label
- the circle must remain 1:1
- width and height must remain equal

## 3. Fixed-clearance model

The following clearances are fixed design constants and do not scale with circle diameter:

- portrait Dynamic-Island-to-title clearance
- title-to-version clearance
- version-to-upper-circle clearance
- circle-to-own-label clearance
- upper-label-to-lower-circle clearance
- lower-label-to-dock clearance
- landscape top-edge-to-title clearance
- landscape title/version-to-circle-region clearance
- landscape center clearance between vehicle units
- side-screen clearance

The approved portrait reference establishes the fixed visual relationships. Circle growth or shrinkage must not change the top title clearance.

## 4. Portrait layout decisions

- Target: iPhone 17 Pro Max in standalone portrait mode.
- The title sits immediately below the Dynamic Island reference position.
- The title clearance is static.
- The version line sits directly below the title.
- Vehicle 1 is above Vehicle 2.
- Each vehicle unit is internally vertical: circle above label.
- Circle diameter is the largest valid diameter that satisfies every fixed clearance.
- Growth stops before:
  - the version-line clearance zone
  - own-label clearance
  - upper-label-to-lower-circle clearance
  - lower-label-to-dock clearance
  - side-screen clearance
- If a boundary is reached in one direction, the entire vehicle unit may reposition only if every clearance remains valid.
- A circle may never grow asymmetrically.

## 5. Landscape layout decisions

- Target: iPhone 17 Pro Max rotated horizontally, not a tablet.
- The title uses a small fixed top-edge clearance.
- Vehicle 1 is on the left.
- Vehicle 2 is on the right.
- Each vehicle unit remains internally vertical: circle above label.
- Circles may retain portrait diameter when that diameter already maximizes usable landscape space.
- Otherwise circles grow or shrink to the largest valid diameter that satisfies all landscape clearances.
- Rotation triggers recalculation.

## 6. Bottom-dock decisions

- The dock background must touch and visually own the bottom edge.
- The safe-area bottom region belongs to the dock background.
- Buttons sit inside the dock above the safe-area reserve.
- Content stops above the dock with fixed visible clearance.
- The dock may not appear to float above the screen.
- Forbidden methods:
  - pseudo-element fillers
  - transform nudges
  - stacked override patches
  - mode-specific compensation chains
  - unexplained spacer elements

## 7. Chrome decisions

The title, vehicle labels, and circle borders share one chrome material family.

The target appearance is polished stainless steel:

- bright highlight
- dark reflected edge
- neutral metallic midtone
- controlled contrast

The result must not read as:

- light blue
- flat gray
- plain white
- colored glow
- painted silver

Labels may use a lighter chrome treatment than the title but must remain visibly metallic.

## 8. Deterministic layout decisions

The implementation must:

1. measure viewport dimensions
2. measure safe-area geometry
3. reserve fixed title and dock regions
4. reserve fixed label and inter-unit clearances
5. calculate the largest equal width/height circle diameter
6. position vehicle units
7. verify all boundaries
8. recalculate after orientation changes

Hard-coded diameter caps may be safety limits only. They may not be the primary sizing mechanism.
