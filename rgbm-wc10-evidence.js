"use strict";

(function initRGBMWC10Evidence(root, factory) {
  const api = factory(
    root && root.RGBMDataV3
      ? root.RGBMDataV3
      : typeof require === "function"
        ? require("./rgbm-data-v3.js")
        : null,
  );

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.RGBMWC10Evidence = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createEvidenceApi(dataV3) {
  if (!dataV3) {
    throw new Error("RGBMDataV3 is required.");
  }

  const EVIDENCE_VERSION = "wc10-migration-evidence-v1";
  const COLLECTIONS = [
    "vehicleAcquisitionRecords",
    "fuelRecords",
    "maintenanceRecords",
    "insuranceRecords",
  ];

  function cleanText(value) {
    return value === null || value === undefined ? "" : String(value).trim();
  }

  function finiteNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  }

  function safeParse(raw) {
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function getStorageValue(storage, key) {
    try {
      return storage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function findLegacySource(storage) {
    for (const key of dataV3.LEGACY_KEYS) {
      const raw = getStorageValue(storage, key);
      const parsed = safeParse(raw);

      if (parsed) {
        return {
          key,
          raw,
          parsed,
        };
      }
    }

    return null;
  }

  function recordId(record) {
    return cleanText(record && (record.recordId || record.id));
  }

  function fnv1a(value) {
    let hash = 0x811c9dc5;

    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193);
    }

    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function collectionFingerprint(records, vehicleId) {
    const ids = asArray(records)
      .filter((record) => cleanText(record && record.vehicleId) === vehicleId)
      .map(recordId)
      .filter(Boolean)
      .sort();

    return {
      count: ids.length,
      fingerprint: fnv1a(ids.join("|")),
    };
  }

  function summarizeVehicle(state, vehicle, position) {
    const collections = {};

    for (const collectionName of COLLECTIONS) {
      collections[collectionName] = collectionFingerprint(
        state[collectionName],
        vehicle.vehicleId,
      );
    }

    return {
      position,
      vehicleId: vehicle.vehicleId,
      setupComplete: Boolean(vehicle.setupComplete),
      collections,
    };
  }

  function summarizeCanonical(state) {
    const orderedVehicles = dataV3.getOrderedVehicles(state);

    return {
      schemaVersion: cleanText(state.schemaVersion),
      migrationVersion: cleanText(state.migrationVersion),
      vehicleCount: asArray(state.vehicles).length,
      configuredCount: asArray(state.vehicles).filter(
        (vehicle) => vehicle && vehicle.setupComplete,
      ).length,
      blankCount: asArray(state.vehicles).filter(
        (vehicle) => vehicle && !vehicle.setupComplete,
      ).length,
      vehicleOrder: asArray(state.vehicleOrder).slice(),
      vehicles: orderedVehicles.map(
        (vehicle, index) => summarizeVehicle(state, vehicle, index + 1),
      ),
      validation: dataV3.validateStateV3(state),
    };
  }

  function makeExpectedMigration(legacyState, appVersion) {
    let sequence = 0;

    return dataV3.migrateToV3(legacyState, {
      appVersion: cleanText(appVersion),
      sourceKey: "evidence-comparison",
      now: () => "2000-01-01T00:00:00.000Z",
      idFactory(prefix) {
        sequence += 1;
        return `${prefix}-EVIDENCE-${String(sequence).padStart(3, "0")}`;
      },
      defaults: {
        fuelGrades: ["Regular", "Other"],
        stations: ["Other"],
        maintenanceCategories: ["Other"],
        settings: {
          lastBackupDate: "",
          showArchived: false,
        },
        nextEntrySequence: 1,
      },
    }).state;
  }

  function result(name, value, details = {}) {
    return {
      name,
      result: value,
      ...details,
    };
  }

  function compareExistingVehicles(expected, actual, legacyState) {
    const legacyIds = asArray(legacyState.vehicles)
      .filter((vehicle) => vehicle && typeof vehicle === "object")
      .map((vehicle) => cleanText(vehicle.vehicleId || vehicle.id))
      .filter(Boolean);

    const expectedById = new Map(
      summarizeCanonical(expected).vehicles.map(
        (vehicle) => [vehicle.vehicleId, vehicle],
      ),
    );
    const actualById = new Map(
      summarizeCanonical(actual).vehicles.map(
        (vehicle) => [vehicle.vehicleId, vehicle],
      ),
    );

    const comparisons = [];

    for (const vehicleId of legacyIds) {
      const expectedVehicle = expectedById.get(vehicleId);
      const actualVehicle = actualById.get(vehicleId);
      const collectionChecks = {};

      for (const collectionName of COLLECTIONS) {
        const expectedCollection = expectedVehicle
          ? expectedVehicle.collections[collectionName]
          : null;
        const actualCollection = actualVehicle
          ? actualVehicle.collections[collectionName]
          : null;

        collectionChecks[collectionName] = {
          result: (
            expectedCollection
            && actualCollection
            && expectedCollection.count === actualCollection.count
            && expectedCollection.fingerprint === actualCollection.fingerprint
          ) ? "PASS" : "FAIL",
          expected: expectedCollection,
          actual: actualCollection,
        };
      }

      comparisons.push({
        vehicleId,
        idPreserved: actualVehicle ? "PASS" : "FAIL",
        setupState: (
          expectedVehicle
          && actualVehicle
          && expectedVehicle.setupComplete === actualVehicle.setupComplete
        ) ? "PASS" : "FAIL",
        collections: collectionChecks,
      });
    }

    return comparisons;
  }

  function allVehicleComparisonsPass(comparisons) {
    return comparisons.every((comparison) => (
      comparison.idPreserved === "PASS"
      && comparison.setupState === "PASS"
      && Object.values(comparison.collections).every(
        (collection) => collection.result === "PASS",
      )
    ));
  }

  function relativeExistingOrder(order, existingIds) {
    return asArray(order).filter((vehicleId) => existingIds.includes(vehicleId));
  }

  function generateEvidence(storage, state, environment = {}) {
    const generatedAt = cleanText(environment.generatedAt)
      || new Date().toISOString();
    const build = cleanText(environment.build)
      || cleanText(state && (state.buildId || state.appVersion));
    const buildDate = cleanText(environment.buildDate)
      || cleanText(state && state.buildDate);
    const cacheRevision = cleanText(environment.cacheRevision);
    const canonicalUrl = cleanText(environment.url);
    const canonical = summarizeCanonical(state);
    const legacy = findLegacySource(storage);
    const activeRaw = getStorageValue(storage, dataV3.ACTIVE_KEY);
    const pendingRaw = getStorageValue(storage, dataV3.PENDING_KEY);

    const checks = [
      result(
        "canonical_validation",
        canonical.validation.valid ? "PASS" : "FAIL",
        { errors: canonical.validation.errors },
      ),
      result(
        "exactly_three_vehicle_records",
        canonical.vehicleCount === 3 ? "PASS" : "FAIL",
        { actual: canonical.vehicleCount },
      ),
      result(
        "exactly_three_order_entries",
        canonical.vehicleOrder.length === 3
          && new Set(canonical.vehicleOrder).size === 3
          ? "PASS"
          : "FAIL",
        { actual: canonical.vehicleOrder },
      ),
      result(
        "active_v3_key_present",
        activeRaw ? "PASS" : "FAIL",
        { key: dataV3.ACTIVE_KEY },
      ),
      result(
        "pending_key_absent",
        pendingRaw ? "FAIL" : "PASS",
        { key: dataV3.PENDING_KEY },
      ),
      result(
        "build_identity_matches_active_state",
        build && cleanText(state && (state.buildId || state.appVersion)) === build
          ? "PASS"
          : "FAIL",
        {
          expected: build,
          actual: cleanText(state && (state.buildId || state.appVersion)),
        },
      ),
      result(
        "canonical_launch_url_revision",
        cacheRevision
          ? (
            canonicalUrl.includes(`v=${cacheRevision}`)
            && !/\/index\.html(?:[?#]|$)/i.test(canonicalUrl)
              ? "PASS"
              : "FAIL"
          )
          : "N/A",
        {
          expectedRevision: cacheRevision || null,
          actualUrl: canonicalUrl || null,
        },
      ),
    ];

    let migrationAcceptance = "N/A";
    let legacyComparison = {
      result: "N/A",
      sourceKey: null,
      existingVehicleComparisons: [],
    };

    if (legacy) {
      let expected = null;
      let expectedError = null;

      try {
        expected = makeExpectedMigration(legacy.parsed, build);
      } catch (error) {
        expectedError = {
          code: cleanText(error && error.code) || "EXPECTED_MIGRATION_FAILED",
          message: cleanText(error && error.message),
        };
      }

      if (!expected) {
        checks.push(
          result("legacy_comparison_available", "FAIL", {
            error: expectedError,
          }),
        );
        legacyComparison = {
          result: "FAIL",
          sourceKey: legacy.key,
          error: expectedError,
          existingVehicleComparisons: [],
        };
        migrationAcceptance = "FAIL";
      } else {
        const expectedSummary = summarizeCanonical(expected);
        const existingIds = asArray(legacy.parsed.vehicles)
          .filter((vehicle) => vehicle && typeof vehicle === "object")
          .map((vehicle) => cleanText(vehicle.vehicleId || vehicle.id))
          .filter(Boolean);
        const comparisons = compareExistingVehicles(
          expected,
          state,
          legacy.parsed,
        );
        const expectedExistingOrder = relativeExistingOrder(
          expectedSummary.vehicleOrder,
          existingIds,
        );
        const actualExistingOrder = relativeExistingOrder(
          canonical.vehicleOrder,
          existingIds,
        );
        const orderPreserved = (
          JSON.stringify(expectedExistingOrder)
          === JSON.stringify(actualExistingOrder)
        );
        const thirdPositionStateValid = (
          canonical.vehicleCount === expectedSummary.vehicleCount
          && canonical.configuredCount >= expectedSummary.configuredCount
          && canonical.blankCount <= expectedSummary.blankCount
          && (
            canonical.configuredCount + canonical.blankCount
            === canonical.vehicleCount
          )
        );
        const legacyRetained = Boolean(
          getStorageValue(storage, legacy.key),
        );

        checks.push(
          result(
            "legacy_source_retained",
            legacyRetained ? "PASS" : "FAIL",
            { key: legacy.key },
          ),
          result(
            "existing_vehicle_ids_and_records_preserved",
            allVehicleComparisonsPass(comparisons) ? "PASS" : "FAIL",
          ),
          result(
            "existing_vehicle_relative_order_preserved",
            orderPreserved ? "PASS" : "FAIL",
            {
              expected: expectedExistingOrder,
              actual: actualExistingOrder,
            },
          ),
          result(
            "third_position_state_valid",
            thirdPositionStateValid ? "PASS" : "FAIL",
            {
              expectedMinimumConfigured:
                expectedSummary.configuredCount,
              actualConfigured: canonical.configuredCount,
              expectedMaximumBlank: expectedSummary.blankCount,
              actualBlank: canonical.blankCount,
              configuredThirdVehicleAllowed: true,
            },
          ),
        );

        legacyComparison = {
          result: (
            legacyRetained
            && allVehicleComparisonsPass(comparisons)
            && orderPreserved
            && thirdPositionStateValid
          ) ? "PASS" : "FAIL",
          sourceKey: legacy.key,
          expectedConfiguredCount: expectedSummary.configuredCount,
          actualConfiguredCount: canonical.configuredCount,
          expectedBlankCount: expectedSummary.blankCount,
          actualBlankCount: canonical.blankCount,
          expectedExistingOrder,
          actualExistingOrder,
          existingVehicleComparisons: comparisons,
        };
        migrationAcceptance = legacyComparison.result;
      }
    } else {
      const reconciliation = state
        && typeof state.recoveryReconciliation === "object"
        ? state.recoveryReconciliation
        : null;
      const reconciliationVersion = cleanText(
        reconciliation && reconciliation.version,
      );
      const sourceSnapshot = reconciliation
        && typeof reconciliation.sourceSnapshot === "object"
        ? reconciliation.sourceSnapshot
        : {};
      const sourceCounts = reconciliation
        && reconciliation.sourceCounts
        && typeof reconciliation.sourceCounts.standalone === "object"
        ? reconciliation.sourceCounts.standalone
        : {};
      const candidateCounts = reconciliation
        && typeof reconciliation.candidateCounts === "object"
        ? reconciliation.candidateCounts
        : {};
      const preservation = reconciliation
        && typeof reconciliation.preservationDecisions === "object"
        ? reconciliation.preservationDecisions
        : {};
      const preservedIds = asArray(
        preservation.firstTwoVehicleIdsPreserved,
      );
      const thirdVehicleId = cleanText(
        preservation.thirdVehicleIdAdded,
      );
      const archiveMetadataPresent = Boolean(
        cleanText(sourceSnapshot.sha256)
        && cleanText(sourceSnapshot.pendingFingerprint)
        && cleanText(sourceSnapshot.legacyFingerprint),
      );
      const firstTwoPreserved = (
        preservedIds.length === 2
        && canonical.vehicleOrder[0] === preservedIds[0]
        && canonical.vehicleOrder[1] === preservedIds[1]
      );
      const thirdVehiclePreserved = (
        canonical.configuredCount === 3
        && Boolean(thirdVehicleId)
        && canonical.vehicleOrder[2] === thirdVehicleId
      );
      const countChecks = [
        ["fuelRecordCount", asArray(state.fuelRecords).length],
        [
          "maintenanceRecordCount",
          asArray(state.maintenanceRecords).length,
        ],
        [
          "insuranceRecordCount",
          asArray(state.insuranceRecords).length,
        ],
        [
          "acquisitionRecordCount",
          asArray(state.vehicleAcquisitionRecords).length,
        ],
        ["attachmentCount", asArray(state.attachments).length],
      ];
      const countsNonReducing = (
        Number(canonical.configuredCount)
          >= Number(sourceCounts.configuredCount || 0)
        && countChecks.every(([key, actual]) => (
          Number(actual) >= Number(sourceCounts[key] || 0)
          && Number(actual) === Number(candidateCounts[key])
        ))
      );
      const reconciliationRecognized = (
        reconciliationVersion
          === dataV3.RECONCILIATION_VERSION
      );

      if (reconciliationRecognized) {
        checks.push(
          result(
            "external_recovery_snapshot_archived",
            archiveMetadataPresent ? "PASS" : "FAIL",
            {
              snapshotSha256Present: Boolean(
                cleanText(sourceSnapshot.sha256),
              ),
              pendingFingerprintPresent: Boolean(
                cleanText(sourceSnapshot.pendingFingerprint),
              ),
              legacyFingerprintPresent: Boolean(
                cleanText(sourceSnapshot.legacyFingerprint),
              ),
            },
          ),
          result(
            "reconciled_original_vehicle_ids_and_order",
            firstTwoPreserved ? "PASS" : "FAIL",
            {
              expected: preservedIds,
              actual: canonical.vehicleOrder.slice(0, 2),
            },
          ),
          result(
            "reconciled_third_vehicle_present",
            thirdVehiclePreserved ? "PASS" : "FAIL",
            {
              expected: thirdVehicleId,
              actual: canonical.vehicleOrder[2],
            },
          ),
          result(
            "reconciled_counts_non_reducing",
            countsNonReducing ? "PASS" : "FAIL",
            {
              sourceCounts,
              candidateCounts,
              actual: {
                configuredCount: canonical.configuredCount,
                fuelRecordCount: asArray(state.fuelRecords).length,
                maintenanceRecordCount:
                  asArray(state.maintenanceRecords).length,
                insuranceRecordCount:
                  asArray(state.insuranceRecords).length,
                acquisitionRecordCount:
                  asArray(state.vehicleAcquisitionRecords).length,
                attachmentCount: asArray(state.attachments).length,
              },
            },
          ),
        );

        const reconciledPass = (
          archiveMetadataPresent
          && firstTwoPreserved
          && thirdVehiclePreserved
          && countsNonReducing
        );
        legacyComparison = {
          result: reconciledPass ? "PASS" : "FAIL",
          sourceKey: "external recovery snapshot",
          reconciliationVersion,
          existingVehicleComparisons: [],
          sourceCounts,
          candidateCounts,
        };
        migrationAcceptance = legacyComparison.result;
      } else {
        checks.push(
          result("legacy_source_retained", "N/A", {
            reason: "No legacy storage key was found.",
          }),
        );
      }
    }

    let idempotency = "FAIL";
    let idempotencyError = null;

    try {
      const second = dataV3.migrateToV3(clone(state), {
        appVersion: state.appVersion,
      });
      idempotency = JSON.stringify(second.state) === JSON.stringify(state)
        ? "PASS"
        : "FAIL";
    } catch (error) {
      idempotencyError = {
        code: cleanText(error && error.code),
        message: cleanText(error && error.message),
      };
    }

    checks.push(
      result("active_state_idempotency", idempotency, {
        error: idempotencyError,
      }),
    );

    const criticalResults = checks
      .map((check) => check.result)
      .filter((value) => value !== "N/A");
    const overall = criticalResults.every((value) => value === "PASS")
      ? "PASS"
      : "FAIL";

    return {
      evidenceVersion: EVIDENCE_VERSION,
      generatedAt,
      build,
      buildDate,
      phase: "migration verification",
      result: overall,
      migrationAcceptance,
      environment: {
        userAgent: cleanText(environment.userAgent),
        standalone: environment.standalone === true,
        orientation: cleanText(environment.orientation),
        url: canonicalUrl,
        observedUrl: cleanText(environment.observedUrl),
        urlNormalized: environment.urlNormalized === true,
        urlNormalizationError: cleanText(
          environment.urlNormalizationError,
        ),
        cacheRevision,
        visibilityState: cleanText(environment.visibilityState),
        homeViewportStrategy: cleanText(
          environment.homeViewportStrategy,
        ),
        visualViewport: (
          environment.visualViewport
          && typeof environment.visualViewport === "object"
        )
          ? {
            width: finiteNumber(environment.visualViewport.width),
            height: finiteNumber(environment.visualViewport.height),
            offsetTop: finiteNumber(
              environment.visualViewport.offsetTop,
            ),
            offsetLeft: finiteNumber(
              environment.visualViewport.offsetLeft,
            ),
          }
          : null,
        networkOnline: environment.networkOnline !== false,
        serviceWorkerSupported:
          environment.serviceWorkerSupported === true,
        serviceWorkerControlled:
          environment.serviceWorkerControlled === true,
        offlineShellReady: environment.offlineShellReady === true,
        offlineUpdateReady: environment.offlineUpdateReady === true,
      },
      storage: {
        activeKey: dataV3.ACTIVE_KEY,
        activeKeyPresent: Boolean(activeRaw),
        pendingKey: dataV3.PENDING_KEY,
        pendingKeyPresent: Boolean(pendingRaw),
        legacySourceKey: legacy ? legacy.key : null,
        legacySourcePresent: Boolean(legacy),
      },
      canonical,
      legacyComparison,
      checks,
      privacy: {
        containsImages: false,
        containsVin: false,
        containsPlate: false,
        containsRecordAmounts: false,
        recordEvidence: "counts and deterministic record-ID fingerprints only",
      },
    };
  }

  function summaryText(report) {
    const lines = [
      `RGBM WC-10 Migration Evidence`,
      `Generated: ${report.generatedAt}`,
      `Build: ${report.build}`,
      `Build date: ${report.buildDate || "N/A"}`,
      `Launch URL: ${report.environment.url || "N/A"}`,
      `Observed URL: ${report.environment.observedUrl || "N/A"}`,
      `URL normalized: ${report.environment.urlNormalized ? "YES" : "NO"}`,
      `Home viewport strategy: ${report.environment.homeViewportStrategy || "N/A"}`,
      `Visual viewport: ${
        report.environment.visualViewport
          ? `${report.environment.visualViewport.width}x${report.environment.visualViewport.height}`
          : "N/A"
      }`,
      `Network online: ${report.environment.networkOnline ? "YES" : "NO"}`,
      `Offline shell ready: ${
        report.environment.offlineShellReady ? "YES" : "NO"
      }`,
      `Service worker controlled: ${
        report.environment.serviceWorkerControlled ? "YES" : "NO"
      }`,
      `Overall: ${report.result}`,
      `Migration acceptance: ${report.migrationAcceptance}`,
      `Schema: ${report.canonical.schemaVersion}`,
      `Migration: ${report.canonical.migrationVersion}`,
      `Vehicles: ${report.canonical.vehicleCount}`,
      `Configured: ${report.canonical.configuredCount}`,
      `Blank: ${report.canonical.blankCount}`,
      `Order: ${report.canonical.vehicleOrder.join(", ")}`,
      `Legacy source: ${report.storage.legacySourceKey || "N/A"}`,
      "",
      "Checks:",
    ];

    for (const check of report.checks) {
      lines.push(`${check.result} ${check.name}`);
    }

    return lines.join("\n");
  }

  return Object.freeze({
    EVIDENCE_VERSION,
    findLegacySource,
    summarizeCanonical,
    generateEvidence,
    summaryText,
  });
});
