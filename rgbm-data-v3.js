"use strict";

(function initRGBMDataV3(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.RGBMDataV3 = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createRGBMDataV3() {
  const SCHEMA_VERSION = "3.0.0";
  const MIGRATION_VERSION = "wc10-three-vehicle-v1";
  const RECOVERY_SNAPSHOT_VERSION = "wc10-recovery-snapshot-v1";
  const RECONCILIATION_VERSION = "wc10-standalone-safari-reconciliation-v1";
  const ACTIVE_KEY = "RGBM_DATA_v3";
  const PENDING_KEY = "RGBM_DATA_v3_pending";
  const LEGACY_KEYS = [
    "RGBM_DATA_v213d",
    "RGBM_DATA_v213c",
    "RGBM_DATA_v213b",
    "RGBM_DATA_v213a",
    "RGBM_DATA_v213",
    "RGBM_DATA_v212d",
    "RGBM_DATA_v212c",
    "RGBM_DATA_v212b",
    "RGBM_DATA_v212a",
    "RGBM_DATA_v212",
    "RGBM_DATA_v211",
    "RGBM_DATA_v210",
    "rgbMileage",
    "rgbm_data_v110",
    "rgbMileage_v2_0_6",
    "rgbMileage_v2_0_7",
    "rgbMileage_v2_0_8",
    "rgbMileage_v2_0_9",
    "rgbMileage_v2_0_10",
    "rgbMileage_v2_0_11",
  ];
  const RECORD_COLLECTIONS = [
    "vehicleAcquisitionRecords",
    "fuelRecords",
    "maintenanceRecords",
    "insuranceRecords",
  ];

  class RGBMDataError extends Error {
    constructor(code, message, details = {}) {
      super(message);
      this.name = "RGBMDataError";
      this.code = code;
      this.details = details;
    }
  }

  function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function cleanText(value) {
    return value === null || value === undefined ? "" : String(value).trim();
  }

  function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  }

  function nowISO(context = {}) {
    if (typeof context.now === "function") {
      return context.now();
    }
    return new Date().toISOString();
  }

  function defaultIdFactory(prefix) {
    const random = Math.random().toString(36).slice(2, 10);
    return `${prefix}-${Date.now().toString(36)}-${random}`;
  }

  function nextId(prefix, context = {}) {
    const factory = typeof context.idFactory === "function"
      ? context.idFactory
      : defaultIdFactory;
    const id = cleanText(factory(prefix));

    if (!id) {
      throw new RGBMDataError(
        "INVALID_GENERATED_ID",
        `The ID factory returned an empty ${prefix} identifier.`,
      );
    }

    return id;
  }

  function meaningfulIdentity(vehicle) {
    return Boolean(
      cleanText(vehicle.nickname)
      || cleanText(vehicle.make)
      || cleanText(vehicle.model)
      || cleanText(vehicle.displayName)
      || cleanText(vehicle.primaryPhoto),
    );
  }

  function createBlankVehicle(context = {}) {
    const timestamp = nowISO(context);
    const vehicleId = nextId("VEH", context);

    return {
      vehicleId,
      id: vehicleId,
      setupComplete: false,
      status: "Active",
      year: "",
      make: "",
      model: "",
      nickname: "",
      displayName: "",
      badge: "",
      primaryPhoto: "",
      primaryPhotoZoom: 1.25,
      primaryPhotoOffsetX: 0,
      primaryPhotoOffsetY: 0,
      vin: "",
      plate: "",
      plateState: "",
      registration: {},
      photos: [],
      defaultFuelGrade: "",
      createdAt: timestamp,
      modifiedAt: timestamp,
    };
  }

  function createBlankDataV3(context = {}) {
    const timestamp = nowISO(context);
    const defaults = isObject(context.defaults) ? clone(context.defaults) : {};
    const vehicles = [
      createBlankVehicle(context),
      createBlankVehicle(context),
      createBlankVehicle(context),
    ];

    return {
      ...defaults,
      app: "RGB Mileage",
      schemaVersion: SCHEMA_VERSION,
      appVersion: cleanText(context.appVersion) || "unversioned",
      migrationVersion: MIGRATION_VERSION,
      migrationHistory: [],
      settings: {
        lastBackupDate: "",
        showArchived: false,
        ...(isObject(defaults.settings) ? defaults.settings : {}),
      },
      vehicleOrder: vehicles.map((vehicle) => vehicle.vehicleId),
      vehicles,
      vehicleAcquisitionRecords: [],
      fuelRecords: [],
      maintenanceRecords: [],
      insuranceRecords: [],
      attachments: [],
      nextEntrySequence: Number(defaults.nextEntrySequence) || 1,
      createdAt: timestamp,
      modifiedAt: timestamp,
    };
  }

  function normalizeLegacyVehicle(rawVehicle, context = {}) {
    if (!isObject(rawVehicle)) {
      return createBlankVehicle(context);
    }

    const timestamp = nowISO(context);
    const vehicleId = cleanText(rawVehicle.vehicleId || rawVehicle.id)
      || nextId("VEH", context);
    const configured = rawVehicle.setupComplete === true
      || (rawVehicle.setupComplete !== false && meaningfulIdentity(rawVehicle));

    const vehicle = {
      ...clone(rawVehicle),
      vehicleId,
      id: vehicleId,
      setupComplete: configured,
      status: cleanText(rawVehicle.status) || "Active",
      year: cleanText(rawVehicle.year),
      make: cleanText(rawVehicle.make),
      model: cleanText(rawVehicle.model),
      nickname: cleanText(rawVehicle.nickname),
      displayName: cleanText(rawVehicle.displayName),
      badge: cleanText(rawVehicle.badge),
      primaryPhoto: cleanText(rawVehicle.primaryPhoto || rawVehicle.photo),
      primaryPhotoZoom: Number(rawVehicle.primaryPhotoZoom || rawVehicle.photoZoom || 1.25),
      primaryPhotoOffsetX: Number(rawVehicle.primaryPhotoOffsetX || 0),
      primaryPhotoOffsetY: Number(rawVehicle.primaryPhotoOffsetY || 0),
      vin: cleanText(rawVehicle.vin),
      plate: cleanText(rawVehicle.plate),
      plateState: cleanText(rawVehicle.plateState),
      registration: isObject(rawVehicle.registration)
        ? clone(rawVehicle.registration)
        : {},
      photos: clone(asArray(rawVehicle.photos)),
      defaultFuelGrade: cleanText(rawVehicle.defaultFuelGrade),
      createdAt: cleanText(rawVehicle.createdAt) || timestamp,
      modifiedAt: cleanText(rawVehicle.modifiedAt) || timestamp,
    };

    delete vehicle.slot;
    delete vehicle.fuel;
    delete vehicle.maintenance;
    delete vehicle.insuranceRecords;
    delete vehicle.insurance;

    if (!vehicle.setupComplete) {
      vehicle.year = "";
      vehicle.make = "";
      vehicle.model = "";
      vehicle.nickname = "";
      vehicle.displayName = "";
      vehicle.badge = "";
      vehicle.primaryPhoto = "";
      vehicle.vin = "";
      vehicle.plate = "";
      vehicle.plateState = "";
      vehicle.registration = {};
      vehicle.photos = [];
      vehicle.defaultFuelGrade = "";
    }

    return vehicle;
  }

  function recordIdentifier(record) {
    return cleanText(record && (record.recordId || record.id));
  }

  function normalizeRecord(rawRecord, recordType, vehicleId, context = {}) {
    if (!isObject(rawRecord)) {
      throw new RGBMDataError(
        "INVALID_RECORD",
        `A ${recordType} record is not an object.`,
      );
    }

    const timestamp = nowISO(context);
    const normalizedVehicleId = cleanText(rawRecord.vehicleId || vehicleId);
    const recordId = recordIdentifier(rawRecord)
      || nextId(recordType.toUpperCase(), context);

    return {
      ...clone(rawRecord),
      recordId,
      vehicleId: normalizedVehicleId,
      recordType: cleanText(rawRecord.recordType) || recordType,
      entrySequence: Number(rawRecord.entrySequence) || 0,
      createdAt: cleanText(rawRecord.createdAt) || timestamp,
      modifiedAt: cleanText(rawRecord.modifiedAt) || timestamp,
    };
  }

  function hasMeaningfulAcquisition(vehicle) {
    return Boolean(
      cleanText(vehicle.acquisitionDate || vehicle.purchaseDate)
      || cleanText(vehicle.startingOdometer)
      || cleanText(vehicle.purchasePrice || vehicle.purchaseCost)
      || cleanText(vehicle.seller),
    );
  }

  function makeAcquisitionRecord(vehicle, context = {}) {
    if (!hasMeaningfulAcquisition(vehicle)) {
      return null;
    }

    return normalizeRecord(
      {
        acquisitionDate: vehicle.acquisitionDate || vehicle.purchaseDate || "",
        purchaseDate: vehicle.purchaseDate || vehicle.acquisitionDate || "",
        startingOdometer: vehicle.startingOdometer || "",
        purchasePrice: vehicle.purchasePrice || vehicle.purchaseCost || "",
        seller: vehicle.seller || "",
        source: "Legacy Migration",
        origin: "Legacy Migration",
        classificationTags: ["Imported"],
        dataQuality: "Review",
      },
      "VehicleAcquisition",
      vehicle.vehicleId,
      context,
    );
  }

  function validRawOrder(rawOrder, knownIds) {
    const result = [];
    const seen = new Set();

    for (const value of asArray(rawOrder)) {
      const id = cleanText(value);
      if (!id || seen.has(id) || !knownIds.has(id)) {
        continue;
      }
      seen.add(id);
      result.push(id);
    }

    return result;
  }

  function deriveVehicleOrder(rawVehicles, normalizedEntries, rawOrder) {
    const knownIds = new Set(
      normalizedEntries.map((entry) => entry.vehicle.vehicleId),
    );
    const order = validRawOrder(rawOrder, knownIds);

    if (order.length === 0) {
      const slotted = normalizedEntries
        .map((entry) => ({
          id: entry.vehicle.vehicleId,
          sourceIndex: entry.sourceIndex,
          slot: Number.isFinite(Number(entry.rawSlot))
            ? Number(entry.rawSlot)
            : entry.sourceIndex,
        }))
        .sort((left, right) => (
          left.slot - right.slot || left.sourceIndex - right.sourceIndex
        ));

      for (const entry of slotted) {
        if (!order.includes(entry.id)) {
          order.push(entry.id);
        }
      }
    }

    for (const entry of normalizedEntries) {
      if (!order.includes(entry.vehicle.vehicleId)) {
        order.push(entry.vehicle.vehicleId);
      }
    }

    return order.slice(0, 3);
  }

  function ensureUniqueVehicleIds(entries) {
    const seen = new Set();

    for (const entry of entries) {
      const id = entry.vehicle.vehicleId;
      if (seen.has(id)) {
        throw new RGBMDataError(
          "DUPLICATE_VEHICLE_ID",
          `Vehicle ID ${id} occurs more than once.`,
          { vehicleId: id },
        );
      }
      seen.add(id);
    }
  }

  function collectLegacyRecords(rawState, normalizedEntries, context = {}) {
    const collections = {
      vehicleAcquisitionRecords: [],
      fuelRecords: [],
      maintenanceRecords: [],
      insuranceRecords: [],
    };

    const pushCollection = (collectionName, records, recordType) => {
      for (const rawRecord of asArray(records)) {
        collections[collectionName].push(
          normalizeRecord(
            rawRecord,
            recordType,
            cleanText(rawRecord && rawRecord.vehicleId),
            context,
          ),
        );
      }
    };

    pushCollection(
      "vehicleAcquisitionRecords",
      rawState.vehicleAcquisitionRecords,
      "VehicleAcquisition",
    );
    pushCollection("fuelRecords", rawState.fuelRecords, "Fuel");
    pushCollection("maintenanceRecords", rawState.maintenanceRecords, "Maintenance");
    pushCollection("insuranceRecords", rawState.insuranceRecords, "Insurance");

    for (const rawRecord of asArray(rawState.entries)) {
      const type = cleanText(rawRecord.recordType || rawRecord.entryType || "Fuel")
        .toLowerCase();
      if (type.includes("maint")) {
        collections.maintenanceRecords.push(
          normalizeRecord(rawRecord, "Maintenance", rawRecord.vehicleId, context),
        );
      } else if (type.includes("ins")) {
        collections.insuranceRecords.push(
          normalizeRecord(rawRecord, "Insurance", rawRecord.vehicleId, context),
        );
      } else {
        collections.fuelRecords.push(
          normalizeRecord(rawRecord, "Fuel", rawRecord.vehicleId, context),
        );
      }
    }

    for (const rawRecord of [
      ...asArray(rawState.maintenance),
      ...asArray(rawState.maintenanceEntries),
      ...asArray(rawState.serviceRecords),
      ...asArray(rawState.repairs),
    ]) {
      collections.maintenanceRecords.push(
        normalizeRecord(rawRecord, "Maintenance", rawRecord.vehicleId, context),
      );
    }

    for (const rawRecord of asArray(rawState.insurance)) {
      collections.insuranceRecords.push(
        normalizeRecord(rawRecord, "Insurance", rawRecord.vehicleId, context),
      );
    }

    for (const entry of normalizedEntries) {
      const rawVehicle = entry.rawVehicle;
      if (!isObject(rawVehicle)) {
        continue;
      }

      const vehicleId = entry.vehicle.vehicleId;
      const acquisition = makeAcquisitionRecord(
        { ...rawVehicle, vehicleId },
        context,
      );

      if (
        acquisition
        && !collections.vehicleAcquisitionRecords.some(
          (record) => record.vehicleId === vehicleId,
        )
      ) {
        collections.vehicleAcquisitionRecords.push(acquisition);
      }

      for (const rawRecord of asArray(rawVehicle.fuel)) {
        collections.fuelRecords.push(
          normalizeRecord(rawRecord, "Fuel", vehicleId, context),
        );
      }

      for (const rawRecord of asArray(rawVehicle.maintenance)) {
        collections.maintenanceRecords.push(
          normalizeRecord(rawRecord, "Maintenance", vehicleId, context),
        );
      }

      for (const rawRecord of asArray(rawVehicle.insuranceRecords)) {
        collections.insuranceRecords.push(
          normalizeRecord(rawRecord, "Insurance", vehicleId, context),
        );
      }

      const legacyInsurance = rawVehicle.insCompany
        || rawVehicle.policyNumber
        || rawVehicle.insuranceValue
        || rawVehicle.effectiveDate
        || rawVehicle.expirationDate
        || (
          isObject(rawVehicle.insurance)
          && Object.keys(rawVehicle.insurance).length > 0
        );

      if (legacyInsurance) {
        collections.insuranceRecords.push(
          normalizeRecord(
            {
              company: rawVehicle.insCompany
                || rawVehicle.insurance?.company
                || "",
              policyNumber: rawVehicle.policyNumber
                || rawVehicle.insurance?.policy
                || "",
              effectiveDate: rawVehicle.effectiveDate
                || rawVehicle.insurance?.effective
                || "",
              expirationDate: rawVehicle.expirationDate
                || rawVehicle.insurance?.expiration
                || "",
              coverageValue: rawVehicle.insuranceValue
                || rawVehicle.insurance?.value
                || "",
              source: "Legacy Migration",
              origin: "Legacy Migration",
              classificationTags: ["Imported"],
              dataQuality: "Review",
            },
            "Insurance",
            vehicleId,
            context,
          ),
        );
      }
    }

    return collections;
  }

  function assertUniqueRecordIds(collectionName, records) {
    const seen = new Set();

    for (const record of records) {
      const id = recordIdentifier(record);
      if (!id) {
        throw new RGBMDataError(
          "INVALID_RECORD",
          `${collectionName} contains a record without an ID.`,
        );
      }
      if (seen.has(id)) {
        throw new RGBMDataError(
          "DUPLICATE_RECORD_ID",
          `${collectionName} contains duplicate record ID ${id}.`,
          { collectionName, recordId: id },
        );
      }
      seen.add(id);
    }
  }

  function validateStateV3(state) {
    const errors = [];

    if (!isObject(state)) {
      return {
        valid: false,
        errors: [{ code: "INVALID_SOURCE", message: "State is not an object." }],
      };
    }

    if (state.app !== "RGB Mileage") {
      errors.push({ code: "INVALID_APP", message: "Invalid app identity." });
    }
    if (state.schemaVersion !== SCHEMA_VERSION) {
      errors.push({
        code: "INVALID_SCHEMA_VERSION",
        message: `Expected schema ${SCHEMA_VERSION}.`,
      });
    }
    if (state.migrationVersion !== MIGRATION_VERSION) {
      errors.push({
        code: "INVALID_MIGRATION_VERSION",
        message: `Expected migration ${MIGRATION_VERSION}.`,
      });
    }

    const vehicles = asArray(state.vehicles);
    const order = asArray(state.vehicleOrder);

    if (vehicles.length !== 3) {
      errors.push({
        code: "INVALID_VEHICLE_COUNT",
        message: "Canonical state must contain exactly three vehicles.",
      });
    }
    if (order.length !== 3 || new Set(order).size !== 3) {
      errors.push({
        code: "INVALID_VEHICLE_ORDER",
        message: "Vehicle order must contain exactly three unique IDs.",
      });
    }

    const vehicleIds = [];
    const configuredById = new Map();

    for (const vehicle of vehicles) {
      if (!isObject(vehicle)) {
        errors.push({
          code: "INVALID_VEHICLE",
          message: "Every vehicle must be an object.",
        });
        continue;
      }

      const vehicleId = cleanText(vehicle.vehicleId);
      vehicleIds.push(vehicleId);

      if (!vehicleId || cleanText(vehicle.id) !== vehicleId) {
        errors.push({
          code: "INVALID_VEHICLE_ID",
          message: "Vehicle id and vehicleId must match and be non-empty.",
        });
      }
      if (typeof vehicle.setupComplete !== "boolean") {
        errors.push({
          code: "INVALID_SETUP_STATE",
          message: `Vehicle ${vehicleId} has no boolean setupComplete state.`,
        });
      }
      if (Object.prototype.hasOwnProperty.call(vehicle, "slot")) {
        errors.push({
          code: "INVALID_CANONICAL_SLOT",
          message: `Vehicle ${vehicleId} contains legacy slot authority.`,
        });
      }
      if (vehicle.setupComplete && !meaningfulIdentity(vehicle)) {
        errors.push({
          code: "INVALID_CONFIGURED_VEHICLE",
          message: `Vehicle ${vehicleId} is configured without identity.`,
        });
      }
      if (!vehicle.setupComplete && meaningfulIdentity(vehicle)) {
        errors.push({
          code: "INVALID_BLANK_VEHICLE",
          message: `Vehicle ${vehicleId} is blank but contains identity or image data.`,
        });
      }

      configuredById.set(vehicleId, Boolean(vehicle.setupComplete));
    }

    if (new Set(vehicleIds).size !== vehicleIds.length) {
      errors.push({
        code: "DUPLICATE_VEHICLE_ID",
        message: "Vehicle IDs are not unique.",
      });
    }

    const vehicleIdSet = new Set(vehicleIds);
    if (
      order.some((id) => !vehicleIdSet.has(id))
      || vehicleIds.some((id) => !order.includes(id))
    ) {
      errors.push({
        code: "INVALID_VEHICLE_ORDER",
        message: "Vehicle order and vehicle collection contain different IDs.",
      });
    }

    for (const collectionName of RECORD_COLLECTIONS) {
      const records = asArray(state[collectionName]);
      const seen = new Set();

      for (const record of records) {
        const recordId = recordIdentifier(record);
        const vehicleId = cleanText(record && record.vehicleId);

        if (!recordId || seen.has(recordId)) {
          errors.push({
            code: "DUPLICATE_RECORD_ID",
            message: `${collectionName} contains a missing or duplicate record ID.`,
          });
        }
        if (recordId) {
          seen.add(recordId);
        }
        if (!vehicleIdSet.has(vehicleId)) {
          errors.push({
            code: "ORPHAN_VEHICLE_REFERENCE",
            message: `${collectionName} record ${recordId} references unknown vehicle ${vehicleId}.`,
          });
        }
        if (vehicleIdSet.has(vehicleId) && configuredById.get(vehicleId) === false) {
          errors.push({
            code: "INVALID_BLANK_VEHICLE",
            message: `Blank vehicle ${vehicleId} owns operational data.`,
          });
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  function assertValidStateV3(state) {
    const validation = validateStateV3(state);

    if (!validation.valid) {
      const first = validation.errors[0];
      throw new RGBMDataError(
        first.code || "VALIDATION_FAILED",
        first.message || "Canonical state validation failed.",
        { errors: validation.errors },
      );
    }

    return state;
  }

  function migrationEntry(rawState, context = {}) {
    return {
      version: MIGRATION_VERSION,
      completedAt: nowISO(context),
      sourceSchemaVersion: cleanText(rawState.schemaVersion) || "legacy",
      sourceKey: cleanText(context.sourceKey) || "unknown",
    };
  }

  function migrateToV3(rawState, context = {}) {
    if (!isObject(rawState)) {
      throw new RGBMDataError(
        "INVALID_SOURCE",
        "Migration source must be an object.",
      );
    }

    if (
      rawState.schemaVersion === SCHEMA_VERSION
      && rawState.migrationVersion === MIGRATION_VERSION
    ) {
      const unchanged = clone(rawState);
      assertValidStateV3(unchanged);
      return {
        state: unchanged,
        report: {
          migrated: false,
          idempotent: true,
          sourceSchemaVersion: SCHEMA_VERSION,
          targetSchemaVersion: SCHEMA_VERSION,
          generatedVehicleIds: [],
          addedBlankVehicleIds: [],
        },
      };
    }

    const rawVehicles = asArray(rawState.vehicles);

    if (rawVehicles.length > 3) {
      throw new RGBMDataError(
        "TOO_MANY_VEHICLES",
        "The source contains more than three vehicle positions.",
        { sourceVehicleCount: rawVehicles.length },
      );
    }

    const generatedVehicleIds = [];
    const addedBlankVehicleIds = [];
    const normalizedEntries = [];

    rawVehicles.forEach((rawVehicle, sourceIndex) => {
      const sourceId = cleanText(
        isObject(rawVehicle) && (rawVehicle.vehicleId || rawVehicle.id),
      );
      const vehicle = normalizeLegacyVehicle(rawVehicle, {
        ...context,
        idFactory(prefix) {
          const id = nextId(prefix, context);
          if (prefix === "VEH") {
            generatedVehicleIds.push(id);
          }
          return id;
        },
      });

      if (!sourceId && !isObject(rawVehicle)) {
        addedBlankVehicleIds.push(vehicle.vehicleId);
      }

      normalizedEntries.push({
        rawVehicle,
        sourceIndex,
        rawSlot: isObject(rawVehicle) ? rawVehicle.slot : sourceIndex,
        vehicle,
      });
    });

    ensureUniqueVehicleIds(normalizedEntries);

    while (normalizedEntries.length < 3) {
      const vehicle = createBlankVehicle({
        ...context,
        idFactory(prefix) {
          const id = nextId(prefix, context);
          if (prefix === "VEH") {
            generatedVehicleIds.push(id);
            addedBlankVehicleIds.push(id);
          }
          return id;
        },
      });

      normalizedEntries.push({
        rawVehicle: null,
        sourceIndex: normalizedEntries.length,
        rawSlot: normalizedEntries.length,
        vehicle,
      });
    }

    ensureUniqueVehicleIds(normalizedEntries);

    const vehicles = normalizedEntries.map((entry) => entry.vehicle);
    const vehicleOrder = deriveVehicleOrder(
      rawVehicles,
      normalizedEntries,
      rawState.vehicleOrder,
    );
    const records = collectLegacyRecords(rawState, normalizedEntries, context);

    for (const collectionName of RECORD_COLLECTIONS) {
      assertUniqueRecordIds(collectionName, records[collectionName]);
    }

    const defaults = isObject(context.defaults) ? clone(context.defaults) : {};
    const timestamp = nowISO(context);
    const state = {
      ...defaults,
      ...clone(rawState),
      app: "RGB Mileage",
      schemaVersion: SCHEMA_VERSION,
      appVersion: cleanText(context.appVersion) || "unversioned",
      migrationVersion: MIGRATION_VERSION,
      migrationHistory: [
        ...asArray(rawState.migrationHistory).filter(
          (entry) => entry && entry.version !== MIGRATION_VERSION,
        ),
        migrationEntry(rawState, context),
      ],
      settings: {
        ...(isObject(defaults.settings) ? defaults.settings : {}),
        ...(isObject(rawState.settings) ? clone(rawState.settings) : {}),
      },
      vehicleOrder,
      vehicles,
      vehicleAcquisitionRecords: records.vehicleAcquisitionRecords,
      fuelRecords: records.fuelRecords,
      maintenanceRecords: records.maintenanceRecords,
      insuranceRecords: records.insuranceRecords,
      attachments: clone(asArray(rawState.attachments)),
      nextEntrySequence: Number(rawState.nextEntrySequence) || 1,
      createdAt: cleanText(rawState.createdAt) || timestamp,
      modifiedAt: timestamp,
    };

    delete state.entries;
    delete state.maintenance;
    delete state.maintenanceEntries;
    delete state.serviceRecords;
    delete state.repairs;
    delete state.insurance;

    let maxSequence = 0;
    for (const collectionName of RECORD_COLLECTIONS) {
      for (const record of state[collectionName]) {
        maxSequence = Math.max(
          maxSequence,
          Number(record.entrySequence) || 0,
        );
      }
    }
    state.nextEntrySequence = Math.max(
      Number(state.nextEntrySequence) || 1,
      maxSequence + 1,
    );

    assertValidStateV3(state);

    return {
      state,
      report: {
        migrated: true,
        idempotent: false,
        sourceSchemaVersion: cleanText(rawState.schemaVersion) || "legacy",
        targetSchemaVersion: SCHEMA_VERSION,
        sourceVehicleCount: rawVehicles.length,
        targetVehicleCount: 3,
        generatedVehicleIds,
        addedBlankVehicleIds,
        vehicleOrder: clone(vehicleOrder),
      },
    };
  }

  function getVehicleById(state, vehicleId) {
    const targetId = cleanText(vehicleId);
    return asArray(state && state.vehicles).find(
      (vehicle) => vehicle && vehicle.vehicleId === targetId,
    ) || null;
  }

  function isVehicleConfigured(vehicle) {
    return Boolean(vehicle && vehicle.setupComplete);
  }

  function getOrderedVehicles(state) {
    const vehiclesById = new Map(
      asArray(state && state.vehicles).map(
        (vehicle) => [vehicle.vehicleId, vehicle],
      ),
    );

    return asArray(state && state.vehicleOrder)
      .map((vehicleId) => vehiclesById.get(vehicleId))
      .filter(Boolean);
  }

  function getConfiguredVehicles(state) {
    return getOrderedVehicles(state).filter(isVehicleConfigured);
  }

  function updateVehicleById(state, vehicleId, patch) {
    const next = clone(state);
    const index = asArray(next.vehicles).findIndex(
      (vehicle) => vehicle && vehicle.vehicleId === vehicleId,
    );

    if (index < 0) {
      throw new RGBMDataError(
        "UNKNOWN_VEHICLE_ID",
        `Vehicle ${vehicleId} does not exist.`,
      );
    }

    const updated = {
      ...next.vehicles[index],
      ...clone(patch),
      vehicleId,
      id: vehicleId,
    };
    delete updated.slot;
    next.vehicles[index] = updated;
    assertValidStateV3(next);
    return next;
  }

  function setVehicleOrder(state, orderedIds) {
    const next = clone(state);
    next.vehicleOrder = asArray(orderedIds).map(cleanText);
    assertValidStateV3(next);
    return next;
  }

  function moveVehicle(state, vehicleId, targetIndex) {
    const order = asArray(state.vehicleOrder).slice();
    const currentIndex = order.indexOf(vehicleId);
    const boundedIndex = Math.max(0, Math.min(2, Number(targetIndex)));

    if (currentIndex < 0) {
      throw new RGBMDataError(
        "UNKNOWN_VEHICLE_ID",
        `Vehicle ${vehicleId} does not exist in the order list.`,
      );
    }

    order.splice(currentIndex, 1);
    order.splice(boundedIndex, 0, vehicleId);
    return setVehicleOrder(state, order);
  }

  function mergeRecordCollection(target, incoming, mode, context = {}) {
    const result = clone(asArray(target));
    const indexById = new Map(
      result.map((record, index) => [recordIdentifier(record), index]),
    );

    for (const incomingRecord of asArray(incoming)) {
      const record = clone(incomingRecord);
      const recordId = recordIdentifier(record);

      if (!recordId) {
        throw new RGBMDataError(
          "INVALID_RECORD",
          "Incoming restore record has no ID.",
        );
      }

      if (!indexById.has(recordId)) {
        result.push(record);
        indexById.set(recordId, result.length - 1);
        continue;
      }

      const existingIndex = indexById.get(recordId);

      if (mode === "Skip") {
        continue;
      }
      if (mode === "Update" || mode === "Replace") {
        result[existingIndex] = {
          ...result[existingIndex],
          ...record,
          modifiedAt: nowISO(context),
        };
        continue;
      }
      if (mode === "Duplicate") {
        const duplicate = {
          ...record,
          recordId: nextId("REC", context),
          id: undefined,
          modifiedAt: nowISO(context),
        };
        result.push(duplicate);
        indexById.set(duplicate.recordId, result.length - 1);
      }
    }

    return result;
  }

  function mergeRestoreState(
    currentState,
    incomingState,
    mode,
    options = {},
  ) {
    const normalizedMode = cleanText(mode) || "Replace";
    const context = isObject(options.context) ? options.context : {};
    const current = clone(assertValidStateV3(clone(currentState)));
    const incoming = migrateToV3(incomingState, {
      ...context,
      sourceKey: cleanText(options.sourceKey) || "restore",
    }).state;

    if (normalizedMode === "Replace") {
      return {
        state: incoming,
        report: {
          mode: normalizedMode,
          vehicleMerge: "replace",
          orderAdopted: true,
        },
      };
    }

    if (!["Update", "Skip", "Duplicate"].includes(normalizedMode)) {
      throw new RGBMDataError(
        "INVALID_RESTORE_MODE",
        `Unsupported restore mode ${normalizedMode}.`,
      );
    }

    const next = clone(current);
    const currentById = new Map(
      next.vehicles.map((vehicle, index) => [vehicle.vehicleId, index]),
    );
    const blankIds = next.vehicles
      .filter((vehicle) => !vehicle.setupComplete)
      .map((vehicle) => vehicle.vehicleId);
    const consumedBlankIds = [];

    for (const incomingVehicle of incoming.vehicles) {
      if (!incomingVehicle.setupComplete) {
        continue;
      }

      if (currentById.has(incomingVehicle.vehicleId)) {
        if (normalizedMode === "Update") {
          const index = currentById.get(incomingVehicle.vehicleId);
          next.vehicles[index] = {
            ...next.vehicles[index],
            ...clone(incomingVehicle),
            vehicleId: incomingVehicle.vehicleId,
            id: incomingVehicle.vehicleId,
          };
        }
        continue;
      }

      const blankId = blankIds.shift();
      if (!blankId) {
        throw new RGBMDataError(
          "CAPACITY_CONFLICT",
          "The incoming backup contains a vehicle with no available local blank position.",
          { vehicleId: incomingVehicle.vehicleId },
        );
      }

      const blankIndex = next.vehicles.findIndex(
        (vehicle) => vehicle.vehicleId === blankId,
      );
      next.vehicles[blankIndex] = clone(incomingVehicle);
      next.vehicleOrder = next.vehicleOrder.map(
        (vehicleId) => vehicleId === blankId
          ? incomingVehicle.vehicleId
          : vehicleId,
      );
      currentById.delete(blankId);
      currentById.set(incomingVehicle.vehicleId, blankIndex);
      consumedBlankIds.push(blankId);
    }

    for (const collectionName of RECORD_COLLECTIONS) {
      next[collectionName] = mergeRecordCollection(
        next[collectionName],
        incoming[collectionName],
        normalizedMode,
        context,
      );
    }

    if (options.adoptIncomingOrder === true) {
      const nextIds = new Set(next.vehicles.map((vehicle) => vehicle.vehicleId));
      const proposed = incoming.vehicleOrder.filter((id) => nextIds.has(id));

      for (const id of next.vehicleOrder) {
        if (!proposed.includes(id)) {
          proposed.push(id);
        }
      }

      next.vehicleOrder = proposed.slice(0, 3);
    }

    next.schemaVersion = SCHEMA_VERSION;
    next.migrationVersion = MIGRATION_VERSION;
    next.appVersion = cleanText(context.appVersion)
      || next.appVersion
      || "unversioned";
    next.modifiedAt = nowISO(context);

    assertValidStateV3(next);

    return {
      state: next,
      report: {
        mode: normalizedMode,
        vehicleMerge: "vehicleId",
        consumedBlankIds,
        orderAdopted: options.adoptIncomingOrder === true,
      },
    };
  }

  function storageGet(storage, key) {
    try {
      return storage.getItem(key);
    } catch (error) {
      throw new RGBMDataError(
        "STORAGE_READ_FAILED",
        `Unable to read storage key ${key}.`,
        { cause: String(error) },
      );
    }
  }

  function storageSet(storage, key, value, errorCode) {
    try {
      storage.setItem(key, value);
    } catch (error) {
      const errorName = String(error && error.name || "");
      const message = String(error && error.message || errorName || error);
      const code = /quota|exceeded/i.test(`${errorName} ${message}`)
        ? "STORAGE_QUOTA_EXCEEDED"
        : errorCode;
      throw new RGBMDataError(
        code,
        `Unable to write storage key ${key}.`,
        { cause: message },
      );
    }
  }

  function storageRemove(storage, key) {
    try {
      storage.removeItem(key);
    } catch (error) {
      // Cleanup failure does not replace the original transaction result.
    }
  }

  function commitMigratedState(storage, state, report = {}) {
    assertValidStateV3(state);

    let payload;
    try {
      payload = JSON.stringify(state);
    } catch (error) {
      throw new RGBMDataError(
        "SERIALIZATION_FAILED",
        "Unable to serialize migrated data.",
        { cause: String(error) },
      );
    }

    storageSet(storage, PENDING_KEY, payload, "PENDING_WRITE_FAILED");
    const pendingRaw = storageGet(storage, PENDING_KEY);

    try {
      assertValidStateV3(JSON.parse(pendingRaw));
    } catch (error) {
      storageRemove(storage, PENDING_KEY);
      throw new RGBMDataError(
        "PENDING_WRITE_FAILED",
        "Pending migration data failed read-back validation.",
        { cause: String(error) },
      );
    }

    storageSet(storage, ACTIVE_KEY, pendingRaw, "ACTIVE_WRITE_FAILED");
    const activeRaw = storageGet(storage, ACTIVE_KEY);

    try {
      assertValidStateV3(JSON.parse(activeRaw));
    } catch (error) {
      throw new RGBMDataError(
        "POST_WRITE_VALIDATION_FAILED",
        "Active migration data failed read-back validation.",
        { cause: String(error) },
      );
    }

    storageRemove(storage, PENDING_KEY);

    return {
      state: JSON.parse(activeRaw),
      report: { ...clone(report), committed: true },
    };
  }

  function saveActiveState(storage, state, context = {}) {
    const next = clone(state);
    next.schemaVersion = SCHEMA_VERSION;
    next.migrationVersion = MIGRATION_VERSION;
    next.appVersion = cleanText(context.appVersion)
      || next.appVersion
      || "unversioned";
    next.modifiedAt = nowISO(context);
    assertValidStateV3(next);

    let payload;
    try {
      payload = JSON.stringify(next);
    } catch (error) {
      throw new RGBMDataError(
        "SERIALIZATION_FAILED",
        "Unable to serialize active data.",
        { cause: String(error) },
      );
    }

    storageSet(storage, ACTIVE_KEY, payload, "ACTIVE_WRITE_FAILED");
    const activeRaw = storageGet(storage, ACTIVE_KEY);

    try {
      const readBack = JSON.parse(activeRaw);
      assertValidStateV3(readBack);
      return readBack;
    } catch (error) {
      throw new RGBMDataError(
        "POST_WRITE_VALIDATION_FAILED",
        "Saved active data failed read-back validation.",
        { cause: String(error) },
      );
    }
  }

  function recoverPendingMigration(storage) {
    const pendingRaw = storageGet(storage, PENDING_KEY);

    if (!pendingRaw) {
      return { recovered: false, reason: "NO_PENDING_DATA" };
    }

    let pending;
    try {
      pending = JSON.parse(pendingRaw);
      assertValidStateV3(pending);
    } catch (error) {
      throw new RGBMDataError(
        "RECOVERY_REQUIRED",
        "Pending migration data is invalid.",
        { cause: String(error) },
      );
    }

    return commitMigratedState(storage, pending, {
      recovery: true,
    });
  }


  function fingerprintText(value) {
    const text = String(value || "");
    let hash = 2166136261;

    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function recoveryKeyNames(storage, context = {}) {
    const keys = new Set([
      ACTIVE_KEY,
      PENDING_KEY,
      ...LEGACY_KEYS,
      ...asArray(context.legacyKeys),
    ]);

    try {
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (
          key
          && (
            key.startsWith("RGBM_")
            || key.startsWith("rgbMileage")
            || key.startsWith("rgbm_data_")
          )
        ) {
          keys.add(key);
        }
      }
    } catch (error) {
      throw new RGBMDataError(
        "STORAGE_READ_FAILED",
        "Unable to enumerate RGB Mileage storage keys.",
        { cause: String(error) },
      );
    }

    return Array.from(keys).sort();
  }

  function recoveryStateSummary(state) {
    if (!isObject(state)) {
      return null;
    }

    return {
      schemaVersion: cleanText(state.schemaVersion),
      migrationVersion: cleanText(state.migrationVersion),
      vehicleCount: asArray(state.vehicles).length,
      configuredCount: asArray(state.vehicles).filter(
        (vehicle) => vehicle && vehicle.setupComplete === true,
      ).length,
      vehicleOrder: clone(asArray(state.vehicleOrder)),
      fuelRecordCount: asArray(state.fuelRecords).length,
      maintenanceRecordCount: asArray(
        state.maintenanceRecords,
      ).length,
      insuranceRecordCount: asArray(
        state.insuranceRecords,
      ).length,
      acquisitionRecordCount: asArray(
        state.vehicleAcquisitionRecords,
      ).length,
      attachmentCount: asArray(state.attachments).length,
    };
  }

  function inspectRecoveryRaw(raw, key, context = {}) {
    const entry = {
      key,
      present: raw !== null && raw !== undefined,
      characterCount: raw ? String(raw).length : 0,
      fingerprint: raw ? fingerprintText(raw) : null,
      parses: false,
      canonicalValid: false,
      migratable: false,
      error: null,
      summary: null,
    };

    if (!entry.present) {
      return entry;
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
      entry.parses = true;
    } catch (error) {
      entry.error = `Invalid JSON: ${String(error)}`;
      return entry;
    }

    try {
      if (cleanText(parsed.schemaVersion) === SCHEMA_VERSION) {
        assertValidStateV3(parsed);
        entry.canonicalValid = true;
        entry.migratable = true;
        entry.summary = recoveryStateSummary(parsed);
        return entry;
      }

      const migrated = migrateToV3(parsed, {
        ...context,
        sourceKey: key,
      });
      assertValidStateV3(migrated.state);
      entry.migratable = true;
      entry.summary = recoveryStateSummary(migrated.state);
    } catch (error) {
      entry.error = error && error.message
        ? error.message
        : String(error);
    }

    return entry;
  }

  function inspectRecoveryStorage(storage, context = {}) {
    const keys = recoveryKeyNames(storage, context);
    const entries = keys.map((key) => {
      const raw = storageGet(storage, key);
      return inspectRecoveryRaw(raw, key, context);
    });
    const entryByKey = Object.fromEntries(
      entries.map((entry) => [entry.key, entry]),
    );
    const active = entryByKey[ACTIVE_KEY]
      || inspectRecoveryRaw(null, ACTIVE_KEY, context);
    const pending = entryByKey[PENDING_KEY]
      || inspectRecoveryRaw(null, PENDING_KEY, context);
    const legacy = entries.filter(
      (entry) => (
        entry.key !== ACTIVE_KEY
        && entry.key !== PENDING_KEY
        && entry.present
      ),
    );

    let recommendedAction = "RESTORE_BACKUP";
    if (active.canonicalValid) {
      recommendedAction = "USE_ACTIVE";
    } else if (pending.canonicalValid) {
      recommendedAction = "RECOVER_PENDING";
    } else if (legacy.some((entry) => entry.migratable)) {
      recommendedAction = "RESTORE_LEGACY_OR_BACKUP";
    }

    return {
      recoverySnapshotVersion: RECOVERY_SNAPSHOT_VERSION,
      inspectedAt: nowISO(context),
      activeKey: ACTIVE_KEY,
      pendingKey: PENDING_KEY,
      active,
      pending,
      legacy,
      entries,
      recommendedAction,
      requiresRecovery: (
        (active.present && !active.canonicalValid)
        || (!active.canonicalValid && pending.present)
      ),
    };
  }

  function buildRecoverySnapshot(storage, context = {}) {
    const inspection = inspectRecoveryStorage(storage, context);
    const storageEntries = inspection.entries
      .filter((entry) => entry.present)
      .map((entry) => ({
        key: entry.key,
        raw: storageGet(storage, entry.key),
        characterCount: entry.characterCount,
        fingerprint: entry.fingerprint,
      }));

    return {
      app: "RGB Mileage",
      recoverySnapshotVersion: RECOVERY_SNAPSHOT_VERSION,
      generatedAt: nowISO(context),
      appVersion: cleanText(context.appVersion) || "unversioned",
      inspection,
      storageEntries,
      instructions: {
        preserveFile: true,
        doNotClearStorage: true,
        containsExactStoredValues: true,
      },
    };
  }

  function requireRecoverySnapshotConfirmation(context = {}) {
    if (context.snapshotConfirmed !== true) {
      throw new RGBMDataError(
        "RECOVERY_SNAPSHOT_REQUIRED",
        "Download and confirm the recovery snapshot before changing storage.",
      );
    }
  }

  function validateRecoveryCandidate(input, context = {}) {
    const migrated = migrateToV3(input, {
      ...context,
      sourceKey: cleanText(context.sourceKey) || "recovery-backup",
    });
    assertValidStateV3(migrated.state);

    return {
      state: migrated.state,
      report: migrated.report,
      summary: recoveryStateSummary(migrated.state),
    };
  }

  function restoreVolatileRecoveryKeys(storage, originals) {
    const result = {
      activeRestored: originals.activeRaw === null,
      pendingRestored: originals.pendingRaw === null,
      errors: [],
    };

    storageRemove(storage, ACTIVE_KEY);
    storageRemove(storage, PENDING_KEY);

    if (originals.activeRaw !== null) {
      try {
        storageSet(
          storage,
          ACTIVE_KEY,
          originals.activeRaw,
          "RECOVERY_ROLLBACK_FAILED",
        );
        result.activeRestored = (
          storageGet(storage, ACTIVE_KEY) === originals.activeRaw
        );
      } catch (error) {
        result.errors.push(String(error));
      }
    }

    if (originals.pendingRaw !== null) {
      try {
        storageSet(
          storage,
          PENDING_KEY,
          originals.pendingRaw,
          "RECOVERY_ROLLBACK_FAILED",
        );
        result.pendingRestored = (
          storageGet(storage, PENDING_KEY) === originals.pendingRaw
        );
      } catch (error) {
        result.errors.push(String(error));
      }
    }

    result.success = (
      result.activeRestored
      && result.pendingRestored
      && result.errors.length === 0
    );
    return result;
  }

  function promoteRecoveryPayload(
    storage,
    payload,
    context = {},
  ) {
    requireRecoverySnapshotConfirmation(context);

    let parsed;
    try {
      parsed = JSON.parse(payload);
      assertValidStateV3(parsed);
    } catch (error) {
      throw new RGBMDataError(
        "INVALID_RECOVERY_CANDIDATE",
        "The selected recovery data is not a valid schema-3 state.",
        { cause: String(error) },
      );
    }

    const originals = {
      activeRaw: storageGet(storage, ACTIVE_KEY),
      pendingRaw: storageGet(storage, PENDING_KEY),
    };

    storageRemove(storage, ACTIVE_KEY);
    storageRemove(storage, PENDING_KEY);

    try {
      storageSet(
        storage,
        ACTIVE_KEY,
        payload,
        "RECOVERY_ACTIVE_WRITE_FAILED",
      );
      const readBackRaw = storageGet(storage, ACTIVE_KEY);
      const readBack = JSON.parse(readBackRaw);
      assertValidStateV3(readBack);

      return {
        state: readBack,
        report: {
          recovered: true,
          source: cleanText(context.sourceKey) || "recovery",
          pendingRemoved: storageGet(storage, PENDING_KEY) === null,
          legacyKeysRetained: LEGACY_KEYS.filter(
            (key) => storageGet(storage, key) !== null,
          ),
          previousActivePresent: originals.activeRaw !== null,
          previousPendingPresent: originals.pendingRaw !== null,
        },
      };
    } catch (error) {
      const rollback = restoreVolatileRecoveryKeys(
        storage,
        originals,
      );
      throw new RGBMDataError(
        "RECOVERY_TRANSACTION_FAILED",
        "Recovery failed and the original active and pending values were restored.",
        {
          cause: String(error),
          rollback,
        },
      );
    }
  }

  function promotePendingRecovery(storage, context = {}) {
    const pendingRaw = storageGet(storage, PENDING_KEY);
    if (!pendingRaw) {
      throw new RGBMDataError(
        "NO_PENDING_DATA",
        "No pending migration is available for recovery.",
      );
    }

    try {
      const pending = JSON.parse(pendingRaw);
      assertValidStateV3(pending);
    } catch (error) {
      throw new RGBMDataError(
        "INVALID_PENDING_DATA",
        "The pending migration is invalid and cannot be promoted.",
        { cause: String(error) },
      );
    }

    return promoteRecoveryPayload(
      storage,
      pendingRaw,
      {
        ...context,
        sourceKey: PENDING_KEY,
      },
    );
  }

  function restoreRecoveryBackup(
    storage,
    backup,
    context = {},
  ) {
    requireRecoverySnapshotConfirmation(context);
    const candidate = validateRecoveryCandidate(
      backup,
      {
        ...context,
        sourceKey: cleanText(context.sourceKey)
          || "recovery-backup",
      },
    );
    const payload = JSON.stringify(candidate.state);
    const promoted = promoteRecoveryPayload(
      storage,
      payload,
      {
        ...context,
        snapshotConfirmed: true,
        sourceKey: cleanText(context.sourceKey)
          || "recovery-backup",
      },
    );

    return {
      ...promoted,
      candidate: {
        summary: candidate.summary,
        migrationReport: candidate.report,
      },
    };
  }


  function recoveryPreservationFloor(inspection) {
    const entries = [
      inspection && inspection.active,
      inspection && inspection.pending,
      ...asArray(inspection && inspection.legacy),
    ].filter(
      (entry) => (
        entry
        && entry.summary
        && (entry.canonicalValid || entry.migratable)
      ),
    );

    return entries.reduce(
      (floor, entry) => {
        const summary = entry.summary;
        return {
          configuredCount: Math.max(
            floor.configuredCount,
            Number(summary.configuredCount) || 0,
          ),
          fuelRecordCount: Math.max(
            floor.fuelRecordCount,
            Number(summary.fuelRecordCount) || 0,
          ),
          maintenanceRecordCount: Math.max(
            floor.maintenanceRecordCount,
            Number(summary.maintenanceRecordCount) || 0,
          ),
          insuranceRecordCount: Math.max(
            floor.insuranceRecordCount,
            Number(summary.insuranceRecordCount) || 0,
          ),
          acquisitionRecordCount: Math.max(
            floor.acquisitionRecordCount,
            Number(summary.acquisitionRecordCount) || 0,
          ),
          attachmentCount: Math.max(
            floor.attachmentCount,
            Number(summary.attachmentCount) || 0,
          ),
        };
      },
      {
        configuredCount: 0,
        fuelRecordCount: 0,
        maintenanceRecordCount: 0,
        insuranceRecordCount: 0,
        acquisitionRecordCount: 0,
        attachmentCount: 0,
      },
    );
  }

  function reconciliationMetadata(state) {
    return isObject(state && state.recoveryReconciliation)
      ? state.recoveryReconciliation
      : null;
  }

  function validateReconciledRecoveryCandidate(
    storage,
    backup,
    context = {},
  ) {
    const candidate = validateRecoveryCandidate(
      backup,
      {
        ...context,
        sourceKey: cleanText(context.sourceKey)
          || "reconciled-recovery-candidate",
      },
    );
    const reconciliation = reconciliationMetadata(
      candidate.state,
    );

    if (
      !reconciliation
      || cleanText(reconciliation.version)
        !== RECONCILIATION_VERSION
      || cleanText(reconciliation.status)
        !== "READY_FOR_CONTROLLED_RESTORE"
    ) {
      throw new RGBMDataError(
        "RECONCILIATION_METADATA_REQUIRED",
        "Select the controlled reconciled recovery candidate, not a normal backup.",
      );
    }

    const inspection = inspectRecoveryStorage(
      storage,
      context,
    );
    const sourceSnapshot = isObject(
      reconciliation.sourceSnapshot,
    )
      ? reconciliation.sourceSnapshot
      : {};
    const expectedPendingKey = cleanText(
      sourceSnapshot.pendingKey,
    ) || PENDING_KEY;
    const expectedLegacyKey = cleanText(
      sourceSnapshot.legacyKey,
    );
    const pendingEntry = inspection.entries.find(
      (entry) => entry.key === expectedPendingKey,
    );
    const legacyEntry = inspection.entries.find(
      (entry) => entry.key === expectedLegacyKey,
    );
    const sourceErrors = [];

    if (
      !pendingEntry
      || !pendingEntry.present
      || pendingEntry.fingerprint
        !== cleanText(sourceSnapshot.pendingFingerprint)
    ) {
      sourceErrors.push(
        "pending storage fingerprint does not match the recovery snapshot",
      );
    }

    if (
      !legacyEntry
      || !legacyEntry.present
      || legacyEntry.fingerprint
        !== cleanText(sourceSnapshot.legacyFingerprint)
    ) {
      sourceErrors.push(
        "legacy storage fingerprint does not match the recovery snapshot",
      );
    }

    const preservedIds = asArray(
      reconciliation
        && reconciliation.preservationDecisions
        && reconciliation.preservationDecisions
          .firstTwoVehicleIdsPreserved,
    );
    const pendingOrder = pendingEntry
      && pendingEntry.summary
      && asArray(pendingEntry.summary.vehicleOrder);
    const candidateOrder = asArray(
      candidate.state.vehicleOrder,
    );

    if (
      preservedIds.length !== 2
      || pendingOrder.length < 2
      || candidateOrder.length < 3
      || preservedIds[0] !== pendingOrder[0]
      || preservedIds[1] !== pendingOrder[1]
      || candidateOrder[0] !== pendingOrder[0]
      || candidateOrder[1] !== pendingOrder[1]
    ) {
      sourceErrors.push(
        "the original two vehicle IDs or their order do not match",
      );
    }

    if (sourceErrors.length > 0) {
      throw new RGBMDataError(
        "RECOVERY_SOURCE_MISMATCH",
        "The reconciled candidate does not match the current standalone storage.",
        {
          errors: sourceErrors,
          inspection,
        },
      );
    }

    const floor = recoveryPreservationFloor(
      inspection,
    );
    const summary = candidate.summary;
    const deficits = [];

    if ((Number(summary.configuredCount) || 0) < 3) {
      deficits.push("configured vehicles must be at least 3");
    }

    for (const [key, label] of [
      ["fuelRecordCount", "fuel"],
      ["maintenanceRecordCount", "maintenance"],
      ["insuranceRecordCount", "insurance"],
      ["acquisitionRecordCount", "acquisition"],
      ["attachmentCount", "attachments"],
    ]) {
      const actual = Number(summary[key]) || 0;
      const minimum = Number(floor[key]) || 0;
      if (actual < minimum) {
        deficits.push(`${label} ${actual} < standalone ${minimum}`);
      }
    }

    const declaredCounts = isObject(
      reconciliation.candidateCounts,
    )
      ? reconciliation.candidateCounts
      : {};
    for (const key of [
      "configuredCount",
      "fuelRecordCount",
      "maintenanceRecordCount",
      "insuranceRecordCount",
      "acquisitionRecordCount",
      "attachmentCount",
    ]) {
      if (
        Number(declaredCounts[key]) !== Number(summary[key])
      ) {
        deficits.push(
          `declared ${key} does not match the candidate`,
        );
      }
    }

    if (deficits.length > 0) {
      throw new RGBMDataError(
        "RECONCILIATION_REDUCTION_BLOCKED",
        "The reconciled candidate would omit required standalone data.",
        {
          deficits,
          floor,
          summary,
        },
      );
    }

    return {
      ...candidate,
      inspection,
      floor,
      reconciliation,
      sourceMatch: {
        pendingKey: expectedPendingKey,
        pendingFingerprint: pendingEntry.fingerprint,
        legacyKey: expectedLegacyKey,
        legacyFingerprint: legacyEntry.fingerprint,
      },
    };
  }

  function exactRecoveryEntries(
    storage,
    context = {},
  ) {
    return recoveryKeyNames(storage, context)
      .map((key) => ({
        key,
        raw: storageGet(storage, key),
      }))
      .filter((entry) => entry.raw !== null);
  }

  function restoreExactRecoveryEntries(
    storage,
    originals,
    context = {},
  ) {
    const keys = new Set([
      ACTIVE_KEY,
      PENDING_KEY,
      ...recoveryKeyNames(storage, context),
      ...asArray(originals).map((entry) => entry.key),
    ]);
    const result = {
      restoredKeys: [],
      failedKeys: [],
      exactMatch: false,
      success: false,
    };

    for (const key of keys) {
      storageRemove(storage, key);
    }

    for (const entry of asArray(originals)) {
      try {
        storageSet(
          storage,
          entry.key,
          entry.raw,
          "RECONCILIATION_ROLLBACK_FAILED",
        );
        if (storageGet(storage, entry.key) === entry.raw) {
          result.restoredKeys.push(entry.key);
        } else {
          result.failedKeys.push(entry.key);
        }
      } catch (error) {
        result.failedKeys.push(entry.key);
      }
    }

    result.exactMatch = (
      result.failedKeys.length === 0
      && result.restoredKeys.length
        === asArray(originals).length
    );
    result.success = result.exactMatch;
    return result;
  }

  function archiveAndRestoreReconciledBackup(
    storage,
    backup,
    context = {},
  ) {
    requireRecoverySnapshotConfirmation(context);

    if (context.archiveConfirmed !== true) {
      throw new RGBMDataError(
        "RECOVERY_ARCHIVE_CONFIRMATION_REQUIRED",
        "Confirm that the exact recovery snapshot is saved before archiving local source keys.",
      );
    }

    const validated = validateReconciledRecoveryCandidate(
      storage,
      backup,
      {
        ...context,
        sourceKey: cleanText(context.sourceKey)
          || "reconciled-recovery-candidate",
      },
    );
    const originals = exactRecoveryEntries(
      storage,
      context,
    );
    const archivedKeys = originals.map(
      (entry) => entry.key,
    );
    const archivedCharacterCount = originals.reduce(
      (total, entry) => total + entry.raw.length,
      0,
    );
    const payload = JSON.stringify(validated.state);
    const keysToRemove = new Set([
      ACTIVE_KEY,
      PENDING_KEY,
      ...archivedKeys,
    ]);

    for (const key of keysToRemove) {
      storageRemove(storage, key);
    }

    try {
      storageSet(
        storage,
        ACTIVE_KEY,
        payload,
        "RECONCILIATION_ACTIVE_WRITE_FAILED",
      );
      const readBackRaw = storageGet(
        storage,
        ACTIVE_KEY,
      );
      const readBack = JSON.parse(readBackRaw);
      assertValidStateV3(readBack);

      const readBackReconciliation = reconciliationMetadata(
        readBack,
      );
      if (
        !readBackReconciliation
        || cleanText(readBackReconciliation.version)
          !== RECONCILIATION_VERSION
      ) {
        throw new RGBMDataError(
          "RECONCILIATION_READBACK_FAILED",
          "The restored state lost its reconciliation metadata.",
        );
      }

      return {
        state: readBack,
        report: {
          recovered: true,
          reconciled: true,
          reconciliationVersion: RECONCILIATION_VERSION,
          source: cleanText(context.sourceKey)
            || "reconciled-recovery-candidate",
          archivedKeysRemoved: archivedKeys.filter(
            (key) => key !== ACTIVE_KEY,
          ),
          archivedCharacterCount,
          activeCharacterCount: readBackRaw.length,
          pendingRemoved: (
            storageGet(storage, PENDING_KEY) === null
          ),
          legacyKeysRemoved: archivedKeys.filter(
            (key) => (
              key !== ACTIVE_KEY
              && key !== PENDING_KEY
            ),
          ),
          externalSnapshotRequired: true,
          sourceMatch: validated.sourceMatch,
          floor: validated.floor,
          summary: validated.summary,
        },
      };
    } catch (error) {
      const rollback = restoreExactRecoveryEntries(
        storage,
        originals,
        context,
      );
      throw new RGBMDataError(
        "RECONCILIATION_TRANSACTION_FAILED",
        "Reconciled recovery failed and the exact original storage values were restored.",
        {
          cause: String(error),
          rollback,
        },
      );
    }
  }

  function loadCanonicalState(storage, context = {}) {
    const activeRaw = storageGet(storage, ACTIVE_KEY);

    if (activeRaw) {
      try {
        const active = JSON.parse(activeRaw);
        assertValidStateV3(active);
        return {
          state: active,
          report: {
            sourceKey: ACTIVE_KEY,
            migrated: false,
            recovered: false,
          },
        };
      } catch (error) {
        throw new RGBMDataError(
          "RECOVERY_REQUIRED",
          "The active v3 data is invalid and requires recovery.",
          { cause: String(error) },
        );
      }
    }

    const pendingRaw = storageGet(storage, PENDING_KEY);
    if (pendingRaw) {
      throw new RGBMDataError(
        "RECOVERY_REQUIRED",
        "A pending migration exists and requires recovery.",
      );
    }

    for (const key of [
      ...LEGACY_KEYS,
      ...asArray(context.legacyKeys),
    ]) {
      const raw = storageGet(storage, key);
      if (!raw) {
        continue;
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (error) {
        continue;
      }

      const migration = migrateToV3(parsed, {
        ...context,
        sourceKey: key,
      });
      const committed = commitMigratedState(
        storage,
        migration.state,
        migration.report,
      );

      return {
        state: committed.state,
        report: {
          ...migration.report,
          sourceKey: key,
          committed: true,
        },
      };
    }

    const blank = createBlankDataV3(context);
    const committed = commitMigratedState(storage, blank, {
      sourceKey: "new-install",
      migrated: false,
      createdBlank: true,
    });

    return {
      state: committed.state,
      report: committed.report,
    };
  }

  return Object.freeze({
    SCHEMA_VERSION,
    MIGRATION_VERSION,
    RECOVERY_SNAPSHOT_VERSION,
    RECONCILIATION_VERSION,
    ACTIVE_KEY,
    PENDING_KEY,
    LEGACY_KEYS: Object.freeze(LEGACY_KEYS.slice()),
    RECORD_COLLECTIONS: Object.freeze(RECORD_COLLECTIONS.slice()),
    RGBMDataError,
    createBlankVehicle,
    createBlankDataV3,
    normalizeLegacyVehicle,
    deriveVehicleOrder,
    migrateToV3,
    validateStateV3,
    assertValidStateV3,
    getVehicleById,
    isVehicleConfigured,
    getOrderedVehicles,
    getConfiguredVehicles,
    updateVehicleById,
    setVehicleOrder,
    moveVehicle,
    mergeRestoreState,
    commitMigratedState,
    saveActiveState,
    recoverPendingMigration,
    inspectRecoveryStorage,
    buildRecoverySnapshot,
    validateRecoveryCandidate,
    validateReconciledRecoveryCandidate,
    promotePendingRecovery,
    restoreRecoveryBackup,
    archiveAndRestoreReconciledBackup,
    loadCanonicalState,
  });
});
