# CHANGELOG

## v2.1.6l-wc10-f26-rc1 — 08/16/2026

- Built from accepted `v2.1.6l-wc10-f25`.
- Source SHA-256: `6aad843c7db5135c98bf476ecf73e897a336a0d6b9345cf800a887c8d975e212`.
- Added Vehicle Detail odometer summary fields: Last Refuel Mileage, Last Maintenance Mileage, and Current Mileage.
- Last Refuel Mileage uses the most recent active Fuel/Refuel record by date/time with valid odometer data.
- Last Maintenance Mileage uses the most recent active Maintenance record by date/time with valid odometer data.
- Current Mileage uses the most recent valid odometer reading by date/time across Starting Odometer, Fuel, and Maintenance.
- Added non-blocking Mileage Error warnings when a newer dated reading is lower than an older dated reading.
- Added Mileage Error warning visibility to Vehicle Detail and affected Fuel/Maintenance record pages.
- Updated cache token to `216lwc10f26rc1` and included cache-busting URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f26rc1.
- Preserved accepted F25 Maintenance and Insurance delete parity.
- Status: Release Candidate 1 / pending user validation.

## v2.1.6l-wc10-f25 — 08/16/2026

- User validated and promoted as accepted baseline.
- Accepted package SHA-256: `6aad843c7db5135c98bf476ecf73e897a336a0d6b9345cf800a887c8d975e212`.
- Added Maintenance previous-record row text with date, category, and odometer when available.
- Added Maintenance delete/archive/cancel parity with Fuel.
- Added Insurance delete/archive/cancel parity with Fuel.

## v2.1.6l-wc10-f24 — 08/03/2026

- Recorded accepted baseline per user report.
- F20, F21, F22, and F23 remain rejected failure evidence only.
