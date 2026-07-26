"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const dataV3 = require("./rgbm-data-v3.js");
const evidenceApi = require("./rgbm-wc10-evidence.js");

const FIXED_NOW = "2026-07-25T12:00:00.000Z";
const fixtureDirectory = __dirname;

function fixture(name) {
  return JSON.parse(
    fs.readFileSync(path.join(fixtureDirectory, `FIXTURE-${name}`), "utf8"),
  );
}

function context() {
  let sequence = 0;

  return {
    appVersion: "2.1.6l-wc10",
    now: () => FIXED_NOW,
    idFactory(prefix) {
      sequence += 1;
      return `${prefix}-TEST-${String(sequence).padStart(3, "0")}`;
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
  };
}

class MemoryStorage {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial));
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

function environment() {
  return {
    generatedAt: FIXED_NOW,
    userAgent: "WC10 Test Harness",
    standalone: true,
    orientation: "portrait-primary",
    url: "https://example.test/?v=216lwc10mv1",
    visibilityState: "visible",
  };
}

function migratedStorage(fixtureName = "legacy-two-configured.json") {
  const legacyRaw = JSON.stringify(fixture(fixtureName));
  const storage = new MemoryStorage({
    RGBM_DATA_v213d: legacyRaw,
  });
  const loaded = dataV3.loadCanonicalState(storage, context());

  return {
    storage,
    state: loaded.state,
    legacyRaw,
  };
}

const tests = [];

function test(name, functionUnderTest) {
  tests.push({ name, functionUnderTest });
}

test("EV-01 valid two-vehicle migration evidence passes", () => {
  const { storage, state } = migratedStorage();
  const report = evidenceApi.generateEvidence(
    storage,
    state,
    environment(),
  );

  assert.equal(report.result, "PASS");
  assert.equal(report.migrationAcceptance, "PASS");
  assert.equal(report.canonical.vehicleCount, 3);
  assert.equal(report.canonical.configuredCount, 2);
  assert.equal(report.canonical.blankCount, 1);
  assert.equal(report.legacyComparison.existingVehicleComparisons.length, 2);
  assert.equal(
    report.legacyComparison.existingVehicleComparisons.every(
      (vehicle) => vehicle.idPreserved === "PASS",
    ),
    true,
  );
});

test("EV-02 reversed legacy slot order is verified", () => {
  const { storage, state } = migratedStorage(
    "legacy-reversed-slots.json",
  );
  const report = evidenceApi.generateEvidence(
    storage,
    state,
    environment(),
  );

  assert.equal(report.result, "PASS");
  assert.deepEqual(
    report.legacyComparison.expectedExistingOrder,
    ["VEH-B", "VEH-A"],
  );
  assert.deepEqual(
    report.legacyComparison.actualExistingOrder,
    ["VEH-B", "VEH-A"],
  );
});

test("EV-03 changed record ownership fails comparison", () => {
  const { storage, state } = migratedStorage();
  const tampered = JSON.parse(JSON.stringify(state));
  tampered.fuelRecords[0].vehicleId = "VEH-B";

  const report = evidenceApi.generateEvidence(
    storage,
    tampered,
    environment(),
  );

  assert.equal(report.result, "FAIL");
  assert.equal(report.migrationAcceptance, "FAIL");
  assert.equal(
    report.checks.find(
      (check) => check.name === "existing_vehicle_ids_and_records_preserved",
    ).result,
    "FAIL",
  );
});

test("EV-04 new installation reports legacy comparison as N/A", () => {
  const storage = new MemoryStorage();
  const state = dataV3.createBlankDataV3(context());
  dataV3.commitMigratedState(storage, state, {
    sourceKey: "new-install",
  });

  const report = evidenceApi.generateEvidence(
    storage,
    state,
    environment(),
  );

  assert.equal(report.result, "PASS");
  assert.equal(report.migrationAcceptance, "N/A");
  assert.equal(report.storage.legacySourcePresent, false);
  assert.equal(
    report.checks.find(
      (check) => check.name === "legacy_source_retained",
    ).result,
    "N/A",
  );
});

test("EV-05 evidence excludes sensitive vehicle content", () => {
  const { storage, state } = migratedStorage();
  const privateState = JSON.parse(JSON.stringify(state));
  privateState.vehicles[0].vin = "SECRET-VIN-123";
  privateState.vehicles[0].plate = "SECRET-PLATE";
  privateState.vehicles[0].primaryPhoto = "data:image/jpeg;base64,SECRETIMAGE";
  privateState.fuelRecords[0].totalCost = "9876.54";
  dataV3.saveActiveState(storage, privateState, context());

  const report = evidenceApi.generateEvidence(
    storage,
    privateState,
    environment(),
  );
  const serialized = JSON.stringify(report);

  assert.equal(serialized.includes("SECRET-VIN-123"), false);
  assert.equal(serialized.includes("SECRET-PLATE"), false);
  assert.equal(serialized.includes("SECRETIMAGE"), false);
  assert.equal(serialized.includes("9876.54"), false);
  assert.equal(report.privacy.containsImages, false);
});

test("EV-06 pending migration data fails the evidence gate", () => {
  const { storage, state } = migratedStorage();
  storage.setItem(dataV3.PENDING_KEY, JSON.stringify(state));

  const report = evidenceApi.generateEvidence(
    storage,
    state,
    environment(),
  );

  assert.equal(report.result, "FAIL");
  assert.equal(
    report.checks.find(
      (check) => check.name === "pending_key_absent",
    ).result,
    "FAIL",
  );
});

test("EV-07 active state idempotency is verified", () => {
  const { storage, state } = migratedStorage();
  const report = evidenceApi.generateEvidence(
    storage,
    state,
    environment(),
  );

  assert.equal(
    report.checks.find(
      (check) => check.name === "active_state_idempotency",
    ).result,
    "PASS",
  );
});

test("EV-08 summary text contains only governed result fields", () => {
  const { storage, state } = migratedStorage();
  const report = evidenceApi.generateEvidence(
    storage,
    state,
    environment(),
  );
  const summary = evidenceApi.summaryText(report);

  assert.equal(summary.includes("Overall: PASS"), true);
  assert.equal(summary.includes("Migration acceptance: PASS"), true);
  assert.equal(summary.includes("Schema: 3.0.0"), true);
  assert.equal(summary.includes("SECRET"), false);
});

let failures = 0;

for (const { name, functionUnderTest } of tests) {
  try {
    functionUnderTest();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}`);
    console.error(error && error.stack ? error.stack : error);
  }
}

console.log("");
console.log(`Evidence tests: ${tests.length}`);
console.log(`Passed: ${tests.length - failures}`);
console.log(`Failed: ${failures}`);

process.exitCode = failures === 0 ? 0 : 1;
