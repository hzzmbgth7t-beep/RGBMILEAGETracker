# RGB Mileage User Guide

Build: `v2.1.6l-wc10-f25-rc1`  
Cache: `216lwc10f25rc1`  
Guide release: `v2.1.6l-wc10-f25-rc1`  
Last User Guide content-change release: `v2.1.6l-wc10-f25-rc1`  
Source baseline: accepted `v2.1.6l-wc10-f24`  
Source SHA-256: `f90fe95495b9aba00530e8ca47ab95f3d58014a0a1624788209237b2df09bb32`  
Current status: `Release Candidate 1 / pending user validation`

Production URL:  
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-busted URL for this build:  
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f25rc1

## About this guide

This guide explains how RGB Mileage works now. It is organized in two parts:

- **User Instructions** explain how to use the app day to day.
- **Admin Instructions** explain deployment, update, backup, recovery, and release-verification tasks.

Release history belongs in `CHANGELOG.md`. Fix details belong in `FIXNOTES.md`. Deployment-only steps belong in `DEPLOYMENT.md`.

The User Guide is versioned for every release. If a future release only updates the guide's current release number and does not change guide content, the guide should show the current guide release and put the last release where guide content changed in parentheses.

---

# Part 1 — User Instructions

## 1. App overview

RGB Mileage tracks vehicles and the records attached to them.

The app currently supports:

- Vehicles
- Vehicle images
- Custom vehicle labels
- Acquisition information
- Fuel records
- Maintenance records
- Insurance records
- Reports
- JSON backup and restore
- CSV import for Fuel and Maintenance records
- Dropdown values that can be used once or saved to a list
- Offline app-shell behavior
- Update controls
- Recovery flow for serious data-load problems

The app stores vehicle data in the browser or installed Home Screen app storage. Use JSON Backup before updates, imports, restores, clearing data, or major edits.

## 2. Opening the app

You can open RGB Mileage two ways:

1. From the installed Home Screen app.
2. From Safari or another browser using the production URL.

After an update, use the cache-busted URL for the current build:

https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f25rc1

If the old version still appears, open Settings and check the build shown there. You may also need to use **Check for App Update** and **Apply Offline Update** from Settings.

## 3. Main navigation

The bottom menu has four main choices:

- **Home** returns to the vehicle circle screen.
- **Reports** opens the report menu.
- **Data** opens backup, restore, and CSV import tools.
- **Settings** opens version, vehicle order, offline/update, migration evidence, About, and clear-data tools.

Most non-Home screens also have a **Back** button at the top. Use **Back** to return to the previous screen or workflow.

## 4. Home screen

The Home screen is the starting point for vehicle access.

It shows:

- Vehicle circles for configured vehicles.
- Add Vehicle circles for empty vehicle positions.
- Labels for each vehicle or Add Vehicle item.
- Version/build identity at the bottom.

Tap a vehicle circle to open that vehicle. Tap an Add Vehicle circle to create a vehicle in that position.

### Vehicle circles

Each vehicle circle represents one vehicle slot. A configured vehicle shows its vehicle image when available. If no image is saved, the app uses a placeholder/initial display.

### Add Vehicle circles

An Add Vehicle circle opens the Add Vehicle form for that position.

### Home labels

Home labels use the vehicle display label. The display label is either:

- The **Custom Label**, when a nonblank Custom Label is saved.
- Otherwise, the generated label from Year, Make, Model, and Badge.

A blank Custom Label restores the generated label.

### Portrait and landscape

The app has separate Home layouts for portrait and landscape. Labels are intended to remain associated with their own circles. For portrait geometry releases, actual iPhone testing is required before accepting the release.

## 5. Vehicle screen

Open a vehicle by tapping it on Home.

The Vehicle screen shows:

- Vehicle image or placeholder.
- Year.
- Make.
- Model.
- Badge.
- Custom Label.
- Acquisition Date.
- Starting Odometer.
- Purchase Price.
- Status.
- Seller.
- Previous Fuel Records.
- Previous Maintenance Records.
- Previous Insurance Records.

Vehicle actions:

- **Edit Vehicle**
- **Fuel Entry**
- **Maintenance Entry**
- **Insurance Entry**

## 6. Add or edit a vehicle

Tap an Add Vehicle circle or choose **Edit Vehicle** from an existing vehicle.

