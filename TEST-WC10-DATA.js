"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const dataV3 = require("./rgbm-data-v3.js");

const FIXED_NOW = "2026-07-25T12:00:00.000Z";
const fixtureDirectory = __dirname;

function fixture(name) {
  return JSON.parse(
    fs.readFileSync(path.join(fixtureDirectory, `FIXTURE-${name}`), "utf8"),
  );
}

function testContext() {
  let sequence = 0;
  return {
    appVersion: "2.1.6l-wc10",
    now: () => FIXED_NOW,
    idFactory(prefix) {
      sequence += 1;
      return `${prefix}-GEN-${String(sequence).padStart(3, "0")}`;
    },
    defaults: {
      fuelGrades: ["Regular", "Other"],
      stations: ["Other"],
      maintenanceCategories: ["Other"],
      nextEntrySequence: 1,
    },
  };
}

class MemoryStorage {
  constructor(initial = {}, options = {}) {
    this.values = new Map(Object.entries(initial));
    this.failOnSet = options.failOnSet || null;
    this.failureName = options.failureName || "QuotaExceededError";
  }

  get length() {
    return this.values.size;
  }

  key(index) {
    return Array.from(this.values.keys())[index] || null;
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    if (this.failOnSet === key) {
      const error = new Error(`Storage failure for ${key}`);
      error.name = this.failureName;
      throw error;
    }
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

const tests = [];

function test(name, functionUnderTest) {
  tests.push({ name, functionUnderTest });
}

function assertDataError(functionUnderTest, code) {
  assert.throws(
    functionUnderTest,
    (error) => error && error.name === "RGBMDataError" && error.code === code,
  );
}

test("MT-01 preserves two configured vehicles and appends one blank", () => {
  const input = fixture("legacy-two-configured.json");
  const result = dataV3.migrateToV3(input, testContext());
  const state = result.state;

  assert.equal(state.schemaVersion, "3.0.0");
  assert.equal(state.vehicles.length, 3);
  assert.deepEqual(state.vehicleOrder.slice(0, 2), ["VEH-A", "VEH-B"]);
  assert.equal(dataV3.getVehicleById(state, "VEH-A").setupComplete, true);
  assert.equal(dataV3.getVehicleById(state, "VEH-B").setupComplete, true);

  const blankVehicles = state.vehicles.filter(
    (vehicle) => !vehicle.setupComplete,
  );
  assert.equal(blankVehicles.length, 1);
  assert.equal(blankVehicles[0].displayName, "");
  assert.equal(blankVehicles[0].primaryPhoto, "");

  assert.equal(
    state.fuelRecords.find((record) => record.recordId === "FUEL-A1").vehicleId,
    "VEH-A",
  );
  assert.equal(
    state.fuelRecords.find((record) => record.recordId === "FUEL-B1").vehicleId,
    "VEH-B",
  );
});

test("MT-02 converts one null position and appends another blank", () => {
  const state = dataV3.migrateToV3(
    fixture("legacy-one-configured-one-null.json"),
    testContext(),
  ).state;

  assert.equal(state.vehicles.filter((vehicle) => vehicle.setupComplete).length, 1);
  assert.equal(state.vehicles.filter((vehicle) => !vehicle.setupComplete).length, 2);
  assert.equal(state.vehicleOrder[0], "VEH-A");
});

test("MT-03 converts two null positions into three explicit blanks", () => {
  const state = dataV3.migrateToV3(
    fixture("legacy-two-null.json"),
    testContext(),
  ).state;

  assert.equal(state.vehicles.length, 3);
  assert.equal(state.vehicles.every((vehicle) => !vehicle.setupComplete), true);
  assert.equal(new Set(state.vehicleOrder).size, 3);
});

test("MT-04 preserves visible order from legacy slot values", () => {
  const state = dataV3.migrateToV3(
    fixture("legacy-reversed-slots.json"),
    testContext(),
  ).state;

  assert.deepEqual(state.vehicleOrder.slice(0, 2), ["VEH-B", "VEH-A"]);
});


test("MT-05 preserves source-array order when legacy slots are missing", () => {
  const input = fixture("legacy-two-configured.json");
  delete input.vehicles[0].slot;
  delete input.vehicles[1].slot;
  input.vehicles.reverse();

  const state = dataV3.migrateToV3(input, testContext()).state;
  assert.deepEqual(state.vehicleOrder.slice(0, 2), ["VEH-B", "VEH-A"]);
});

test("MT-11 assigns a missing vehicle ID once", () => {
  const input = fixture("legacy-two-configured.json");
  delete input.vehicles[1].vehicleId;
  delete input.vehicles[1].id;
  input.fuelRecords = input.fuelRecords.filter(
    (record) => record.vehicleId !== "VEH-B",
  );

  const first = dataV3.migrateToV3(input, testContext()).state;
  const assigned = first.vehicles.find(
    (vehicle) => vehicle.make === "Bravo",
  ).vehicleId;
  const second = dataV3.migrateToV3(first, testContext()).state;

  assert.equal(Boolean(assigned), true);
  assert.equal(
    second.vehicles.find((vehicle) => vehicle.make === "Bravo").vehicleId,
    assigned,
  );
});

test("MT-06 and MT-07 are idempotent", () => {
  const context = testContext();
  const first = dataV3.migrateToV3(
    fixture("legacy-two-configured.json"),
    context,
  ).state;
  const serializedFirst = JSON.stringify(first);
  const second = dataV3.migrateToV3(first, testContext());

  assert.equal(second.report.migrated, false);
  assert.equal(second.report.idempotent, true);
  assert.equal(JSON.stringify(second.state), serializedFirst);
});

test("MT-08 rejects more than three source positions", () => {
  assertDataError(
    () => dataV3.migrateToV3(
      fixture("invalid-four-vehicles.json"),
      testContext(),
    ),
    "TOO_MANY_VEHICLES",
  );
});

test("MT-09 rejects duplicate vehicle IDs", () => {
  assertDataError(
    () => dataV3.migrateToV3(
      fixture("invalid-duplicate-vehicle-ids.json"),
      testContext(),
    ),
    "DUPLICATE_VEHICLE_ID",
  );
});

test("MT-10 rejects orphan operational records", () => {
  assertDataError(
    () => dataV3.migrateToV3(
      fixture("invalid-orphan-record.json"),
      testContext(),
    ),
    "ORPHAN_VEHICLE_REFERENCE",
  );
});

test("MT-12 does not fabricate acquisition records", () => {
  const state = dataV3.migrateToV3(
    fixture("legacy-two-configured.json"),
    testContext(),
  ).state;

  assert.equal(state.vehicleAcquisitionRecords.length, 0);
});

test("migration does not mutate its input", () => {
  const input = fixture("legacy-two-configured.json");
  const before = JSON.stringify(input);
  dataV3.migrateToV3(input, testContext());
  assert.equal(JSON.stringify(input), before);
});

test("OT-01 through OT-05 change only vehicleOrder", () => {
  const initial = dataV3.migrateToV3(
    fixture("legacy-two-configured.json"),
    testContext(),
  ).state;
  const ids = initial.vehicleOrder.slice();
  const targetOrders = [
    [ids[0], ids[2], ids[1]],
    [ids[1], ids[0], ids[2]],
    [ids[1], ids[2], ids[0]],
    [ids[2], ids[0], ids[1]],
    [ids[2], ids[1], ids[0]],
  ];

  for (const order of targetOrders) {
    const reordered = dataV3.setVehicleOrder(initial, order);
    assert.deepEqual(reordered.vehicleOrder, order);
    assert.deepEqual(reordered.vehicles, initial.vehicles);
    assert.deepEqual(reordered.fuelRecords, initial.fuelRecords);
  }
});

test("OT-06 updates by vehicle ID after reorder", () => {
  const initial = dataV3.migrateToV3(
    fixture("legacy-two-configured.json"),
    testContext(),
  ).state;
  const reversed = dataV3.setVehicleOrder(
    initial,
    initial.vehicleOrder.slice().reverse(),
  );
  const updated = dataV3.updateVehicleById(reversed, "VEH-A", {
    make: "Updated Alpha",
    setupComplete: true,
  });

  assert.equal(dataV3.getVehicleById(updated, "VEH-A").make, "Updated Alpha");
  assert.equal(dataV3.getVehicleById(updated, "VEH-B").make, "Bravo");
  assert.deepEqual(updated.vehicleOrder, reversed.vehicleOrder);
});

test("moveVehicle persists a valid three-ID order", () => {
  const initial = dataV3.migrateToV3(
    fixture("legacy-two-configured.json"),
    testContext(),
  ).state;
  const moved = dataV3.moveVehicle(initial, "VEH-A", 2);

  assert.equal(moved.vehicleOrder[2], "VEH-A");
  assert.equal(dataV3.validateStateV3(moved).valid, true);
});


test("RT-01 Replace migrates a legacy two-vehicle backup", () => {
  const current = dataV3.createBlankDataV3(testContext());
  const incoming = fixture("legacy-two-configured.json");
  const result = dataV3.mergeRestoreState(
    current,
    incoming,
    "Replace",
    { context: testContext() },
  );

  assert.equal(result.state.vehicles.length, 3);
  assert.equal(
    result.state.vehicles.filter((vehicle) => vehicle.setupComplete).length,
    2,
  );
  assert.deepEqual(result.state.vehicleOrder.slice(0, 2), ["VEH-A", "VEH-B"]);
});

test("RT-02 Replace preserves a valid three-vehicle backup", () => {
  const current = dataV3.createBlankDataV3(testContext());
  const incoming = dataV3.migrateToV3(
    fixture("legacy-two-configured.json"),
    testContext(),
  ).state;
  const result = dataV3.mergeRestoreState(
    current,
    incoming,
    "Replace",
    { context: testContext() },
  );

  assert.deepEqual(result.state, incoming);
});

test("RT-03 update merges matching vehicle definitions by ID", () => {
  const current = dataV3.migrateToV3(
    fixture("legacy-two-configured.json"),
    testContext(),
  ).state;
  const incoming = JSON.parse(JSON.stringify(current));
  incoming.vehicleOrder = [
    incoming.vehicleOrder[2],
    incoming.vehicleOrder[0],
    incoming.vehicleOrder[1],
  ];
  dataV3.getVehicleById(incoming, "VEH-A").make = "Incoming Alpha";
  dataV3.getVehicleById(incoming, "VEH-B").make = "Incoming Bravo";

  const result = dataV3.mergeRestoreState(
    current,
    incoming,
    "Update",
    { context: testContext(), adoptIncomingOrder: false },
  );

  assert.equal(
    dataV3.getVehicleById(result.state, "VEH-A").make,
    "Incoming Alpha",
  );
  assert.equal(
    dataV3.getVehicleById(result.state, "VEH-B").make,
    "Incoming Bravo",
  );
  assert.deepEqual(result.state.vehicleOrder, current.vehicleOrder);
});


test("RT-04 unmatched configured vehicle consumes a local blank", () => {
  const current = dataV3.migrateToV3(
    fixture("legacy-two-configured.json"),
    testContext(),
  ).state;
  const incoming = JSON.parse(JSON.stringify(current));
  const incomingBlankId = incoming.vehicleOrder[2];
  const incomingIndex = incoming.vehicles.findIndex(
    (vehicle) => vehicle.vehicleId === incomingBlankId,
  );
  incoming.vehicles[incomingIndex] = {
    ...incoming.vehicles[incomingIndex],
    vehicleId: "VEH-CUSTOM",
    id: "VEH-CUSTOM",
    setupComplete: true,
    make: "Charlie",
    model: "Imported",
    displayName: "Charlie Imported",
  };
  incoming.vehicleOrder[2] = "VEH-CUSTOM";

  const result = dataV3.mergeRestoreState(
    current,
    incoming,
    "Update",
    { context: testContext() },
  );

  assert.equal(
    dataV3.getVehicleById(result.state, "VEH-CUSTOM").setupComplete,
    true,
  );
  assert.equal(result.state.vehicles.length, 3);
});

test("RT-05 capacity conflict fails without a local blank", () => {
  let current = dataV3.migrateToV3(
    fixture("legacy-two-configured.json"),
    testContext(),
  ).state;
  const blank = current.vehicles.find((vehicle) => !vehicle.setupComplete);
  current = dataV3.updateVehicleById(current, blank.vehicleId, {
    setupComplete: true,
    make: "Charlie",
    model: "Current",
    displayName: "Charlie Current",
  });

  const incoming = JSON.parse(JSON.stringify(current));
  const replaceId = incoming.vehicleOrder[2];
  const replaceIndex = incoming.vehicles.findIndex(
    (vehicle) => vehicle.vehicleId === replaceId,
  );
  incoming.vehicles[replaceIndex] = {
    ...incoming.vehicles[replaceIndex],
    vehicleId: "VEH-UNMATCHED",
    id: "VEH-UNMATCHED",
    make: "Delta",
    model: "Incoming",
    displayName: "Delta Incoming",
  };
  incoming.vehicleOrder[2] = "VEH-UNMATCHED";

  assertDataError(
    () => dataV3.mergeRestoreState(
      current,
      incoming,
      "Update",
      { context: testContext() },
    ),
    "CAPACITY_CONFLICT",
  );
});

test("RT-06 reordered backups do not cross-merge vehicle identities", () => {
  const current = dataV3.migrateToV3(
    fixture("legacy-two-configured.json"),
    testContext(),
  ).state;
  const incoming = JSON.parse(JSON.stringify(current));
  incoming.vehicleOrder = [
    incoming.vehicleOrder[1],
    incoming.vehicleOrder[0],
    incoming.vehicleOrder[2],
  ];
  incoming.vehicles.reverse();

  const result = dataV3.mergeRestoreState(
    current,
    incoming,
    "Update",
    { context: testContext(), adoptIncomingOrder: true },
  );

  assert.equal(dataV3.getVehicleById(result.state, "VEH-A").make, "Alpha");
  assert.equal(dataV3.getVehicleById(result.state, "VEH-B").make, "Bravo");
  assert.deepEqual(result.state.vehicleOrder, incoming.vehicleOrder);
});

test("RT-07 Duplicate mode does not duplicate vehicle definitions", () => {
  const current = dataV3.migrateToV3(
    fixture("legacy-two-configured.json"),
    testContext(),
  ).state;
  const incoming = JSON.parse(JSON.stringify(current));
  const result = dataV3.mergeRestoreState(
    current,
    incoming,
    "Duplicate",
    { context: testContext() },
  );

  assert.equal(result.state.vehicles.length, 3);
  assert.equal(new Set(result.state.vehicles.map((vehicle) => vehicle.vehicleId)).size, 3);
  assert.equal(result.state.fuelRecords.length, current.fuelRecords.length * 2);
});


test("RT-08 invalid incoming order is rejected", () => {
  const current = dataV3.migrateToV3(
    fixture("legacy-two-configured.json"),
    testContext(),
  ).state;
  const incoming = JSON.parse(JSON.stringify(current));
  incoming.vehicleOrder = [
    incoming.vehicleOrder[0],
    incoming.vehicleOrder[0],
    incoming.vehicleOrder[2],
  ];

  assertDataError(
    () => dataV3.mergeRestoreState(
      current,
      incoming,
      "Replace",
      { context: testContext() },
    ),
    "INVALID_VEHICLE_ORDER",
  );
});

test("OT-07 order persists through active storage save and load", () => {
  const storage = new MemoryStorage();
  const initial = dataV3.migrateToV3(
    fixture("legacy-two-configured.json"),
    testContext(),
  ).state;
  const targetOrder = initial.vehicleOrder.slice().reverse();
  const reordered = dataV3.setVehicleOrder(initial, targetOrder);
  dataV3.saveActiveState(storage, reordered, testContext());
  const loaded = dataV3.loadCanonicalState(storage, testContext()).state;

  assert.deepEqual(loaded.vehicleOrder, targetOrder);
});

test("TX-01 validation failure leaves the legacy key unchanged", () => {
  const legacyRaw = JSON.stringify(fixture("invalid-orphan-record.json"));
  const storage = new MemoryStorage({
    RGBM_DATA_v213d: legacyRaw,
  });

  assertDataError(
    () => dataV3.loadCanonicalState(storage, testContext()),
    "ORPHAN_VEHICLE_REFERENCE",
  );
  assert.equal(storage.getItem("RGBM_DATA_v213d"), legacyRaw);
  assert.equal(storage.getItem(dataV3.ACTIVE_KEY), null);
});

test("TX-02 pending write failure creates no active v3 key", () => {
  const state = dataV3.migrateToV3(
    fixture("legacy-two-configured.json"),
    testContext(),
  ).state;
  const storage = new MemoryStorage({}, {
    failOnSet: dataV3.PENDING_KEY,
  });

  assertDataError(
    () => dataV3.commitMigratedState(storage, state),
    "STORAGE_QUOTA_EXCEEDED",
  );
  assert.equal(storage.getItem(dataV3.ACTIVE_KEY), null);
});


test("TX-03 active promotion failure retains the legacy source", () => {
  const legacyRaw = JSON.stringify(fixture("legacy-two-configured.json"));
  const storage = new MemoryStorage(
    { RGBM_DATA_v213d: legacyRaw },
    {
      failOnSet: dataV3.ACTIVE_KEY,
      failureName: "Error",
    },
  );

  assertDataError(
    () => dataV3.loadCanonicalState(storage, testContext()),
    "ACTIVE_WRITE_FAILED",
  );
  assert.equal(storage.getItem("RGBM_DATA_v213d"), legacyRaw);
  assert.equal(storage.getItem(dataV3.ACTIVE_KEY), null);
});

test("TX-04 valid pending data can be recovered", () => {
  const state = dataV3.migrateToV3(
    fixture("legacy-two-configured.json"),
    testContext(),
  ).state;
  const storage = new MemoryStorage({
    [dataV3.PENDING_KEY]: JSON.stringify(state),
  });
  const recovered = dataV3.recoverPendingMigration(storage);

  assert.equal(recovered.report.recovery, true);
  assert.notEqual(storage.getItem(dataV3.ACTIVE_KEY), null);
  assert.equal(storage.getItem(dataV3.PENDING_KEY), null);
});

test("TX-05 invalid active v3 data requires recovery", () => {
  const storage = new MemoryStorage({
    [dataV3.ACTIVE_KEY]: JSON.stringify({
      app: "RGB Mileage",
      schemaVersion: "3.0.0",
      migrationVersion: "wc10-three-vehicle-v1",
      vehicles: [],
      vehicleOrder: [],
    }),
  });

  assertDataError(
    () => dataV3.loadCanonicalState(storage, testContext()),
    "RECOVERY_REQUIRED",
  );
});

test("loadCanonicalState migrates, commits, and retains the legacy key", () => {
  const legacyRaw = JSON.stringify(fixture("legacy-two-configured.json"));
  const storage = new MemoryStorage({
    RGBM_DATA_v213d: legacyRaw,
  });
  const result = dataV3.loadCanonicalState(storage, testContext());

  assert.equal(result.state.schemaVersion, "3.0.0");
  assert.notEqual(storage.getItem(dataV3.ACTIVE_KEY), null);
  assert.equal(storage.getItem("RGBM_DATA_v213d"), legacyRaw);
  assert.equal(storage.getItem(dataV3.PENDING_KEY), null);
});

test("blank vehicles cannot own operational records", () => {
  const state = dataV3.createBlankDataV3(testContext());
  state.fuelRecords.push({
    recordId: "FUEL-BLANK",
    vehicleId: state.vehicleOrder[0],
  });

  const validation = dataV3.validateStateV3(state);
  assert.equal(validation.valid, false);
  assert.equal(
    validation.errors.some((error) => error.code === "INVALID_BLANK_VEHICLE"),
    true,
  );
});

test("saveActiveState validates read-back state", () => {
  const state = dataV3.migrateToV3(
    fixture("legacy-two-configured.json"),
    testContext(),
  ).state;
  const storage = new MemoryStorage();
  const saved = dataV3.saveActiveState(
    storage,
    state,
    testContext(),
  );

  assert.equal(saved.schemaVersion, "3.0.0");
  assert.equal(dataV3.validateStateV3(saved).valid, true);
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
console.log(`Tests: ${tests.length}`);
console.log(`Passed: ${tests.length - failures}`);
console.log(`Failed: ${failures}`);

process.exitCode = failures === 0 ? 0 : 1;
