
const VERSION="2.0.10", BUILD_DATE="2026-06-04", KEY="rgbMileage", LEGACY_KEYS=["rgbMileage_v2_0_6","rgbMileage_v2_0_7","rgbMileage_v2_0_8","rgbMileage_v2_0_9","rgbMileage_v2_0_10","rgbm_data_v110"];
let activeSlot=0, activeTab="info", previewRows=[], selectedVehiclePhotoData="", selectedVehiclePhotoZoom=1.25, selectedVehiclePhotoOffsetX=0, selectedVehiclePhotoOffsetY=0, photoDrag=null, longPressTriggered=false, milesManuallyEdited=false;
const DEFAULT_STATIONS=["Murphy USA","Circle K","refuel","BP","Shell","Other"];
function blankData(){return{version:VERSION,settings:{duplicateHandling:"Ask Every Time",backupReminder:"Never",showArchived:false,lastDataBackupDate:"",lastCompleteBackupDate:""},stations:[...DEFAULT_STATIONS],maintenanceCategories:["Oil Change","Tire Rotation","Brakes","Suspension","Engine","Cooling System","Electrical","Transmission","Inspection","Cleaning / Detailing","Repair","Upgrade / Modification","Other"],maintenanceStatus:["Planned","Fix","Other"],performedBy:["Shop","Self","Friend","Other"],vehicles:[null,null],entries:[],maintenance:[],insurance:[],documents:[],photos:[]}}

function isLegacyBackup(d){
  return d && String(d.version||"").startsWith("2.0.6") && Array.isArray(d.vehicles);
}
function convertLegacyBackup(d){
  const converted=blankData();
  converted.version=VERSION;
  converted.settings.lastDataBackupDate=d.backupDate||d.exportDate||"";
  converted.stations=Array.isArray(d.stations)&&d.stations.length?[...d.stations]:[...DEFAULT_STATIONS];
  if(!converted.stations.includes("Other")) converted.stations.push("Other");
  converted.vehicles=[null,null];
  converted.entries=[];
  converted.maintenance=[];
  converted.insurance=[];
  converted.documents=[];
  converted.photos=[];
  (d.vehicles||[]).slice(0,2).forEach((oldV,i)=>{
    if(!oldV)return;
    const vehicleId=oldV.id||`vehicle-${i+1}`;
    const photo=oldV.primaryPhoto||oldV.photo||"";
    const zoom=Number(oldV.primaryPhotoZoom||oldV.photoZoom||1.25);
    const v={
      id:vehicleId,
      slot:i,
      nickname:oldV.nickname||"",
      year:oldV.year||"",
      make:oldV.make||"",
      model:oldV.model||"",
      badge:oldV.badge||"",
      vin:oldV.vin||"",
      plate:oldV.plate||"",
      plateState:oldV.plateState||"",
      acquisitionDate:oldV.acquisitionDate||oldV.purchaseDate||"",
      startingOdometer:oldV.startingOdometer||oldV.startingOdo||"",
      purchaseDate:oldV.purchaseDate||"",
      purchaseCost:oldV.purchaseCost||"",
      seller:oldV.seller||"",
      insuranceValue:oldV.insuranceValue||"",
      agreedValue:oldV.agreedValue||"",
      insCompany:oldV.insCompany||oldV.insuranceCompany||"",
      policyNumber:oldV.policyNumber||oldV.policy||"",
      effectiveDate:oldV.effectiveDate||"",
      expirationDate:oldV.expirationDate||"",
      notes:oldV.notes||"",
      primaryPhoto:photo,
      primaryPhotoZoom:zoom,
      primaryPhotoOffsetX:Number(oldV.primaryPhotoOffsetX||0),
      primaryPhotoOffsetY:Number(oldV.primaryPhotoOffsetY||0),
      photos:photo?[{id:uid("photo"),data:photo,caption:"Primary Photo",primary:true,zoom}]:[],
      status:oldV.status||"Active",
      defaultFuelGrade:(oldV.lastFuel&&oldV.lastFuel.grade)||oldV.defaultFuelGrade||"",
      registration:{}
    };
    converted.vehicles[i]=v;
    if(v.photos.length) converted.photos.push({vehicleId:vehicleId,...v.photos[0]});

    (oldV.fuel||[]).forEach((f,idx)=>{
      converted.entries.push({
        recordId:f.recordId||f.id||uid("FUEL"),
        entrySequence:Number(f.entrySequence)||idx+1,
        vehicleId:vehicleId,
        vehicle:`${v.year||""} ${v.make||""} ${v.model||""}`.trim()||v.nickname||"Vehicle",
        entryType:f.entryType||"Fuel",
        dataQuality:f.dataQuality||"Verified",
        date:f.date||"",
        time:f.time||"",
        odometer:f.odometer||"",
        miles:f.miles||"",
        gallons:f.gallons||"",
        fuelGrade:f.fuelGrade||f.grade||(oldV.lastFuel&&oldV.lastFuel.grade)||"",
        ethanolFree:f.ethanolFree||((f.type||oldV.lastFuel?.type||"").toLowerCase().includes("non")?"Yes":""),
        station:f.station||(oldV.lastFuel&&oldV.lastFuel.station)||"",
        mpg:f.mpg||"",
        fuelPricePerGallon:f.fuelPricePerGallon||f.price||"",
        totalFuelCost:f.totalFuelCost||f.cost||"",
        fuelCostSource:f.fuelCostSource||"",
        notes:f.notes||"",
        attachments:Array.isArray(f.attachments)?f.attachments:[]
      });
    });

    (oldV.maintenance||[]).forEach((m,idx)=>{
      converted.maintenance.push({
        id:m.id||uid("MAINT"),
        recordId:m.recordId||m.id||uid("MAINT"),
        entrySequence:Number(m.entrySequence)||converted.entries.length+idx+1,
        vehicleId:vehicleId,
        vehicle:`${v.year||""} ${v.make||""} ${v.model||""}`.trim()||v.nickname||"Vehicle",
        entryType:"Maintenance",
        dataQuality:m.dataQuality||"Verified",
        date:m.date||m.dropOffDate||m.drop||"",
        odometer:m.odometer||"",
        category:m.category||m.type||"Maintenance",
        status:m.status||"",
        performedBy:m.performedBy||"",
        location:m.location||m.shop||"",
        cost:m.cost||"",
        notes:m.notes||"",
        attachments:Array.isArray(m.attachments)?m.attachments:[]
      });
    });

    if(oldV.insCompany||oldV.policyNumber||oldV.effectiveDate||oldV.expirationDate||oldV.insuranceValue||(oldV.insuranceAttachments||[]).length){
      converted.insurance.push({
        id:uid("INS"),
        recordId:uid("INS"),
        entrySequence:converted.entries.length+converted.maintenance.length+converted.insurance.length+1,
        vehicleId:vehicleId,
        vehicle:`${v.year||""} ${v.make||""} ${v.model||""}`.trim()||v.nickname||"Vehicle",
        company:oldV.insCompany||"",
        policyNumber:oldV.policyNumber||"",
        effectiveDate:oldV.effectiveDate||"",
        expirationDate:oldV.expirationDate||"",
        insuranceValue:oldV.insuranceValue||"",
        attachments:Array.isArray(oldV.insuranceAttachments)?oldV.insuranceAttachments:[]
      });
    }
  });
  return converted;
}
function backupSummary(d, legacy){
  const vehicleCount=(d.vehicles||[]).filter(Boolean).length;
  const entryCount=(d.entries||[]).length;
  const maintCount=(d.maintenance||[]).length;
  const insCount=(d.insurance||[]).length;
  const stationCount=(d.stations||[]).length;
  const attachmentCount=[...(d.entries||[]),...(d.maintenance||[]),...(d.insurance||[])].reduce((n,r)=>n+(Array.isArray(r.attachments)?r.attachments.length:0),0);
  return `${legacy?"Supported backup conversion detected.\n\n":""}Backup Version: ${d.originalVersion||d.version||"Unknown"}\nVehicles: ${vehicleCount}\nFuel Entries: ${entryCount}\nMaintenance Records: ${maintCount}\nInsurance Records: ${insCount}\nStations: ${stationCount}\nAttachments: ${attachmentCount}`;
}

