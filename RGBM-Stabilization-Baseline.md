# RGBM Stabilization Baseline

**Governance version:** 1.1  
**Status:** APPROVED  
**Effective date:** 2026-07-10  
**Locked implementation baseline:** `v2.1.6l`

## 1. Authority

This document is the controlling baseline authority for RGB Mileage stabilization.

- `v2.1.6l` is the only approved implementation source.
- No post-`l` working copy is approved for promotion.
- Every post-`l` working copy is evidence only unless a future promotion record explicitly changes its status.
- Failed working-copy code, CSS, layout logic, packaging logic, and documentation text may not be reused as implementation source.

## 2. Controlling device and environments

Primary acceptance device:

- iPhone 17 Pro Max
- installed Home Screen / standalone mode

Mandatory orientations:

- portrait
- landscape

Browser rendering may support diagnosis but does not control acceptance.

## 3. Active integrated stabilization target

The active target is one integrated Home-screen and bottom-dock system.

The system must:

- use the usable display intentionally
- maintain a fixed portrait title clearance below the Dynamic Island reference position
- maintain a fixed landscape title clearance below the top edge
- size circles deterministically from available geometry
- keep circles perfectly circular
- keep each label attached to its own circle
- maintain fixed inter-unit and dock clearances
- place landscape vehicles left and right
- use a true bottom dock that visually owns the bottom edge
- use one chrome material family for title, labels, and circle borders

## 4. Design intent

The Home screen exists to make vehicle selection immediate, dominant, and visually balanced.

The governing intent is:

1. Use available space instead of leaving unexplained empty regions.
2. Reserve empty space only for safe areas, the title system, fixed clearances, and the dock.
3. Treat each circle and its label as one vehicle unit.
4. Make orientation changes trigger recalculation, not ad hoc redesign.
5. Make the dock feel native and attached to the screen edge.
6. Keep chrome visually metallic, neutral, and consistent.

## 5. Completion gate

A build is not complete because files were edited or static audits passed.

Completion requires all of the following:

1. Artifact contents verified.
2. Identity verified in every required surface.
3. Documentation verified.
4. Standalone portrait evidence captured.
5. Standalone landscape evidence captured.
6. Every mandatory acceptance item marked `PASS`.
7. Recipient confirms the archive is downloadable.
8. Explicit handoff authorization is recorded.

Any mandatory failure blocks handoff and promotion.
