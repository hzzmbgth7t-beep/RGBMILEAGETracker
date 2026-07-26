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
      appVersion: cleanText(context.appVersion) || "2.1.6l-wc10",
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
      appVersion: cleanText(context.appVersion) || "2.1.6l-wc10",
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
      || "2.1.6l-wc10";
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
      || "2.1.6l-wc10";
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
    loadCanonicalState,
  });
});