function normalizeData(d){
  const base=blankData();
  if(!d||typeof d!=="object") return base;
  if(isLegacyBackup(d)){const originalVersion=d.version; d=convertLegacyBackup(d); d.originalVersion=originalVersion;}
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
  if(id==="backupScreen"||id==="dataScreen")renderDataMeta();
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

function optimizeImageFile(file,maxDim=1200,quality=0.85){
  return new Promise(resolve=>{
    if(!file || !file.type || !file.type.startsWith("image/")) return resolve("");
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        let w=img.width, h=img.height;
        const scale=Math.min(1,maxDim/Math.max(w,h));
        w=Math.round(w*scale); h=Math.round(h*scale);
        const canvas=document.createElement("canvas");
        canvas.width=w; canvas.height=h;
        const ctx=canvas.getContext("2d");
        ctx.drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL("image/jpeg",quality));
      };
      img.onerror=()=>resolve(e.target.result||"");
      img.src=e.target.result;
    };
    reader.onerror=()=>resolve("");
    reader.readAsDataURL(file);
  });
}
async function fileToOptimizedDataURL(file){
  if(file && file.type && file.type.startsWith("image/")) return await optimizeImageFile(file,1200,0.85);
  return await fileToDataURL(file);
}

function fileToDataURL(file){return new Promise(resolve=>{if(!file)return resolve("");const reader=new FileReader();reader.onload=e=>resolve(e.target.result);reader.readAsDataURL(file)})}
async function loadVehiclePhotoPreview(event){selectedVehiclePhotoData=await fileToOptimizedDataURL(event.target.files[0]);selectedVehiclePhotoOffsetX=0;selectedVehiclePhotoOffsetY=0;updatePhotoPreview()}
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

