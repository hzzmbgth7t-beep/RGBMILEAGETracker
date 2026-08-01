"use strict";

(function initRGBMHomeLayout(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.RGBMHomeLayout = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function createRGBMHomeLayout() {
    const LAYOUT_VERSION = "wc10-responsive-three-circle-home-v3";

    function finiteNumber(value, fallback = 0) {
      const number = Number(value);
      return Number.isFinite(number) ? number : fallback;
    }

    function positive(value, fallback = 0) {
      return Math.max(0, finiteNumber(value, fallback));
    }

    function integer(value) {
      return Math.max(0, Math.floor(value));
    }

    function clamp(value, minimum, maximum) {
      return Math.min(maximum, Math.max(minimum, value));
    }

    function orientationFor(input, width, height) {
      const requested = String(input.orientation || "").toLowerCase();

      if (requested.startsWith("landscape")) {
        return "landscape";
      }

      if (requested.startsWith("portrait")) {
        return "portrait";
      }

      return width > height ? "landscape" : "portrait";
    }

    function calculatePortrait(contentWidth, vehicleAreaHeight) {
      const columnGap = clamp(
        Math.round(contentWidth * 0.03),
        10,
        18,
      );
      const minimumRowGap = clamp(
        Math.round(vehicleAreaHeight * 0.012),
        6,
        12,
      );
      const labelHeight = clamp(
        Math.round(vehicleAreaHeight * 0.05),
        32,
        40,
      );
      const circleHeightBudget = Math.max(
        0,
        vehicleAreaHeight
          - (labelHeight * 2)
          - minimumRowGap,
      );
      const primaryWidthLimit = Math.max(0, contentWidth);
      const secondaryWidthLimit = Math.max(
        0,
        (contentWidth - columnGap) / 2,
      );

      let secondaryDiameter = Math.min(
        secondaryWidthLimit,
        circleHeightBudget / 2.2,
      );
      let primaryDiameter = Math.min(
        primaryWidthLimit,
        circleHeightBudget - secondaryDiameter,
      );

      if (primaryDiameter < secondaryDiameter * 1.2) {
        secondaryDiameter = Math.min(
          secondaryWidthLimit,
          circleHeightBudget / 2.2,
        );
        primaryDiameter = Math.min(
          primaryWidthLimit,
          circleHeightBudget - secondaryDiameter,
        );
      }

      primaryDiameter = integer(primaryDiameter);
      secondaryDiameter = integer(secondaryDiameter);

      const usedVehicleHeight = (
        primaryDiameter
        + secondaryDiameter
        + (labelHeight * 2)
        + minimumRowGap
      );
      const unusedVehicleHeight = Math.max(
        0,
        integer(vehicleAreaHeight - usedVehicleHeight),
      );

      return {
        mode: "portrait",
        columnGap: integer(columnGap),
        minimumRowGap: integer(minimumRowGap),
        labelHeight: integer(labelHeight),
        primaryDiameter,
        secondaryDiameter,
        sharedDiameter: null,
        primaryWidthLimit: integer(primaryWidthLimit),
        secondaryWidthLimit: integer(secondaryWidthLimit),
        circleHeightBudget: integer(circleHeightBudget),
        usedVehicleHeight,
        unusedVehicleHeight,
      };
    }

    function calculateLandscape(contentWidth, vehicleAreaHeight) {
      const columnGap = clamp(
        Math.round(contentWidth * 0.018),
        12,
        22,
      );
      const labelHeight = clamp(
        Math.round(vehicleAreaHeight * 0.085),
        24,
        32,
      );
      const widthLimit = Math.max(
        0,
        (contentWidth - (columnGap * 2)) / 3,
      );
      const heightLimit = Math.max(
        0,
        vehicleAreaHeight - labelHeight,
      );
      const sharedDiameter = integer(
        Math.min(widthLimit, heightLimit),
      );
      const usedVehicleHeight = sharedDiameter + labelHeight;

      return {
        mode: "landscape",
        columnGap: integer(columnGap),
        minimumRowGap: 0,
        labelHeight: integer(labelHeight),
        primaryDiameter: null,
        secondaryDiameter: null,
        sharedDiameter,
        widthLimit: integer(widthLimit),
        heightLimit: integer(heightLimit),
        usedVehicleHeight,
        unusedVehicleHeight: Math.max(
          0,
          integer(vehicleAreaHeight - usedVehicleHeight),
        ),
      };
    }

    function calculateHomeLayout(rawInput = {}) {
      const viewportWidth = positive(rawInput.viewportWidth);
      const viewportHeight = positive(rawInput.viewportHeight);

      if (viewportWidth < 1 || viewportHeight < 1) {
        throw new TypeError(
          "Positive viewport width and height are required.",
        );
      }

      const paddingTop = positive(rawInput.paddingTop);
      const paddingRight = positive(rawInput.paddingRight);
      const paddingBottom = positive(rawInput.paddingBottom);
      const paddingLeft = positive(rawInput.paddingLeft);
      const headerHeight = positive(rawInput.headerHeight);
      const dockHeight = positive(rawInput.dockHeight);
      const headerGap = clamp(
        finiteNumber(rawInput.headerGap, 0),
        0,
        12,
      );
      const dockGap = clamp(
        finiteNumber(rawInput.dockGap, 0),
        0,
        12,
      );
      const mode = orientationFor(
        rawInput,
        viewportWidth,
        viewportHeight,
      );
      const contentWidth = Math.max(
        0,
        viewportWidth - paddingLeft - paddingRight,
      );
      const contentHeight = Math.max(
        0,
        viewportHeight - paddingTop - paddingBottom,
      );
      const vehicleAreaHeight = Math.max(
        0,
        contentHeight
          - headerHeight
          - headerGap
          - dockHeight
          - dockGap,
      );
      const geometry = mode === "landscape"
        ? calculateLandscape(contentWidth, vehicleAreaHeight)
        : calculatePortrait(contentWidth, vehicleAreaHeight);
      const fitsWidth = mode === "landscape"
        ? (
          (geometry.sharedDiameter * 3)
          + (geometry.columnGap * 2)
        ) <= contentWidth
        : (
          geometry.primaryDiameter <= contentWidth
          && (
            (geometry.secondaryDiameter * 2)
            + geometry.columnGap
          ) <= contentWidth
        );
      const fitsHeight = (
        geometry.usedVehicleHeight <= vehicleAreaHeight
      );

      return Object.freeze({
        layoutVersion: LAYOUT_VERSION,
        mode,
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
        contentHeight: integer(contentHeight),
        vehicleAreaHeight: integer(vehicleAreaHeight),
        ...geometry,
        fitsWidth,
        fitsHeight,
        dockBottom: integer(viewportHeight - paddingBottom),
      });
    }

    return Object.freeze({
      LAYOUT_VERSION,
      calculateHomeLayout,
    });
  },
);
