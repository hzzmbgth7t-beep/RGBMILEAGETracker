# RGB Mileage User Guide

Build: `v2.1.6l-wc10-f26-rc1`  
Cache: `216lwc10f26rc1`  
Guide release: `v2.1.6l-wc10-f26-rc1`  
Last User Guide content-change release: `v2.1.6l-wc10-f26-rc1`  
Source baseline: accepted `v2.1.6l-wc10-f25`  
Source SHA-256: `6aad843c7db5135c98bf476ecf73e897a336a0d6b9345cf800a887c8d975e212`  
Current status: `Release Candidate 1 / pending user validation`

Production URL:  
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-busted URL for this build:  
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f26rc1

## Vehicle Detail odometer fields

Vehicle Detail now groups these odometer fields together:

- Starting Odometer
- Last Refuel Mileage
- Last Maintenance Mileage
- Current Mileage

Last Refuel Mileage shows the odometer from the most recent active Refuel/Fuel entry by date/time that has an odometer value.

Last Maintenance Mileage shows the odometer from the most recent active Maintenance entry by date/time that has an odometer value.

Current Mileage shows the most recent valid odometer reading by date/time across Starting Odometer, Refuel/Fuel entries, and Maintenance entries.

A field is blank only when its source has no valid odometer value.

## Mileage Error warnings

Mileage normally cannot go backward over time. If a newer dated odometer reading is lower than an older dated odometer reading, the app shows a Mileage Error warning.

Mileage Error warnings are informational and do not block saving. Correct the date, time, or odometer value to clear the warning.

Warnings appear on:

- Vehicle Detail
- affected Fuel record pages
- affected Maintenance record pages

## Record delete parity

Fuel, Maintenance, and Insurance records use aligned delete choices:

- Delete Permanently
- Archive Instead
- Cancel

## Deployment note

Use the cache-busting URL for validation:

https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f26rc1
