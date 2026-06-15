# CHANGELOG

## v2.2.0
- Introduced Firebase-aware application path for auth and Firestore integration
- Added explicit create-account, sign-in, sign-out, cloud refresh, migrate-to-cloud, and load-from-cloud actions
- Preserved accepted Fuel / Maintenance / Insurance merged-screen behavior through the centralized save flow
- Retained import/export capability
- Updated runtime asset/cache versioning to `220`
- Inserted verified Firebase web config into `index.html`

## Packaging update
- Rebuilt the deployment package as a full `v2.2.0` install package instead of a build-candidate package
- Corrected package-facing documentation to align with the deployed runtime version
