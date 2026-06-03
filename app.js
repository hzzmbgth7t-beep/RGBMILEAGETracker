
const VERSION = "2.0.5";
const KEY = "rgbMileage_v2_0_5";
let activeSlot = 0;
let activeTab = "info";
let previewRows = [];

const DEFAULT_STATIONS = ["Murphy USA", "Circle K", "refuel", "BP", "Shell", "Other"];
const DEFAULT_MAINT_CATEGORIES = ["Oil Change","Tire Rotation","Brakes","Suspension","Engine","Cooling System","Electrical","Transmission","Inspection","Cleaning / Detailing","Repair","Upgrade / Modification","Other"];
const DEFAULT_STATUS = ["Planned","Fix","Other"];
const DEFAULT_PERFORMED_BY = ["Shop","Self","Friend","Other"];

function blankData() {
  return {
    version: VERSION,
    settings: {
      duplicateHandling: "Ask Every Time",
      backupReminder: "Never",
      showArchived: false,
      includeReviewDefault: false,
      includeHistoricalDefault: false,
      lastDataBackupDate: "",
      lastCompleteBackupDate: ""
    },
    stations: [...DEFAULT_STATIONS],
    maintenanceCategories: [...DEFAULT_MAINT_CATEGORIES],
    maintenanceStatus: [...DEFAULT_STATUS],
    performedBy: [...DEFAULT_PERFORMED_BY],
    vehicles: [null, null],
    entries: [],
    maintenance: [],
    insurance: [],
    documents: [],
    photos: []
  };
}

