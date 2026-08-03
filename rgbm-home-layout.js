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
    const LAYOUT_VERSION = "wc10-responsive-three-circle-home-v7-f22";
    const PORTRAIT_MODE = "portrait-asymmetric-circle-geometry";

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

    function normalizeLabels(rawLabels) {
      const labels = Array.isArray(rawLabels) ? rawLabels : [];

      return [0, 1, 2].map((index) => {
        const label = String(labels[index] || "").trim();
        return label || "Add Vehicle";
      });
    }

    function portraitMetrics(contentWidth, vehicleAreaHeight) {
      return {
        circleMargin: clamp(Math.round(contentWidth * 0.008), 2, 6),
        circleGap: clamp(Math.round(contentWidth * 0.016), 4, 10),
        labelGap: clamp(Math.round(vehicleAreaHeight * 0.006), 3, 6),
        labelHeight: clamp(Math.round(vehicleAreaHeight * 0.05), 36, 44),
        minimumSecondaryRatio: 0.55,
      };
    }

    function estimatedLabelWidth(label, diameter, contentWidth, primary) {
      const textWidth = (label.length * 8.2) + 12;
      const measuredCap = contentWidth * (primary ? 0.8 : 0.62);
      const diameterFloor = diameter * (primary ? 1.05 : 1.08);

      return rounded(
        Math.min(
          contentWidth - 4,
          Math.max(diameterFloor, Math.min(textWidth, measuredCap)),
        ),
      );
    }

    function labelRect(circle, labelWidth, labelHeight, labelGap, contentWidth, margin) {
      const left = clamp(
        circle.cx - (labelWidth / 2),
        margin,
        contentWidth - margin - labelWidth,
      );
      const top = circle.cy + circle.r + labelGap;

      return {
        x: rounded(left),
        y: rounded(top),
        width: rounded(labelWidth),
        height: rounded(labelHeight),
        left: rounded(left),
        top: rounded(top),
        right: rounded(left + labelWidth),
        bottom: rounded(top + labelHeight),
      };
    }

    function distance(circleA, circleB) {
      return Math.hypot(circleA.cx - circleB.cx, circleA.cy - circleB.cy);
    }

    function rectangleIntersectsCircle(rect, circle, padding = 0) {
      const nearestX = clamp(circle.cx, rect.left, rect.right);
      const nearestY = clamp(circle.cy, rect.top, rect.bottom);
      const deltaX = circle.cx - nearestX;
      const deltaY = circle.cy - nearestY;

      return ((deltaX * deltaX) + (deltaY * deltaY))
        < ((circle.r + padding) * (circle.r + padding));
    }

    function rectanglesOverlap(rectA, rectB, padding = 0) {
      return !(
        rectA.right + padding <= rectB.left
        || rectB.right + padding <= rectA.left
        || rectA.bottom + padding <= rectB.top
        || rectB.bottom + padding <= rectA.top
      );
    }

    function candidateIsValid(candidate, metrics, contentWidth, vehicleAreaHeight) {
      const circles = [
        candidate.primaryCircle,
        candidate.upperCircle,
        candidate.lowerCircle,
      ];
      const labels = [
        candidate.primaryLabel,
        candidate.upperLabel,
        candidate.lowerLabel,
      ];

      for (const circle of circles) {
        if (
          circle.cx - circle.r < metrics.circleMargin
          || circle.cx + circle.r > contentWidth - metrics.circleMargin
          || circle.cy - circle.r < metrics.circleMargin
          || circle.cy + circle.r > vehicleAreaHeight - metrics.circleMargin
        ) {
          return false;
        }
      }

      for (let leftIndex = 0; leftIndex < circles.length; leftIndex += 1) {
        for (
          let rightIndex = leftIndex + 1;
          rightIndex < circles.length;
          rightIndex += 1
        ) {
          const leftCircle = circles[leftIndex];
          const rightCircle = circles[rightIndex];

          if (
            distance(leftCircle, rightCircle)
            < leftCircle.r + rightCircle.r + metrics.circleGap
          ) {
            return false;
          }
        }
      }

      for (const label of labels) {
        if (
          label.left < metrics.circleMargin
          || label.right > contentWidth - metrics.circleMargin
          || label.top < metrics.circleMargin
          || label.bottom > vehicleAreaHeight - metrics.circleMargin
        ) {
          return false;
        }
      }

      for (let labelIndex = 0; labelIndex < labels.length; labelIndex += 1) {
        for (let circleIndex = 0; circleIndex < circles.length; circleIndex += 1) {
          if (labelIndex === circleIndex) {
            continue;
          }

          if (rectangleIntersectsCircle(labels[labelIndex], circles[circleIndex], 2)) {
            return false;
          }
        }
      }

      for (let leftIndex = 0; leftIndex < labels.length; leftIndex += 1) {
        for (
          let rightIndex = leftIndex + 1;
          rightIndex < labels.length;
          rightIndex += 1
        ) {
          if (rectanglesOverlap(labels[leftIndex], labels[rightIndex], 2)) {
            return false;
          }
        }
      }

      return true;
    }

    function makeCandidate(
      primaryRadius,
      secondaryRadius,
      primaryCenterY,
      metrics,
      labels,
      contentWidth,
      vehicleAreaHeight,
    ) {
      const upperCenterY = secondaryRadius + metrics.circleMargin;
      const lowerCenterY = (
        vehicleAreaHeight
        - metrics.labelHeight
        - metrics.labelGap
        - metrics.circleMargin
        - secondaryRadius
      );
      const rightCenterX = (
        contentWidth
        - secondaryRadius
        - metrics.circleMargin
      );
      let requiredHorizontalSeparation = 0;

      for (const rightCenterY of [upperCenterY, lowerCenterY]) {
        const verticalSeparation = Math.abs(primaryCenterY - rightCenterY);
        const requiredDistance = (
          primaryRadius
          + secondaryRadius
          + metrics.circleGap
        );
        const horizontalSeparation = verticalSeparation >= requiredDistance
          ? 0
          : Math.sqrt(
            (requiredDistance * requiredDistance)
            - (verticalSeparation * verticalSeparation),
          );

        requiredHorizontalSeparation = Math.max(
          requiredHorizontalSeparation,
          horizontalSeparation,
        );
      }

      const primaryCenterX = Math.min(
        rightCenterX - requiredHorizontalSeparation,
        Math.max(
          primaryRadius + metrics.circleMargin,
          contentWidth * 0.42,
        ),
      );

      if (primaryCenterX < primaryRadius + metrics.circleMargin) {
        return null;
      }

      const primaryCircle = {
        cx: rounded(primaryCenterX),
        cy: rounded(primaryCenterY),
        r: primaryRadius,
        diameter: primaryRadius * 2,
      };
      const upperCircle = {
        cx: rounded(rightCenterX),
        cy: rounded(upperCenterY),
        r: secondaryRadius,
        diameter: secondaryRadius * 2,
      };
      const lowerCircle = {
        cx: rounded(rightCenterX),
        cy: rounded(lowerCenterY),
        r: secondaryRadius,
        diameter: secondaryRadius * 2,
      };
      const primaryLabelWidth = estimatedLabelWidth(
        labels[0],
        primaryRadius * 2,
        contentWidth,
        true,
      );
      const upperLabelWidth = estimatedLabelWidth(
        labels[1],
        secondaryRadius * 2,
        contentWidth,
        false,
      );
      const lowerLabelWidth = estimatedLabelWidth(
        labels[2],
        secondaryRadius * 2,
        contentWidth,
        false,
      );

      return {
        primaryCircle,
        upperCircle,
        lowerCircle,
        primaryLabel: labelRect(
          primaryCircle,
          primaryLabelWidth,
          metrics.labelHeight,
          metrics.labelGap,
          contentWidth,
          metrics.circleMargin,
        ),
        upperLabel: labelRect(
          upperCircle,
          upperLabelWidth,
          metrics.labelHeight,
          metrics.labelGap,
          contentWidth,
          metrics.circleMargin,
        ),
        lowerLabel: labelRect(
          lowerCircle,
          lowerLabelWidth,
          metrics.labelHeight,
          metrics.labelGap,
          contentWidth,
          metrics.circleMargin,
        ),
      };
    }

    function fallbackPortrait(contentWidth, vehicleAreaHeight, labels) {
      const metrics = {
        circleMargin: 3,
        circleGap: 6,
        labelGap: 4,
        labelHeight: 36,
        minimumSecondaryRatio: 0.55,
      };
      const secondaryRadius = Math.max(
        42,
        Math.floor(Math.min(contentWidth * 0.22, vehicleAreaHeight * 0.14)),
      );
      const primaryRadius = Math.max(
        secondaryRadius + 8,
        Math.floor(Math.min(contentWidth * 0.34, vehicleAreaHeight * 0.2)),
      );
      const primaryCenterY = vehicleAreaHeight * 0.5;

      return makeCandidate(
        primaryRadius,
        secondaryRadius,
        primaryCenterY,
        metrics,
        labels,
        contentWidth,
        vehicleAreaHeight,
      );
    }

    function calculatePortrait(contentWidth, vehicleAreaHeight, rawLabels = []) {
      const labels = normalizeLabels(rawLabels);
      const metrics = portraitMetrics(contentWidth, vehicleAreaHeight);
      const maximumPrimaryRadius = Math.floor(
        Math.min(contentWidth * 0.44, vehicleAreaHeight * 0.28),
      );
      const maximumSecondaryRadius = Math.floor(
        Math.min(contentWidth * 0.34, vehicleAreaHeight * 0.21),
      );
      let best = null;

      for (
        let primaryRadius = maximumPrimaryRadius;
        primaryRadius >= 60;
        primaryRadius -= 1
      ) {
        const maximumRadiusForSecondary = Math.min(
          maximumSecondaryRadius,
          primaryRadius - 8,
        );
        const minimumSecondaryRadius = Math.max(
          45,
          Math.ceil(primaryRadius * metrics.minimumSecondaryRatio),
        );

        for (
          let secondaryRadius = maximumRadiusForSecondary;
          secondaryRadius >= minimumSecondaryRadius;
          secondaryRadius -= 1
        ) {
          const upperCenterY = secondaryRadius + metrics.circleMargin;
          const lowerCenterY = (
            vehicleAreaHeight
            - metrics.labelHeight
            - metrics.labelGap
            - metrics.circleMargin
            - secondaryRadius
          );

          if (
            lowerCenterY - upperCenterY
            < (secondaryRadius * 2) + metrics.circleGap
          ) {
            continue;
          }

          const middleY = (upperCenterY + lowerCenterY) / 2;
          const centerCandidates = [
            middleY,
            vehicleAreaHeight * 0.5,
            middleY - 12,
            middleY + 12,
            vehicleAreaHeight * 0.48,
            vehicleAreaHeight * 0.52,
          ];

          for (const primaryCenterY of centerCandidates) {
            if (
              primaryCenterY - primaryRadius < metrics.circleMargin
              || primaryCenterY
                + primaryRadius
                + metrics.labelGap
                + metrics.labelHeight
                > vehicleAreaHeight - metrics.circleMargin
            ) {
              continue;
            }

            const candidate = makeCandidate(
              primaryRadius,
              secondaryRadius,
              primaryCenterY,
              metrics,
              labels,
              contentWidth,
              vehicleAreaHeight,
            );

            if (
              !candidate
              || !candidateIsValid(
                candidate,
                metrics,
                contentWidth,
                vehicleAreaHeight,
              )
            ) {
              continue;
            }

            const totalCircleArea = (
              (primaryRadius * primaryRadius)
              + (secondaryRadius * secondaryRadius * 2)
            );
            const centerScore = (
              -Math.abs(candidate.primaryCircle.cx - (contentWidth * 0.42)) * 5
              -Math.abs(candidate.primaryCircle.cy - (vehicleAreaHeight * 0.5))
            );
            const score = (
              totalCircleArea * 1000
              + primaryRadius * 100
              + secondaryRadius * 20
              + centerScore
            );

            if (!best || score > best.score) {
              best = {
                ...candidate,
                score,
                totalCircleArea,
                primaryRadius,
                secondaryRadius,
              };
            }
          }
        }
      }

      if (!best) {
        best = fallbackPortrait(contentWidth, vehicleAreaHeight, labels);
      }

      const primaryDiameter = best.primaryCircle.diameter;
      const secondaryDiameter = best.upperCircle.diameter;
      const sharedDiameter = Math.max(primaryDiameter, secondaryDiameter);

      return {
        mode: PORTRAIT_MODE,
        compact: secondaryDiameter < 120,
        columnGap: 0,
        minimumRowGap: metrics.circleGap,
        minimumHorizontalSpace: metrics.circleMargin,
        minimumVerticalSpace: metrics.circleMargin,
        horizontalSpace: 0,
        verticalSpace: 0,
        labelGap: metrics.labelGap,
        labelHeight: metrics.labelHeight,
        itemHeight: sharedDiameter + metrics.labelGap + metrics.labelHeight,
        sharedDiameter,
        primaryDiameter,
        secondaryDiameter,
        primaryRadius: best.primaryRadius,
        secondaryRadius: best.secondaryRadius,
        asymmetricDiameter: true,
        circleGap: metrics.circleGap,
        circleMargin: metrics.circleMargin,
        primary: {
          x: rounded(best.primaryCircle.cx - best.primaryCircle.r),
          y: rounded(best.primaryCircle.cy - best.primaryCircle.r),
          cx: best.primaryCircle.cx,
          cy: best.primaryCircle.cy,
          r: best.primaryCircle.r,
          diameter: primaryDiameter,
          label: best.primaryLabel,
        },
        upperSecondary: {
          x: rounded(best.upperCircle.cx - best.upperCircle.r),
          y: rounded(best.upperCircle.cy - best.upperCircle.r),
          cx: best.upperCircle.cx,
          cy: best.upperCircle.cy,
          r: best.upperCircle.r,
          diameter: secondaryDiameter,
          label: best.upperLabel,
        },
        lowerSecondary: {
          x: rounded(best.lowerCircle.cx - best.lowerCircle.r),
          y: rounded(best.lowerCircle.cy - best.lowerCircle.r),
          cx: best.lowerCircle.cx,
          cy: best.lowerCircle.cy,
          r: best.lowerCircle.r,
          diameter: secondaryDiameter,
          label: best.lowerLabel,
        },
        usedCircleWidth: rounded(
          Math.max(
            best.primaryCircle.cx + best.primaryCircle.r,
            best.upperCircle.cx + best.upperCircle.r,
            best.lowerCircle.cx + best.lowerCircle.r,
          ) - Math.min(
            best.primaryCircle.cx - best.primaryCircle.r,
            best.upperCircle.cx - best.upperCircle.r,
            best.lowerCircle.cx - best.lowerCircle.r,
          ),
        ),
        usedItemHeight: rounded(
          Math.max(
            best.primaryLabel.bottom,
            best.upperLabel.bottom,
            best.lowerLabel.bottom,
          ) - Math.min(
            best.primaryCircle.cy - best.primaryCircle.r,
            best.upperCircle.cy - best.upperCircle.r,
            best.lowerCircle.cy - best.lowerCircle.r,
          ),
        ),
        unusedVehicleWidth: rounded(
          contentWidth
          - Math.max(
            best.primaryCircle.cx + best.primaryCircle.r,
            best.upperCircle.cx + best.upperCircle.r,
            best.lowerCircle.cx + best.lowerCircle.r,
          ),
        ),
        unusedVehicleHeight: rounded(
          vehicleAreaHeight
          - Math.max(
            best.primaryLabel.bottom,
            best.upperLabel.bottom,
            best.lowerLabel.bottom,
          ),
        ),
        usedVehicleHeight: rounded(
          Math.max(
            best.primaryLabel.bottom,
            best.upperLabel.bottom,
            best.lowerLabel.bottom,
          ),
        ),
        totalCircleArea: best.totalCircleArea,
        solverEvidence: "circle-first unequal-radius search with actual label-footprint checks",
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
        : calculatePortrait(contentWidth, vehicleAreaHeight, rawInput.labels);
      const fitsWidth = orientation === "landscape"
        ? (
          (geometry.sharedDiameter * 3)
          + (geometry.columnGap * 2)
        ) <= contentWidth
        : (
          geometry.primary.x >= 0
          && geometry.upperSecondary.x >= 0
          && geometry.lowerSecondary.x >= 0
          && geometry.upperSecondary.x + geometry.secondaryDiameter <= contentWidth
          && geometry.lowerSecondary.x + geometry.secondaryDiameter <= contentWidth
          && geometry.primary.x + geometry.primaryDiameter <= contentWidth
        );
      const fitsHeight = orientation === "landscape"
        ? geometry.usedVehicleHeight <= vehicleAreaHeight
        : geometry.usedVehicleHeight <= vehicleAreaHeight;

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
