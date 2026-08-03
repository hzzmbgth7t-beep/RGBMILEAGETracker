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
    const LAYOUT_VERSION = "wc10-circle-first-home-v5";
    const PORTRAIT_MODE = "portrait-circle-solver";

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
          edgeClearance: 6,
          circleGap: 7,
          labelCircleGap: 3,
          labelGap: 3,
          labelHeight: clamp(
            Math.round(vehicleAreaHeight * 0.04),
            28,
            34,
          ),
          labelWidthExtra: clamp(
            Math.round(contentWidth * 0.03),
            8,
            14,
          ),
        };
      }

      return {
        edgeClearance: clamp(
          Math.round(contentWidth * 0.02),
          6,
          10,
        ),
        circleGap: clamp(
          Math.round(contentWidth * 0.02),
          8,
          10,
        ),
        labelCircleGap: 4,
        labelGap: clamp(
          Math.round(vehicleAreaHeight * 0.006),
          4,
          6,
        ),
        labelHeight: clamp(
          Math.round(vehicleAreaHeight * 0.045),
          36,
          42,
        ),
        labelWidthExtra: clamp(
          Math.round(contentWidth * 0.035),
          12,
          22,
        ),
      };
    }

    function legacyPortraitReference(
      contentWidth,
      vehicleAreaHeight,
      metrics,
    ) {
      const minimumHorizontalSpace = clamp(
        Math.round(contentWidth * 0.03),
        10,
        16,
      );
      const minimumVerticalSpace = clamp(
        Math.round(vehicleAreaHeight * 0.015),
        10,
        16,
      );
      const labelSpace = metrics.labelGap + metrics.labelHeight;
      const diameterFromWidth = Math.max(
        0,
        (
          contentWidth
          - (minimumHorizontalSpace * 3)
        ) / 2,
      );
      const diameterFromHeight = Math.max(
        0,
        (
          vehicleAreaHeight
          - (labelSpace * 2)
          - (minimumVerticalSpace * 3)
        ) / 2,
      );
      const sharedDiameter = integer(
        Math.min(diameterFromWidth, diameterFromHeight),
      );
      const itemHeight = (
        sharedDiameter
        + metrics.labelGap
        + metrics.labelHeight
      );
      const verticalSpace = Math.max(
        0,
        (vehicleAreaHeight - (itemHeight * 2)) / 3,
      );
      const rightCenterGap = itemHeight + verticalSpace;

      return {
        sharedDiameter,
        rightCenterGap,
      };
    }

    function labelWidthFor(
      diameter,
      contentWidth,
      metrics,
      leftCenterX,
      rightCenterX,
    ) {
      const widestFromCircle = diameter + metrics.labelWidthExtra;
      const widestFromLeftCenter = (
        2 * (leftCenterX - metrics.edgeClearance)
      );
      const widestFromRightCenter = (
        2 * (contentWidth - rightCenterX - metrics.edgeClearance)
      );
      return Math.max(
        diameter,
        Math.floor(
          Math.min(
            contentWidth - (metrics.edgeClearance * 2),
            widestFromCircle,
            widestFromLeftCenter,
            widestFromRightCenter,
          ),
        ),
      );
    }

    function candidateForRadius(
      radius,
      contentWidth,
      vehicleAreaHeight,
      metrics,
      legacy,
    ) {
      const diameter = radius * 2;
      const leftCenterX = radius + metrics.edgeClearance;
      const rightCenterX = contentWidth - radius - metrics.edgeClearance;
      const horizontalDistance = rightCenterX - leftCenterX;
      const minimumCenterDistance = diameter + metrics.circleGap;

      if (horizontalDistance <= 0) {
        return null;
      }

      const diagonalSeparation = horizontalDistance >= minimumCenterDistance
        ? minimumCenterDistance
        : 2 * Math.sqrt(
          (minimumCenterDistance * minimumCenterDistance)
          - (horizontalDistance * horizontalDistance),
        );
      const sameColumnSeparation = Math.max(
        minimumCenterDistance,
        diameter
          + metrics.labelGap
          + metrics.labelHeight
          + metrics.labelCircleGap,
      );
      const requiredRightCenterGap = Math.ceil(
        Math.max(diagonalSeparation, sameColumnSeparation),
      );

      if (requiredRightCenterGap > legacy.rightCenterGap) {
        return null;
      }

      const topCenterLimit = radius + metrics.edgeClearance;
      const bottomCenterLimit = (
        vehicleAreaHeight
        - metrics.edgeClearance
        - radius
        - metrics.labelGap
        - metrics.labelHeight
      );
      const availableRightCenterGap = bottomCenterLimit - topCenterLimit;

      if (availableRightCenterGap < requiredRightCenterGap) {
        return null;
      }

      const midpointY = (
        topCenterLimit + bottomCenterLimit
      ) / 2;
      const upperCenterY = midpointY - (requiredRightCenterGap / 2);
      const lowerCenterY = midpointY + (requiredRightCenterGap / 2);
      const primaryCenterY = midpointY;
      const labelWidth = labelWidthFor(
        diameter,
        contentWidth,
        metrics,
        leftCenterX,
        rightCenterX,
      );

      const circles = [
        { name: "primary", x: leftCenterX, y: primaryCenterY },
        { name: "upperSecondary", x: rightCenterX, y: upperCenterY },
        { name: "lowerSecondary", x: rightCenterX, y: lowerCenterY },
      ];

      for (const circle of circles) {
        if (circle.x - radius < metrics.edgeClearance) return null;
        if (circle.x + radius > contentWidth - metrics.edgeClearance) {
          return null;
        }
        if (circle.y - radius < metrics.edgeClearance) return null;
        if (
          circle.y
          + radius
          + metrics.labelGap
          + metrics.labelHeight
          > vehicleAreaHeight - metrics.edgeClearance
        ) {
          return null;
        }
      }

      for (let i = 0; i < circles.length; i += 1) {
        for (let j = i + 1; j < circles.length; j += 1) {
          const xDelta = circles[i].x - circles[j].x;
          const yDelta = circles[i].y - circles[j].y;
          const centerDistance = Math.sqrt(
            (xDelta * xDelta) + (yDelta * yDelta),
          );

          if (centerDistance < minimumCenterDistance) {
            return null;
          }
        }
      }

      return {
        radius,
        diameter,
        labelWidth,
        leftCenterX,
        rightCenterX,
        primaryCenterY,
        upperCenterY,
        lowerCenterY,
        horizontalDistance,
        rightCenterGap: requiredRightCenterGap,
        minimumCenterDistance,
        diagonalSeparation,
        sameColumnSeparation,
        legacyRightCenterGap: legacy.rightCenterGap,
      };
    }

    function calculatePortrait(contentWidth, vehicleAreaHeight) {
      const normalMetrics = portraitMetrics(
        contentWidth,
        vehicleAreaHeight,
        false,
      );
      const legacyNormal = legacyPortraitReference(
        contentWidth,
        vehicleAreaHeight,
        normalMetrics,
      );
      const compact = legacyNormal.sharedDiameter < 120;
      const metrics = compact
        ? portraitMetrics(contentWidth, vehicleAreaHeight, true)
        : normalMetrics;
      const legacy = compact
        ? legacyPortraitReference(contentWidth, vehicleAreaHeight, metrics)
        : legacyNormal;
      const maximumEdgeRadius = Math.floor(
        (contentWidth - (metrics.edgeClearance * 2)) / 2,
      );
      let best = null;
      let nextLargerFailure = "not-tested";

      for (let radius = maximumEdgeRadius; radius >= 20; radius -= 1) {
        const candidate = candidateForRadius(
          radius,
          contentWidth,
          vehicleAreaHeight,
          metrics,
          legacy,
        );

        if (candidate) {
          best = candidate;
          const next = candidateForRadius(
            radius + 1,
            contentWidth,
            vehicleAreaHeight,
            metrics,
            legacy,
          );
          nextLargerFailure = next
            ? "next-larger-valid"
            : "right-center-gap would exceed the inward legacy portrait separation or a real circle/label constraint";
          break;
        }
      }

      if (!best) {
        const fallbackDiameter = Math.max(
          44,
          Math.min(legacy.sharedDiameter, maximumEdgeRadius * 2),
        );
        const fallbackRadius = fallbackDiameter / 2;
        best = candidateForRadius(
          Math.floor(fallbackRadius),
          contentWidth,
          vehicleAreaHeight,
          metrics,
          {
            ...legacy,
            rightCenterGap: Number.POSITIVE_INFINITY,
          },
        );
      }

      if (!best) {
        throw new RangeError(
          "Unable to calculate a valid portrait circle layout.",
        );
      }

      const diameter = best.diameter;
      const itemHeight = (
        diameter + metrics.labelGap + metrics.labelHeight
      );
      const primaryX = best.leftCenterX - (best.labelWidth / 2);
      const upperX = best.rightCenterX - (best.labelWidth / 2);
      const lowerX = upperX;
      const primaryY = best.primaryCenterY - best.radius;
      const upperY = best.upperCenterY - best.radius;
      const lowerY = best.lowerCenterY - best.radius;
      const oldRightUpperCenterY = (
        (vehicleAreaHeight - ((legacy.sharedDiameter + metrics.labelGap + metrics.labelHeight) * 2)) / 3
      ) + (legacy.sharedDiameter / 2);
      const oldRightLowerCenterY = (
        oldRightUpperCenterY
        + legacy.rightCenterGap
      );

      return {
        mode: PORTRAIT_MODE,
        compact,
        columnGap: 0,
        minimumRowGap: metrics.circleGap,
        minimumHorizontalSpace: metrics.edgeClearance,
        minimumVerticalSpace: metrics.edgeClearance,
        horizontalSpace: rounded(metrics.edgeClearance),
        verticalSpace: rounded(
          Math.max(
            0,
            best.upperCenterY - best.radius - metrics.edgeClearance,
          ),
        ),
        edgeClearance: metrics.edgeClearance,
        circleGap: metrics.circleGap,
        labelCircleGap: metrics.labelCircleGap,
        labelGap: metrics.labelGap,
        labelHeight: metrics.labelHeight,
        labelWidth: best.labelWidth,
        itemHeight,
        sharedDiameter: diameter,
        primaryDiameter: diameter,
        secondaryDiameter: diameter,
        radius: best.radius,
        primaryCenter: {
          x: rounded(best.leftCenterX),
          y: rounded(best.primaryCenterY),
        },
        upperSecondaryCenter: {
          x: rounded(best.rightCenterX),
          y: rounded(best.upperCenterY),
        },
        lowerSecondaryCenter: {
          x: rounded(best.rightCenterX),
          y: rounded(best.lowerCenterY),
        },
        primary: {
          x: rounded(primaryX),
          y: rounded(primaryY),
        },
        upperSecondary: {
          x: rounded(upperX),
          y: rounded(upperY),
        },
        lowerSecondary: {
          x: rounded(lowerX),
          y: rounded(lowerY),
        },
        diameterFromWidth: diameter,
        diameterFromHeight: diameter,
        widthLimited: true,
        heightLimited: false,
        usedCircleWidth: diameter * 2,
        usedItemHeight: itemHeight * 2,
        horizontalCenterDistance: rounded(best.horizontalDistance),
        rightCenterGap: rounded(best.rightCenterGap),
        minimumCenterDistance: rounded(best.minimumCenterDistance),
        diagonalSeparation: rounded(best.diagonalSeparation),
        sameColumnSeparation: rounded(best.sameColumnSeparation),
        legacySharedDiameter: legacy.sharedDiameter,
        legacyRightCenterGap: rounded(legacy.rightCenterGap),
        upperRightMovedLower: best.upperCenterY >= oldRightUpperCenterY,
        lowerRightMovedHigher: best.lowerCenterY <= oldRightLowerCenterY,
        primaryAlignedToRightMidpoint: (
          Math.abs(
            best.primaryCenterY
            - ((best.upperCenterY + best.lowerCenterY) / 2),
          ) < 0.01
        ),
        nextLargerDiameter: diameter + 2,
        nextLargerFailure,
        unusedVehicleWidth: rounded(
          contentWidth - diameter,
        ),
        unusedVehicleHeight: rounded(
          vehicleAreaHeight
          - (
            (best.lowerCenterY + best.radius + metrics.labelGap + metrics.labelHeight)
            - (best.upperCenterY - best.radius)
          ),
        ),
        usedVehicleHeight: rounded(
          (best.lowerCenterY + best.radius + metrics.labelGap + metrics.labelHeight)
          - (best.upperCenterY - best.radius),
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
        labelWidth: sharedDiameter,
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
          geometry.primaryCenter.x - geometry.radius >= 0
          && geometry.upperSecondaryCenter.x + geometry.radius <= contentWidth
        );
      const fitsHeight = orientation === "landscape"
        ? geometry.usedVehicleHeight <= vehicleAreaHeight
        : (
          geometry.upperSecondaryCenter.y - geometry.radius >= 0
          && geometry.lowerSecondaryCenter.y
            + geometry.radius
            + geometry.labelGap
            + geometry.labelHeight <= vehicleAreaHeight
        );

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
