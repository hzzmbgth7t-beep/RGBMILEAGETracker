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
    const LAYOUT_VERSION = "wc10-responsive-three-circle-home-v8-f23";
    const PORTRAIT_MODE = "portrait-circle-label-geometry";

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
        circleMargin: clamp(Math.round(contentWidth * 0.022), 8, 12),
        circleGap: clamp(Math.round(contentWidth * 0.016), 5, 8),
        labelGap: clamp(Math.round(vehicleAreaHeight * 0.008), 6, 8),
        labelHeight: clamp(Math.round(vehicleAreaHeight * 0.048), 36, 44),
        labelCircleGap: clamp(Math.round(vehicleAreaHeight * 0.007), 5, 7),
      };
    }

    function estimateLabelWidth(label, diameter, contentWidth, primary) {
      const text = String(label || "");
      const estimatedTextWidth = (text.length * 7.4) + 14;
      const twoLineWidth = (estimatedTextWidth / 1.75) + 10;
      const preferred = Math.max(diameter * (primary ? 1.05 : 1.02), twoLineWidth);
      const maximum = contentWidth * (primary ? 0.72 : 0.54);

      return rounded(
        clamp(preferred, Math.min(diameter * 0.92, contentWidth - 4), maximum),
      );
    }

    function circle(cx, cy, r) {
      return {
        cx: rounded(cx),
        cy: rounded(cy),
        r: rounded(r),
        diameter: rounded(r * 2),
        left: rounded(cx - r),
        top: rounded(cy - r),
        right: rounded(cx + r),
        bottom: rounded(cy + r),
      };
    }

    function rect(x, y, width, height, placement) {
      return {
        x: rounded(x),
        y: rounded(y),
        width: rounded(width),
        height: rounded(height),
        left: rounded(x),
        top: rounded(y),
        right: rounded(x + width),
        bottom: rounded(y + height),
        placement,
      };
    }

    function distance(circleA, circleB) {
      return Math.hypot(circleA.cx - circleB.cx, circleA.cy - circleB.cy);
    }

    function rectIntersectsCircle(label, targetCircle, padding = 0) {
      const nearestX = clamp(targetCircle.cx, label.left, label.right);
      const nearestY = clamp(targetCircle.cy, label.top, label.bottom);
      const dx = targetCircle.cx - nearestX;
      const dy = targetCircle.cy - nearestY;
      return ((dx * dx) + (dy * dy)) < ((targetCircle.r + padding) ** 2);
    }

    function rectsOverlap(left, right, padding = 0) {
      return !(
        left.right + padding <= right.left
        || right.right + padding <= left.left
        || left.bottom + padding <= right.top
        || right.bottom + padding <= left.top
      );
    }

    function insideCircleBounds(testCircle, metrics, width, height) {
      return (
        testCircle.left >= metrics.circleMargin
        && testCircle.right <= width - metrics.circleMargin
        && testCircle.top >= metrics.circleMargin
        && testCircle.bottom <= height - metrics.circleMargin
      );
    }

    function insideLabelBounds(label, metrics, width, height) {
      return (
        label.left >= metrics.circleMargin
        && label.right <= width - metrics.circleMargin
        && label.top >= metrics.circleMargin
        && label.bottom <= height - metrics.circleMargin
      );
    }

    function labelOptions(testCircle, labelWidth, metrics, width, height, preference) {
      const gap = metrics.labelCircleGap;
      const centeredLeft = clamp(
        testCircle.cx - (labelWidth / 2),
        metrics.circleMargin,
        width - metrics.circleMargin - labelWidth,
      );
      const aboveTop = testCircle.top - gap - metrics.labelHeight;
      const belowTop = testCircle.bottom + gap;
      const rightLeft = testCircle.right + gap;
      const leftLeft = testCircle.left - gap - labelWidth;
      const sideTop = clamp(
        testCircle.cy - (metrics.labelHeight / 2),
        metrics.circleMargin,
        height - metrics.circleMargin - metrics.labelHeight,
      );

      const options = {
        below: rect(centeredLeft, belowTop, labelWidth, metrics.labelHeight, "below"),
        above: rect(centeredLeft, aboveTop, labelWidth, metrics.labelHeight, "above"),
        right: rect(rightLeft, sideTop, labelWidth, metrics.labelHeight, "right"),
        left: rect(leftLeft, sideTop, labelWidth, metrics.labelHeight, "left"),
      };

      return preference
        .filter((key) => Object.prototype.hasOwnProperty.call(options, key))
        .map((key) => options[key]);
    }

    function labelsForCandidate(circles, labels, metrics, width, height) {
      const labelWidths = [
        estimateLabelWidth(labels[0], circles[0].diameter, width, true),
        estimateLabelWidth(labels[1], circles[1].diameter, width, false),
        estimateLabelWidth(labels[2], circles[2].diameter, width, false),
      ];
      const preferenceSets = [
        ["below", "above", "right", "left"],
        ["below", "right", "above", "left"],
        ["above", "below", "right", "left"],
      ];
      const optionSets = circles.map((item, index) => (
        labelOptions(
          item,
          labelWidths[index],
          metrics,
          width,
          height,
          preferenceSets[index],
        ).filter((option) => insideLabelBounds(option, metrics, width, height))
      ));

      if (optionSets.some((options) => options.length === 0)) {
        return null;
      }

      let best = null;

      for (const primaryLabel of optionSets[0]) {
        for (const upperLabel of optionSets[1]) {
          for (const lowerLabel of optionSets[2]) {
            const candidateLabels = [primaryLabel, upperLabel, lowerLabel];
            let valid = true;

            for (let labelIndex = 0; labelIndex < candidateLabels.length; labelIndex += 1) {
              for (let circleIndex = 0; circleIndex < circles.length; circleIndex += 1) {
                if (rectIntersectsCircle(candidateLabels[labelIndex], circles[circleIndex], 1)) {
                  valid = false;
                  break;
                }
              }

              if (!valid) {
                break;
              }
            }

            if (!valid) {
              continue;
            }

            for (let leftIndex = 0; leftIndex < candidateLabels.length; leftIndex += 1) {
              for (
                let rightIndex = leftIndex + 1;
                rightIndex < candidateLabels.length;
                rightIndex += 1
              ) {
                if (rectsOverlap(candidateLabels[leftIndex], candidateLabels[rightIndex], 1)) {
                  valid = false;
                  break;
                }
              }

              if (!valid) {
                break;
              }
            }

            if (!valid) {
              continue;
            }

            const placements = candidateLabels.map((item) => item.placement);
            const placementScore = (
              (placements[0] === "below" ? 80 : 0)
              + (placements[1] === "below" ? 80 : 0)
              + (placements[2] === "above" ? 80 : 0)
              + placements.filter((item) => item === "left" || item === "right").length * -30
            );

            if (!best || placementScore > best.score) {
              best = {
                score: placementScore,
                labels: candidateLabels,
              };
            }
          }
        }
      }

      return best ? best.labels : null;
    }

    function candidateIsValid(candidate, metrics, width, height) {
      const circles = candidate.circles;

      if (!circles.every((item) => insideCircleBounds(item, metrics, width, height))) {
        return false;
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

      return true;
    }

    function scoreCandidate(candidate, width, height) {
      const [primary, upper, lower] = candidate.circles;
      const [primaryLabel, upperLabel, lowerLabel] = candidate.labels;
      const totalArea = (primary.r ** 2) + (upper.r ** 2) + (lower.r ** 2);
      const primaryCenterTargetX = width * 0.42;
      const primaryCenterTargetY = height * 0.52;
      const secondaryTargetX = width * 0.75;
      const upperTargetY = height * 0.17;
      const lowerTargetY = height * 0.84;
      const labelPenalty = (
        (primaryLabel.placement === "below" ? 0 : 12)
        + (upperLabel.placement === "below" ? 0 : 10)
        + (lowerLabel.placement === "above" ? 0 : 8)
      );

      return (
        upper.r * 1_000_000_000
        + primary.r * 5_000_000
        + totalArea * 100
        - Math.abs(primary.cx - primaryCenterTargetX) * 20
        - Math.abs(primary.cy - primaryCenterTargetY) * 8
        - Math.abs(upper.cx - secondaryTargetX) * 3
        - Math.abs(lower.cx - secondaryTargetX) * 3
        - Math.abs(upper.cy - upperTargetY) * 2
        - Math.abs(lower.cy - lowerTargetY) * 2
        - labelPenalty * 1000
      );
    }

    function makeCandidate(primaryRadius, secondaryRadius, primaryX, primaryY, secondaryX, metrics, labels, width, height) {
      const upperCircle = circle(
        secondaryX,
        metrics.circleMargin + secondaryRadius,
        secondaryRadius,
      );
      const lowerCircle = circle(
        secondaryX,
        height - metrics.circleMargin - secondaryRadius,
        secondaryRadius,
      );
      const primaryCircle = circle(primaryX, primaryY, primaryRadius);
      const circles = [primaryCircle, upperCircle, lowerCircle];

      const geometryCandidate = { circles };

      if (!candidateIsValid(geometryCandidate, metrics, width, height)) {
        return null;
      }

      const labelRects = labelsForCandidate(circles, labels, metrics, width, height);

      if (!labelRects) {
        return null;
      }

      const withLabels = {
        circles,
        labels: labelRects,
      };

      return {
        ...withLabels,
        score: scoreCandidate(withLabels, width, height),
        totalCircleArea: (
          (primaryRadius ** 2)
          + (secondaryRadius ** 2)
          + (secondaryRadius ** 2)
        ),
      };
    }

    function fallbackPortrait(width, height, labels) {
      const metrics = {
        circleMargin: 10,
        circleGap: 6,
        labelGap: 6,
        labelHeight: 36,
        labelCircleGap: 6,
      };
      const secondaryRadius = Math.max(42, Math.floor(Math.min(width * 0.22, height * 0.14)));
      const primaryRadius = Math.max(secondaryRadius + 10, Math.floor(Math.min(width * 0.30, height * 0.18)));
      const candidate = makeCandidate(
        primaryRadius,
        secondaryRadius,
        Math.max(primaryRadius + metrics.circleMargin, width * 0.38),
        height * 0.52,
        width - metrics.circleMargin - secondaryRadius,
        metrics,
        labels,
        width,
        height,
      );

      if (!candidate) {
        throw new Error("No valid portrait Home circle geometry candidate was found.");
      }

      return {
        ...candidate,
        fallback: true,
      };
    }

    function calculatePortrait(contentWidth, vehicleAreaHeight, rawLabels = []) {
      const labels = normalizeLabels(rawLabels);
      const metrics = portraitMetrics(contentWidth, vehicleAreaHeight);
      const maxSecondary = Math.floor(
        Math.min(
          (contentWidth - (metrics.circleMargin * 2)) * 0.31,
          (vehicleAreaHeight - (metrics.circleMargin * 2)) * 0.23,
        ),
      );
      const minSecondary = 44;
      let best = null;
      let rejectionReasonForNext = "not evaluated";

      function primaryXFor(primaryRadius, secondaryRadius, primaryY, secondaryX) {
        const upperY = metrics.circleMargin + secondaryRadius;
        const lowerY = vehicleAreaHeight - metrics.circleMargin - secondaryRadius;
        const requiredDistance = primaryRadius + secondaryRadius + metrics.circleGap;
        let requiredHorizontal = 0;

        for (const secondaryY of [upperY, lowerY]) {
          const vertical = Math.abs(primaryY - secondaryY);

          if (vertical < requiredDistance) {
            requiredHorizontal = Math.max(
              requiredHorizontal,
              Math.sqrt((requiredDistance ** 2) - (vertical ** 2)),
            );
          }
        }

        const maxPrimaryX = Math.min(
          secondaryX - requiredHorizontal,
          contentWidth - metrics.circleMargin - primaryRadius,
        );
        const minPrimaryX = metrics.circleMargin + primaryRadius;
        const targetX = contentWidth * 0.42;

        if (maxPrimaryX < minPrimaryX) {
          return null;
        }

        return clamp(targetX, minPrimaryX, maxPrimaryX);
      }

      for (let secondaryRadius = maxSecondary; secondaryRadius >= minSecondary; secondaryRadius -= 1) {
        const upperY = metrics.circleMargin + secondaryRadius;
        const lowerY = vehicleAreaHeight - metrics.circleMargin - secondaryRadius;

        if (lowerY - upperY < (secondaryRadius * 2) + metrics.circleGap) {
          continue;
        }

        const maxPrimary = Math.floor(
          Math.min(
            contentWidth - (metrics.circleMargin * 2),
            vehicleAreaHeight - (metrics.circleMargin * 2),
          ) / 2,
        );
        const minimumPrimary = secondaryRadius + 8;
        const rightMostSecondaryX = contentWidth - metrics.circleMargin - secondaryRadius;
        const centerY = (upperY + lowerY) / 2;
        const secondaryXValues = [
          rightMostSecondaryX,
          rightMostSecondaryX - 6,
          rightMostSecondaryX - 12,
          rightMostSecondaryX - 18,
          rightMostSecondaryX - 24,
        ];

        for (let primaryRadius = maxPrimary; primaryRadius >= minimumPrimary; primaryRadius -= 1) {
          const yMin = metrics.circleMargin + primaryRadius;
          const yMax = vehicleAreaHeight - metrics.circleMargin - primaryRadius;
          const primaryYValues = [
            centerY,
            contentWidth < 390 ? centerY + 8 : centerY,
            vehicleAreaHeight * 0.5,
            vehicleAreaHeight * 0.52,
            vehicleAreaHeight * 0.48,
            centerY + 16,
            centerY - 16,
          ]
            .map((value) => clamp(value, yMin, yMax))
            .filter((value, index, array) => array.indexOf(value) === index);

          for (const secondaryX of secondaryXValues) {
            if (
              secondaryX - secondaryRadius < metrics.circleMargin
              || secondaryX + secondaryRadius > contentWidth - metrics.circleMargin
            ) {
              continue;
            }

            for (const primaryY of primaryYValues) {
              const primaryX = primaryXFor(
                primaryRadius,
                secondaryRadius,
                primaryY,
                secondaryX,
              );

              if (primaryX === null) {
                continue;
              }

              const xValues = [
                primaryX,
                primaryX - 6,
                primaryX + 6,
              ];

              for (const candidateX of xValues) {
                const candidate = makeCandidate(
                  primaryRadius,
                  secondaryRadius,
                  candidateX,
                  primaryY,
                  secondaryX,
                  metrics,
                  labels,
                  contentWidth,
                  vehicleAreaHeight,
                );

                if (!candidate) {
                  continue;
                }

                if (!best || candidate.score > best.score) {
                  best = {
                    ...candidate,
                    primaryRadius,
                    secondaryRadius,
                    secondaryX,
                    primaryX: candidateX,
                    primaryY,
                  };
                }
              }
            }
          }

          if (best && best.secondaryRadius === secondaryRadius && best.primaryRadius === primaryRadius) {
            break;
          }
        }

        if (best && best.secondaryRadius === secondaryRadius) {
          const nextSecondary = secondaryRadius + 1;
          rejectionReasonForNext = (
            nextSecondary > maxSecondary
              ? "next upper/lower radius exceeds screen-derived circle maximum"
              : "next upper/lower radius has no valid circle-plus-label candidate"
          );
          break;
        }
      }

      if (!best) {
        best = fallbackPortrait(contentWidth, vehicleAreaHeight, labels);
        rejectionReasonForNext = "fallback used after exhaustive search";
      }

      const primaryCircle = best.circles[0];
      const upperCircle = best.circles[1];
      const lowerCircle = best.circles[2];
      const primaryLabel = best.labels[0];
      const upperLabel = best.labels[1];
      const lowerLabel = best.labels[2];
      const primaryDiameter = rounded(primaryCircle.diameter);
      const secondaryDiameter = rounded(upperCircle.diameter);
      const sharedDiameter = Math.max(primaryDiameter, secondaryDiameter);
      const contentBottom = Math.max(
        primaryLabel.bottom,
        upperLabel.bottom,
        lowerLabel.bottom,
        primaryCircle.bottom,
        upperCircle.bottom,
        lowerCircle.bottom,
      );
      const contentRight = Math.max(
        primaryLabel.right,
        upperLabel.right,
        lowerLabel.right,
        primaryCircle.right,
        upperCircle.right,
        lowerCircle.right,
      );
      const contentTop = Math.min(
        primaryLabel.top,
        upperLabel.top,
        lowerLabel.top,
        primaryCircle.top,
        upperCircle.top,
        lowerCircle.top,
      );
      const contentLeft = Math.min(
        primaryLabel.left,
        upperLabel.left,
        lowerLabel.left,
        primaryCircle.left,
        upperCircle.left,
        lowerCircle.left,
      );

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
        labelCircleGap: metrics.labelCircleGap,
        itemHeight: sharedDiameter + metrics.labelCircleGap + metrics.labelHeight,
        sharedDiameter,
        primaryDiameter,
        secondaryDiameter,
        primaryRadius: rounded(primaryCircle.r),
        secondaryRadius: rounded(upperCircle.r),
        asymmetricDiameter: true,
        circleGap: metrics.circleGap,
        circleMargin: metrics.circleMargin,
        primary: {
          x: rounded(primaryCircle.left),
          y: rounded(primaryCircle.top),
          cx: primaryCircle.cx,
          cy: primaryCircle.cy,
          r: primaryCircle.r,
          diameter: primaryDiameter,
          label: primaryLabel,
        },
        upperSecondary: {
          x: rounded(upperCircle.left),
          y: rounded(upperCircle.top),
          cx: upperCircle.cx,
          cy: upperCircle.cy,
          r: upperCircle.r,
          diameter: secondaryDiameter,
          label: upperLabel,
        },
        lowerSecondary: {
          x: rounded(lowerCircle.left),
          y: rounded(lowerCircle.top),
          cx: lowerCircle.cx,
          cy: lowerCircle.cy,
          r: lowerCircle.r,
          diameter: secondaryDiameter,
          label: lowerLabel,
        },
        usedCircleWidth: rounded(
          Math.max(primaryCircle.right, upperCircle.right, lowerCircle.right)
          - Math.min(primaryCircle.left, upperCircle.left, lowerCircle.left),
        ),
        usedItemHeight: rounded(contentBottom - contentTop),
        unusedVehicleWidth: rounded(contentWidth - contentRight),
        unusedVehicleHeight: rounded(vehicleAreaHeight - contentBottom),
        usedVehicleHeight: rounded(contentBottom),
        contentBounds: {
          left: rounded(contentLeft),
          top: rounded(contentTop),
          right: rounded(contentRight),
          bottom: rounded(contentBottom),
        },
        totalCircleArea: rounded(best.totalCircleArea),
        nextLargerSecondaryRejection: rejectionReasonForNext,
        solverEvidence: "F23 non-equal circle-plus-own-label geometry; upper/lower radius maximized before primary radius; labels are outside all circle disks",
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
          geometry.contentBounds.left >= 0
          && geometry.contentBounds.right <= contentWidth
        );
      const fitsHeight = orientation === "landscape"
        ? geometry.usedVehicleHeight <= vehicleAreaHeight
        : (
          geometry.contentBounds.top >= 0
          && geometry.contentBounds.bottom <= vehicleAreaHeight
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
