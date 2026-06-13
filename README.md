# RGB Mileage Tracker

Version: **v2.1.6**  
Release type: **Insurance Screen Merger Release**

## Purpose
This release applies the accepted Fuel and Maintenance merged-screen model to **Insurance**. Insurance now uses one screen with **Empty**, **View**, and **Edit** states. Fuel and Maintenance remain on their accepted merged models.

## Links
GitHub Pages: [https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/](https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/)

Cache-buster URL: [https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216](https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216)

Repository: [https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker](https://github.com/hzzmbgth7t-beep/RGBMILEAGETracker)

## What This Release Changes
- Insurance now uses one unified screen instead of separate Insurance View/Edit flows
- Vehicle **Insurance Entry** opens Insurance in **Edit**
- Insurance tap on Previous Records opens **View**
- Insurance long press on Previous Records opens **Edit**
- Insurance supports:
  - **Empty** state
  - **View** state
  - **Edit** state
- **Data Information** is available in both Insurance View and Insurance Edit
- Insurance-specific unsaved-change handling, Save, Cancel, Back, Home, New Entry, and Return To List now follow the accepted merged-screen model

## Insurance Field Model
Insurance uses the accepted simplified field set:
- Agency
- Policy Number
- Effective Date
- Expiration Date
- Agreed Value
- Premium
- Agent
- Phone
- Email
- Notes

Legacy values remain compatibility-aware in the code:
- company -> agency when loading
- coverageValue / insuranceValue -> agreedValue when loading
- coverageNotes -> notes when loading

## What This Release Does Not Change
This release does **not**:
- add Delete or Deleted Items
- perform legacy-code cleanup
- add broader responsive/orientation changes
- alter the accepted Fuel or Maintenance workflows beyond shared merged-model reuse

## Why This Release Exists
This release completes the section-screen merger work for the three primary record types so development can pause for EMR update and evaluation before Wiki work and later deferred enhancements.