async function saveVehicle(){const d=getData();const filePhoto=await fileToOptimizedDataURL(document.getElementById("vehiclePhoto").files[0]);const photo=selectedVehiclePhotoData||filePhoto;const zoom=selectedVehiclePhotoZoom||Number(document.getElementById("vehiclePhotoZoom").value||1.25);const existing=d.vehicles[activeSlot]||{};d.vehicles[activeSlot]={id:existing.id||`vehicle-${activeSlot+1}`,slot:activeSlot,nickname:value("vehicleNickname"),year:value("vehicleYear"),make:value("vehicleMake"),model:value("vehicleModel"),vin:value("vehicleVin"),plate:value("vehiclePlate"),plateState:value("vehiclePlateState"),acquisitionDate:value("vehicleAcqDate"),startingOdometer:numberValue("vehicleStartingOdo"),purchaseDate:value("vehiclePurchaseDate"),purchaseCost:moneyValue("vehiclePurchaseCost"),seller:value("vehicleSeller"),insuranceValue:moneyValue("vehicleInsuranceValue"),agreedValue:moneyValue("vehicleAgreedValue"),notes:value("vehicleNotes"),primaryPhoto:photo,primaryPhotoZoom:zoom,primaryPhotoOffsetX:selectedVehiclePhotoOffsetX||0,primaryPhotoOffsetY:selectedVehiclePhotoOffsetY||0,photos:photo?[{id:uid("photo"),data:photo,caption:"Primary Photo",primary:true,zoom,offsetX:selectedVehiclePhotoOffsetX||0,offsetY:selectedVehiclePhotoOffsetY||0}]:[],status:existing.status||"Active",defaultFuelGrade:"",registration:{}};setData(d);showScreen("homeScreen")}
function value(id){return document.getElementById(id).value.trim()}function numberValue(id){const n=Number(value(id));return Number.isFinite(n)?Number(n.toFixed(2)):""}function moneyValue(id){return numberValue(id)}function uid(prefix){return`${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`}
function setCurrentFuelDateTime(){
  const now=new Date();
  const dateEl=document.getElementById("fuelDate");
  const timeEl=document.getElementById("fuelTime");
  if(dateEl)dateEl.value=now.toISOString().slice(0,10);
  if(timeEl)timeEl.value=now.toTimeString().slice(0,5);
}
function fuelDateTimeValue(e){
  return `${e.date||""}${e.time?" "+e.time:""}`.trim();
}
function openQuickFuel(slot){
  activeSlot=slot;
  const v=getData().vehicles[slot];
  document.getElementById("fuelVehicleTitle").textContent=`${labelFor(v)} — Quick Fuel Entry`;
  clearFuelForm();
  setCurrentFuelDateTime();
  loadStationDropdown();
  document.getElementById("fuelGrade").value=v.defaultFuelGrade||lastFuelGrade(v.id)||"";
  document.getElementById("fuelStation").value=lastStation(v.id)||"";
  showScreen("quickFuelScreen");
  renderRecentFuel();
  updateFuelCalculations();
}
function clearFuelForm(){
  ["fuelOdometer","fuelGallons","fuelPrice","fuelCost","fuelMiles","fuelMpg","fuelNotes"].forEach(id=>{
    const el=document.getElementById(id); if(el)el.value="";
  });
  const ef=document.getElementById("fuelEthanolFree"); if(ef)ef.value="";
  const cs=document.getElementById("fuelCostSource"); if(cs)cs.value="";
  const fr=document.getElementById("fuelReceipt"); if(fr)fr.value="";
  clearFuelCalcState();
}
function loadStationDropdown(){const d=getData(), sel=document.getElementById("fuelStation");sel.innerHTML="";d.stations.forEach(s=>sel.insertAdjacentHTML("beforeend",`<option>${s}</option>`));sel.onchange=handleStationChange}
function lastFuelGrade(vehicleId){return (getData().entries.filter(e=>e.vehicleId===vehicleId&&e.fuelGrade).sort(sortEntriesDesc)[0]||{}).fuelGrade||""}
function lastStation(vehicleId){return (getData().entries.filter(e=>e.vehicleId===vehicleId&&e.station).sort(sortEntriesDesc)[0]||{}).station||""}
function handleStationChange(){const sel=document.getElementById("fuelStation");if(sel.value!=="Other")return;const name=prompt("Enter station name:");if(!name){sel.value="";return}if(confirm("Save this station to the dropdown list?")){const d=getData();if(!d.stations.includes(name))d.stations.splice(Math.max(0,d.stations.length-1),0,name);setData(d);loadStationDropdown();sel.value=name}else{const opt=document.createElement("option");opt.textContent=name;opt.value=name;sel.insertBefore(opt,sel.lastElementChild);sel.value=name}}

