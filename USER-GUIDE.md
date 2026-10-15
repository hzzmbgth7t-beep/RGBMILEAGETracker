# RGB Mileage User Guide

Build: `v2.1.6l-wc10-f29-rc4`
Cache: `216lwc10f29rc4`
Guide release: `v2.1.6l-wc10-f29-rc4`
Source baseline: accepted `v2.1.6l-wc10-f28`
Current status: `Release candidate — pending user validation`

Production URL:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/

Cache-busted URL for this build:
https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/?v=216lwc10f29rc4

The same guide is built into the app (Settings → User Guide). Both are generated from one source for every release.

RGB Mileage tracks fuel, maintenance, and insurance for up to three vehicles. Your data is saved on your device first and copied to your private cloud account when you are signed in. Each person who signs in sees only their own vehicles.

## Install on iPhone or iPad

1. Open **Safari** and go to https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
2. Tap the **Share** button (the square with an arrow pointing up). On iPhone it is at the bottom of the screen; on iPad it is at the top right.
3. Scroll down and tap **Add to Home Screen**. If you don't see it, tap **Edit Actions** and add it.
4. Leave the name as **RGB Mileage** and tap **Add**.
5. Close Safari and open RGB Mileage from the new Home Screen icon.

Always open the app from the Home Screen icon. Safari, the GitHub app, and other in-app browsers each keep a separate copy of the data.

## Install on Android

1. Open **Chrome** and go to https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/
2. Tap the **⋮** menu at the top right.
3. Tap **Add to Home screen** (on some phones it says **Install app**).
4. Tap **Install** or **Add**, then confirm adding the icon to your Home screen.
5. Open RGB Mileage from the new icon.

Samsung Internet works the same way: tap the menu (☰), then **Add page to**, then **Home screen**.

## Getting an account and signing in

Accounts are by invitation only. Ask the app administrator to create one for you. You will get your email address and a temporary password.

1. Open the app. The **Sign In** screen appears when you are not signed in.
2. Enter your email and temporary password, then tap **Sign In**.
3. Go to Settings → **Open Cloud Sync** → **Change Password** and choose your own password (at least 8 characters).

The first time you sign in, the app offers to set up Face ID and points you to this guide.

To use the app without an account, tap **Not Now — Use This Device Only**. Your data then stays on that device only. You can sign in later from Settings.

## Home screen

Home shows one circle per vehicle, with its photo and last refuel mileage.

| Action | What happens |
| --- | --- |
| Tap a vehicle circle | Opens a new Fuel entry for that vehicle |
| Press and hold a circle | Opens the vehicle page: details, records, Edit Vehicle, Maintenance Entry, Insurance Entry |
| Tap an **Add Vehicle** circle | Opens the form to add a vehicle |

The bar at the bottom has **Home**, **Reports**, **Data** (backup, restore, CSV import), and **Settings**. **‹ Back** at the top returns to the previous screen.

## Vehicles

Tap an **Add Vehicle** circle to add a vehicle. To change one, press and hold its circle, then tap **Edit Vehicle**.

- **Year, Make, Model, Badge** make up the vehicle's name.
- **Custom Label** (up to 50 characters) is shown instead of Year/Make/Model.
- **Vehicle Image** is the circle photo. It syncs to your other devices.
- **Acquisition Record** holds the purchase date, starting odometer, price, and seller.
- **Status** is Active or Archived.

Tap **Save Vehicle** to keep the changes, or **Clear & Exit** to discard them. To change the order of the circles, go to Settings → **Vehicle Order**. Position 1 is the large circle in portrait view.

## Fuel, maintenance, and insurance records

| Record | How to open it | Main fields |
| --- | --- | --- |
| Fuel | Tap the vehicle circle | Date, odometer, gallons, grade, station, price/gal or total. Miles and MPG fill in automatically. |
| Maintenance | Hold the circle → **Maintenance Entry** | Date, category, odometer, cost, location, provider |
| Insurance | Hold the circle → **Insurance Entry** | Agency, policy number, dates, agreed value, premium, agent |

Tap **Save** to save, or **Cancel** to leave without saving. Earlier records for that vehicle are listed under the form. Tap one to view, edit, archive, or delete it.

For fuel cost, set **Cost Source** to **Calculated** to work out the total from the price per gallon, or **Entered** to type the total yourself.

## Reports

Tap **Reports** in the bottom bar. The reports are Fuel History, MPG, Maintenance, Insurance History, and Vehicle Summary. Archived records are left out.

## Cloud Sync

While you are signed in, every save is copied to your cloud account within a few seconds. Your other devices pick up changes when they open the app or when you tap **Sync Now**. Vehicle photos sync too.

- **Offline:** keep using the app. Changes wait on the device and upload when you are back online.
- **Status:** Settings → **Open Cloud Sync** shows who is signed in and when the last sync happened.
- **New device:** install the app and sign in. If that device already has different data, you'll be asked to **Choose Which Data to Keep**. Pick **Use Cloud Data on This Device** unless you know the device has the newer data.
- **Shared device:** if the device holds someone else's data, the app asks before switching it to your account. The other person's data stays in their own cloud account.
- **Sync Paused:** if one save would delete more than 10 items from the cloud, sync stops and asks first. **Restore This Device from Cloud** undoes the deletion. **Remove Them from the Cloud Too** confirms it.
- **Change Password:** Settings → Open Cloud Sync → **Change Password**.
- **Sign Out** stops syncing on that device. The data stays on the device.

## Face ID and fingerprint

Face ID (or fingerprint or face unlock on Android) can lock the app and sign you in without a password. Set it up on each device after you sign in.

1. Settings → Face ID → **Set Up Face ID**, then approve the prompt.
2. **Require Face ID to open the app** turns the lock on or off.
3. **Lock again after** sets how long the app can be in the background before it asks again.

If Face ID fails, tap **Use Cloud Password**. On the Sign In screen, **Sign In with Face ID** signs you in without typing your password. **Turn Off Face ID on This Device** removes it.

The lock hides the screen. It does not encrypt the data stored on the device.

## Backup and restore

**Back up:** Data → **Create JSON Backup**, then save the file to Files, iCloud, or Google Drive. Do this before a reset or reinstall.

**Restore:** Data → **Restore JSON** → pick the file → choose a Restore Mode → **Restore JSON Backup**.

| Restore Mode | What it does |
| --- | --- |
| Replace | Replaces all data on the device with the backup |
| Update | Updates matching records and adds missing ones (safest) |
| Duplicate | Adds the backup's records as copies |
| Skip | Adds only records that aren't already there |

**CSV Import** (Data screen) brings in fuel and maintenance records from a spreadsheet. Tap **Preview Import** first, then **Save Previewed Rows**.

## Updates

When an **Update** badge appears on Home, tap it to load the new version. If the app still shows an old version, go to Settings → **Reset App Cache / Reload Current Version**. Your data is kept. The version number is shown under the app name on Home and at the top of Settings.

This guide is updated with every new version of the app.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| App shows an old version or old data | Settings → **Reset App Cache / Reload Current Version**, then sign in |
| Vehicles are blank on a new device | Sign in, then choose **Use Cloud Data on This Device** |
| Photos missing | Tap **Sync Now** on the device that has the photos, then on the other device |
| Forgot password | Ask the app administrator to set a new temporary password |
| Face ID not offered | Sign in first and open the app from the Home Screen icon |
| Data gone after deleting the app | Sign in to restore from the cloud, or restore a JSON backup in **Update** mode |

**Clear Local Data** (bottom of Settings) erases this device only. It never deletes cloud data.
