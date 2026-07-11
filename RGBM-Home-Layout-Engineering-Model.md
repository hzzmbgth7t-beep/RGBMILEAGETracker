# RGBM Home Layout Engineering Model

**Version:** 1.0  
**Status:** APPROVED FOR IMPLEMENTATION PLANNING  
**Target:** iPhone 17 Pro Max standalone

## Portrait model

```text
┌─────────────────────────────────────┐
│ Dynamic Island exclusion/reference │
├──────── fixed top clearance ────────┤
│              TITLE                  │
│          fixed title gap            │
│          VERSION LINE               │
├──── fixed version clearance ────────┤
│          UPPER CIRCLE               │
│        fixed own-label gap          │
│          UPPER LABEL                │
├──── fixed inter-unit clearance ─────┤
│          LOWER CIRCLE               │
│        fixed own-label gap          │
│          LOWER LABEL                │
├──── fixed label-to-dock gap ────────┤
│             DOCK                    │
│       dock-owned safe area          │
└─────────────────────────────────────┘
```

Portrait constraints:

- The top title clearance never changes.
- Vehicle units stack vertically.
- The circle and its label move together.
- The largest valid equal diameter is selected.
- The lower label must not touch any dock line, shadow, border, or highlight.

## Landscape model

```text
┌──────────────────────────────────────────────────────────────┐
│ fixed top margin                                             │
│                         TITLE                                │
│                     VERSION LINE                             │
├────────────── fixed header clearance ────────────────────────┤
│      LEFT VEHICLE UNIT       │      RIGHT VEHICLE UNIT       │
│          CIRCLE              │           CIRCLE              │
│           LABEL              │            LABEL              │
├──────────── fixed vehicle-to-dock clearance ─────────────────┤
│                           DOCK                               │
│                    dock-owned safe area                      │
└──────────────────────────────────────────────────────────────┘
```

Landscape constraints:

- The device target is the rotated iPhone, not a tablet.
- Vehicle 1 is left; Vehicle 2 is right.
- Each vehicle unit is circle above label.
- The largest valid equal diameter is selected.
- Portrait diameter may be retained when it is already optimal.
- The title uses a fixed small top-edge clearance.