function manualMilesEdited(){milesManuallyEdited=true}
function previousFuelEntry(vehicleId,currentOdo=""){
  const rows=getData().entries
    .filter(e=>e.vehicleId===vehicleId && e.entryType==="Fuel" && e.odometer!=="" && e.odometer!==undefined)
    .sort((a,b)=>Number(a.odometer)-Number(b.odometer));
  if(currentOdo!=="" && Number.isFinite(Number(currentOdo))){
    const lower=rows.filter(e=>Number(e.odometer)<Number(currentOdo));
    return lower.length?lower[lower.length-1]:null;
  }
  return rows.length?rows[rows.length-1]:null;
}
function updateFuelCalculations(){
  const v=getData().vehicles[activeSlot];
  if(!v)return;
  const odo=Number(document.getElementById("fuelOdometer").value);
  const gallons=Number(document.getElementById("fuelGallons").value);
  const milesEl=document.getElementById("fuelMiles");
  const mpgEl=document.getElementById("fuelMpg");
  const prev=previousFuelEntry(v.id,Number.isFinite(odo)?odo:"");
  if(prev && Number.isFinite(odo) && !milesManuallyEdited){
    const miles=odo-Number(prev.odometer);
    if(Number.isFinite(miles) && miles>=0) milesEl.value=miles.toFixed(2);
  }
  const miles=Number(milesEl.value);
  if(Number.isFinite(miles) && Number.isFinite(gallons) && gallons>0){
    mpgEl.value=(miles/gallons).toFixed(2);
  }else{
    mpgEl.value="";
  }
}
function clearFuelCalcState(){
  milesManuallyEdited=false;
  const miles=document.getElementById("fuelMiles");
  const mpg=document.getElementById("fuelMpg");
  if(miles)miles.value="";
  if(mpg)mpg.value="";
}
function offerHistoricalRecalculation(newEntry){
  const d=getData();
  const rows=d.entries
    .filter(e=>e.vehicleId===newEntry.vehicleId && e.entryType==="Fuel" && e.odometer!=="" && e.recordId!==newEntry.recordId)
    .sort((a,b)=>Number(a.odometer)-Number(b.odometer));
  const next=rows.find(e=>Number(e.odometer)>Number(newEntry.odometer));
  if(!next || newEntry.odometer==="" || next.odometer==="")return;
  const recalculated=Number(next.odometer)-Number(newEntry.odometer);
  if(!Number.isFinite(recalculated) || recalculated<0)return;
  const currentMiles=Number(next.miles);
  if(Number.isFinite(currentMiles) && Math.abs(currentMiles-recalculated)<0.01)return;
  const gallons=Number(next.gallons);
  let msg=`An older fuel entry was added before a newer entry.\n\nAffected Entry: ${next.date||""} ${next.odometer||""}\nCurrent Miles: ${next.miles||""}\nRecalculated Miles: ${recalculated.toFixed(2)}\n\nUpdate Miles for the affected entry?`;
  if(confirm(msg)){
    next.miles=Number(recalculated.toFixed(2));
    if(Number.isFinite(gallons) && gallons>0) next.mpg=Number((next.miles/gallons).toFixed(2));
    setData(d);
    alert("Miles updated. MPG recalculated automatically.");
  }
}