Vehicle fields:

- Year
- Make
- Model
- Badge
- Custom Label
- Vehicle Image
- Acquisition Date
- Starting Odometer
- Purchase Price
- Status
- Seller

### Required identifying information

Before saving a vehicle, the app requires at least a vehicle make, model, nickname, or display name source. If this is missing, the app shows:

**Enter a vehicle make, model, nickname, or display name before saving.**

### Custom Label

Custom Label behavior:

- Maximum length is 50 characters.
- Leading and trailing whitespace is removed.
- A nonblank Custom Label overrides the generated vehicle label everywhere the display label is used.
- A blank Custom Label restores the generated Year Make Model Badge label.
- JSON backup and restore preserve Custom Label.
- Older JSON backups without Custom Label remain valid.
- Custom Label is not added to CSV import/export behavior.

### Vehicle image

Use **Replace Image** to choose an image file. If an image is saved, the Vehicle screen and Home vehicle circle can show it. If no image is saved, the app shows a placeholder.

### Acquisition information

The Vehicle form also includes the acquisition record fields:

- Acquisition Date
- Starting Odometer
- Purchase Price
- Seller

These appear on the Vehicle screen after saving.

### Saving

Use **Save Vehicle** to save changes. A successful save shows:

**Vehicle saved.**

Use **Clear & Exit** to leave the form without saving the current entry.

## 7. Fuel records

Open Fuel Entry from the Vehicle screen.

Fuel fields:

- Date
- Time
- Odometer
- Miles
- Gallons
- MPG
- Fuel Grade
- Ethanol Free
- Station
- Cost Source
- Price/Gal
- Total Cost
- Notes

### Required and validated Fuel fields

The app validates Fuel save values. Date is required. Gallons must be positive. Odometer, Miles, MPG, Price/Gal, and Total Cost must be nonnegative when entered.

If a value is invalid, the app shows a validation message.

### Fuel Grade and Station dropdowns

Fuel Grade and Station dropdowns include saved/default options and **Other**.

When you select **Other**, the app asks for the new value and offers:

- **Use Once** — use the value for this record only.
- **Save To List** — use the value now and add it to the list for future records.

### Fuel actions

Depending on whether you are adding, viewing, or editing a record, the Fuel screen can show:

- **New**
- **View**
- **Edit**
- **Save**
- **Cancel**
- **Delete** for an existing fuel record.

For an existing fuel record, Delete opens a choice between **Delete Permanently** and **Archive Instead**. Permanent delete removes the fuel record. Archive keeps the record in storage and marks it Archived so normal active views and reports can exclude it.

Previous Fuel records are listed below the entry area.

## 8. Maintenance records

Open Maintenance Entry from the Vehicle screen.

Maintenance fields:

- Date / Drop-off Date
- Pickup Date
- Category
- Odometer
- Cost
- Location
- Provider
- Performed By
- Notes

### Required and validated Maintenance fields

The app validates Maintenance save values. Date is required. Odometer and Cost must be nonnegative when entered. If no category is entered, the app uses Maintenance as the category.

### Maintenance Category dropdown

Maintenance Category includes saved/default options and **Other**.

When you select **Other**, the app asks for the new value and offers:

- **Use Once** — use the value for this record only.
- **Save To List** — use the value now and add it to the list for future records.

### Maintenance actions

Depending on whether you are adding, viewing, or editing a record, the Maintenance screen can show:

- **New**
- **View**
- **Edit**
- **Save**
- **Cancel**

Previous Maintenance records are listed below the entry area.

## 9. Insurance records

Open Insurance Entry from the Vehicle screen.

Insurance fields:

- Agency / Company
- Policy Number
- Effective Date
- Expiration Date
- Agreed Value
- Premium
- Agent
- Phone
- Email
- Notes

### Required and validated Insurance fields

The app validates Insurance save values. Expiration Date cannot be earlier than Effective Date. Agreed Value and Premium must be nonnegative when entered.

### Insurance actions

Depending on whether you are adding, viewing, or editing a record, the Insurance screen can show:

- **New**
- **View**
- **Edit**
- **Save**
- **Cancel**

Previous Insurance records are listed below the entry area.

## 10. Previous records and history

The Vehicle screen and record-entry screens show previous records for the selected vehicle.

Previous record sections include:

- Previous Fuel Records
- Previous Maintenance Records
- Previous Insurance Records

Each previous record can be opened for viewing. View screens show Data Information and the record fields.

Data Information includes:

- Record ID
- Sequence
- Origin
- Status
- Lifecycle

From a record view, you can:

- **Edit** the record.
- **Archive** the record.

Fuel records also expose a Delete action from the Fuel edit workflow. The inspected F24 source supports a permanent-delete choice for fuel records and archive flows for records.

### Editing historical records

When editing a saved record, the app shows the record fields in edit mode. Use **Save Changes** to save. Use **Cancel** or Back to leave.

If you try to go back with unsaved record-edit changes, the app prompts:

**You have unsaved changes. Press OK to save them before leaving.**

If you do not save, the app can also ask:

**Discard your unsaved changes and go back?**

### Archiving records

Archive removes a record from normal active views without deleting it from storage.

When archiving a record, the app asks:

**Archive this record?**

After archiving, the app shows:

**Record archived.**

Reports exclude Archived records by default. The MPG report also excludes Historical records.

## 11. Reports

Open Reports from the bottom menu.

The report menu includes:

- Fuel History Report
- MPG Report
- Maintenance Report
- Insurance History Report
- Vehicle Summary Report

### Fuel History Report

Shows active, non-Archived fuel records. The report includes date, vehicle label, odometer, miles, gallons, and MPG.

### MPG Report

Shows fuel records used for MPG review. It excludes Archived records and Historical records.

### Maintenance Report

Shows active, non-Archived maintenance records. It includes date, category, odometer, and cost.

### Insurance History Report

Shows active, non-Archived insurance records. It includes agency/company, policy number, effective date, expiration date, and premium.

### Vehicle Summary Report

Shows configured vehicles with status and record counts for active fuel and maintenance records.

## 12. Data Management

Open Data from the bottom menu.

The Data Management screen has two main sections:

- Backup & Restore
- CSV Import

### JSON Backup

Use **Create JSON Backup** to download a full JSON backup.

The backup includes app data such as vehicles, vehicle order, fuel records, maintenance records, insurance records, and metadata. Before creating the file, the app shows a Backup Summary with counts and estimated size.

Create a JSON backup before:

- Updating the app.
- Restoring data.
- Importing CSV records.
- Clearing local data.
- Making major changes.

### JSON Restore

To restore:

1. Choose a JSON backup file.
2. Select Restore Mode.
3. Tap **Restore JSON Backup**.
4. Review the restore summary.
5. Confirm to continue.

Restore modes shown in the app:

- Replace
- Update
- Duplicate
- Skip

A successful restore shows:

**Restore complete.**

If no file is selected, the app shows:

**Choose a JSON backup first.**

If restore fails, the app shows a restore-failed message with any available error code.

### Clear Old Cached Storage

The Data screen includes **Clear Old Cached Storage**.

This action prompts:

**Clear old RGB Mileage cached storage? Current active data may be removed.**

Use this carefully. Create a JSON backup first.

This is different from **Clear Local Data** in Settings, which clears all local data including retained rollback data.

## 13. CSV import

CSV Import is on the Data screen.

The app states that CSV import supports Fuel and Maintenance records.

CSV Import fields:

- Vehicle
- Imported Data Type
- CSV File
- Duplicate Mode

Imported Data Type options:

- Migrated Data
- Other Data

Duplicate Mode options:

- Skip
- Update
- Duplicate
- Replace
- Cancel

### Preview first

Use **Preview Import** before saving. If you try to save without previewing, the app shows:

**Preview first.**

If no vehicle is configured, the app shows:

**Configure a vehicle before importing records.**

If no CSV file is selected, the app shows:

**Choose a CSV file.**

### Save previewed rows

After previewing, use **Save Previewed Rows**. The app reports an Import Summary with counts for:

- Imported
- Updated
- Replaced
- Duplicated
- Skipped

CSV import supports Fuel and Maintenance record mapping. Custom Label is not added to CSV import/export behavior.

## 14. Dropdown lists and Other values

The app supports list extension through entry dropdowns.

Source-supported editable dropdowns include:

- Fuel Grades
- Stations
- Maintenance Categories

When you choose **Other**, a modal asks for the new value.

Options:

- **Use Once** uses the typed value only for the current record.
- **Save To List** uses the typed value and stores it for future dropdown use.
- **Cancel** closes the modal without using the value.

