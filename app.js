
const key = "rgbMileageTracker_v2_0_2";

function getData() {
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function setData(data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function money(v) {
  if (v === "" || v === null || v === undefined) return "";
  const n = Number(v);
  return Number.isFinite(n) ? Number(n.toFixed(2)) : "";
}

function saveEntry() {
  const data = getData();
  const gallons = Number(document.getElementById("gallons").value || 0);
  const price = money(document.getElementById("fuelPrice").value);
  let total = money(document.getElementById("fuelCost").value);

  if (!total && price && gallons) {
    total = money(price * gallons);
    document.getElementById("fuelCostSource").value = "Calculated";
  }

  const entry = {
    recordId: document.getElementById("recordId").value || `APP-${String(data.length + 1).padStart(5, "0")}`,
    entrySequence: Number(document.getElementById("entrySequence").value || data.length + 1),
    vehicle: document.getElementById("vehicleName").value || "Jeep CJ7",
    date: document.getElementById("entryDate").value,
    entryType: document.getElementById("entryType").value,
    odometer: Number(document.getElementById("odometer").value || 0).toFixed(2),
    totalMiles: document.getElementById("totalMiles").value,
    gallons: document.getElementById("gallons").value,
    fuelGrade: document.getElementById("fuelGrade").value,
    ethanolFree: document.getElementById("ethanolFree").value,
    mpg: document.getElementById("mpg").value,
    fuelPricePerGallon: price,
    totalFuelCost: total,
    fuelCostSource: document.getElementById("fuelCostSource").value,
    dataQuality: document.getElementById("dataQuality").value,
    notes: document.getElementById("notes").value
  };

  const existingIndex = data.findIndex(e => e.recordId === entry.recordId);
  if (existingIndex >= 0) data[existingIndex] = entry;
  else data.push(entry);

  data.sort((a,b) => Number(a.entrySequence) - Number(b.entrySequence));
  setData(data);
  render();
}

function render() {
  const tbody = document.querySelector("#entryTable tbody");
  tbody.innerHTML = "";
  getData().forEach(e => {
    tbody.insertAdjacentHTML("beforeend", `
      <tr>
        <td>${e.entrySequence}</td>
        <td>${e.recordId}</td>
        <td>${e.entryType}</td>
        <td>${e.odometer}</td>
        <td>${e.gallons || ""}</td>
        <td>${e.mpg || ""}</td>
        <td>${e.dataQuality}</td>
      </tr>
    `);
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}

render();