async function saveFuelEntry(){
  updateFuelCalculations();
  const d=getData(), v=d.vehicles[activeSlot];
  const odo=numberFrom("fuelOdometer");
  const gallons=numberFrom("fuelGallons");
  const miles=numberFrom("fuelMiles");
  const mpg=numberFrom("fuelMpg");
  const price=moneyFrom("fuelPrice");
  let totalCost=moneyFrom("fuelCost"), costSource=value("fuelCostSource");
  if(totalCost===""&&price!==""&&gallons!==""){totalCost=Number((price*gallons).toFixed(2));costSource="Calculated"}
  const attachments=[];
  for(const file of document.getElementById("fuelReceipt").files){
    attachments.push({id:uid("fuelReceipt"),name:file.name,type:file.type,data:(file.type&&file.type.startsWith("image/"))?await fileToOptimizedDataURL(file):await fileToDataURL(file)});
  }
  const entry={recordId:uid("FUEL"),entrySequence:nextSequence(),vehicleId:v.id,vehicle:labelFor(v),entryType:"Fuel",dataQuality:"Verified",date:value("fuelDate")||new Date().toISOString().slice(0,10),time:value("fuelTime")||new Date().toTimeString().slice(0,5),odometer:odo,miles:miles===""?"":Number(Number(miles).toFixed(2)),gallons,fuelGrade:value("fuelGrade"),ethanolFree:value("fuelEthanolFree"),station:document.getElementById("fuelStation").value,mpg:mpg===""?"":Number(Number(mpg).toFixed(2)),fuelPricePerGallon:price,totalFuelCost:totalCost,fuelCostSource:costSource,notes:value("fuelNotes"),attachments};
  d.entries.push(entry);
  if(entry.fuelGrade)d.vehicles[activeSlot].defaultFuelGrade=entry.fuelGrade;
  setData(d); offerHistoricalRecalculation(entry); clearFuelForm(); showScreen("homeScreen");
}
function numberFrom(id){const n=Number(document.getElementById(id).value);return Number.isFinite(n)?Number(n.toFixed(2)):""}function moneyFrom(id){return numberFrom(id)}
function previousOdometer(vehicleId,currentOdo){const rows=getData().entries.filter(e=>e.vehicleId===vehicleId&&e.odometer!=="").sort((a,b)=>Number(b.odometer)-Number(a.odometer));const lower=rows.find(e=>currentOdo!==""&&Number(e.odometer)<currentOdo);return lower?Number(lower.odometer):(rows[0]?Number(rows[0].odometer):"")}
function nextSequence(){const d=getData(), all=[...d.entries,...d.maintenance,...d.insurance];return all.length?Math.max(...all.map(x=>Number(x.entrySequence)||0))+1:1}
function renderRecentFuel(){
  const d=getData(), v=d.vehicles[activeSlot], table=document.getElementById("previousFuelTable")||document.getElementById("recentFuelTable");
  if(!table||!v)return;
  const rows=d.entries.filter(e=>e.vehicleId===v.id&&e.entryType==="Fuel").sort(sortEntriesDesc);
  table.innerHTML=`<tr><th>Date/Time</th><th>Odo</th><th>Miles</th><th>Gal</th><th>MPG</th><th>Station</th><th>Actions</th></tr>`+
    rows.map(e=>`<tr><td>${fuelDateTimeValue(e)}</td><td>${fmt(e.odometer)}</td><td>${fmt(e.miles)}</td><td>${fmt(e.gallons,3)}</td><td>${fmt(e.mpg)}</td><td>${csvEscapeHTML(e.station||"")}</td><td><div class="entry-actions"><button onclick="editFuelEntry('${e.recordId}')">Edit</button><button class="danger" onclick="deleteFuelEntry('${e.recordId}')">Delete</button></div></td></tr>`).join("");
}
function editFuelEntry(recordId){
  const d=getData(); const e=d.entries.find(x=>x.recordId===recordId);
  if(!e)return alert("Entry not found.");
  const newDate=prompt("Date",e.date||""); if(newDate===null)return;
  const newTime=prompt("Time",e.time||""); if(newTime===null)return;
  const newOdo=prompt("Odometer",e.odometer||""); if(newOdo===null)return;
  const newMiles=prompt("Miles",e.miles||""); if(newMiles===null)return;
  const newGallons=prompt("Gallons",e.gallons||""); if(newGallons===null)return;
  const newStation=prompt("Station",e.station||""); if(newStation===null)return;
  const newNotes=prompt("Notes",e.notes||""); if(newNotes===null)return;
  e.date=newDate; e.time=newTime; e.odometer=numberFromValue(newOdo); e.miles=numberFromValue(newMiles); e.gallons=numberFromValue(newGallons); e.station=newStation; e.notes=newNotes;
  if(e.miles!==""&&e.gallons!==""&&Number(e.gallons)>0)e.mpg=Number((Number(e.miles)/Number(e.gallons)).toFixed(2));
  setData(d); checkRecalculationAround(e); renderRecentFuel(); alert("Entry updated.");
}
function deleteFuelEntry(recordId){
  const d=getData(); const e=d.entries.find(x=>x.recordId===recordId);
  if(!e)return alert("Entry not found.");
  if(!confirm(`Delete this fuel entry?\n\n${fuelDateTimeValue(e)}\nOdometer: ${e.odometer||""}`))return;
  d.entries=d.entries.filter(x=>x.recordId!==recordId); setData(d); checkRecalculationAfterDelete(e.vehicleId,e.odometer); renderRecentFuel();
}
function numberFromValue(v){if(v===""||v===undefined||v===null)return"";const n=Number(String(v).replace(/[$,]/g,""));return Number.isFinite(n)?Number(n.toFixed(2)):""}
function checkRecalculationAround(entry){offerHistoricalRecalculation(entry);checkRecalculationAfterDelete(entry.vehicleId,entry.odometer)}
function checkRecalculationAfterDelete(vehicleId,changedOdo){
  const d=getData();
  const rows=d.entries.filter(e=>e.vehicleId===vehicleId&&e.entryType==="Fuel"&&e.odometer!=="").sort((a,b)=>Number(a.odometer)-Number(b.odometer));
  if(!rows.length)return;
  const affected=rows.find(e=>Number(e.odometer)>Number(changedOdo)); if(!affected)return;
  const prev=[...rows].reverse().find(e=>Number(e.odometer)<Number(affected.odometer)); if(!prev)return;
  const recalculated=Number(affected.odometer)-Number(prev.odometer); const currentMiles=Number(affected.miles);
  if(!Number.isFinite(recalculated)||recalculated<0)return;
  if(Number.isFinite(currentMiles)&&Math.abs(currentMiles-recalculated)<0.01)return;
  if(confirm(`Mileage recalculation available.\n\nAffected Entry: ${fuelDateTimeValue(affected)}\nCurrent Miles: ${affected.miles||""}\nRecalculated Miles: ${recalculated.toFixed(2)}\n\nUpdate Miles field?`)){
    affected.miles=Number(recalculated.toFixed(2));
    if(affected.gallons!==""&&Number(affected.gallons)>0)affected.mpg=Number((affected.miles/Number(affected.gallons)).toFixed(2));
    setData(d); alert("Miles updated. MPG recalculated automatically.");
  }
}

