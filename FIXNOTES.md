# Fix Notes

**Build:** `v2.1.6l-wc10-f21`  
**Build date:** `08/02/2026`  
**Governance:** `v1.7`

F17 and F18 were rejected and were not used as source material.

F19 starts from accepted `v2.1.6l-wc10-f16` with SHA-256:

```text
88d58d0eb7f5bbe0c3de5076acdcbcd0a004e41eff294c7f8050ff0140cf35d8
```

Corrections:

- non-Home menu height changed from `58px + safe-area-inset-bottom` to the same exact 58-pixel dock used by Home
- non-Home menu padding now matches Home at `4px 7px`
- added the `Custom Label` field with a 50-character maximum
- centralized onscreen vehicle label selection
- JSON backups always include `customLabel`, including blank values
- older JSON backups without the field remain compatible
- CSV mappings remain unchanged

No Home circle geometry changes are included.
