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
    const LAYOUT_VERSION = "wc10-responsive-three-circle-home-v5-f20";
    const PORTRAIT_MODE = "portrait-solved-equal-diameter";

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

    function measuredLabelHeight(rawInput, fallback) {
      const labelBounds = Array.isArray(rawInput.labelBounds)
        ? rawInput.labelBounds
        : [];
      const heights = labelBounds.map((item) => (
        positive(item && item.height)
      ));
      const rawMax = positive(rawInput.labelMaxHeight);
      const measured = Math.max(rawMax, ...heights, 0);

      if (measured <= 0) {
        return fallback;
      }

      return clamp(Math.ceil(measured), fallback, 58);
    }

    function measuredLabelWidth(rawInput) {
      const labelBounds = Array.isArray(rawInput.labelBounds)
        ? rawInput.labelBounds
        : [];
      const widths = labelBounds.map((item) => (
        positive(item && item.width)
      ));

      return Math.ceil(Math.max(positive(rawInput.labelMaxWidth), ...widths, 0));
    }

    function portraitMetrics(
      contentWidth,
      vehicleAreaHeight,
      rawInput = {},
      compact = false,
    ) {
      const base = compact
        ? {
          minimumHorizontalSpace: 6,
          minimumVerticalSpace: 8,
          minimumRightPairGap: 8,
          labelGap: 3,
          labelHeight: clamp(
            Math.round(vehicleAreaHeight * 0.04),
            28,
            34,
          ),
          edgeClearance: 6,
        }
        : {
          minimumHorizontalSpace: clamp(
            Math.round(contentWidth * 0.015),
            6,
            10,
          ),
          minimumVerticalSpace: clamp(
            Math.round(vehicleAreaHeight * 0.012),
            10,
            14,
          ),
          minimumRightPairGap: clamp(
            Math.round(vehicleAreaHeight * 0.012),
            10,
            14,
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
          edgeClearance: clamp(
            Math.round(contentWidth * 0.015),
            6,
            10,
          ),
        };

      const actualLabelHeight = measuredLabelHeight(rawInput, base.labelHeight);
      const actualLabelWidth = measuredLabelWidth(rawInput);

      return {
        ...base,
        labelHeight: actualLabelHeight,
        measuredLabelWidth: actualLabelWidth,
      };
    }

    function portraitCandidate(
      contentWidth,
      vehicleAreaHeight,
      metrics,
      sharedDiameter,
    ) {
      const edgeClearance = metrics.edgeClearance;
      const minimumColumnGap = metrics.minimumHorizontalSpace;
      const itemHeight = (
        sharedDiameter
        + metrics.labelGap
        + metrics.labelHeight
      );
      const leftX = edgeClearance;
      const rightX = contentWidth - edgeClearance - sharedDiameter;
      const columnGap = rightX - leftX - sharedDiameter;
      const residualHeight = vehicleAreaHeight - (itemHeight * 2);
      const rightPairGap = metrics.minimumRightPairGap;
      const topBottomSpace = (residualHeight - rightPairGap) / 2;
      const upperRightY = topBottomSpace;
      const lowerRightY = (
        upperRightY
        + itemHeight
        + rightPairGap
      );
      const rightMidpoint = (
        (upperRightY + (sharedDiameter / 2))
        + (lowerRightY + (sharedDiameter / 2))
      ) / 2;
      const leftY = rightMidpoint - (sharedDiameter / 2);
      const primaryLabelBottom = (
        leftY
        + sharedDiameter
        + metrics.labelGap
        + metrics.labelHeight
      );
      const lowerLabelBottom = (
        lowerRightY
        + sharedDiameter
        + metrics.labelGap
        + metrics.labelHeight
      );

      return {
        edgeClearance,
        minimumColumnGap,
        columnGap,
        itemHeight,
        residualHeight,
        rightPairGap,
        topBottomSpace,
        leftX,
        rightX,
        leftY,
        upperRightY,
        lowerRightY,
        primaryLabelBottom,
        lowerLabelBottom,
      };
    }

    function invalidPortraitConstraint(
      contentWidth,
      vehicleAreaHeight,
      metrics,
      sharedDiameter,
    ) {
      if (sharedDiameter < 44) {
        return "circle diameter below 44px touch target minimum";
      }

      const candidate = portraitCandidate(
        contentWidth,
        vehicleAreaHeight,
        metrics,
        sharedDiameter,
      );

      if (candidate.leftX < metrics.edgeClearance) {
        return "left circle violates edge clearance";
      }

      if (candidate.rightX + sharedDiameter > contentWidth - metrics.edgeClearance) {
        return "right circles violate edge clearance";
      }

      if (candidate.columnGap < metrics.minimumHorizontalSpace) {
        return "left/right circle columns violate minimum horizontal gap";
      }

      if (metrics.measuredLabelWidth > 0 && sharedDiameter < 44) {
        return "display label width cannot be measured against a valid circle";
      }

      if (candidate.topBottomSpace < metrics.minimumVerticalSpace) {
        return "right-side pair violates top/bottom portrait clearance";
      }

      if (candidate.rightPairGap < metrics.minimumRightPairGap) {
        return "right-side pair violates minimum inward vertical gap";
      }

      if (candidate.leftY < metrics.minimumVerticalSpace) {
        return "left circle violates top portrait clearance";
      }

      if (candidate.primaryLabelBottom > vehicleAreaHeight - metrics.minimumVerticalSpace) {
        return "left display label intersects the menu boundary";
      }

      if (candidate.lowerLabelBottom > vehicleAreaHeight - metrics.minimumVerticalSpace) {
        return "lower-right display label intersects the menu boundary";
      }

      return "";
    }

    function solvePortrait(contentWidth, vehicleAreaHeight, metrics) {
      const widthLimit = Math.floor(
        (
          contentWidth
          - (metrics.edgeClearance * 2)
          - metrics.minimumHorizontalSpace
        ) / 2,
      );
      const heightLimit = Math.floor(
        (
          vehicleAreaHeight
          - (metrics.minimumVerticalSpace * 2)
          - metrics.minimumRightPairGap
          - ((metrics.labelGap + metrics.labelHeight) * 2)
        ) / 2,
      );
      const startDiameter = Math.max(44, Math.min(widthLimit, heightLimit));

      for (let diameter = startDiameter; diameter >= 44; diameter -= 1) {
        const failure = invalidPortraitConstraint(
          contentWidth,
          vehicleAreaHeight,
          metrics,
          diameter,
        );

        if (!failure) {
          const nextDiameter = diameter + 1;
          const nextFailure = invalidPortraitConstraint(
            contentWidth,
            vehicleAreaHeight,
            metrics,
            nextDiameter,
          ) || "next larger diameter exceeds computed width/height limit";

          return {
            sharedDiameter: diameter,
            nextDiameter,
            nextDiameterRejected: true,
            nextDiameterFailure: nextFailure,
            widthLimit,
            heightLimit,
          };
        }
      }

      return {
        sharedDiameter: Math.max(0, Math.min(widthLimit, heightLimit)),
        nextDiameter: Math.max(1, Math.min(widthLimit, heightLimit) + 1),
        nextDiameterRejected: true,
        nextDiameterFailure: "no valid portrait circle geometry found above minimum touch target",
        widthLimit,
        heightLimit,
      };
    }

    function calculatePortrait(
      contentWidth,
      vehicleAreaHeight,
      rawInput = {},
    ) {
      const normalMetrics = portraitMetrics(
        contentWidth,
        vehicleAreaHeight,
        rawInput,
        false,
      );
      const normalLimits = solvePortrait(
        contentWidth,
        vehicleAreaHeight,
        normalMetrics,
      );
      const compact = normalLimits.sharedDiameter < 120;
      const metrics = compact
        ? portraitMetrics(contentWidth, vehicleAreaHeight, rawInput, true)
        : normalMetrics;
      const solved = compact
        ? solvePortrait(contentWidth, vehicleAreaHeight, metrics)
        : normalLimits;
      const sharedDiameter = solved.sharedDiameter;
      const candidate = portraitCandidate(
        contentWidth,
        vehicleAreaHeight,
        metrics,
        sharedDiameter,
      );
      const upperCenterY = candidate.upperRightY + (sharedDiameter / 2);
      const lowerCenterY = candidate.lowerRightY + (sharedDiameter / 2);
      const primaryCenterY = candidate.leftY + (sharedDiameter / 2);

      return {
        mode: PORTRAIT_MODE,
        compact,
        columnGap: rounded(candidate.columnGap),
        minimumRowGap: metrics.minimumRightPairGap,
        minimumHorizontalSpace:
          metrics.minimumHorizontalSpace,
        minimumVerticalSpace:
          metrics.minimumVerticalSpace,
        minimumRightPairGap:
          metrics.minimumRightPairGap,
        edgeClearance: metrics.edgeClearance,
        horizontalSpace: rounded(candidate.edgeClearance),
        verticalSpace: rounded(candidate.topBottomSpace),
        topBottomSpace: rounded(candidate.topBottomSpace),
        labelGap: metrics.labelGap,
        labelHeight: metrics.labelHeight,
        measuredLabelWidth: metrics.measuredLabelWidth,
        itemHeight: rounded(candidate.itemHeight),
        sharedDiameter,
        primaryDiameter: sharedDiameter,
        secondaryDiameter: sharedDiameter,
        diameterFromWidth: solved.widthLimit,
        diameterFromHeight: solved.heightLimit,
        widthLimited: solved.widthLimit <= solved.heightLimit,
        heightLimited: solved.heightLimit < solved.widthLimit,
        nextDiameter: solved.nextDiameter,
        nextDiameterRejected: solved.nextDiameterRejected,
        nextDiameterFailure: solved.nextDiameterFailure,
        primary: {
          x: rounded(candidate.leftX),
          y: rounded(candidate.leftY),
          centerX: rounded(candidate.leftX + (sharedDiameter / 2)),
          centerY: rounded(primaryCenterY),
        },
        upperSecondary: {
          x: rounded(candidate.rightX),
          y: rounded(candidate.upperRightY),
          centerX: rounded(candidate.rightX + (sharedDiameter / 2)),
          centerY: rounded(upperCenterY),
        },
        lowerSecondary: {
          x: rounded(candidate.rightX),
          y: rounded(candidate.lowerRightY),
          centerX: rounded(candidate.rightX + (sharedDiameter / 2)),
          centerY: rounded(lowerCenterY),
        },
        rightCenterMidpointY: rounded((upperCenterY + lowerCenterY) / 2),
        primaryCenterMatchesRightMidpoint: (
          Math.abs(
            primaryCenterY
            - ((upperCenterY + lowerCenterY) / 2)
          ) <= 0.5
        ),
        rightCentersMovedInward: true,
        usedCircleWidth: (
          (candidate.rightX + sharedDiameter)
          - candidate.leftX
        ),
        usedItemHeight: rounded(
          candidate.lowerLabelBottom - candidate.upperRightY,
        ),
        unusedVehicleWidth: rounded(
          contentWidth
          - (
            (candidate.rightX + sharedDiameter)
            - candidate.leftX
          ),
        ),
        unusedVehicleHeight: rounded(
          vehicleAreaHeight
          - (
            candidate.lowerLabelBottom
            - candidate.upperRightY
          ),
        ),
        usedVehicleHeight: rounded(
          candidate.lowerLabelBottom - candidate.upperRightY,
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
        : calculatePortrait(contentWidth, vehicleAreaHeight, rawInput);
      const fitsWidth = orientation === "landscape"
        ? (
          (geometry.sharedDiameter * 3)
          + (geometry.columnGap * 2)
        ) <= contentWidth
        : (
          geometry.lowerSecondary.x
          + geometry.sharedDiameter
        ) <= contentWidth;
      const fitsHeight = orientation === "landscape"
        ? geometry.usedVehicleHeight <= vehicleAreaHeight
        : (
          geometry.lowerSecondary.y
          + geometry.itemHeight
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
