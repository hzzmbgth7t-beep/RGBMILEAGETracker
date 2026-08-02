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
    const LAYOUT_VERSION = "wc10-responsive-three-circle-home-v4";
    const PORTRAIT_MODE = "portrait-staggered";

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

    function rounded(value, digits = 3) {
      const factor = 10 ** digits;
      return Math.round(value * factor) / factor;
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

    function portraitMetrics(
      contentWidth,
      vehicleAreaHeight,
      compact = false,
    ) {
      if (compact) {
        return {
          minimumHorizontalSpace: 8,
          minimumVerticalSpace: 8,
          labelGap: 3,
          labelHeight: clamp(
            Math.round(vehicleAreaHeight * 0.04),
            28,
            34,
          ),
        };
      }

      return {
        minimumHorizontalSpace: clamp(
          Math.round(contentWidth * 0.03),
          10,
          16,
        ),
        minimumVerticalSpace: clamp(
          Math.round(vehicleAreaHeight * 0.015),
          10,
          16,
        ),
        labelGap: clamp(
          Math.round(vehicleAreaHeight * 0.006),
          4,
          6,
        ),
        labelHeight: clamp(
          Math.round(vehicleAreaHeight * 0.045),
          32,
          40,
        ),
      };
    }

    function portraitDiameter(
      contentWidth,
      vehicleAreaHeight,
      metrics,
    ) {
      const labelSpace = metrics.labelGap + metrics.labelHeight;
      const diameterFromWidth = Math.max(
        0,
        (
          contentWidth
          - (metrics.minimumHorizontalSpace * 3)
        ) / 2,
      );
      const diameterFromHeight = Math.max(
        0,
        (
          vehicleAreaHeight
          - (labelSpace * 2)
          - (metrics.minimumVerticalSpace * 3)
        ) / 2,
      );

      return {
        diameterFromWidth,
        diameterFromHeight,
        sharedDiameter: integer(
          Math.min(diameterFromWidth, diameterFromHeight),
        ),
      };
    }

    function calculatePortrait(contentWidth, vehicleAreaHeight) {
      const normalMetrics = portraitMetrics(
        contentWidth,
        vehicleAreaHeight,
        false,
      );
      const normal = portraitDiameter(
        contentWidth,
        vehicleAreaHeight,
        normalMetrics,
      );
      const compact = normal.sharedDiameter < 120;
      const metrics = compact
        ? portraitMetrics(contentWidth, vehicleAreaHeight, true)
        : normalMetrics;
      const limits = compact
        ? portraitDiameter(contentWidth, vehicleAreaHeight, metrics)
        : normal;
      const sharedDiameter = limits.sharedDiameter;
      const itemHeight = (
        sharedDiameter
        + metrics.labelGap
        + metrics.labelHeight
      );
      const horizontalSpace = Math.max(
        0,
        (contentWidth - (sharedDiameter * 2)) / 3,
      );
      const verticalSpace = Math.max(
        0,
        (vehicleAreaHeight - (itemHeight * 2)) / 3,
      );
      const leftX = horizontalSpace;
      const rightX = (
        horizontalSpace
        + sharedDiameter
        + horizontalSpace
      );
      const upperRightY = verticalSpace;
      const lowerRightY = (
        verticalSpace
        + itemHeight
        + verticalSpace
      );
      const leftY = (vehicleAreaHeight - itemHeight) / 2;

      return {
        mode: PORTRAIT_MODE,
        compact,
        columnGap: rounded(horizontalSpace),
        minimumRowGap: metrics.minimumVerticalSpace,
        minimumHorizontalSpace:
          metrics.minimumHorizontalSpace,
        minimumVerticalSpace:
          metrics.minimumVerticalSpace,
        horizontalSpace: rounded(horizontalSpace),
        verticalSpace: rounded(verticalSpace),
        labelGap: metrics.labelGap,
        labelHeight: metrics.labelHeight,
        itemHeight,
        sharedDiameter,
        primaryDiameter: sharedDiameter,
        secondaryDiameter: sharedDiameter,
        diameterFromWidth: rounded(limits.diameterFromWidth),
        diameterFromHeight: rounded(limits.diameterFromHeight),
        widthLimited: (
          limits.diameterFromWidth
          <= limits.diameterFromHeight
        ),
        heightLimited: (
          limits.diameterFromHeight
          < limits.diameterFromWidth
        ),
        primary: {
          x: rounded(leftX),
          y: rounded(leftY),
        },
        upperSecondary: {
          x: rounded(rightX),
          y: rounded(upperRightY),
        },
        lowerSecondary: {
          x: rounded(rightX),
          y: rounded(lowerRightY),
        },
        usedCircleWidth: sharedDiameter * 2,
        usedItemHeight: itemHeight * 2,
        unusedVehicleWidth: rounded(
          contentWidth - (sharedDiameter * 2),
        ),
        unusedVehicleHeight: rounded(
          vehicleAreaHeight - (itemHeight * 2),
        ),
        usedVehicleHeight: rounded(
          (itemHeight * 2) + (verticalSpace * 3),
        ),
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
        compact: false,
        columnGap: integer(columnGap),
        minimumRowGap: 0,
        minimumHorizontalSpace: 0,
        minimumVerticalSpace: 0,
        horizontalSpace: 0,
        verticalSpace: 0,
        labelGap: 0,
        labelHeight: integer(labelHeight),
        itemHeight: usedVehicleHeight,
        primaryDiameter: null,
        secondaryDiameter: null,
        sharedDiameter,
        widthLimit: integer(widthLimit),
        heightLimit: integer(heightLimit),
        usedVehicleHeight,
        unusedVehicleWidth: Math.max(
          0,
          integer(
            contentWidth
            - (sharedDiameter * 3)
            - (columnGap * 2),
          ),
        ),
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
      const orientation = orientationFor(
        rawInput,
        viewportWidth,
        viewportHeight,
      );
      const computedContentWidth = Math.max(
        0,
        viewportWidth - paddingLeft - paddingRight,
      );
      const computedContentHeight = Math.max(
        0,
        viewportHeight - paddingTop - paddingBottom,
      );
      const explicitVehicleAreaWidth = positive(
        rawInput.vehicleAreaWidth,
      );
      const explicitVehicleAreaHeight = positive(
        rawInput.vehicleAreaHeight,
      );
      const contentWidth = explicitVehicleAreaWidth > 0
        ? explicitVehicleAreaWidth
        : computedContentWidth;
      const vehicleAreaHeight = explicitVehicleAreaHeight > 0
        ? explicitVehicleAreaHeight
        : Math.max(
          0,
          computedContentHeight
            - headerHeight
            - headerGap
            - dockHeight
            - dockGap,
        );
      const geometry = orientation === "landscape"
        ? calculateLandscape(contentWidth, vehicleAreaHeight)
        : calculatePortrait(contentWidth, vehicleAreaHeight);
      const fitsWidth = orientation === "landscape"
        ? (
          (geometry.sharedDiameter * 3)
          + (geometry.columnGap * 2)
        ) <= contentWidth
        : (
          (geometry.sharedDiameter * 2)
          + (geometry.minimumHorizontalSpace * 3)
        ) <= contentWidth;
      const fitsHeight = orientation === "landscape"
        ? geometry.usedVehicleHeight <= vehicleAreaHeight
        : (
          (geometry.itemHeight * 2)
          + (geometry.minimumVerticalSpace * 3)
        ) <= vehicleAreaHeight;

      return Object.freeze({
        layoutVersion: LAYOUT_VERSION,
        mode: geometry.mode,
        orientation,
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
        contentHeight: integer(computedContentHeight),
        vehicleAreaWidth: integer(contentWidth),
        vehicleAreaHeight: integer(vehicleAreaHeight),
        vehicleAreaSource: (
          explicitVehicleAreaWidth > 0
          && explicitVehicleAreaHeight > 0
        )
          ? "rendered-vehicle-area"
          : "derived-container-area",
        ...geometry,
        fitsWidth,
        fitsHeight,
        dockBottom: integer(viewportHeight - paddingBottom),
      });
    }

    return Object.freeze({
      LAYOUT_VERSION,
      PORTRAIT_MODE,
      calculateHomeLayout,
    });
  },
);
