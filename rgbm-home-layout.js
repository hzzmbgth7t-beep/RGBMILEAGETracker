"use strict";

(function initRGBMHomeLayout(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.RGBMHomeLayout = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createRGBMHomeLayout() {
  const LAYOUT_VERSION = "wc10-three-vehicle-home-v1";

  function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function positive(value, fallback = 0) {
    return Math.max(0, finiteNumber(value, fallback));
  }

  function integer(value) {
    return Math.max(0, Math.floor(value));
  }

  function calculatePortrait(input) {
    const width = input.contentWidth;
    const height = input.vehicleAreaHeight;
    const columnGap = clamp(Math.round(width * 0.038), 14, 20);
    const rowGap = clamp(Math.round(height * 0.018), 8, 14);
    const labelHeight = clamp(Math.round(height * 0.058), 34, 42);
    const circleBudget = Math.max(
      0,
      height - (labelHeight * 2) - rowGap,
    );
    const lowerWidthLimit = Math.max(
      0,
      (width - columnGap) / 2,
    );
    const targetRatio = 1.55;
    let lowerDiameter = Math.min(
      lowerWidthLimit,
      circleBudget / (1 + targetRatio),
    );
    const topWidthLimit = width * 0.94;
    let topDiameter = Math.min(
      topWidthLimit,
      circleBudget - lowerDiameter,
    );

    if (topDiameter < lowerDiameter * 1.25) {
      lowerDiameter = Math.min(
        lowerDiameter,
        circleBudget / 2.25,
      );
      topDiameter = Math.min(
        topWidthLimit,
        circleBudget - lowerDiameter,
      );
    }

    lowerDiameter = integer(lowerDiameter);
    topDiameter = integer(topDiameter);

    return {
      mode: "portrait",
      columnGap: integer(columnGap),
      rowGap: integer(rowGap),
      labelHeight: integer(labelHeight),
      topDiameter,
      lowerDiameter,
      sharedDiameter: null,
      topWidthLimit: integer(topWidthLimit),
      lowerWidthLimit: integer(lowerWidthLimit),
      circleHeightBudget: integer(circleBudget),
      usedVehicleHeight: (
        topDiameter
        + lowerDiameter
        + (labelHeight * 2)
        + rowGap
      ),
    };
  }

  function calculateLandscape(input) {
    const width = input.contentWidth;
    const height = input.vehicleAreaHeight;
    const columnGap = clamp(Math.round(width * 0.022), 14, 24);
    const labelHeight = clamp(Math.round(height * 0.09), 22, 30);
    const widthLimit = Math.max(
      0,
      (width - (columnGap * 2)) / 3,
    );
    const heightLimit = Math.max(
      0,
      height - labelHeight,
    );
    const sharedDiameter = integer(
      Math.min(widthLimit, heightLimit),
    );

    return {
      mode: "landscape",
      columnGap: integer(columnGap),
      rowGap: 0,
      labelHeight: integer(labelHeight),
      topDiameter: null,
      lowerDiameter: null,
      sharedDiameter,
      widthLimit: integer(widthLimit),
      heightLimit: integer(heightLimit),
      usedVehicleHeight: sharedDiameter + labelHeight,
    };
  }

  function calculateHomeLayout(rawInput = {}) {
    const viewportWidth = positive(rawInput.viewportWidth);
    const viewportHeight = positive(rawInput.viewportHeight);

    if (viewportWidth < 1 || viewportHeight < 1) {
      throw new TypeError("A positive viewport width and height are required.");
    }

    const paddingTop = positive(rawInput.paddingTop);
    const paddingRight = positive(rawInput.paddingRight);
    const paddingBottom = positive(rawInput.paddingBottom);
    const paddingLeft = positive(rawInput.paddingLeft);
    const headerHeight = positive(rawInput.headerHeight);
    const dockHeight = positive(rawInput.dockHeight);
    const headerGap = clamp(
      finiteNumber(rawInput.headerGap, 6),
      0,
      20,
    );
    const dockGap = clamp(
      finiteNumber(rawInput.dockGap, 4),
      0,
      20,
    );
    const requestedMode = String(rawInput.orientation || "").toLowerCase();
    const mode = requestedMode.startsWith("landscape")
      ? "landscape"
      : requestedMode.startsWith("portrait")
        ? "portrait"
        : viewportWidth > viewportHeight
          ? "landscape"
          : "portrait";

    const contentWidth = Math.max(
      0,
      viewportWidth - paddingLeft - paddingRight,
    );
    const homeContentHeight = Math.max(
      0,
      viewportHeight
        - paddingTop
        - paddingBottom
        - dockHeight
        - dockGap,
    );
    const vehicleAreaHeight = Math.max(
      0,
      homeContentHeight - headerHeight - headerGap,
    );
    const base = {
      layoutVersion: LAYOUT_VERSION,
      viewportWidth: integer(viewportWidth),
      viewportHeight: integer(viewportHeight),
      paddingTop: integer(paddingTop),
      paddingRight: integer(paddingRight),
      paddingBottom: integer(paddingBottom),
      paddingLeft: integer(paddingLeft),
      headerHeight: integer(headerHeight),
      headerGap: integer(headerGap),
      dockHeight: integer(dockHeight),
      dockGap: integer(dockGap),
      contentWidth: integer(contentWidth),
      homeContentHeight: integer(homeContentHeight),
      vehicleAreaHeight: integer(vehicleAreaHeight),
    };
    const geometry = mode === "landscape"
      ? calculateLandscape({
        contentWidth,
        vehicleAreaHeight,
      })
      : calculatePortrait({
        contentWidth,
        vehicleAreaHeight,
      });

    return Object.freeze({
      ...base,
      ...geometry,
      fitsHeight: geometry.usedVehicleHeight <= vehicleAreaHeight,
      fitsWidth: mode === "landscape"
        ? (
          (geometry.sharedDiameter * 3)
          + (geometry.columnGap * 2)
        ) <= contentWidth
        : (
          (geometry.lowerDiameter * 2)
          + geometry.columnGap
        ) <= contentWidth
          && geometry.topDiameter <= contentWidth,
    });
  }

  return Object.freeze({
    LAYOUT_VERSION,
    calculateHomeLayout,
  });
});
