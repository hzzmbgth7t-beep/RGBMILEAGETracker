# RGB Mileage

Version 2.0.7  
Release Date: 2026-06-03

RGB Mileage is a vehicle-first Progressive Web App for fuel, mileage, maintenance, insurance, import, and ownership tracking.

## Current Release

This release preserves the established RGB Mileage version history and continues from v2.0.6 as v2.0.7.

This is a clean-build release that restores and protects the original large vehicle-circle Home Screen as the primary navigation method.

## Key Updates in v2.0.7

- User-facing app name is RGB Mileage.
- Package and backup naming now use RGBM with version number and date.
- Version number appears at the bottom of every screen.
- Long press on a Home Screen vehicle circle opens the editable Vehicle Information screen directly.
- iPhone/Safari image context menu is suppressed on Home Screen vehicle circles.
- Added Settings > Manage Vehicle Order > Swap Vehicle Positions.
- Added vehicle photo crop/framing tool with zoom out, drag positioning, live circular preview, saved crop settings, and Reset Photo Crop.
- Added root-level icon files only; no required icon folders.
- Uses the approved CJ-dominant RGB Mileage icon.
- Added CSV/XLSX import screen with column mapping, preview, errors, duplicate detection, Record ID, and Entry Sequence support.
- Added Entry Type and Data Quality fields.
- Added Vehicle Acquisition Date and Starting Odometer.
- Added optional fuel price fields with two-decimal Fuel Price Per Gallon.
- Added blank-safe historical import support.
- Includes README.md and this versioned README with identical content.

## Installation

1. Unzip the package.
2. Upload all files directly to the root of the GitHub repository.
3. Enable GitHub Pages.
4. Open the GitHub Pages URL in Safari.
5. Use Share > Add to Home Screen.

## Important iPhone Upload Note

All icon files are located in the root directory. Do not create or require an /icons folder.

## Data

Data is currently stored locally in browser storage. Export or backup regularly.

Supabase database integration is planned for a future release.
