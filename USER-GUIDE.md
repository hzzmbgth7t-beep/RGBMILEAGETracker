# User Guide

**Build:** `v2.1.6l-wc10-f20`  
**Build date:** `08/02/2026`  
**Governance:** `v1.7`

## Home portrait

The Home screen uses three equal vehicle circles. In portrait, F20 calculates the largest shared circle diameter that fits the rendered Home area, labels, title, and 58 px menu.

Custom Labels are included in the Home label measurement.

## Custom Label

Open a vehicle, select **Edit Vehicle**, and enter up to 50 characters in **Custom Label**.

- When the field contains text, that text is shown everywhere the vehicle name appears.
- When the field is blank, RGB Mileage shows `Year Make Model Badge`.
- Leading and trailing spaces are removed.
- JSON backups preserve the field.

## Bottom menu

Home, Reports, Data, Settings, vehicle, and record screens use the same compact 58 px bottom-menu height.

## Offline update

The four-line update pill applies a waiting offline service worker and reloads RGB Mileage after activation.

Cache URL: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f20
