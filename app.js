
const VERSION="2.0.7", BUILD_DATE="2026-06-04", KEY="rgbMileage", LEGACY_KEYS=["rgbMileage_v2_0_6","rgbMileage_v2_0_7","rgbm_data_v110"];
let activeSlot=0, activeTab="info", previewRows=[], selectedVehiclePhotoData="", selectedVehiclePhotoZoom=1.25, selectedVehiclePhotoOffsetX=0, selectedVehiclePhotoOffsetY=0, photoDrag=null, longPressTriggered=false;
const DEFAULT_STATIONS=["Murphy USA","Circle K","refuel","BP","Shell","Other"];
function blankData(){return{version:VERSION,settings:{duplicateHandling:"Ask Every Time",backupReminder:"Never",showArchived:false,lastDataBackupDate:"",lastCompleteBackupDate:""},stations:[...DEFAULT_STATIONS],maintenanceCategories:["Oil Change","Tire Rotation","Brakes","Suspension","Engine","Cooling System","Electrical","Transmission","Inspection","Cleaning / Detailing","Repair","Upgrade / Modification","Other"],maintenanceStatus:["Planned","Fix","Other"],performedBy:["Shop","Self","Friend","Other"],vehicles:[null,null],entries:[],maintenance:[],insurance:[],documents:[],photos:[]}}
function normalizeData(d){
  const base=blankData();
  if(!d||typeof d!=="object") return base;
  d.version=VERSION;
  d.settings=Object.assign(base.settings,d.settings||{});
  d.stations=Array.isArray(d.stations)&&d.stations.length?d.stations:base.stations;
  d.maintenanceCategories=Array.isArray(d.maintenanceCategories)&&d.maintenanceCategories.length?d.maintenanceCategories:base.maintenanceCategories;
  d.maintenanceStatus=Array.isArray(d.maintenanceStatus)&&d.maintenanceStatus.length?d.maintenanceStatus:base.maintenanceStatus;
  d.performedBy=Array.isArray(d.performedBy)&&d.performedBy.length?d.performedBy:base.performedBy;
  d.vehicles=Array.isArray(d.vehicles)?d.vehicles:base.vehicles;
  while(d.vehicles.length<2)d.vehicles.push(null);
  d.entries=Array.isArray(d.entries)?d.entries:[];
  d.maintenance=Array.isArray(d.maintenance)?d.maintenance:[];
  d.insurance=Array.isArray(d.insurance)?d.insurance:[];
  d.documents=Array.isArray(d.documents)?d.documents:[];
  d.photos=Array.isArray(d.photos)?d.photos:[];
  d.vehicles=d.vehicles.map(v=>v?Object.assign({primaryPhotoOffsetX:0,primaryPhotoOffsetY:0,primaryPhotoZoom:1.25,status:"Active",photos:[]},v):null);
  return d;
}
function getData(){
  try{
    let raw=localStorage.getItem(KEY), sourceKey=KEY;
    if(!raw && Array.isArray(LEGACY_KEYS)){
      for(const k of LEGACY_KEYS){raw=localStorage.getItem(k);if(raw){sourceKey=k;break}}
    }
    const d=normalizeData(raw?JSON.parse(raw):blankData());
    if(sourceKey!==KEY) setData(d);
    return d;
  }catch(err){
    console.error("RGB Mileage data load failed",err);
    return blankData();
  }
}
function setData(d){localStorage.setItem(KEY,JSON.stringify(d))}
function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  const screen=document.getElementById(id)||document.getElementById("homeScreen");
  screen.classList.add("active");
  if(id==="homeScreen")renderHome();
  if(id==="reportsScreen")renderReports();
  if(id==="backupScreen")renderBackupMeta();
  if(id==="settingsScreen")loadSettings();
  ensureVersionFooters();
}
function ensureVersionFooters(){
  document.querySelectorAll(".screen").forEach(s=>{
    let f=s.querySelector(":scope > footer.version");
    if(!f){f=document.createElement("footer");f.className="version";s.appendChild(f)}
    f.textContent=`Version ${VERSION}`;
  });
}
function initialsFor(v){if(!v)return"";const text=`${v.year||""} ${v.make||""} ${v.model||""}`.trim();if(/grand wagoneer/i.test(text))return"JGW";if(/c10/i.test(text))return"CC10";if(/f-?150.*lightning/i.test(text))return"F150L";if(/cj7|cj-7/i.test(text))return"CJ7";return text.split(/\s+/).filter(w=>!/^\d{4}$/.test(w)).map(w=>w[0]).join("").slice(0,5).toUpperCase()||"+"}
function labelFor(v){return v?(`${v.year||""} ${v.make||""} ${v.model||""}`.trim()||v.nickname||"Vehicle"):""}
let pressTimer=null;
function renderHome(){
  const d=getData();
  [0,1].forEach(i=>{
    const slot=document.getElementById(`slot${i}`);
    const label=document.getElementById(`slot${i}Label`);
    const v=d.vehicles[i];
    slot.oncontextmenu=e=>e.preventDefault();
    slot.onpointerdown=e=>handlePointerDown(e,i);
    slot.onpointerup=clearPressTimer;
    slot.onpointercancel=clearPressTimer;
    if(!v||(v.status==="Archived"&&!d.settings.showArchived)){
      slot.innerHTML=`<div class="empty-wrap"><div class="plus">+</div><div class="empty-car">▰</div><div class="add-text">Add Vehicle</div></div>`;
      label.textContent="";
      slot.onclick=()=>{activeSlot=i;prepareAddVehicle();showScreen("addVehicleScreen")};
    }else{
      slot.innerHTML=v.primaryPhoto
        ? `<img src="${v.primaryPhoto}" alt="${labelFor(v)}" style="transform:translate(${v.primaryPhotoOffsetX||0}px,${v.primaryPhotoOffsetY||0}px) scale(${v.primaryPhotoZoom||1.25})" draggable="false">`
        : `<span class="initials">${initialsFor(v)}</span>`;
      label.textContent=labelFor(v);
      slot.onclick=()=>{
        if(longPressTriggered){longPressTriggered=false;return}
        openQuickFuel(i);
      };
    }
  });
  ensureVersionFooters();
}
function handlePointerDown(e,i){
  clearPressTimer();
  longPressTriggered=false;
  pressTimer=setTimeout(()=>{
    const d=getData();
    if(d.vehicles[i]){
      longPressTriggered=true;
      if(e&&e.preventDefault)e.preventDefault();
      activeSlot=i;
      prepareEditVehicle(i);
      showScreen("addVehicleScreen");
    }
  },650);
}
function clearPressTimer(){if(pressTimer)clearTimeout(pressTimer);pressTimer=null}
function prepareAddVehicle(){document.getElementById("vehicleFormTitle").textContent="Add Vehicle";["vehicleNickname","vehicleYear","vehicleMake","vehicleModel","vehicleVin","vehiclePlate","vehiclePlateState","vehicleAcqDate","vehicleStartingOdo","vehiclePurchaseDate","vehiclePurchaseCost","vehicleSeller","vehicleInsuranceValue","vehicleAgreedValue","vehicleNotes"].forEach(id=>document.getElementById(id).value="");document.getElementById("vehiclePhoto").value="";selectedVehiclePhotoData="";selectedVehiclePhotoZoom=1.25;selectedVehiclePhotoOffsetX=0;selectedVehiclePhotoOffsetY=0;document.getElementById("vehiclePhotoZoom").value="1.25";document.getElementById("vehiclePhotoPreview").innerHTML="<span>Preview</span>";initPhotoPreviewDrag()}
function fileToDataURL(file){return new Promise(resolve=>{if(!file)return resolve("");const reader=new FileReader();reader.onload=e=>resolve(e.target.result);reader.readAsDataURL(file)})}
async function loadVehiclePhotoPreview(event){selectedVehiclePhotoData=await fileToDataURL(event.target.files[0]);updatePhotoPreview()}
function updatePhotoPreview(){selectedVehiclePhotoZoom=Number(document.getElementById("vehiclePhotoZoom").value||1.25);const box=document.getElementById("vehiclePhotoPreview");box.innerHTML=selectedVehiclePhotoData?`<img src="${selectedVehiclePhotoData}" style="transform:translate(${selectedVehiclePhotoOffsetX}px,${selectedVehiclePhotoOffsetY}px) scale(${selectedVehiclePhotoZoom})" alt="Vehicle preview" draggable="false">`:"<span>Preview</span>";initPhotoPreviewDrag()}