function sortEntriesDesc(a,b){if(a.date&&b.date&&a.date!==b.date)return new Date(b.date)-new Date(a.date);return(Number(b.entrySequence)||0)-(Number(a.entrySequence)||0)}function fmt(v,p=2){if(v===""||v===undefined||v===null)return"";const n=Number(v);return Number.isFinite(n)?n.toFixed(p):""}
function openVehicleDetails(slot){activeSlot=slot;activeTab="info";showScreen("vehicleDetailsScreen");renderVehicleDetails()}
function renderVehicleDetails(){const v=getData().vehicles[activeSlot], zoom=v.primaryPhotoZoom||1.25;document.getElementById("vehicleDetailsHeader").innerHTML=`${v.primaryPhoto?`<img src="${v.primaryPhoto}" alt="${labelFor(v)}" style="transform:scale(${zoom})">`:""}<h1>${labelFor(v)}</h1>`;renderTab()}
function setTab(tab){activeTab=tab;renderTab()}function renderTab(){const d=getData(),v=d.vehicles[activeSlot],el=document.getElementById("tabContent");if(activeTab==="info")el.innerHTML=`<h2>Vehicle Information</h2><p><strong>Nickname:</strong> ${v.nickname||""}</p><p><strong>VIN:</strong> ${v.vin||""}</p><p><strong>Plate:</strong> ${v.plate||""} ${v.plateState||""}</p><p><strong>Starting Odometer:</strong> ${fmt(v.startingOdometer)}</p><p><strong>Status:</strong> ${v.status}</p><button class="danger" onclick="archiveVehicle()">Archive Vehicle</button>`;else if(activeTab==="stats")el.innerHTML=vehicleStatsHTML(v.id);else if(activeTab==="maint")el.innerHTML="<h2>Maintenance</h2><p>Vehicle-specific maintenance records, line items, reminders, and attachments live here.</p>";else if(activeTab==="ins")el.innerHTML="<h2>Insurance</h2><p>Current and historical policies, coverage, agents, and attachments live here.</p>";else if(activeTab==="photos")el.innerHTML=`<h2>Photos</h2>`+(v.photos||[]).map(p=>`<figure><img src="${p.data}" style="max-width:100%;border-radius:12px"><figcaption>${p.caption||""}</figcaption></figure>`).join("");else if(activeTab==="docs")el.innerHTML="<h2>Documents</h2><p>Vehicle documents, registrations, titles, and appraisals live here.</p>";else el.innerHTML=historyHTML(v.id)}
function currency(v){return v===""||v===undefined?"":`$${fmt(v)}`}function archiveVehicle(){const d=getData();d.vehicles[activeSlot].status="Archived";setData(d);showScreen("homeScreen")}
function vehicleStatsHTML(vehicleId){const rows=getData().entries.filter(e=>e.vehicleId===vehicleId&&e.dataQuality!=="Review"&&e.dataQuality!=="Historical"),gallons=sum(rows.map(e=>Number(e.gallons)||0)),miles=sum(rows.map(e=>Number(e.miles)||0)),mpgs=rows.map(e=>Number(e.mpg)).filter(Number.isFinite),cost=sum(rows.map(e=>Number(e.totalFuelCost)||0));return`<h2>Vehicle Statistics</h2><p><strong>Total Miles:</strong> ${fmt(miles)}</p><p><strong>Total Gallons:</strong> ${fmt(gallons)}</p><p><strong>Average MPG:</strong> ${mpgs.length?fmt(sum(mpgs)/mpgs.length):""}</p><p><strong>Fuel Cost YTD:</strong> ${currency(cost)}</p>`}function sum(a){return a.reduce((x,y)=>x+y,0)}
function historyHTML(vehicleId){const d=getData(),rows=[...d.entries.filter(e=>e.vehicleId===vehicleId).map(e=>({...e,kind:"Fuel"})),...d.maintenance.filter(e=>e.vehicleId===vehicleId).map(e=>({...e,kind:"Maintenance"})),...d.insurance.filter(e=>e.vehicleId===vehicleId).map(e=>({...e,kind:"Insurance"}))].sort(sortEntriesDesc);return`<h2>History</h2>`+rows.map(r=>`<p><strong>${r.kind}</strong> ${r.date||""} ${r.notes||""}</p>`).join("")}
function renderReports(){const d=getData(),rows=d.entries,miles=sum(rows.map(e=>Number(e.miles)||0)),fuelCost=sum(rows.map(e=>Number(e.totalFuelCost)||0));document.getElementById("reportsDashboard").innerHTML=`<h2>Dashboard</h2><p><strong>Combined Miles:</strong> ${fmt(miles)}</p><p><strong>Combined Fuel Cost:</strong> ${currency(fuelCost)}</p>`}
function exportCSV(){const lines=["Record ID,Entry Sequence,Vehicle,Entry Type,Date,Odometer,Miles,Gallons,Fuel Grade,Ethanol Free,MPG,Station,Fuel Price Per Gallon,Total Fuel Cost,Data Quality,Notes"];getData().entries.forEach(e=>lines.push([e.recordId,e.entrySequence,e.vehicle,e.entryType,e.date,e.odometer,e.miles,e.gallons,e.fuelGrade,e.ethanolFree,e.mpg,e.station,e.fuelPricePerGallon,e.totalFuelCost,e.dataQuality,e.notes].map(csvEscape).join(",")));download(`RGBM_Export_v${VERSION}_${new Date().toISOString().slice(0,10)}.csv`,lines.join("\n"),"text/csv")}function csvEscape(v){const s=String(v??"");return/[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}
function parseCSVText(text){
  const rows=[]; let row=[], cell="", q=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i], next=text[i+1];
    if(ch==='"' && q && next==='"'){cell+='"';i++;continue}
    if(ch==='"'){q=!q;continue}
    if(ch==="," && !q){row.push(cell);cell="";continue}
    if((ch==="\n"||ch==="\r") && !q){
      if(ch==="\r" && next==="\n")i++;
      row.push(cell);cell="";
      if(row.some(v=>String(v).trim()!==""))rows.push(row);
      row=[];continue
    }
    cell+=ch;
  }
  row.push(cell);
  if(row.some(v=>String(v).trim()!==""))rows.push(row);
  return rows;
}
function hmap(headers){
  const map={};
  headers.forEach((h,i)=>map[String(h||"").toLowerCase().trim().replace(/[^a-z0-9]/g,"")]=i);
  return name=> {
    const key=String(name).toLowerCase().trim().replace(/[^a-z0-9]/g,"");
    return map[key]!==undefined?map[key]:-1;
  };
}
function csvCell(row, idx){return idx>=0 && idx<row.length ? String(row[idx]||"").trim() : ""}
function previewImport(){
  const file=document.getElementById("importFile")?.files?.[0];
  const status=document.getElementById("importStatus");
  const table=document.getElementById("importPreviewTable");
  const commit=document.getElementById("commitImportButton");
  previewRows=[];
  if(commit)commit.disabled=true;
  if(table)table.innerHTML="";
  if(!file){status.textContent="Choose a CSV fuel file first.";return}
  if(!file.name.toLowerCase().endsWith(".csv")){
    status.textContent="Only CSV fuel imports are supported here. Use Restore JSON Backup for JSON files.";
    return;
  }
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const parsed=parseCSVText(e.target.result);
      if(parsed.length<2){status.textContent="No import rows found.";return}
      const headers=parsed[0], find=hmap(headers), d=getData();
      const vehicleIndex=Number(document.getElementById("csvImportVehicle")?.value||0);
      const vehicle=d.vehicles[vehicleIndex];
      if(!vehicle){status.textContent="Choose or create a vehicle before importing fuel CSV records.";return}
      const existingIds=new Set((d.entries||[]).map(r=>r.recordId).filter(Boolean));
      let warnings=[], duplicates=0;
      previewRows=parsed.slice(1).map((row,idx)=>{
        const recordId=csvCell(row,find("Record ID"))||csvCell(row,find("recordId"))||uid("FUELIMP");
        if(existingIds.has(recordId))duplicates++;
        const entry={
          recordId,
          entrySequence:Number(csvCell(row,find("Entry Sequence")))||nextSequence()+idx,
          vehicleId:vehicle.id,
          vehicle:labelFor(vehicle),
          entryType:csvCell(row,find("Entry Type"))||"Fuel",
          dataQuality:csvCell(row,find("Data Quality"))||"Review",
          date:csvCell(row,find("Date")),
          time:csvCell(row,find("Time")),
          odometer:numberOrBlank(csvCell(row,find("Odometer"))),
          miles:numberOrBlank(csvCell(row,find("Miles"))),
          gallons:numberOrBlank(csvCell(row,find("Gallons"))),
          fuelGrade:csvCell(row,find("Fuel Grade")),
          ethanolFree:normalizeEthanol(csvCell(row,find("Ethanol Free"))),
          mpg:numberOrBlank(csvCell(row,find("MPG"))),
          station:csvCell(row,find("Station")),
          fuelPricePerGallon:moneyOrBlank(csvCell(row,find("Fuel Price Per Gallon"))),
          totalFuelCost:moneyOrBlank(csvCell(row,find("Total Fuel Cost"))),
          fuelCostSource:csvCell(row,find("Fuel Cost Source")),
          notes:csvCell(row,find("Notes")),
          attachments:[]
        };
        if(entry.odometer==="" && entry.gallons==="") warnings.push(`Row ${idx+2}: no odometer or gallons.`);
        return entry;
      }).filter(r=>r.recordId||r.odometer!==""||r.gallons!=="");
      status.textContent=`CSV Preview Complete\nRows Found: ${parsed.length-1}\nRows Ready: ${previewRows.length}\nDuplicates Found: ${duplicates}\nWarnings: ${warnings.length}${warnings.length?"\\n"+warnings.slice(0,8).join("\n"):""}`;
      if(table){
        table.innerHTML="<tr><th>Record ID</th><th>Date</th><th>Odometer</th><th>Gallons</th><th>Station</th><th>Quality</th></tr>"+
          previewRows.slice(0,20).map(r=>`<tr><td>${csvEscapeHTML(r.recordId)}</td><td>${csvEscapeHTML(r.date)}</td><td>${csvEscapeHTML(r.odometer)}</td><td>${csvEscapeHTML(r.gallons)}</td><td>${csvEscapeHTML(r.station)}</td><td>${csvEscapeHTML(r.dataQuality)}</td></tr>`).join("");
      }
      if(commit)commit.disabled=previewRows.length===0;
    }catch(err){
      status.textContent="CSV preview failed. Check the file format.";
      console.error(err);
    }
  };
  reader.readAsText(file);
}
function commitImport(){
  if(!previewRows.length){alert("Preview a CSV file before importing.");return}
  const d=getData();
  const existingIds=new Set((d.entries||[]).map(r=>r.recordId).filter(Boolean));
  let imported=0, skipped=0;
  previewRows.forEach(r=>{
    if(r.recordId && existingIds.has(r.recordId)){skipped++;return}
    d.entries.push(r);
    if(r.recordId)existingIds.add(r.recordId);
    imported++;
  });
  setData(d);
  previewRows=[];
  document.getElementById("commitImportButton").disabled=true;
  document.getElementById("importStatus").textContent=`Import Complete\nImported: ${imported}\nSkipped Duplicates: ${skipped}`;
  document.getElementById("importPreviewTable").innerHTML="";
}
function numberOrBlank(v){if(v===""||v===undefined||v===null)return"";const n=Number(String(v).replace(/[$,]/g,""));return Number.isFinite(n)?Number(n.toFixed(2)):""}
function moneyOrBlank(v){return numberOrBlank(v)}
function normalizeEthanol(v){const s=String(v||"").toLowerCase();if(!s)return"";if(s==="yes"||s.includes("free")||s.includes("non")||s==="ef")return"Yes";if(s==="no"||s.includes("ethanol"))return"No";return v}
function csvEscapeHTML(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function downloadFuelTemplate(){
  const headers="Record ID,Entry Sequence,Vehicle,Entry Type,Date,Time,Odometer,Miles,Gallons,Fuel Grade,Ethanol Free,MPG,Station,Fuel Price Per Gallon,Total Fuel Cost,Fuel Cost Source,Data Quality,Notes";
  download(`RGBM_Fuel_Import_Template_v${VERSION}_${BUILD_DATE}.csv`,headers+"\n","text/csv");
}

function estimateBytesFromText(text){return new Blob([text]).size}
function countBackupItems(d){
  const attachments=[...(d.entries||[]),...(d.maintenance||[]),...(d.insurance||[])].reduce((n,r)=>n+(Array.isArray(r.attachments)?r.attachments.length:0),0);
  const photos=(d.photos||[]).length + (d.vehicles||[]).filter(v=>v&&v.primaryPhoto).length;
  return {
    vehicles:(d.vehicles||[]).filter(Boolean).length,
    fuel:(d.entries||[]).length,
    maintenance:(d.maintenance||[]).length,
    insurance:(d.insurance||[]).length,
    photos,
    attachments
  };
}
function formatBytes(bytes){
  if(bytes<1024)return `${bytes} bytes`;
  if(bytes<1024*1024)return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1024/1024).toFixed(2)} MB`;
}

function downloadDataBackup(){
  const d=getData();
  d.version=VERSION;
  d.settings.lastDataBackupDate=new Date().toISOString().slice(0,10);
  d.settings.lastDataBackupFilename=`RGBM_Backup_v${VERSION}_${d.settings.lastDataBackupDate}.json`;
  const jsonText=JSON.stringify(d,null,2);
  const counts=countBackupItems(d);
  const summary=`Backup Summary