The inspected F24 package does not expose a separate general list-management screen for deleting, renaming, or reorganizing saved dropdown values. If a saved list value is wrong, use an available existing value or choose Other and Save To List with the corrected value.

## 15. Settings

Open Settings from the bottom menu.

Settings includes:

- Build information
- Vehicle Order
- Offline Mode
- WC-10 Migration Evidence
- About
- Clear Local Data

### Build information

The Settings build card shows the current build ID and build date. Use this to confirm you are running the expected version.

For this build, the expected build is:

`v2.1.6l-wc10-f25-rc1`

### Vehicle Order

Vehicle Order lets you move vehicles between positions.

The Settings screen states:

**Position 1 is the primary portrait position. Landscape order is left to right.**

Use **Move Up** and **Move Down** to change order. If the app cannot find the vehicle order entry, it shows:

**Vehicle order entry not found.**

### Offline Mode

Offline Mode reports the app’s service-worker/offline-shell status.

The screen explains that:

- Vehicle data remains in local storage.
- The service worker caches only application files and icons.

Available buttons:

- **Check for App Update**
- **Apply Offline Update** when an update is ready

The ordinary offline status and the update control are separate concepts.

### WC-10 Migration Evidence

The WC-10 Migration Evidence card shows a current check, migration acceptance, legacy source, and canonical validation status.

Actions:

- **Download Migration Evidence**
- **Copy Migration Summary**

The exported evidence JSON contains IDs, counts, order, and record-ID fingerprints. The app text states that it excludes images, VINs, plates, and record amounts.

### About

About shows:

- RGB Mileage version
- Build Date
- Schema
- Migration
- Evidence version

### Clear Local Data

Settings includes **Clear Local Data**.

The app prompts:

**Clear all local data, including retained rollback data?**

Create a JSON backup before using this. Clearing local data can remove app data from the current browser or installed app storage.

## 16. Offline and updates

RGB Mileage includes an offline application shell through a service worker.

The service worker caches app files and icons so the app shell can load offline after it has been installed/cached. Vehicle data remains in local storage.

### Checking for updates

In Settings, use **Check for App Update**.

If an offline update is ready, **Apply Offline Update** appears. Applying the update tells the waiting service worker to activate and reload after controller change.

If the app still shows an older version after deployment, try:

1. Open the cache-busted URL.
2. Go to Settings.
3. Confirm the build ID.
4. Tap **Check for App Update**.
5. Tap **Apply Offline Update** if shown.
6. Reload or reopen the installed Home Screen app if needed.

## 17. Recovery Console

The Recovery Console appears only for serious data-load or reconciliation failures.

When it appears, the app says:

**Do not delete the Home Screen app or clear Safari website data.**

Recovery steps shown by the app:

1. Preserve storage.
2. Download a fresh recovery snapshot.
3. Confirm that the snapshot was saved.
4. Select the reconciled recovery candidate JSON.
5. Restore the reconciled data.

The recovery restore button activates only after the candidate matches required fingerprints and does not reduce preserved counts.

If recovery appears, do not clear data first. Download the recovery snapshot before taking destructive action.

## 18. Common notifications and what they mean

### Enter a value first

Cause: You selected Other in a dropdown but tried to Use Once or Save To List without typing a value.

Action: Enter the value or cancel.

### Vehicle saved

Cause: Vehicle save completed.

Action: No action needed.

### Record not found

Cause: The app could not locate the requested record.

Action: Return to the vehicle screen or reports and try again.

### Record archived

Cause: You confirmed archive on a record.

Action: The record is archived and removed from normal active report views.

### Choose a JSON backup first

Cause: Restore was started without selecting a JSON backup.

Action: Choose a backup file and try again.

### Restore complete

Cause: JSON restore succeeded.

Action: Confirm vehicles and records look correct.

### Restore failed

Cause: The selected JSON could not be restored or validated.

Action: Verify that the file is a supported RGB Mileage JSON backup.

### Configure a vehicle before importing records

Cause: CSV import was started without an available configured vehicle.

Action: Add/configure a vehicle first.

### Choose a CSV file

Cause: CSV Preview was started without selecting a CSV file.

Action: Select a CSV file.

### Preview first

Cause: Save Previewed Rows was tapped before previewing.

