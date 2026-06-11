# FIXNOTES

## v2.1.3o — 09/06/26

Previous Records tap reached the row and attempted View routing, but recordView() depended on findRecord(type,id), which was missing.

v2.1.3o adds findRecord() only. No record row, vehicle circle, navigation, report, settings, storage, or CSS logic was intentionally changed.