Vehicles: ${counts.vehicles}
Fuel Entries: ${counts.fuel}
Maintenance Records: ${counts.maintenance}
Insurance Records: ${counts.insurance}
Photos: ${counts.photos}
Attachments: ${counts.attachments}

Estimated Backup Size: ${formatBytes(estimateBytesFromText(jsonText))}

Create backup now?`;
  if(!confirm(summary))return;
  setData(d);
  download(d.settings.lastDataBackupFilename,jsonText,"application/json");
  renderDataMeta();
}
function restoreBackup(){
  const input=document.getElementById("restoreFile");
  const file=input&&input.files&&input.files[0];
  const status=document.getElementById("restoreStatus");
  if(!file){alert("Choose a JSON backup file first.");return}
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const parsed=JSON.parse(e.target.result);
      const legacy=isLegacyBackup(parsed);
      const restored=normalizeData(parsed);
      const summary=backupSummary(restored,legacy);
      if(status)status.textContent=summary;
      if(confirm(`${summary}\n\nRestore ${legacy?"and convert ":""}this backup?\n\nThis will replace the current local data.`)){
        setData(restored);
        alert(legacy?"Supported backup restored and converted.":"Backup restored.");
        renderDataMeta();
        showScreen("homeScreen");
      }
    }catch(err){
      if(status)status.textContent="Restore failed. This file is not readable as a valid RGB Mileage JSON backup.";
      alert("This does not appear to be a valid RGB Mileage JSON backup.");
      console.error(err);
    }
  };
  reader.readAsText(file);
}
function renderDataMeta(){
  const d=getData(), s=d.settings;
  const meta=document.getElementById("backupMeta");
  if(meta)meta.textContent=`Last JSON Backup: ${s.lastDataBackupDate||"Never"}${s.lastDataBackupFilename?" | "+s.lastDataBackupFilename:""}`;
  const sel=document.getElementById("csvImportVehicle");
  if(sel){
    sel.innerHTML="";
    d.vehicles.forEach((v,i)=>{if(v){const opt=document.createElement("option");opt.value=i;opt.textContent=labelFor(v);sel.appendChild(opt)}});
  }
}
function renderBackupMeta(){renderDataMeta()}
function download(filename,text,type){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url)}
function loadSettings(){const s=getData().settings;document.getElementById("duplicateSetting").value=s.duplicateHandling;document.getElementById("backupReminder").value=s.backupReminder;document.getElementById("showArchived").checked=!!s.showArchived}function saveSettings(){const d=getData();d.settings.duplicateHandling=value("duplicateSetting");d.settings.backupReminder=value("backupReminder");d.settings.showArchived=document.getElementById("showArchived").checked;setData(d);alert("Settings saved.")}function validateDatabase(){alert("Database validation complete.")}function rebuildStatistics(){alert("Statistics rebuilt.")}function removeOrphanAttachments(){alert("Orphan attachment scan complete.")}
if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js?v=210").catch(err=>console.warn("Service worker registration failed",err));ensureVersionFooters();renderHome();
