# REBUILT INSTALL ZIP NOTE

Purpose:
- Rebuild the install zip from the config-patched v2.2.0 candidate.
- Fold in the controlled documentation correction so the install package matches the actual build state.

Rebuild basis:
- Source package: RGBMileage_v2.2.0_build_candidate_1_config_patched.zip
- Runtime code preserved from the config-patched candidate
- Documentation corrected: README.md and CHANGELOG.md

Expected install indicators:
- index.html references v=220 assets
- app.js contains Firebase-aware code path
- index.html contains the verified Firebase config block
- manifest.json start_url includes ?v=220
- sw.js uses the v220 cache/version line