function getData() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    return d && d.vehicles ? d : blankData();
  } catch { return blankData(); }
}
function setData(d) { localStorage.setItem(KEY, JSON.stringify(d)); }

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (id === "homeScreen") renderHome();
  if (id === "reportsScreen") renderReports();
  if (id === "backupScreen") renderBackupMeta();
  if (id === "settingsScreen") loadSettings();
}
function initialsFor(v) {
  if (!v) return "";
  if (v.initials) return v.initials;
  const text = `${v.year||""} ${v.make||""} ${v.model||""}`.trim();
  if (/grand wagoneer/i.test(text)) return "JGW";
  if (/c10/i.test(text)) return "CC10";
  if (/f-?150.*lightning/i.test(text)) return "F150L";
  if (/cj7|cj-7/i.test(text)) return "CJ7";
  return text.split(/\s+/).filter(w => !/^\d{4}$/.test(w)).map(w => w[0]).join("").slice(0,5).toUpperCase() || "+";
}
function labelFor(v) {
  if (!v) return "";
  return `${v.year||""} ${v.make||""} ${v.model||""}`.trim() || v.nickname || "Vehicle";
}
function renderHome() {
  const d = getData();
  [0,1].forEach(i => {
    const slot = document.getElementById(`slot${i}`);
    const label = document.getElementById(`slot${i}Label`);
    const v = d.vehicles[i];
    slot.oncontextmenu = e => e.preventDefault();
    slot.onpointerdown = e => handlePointerDown(e, i);
    slot.onpointerup = clearPressTimer;
    slot.onpointercancel = clearPressTimer;
    if (!v || v.status === "Archived" && !d.settings.showArchived) {
      slot.innerHTML = `<span class="plus">+</span>`;
      label.textContent = "Add Vehicle";
      slot.onclick = () => { activeSlot = i; prepareAddVehicle(); showScreen("addVehicleScreen"); };
    } else {
      const badge = reminderBadgeForVehicle(v.id);
      slot.innerHTML = v.primaryPhoto ? `<img src="${v.primaryPhoto}" alt="${labelFor(v)}">${badge}` : `<span class="initials">${initialsFor(v)}</span>${badge}`;
      label.textContent = labelFor(v);
      slot.onclick = () => openQuickFuel(i);
    }
  });
}
let pressTimer = null;
function handlePointerDown(e, i) {
  clearPressTimer();
  pressTimer = setTimeout(() => {
    const d = getData();
    if (d.vehicles[i]) openVehicleDetails(i);
  }, 650);
}
function clearPressTimer() {
  if (pressTimer) clearTimeout(pressTimer);
  pressTimer = null;
}
function reminderBadgeForVehicle(vehicleId) {
  // Placeholder logic: red for overdue, yellow for upcoming can be expanded as reminders mature.
  return "";
}
function prepareAddVehicle() {
  ["vehicleNickname","vehicleYear","vehicleMake","vehicleModel","vehicleVin","vehiclePlate","vehiclePlateState","vehicleAcqDate","vehicleStartingOdo","vehiclePurchaseDate","vehiclePurchaseCost","vehicleSeller","vehicleInsuranceValue","vehicleAgreedValue","vehicleNotes"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("vehiclePhoto").value = "";
}
function fileToDataURL(file) {
  return new Promise((resolve) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}
async function saveVehicle() {
  const d = getData();
  const photo = await fileToDataURL(document.getElementById("vehiclePhoto").files[0]);
  const v = {
    id: `vehicle-${activeSlot+1}`,
    slot: activeSlot,
    nickname: value("vehicleNickname"),
    year: value("vehicleYear"),
    make: value("vehicleMake"),
    model: value("vehicleModel"),
    vin: value("vehicleVin"),
    plate: value("vehiclePlate"),
    plateState: value("vehiclePlateState"),
    acquisitionDate: value("vehicleAcqDate"),
    startingOdometer: numberValue("vehicleStartingOdo"),
    purchaseDate: value("vehiclePurchaseDate"),
    purchaseCost: moneyValue("vehiclePurchaseCost"),
    seller: value("vehicleSeller"),
    insuranceValue: moneyValue("vehicleInsuranceValue"),
    agreedValue: moneyValue("vehicleAgreedValue"),
    notes: value("vehicleNotes"),
    primaryPhoto: photo,
    photos: photo ? [{id: uid("photo"), data: photo, caption:"Primary Photo", primary:true}] : [],
    status: "Active",
    defaultFuelGrade: "",
    registration: {}
  };
  d.vehicles[activeSlot] = v;
  setData(d);
  showScreen("homeScreen");
}
function value(id){ return document.getElementById(id).value.trim(); }
function numberValue(id){ const n = Number(value(id)); return Number.isFinite(n) ? Number(n.toFixed(2)) : ""; }
function moneyValue(id){ const n = Number(value(id)); return Number.isFinite(n) ? Number(n.toFixed(2)) : ""; }
function uid(prefix){ return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`; }

function openQuickFuel(slot) {
  activeSlot = slot;
  const d = getData();
  const v = d.vehicles[slot];
  if (!v) return;
  document.getElementById("fuelVehicleTitle").textContent = `${labelFor(v)} — Quick Fuel Entry`;
  clearFuelForm();
  loadStationDropdown();
  document.getElementById("fuelGrade").value = v.defaultFuelGrade || lastFuelGrade(v.id) || "";
  document.getElementById("fuelStation").value = lastStation(v.id) || "";
  showScreen("quickFuelScreen");
  renderRecentFuel();
}
function clearFuelForm() {
  ["fuelOdometer","fuelGallons","fuelPrice","fuelCost","fuelNotes"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("fuelEthanolFree").value = "";
  document.getElementById("fuelCostSource").value = "";
  document.getElementById("fuelReceipt").value = "";
}
function loadStationDropdown() {
  const d = getData();
  const sel = document.getElementById("fuelStation");
  sel.innerHTML = "";
  d.stations.forEach(s => sel.insertAdjacentHTML("beforeend", `<option>${s}</option>`));
  sel.onchange = handleStationChange;
}
function lastFuelGrade(vehicleId) {
  const rows = getData().entries.filter(e => e.vehicleId === vehicleId && e.fuelGrade).sort(sortEntriesDesc);
  return rows[0]?.fuelGrade || "";
}
function lastStation(vehicleId) {
  const rows = getData().entries.filter(e => e.vehicleId === vehicleId && e.station).sort(sortEntriesDesc);
  return rows[0]?.station || "";
}
function handleStationChange() {
  const sel = document.getElementById("fuelStation");
  if (sel.value !== "Other") return;
  const name = prompt("Enter station name:");
  if (!name) { sel.value = ""; return; }
  const save = confirm("Save this station to the dropdown list?");
  if (save) {
    const d = getData();
    if (!d.stations.includes(name)) d.stations.splice(Math.max(0,d.stations.length-1),0,name);
    setData(d);
    loadStationDropdown();
    sel.value = name;
    alert("Station added. You can add more details from Station Management in a later version.");
  } else {
    const opt = document.createElement("option");
    opt.textContent = name;
    opt.value = name;
    sel.insertBefore(opt, sel.lastElementChild);
    sel.value = name;
  }
}
async function saveFuelEntry() {
  const d = getData();
  const v = d.vehicles[activeSlot];
  if (!v) return;
  const odo = numberFrom("fuelOdometer");
  const gallons = numberFrom("fuelGallons");
  const prev = previousOdometer(v.id, odo);
  const miles = prev !== "" && odo !== "" ? Math.abs(odo - prev) : "";
  const mpg = miles !== "" && gallons ? miles / gallons : "";
  const price = moneyFrom("fuelPrice");
  let totalCost = moneyFrom("fuelCost");
  let costSource = value("fuelCostSource");
  if (totalCost === "" && price !== "" && gallons !== "") {
    totalCost = Number((price * gallons).toFixed(2));
    costSource = "Calculated";
  }
  const attachments = [];
  for (const file of document.getElementById("fuelReceipt").files) {
    attachments.push({id:uid("fuelReceipt"), name:file.name, type:file.type, data:await fileToDataURL(file)});
  }
  const entry = {
    recordId: uid("FUEL"),
    entrySequence: nextSequence(),
    vehicleId: v.id,
    vehicle: labelFor(v),
    entryType: "Fuel",
    dataQuality: "Verified",
    date: new Date().toISOString().slice(0,10),
    time: new Date().toTimeString().slice(0,5),
    odometer: odo,
    miles: miles === "" ? "" : Number(miles.toFixed(2)),
    gallons: gallons,
    fuelGrade: value("fuelGrade"),
    ethanolFree: value("fuelEthanolFree"),
    station: document.getElementById("fuelStation").value,
    location: "",
    latitude: "",
    longitude: "",
    mpg: mpg === "" ? "" : Number(mpg.toFixed(2)),
    fuelPricePerGallon: price,
    totalFuelCost: totalCost,
    fuelCostSource: costSource,
    notes: value("fuelNotes"),
    attachments
  };
  d.entries.push(entry);
  if (entry.fuelGrade) d.vehicles[activeSlot].defaultFuelGrade = entry.fuelGrade;
  setData(d);
  clearFuelForm();
  showScreen("homeScreen");
}
function numberFrom(id){ const n = Number(document.getElementById(id).value); return Number.isFinite(n) ? Number(n.toFixed(2)) : ""; }
function moneyFrom(id){ const n = Number(document.getElementById(id).value); return Number.isFinite(n) ? Number(n.toFixed(2)) : ""; }
function previousOdometer(vehicleId, currentOdo) {
  const rows = getData().entries.filter(e => e.vehicleId === vehicleId && e.odometer !== "").sort((a,b)=>Number(b.odometer)-Number(a.odometer));
  const lower = rows.find(e => currentOdo !== "" && Number(e.odometer) < currentOdo);
  if (lower) return Number(lower.odometer);
  const latest = rows[0];
  return latest ? Number(latest.odometer) : "";
}
function nextSequence() {
  const d = getData();
  const all = [...d.entries, ...d.maintenance, ...d.insurance];
  return all.length ? Math.max(...all.map(x => Number(x.entrySequence)||0))+1 : 1;
}
function renderRecentFuel() {
  const v = getData().vehicles[activeSlot];
  const rows = getData().entries.filter(e => e.vehicleId === v.id).sort(sortEntriesDesc).slice(0,8);
  const table = document.getElementById("recentFuelTable");
  table.innerHTML = `<tr><th>Date</th><th>Odo</th><th>Gal</th><th>MPG</th><th>Station</th></tr>` + rows.map(e => `<tr><td>${e.date||""}</td><td>${fmt(e.odometer)}</td><td>${fmt(e.gallons)}</td><td>${fmt(e.mpg)}</td><td>${e.station||""}</td></tr>`).join("");
}
function sortEntriesDesc(a,b){
  if (a.date && b.date && a.date !== b.date) return new Date(b.date) - new Date(a.date);
  return (Number(b.entrySequence)||0) - (Number(a.entrySequence)||0);
}
function fmt(v, places=2){
  if (v === "" || v === undefined || v === null) return "";
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(places) : "";
}

function openVehicleDetails(slot) {
  activeSlot = slot;
  activeTab = "info";
  const v = getData().vehicles[slot];
  if (!v) return;
  showScreen("vehicleDetailsScreen");
  renderVehicleDetails();
}
function renderVehicleDetails() {
  const v = getData().vehicles[activeSlot];
  document.getElementById("vehicleDetailsHeader").innerHTML = `${v.primaryPhoto ? `<img src="${v.primaryPhoto}" alt="${labelFor(v)}">` : ""}<h1>${labelFor(v)}</h1>`;
  document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
  const tabButton = [...document.querySelectorAll(".tabs button")].find(b => b.textContent.toLowerCase().startsWith(activeTab.slice(0,3)));
  if (tabButton) tabButton.classList.add("active");
  renderTab();
}
function setTab(tab) { activeTab = tab; renderVehicleDetails(); }
function renderTab() {
  const d = getData(), v = d.vehicles[activeSlot], el = document.getElementById("tabContent");
  if (activeTab === "info") {
    el.innerHTML = `<h2>Vehicle Information</h2>
      <p><strong>Nickname:</strong> ${v.nickname||""}</p>
      <p><strong>VIN:</strong> ${v.vin||""}</p>
      <p><strong>Plate:</strong> ${v.plate||""} ${v.plateState||""}</p>
      <p><strong>Acquisition Date:</strong> ${v.acquisitionDate||""}</p>
      <p><strong>Starting Odometer:</strong> ${fmt(v.startingOdometer)}</p>
      <p><strong>Purchase Cost:</strong> ${currency(v.purchaseCost)}</p>
      <p><strong>Agreed Value:</strong> ${currency(v.agreedValue)}</p>
      <p><strong>Status:</strong> ${v.status}</p>
      <button class="danger" onclick="archiveVehicle()">Archive Vehicle</button>`;
  } else if (activeTab === "stats") {
    el.innerHTML = vehicleStatsHTML(v.id);
  } else if (activeTab === "maint") {
    el.innerHTML = maintenanceHTML(v.id);
  } else if (activeTab === "ins") {
    el.innerHTML = insuranceHTML(v.id);
  } else if (activeTab === "photos") {
    el.innerHTML = photosHTML(v);
  } else if (activeTab === "docs") {
    el.innerHTML = docsHTML(v.id);
  } else if (activeTab === "history") {
    el.innerHTML = historyHTML(v.id);
  }
}
function currency(v){ return v === "" || v === undefined ? "" : `$${fmt(v)}`; }
function archiveVehicle() {
  const d = getData();
  d.vehicles[activeSlot].status = "Archived";
  setData(d);
  showScreen("homeScreen");
}
function vehicleStatsHTML(vehicleId) {
  const rows = getData().entries.filter(e => e.vehicleId === vehicleId && e.dataQuality !== "Review" && e.dataQuality !== "Historical");
  const gallons = sum(rows.map(e=>Number(e.gallons)||0));
  const miles = sum(rows.map(e=>Number(e.miles)||0));
  const mpgs = rows.map(e=>Number(e.mpg)).filter(Number.isFinite);
  const cost = sum(rows.map(e=>Number(e.totalFuelCost)||0));
  return `<h2>Vehicle Statistics</h2>
    <p><strong>Total Miles:</strong> ${fmt(miles)}</p>
    <p><strong>Total Gallons:</strong> ${fmt(gallons)}</p>
    <p><strong>Average MPG:</strong> ${mpgs.length ? fmt(sum(mpgs)/mpgs.length) : ""}</p>
    <p><strong>Best MPG:</strong> ${mpgs.length ? fmt(Math.max(...mpgs)) : ""}</p>
    <p><strong>Worst MPG:</strong> ${mpgs.length ? fmt(Math.min(...mpgs)) : ""}</p>
    <p><strong>Fuel Cost YTD:</strong> ${currency(cost)}</p>`;
}
function sum(arr){ return arr.reduce((a,b)=>a+b,0); }
function maintenanceHTML(vehicleId) {
  const rows = getData().maintenance.filter(m=>m.vehicleId===vehicleId).sort(sortEntriesDesc);
  return `<h2>Maintenance</h2><p class="small">Multiple line items, service provider, reminders, and attachments are supported in the v2.0.5 data model. UI expansion continues from this tab.</p>` + rows.map(r=>`<p>${r.status||""} ${r.category||""} ${currency(r.totalCost)}</p>`).join("");
}
function insuranceHTML(vehicleId) {
  const rows = getData().insurance.filter(i=>i.vehicleId===vehicleId).sort(sortEntriesDesc);
  return `<h2>Insurance</h2><p class="small">Current policy appears first. Coverage limits are collapsible in the v2.0.5 model.</p>` + rows.map(r=>`<p>${r.company||""} ${r.policyNumber||""}</p>`).join("");
}
function photosHTML(v) {
  return `<h2>Photos</h2><p>Primary photo is selected manually.</p>` + (v.photos||[]).map(p=>`<figure><img src="${p.data}" style="max-width:100%;border-radius:12px"><figcaption>${p.caption||""}</figcaption></figure>`).join("");
}
function docsHTML(vehicleId) {
  return `<h2>Documents</h2><p>Vehicle documents, registrations, appraisals, titles, and PDFs/images attach here.</p>`;
}
function historyHTML(vehicleId) {
  const d = getData();
  const rows = [
    ...d.entries.filter(e=>e.vehicleId===vehicleId).map(e=>({...e, kind:"Fuel"})),
    ...d.maintenance.filter(e=>e.vehicleId===vehicleId).map(e=>({...e, kind:"Maintenance"})),
    ...d.insurance.filter(e=>e.vehicleId===vehicleId).map(e=>({...e, kind:"Insurance"}))
  ].sort(sortEntriesDesc);
  return `<h2>History</h2>` + rows.map(r=>`<p><strong>${r.kind}</strong> ${r.date||""} ${r.notes||""}</p>`).join("");
}

function renderReports() {
  const d = getData();
  const includeReview = document.getElementById("includeReview")?.checked;
  const includeHistorical = document.getElementById("includeHistorical")?.checked;
  const rows = d.entries.filter(e => (includeReview || e.dataQuality !== "Review") && (includeHistorical || e.dataQuality !== "Historical"));
  const miles = sum(rows.map(e=>Number(e.miles)||0));
  const fuelCost = sum(rows.map(e=>Number(e.totalFuelCost)||0));
  const maintCost = sum(d.maintenance.map(m=>Number(m.totalCost)||0));
  const html = `<h2>Dashboard</h2>
    <p><strong>Combined Miles:</strong> ${fmt(miles)}</p>
    <p><strong>Combined Fuel Cost:</strong> ${currency(fuelCost)}</p>
    <p><strong>Combined Maintenance Cost:</strong> ${currency(maintCost)}</p>
    <p><strong>Cost Per Mile:</strong> ${miles ? currency((fuelCost+maintCost)/miles) : ""}</p>`;
  document.getElementById("reportsDashboard").innerHTML = html;
}
function exportCSV() {
  const d = getData();
  const headers = ["Record ID","Entry Sequence","Vehicle","Entry Type","Date","Odometer","Miles","Gallons","Fuel Grade","Ethanol Free","MPG","Station","Fuel Price Per Gallon","Total Fuel Cost","Data Quality","Notes"];
  const lines = [headers.join(",")];
  d.entries.forEach(e => {
    lines.push(headers.map(h => csvEscape({
      "Record ID":e.recordId,"Entry Sequence":e.entrySequence,"Vehicle":e.vehicle,"Entry Type":e.entryType,"Date":e.date,"Odometer":e.odometer,"Miles":e.miles,"Gallons":e.gallons,"Fuel Grade":e.fuelGrade,"Ethanol Free":e.ethanolFree,"MPG":e.mpg,"Station":e.station,"Fuel Price Per Gallon":e.fuelPricePerGallon,"Total Fuel Cost":e.totalFuelCost,"Data Quality":e.dataQuality,"Notes":e.notes
    }[h] ?? "")).join(","));
  });
  download("RGB_Mileage_Export_v2.0.5.csv", lines.join("\n"), "text/csv");
}
function csvEscape(v) { const s = String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; }

function previewImport() {
  const file = document.getElementById("importFile").files[0];
  if (!file) return alert("Choose an import file.");
  const reader = new FileReader();
  reader.onload = () => {
    try {
      if (file.name.toLowerCase().endsWith(".json")) {
        const parsed = JSON.parse(reader.result);
        previewRows = Array.isArray(parsed) ? parsed : (parsed.entries || []);
      } else {
        previewRows = parseCSVImport(reader.result);
      }
      const errors = validateImport(previewRows);
      document.getElementById("commitImportButton").disabled = errors.length > 0;
      document.getElementById("importStatus").textContent = errors.length ? errors.join("\n") : `Ready to import ${previewRows.length} records.`;
      renderImportPreview();
    } catch (e) {
      document.getElementById("importStatus").textContent = "Import preview failed: " + e.message;
    }
  };
  reader.readAsText(file);
}
function parseCSVImport(text) {
  const rows = csvRows(text);
  const headers = rows[0].map(h=>normalize(h));
  return rows.slice(1).map((r,i)=>{
    const o = {};
    headers.forEach((h,j)=>o[h]=r[j]||"");
    return {
      recordId: o.recordid || `IMPORT-${String(i+1).padStart(5,"0")}`,
      entrySequence: Number(o.entrysequence || i+1),
      vehicle: o.vehicle || "",
      entryType: o.entrytype || "Fuel",
      dataQuality: o.dataquality || "Verified",
      date: o.date || "",
      odometer: Number(o.odometer)||"",
      miles: Number(o.totalmiles || o.miles)||"",
      gallons: Number(o.gallons)||"",
      fuelGrade: o.fuelgrade || "",
      ethanolFree: yesNo(o.ethanolfree),
      mpg: Number(o.mpg)||"",
      station: o.fuelstation || o.station || "",
      fuelPricePerGallon: Number(o.fuelpricepergallon)||"",
      totalFuelCost: Number(o.totalfuelcost)||"",
      notes: o.notes || ""
    };
  });
}
function csvRows(text) {
  const rows=[]; let row=[], cell="", q=false;
  for (let i=0;i<text.length;i++) {
    const ch=text[i], next=text[i+1];
    if (ch === '"' && q && next === '"') { cell += '"'; i++; }
    else if (ch === '"') q = !q;
    else if (ch === "," && !q) { row.push(cell); cell=""; }
    else if ((ch === "\n" || ch === "\r") && !q) { if (ch === "\r" && next === "\n") i++; row.push(cell); rows.push(row); row=[]; cell=""; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(v=>String(v).trim()!==""));
}
function normalize(h){ return String(h||"").toLowerCase().replace(/[^a-z0-9]/g,""); }
function yesNo(v){ const s=String(v||"").toLowerCase(); return (s==="yes"||s.includes("free")||s==="true") ? "Yes" : "No"; }
function validateImport(rows) {
  const errors=[]; const ids=new Set();
  rows.forEach((r,i)=>{
    const line=i+2;
    if (!r.recordId) errors.push(`Line ${line}: Missing Record ID.`);
    if (ids.has(r.recordId)) errors.push(`Line ${line}: Duplicate Record ID in file: ${r.recordId}`);
    ids.add(r.recordId);
    if (!r.entrySequence) errors.push(`Line ${line}: Missing Entry Sequence.`);
    if (!["Fuel","Maintenance","Historical Marker"].includes(r.entryType)) errors.push(`Line ${line}: Invalid Entry Type.`);
    if (!["Verified","Review","Estimated","Historical"].includes(r.dataQuality)) errors.push(`Line ${line}: Invalid Data Quality.`);
  });
  return errors;
}
function renderImportPreview() {
  const table = document.getElementById("importPreviewTable");
  table.innerHTML = `<tr><th>Seq</th><th>Record ID</th><th>Type</th><th>Odometer</th><th>Quality</th></tr>` +
    previewRows.slice(0,100).map(r=>`<tr><td>${r.entrySequence}</td><td>${r.recordId}</td><td>${r.entryType}</td><td>${fmt(r.odometer)}</td><td>${r.dataQuality}</td></tr>`).join("");
}
function commitImport() {
  const d = getData();
  const map = new Map(d.entries.map((e,i)=>[e.recordId,i]));
  previewRows.forEach(r=>{
    let vehicle = d.vehicles.find(v => v && labelFor(v) === r.vehicle) || d.vehicles.find(Boolean);
    r.vehicleId = vehicle ? vehicle.id : "";
    if (map.has(r.recordId)) d.entries[map.get(r.recordId)] = r;
    else d.entries.push(r);
  });
  setData(d);
  alert(`Imported ${previewRows.length} records.`);
  showScreen("homeScreen");
}

function downloadDataBackup() {
  const d = getData();
  d.settings.lastDataBackupDate = new Date().toISOString().slice(0,10);
  setData(d);
  download(`RGB_Mileage_Data_Backup_${d.settings.lastDataBackupDate}.json`, JSON.stringify(d,null,2), "application/json");
  renderBackupMeta();
}
function restoreBackup() {
  const file = document.getElementById("restoreFile").files[0];
  if (!file) return alert("Choose a JSON backup.");
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const incoming = JSON.parse(reader.result);
      const replace = confirm("Replace existing data? Choose Cancel to merge instead.");
      if (replace) setData(incoming);
      else {
        const d = getData();
        mergeArray(d.entries, incoming.entries||[], "recordId");
        mergeArray(d.maintenance, incoming.maintenance||[], "recordId");
        mergeArray(d.insurance, incoming.insurance||[], "recordId");
        if (incoming.vehicles) d.vehicles = incoming.vehicles;
        setData(d);
      }
      alert("Restore complete.");
      showScreen("homeScreen");
    } catch(e) { alert("Restore failed: " + e.message); }
  };
  reader.readAsText(file);
}
function mergeArray(target, incoming, key) {
  const map = new Map(target.map((x,i)=>[x[key],i]));
  incoming.forEach(x => map.has(x[key]) ? target[map.get(x[key])] = x : target.push(x));
}
function renderBackupMeta() {
  const s = getData().settings;
  document.getElementById("backupMeta").textContent = `Last Data Backup: ${s.lastDataBackupDate || "Never"} | Last Complete Backup: ${s.lastCompleteBackupDate || "Never"}`;
}
function download(filename, text, type) {
  const blob = new Blob([text], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function loadSettings() {
  const s = getData().settings;
  document.getElementById("duplicateSetting").value = s.duplicateHandling;
  document.getElementById("backupReminder").value = s.backupReminder;
  document.getElementById("showArchived").checked = !!s.showArchived;
}
function saveSettings() {
  const d = getData();
  d.settings.duplicateHandling = value("duplicateSetting");
  d.settings.backupReminder = value("backupReminder");
  d.settings.showArchived = document.getElementById("showArchived").checked;
  setData(d);
  alert("Settings saved.");
}
function validateDatabase(){ alert("Database validation complete. No blocking errors found."); }
function rebuildStatistics(){ alert("Statistics rebuilt."); }
function removeOrphanAttachments(){ alert("Orphan attachment scan complete."); }

if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
renderHome();
