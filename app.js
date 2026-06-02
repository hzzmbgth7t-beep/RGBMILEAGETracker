
const key = "rgbMileageTracker_v2_0_3";
let previewRows = [];

function getData() {
  return JSON.parse(localStorage.getItem(key) || "[]");
}
function setData(data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function num(v) {
  if (v === "" || v === null || v === undefined) return "";
  const n = Number(String(v).replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : "";
}
function money(v) {
  const n = num(v);
  return n === "" ? "" : Number(n.toFixed(2));
}
function fmt(v, places=2) {
  const n = num(v);
  return n === "" ? "" : Number(n).toFixed(places);
}
function normalizeHeader(h) {
  return String(h || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
function yesNo(v) {
  const s = String(v || "").toLowerCase();
  return (s === "yes" || s.includes("free") || s === "true") ? "Yes" : "No";
}

const aliases = {
  recordid: "recordId",
  entrysequence: "entrySequence",
  vehicle: "vehicle",
  date: "date",
  entrytype: "entryType",
  odometer: "odometer",
  totalmiles: "totalMiles",
  gallons: "gallons",
  fuelgrade: "fuelGrade",
  ethanolfree: "ethanolFree",
  mpg: "mpg",
  fuelstation: "fuelStation",
  station: "fuelStation",
  fuelbrand: "fuelBrand",
  brand: "fuelBrand",
  fuelpricepergallon: "fuelPricePerGallon",
  pricepergallon: "fuelPricePerGallon",
  totalfuelcost: "totalFuelCost",
  fuelcost: "totalFuelCost",
  fuelcostsource: "fuelCostSource",
  dataquality: "dataQuality",
  notes: "notes"
};

function saveEntry() {
  const data = getData();
  const gallons = num(document.getElementById("gallons").value);
  const price = money(document.getElementById("fuelPrice").value);
  let total = money(document.getElementById("fuelCost").value);
  let source = document.getElementById("fuelCostSource").value;

  if (total === "" && price !== "" && gallons !== "") {
    total = money(price * gallons);
    source = "Calculated";
  }

  const entry = {
    recordId: document.getElementById("recordId").value || `APP-${String(data.length + 1).padStart(5, "0")}`,
    entrySequence: Number(document.getElementById("entrySequence").value || data.length + 1),
    vehicle: document.getElementById("vehicleName").value || "Jeep CJ7",
    date: document.getElementById("entryDate").value,
    entryType: document.getElementById("entryType").value,
    odometer: fmt(document.getElementById("odometer").value, 2),
    totalMiles: fmt(document.getElementById("totalMiles").value, 2),
    gallons: fmt(document.getElementById("gallons").value, 2),
    fuelGrade: document.getElementById("fuelGrade").value,
    ethanolFree: document.getElementById("ethanolFree").value,
    mpg: fmt(document.getElementById("mpg").value, 2),
    fuelPricePerGallon: price === "" ? "" : price.toFixed(2),
    totalFuelCost: total === "" ? "" : total.toFixed(2),
    fuelCostSource: source,
    fuelStation: document.getElementById("fuelStation").value,
    fuelBrand: document.getElementById("fuelBrand").value,
    dataQuality: document.getElementById("dataQuality").value,
    notes: document.getElementById("notes").value
  };

  const existing = data.findIndex(e => e.recordId === entry.recordId);
  if (existing >= 0) data[existing] = entry;
  else data.push(entry);

  data.sort(sortEntries);
  setData(data);
  render();
}

function sortEntries(a,b) {
  if (a.date && b.date && a.date !== b.date) return new Date(a.date) - new Date(b.date);
  if (a.date && !b.date) return 1;
  if (!a.date && b.date) return -1;
  return Number(a.entrySequence) - Number(b.entrySequence);
}

function parseCSV(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (ch === '"' && quoted && next === '"') { cell += '"'; i++; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(v => String(v).trim() !== ""));
}

async function previewImport() {
  const file = document.getElementById("csvFile").files[0];
  if (!file) {
    alert("Choose a CSV file first.");
    return;
  }
  const text = await file.text();
  const rows = parseCSV(text);
  const headers = rows[0].map(h => aliases[normalizeHeader(h)] || normalizeHeader(h));

  previewRows = rows.slice(1).map((r, idx) => {
    const o = {};
    headers.forEach((h, i) => o[h] = (r[i] || "").trim());
    return {
      recordId: o.recordId || `IMPORT-${String(idx + 1).padStart(5, "0")}`,
      entrySequence: Number(o.entrySequence || idx + 1),
      vehicle: o.vehicle || "Jeep CJ7",
      date: o.date || "",
      entryType: o.entryType || "Fuel",
      odometer: fmt(o.odometer, 2),
      totalMiles: fmt(o.totalMiles, 2),
      gallons: fmt(o.gallons, 2),
      fuelGrade: o.fuelGrade || "",
      ethanolFree: yesNo(o.ethanolFree),
      mpg: fmt(o.mpg, 2),
      fuelPricePerGallon: money(o.fuelPricePerGallon) === "" ? "" : money(o.fuelPricePerGallon).toFixed(2),
      totalFuelCost: money(o.totalFuelCost) === "" ? "" : money(o.totalFuelCost).toFixed(2),
      fuelCostSource: o.fuelCostSource || "",
      fuelStation: o.fuelStation || "",
      fuelBrand: o.fuelBrand || "",
      dataQuality: o.dataQuality || "Verified",
      notes: o.notes || ""
    };
  });

  const errors = validateRows(previewRows);
  document.getElementById("saveImportBtn").disabled = errors.length > 0;
  document.getElementById("importStatus").textContent = errors.length ? errors.join("\\n") : `Ready to import ${previewRows.length} rows.`;
  renderPreview();
}

function validateRows(rows) {
  const errors = [];
  const ids = new Set();
  rows.forEach((row, i) => {
    const line = i + 2;
    if (!row.recordId) errors.push(`Line ${line}: Missing Record ID.`);
    if (ids.has(row.recordId)) errors.push(`Line ${line}: Duplicate Record ID ${row.recordId}.`);
    ids.add(row.recordId);
    if (!row.entrySequence) errors.push(`Line ${line}: Missing Entry Sequence.`);
    if (!["Fuel","Maintenance","Historical Marker"].includes(row.entryType)) errors.push(`Line ${line}: Invalid Entry Type.`);
    if (!["Verified","Review","Estimated","Historical"].includes(row.dataQuality)) errors.push(`Line ${line}: Invalid Data Quality.`);
  });
  return errors;
}

function renderPreview() {
  const table = document.getElementById("previewTable");
  table.innerHTML = `<thead><tr><th>Seq</th><th>Record ID</th><th>Type</th><th>Odometer</th><th>Gallons</th><th>Quality</th></tr></thead><tbody></tbody>`;
  const body = table.querySelector("tbody");
  previewRows.slice(0, 100).forEach(e => {
    body.insertAdjacentHTML("beforeend", `<tr><td>${e.entrySequence}</td><td>${e.recordId}</td><td>${e.entryType}</td><td>${e.odometer}</td><td>${e.gallons}</td><td>${e.dataQuality}</td></tr>`);
  });
}

function saveImport() {
  const data = getData();
  const map = new Map(data.map((e, i) => [e.recordId, i]));
  previewRows.forEach(row => {
    if (map.has(row.recordId)) data[map.get(row.recordId)] = row;
    else data.push(row);
  });
  data.sort(sortEntries);
  setData(data);
  document.getElementById("importStatus").textContent = `Saved ${previewRows.length} rows. Existing Record IDs were updated.`;
  render();
}

function render() {
  const data = getData();
  const includeReview = document.getElementById("includeReview")?.checked;
  const includeHistorical = document.getElementById("includeHistorical")?.checked;
  const statsRows = data.filter(e => (includeReview || e.dataQuality !== "Review") && (includeHistorical || e.dataQuality !== "Historical"));
  const mpgs = statsRows.map(e => num(e.mpg)).filter(v => v !== "");
  const gallons = statsRows.map(e => num(e.gallons)).filter(v => v !== "");
  const avgMpg = mpgs.length ? (mpgs.reduce((a,b)=>a+b,0) / mpgs.length).toFixed(2) : "—";
  const totalGallons = gallons.reduce((a,b)=>a+b,0).toFixed(2);
  document.getElementById("summary").textContent = `Entries: ${data.length} | Avg MPG: ${avgMpg} | Total Gallons: ${totalGallons}`;

  const body = document.querySelector("#entryTable tbody");
  body.innerHTML = "";
  [...data].sort(sortEntries).forEach(e => {
    const cls = e.dataQuality === "Review" ? "review" : e.dataQuality === "Historical" ? "historical" : "";
    body.insertAdjacentHTML("beforeend", `<tr class="${cls}">
      <td>${e.entrySequence}</td>
      <td>${e.recordId}</td>
      <td>${e.entryType}</td>
      <td>${e.odometer}</td>
      <td>${e.totalMiles}</td>
      <td>${e.gallons}</td>
      <td>${e.mpg}</td>
      <td>${e.dataQuality}</td>
    </tr>`);
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}
render();
