# RGB Mileage Fix Notes

Version: 2.0.7  
Release Date: 2026-06-04  
Build Type: Incremental Stabilization Update  
Based On: v2.0.6

## Bugs / Issues Addressed

### Blank Screen Risk from Failed v2.0.7 Builds
Root Cause: Prior v2.0.7 attempts were generated as single-file rebuilds and introduced startup risk.

Resolution: v2.0.7 is rebuilt incrementally from the verified working v2.0.6 source files.

### XLSX Startup Dependency Risk
Root Cause: XLSX support can create unnecessary startup risk if loaded before the Home Screen.

Resolution: XLSX import is deferred. CSV import remains available.

### Cache Confusion
Root Cause: Safari and installed Home Screen apps may continue using stale service-worker caches.

Resolution: New service-worker cache name added and old RGB/Mileage caches are deleted during activation.

### Backup Safety
Root Cause: Restore was previously a placeholder.

Resolution: JSON backup restore now reads a selected JSON file, validates/normalizes structure, previews counts, and asks for confirmation before replacing local data.

## Testing Performed

- JavaScript syntax validation.
- Required file presence check.
- Manifest JSON validation.
- Service worker syntax validation.
- Package structure check.
- Root-level icon check.

## Known Issues

- XLSX import is not active in this release.
- Supabase integration is not active in this release.
- AI receipt scanning is not active in this release.

## Deployment Verification

- [ ] App opens from GitHub Pages URL.
- [ ] App opens from Home Screen icon.
- [ ] Version shown/confirmed on Home Screen.
- [ ] Version shown/confirmed on secondary screens.
- [ ] Existing data visible.
- [ ] New entry saves correctly.
- [ ] Backup exports with correct filename.
- [ ] JSON restore/import test performed.
- [ ] CSV export test performed.
- [ ] Safari and Home Screen app tested separately.
