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
    const LAYOUT_VERSION = "wc10-f24-circle-label-geometry-v2";
    const PORTRAIT_MODE = "portrait-circle-label-f24";
    const MINIMUM_RADIUS = 22;

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

    function portraitMetrics(contentWidth, vehicleAreaHeight) {
      return {
        edgeGap: clamp(Math.round(contentWidth * 0.018), 6, 10),
        circleGap: clamp(Math.round(contentWidth * 0.014), 5, 8),
        labelGap: clamp(Math.round(vehicleAreaHeight * 0.007), 5, 7),
        labelHeight: clamp(Math.round(vehicleAreaHeight * 0.047), 32, 38),
      };
    }

    function measuredLabel(rawInput, index, fallbackWidth, fallbackHeight) {
      const measurements = Array.isArray(rawInput.labelMeasurements)
        ? rawInput.labelMeasurements
        : [];
      const item = measurements[index] || {};
      return {
        width: clamp(
          finiteNumber(item.width, fallbackWidth),
          44,
          Math.max(44, finiteNumber(item.maxWidth, fallbackWidth)),
        ),
        height: clamp(
          finiteNumber(item.height, fallbackHeight),
          20,
          Math.max(20, fallbackHeight + 8),
        ),
      };
    }

    function circleRect(cx, cy, r) {
      return {
        left: cx - r,
        right: cx + r,
        top: cy - r,
        bottom: cy + r,
      };
    }

    function labelRect(cx, cy, r, width, height, gap) {
      return {
        left: cx - (width / 2),
        right: cx + (width / 2),
        top: cy + r + gap,
        bottom: cy + r + gap + height,
      };
    }

    function rectOverlap(a, b) {
      return !(
        a.right <= b.left
        || a.left >= b.right
        || a.bottom <= b.top
        || a.top >= b.bottom
      );
    }

    function rectCircleClearance(rect, circle) {
      const nearestX = clamp(circle.cx, rect.left, rect.right);
      const nearestY = clamp(circle.cy, rect.top, rect.bottom);
      return Math.hypot(circle.cx - nearestX, circle.cy - nearestY)
        - circle.r;
    }

    function pairClearance(a, b) {
      return Math.hypot(a.cx - b.cx, a.cy - b.cy) - a.r - b.r;
    }

    function item(name, cx, cy, r, label, metrics) {
      const circleBox = circleRect(cx, cy, r);
      const labelBox = labelRect(
        cx,
        cy,
        r,
        label.width,
        label.height,
        metrics.labelGap,
      );

      return {
        name,
        cx,
        cy,
        r,
        diameter: r * 2,
        labelWidth: label.width,
        labelHeight: label.height,
        circle: circleBox,
        label: labelBox,
        ownLabelGap: labelBox.top - circleBox.bottom,
      };
    }

    function validateCandidate(
      release,
      contentWidth,
      vehicleAreaHeight,
      metrics,
    ) {
      const items = [
        release.primary,
        release.upper,
        release.lower,
      ];
      const failures = [];

      items.forEach(part => {
        if (part.circle.left < metrics.edgeGap) {
          failures.push(`${part.name} circle left edge`);
        }
        if (part.circle.right > contentWidth - metrics.edgeGap) {
          failures.push(`${part.name} circle right edge`);
        }
        if (part.circle.top < metrics.edgeGap) {
          failures.push(`${part.name} circle top edge`);
        }
        if (part.circle.bottom > vehicleAreaHeight - metrics.edgeGap) {
          failures.push(`${part.name} circle bottom edge`);
        }
        if (part.label.left < 0) {
          failures.push(`${part.name} label left edge`);
        }
        if (part.label.right > contentWidth) {
          failures.push(`${part.name} label right edge`);
        }
        if (part.label.top <= part.circle.bottom) {
          failures.push(`${part.name} own label not below circle`);
        }
        if (part.label.bottom > vehicleAreaHeight - metrics.edgeGap) {
          failures.push(`${part.name} label bottom edge`);
        }
      });

      [
        [release.primary, release.upper],
        [release.primary, release.lower],
        [release.upper, release.lower],
      ].forEach(([a, b]) => {
        if (pairClearance(a, b) < metrics.circleGap) {
          failures.push(`${a.name}/${b.name} circle clearance`);
        }
      });

      items.forEach(labelOwner => {
        items.forEach(circleOwner => {
          if (rectCircleClearance(labelOwner.label, circleOwner) < 0) {
            failures.push(
              `${labelOwner.name} label intersects ${circleOwner.name} circle`,
            );
          }
        });
      });

      [
        [release.primary, release.upper],
        [release.primary, release.lower],
        [release.upper, release.lower],
      ].forEach(([a, b]) => {
        if (rectOverlap(a.label, b.label)) {
          failures.push(`${a.name}/${b.name} label overlap`);
        }
      });

      return failures;
    }

    function buildCandidate(
      contentWidth,
      vehicleAreaHeight,
      metrics,
      labels,
      secondaryRadius,
      primaryRadius,
    ) {
      const upperCenterY = metrics.edgeGap + secondaryRadius;
      const lowerCenterY = (
        vehicleAreaHeight
        - metrics.edgeGap
        - labels.lower.height
        - metrics.labelGap
        - secondaryRadius
      );
      const primaryCenterY = (upperCenterY + lowerCenterY) / 2;
      const primaryCenterX = metrics.edgeGap + primaryRadius;
      const secondaryCenterX = contentWidth - metrics.edgeGap - secondaryRadius;

      const release = {
        primary: item(
          "primary",
          primaryCenterX,
          primaryCenterY,
          primaryRadius,
          labels.primary,
          metrics,
        ),
        upper: item(
          "upper",
          secondaryCenterX,
          upperCenterY,
          secondaryRadius,
          labels.upper,
          metrics,
        ),
        lower: item(
          "lower",
          secondaryCenterX,
          lowerCenterY,
          secondaryRadius,
          labels.lower,
          metrics,
        ),
      };

      release.failures = validateCandidate(
        release,
        contentWidth,
        vehicleAreaHeight,
        metrics,
      );
      release.valid = release.failures.length === 0;
      return release;
    }

    function firstFailure(
      contentWidth,
      vehicleAreaHeight,
      metrics,
      labels,
      secondaryRadius,
      primaryRadius,
    ) {
      const release = buildCandidate(
        contentWidth,
        vehicleAreaHeight,
        metrics,
        labels,
        secondaryRadius,
        primaryRadius,
      );
      return release.failures[0] || "no valid center with bound below-labels";
    }

    function solvePortrait(
      contentWidth,
      vehicleAreaHeight,
      metrics,
      labels,
    ) {
      const maxSecondaryRadius = Math.floor(
        Math.min(
          (contentWidth - (2 * metrics.edgeGap)) / 2,
          (
            vehicleAreaHeight
            - (2 * metrics.edgeGap)
            - labels.upper.height
            - labels.lower.height
            - (2 * metrics.labelGap)
          ) / 3,
        ),
      );
      const maxPrimaryRadius = Math.floor(
        Math.min(
          (contentWidth - (2 * metrics.edgeGap)) / 2,
          (
            vehicleAreaHeight
            - (2 * metrics.edgeGap)
            - labels.primary.height
            - metrics.labelGap
          ) / 2,
        ),
      );

      let best = null;

      for (
        let secondaryRadius = maxSecondaryRadius;
        secondaryRadius >= MINIMUM_RADIUS;
        secondaryRadius -= 1
      ) {
        for (
          let primaryRadius = maxPrimaryRadius;
          primaryRadius > secondaryRadius;
          primaryRadius -= 1
        ) {
          const release = buildCandidate(
            contentWidth,
            vehicleAreaHeight,
            metrics,
            labels,
            secondaryRadius,
            primaryRadius,
          );

          if (release.valid) {
            best = release;
            break;
          }
        }

        if (best) break;
      }

      if (!best) {
        const fallbackSecondary = Math.max(
          MINIMUM_RADIUS,
          Math.floor(Math.min(contentWidth, vehicleAreaHeight) / 7),
        );
        best = buildCandidate(
          contentWidth,
          vehicleAreaHeight,
          metrics,
          labels,
          fallbackSecondary,
          fallbackSecondary + 1,
        );
      }

      best.nextSecondaryRadiusRejection = firstFailure(
        contentWidth,
        vehicleAreaHeight,
        metrics,
        labels,
        best.upper.r + 1,
        Math.max(best.primary.r, best.upper.r + 2),
      );
      best.nextPrimaryRadiusRejection = firstFailure(
        contentWidth,
        vehicleAreaHeight,
        metrics,
        labels,
        best.upper.r,
        best.primary.r + 1,
      );
      return best;
    }

    function minCircleClearance(release) {
      return Math.min(
        pairClearance(release.primary, release.upper),
        pairClearance(release.primary, release.lower),
        pairClearance(release.upper, release.lower),
      );
    }

    function minLabelCircleClearance(release) {
      const items = [release.primary, release.upper, release.lower];
      return Math.min(
        ...items.flatMap(labelOwner => (
          items.map(circleOwner => rectCircleClearance(
            labelOwner.label,
            circleOwner,
          ))
        )),
      );
    }

    function outputItem(part) {
      return {
        x: rounded(part.circle.left),
        y: rounded(part.circle.top),
        centerX: rounded(part.cx),
        centerY: rounded(part.cy),
        radius: rounded(part.r),
        diameter: rounded(part.diameter),
        labelLeft: rounded(part.label.left),
        labelTop: rounded(part.label.top),
        labelBottom: rounded(part.label.bottom),
        labelWidth: rounded(part.labelWidth),
        labelHeight: rounded(part.labelHeight),
        ownLabelGap: rounded(part.ownLabelGap),
      };
    }

    function calculatePortrait(
      contentWidth,
      vehicleAreaHeight,
      rawInput,
    ) {
      const metrics = portraitMetrics(contentWidth, vehicleAreaHeight);
      const fallbackLabelHeight = metrics.labelHeight;
      const labels = {
        primary: measuredLabel(
          rawInput,
          0,
          Math.min(150, contentWidth * 0.38),
          fallbackLabelHeight,
        ),
        upper: measuredLabel(
          rawInput,
          1,
          Math.min(210, contentWidth * 0.54),
          fallbackLabelHeight,
        ),
        lower: measuredLabel(
          rawInput,
          2,
          Math.min(210, contentWidth * 0.54),
          fallbackLabelHeight,
        ),
      };
      const solution = solvePortrait(
        contentWidth,
        vehicleAreaHeight,
        metrics,
        labels,
      );
      const primaryDiameter = Math.floor(solution.primary.diameter);
      const secondaryDiameter = Math.floor(solution.upper.diameter);
      const maxRight = Math.max(
        solution.primary.circle.right,
        solution.upper.circle.right,
        solution.lower.circle.right,
        solution.primary.label.right,
        solution.upper.label.right,
        solution.lower.label.right,
      );
      const minLeft = Math.min(
        solution.primary.circle.left,
        solution.upper.circle.left,
        solution.lower.circle.left,
        solution.primary.label.left,
        solution.upper.label.left,
        solution.lower.label.left,
      );
      const maxBottom = Math.max(
        solution.primary.label.bottom,
        solution.upper.label.bottom,
        solution.lower.label.bottom,
      );
      const minTop = Math.min(
        solution.primary.circle.top,
        solution.upper.circle.top,
        solution.lower.circle.top,
      );

      return {
        mode: PORTRAIT_MODE,
        compact: false,
        columnGap: 0,
        minimumRowGap: metrics.circleGap,
        minimumHorizontalSpace: metrics.edgeGap,
        minimumVerticalSpace: metrics.edgeGap,
        horizontalSpace: metrics.edgeGap,
        verticalSpace: metrics.edgeGap,
        labelGap: metrics.labelGap,
        labelHeight: metrics.labelHeight,
        itemHeight: Math.max(
          primaryDiameter + metrics.labelGap + labels.primary.height,
          secondaryDiameter + metrics.labelGap + labels.upper.height,
          secondaryDiameter + metrics.labelGap + labels.lower.height,
        ),
        sharedDiameter: secondaryDiameter,
        primaryDiameter,
        secondaryDiameter,
        diameterFromWidth: contentWidth,
        diameterFromHeight: vehicleAreaHeight,
        widthLimited: false,
        heightLimited: false,
        primary: outputItem(solution.primary),
        upperSecondary: outputItem(solution.upper),
        lowerSecondary: outputItem(solution.lower),
        usedCircleWidth: rounded(maxRight - minLeft),
        usedItemHeight: rounded(maxBottom - minTop),
        unusedVehicleWidth: rounded(contentWidth - (maxRight - minLeft)),
        unusedVehicleHeight: rounded(vehicleAreaHeight - (maxBottom - minTop)),
        usedVehicleHeight: rounded(maxBottom),
        circleClearanceMinimum: rounded(minCircleClearance(solution)),
        labelCircleClearanceMinimum: rounded(
          minLabelCircleClearance(solution),
        ),
        upperLowerRadiusMaximizedFirst: true,
        middleRadiusMaximizedSecond: true,
        nextSecondaryRadiusRejection:
          solution.nextSecondaryRadiusRejection,
        nextPrimaryRadiusRejection:
          solution.nextPrimaryRadiusRejection,
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
          geometry.primary.x >= -0.001
          && geometry.primary.x + geometry.primaryDiameter <= contentWidth + 0.001
          && geometry.upperSecondary.x >= -0.001
          && geometry.upperSecondary.x + geometry.secondaryDiameter <= contentWidth + 0.001
          && geometry.lowerSecondary.x >= -0.001
          && geometry.lowerSecondary.x + geometry.secondaryDiameter <= contentWidth + 0.001
        );
      const fitsHeight = orientation === "landscape"
        ? geometry.usedVehicleHeight <= vehicleAreaHeight
        : (
          geometry.primary.labelBottom <= vehicleAreaHeight + 0.001
          && geometry.upperSecondary.labelBottom <= vehicleAreaHeight + 0.001
          && geometry.lowerSecondary.labelBottom <= vehicleAreaHeight + 0.001
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
