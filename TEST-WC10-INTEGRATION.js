"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const dataV3 = require("./rgbm-data-v3.js");
const evidenceApi = require("./rgbm-wc10-evidence.js");

const appSource = fs.readFileSync(
  path.join(__dirname, "app.js"),
  "utf8",
);
const fixtureDirectory = __dirname;

function fixture(name) {
  return JSON.parse(
    fs.readFileSync(path.join(fixtureDirectory, `FIXTURE-${name}`), "utf8"),
  );
}

class MemoryStorage {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial));
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
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

function createClassList() {
  const values = new Set();
  return {
    add(...items) {
      items.forEach((item) => values.add(item));
    },
    remove(...items) {
      items.forEach((item) => values.delete(item));
    },
    toggle(item, force) {
      if (force === true) {
        values.add(item);
        return true;
      }
      if (force === false) {
        values.delete(item);
        return false;
      }
      if (values.has(item)) {
        values.delete(item);
        return false;
      }
      values.add(item);
      return true;
    },
    contains(item) {
      return values.has(item);
    },
  };
}

function createElement(id = "") {
  return {
    id,
    style: {},
    className: "",
    classList: createClassList(),
    innerHTML: "",
    textContent: "",
    value: "",
    files: [],
    options: [],
    scrollTo() {},
    setAttribute() {},
    addEventListener() {},
    focus() {},
  };
}

function createRuntime(initialStorage = {}) {
  const appElement = createElement("app");
  const metaViewport = createElement("viewport");
  const body = createElement("body");
  const documentElement = createElement("html");
  const localStorage = new MemoryStorage(initialStorage);
  const alerts = [];
  const consoleErrors = [];

  const elements = new Map([["app", appElement]]);

  const document = {
    body,
    documentElement,
    visibilityState: "visible",
    getElementById(id) {
      return elements.get(id) || null;
    },
    querySelector(selector) {
      if (selector === "meta[name=viewport]") {
        return metaViewport;
      }
      return null;
    },
    querySelectorAll() {
      return [];
    },
    addEventListener() {},
    createElement() {
      return createElement();
    },
  };

  const context = {
    console: {
      log: console.log,
      warn: console.warn,
      error(...items) {
        consoleErrors.push(items.map(String).join(" "));
      },
    },
    JSON,
    Date,
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    Set,
    Map,
    RegExp,
    Error,
    Promise,
    Blob,
    URL,
    FileReader: function FileReader() {},
    Image: function Image() {},
    document,
    localStorage,
    navigator: {
      userAgent: "WC10 Integration Harness",
      standalone: true,
      clipboard: {
        writeText() {
          return Promise.resolve();
        },
      },
    },
    history: {},
    location: { href: "https://example.test/?v=216lwc10mv1" },
    screen: {
      orientation: {
        type: "portrait-primary",
        lock() {
          return Promise.resolve();
        },
      },
    },
    innerWidth: 430,
    innerHeight: 932,
    matchMedia() {
      return { matches: true };
    },
    alert(message) {
      alerts.push(String(message));
    },
    confirm() {
      return true;
    },
    prompt() {
      return "";
    },
    scrollTo() {},
    setTimeout,
    clearTimeout,
    requestAnimationFrame(callback) {
      return setTimeout(callback, 0);
    },
    RGBMDataV3: dataV3,
    RGBMWC10Evidence: evidenceApi,
  };

  context.window = context;
  context.globalThis = context;
  context.addEventListener = function addEventListener() {};

  vm.createContext(context);
  vm.runInContext(appSource, context, {
    filename: "app.js",
  });

  return {
    context,
    appElement,
    localStorage,
    alerts,
    consoleErrors,
  };
}

const tests = [];

function test(name, functionUnderTest) {
  tests.push({ name, functionUnderTest });
}

test("new installation creates three explicit Add Vehicle units", () => {
  const runtime = createRuntime();
  const html = runtime.appElement.innerHTML;
  const addVehicleCount = (html.match(/Add Vehicle/g) || []).length;
  const diagnostics = runtime.context.RGBM_WC10_DATA_DIAGNOSTICS();

  assert.equal(diagnostics.vehicles.length, 3);
  assert.equal(
    diagnostics.vehicles.every((vehicle) => vehicle.setupComplete === false),
    true,
  );
  assert.equal(addVehicleCount >= 3, true);
  assert.equal(diagnostics.validation.valid, true);
  assert.notEqual(
    runtime.localStorage.getItem(dataV3.ACTIVE_KEY),
    null,
  );
});

test("legacy two-vehicle data migrates without deleting the legacy key", () => {
  const legacy = fixture("legacy-two-configured.json");
  const legacyRaw = JSON.stringify(legacy);
  const runtime = createRuntime({
    RGBM_DATA_v213d: legacyRaw,
  });
  const diagnostics = runtime.context.RGBM_WC10_DATA_DIAGNOSTICS();

  assert.deepEqual(
    Array.from(diagnostics.vehicleOrder).slice(0, 2),
    ["VEH-A", "VEH-B"],
  );
  assert.equal(
    diagnostics.vehicles.filter((vehicle) => vehicle.setupComplete).length,
    2,
  );
  assert.equal(
    diagnostics.vehicles.filter((vehicle) => !vehicle.setupComplete).length,
    1,
  );
  assert.equal(
    runtime.localStorage.getItem("RGBM_DATA_v213d"),
    legacyRaw,
  );
  assert.notEqual(
    runtime.localStorage.getItem(dataV3.ACTIVE_KEY),
    null,
  );
});

