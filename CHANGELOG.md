# CHANGELOG

## v2.1.6j - 2026-06-12
### Release Type
Origin Model and Import Prompt Refinement

### Summary
Refined the shared origin model and added an import prompt so imported rows are categorized as Migrated Data or Other Data instead of using Import as both the process and the long-term record label.

### Changes
- Replaced stored/displayed Import origin with Other Data
- Added Imported Data Type selector to CSV import
- Kept Manual Entry stored but hidden as a badge
- Preserved Migration fallback for missing-origin undated current entries