Action: Use Preview Import first.

### Migration evidence exported

Cause: Migration Evidence download completed.

Action: Keep the file for admin/release review if needed.

### Migration evidence summary copied

Cause: Migration summary was copied to the clipboard.

Action: Paste it where needed.

### Unsaved changes prompt

Cause: You tried to leave an edit screen with unsaved changes.

Action: Choose whether to save or discard the changes.

## 19. User troubleshooting

### Old version still appears

Use the cache-busted URL and then check Settings. Use Check for App Update and Apply Offline Update if shown.

### Vehicle label looks wrong

Check the vehicle’s Custom Label. Clear the Custom Label to restore the generated Year Make Model Badge label.

### A dropdown value is missing

Choose Other. Use Use Once for a one-time value or Save To List to keep it.

### Data appears missing

Do not clear local data. Create a JSON backup or recovery snapshot if available. Restore from a known-good JSON backup if needed.

### CSV import does not work

Check that a vehicle is configured, a CSV file is selected, Preview Import has been run, and the duplicate mode is correct.

### Offline/update behavior seems stuck

Check Settings. Use Check for App Update. If Apply Offline Update appears, use it and then reload or reopen the app.

---

# Part 2 — Admin Instructions

## 20. Admin responsibilities

Admin tasks include:

- Deploying releases.
- Verifying correct version/cache identity.
- Preserving user data before risky actions.
- Supporting backup, restore, import, and recovery.
- Running release verification.
- Distinguishing local/synthetic checks from pending user device review.
- Maintaining documentation alignment.

## 21. Deployment to GitHub Pages

Deploy only the 17 ZIP-root files from the approved release ZIP.

Do not deploy support folders.

Do not deploy user backups.

### Required GitHub Pages root files

The GitHub Pages root must contain exactly these 17 files:

- `app.js`
- `apple-touch-icon.png`
- `CHANGELOG.md`
- `DEPLOYMENT.md`
- `favicon.png`
- `FIXNOTES.md`
- `icon-192x192.png`
- `icon-512x512.png`
- `index.html`
- `manifest.json`
- `README.md`
- `rgbm-data-v3.js`
- `rgbm-home-layout.js`
- `rgbm-wc10-evidence.js`
- `styles.css`
- `sw.js`
- `USER-GUIDE.md`

### Support folders

The governed local release archive contains these eight support folders:

- `AUDITS/`
- `DOCUMENTATION/`
- `EVIDENCE/`
- `FIXTURES/`
- `ICONS/`
- `REFERENCES/`
- `TEMPLATES/`
- `TESTS/`

These support folders remain in the local governed archive. They are not uploaded to GitHub Pages.

## 22. Release verification

Before a release is handed off, verify:

- Source archive and SHA.
- Rejected builds excluded.
- Version identity.
- Cache token identity.
- Root file count.
- Support folder count.
- Manifest alignment.
- Service worker cache alignment.
- Documentation/source alignment.
- No unsupported device-status claims.
- ZIP integrity.
- Mechanical verifier output.
- Current user device-check status.

Current user device-check status must be stated as `PENDING / USER DEVICE CHECK REQUIRED` unless the user has confirmed it.

## 23. Active governance process

The active governance process requires:

- A mode line at the start of release-related responses.
- Evidence/speculation self-check before review, audit, build, ZIP creation, or handoff.
- No unsupported compliance claims.
- Mechanical verifier before documentation/source-alignment approval.
- Lettered options when commands or choices are offered.
- User approval before build when required.
- User approval before handoff.
- No release ZIP link in the same response where compliance is first claimed.
- No handoff if any item is failed, unknown, assumed, representative-only, unsupported, or unchecked.

## 24. Mechanical alignment verifier

The mechanical verifier scans current release files and generated reports for:

- Version/build tokens.
- Cache tokens.
- SHA-256 tokens.
- Baseline/build references.
- Rejected-build references.
- Device-status claims.
- Unsupported compliance claims.

Documentation/source-alignment approval is allowed only if the verifier report supports it.

A verifier failure blocks handoff. Warnings must be classified before handoff.

## 25. Admin backup rules

Create or confirm a JSON backup before:

- Uploading or testing a release.
- Running restore.
- Running CSV import.
- Clearing old cached storage.
- Clearing local data.
- Troubleshooting missing data.
- Using recovery workflows.

