"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const homeLayout = require("./rgbm-home-layout.js");

const root = __dirname;
const tests = [];

function test(name, functionUnderTest) {
  tests.push({ name, functionUnderTest });
}

function portraitInput(overrides = {}) {
  return {
    viewportWidth: 430,
    viewportHeight: 932,
    paddingTop: 55,
    paddingRight: 12,
    paddingBottom: 0,
    paddingLeft: 12,
    headerHeight: 76,
    headerGap: 6,
    dockHeight: 92,
    dockGap: 4,
    orientation: "portrait",
    ...overrides,
  };
}

function landscapeInput(overrides = {}) {
  return {
    viewportWidth: 932,
    viewportHeight: 430,
    paddingTop: 4,
    paddingRight: 12,
    paddingBottom: 0,
    paddingLeft: 12,
    headerHeight: 52,
    headerGap: 4,
    dockHeight: 79,
    dockGap: 4,
    orientation: "landscape",
    ...overrides,
  };
}

test("HL-01 portrait uses one large and two equal lower circles", () => {
  const layout = homeLayout.calculateHomeLayout(portraitInput());

  assert.equal(layout.mode, "portrait");
  assert.equal(layout.topDiameter > layout.lowerDiameter, true);
  assert.equal(layout.fitsWidth, true);
  assert.equal(layout.fitsHeight, true);
});

test("HL-02 portrait top remains at least 25 percent larger", () => {
  const layout = homeLayout.calculateHomeLayout(portraitInput());

  assert.equal(
    layout.topDiameter >= Math.floor(layout.lowerDiameter * 1.25),
    true,
  );
});

test("HL-03 portrait lower pair fits one shared row", () => {
  const layout = homeLayout.calculateHomeLayout(portraitInput());

  assert.equal(
    (layout.lowerDiameter * 2) + layout.columnGap
      <= layout.contentWidth,
    true,
  );
});

test("HL-04 portrait circles and labels fit the vehicle region", () => {
  const layout = homeLayout.calculateHomeLayout(portraitInput());

  assert.equal(layout.usedVehicleHeight <= layout.vehicleAreaHeight, true);
});

test("HL-05 shorter browser portrait remains valid", () => {
  const layout = homeLayout.calculateHomeLayout(
    portraitInput({
      viewportHeight: 740,
      paddingTop: 8,
      dockHeight: 58,
      headerHeight: 72,
    }),
  );

  assert.equal(layout.mode, "portrait");
  assert.equal(layout.topDiameter > layout.lowerDiameter, true);
  assert.equal(layout.fitsHeight, true);
  assert.equal(layout.fitsWidth, true);
});

test("HL-06 narrow portrait remains nonnegative and contained", () => {
  const layout = homeLayout.calculateHomeLayout(
    portraitInput({
      viewportWidth: 320,
      viewportHeight: 568,
      paddingTop: 28,
      dockHeight: 72,
      headerHeight: 66,
    }),
  );

  assert.equal(layout.topDiameter >= 0, true);
  assert.equal(layout.lowerDiameter >= 0, true);
  assert.equal(layout.fitsHeight, true);
  assert.equal(layout.fitsWidth, true);
});

test("HL-07 landscape uses one maximum shared diameter", () => {
  const layout = homeLayout.calculateHomeLayout(landscapeInput());

  assert.equal(layout.mode, "landscape");
  assert.equal(
    layout.sharedDiameter,
    Math.floor(Math.min(layout.widthLimit, layout.heightLimit)),
  );
  assert.equal(layout.fitsWidth, true);
  assert.equal(layout.fitsHeight, true);
});

test("HL-08 landscape plus one pixel violates a governing limit", () => {
  const layout = homeLayout.calculateHomeLayout(landscapeInput());
  const candidate = layout.sharedDiameter + 1;
  const violatesWidth = (
    (candidate * 3) + (layout.columnGap * 2)
      > layout.contentWidth
  );
  const violatesHeight = (
    candidate + layout.labelHeight
      > layout.vehicleAreaHeight
  );

  assert.equal(violatesWidth || violatesHeight, true);
});