test("Settings exposes three-position non-drag reorder controls", () => {
  const runtime = createRuntime();
  vm.runInContext("nav('settings',{},false)", runtime.context);

  const html = runtime.appElement.innerHTML;
  assert.equal((html.match(/Position [123]:/g) || []).length, 3);
  assert.equal(html.includes("Move Up"), true);
  assert.equal(html.includes("Move Down"), true);
  assert.equal(html.includes("Swap Vehicle Circles"), false);
});

test("Data selectors exclude the unconfigured third vehicle", () => {
  const runtime = createRuntime({
    RGBM_DATA_v213d: JSON.stringify(
      fixture("legacy-two-configured.json"),
    ),
  });
  vm.runInContext("nav('data',{},false)", runtime.context);

  const html = runtime.appElement.innerHTML;
  const optionMatches = html.match(/<option value="VEH-[AB]"/g) || [];
  assert.equal(optionMatches.length, 2);
  assert.equal(html.includes("Add Vehicle</option>"), false);
});

test("backup metadata distinguishes configured vehicles and positions", () => {
  const runtime = createRuntime({
    RGBM_DATA_v213d: JSON.stringify(
      fixture("legacy-two-configured.json"),
    ),
  });
  const payload = vm.runInContext("backupPayload()", runtime.context);

  assert.equal(payload.schemaVersion, "3.0.0");
  assert.equal(payload.metadata.vehicleCount, 2);
  assert.equal(payload.metadata.vehicleSlotCount, 3);
  assert.deepEqual(
    Array.from(payload.metadata.vehicleOrder).slice(0, 2),
    ["VEH-A", "VEH-B"],
  );
});



test("blank third vehicle opens setup instead of operational entry", () => {
  const runtime = createRuntime({
    RGBM_DATA_v213d: JSON.stringify(
      fixture("legacy-two-configured.json"),
    ),
  });
  const blankVehicleId = vm.runInContext(
    "orderedVehicles()[2].vehicleId",
    runtime.context,
  );

  vm.runInContext("vehicleTap(2)", runtime.context);

  assert.equal(
    vm.runInContext("route.screen", runtime.context),
    "vehicleEdit",
  );
  assert.equal(
    vm.runInContext("route.vehicleId", runtime.context),
    blankVehicleId,
  );
});

test("Vehicle Summary report excludes the unconfigured position", () => {
  const runtime = createRuntime({
    RGBM_DATA_v213d: JSON.stringify(
      fixture("legacy-two-configured.json"),
    ),
  });

  vm.runInContext("nav('reportVehicle',{},false)", runtime.context);
  const html = runtime.appElement.innerHTML;

  assert.equal(html.includes("Alpha"), true);
  assert.equal(html.includes("Bravo"), true);
  assert.equal(html.includes("Add Vehicle"), false);
});

test("Settings exposes the migration evidence controls", () => {
  const runtime = createRuntime({
    RGBM_DATA_v213d: JSON.stringify(
      fixture("legacy-two-configured.json"),
    ),
  });
  vm.runInContext("nav('settings',{},false)", runtime.context);

  const html = runtime.appElement.innerHTML;
  assert.equal(html.includes("WC-10 Migration Evidence"), true);
  assert.equal(html.includes("Download Migration Evidence"), true);
  assert.equal(html.includes("Copy Migration Summary"), true);
  assert.equal(html.includes("Migration acceptance: PASS"), true);
});

test("global migration evidence export reports preserved data", () => {
  const runtime = createRuntime({
    RGBM_DATA_v213d: JSON.stringify(
      fixture("legacy-two-configured.json"),
    ),
  });
  const report = vm.runInContext(
    "RGBM_WC10_MIGRATION_EVIDENCE()",
    runtime.context,
  );

  assert.equal(report.result, "PASS");
  assert.equal(report.migrationAcceptance, "PASS");
  assert.equal(report.canonical.vehicleCount, 3);
  assert.equal(report.canonical.blankCount, 1);
});

test("invalid legacy data renders recovery guidance and preserves source", () => {
  const legacyRaw = JSON.stringify(fixture("invalid-orphan-record.json"));
  const runtime = createRuntime({
    RGBM_DATA_v213d: legacyRaw,
  });

  assert.equal(
    runtime.appElement.innerHTML.includes("Data Recovery Required"),
    true,
  );
  assert.equal(
    runtime.appElement.innerHTML.includes("ORPHAN_VEHICLE_REFERENCE"),
    true,
  );
  assert.equal(
    runtime.localStorage.getItem("RGBM_DATA_v213d"),
    legacyRaw,
  );
  assert.equal(
    runtime.localStorage.getItem(dataV3.ACTIVE_KEY),
    null,
  );
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
console.log(`Integration tests: ${tests.length}`);
console.log(`Passed: ${tests.length - failures}`);
console.log(`Failed: ${failures}`);

process.exitCode = failures === 0 ? 0 : 1;
