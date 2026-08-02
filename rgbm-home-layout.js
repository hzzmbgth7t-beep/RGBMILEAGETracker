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
    const LAYOUT_VERSION = "wc10-responsive-three-circle-home-v5";
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
          minimumCircleGap: 8,
          minimumLabelCircleGap: 4,
          minimumLabelGap: 2,
        };
      }

      return {
        minimumHorizontalSpace: clamp(
          Math.round(contentWidth * 0.022),
          8,
          12,
        ),
        minimumVerticalSpace: clamp(
          Math.round(vehicleAreaHeight * 0.012),
          8,
          12,
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
        minimumCircleGap: clamp(
          Math.round(Math.min(
            contentWidth,
            vehicleAreaHeight,
          ) * 0.025),
          8,
          12,
        ),
        minimumLabelCircleGap: 4,
        minimumLabelGap: 2,
      };
    }

    function distance(x1, y1, x2, y2) {
      return Math.hypot(x2 - x1, y2 - y1);
    }

    function circleRectangleClearance(
      circle,
      rectangle,
      radius,
    ) {
      const closestX = clamp(
        circle.x,
        rectangle.left,
        rectangle.right,
      );
      const closestY = clamp(
        circle.y,
        rectangle.top,
        rectangle.bottom,
      );

      return (
        distance(circle.x, circle.y, closestX, closestY)
        - radius
      );
    }

    function rectanglesClearance(first, second) {
      const horizontal = Math.max(
        first.left - second.right,
        second.left - first.right,
        0,
      );
      const vertical = Math.max(
        first.top - second.bottom,
        second.top - first.bottom,
        0,
      );

      if (horizontal === 0 && vertical === 0) {
        return -Math.min(
          first.right - second.left,
          second.right - first.left,
          first.bottom - second.top,
          second.bottom - first.top,
        );
      }

      return Math.hypot(horizontal, vertical);
    }

    function geometryForDiameter(
      contentWidth,
      vehicleAreaHeight,
      diameter,
      metrics,
    ) {
      const radius = diameter / 2;
      const labelSpace = metrics.labelGap + metrics.labelHeight;
      const leftCenter = {
        x: metrics.minimumHorizontalSpace + radius,
        y: 0,
      };
      const rightX = (
        contentWidth
        - metrics.minimumHorizontalSpace
        - radius
      );
      const upperCenter = {
        x: rightX,
        y: metrics.minimumVerticalSpace + radius,
      };
      const lowerCenter = {
        x: rightX,
        y: (
          vehicleAreaHeight
          - metrics.minimumVerticalSpace
          - labelSpace
          - radius
        ),
      };
      leftCenter.y = (
        upperCenter.y + lowerCenter.y
      ) / 2;

      const circles = [
        leftCenter,
        upperCenter,
        lowerCenter,
      ];
      const labels = circles.map((circle) => ({
        left: circle.x - radius,
        top: circle.y + radius + metrics.labelGap,
        right: circle.x + radius,
        bottom: (
          circle.y
          + radius
          + metrics.labelGap
          + metrics.labelHeight
        ),
      }));
      const positions = circles.map((circle) => ({
        x: circle.x - radius,
        y: circle.y - radius,
      }));

      const circleClearances = [];
      for (let first = 0; first < circles.length; first += 1) {
        for (
          let second = first + 1;
          second < circles.length;
          second += 1
        ) {
          circleClearances.push(
            distance(
              circles[first].x,
              circles[first].y,
              circles[second].x,
              circles[second].y,
            ) - diameter,
          );
        }
      }

      const labelCircleClearances = [];
      for (
        let circleIndex = 0;
        circleIndex < circles.length;
        circleIndex += 1
      ) {
        for (
          let labelIndex = 0;
          labelIndex < labels.length;
          labelIndex += 1
        ) {
          if (circleIndex === labelIndex) {
            continue;
          }

          labelCircleClearances.push(
            circleRectangleClearance(
              circles[circleIndex],
              labels[labelIndex],
              radius,
            ),
          );
        }
      }

      const labelClearances = [];
      for (let first = 0; first < labels.length; first += 1) {
        for (
          let second = first + 1;
          second < labels.length;
          second += 1
        ) {
          labelClearances.push(
            rectanglesClearance(labels[first], labels[second]),
          );
        }
      }

      const contained = (
        positions.every((position) => (
          position.x >= 0
          && position.y >= 0
          && position.x + diameter <= contentWidth
          && position.y + diameter <= vehicleAreaHeight
        ))
        && labels.every((label) => (
          label.left >= 0
          && label.top >= 0
          && label.right <= contentWidth
          && label.bottom <= vehicleAreaHeight
        ))
      );
      const circlesClear = circleClearances.every(
        (clearance) => (
          clearance + 0.0001
          >= metrics.minimumCircleGap
        ),
      );
      const labelsClearCircles = labelCircleClearances.every(
        (clearance) => (
          clearance + 0.0001
          >= metrics.minimumLabelCircleGap
        ),
      );
      const labelsClearLabels = labelClearances.every(
        (clearance) => (
          clearance + 0.0001
          >= metrics.minimumLabelGap
        ),
      );

      return {
        circles,
        labels,
        positions,
        contained,
        circlesClear,
        labelsClearCircles,
        labelsClearLabels,
        collisionFree: (
          contained
          && circlesClear
          && labelsClearCircles
          && labelsClearLabels
        ),
        circleClearances,
        labelCircleClearances,
        labelClearances,
      };
    }

    function maximumPortraitDiameter(
      contentWidth,
      vehicleAreaHeight,
      metrics,
    ) {
      const labelSpace = metrics.labelGap + metrics.labelHeight;
      const upperBound = integer(
        Math.min(
          contentWidth
            - (metrics.minimumHorizontalSpace * 2),
          vehicleAreaHeight
            - (metrics.minimumVerticalSpace * 2)
            - labelSpace,
        ),
      );

      for (
        let diameter = upperBound;
        diameter >= 1;
        diameter -= 1
      ) {
        const geometry = geometryForDiameter(
          contentWidth,
          vehicleAreaHeight,
          diameter,
          metrics,
        );

        if (geometry.collisionFree) {
          return {
            diameter,
            geometry,
            upperBound,
          };
        }
      }

      return {
        diameter: 0,
        geometry: geometryForDiameter(
          contentWidth,
          vehicleAreaHeight,
          0,
          metrics,
        ),
        upperBound,
      };
    }

    function minimumValue(values) {
      return values.length > 0
        ? Math.min(...values)
        : 0;
    }

    function calculatePortrait(contentWidth, vehicleAreaHeight) {
      const normalMetrics = portraitMetrics(
        contentWidth,
        vehicleAreaHeight,
        false,
      );
      const normal = maximumPortraitDiameter(
        contentWidth,
        vehicleAreaHeight,
        normalMetrics,
      );
      const compact = normal.diameter < 120;
      const metrics = compact
        ? portraitMetrics(contentWidth, vehicleAreaHeight, true)
        : normalMetrics;
      const result = compact
        ? maximumPortraitDiameter(
          contentWidth,
          vehicleAreaHeight,
          metrics,
        )
        : normal;
      const sharedDiameter = result.diameter;
      const geometry = result.geometry;
      const labelSpace = metrics.labelGap + metrics.labelHeight;
      const itemHeight = sharedDiameter + labelSpace;
      const primary = geometry.positions[0];
      const upperSecondary = geometry.positions[1];
      const lowerSecondary = geometry.positions[2];
      const primaryCenter = geometry.circles[0];
      const upperCenter = geometry.circles[1];
      const lowerCenter = geometry.circles[2];
      const diagonalCenterDistance = distance(
        primaryCenter.x,
        primaryCenter.y,
        upperCenter.x,
        upperCenter.y,
      );
      const verticalCenterSeparation = (
        lowerCenter.y - upperCenter.y
      );
      const horizontalCenterSeparation = (
        upperCenter.x - primaryCenter.x
      );
      const horizontalProjectionGap = (
        upperSecondary.x
        - primary.x
        - sharedDiameter
      );
      const upperCircleGap = (
        primary.y
        - upperSecondary.y
        - sharedDiameter
      );
      const lowerCircleGap = (
        lowerSecondary.y
        - primary.y
        - sharedDiameter
      );
      const nextDiameter = sharedDiameter + 1;
      const nextGeometry = geometryForDiameter(
        contentWidth,
        vehicleAreaHeight,
        nextDiameter,
        metrics,
      );

      return {
        mode: PORTRAIT_MODE,
        strategy: "maximum equal circles with extreme secondary centers",
        compact,
        columnGap: rounded(horizontalProjectionGap),
        minimumRowGap: metrics.minimumCircleGap,
        minimumHorizontalSpace:
          metrics.minimumHorizontalSpace,
        minimumVerticalSpace:
          metrics.minimumVerticalSpace,
        minimumCircleGap: metrics.minimumCircleGap,
        minimumLabelCircleGap:
          metrics.minimumLabelCircleGap,
        minimumLabelGap: metrics.minimumLabelGap,
        horizontalSpace:
          metrics.minimumHorizontalSpace,
        verticalSpace:
          metrics.minimumVerticalSpace,
        labelGap: metrics.labelGap,
        labelHeight: metrics.labelHeight,
        itemHeight,
        sharedDiameter,
        primaryDiameter: sharedDiameter,
        secondaryDiameter: sharedDiameter,
        searchUpperBound: result.upperBound,
        nextDiameterFits: nextGeometry.collisionFree,
        maximized: (
          sharedDiameter > 0
          && !nextGeometry.collisionFree
        ),
        widthLimited: false,
        heightLimited: false,
        primary: {
          x: rounded(primary.x),
          y: rounded(primary.y),
        },
        upperSecondary: {
          x: rounded(upperSecondary.x),
          y: rounded(upperSecondary.y),
        },
        lowerSecondary: {
          x: rounded(lowerSecondary.x),
          y: rounded(lowerSecondary.y),
        },
        primaryCenter: {
          x: rounded(primaryCenter.x),
          y: rounded(primaryCenter.y),
        },
        upperSecondaryCenter: {
          x: rounded(upperCenter.x),
          y: rounded(upperCenter.y),
        },
        lowerSecondaryCenter: {
          x: rounded(lowerCenter.x),
          y: rounded(lowerCenter.y),
        },
        horizontalCenterSeparation:
          rounded(horizontalCenterSeparation),
        verticalCenterSeparation:
          rounded(verticalCenterSeparation),
        diagonalCenterDistance:
          rounded(diagonalCenterDistance),
        horizontalProjectionGap:
          rounded(horizontalProjectionGap),
        upperCircleGap: rounded(upperCircleGap),
        lowerCircleGap: rounded(lowerCircleGap),
        minimumActualCircleClearance: rounded(
          minimumValue(geometry.circleClearances),
        ),
        minimumActualLabelCircleClearance: rounded(
          minimumValue(geometry.labelCircleClearances),
        ),
        minimumActualLabelClearance: rounded(
          minimumValue(geometry.labelClearances),
        ),
        topSpace: rounded(upperSecondary.y),
        bottomSpace: rounded(
          vehicleAreaHeight
          - (
            lowerSecondary.y
            + sharedDiameter
            + labelSpace
          ),
        ),
        leftSpace: rounded(primary.x),
        rightSpace: rounded(
          contentWidth
          - (
            upperSecondary.x
            + sharedDiameter
          ),
        ),
        usedCircleWidth: rounded(
          (
            upperSecondary.x
            + sharedDiameter
          ) - primary.x,
        ),
        usedItemHeight: rounded(
          (
            lowerSecondary.y
            + sharedDiameter
            + labelSpace
          ) - upperSecondary.y,
        ),
        unusedVehicleWidth: rounded(
          contentWidth
          - (
            (
              upperSecondary.x
              + sharedDiameter
            ) - primary.x
          ),
        ),
        unusedVehicleHeight: rounded(
          vehicleAreaHeight
          - (
            (
              lowerSecondary.y
              + sharedDiameter
              + labelSpace
            ) - upperSecondary.y
          ),
        ),
        usedVehicleHeight: rounded(
          (
            lowerSecondary.y
            + sharedDiameter
            + labelSpace
          ) - upperSecondary.y,
        ),
        collisionFree: geometry.collisionFree,
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
        strategy: "accepted three-across equal circles",
        compact: false,
        columnGap: integer(columnGap),
        minimumRowGap: 0,
        minimumHorizontalSpace: 0,
        minimumVerticalSpace: 0,
        minimumCircleGap: 0,
        minimumLabelCircleGap: 0,
        minimumLabelGap: 0,
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
        collisionFree: true,
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
          geometry.primary.x >= 0
          && geometry.upperSecondary.x >= 0
          && (
            geometry.upperSecondary.x
            + geometry.sharedDiameter
          ) <= contentWidth
        );
      const fitsHeight = orientation === "landscape"
        ? geometry.usedVehicleHeight <= vehicleAreaHeight
        : (
          geometry.upperSecondary.y >= 0
          && (
            geometry.lowerSecondary.y
            + geometry.itemHeight
          ) <= vehicleAreaHeight
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