Backups are user data and must not be bundled into release ZIPs.

## 26. Admin restore support

When helping with restore:

1. Confirm the user has the intended JSON backup.
2. Confirm the desired restore mode.
3. Review the restore summary.
4. Confirm the restored vehicle and record counts.
5. Avoid destructive actions until a backup or recovery snapshot exists.

Restore modes shown in the app are Replace, Update, Duplicate, and Skip.

## 27. Admin CSV import support

CSV import supports Fuel and Maintenance records.

Before importing:

1. Create a JSON backup.
2. Confirm the target vehicle.
3. Confirm Imported Data Type.
4. Select CSV file.
5. Choose duplicate mode.
6. Preview import.
7. Review duplicate count and preview status.
8. Save previewed rows only if the preview is correct.

Duplicate modes are Skip, Update, Duplicate, Replace, and Cancel.

## 28. Admin offline/update support

If a user reports that an old version still appears:

1. Confirm the deployed root files.
2. Open the cache-busted URL.
3. Check Settings build ID and cache token.
4. Use Check for App Update.
5. Apply Offline Update if shown.
6. Reopen the installed Home Screen app if needed.

The service worker caches app files and icons. Vehicle data remains in local storage.

## 29. Admin recovery support

If the Recovery Console appears:

1. Do not delete the Home Screen app.
2. Do not clear Safari website data.
3. Download a recovery snapshot.
4. Confirm the snapshot is saved.
5. Select the reconciled candidate JSON.
6. Restore only after the app enables the recovery restore button.

The app describes a preservation floor with configured vehicle, fuel, maintenance, and insurance counts. Do not proceed with a candidate that reduces preserved counts.

## 30. Admin data count review

When validating user data after backup, restore, recovery, or release testing, review available counts for:

- Configured vehicles.
- Vehicle positions.
- Fuel records.
- Maintenance records.
- Insurance records.
- Attachments.

Use the app’s backup summary, restore summary, migration evidence, or recovery console details as the source of counts.

## 31. Admin Home-layout review

For Home geometry releases, review separately:

- Installed Home Screen portrait.
- Direct Safari portrait.
- Installed Home Screen landscape.
- Direct Safari landscape.

Check:

- Circle and label association.
- Labels beneath their own circles.
- No label overlap with own circle.
- No detached labels.
- No circle/menu collision.
- No browser-bottom clipping.
- No landscape regression.
- Correct build/cache identity.

Local geometry proof is not a substitute for user device testing.

## 32. Admin documentation maintenance

Governed documents have distinct responsibilities:

- `USER-GUIDE.md` explains how the app works now.
- `CHANGELOG.md` records release history.
- `FIXNOTES.md` records fixes and implementation notes.
- `DEPLOYMENT.md` records deployment and update procedure.
- `README.md` gives project/release overview and links to the operational documents.

Every release must update the User Guide to the current release version, even if no functional guide content changed.

When no User Guide content changes are required except the current release version, keep the current release version in the guide header and include the last release version where User Guide content actually changed in parentheses.

When a release adds, removes, or changes functionality, update the User Guide to explain how the current function works, not just what changed in the release.

Documentation must not contain stale source-baseline, version, cache, or device-status claims.

## 33. Admin release-candidate status for this guide

This guide is prepared for:

- Build: `v2.1.6l-wc10-f25-rc1`
- Cache: `216lwc10f25rc1`
- Guide release: `v2.1.6l-wc10-f25-rc1`
- Last User Guide content-change release: `v2.1.6l-wc10-f25-rc1`
- Source baseline: accepted `v2.1.6l-wc10-f24`
- Required F19 source SHA-256: `f90fe95495b9aba00530e8ca47ab95f3d58014a0a1624788209237b2df09bb32`

Actual user device-check status: `PENDING / USER DEVICE CHECK REQUIRED`


---

# F25 RC1 Record Action Update

Maintenance, Insurance, and Fuel records are intended to provide matching record-action behavior.

For existing Maintenance and Insurance records:

1. Open the relevant vehicle.
2. Open Maintenance Entry or Insurance Entry.
3. Select an existing record.
4. Use Edit when changes are needed.
5. Use Delete when removal is needed.
6. Choose Delete Permanently, Archive Instead, or Cancel.

Maintenance previous-record rows show date, category, and odometer when odometer data exists.
