# FIXNOTES

## v2.1.6g - Fuel-First Label Model Cleanup

### Reason For This Release
The previous Fuel labeling model mixed different concepts and did not clearly document what the labels meant.

### Fix Implemented
Fuel now uses a structured label model:
- Origin
- Status / Condition
- Lifecycle

### Fuel status meanings
- Incomplete = temporary active incomplete manual Fuel record
- Historical = retained incomplete Fuel record
- Review = attention-needed Fuel record
- Archived = lifecycle state only

### Important cleanup
- Verified removed from Fuel
- older Fuel records normalized into the new model