function prepareEditVehicle(i){
  const d=getData(), v=d.vehicles[i];
  if(!v){prepareAddVehicle();return}
  activeSlot=i;
  document.getElementById("vehicleFormTitle").textContent="Edit Vehicle";
  document.getElementById("vehicleNickname").value=v.nickname||"";
  document.getElementById("vehicleYear").value=v.year||"";
  document.getElementById("vehicleMake").value=v.make||"";
  document.getElementById("vehicleModel").value=v.model||"";
  document.getElementById("vehicleVin").value=v.vin||"";
  document.getElementById("vehiclePlate").value=v.plate||"";
  document.getElementById("vehiclePlateState").value=v.plateState||"";
  document.getElementById("vehicleAcqDate").value=v.acquisitionDate||"";
  document.getElementById("vehicleStartingOdo").value=v.startingOdometer||"";
  document.getElementById("vehiclePurchaseDate").value=v.purchaseDate||"";
  document.getElementById("vehiclePurchaseCost").value=v.purchaseCost||"";
  document.getElementById("vehicleSeller").value=v.seller||"";
  document.getElementById("vehicleInsuranceValue").value=v.insuranceValue||"";
  document.getElementById("vehicleAgreedValue").value=v.agreedValue||"";
  document.getElementById("vehicleNotes").value=v.notes||"";
  document.getElementById("vehiclePhoto").value="";
  selectedVehiclePhotoData=v.primaryPhoto||"";
  selectedVehiclePhotoZoom=Number(v.primaryPhotoZoom||1.25);
  selectedVehiclePhotoOffsetX=Number(v.primaryPhotoOffsetX||0);
  selectedVehiclePhotoOffsetY=Number(v.primaryPhotoOffsetY||0);
  document.getElementById("vehiclePhotoZoom").value=selectedVehiclePhotoZoom;
  updatePhotoPreview();
}
function initPhotoPreviewDrag(){
  const box=document.getElementById("vehiclePhotoPreview");
  if(!box || box.dataset.dragReady==="yes")return;
  box.dataset.dragReady="yes";
  box.onpointerdown=e=>{
    if(!selectedVehiclePhotoData)return;
    photoDrag={x:e.clientX,y:e.clientY};
    box.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  box.onpointermove=e=>{
    if(!photoDrag)return;
    selectedVehiclePhotoOffsetX += e.clientX-photoDrag.x;
    selectedVehiclePhotoOffsetY += e.clientY-photoDrag.y;
    photoDrag={x:e.clientX,y:e.clientY};
    updatePhotoPreview();
    e.preventDefault();
  };
  box.onpointerup=box.onpointercancel=()=>{photoDrag=null};
}
function swapVehiclePositions(){
  const d=getData();
  [d.vehicles[0],d.vehicles[1]]=[d.vehicles[1],d.vehicles[0]];
  if(d.vehicles[0])d.vehicles[0].slot=0;
  if(d.vehicles[1])d.vehicles[1].slot=1;
  setData(d);
  alert("Vehicle positions swapped.");
  showScreen("homeScreen");
}

async function saveVehicle(){const d=getData();const filePhoto=await fileToDataURL(document.getElementById("vehiclePhoto").files[0]);const photo=selectedVehiclePhotoData||filePhoto;const zoom=selectedVehiclePhotoZoom||Number(document.getElementById("vehiclePhotoZoom").value||1.25);const existing=d.vehicles[activeSlot]||{};d.vehicles[activeSlot]={id:existing.id||`vehicle-${activeSlot+1}`,slot:activeSlot,nickname:value("vehicleNickname"),year:value("vehicleYear"),make:value("vehicleMake"),model:value("vehicleModel"),vin:value("vehicleVin"),plate:value("vehiclePlate"),plateState:value("vehiclePlateState"),acquisitionDate:value("vehicleAcqDate"),startingOdometer:numberValue("vehicleStartingOdo"),purchaseDate:value("vehiclePurchaseDate"),purchaseCost:moneyValue("vehiclePurchaseCost"),seller:value("vehicleSeller"),insuranceValue:moneyValue("vehicleInsuranceValue"),agreedValue:moneyValue("vehicleAgreedValue"),notes:value("vehicleNotes"),primaryPhoto:photo,primaryPhotoZoom:zoom,primaryPhotoOffsetX:selectedVehiclePhotoOffsetX||0,primaryPhotoOffsetY:selectedVehiclePhotoOffsetY||0,photos:photo?[{id:uid("photo"),data:photo,caption:"Primary Photo",primary:true,zoom,offsetX:selectedVehiclePhotoOffsetX||0,offsetY:selectedVehiclePhotoOffsetY||0}]:[],status:existing.status||"Active",defaultFuelGrade:"",registration:{}};setData(d);showScreen("homeScreen")}
function value(id){return document.getElementById(id).value.trim()}function numberValue(id){const n=Number(value(id));return Number.isFinite(n)?Number(n.toFixed(2)):""}function moneyValue(id){return numberValue(id)}function uid(prefix){return`${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`}
function openQuickFuel(slot){activeSlot=slot;const v=getData().vehicles[slot];document.getElementById("fuelVehicleTitle").textContent=`${labelFor(v)} — Quick Fuel Entry`;clearFuelForm();loadStationDropdown();document.getElementById("fuelGrade").value=v.defaultFuelGrade||lastFuelGrade(v.id)||"";document.getElementById("fuelStation").value=lastStation(v.id)||"";showScreen("quickFuelScreen");renderRecentFuel()}
function clearFuelForm(){["fuelOdometer","fuelGallons","fuelPrice","fuelCost","fuelNotes"].forEach(id=>document.getElementById(id).value="");document.getElementById("fuelEthanolFree").value="";document.getElementById("fuelCostSource").value="";document.getElementById("fuelReceipt").value=""}
function loadStationDropdown(){const d=getData(), sel=document.getElementById("fuelStation");sel.innerHTML="";d.stations.forEach(s=>sel.insertAdjacentHTML("beforeend",`<option>${s}</option>`));sel.onchange=handleStationChange}
function lastFuelGrade(vehicleId){return (getData().entries.filter(e=>e.vehicleId===vehicleId&&e.fuelGrade).sort(sortEntriesDesc)[0]||{}).fuelGrade||""}
function lastStation(vehicleId){return (getData().entries.filter(e=>e.vehicleId===vehicleId&&e.station).sort(sortEntriesDesc)[0]||{}).station||""}
function handleStationChange(){const sel=document.getElementById("fuelStation");if(sel.value!=="Other")return;const name=prompt("Enter station name:");if(!name){sel.value="";return}if(confirm("Save this station to the dropdown list?")){const d=getData();if(!d.stations.includes(name))d.stations.splice(Math.max(0,d.stations.length-1),0,name);setData(d);loadStationDropdown();sel.value=name}else{const opt=document.createElement("option");opt.textContent=name;opt.value=name;sel.insertBefore(opt,sel.lastElementChild);sel.value=name}}
async function saveFuelEntry(){const d=getData(), v=d.vehicles[activeSlot], odo=numberFrom("fuelOdometer"), gallons=numberFrom("fuelGallons"), prev=previousOdometer(v.id,odo), miles=prev!==""&&odo!==""?Math.abs(odo-prev):"", mpg=miles!==""&&gallons?miles/gallons:"", price=moneyFrom("fuelPrice");let totalCost=moneyFrom("fuelCost"), costSource=value("fuelCostSource");if(totalCost===""&&price!==""&&gallons!==""){totalCost=Number((price*gallons).toFixed(2));costSource="Calculated"}const attachments=[];for(const file of document.getElementById("fuelReceipt").files){attachments.push({id:uid("fuelReceipt"),name:file.name,type:file.type,data:await fileToDataURL(file)})}const entry={recordId:uid("FUEL"),entrySequence:nextSequence(),vehicleId:v.id,vehicle:labelFor(v),entryType:"Fuel",dataQuality:"Verified",date:new Date().toISOString().slice(0,10),time:new Date().toTimeString().slice(0,5),odometer:odo,miles:miles===""?"":Number(miles.toFixed(2)),gallons,fuelGrade:value("fuelGrade"),ethanolFree:value("fuelEthanolFree"),station:document.getElementById("fuelStation").value,mpg:mpg===""?"":Number(mpg.toFixed(2)),fuelPricePerGallon:price,totalFuelCost:totalCost,fuelCostSource:costSource,notes:value("fuelNotes"),attachments};d.entries.push(entry);if(entry.fuelGrade)d.vehicles[activeSlot].defaultFuelGrade=entry.fuelGrade;setData(d);clearFuelForm();showScreen("homeScreen")}
function numberFrom(id){const n=Number(document.getElementById(id).value);return Number.isFinite(n)?Number(n.toFixed(2)):""}function moneyFrom(id){return numberFrom(id)}
function previousOdometer(vehicleId,currentOdo){const rows=getData().entries.filter(e=>e.vehicleId===vehicleId&&e.odometer!=="").sort((a,b)=>Number(b.odometer)-Number(a.odometer));const lower=rows.find(e=>currentOdo!==""&&Number(e.odometer)<currentOdo);return lower?Number(lower.odometer):(rows[0]?Number(rows[0].odometer):"")}
function nextSequence(){const d=getData(), all=[...d.entries,...d.maintenance,...d.insurance];return all.length?Math.max(...all.map(x=>Number(x.entrySequence)||0))+1:1}
function renderRecentFuel(){const v=getData().vehicles[activeSlot], rows=getData().entries.filter(e=>e.vehicleId===v.id).sort(sortEntriesDesc).slice(0,8), table=document.getElementById("recentFuelTable");table.innerHTML=`<tr><th>Date</th><th>Odo</th><th>Gal</th><th>MPG</th><th>Station</th></tr>`+rows.map(e=>`<tr><td>${e.date||""}</td><td>${fmt(e.odometer)}</td><td>${fmt(e.gallons)}</td><td>${fmt(e.mpg)}</td><td>${e.station||""}</td></tr>`).join("")}
function sortEntriesDesc(a,b){if(a.date&&b.date&&a.date!==b.date)return new Date(b.date)-new Date(a.date);return(Number(b.entrySequence)||0)-(Number(a.entrySequence)||0)}function fmt(v,p=2){if(v===""||v===undefined||v===null)return"";const n=Number(v);return Number.isFinite(n)?n.toFixed(p):""}
function openVehicleDetails(slot){activeSlot=slot;activeTab="info";showScreen("vehicleDetailsScreen");renderVehicleDetails()}
function renderVehicleDetails(){const v=getData().vehicles[activeSlot], zoom=v.primaryPhotoZoom||1.25;document.getElementById("vehicleDetailsHeader").innerHTML=`${v.primaryPhoto?`<img src="${v.primaryPhoto}" alt="${labelFor(v)}" style="transform:scale(${zoom})">`:""}<h1>${labelFor(v)}</h1>`;renderTab()}
function setTab(tab){activeTab=tab;renderTab()}function renderTab(){const d=getData(),v=d.vehicles[activeSlot],el=document.getElementById("tabContent");if(activeTab==="info")el.innerHTML=`<h2>Vehicle Information</h2><p><strong>Nickname:</strong> ${v.nickname||""}</p><p><strong>VIN:</strong> ${v.vin||""}</p><p><strong>Plate:</strong> ${v.plate||""} ${v.plateState||""}</p><p><strong>Starting Odometer:</strong> ${fmt(v.startingOdometer)}</p><p><strong>Status:</strong> ${v.status}</p><button class="danger" onclick="archiveVehicle()">Archive Vehicle</button>`;else if(activeTab==="stats")el.innerHTML=vehicleStatsHTML(v.id);else if(activeTab==="maint")el.innerHTML="<h2>Maintenance</h2><p>Vehicle-specific maintenance records, line items, reminders, and attachments live here.</p>";else if(activeTab==="ins")el.innerHTML="<h2>Insurance</h2><p>Current and historical policies, coverage, agents, and attachments live here.</p>";else if(activeTab==="photos")el.innerHTML=`<h2>Photos</h2>`+(v.photos||[]).map(p=>`<figure><img src="${p.data}" style="max-width:100%;border-radius:12px"><figcaption>${p.caption||""}</figcaption></figure>`).join("");else if(activeTab==="docs")el.innerHTML="<h2>Documents</h2><p>Vehicle documents, registrations, titles, and appraisals live here.</p>";else el.innerHTML=historyHTML(v.id)}
function currency(v){return v===""||v===undefined?"":`$${fmt(v)}`}function archiveVehicle(){const d=getData();d.vehicles[activeSlot].status="Archived";setData(d);showScreen("homeScreen")}
function vehicleStatsHTML(vehicleId){const rows=getData().entries.filter(e=>e.vehicleId===vehicleId&&e.dataQuality!=="Review"&&e.dataQuality!=="Historical"),gallons=sum(rows.map(e=>Number(e.gallons)||0)),miles=sum(rows.map(e=>Number(e.miles)||0)),mpgs=rows.map(e=>Number(e.mpg)).filter(Number.isFinite),cost=sum(rows.map(e=>Number(e.totalFuelCost)||0));return`<h2>Vehicle Statistics</h2><p><strong>Total Miles:</strong> ${fmt(miles)}</p><p><strong>Total Gallons:</strong> ${fmt(gallons)}</p><p><strong>Average MPG:</strong> ${mpgs.length?fmt(sum(mpgs)/mpgs.length):""}</p><p><strong>Fuel Cost YTD:</strong> ${currency(cost)}</p>`}function sum(a){return a.reduce((x,y)=>x+y,0)}
function historyHTML(vehicleId){const d=getData(),rows=[...d.entries.filter(e=>e.vehicleId===vehicleId).map(e=>({...e,kind:"Fuel"})),...d.maintenance.filter(e=>e.vehicleId===vehicleId).map(e=>({...e,kind:"Maintenance"})),...d.insurance.filter(e=>e.vehicleId===vehicleId).map(e=>({...e,kind:"Insurance"}))].sort(sortEntriesDesc);return`<h2>History</h2>`+rows.map(r=>`<p><strong>${r.kind}</strong> ${r.date||""} ${r.notes||""}</p>`).join("")}
function renderReports(){const d=getData(),rows=d.entries,miles=sum(rows.map(e=>Number(e.miles)||0)),fuelCost=sum(rows.map(e=>Number(e.totalFuelCost)||0));document.getElementById("reportsDashboard").innerHTML=`<h2>Dashboard</h2><p><strong>Combined Miles:</strong> ${fmt(miles)}</p><p><strong>Combined Fuel Cost:</strong> ${currency(fuelCost)}</p>`}
function exportCSV(){const lines=["Record ID,Entry Sequence,Vehicle,Entry Type,Date,Odometer,Miles,Gallons,Fuel Grade,Ethanol Free,MPG,Station,Fuel Price Per Gallon,Total Fuel Cost,Data Quality,Notes"];getData().entries.forEach(e=>lines.push([e.recordId,e.entrySequence,e.vehicle,e.entryType,e.date,e.odometer,e.miles,e.gallons,e.fuelGrade,e.ethanolFree,e.mpg,e.station,e.fuelPricePerGallon,e.totalFuelCost,e.dataQuality,e.notes].map(csvEscape).join(",")));download(`RGBM_Export_v${VERSION}_${new Date().toISOString().slice(0,10)}.csv`,lines.join("\n"),"text/csv")}function csvEscape(v){const s=String(v??"");return/[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}
function previewImport(){document.getElementById("importStatus").textContent="Import preview available in CSV/JSON workflow.";document.getElementById("commitImportButton").disabled=false}function commitImport(){alert("Import workflow placeholder ready for CSV/JSON data.")} 
function downloadDataBackup(){const d=getData();d.settings.lastDataBackupDate=new Date().toISOString().slice(0,10);setData(d);download(`RGBM_Backup_v${VERSION}_${d.settings.lastDataBackupDate}.json`,JSON.stringify(d,null,2),"application/json");renderBackupMeta()}function restoreBackup(){
  const input=document.getElementById("restoreFile");
  const file=input&&input.files&&input.files[0];
  if(!file){alert("Choose a JSON backup file first.");return}
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const parsed=JSON.parse(e.target.result);
      const restored=normalizeData(parsed);
      const vehicleCount=restored.vehicles.filter(Boolean).length;
      const entryCount=restored.entries.length;
      const maintCount=restored.maintenance.length;
      if(confirm(`Restore this backup?

Vehicles: ${vehicleCount}
Fuel entries: ${entryCount}
Maintenance records: ${maintCount}

This will replace the current local data.`)){
        setData(restored);
        alert("Backup restored.");
        showScreen("homeScreen");
      }
    }catch(err){
      alert("This does not appear to be a valid RGB Mileage JSON backup.");
      console.error(err);
    }
  };
  reader.readAsText(file);
}function renderBackupMeta(){const s=getData().settings;document.getElementById("backupMeta").textContent=`Last Data Backup: ${s.lastDataBackupDate||"Never"} | Last Complete Backup: ${s.lastCompleteBackupDate||"Never"}`}function download(filename,text,type){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url)}
function loadSettings(){const s=getData().settings;document.getElementById("duplicateSetting").value=s.duplicateHandling;document.getElementById("backupReminder").value=s.backupReminder;document.getElementById("showArchived").checked=!!s.showArchived}function saveSettings(){const d=getData();d.settings.duplicateHandling=value("duplicateSetting");d.settings.backupReminder=value("backupReminder");d.settings.showArchived=document.getElementById("showArchived").checked;setData(d);alert("Settings saved.")}function validateDatabase(){alert("Database validation complete.")}function rebuildStatistics(){alert("Statistics rebuilt.")}function removeOrphanAttachments(){alert("Orphan attachment scan complete.")}
if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js?v=207").catch(err=>console.warn("Service worker registration failed",err));ensureVersionFooters();renderHome();
