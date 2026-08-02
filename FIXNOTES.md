# Fix Notes

**Build:** `v2.1.6l-wc10-f20`  
**Build date:** `08/02/2026`  
**Governance:** `v1.7`

Cache revision: `216lwc10f20`

F20 source baseline:

```text
v2.1.6l-wc10-f19.zip
SHA-256: 1e3e15e25b521e1098fae963d2a6b8b8224c0bee8e2ff4c13d982f296b3e4845
```

F17 and F18 were rejected portrait-geometry experiments and were not used as runtime source material.

Corrections:

- replaced the F19 portrait Home grid distribution with a centralized portrait solver
- computes one maximum equal shared circle diameter
- solves left and right center coordinates jointly
- moves upper-right/lower-right centers inward by geometry constraints, not hardcoded offsets
- uses rendered label bounds from the centralized display label, including Custom Label
- rejects the next larger integer diameter with a documented constraint
- leaves Home landscape and all non-Home/data/offline/update behavior unchanged
