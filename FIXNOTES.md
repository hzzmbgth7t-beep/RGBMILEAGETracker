# FIXNOTES

App Site Address: https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Current Version: 2.1.2c
Release Date: 2026-06-06

## v2.1.2c Fix Notes

The v2.1.2b restore screen was calling normalizeData(), but the function was not present in the generated app.js file. This caused valid backups to be rejected with the generic invalid JSON message.

v2.1.2c adds normalizeData() and validates JSON backup compatibility before packaging.
