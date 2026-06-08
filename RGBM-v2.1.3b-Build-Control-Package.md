# RGBM-v2.1.3b-Build-Control-Package.md

Version: v2.1.3b
Release Type: Corrective Stabilization Build
Status: Draft for Review
Base Build: RGB Mileage v2.1.3a

Purpose:
Correct the remaining v2.1.3a review findings only.

---

## Authorized Scope

### Layout System
- D-036 Navigation Bar Not Anchored To Bottom
- D-037 Vehicle View Screen Not Using Multi-Column Layout

### Record Interaction System
- D-040 Fuel Record Tap-To-View Not Working
- D-042 Maintenance Record Tap-To-View Not Working
- D-045 Insurance Record Tap-To-View Not Working

### Other Workflow System
- D-041 Fuel Grade Default List Lost After Save To List
- D-043 Maintenance Category Use Once Value Not Preserved

### Edit Workflow System
- D-039 Edit Save Workflow Missing Confirmation And Clear-After-Save Behavior

---

## Explicitly Excluded

### Deferred Defects
- D-017 Chrome Circle Border Styling
- D-018 Chrome Vehicle Label Styling

### Future Decisions
- DEC-019 Move Version/Date Under Title
- DEC-020 Station List Ordering Review
- DEC-021 Fuel Grade / Maintenance Category Sorting Review
- DEC-022 Insurance Company / Agency Model Review

### New Features
- Report redesign
- Data model redesign
- New reports
- New vehicle fields
- New record types
- Master list administration

---

## Consistency Rule

Correct shared systems rather than individual pages whenever practical.

### Layout System
Applies to:
- D-036
- D-037

### Record Interaction System
Applies to:
- D-040
- D-042
- D-045

Locked Standard:

Tap = View

Long Press = Edit

### Other Workflow System
Applies to:
- D-041
- D-043

Locked Standard:

Other
→ Use Once
→ Save To List
→ Cancel

### Edit Workflow System
Applies to:
- D-039

Locked Standard:

Save Edit
→ Success Notification
→ Clear Form
→ Remain On Screen

---

## Required Regression Testing

Must remain functional:

### Restore
- Vehicle restore
- Fuel restore
- Maintenance restore
- Insurance restore

### Home Screen
- No white area
- No vertical movement
- No double-tap movement

### Orientation
- Portrait-style behavior maintained

### Vehicle
- Acquisition save
- Seller full width

### Fuel
- Entry save
- Long Press edit
- Station Other workflow

### Maintenance
- Save
- Display
- Long Press edit
- Multi-column layout

### Insurance
- Save
- Display
- Long Press edit
- Layout corrections

---

## Acceptance Gate

v2.1.3b passes only if:

- D-036
- D-037
- D-039
- D-040
- D-041
- D-042
- D-043
- D-045

all pass and no new defects are introduced.

---

Status:

DRAFT FOR REVIEW
