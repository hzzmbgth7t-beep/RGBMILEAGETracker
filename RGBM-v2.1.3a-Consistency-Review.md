# RGBM-v2.1.3a-Consistency-Review.md

Version: v2.1.3a
Status: DRAFT FOR REVIEW
Purpose: Consistency Review Pass required by the locked UI Consistency Rule before implementation.

---

# Executive Summary

The purpose of this review is to identify areas where similar functionality exists in multiple sections of the application and ensure:

- One behavior
- One workflow
- One visual standard
- One implementation

whenever practical.

This review supplements the approved v2.1.3a Build Control Package.

---

# Review Group A — Record Interactions

## Sections Reviewed

- Fuel Records
- Maintenance Records
- Insurance Records

---

## Current Standard

### Tap

Expected:

Tap = View

---

### Long Press

Expected:

Long Press = Edit

Hold Duration:

500ms

---

### View Screen

Expected:

All record types should open a read-only View screen using a common presentation pattern.

---

### Edit Screen

Expected:

All record types should open an Edit screen using a common presentation pattern.

---

## Current Findings

### Fuel

Current Result:

- Tap not functioning
- Long Press not functioning

Associated Defects:

- D-024
- D-025

---

### Maintenance

Current Result:

- Unable to fully test due to save failure

Associated Defects:

- D-030
- D-031

---

### Insurance

Current Result:

- Tap not functioning
- Long Press not functioning

Associated Defects:

- D-034
- D-035

---

## Consistency Requirement

A single Record Interaction subsystem should control:

- Tap behavior
- Long press behavior
- Hold timing
- View routing
- Edit routing

for all record types.

---

# Review Group B — Other Workflow

## Sections Reviewed

- Fuel Grade
- Station
- Maintenance Category

---

## Standard Workflow

When user selects:

Other

Application opens:

Other Dialog

Containing:

- Text Entry
- Use Once
- Save To List
- Cancel

---

## Use Once

Expected:

- Value selected
- Not permanently saved

---

## Save To List

Expected:

- Value saved permanently
- Auto-selected
- Available in future entries

---

## Cancel

Expected:

- No changes
- Return to form

---

## Current Findings

### Fuel Grade

Current Result:

Dialog correct.

Save To List not functioning correctly.

Associated Defect:

D-027

---

### Station

Current Result:

Working.

---

### Maintenance Category

Current Result:

Working.

---

## Consistency Requirement

All Other workflows must use:

One dialog
One button set
One save model
One persistence model

---

# Review Group C — Field Standards

## Sections Reviewed

- Vehicle / Acquisition
- Fuel
- Maintenance
- Insurance

---

## Standard

All fields must have identical height regardless of:

- Empty
- Populated

Exceptions:

- Notes fields

---

## Current Findings

### Vehicle Acquisition Date

Issue:

Height changes when populated.

Associated Defect:

D-023

---

### Maintenance Date

Issue:

Height changes when populated.

Associated Defect:

D-023

---

### Insurance Effective Date

Issue:

Height changes when populated.

Associated Defect:

D-032

---

### Insurance Expiration Date

Issue:

Height changes when populated.

Associated Defect:

D-032

---

## Consistency Requirement

A single global control-height standard shall govern:

- Text
- Number
- Date
- Time
- Email
- Dropdown

controls.

---

# Review Group D — Layout Standards

## Sections Reviewed

- Vehicle / Acquisition
- Fuel
- Maintenance
- Insurance

---

## Standard

Two-column layout.

---

## Approved Full Width Exceptions

### Vehicle

Seller

---

### Fuel

Notes

---

### Maintenance

Notes

---

### Insurance

Agency
Notes

---

## Current Findings

### Vehicle

Compliant.

---

### Fuel

Compliant.

---

### Maintenance

Single-column behavior remains.

Associated Defect:

D-029

---

### Insurance

Policy Number and Premium incorrectly spanning layout.

Associated Defect:

D-033

---

## Consistency Requirement

One shared layout system should be used for:

- Vehicle
- Fuel
- Maintenance
- Insurance

with documented exceptions only.

---

# Review Group E — Restore And Data Systems

## Sections Reviewed

- Fuel
- Maintenance
- Insurance

---

## Standard

Restore

Import

Display

Duplicate Detection

must all operate from the same normalized data source.

---

## Current Findings

### Fuel

Restore functioning.

---

### Insurance

Restore functioning.

---

### Maintenance

Records known to exist.

Duplicate detection identifies records.

Records not displayed.

Associated Defect:

D-021

---

## Consistency Requirement

All record systems must use:

- One normalization model
- One storage model
- One duplicate-detection model
- One display model

---

# Cross-System Findings

The following defects affect consistency across multiple sections:

## Interaction System

- D-024
- D-025
- D-031
- D-034
- D-035

---

## Layout System

- D-023
- D-029
- D-032
- D-033

---

## Data System

- D-021
- D-030

---

## Other Workflow System

- D-027

---

# Implementation Guidance

Before correcting any individual page:

1. Identify the shared system.
2. Correct the shared system.
3. Verify all affected pages.
4. Verify no section uses a unique implementation unless documented.

Examples:

- Fix Record Interaction system, not Fuel interaction only.
- Fix Other Workflow system, not Fuel Grade only.
- Fix Field Height system, not one date field only.
- Fix Layout system, not one screen only.

---

# Review Conclusion

v2.1.3a should be implemented using a system-first approach.

The approved defects naturally group into four shared systems:

- Record Interaction System
- Other Workflow System
- Layout System
- Data/Restore System

Correcting those shared systems is expected to reduce future defect recurrence and improve consistency throughout the application.

---

Status:

READY FOR REVIEW