test("HL-09 compact browser landscape remains valid", () => {
  const layout = homeLayout.calculateHomeLayout(
    landscapeInput({
      viewportWidth: 740,
      viewportHeight: 390,
      dockHeight: 58,
      headerHeight: 48,
    }),
  );

  assert.equal(layout.mode, "landscape");
  assert.equal(layout.sharedDiameter > 0, true);
  assert.equal(layout.fitsWidth, true);
  assert.equal(layout.fitsHeight, true);
});

test("HL-10 larger safe-area dock reduces available geometry", () => {
  const standard = homeLayout.calculateHomeLayout(landscapeInput());
  const largerDock = homeLayout.calculateHomeLayout(
    landscapeInput({ dockHeight: 110 }),
  );

  assert.equal(
    largerDock.sharedDiameter <= standard.sharedDiameter,
    true,
  );
});

test("HL-11 explicit orientation overrides aspect inference", () => {
  const portrait = homeLayout.calculateHomeLayout(
    portraitInput({
      viewportWidth: 932,
      viewportHeight: 430,
      orientation: "portrait",
    }),
  );
  const landscape = homeLayout.calculateHomeLayout(
    landscapeInput({
      viewportWidth: 430,
      viewportHeight: 932,
      orientation: "landscape",
    }),
  );

  assert.equal(portrait.mode, "portrait");
  assert.equal(landscape.mode, "landscape");
});

test("HL-12 identical input is deterministic", () => {
  const first = homeLayout.calculateHomeLayout(portraitInput());
  const second = homeLayout.calculateHomeLayout(portraitInput());

  assert.deepEqual(first, second);
});

test("HL-13 invalid viewport dimensions fail explicitly", () => {
  assert.throws(
    () => homeLayout.calculateHomeLayout({
      viewportWidth: 0,
      viewportHeight: 932,
    }),
    TypeError,
  );
});

test("HL-14 CSS contains the governed portrait grid", () => {
  const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

  assert.equal(
    css.includes(
      "grid-template-columns: repeat(2, minmax(0, 1fr)) !important;",
    ),
    true,
  );
  assert.equal(
    css.includes("grid-column: 1 / -1 !important;"),
    true,
  );
  assert.equal(
    css.includes("--home-lower-diameter"),
    true,
  );
});

test("HL-15 CSS contains the governed landscape row", () => {
  const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

  assert.equal(
    css.includes("repeat(3, minmax(0, 1fr)) !important;"),
    true,
  );
  assert.equal(
    css.includes("--home-shared-diameter"),
    true,
  );
  assert.equal(css.includes("max-width:430px"), false);
  assert.equal(css.includes("flex-direction:column!important"), false);
});

test("HL-16 orientation restrictions are removed", () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, "manifest.json"), "utf8"),
  );
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

  assert.equal(manifest.orientation, "any");
  assert.equal(app.includes('orientation.lock("portrait")'), false);
});

test("HL-17 the layout module loads before the application", () => {
  const index = fs.readFileSync(path.join(root, "index.html"), "utf8");

  assert.equal(
    index.indexOf("rgbm-home-layout.js")
      < index.indexOf("app.js"),
    true,
  );
});

test("HL-18 the service worker caches the layout module", () => {
  const serviceWorker = fs.readFileSync(
    path.join(root, "sw.js"),
    "utf8",
  );

  assert.equal(
    serviceWorker.includes(
      "rgbm-home-layout.js?v=216lwc10flat2",
    ),
    true,
  );
});

let failures = 0;

for (const { name, functionUnderTest } of tests) {
  try {
    functionUnderTest();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}`);
    console.error(error && error.stack ? error.stack : error);
  }
}

console.log("");
console.log(`Home-layout tests: ${tests.length}`);
console.log(`Passed: ${tests.length - failures}`);
console.log(`Failed: ${failures}`);

process.exitCode = failures === 0 ? 0 : 1;
