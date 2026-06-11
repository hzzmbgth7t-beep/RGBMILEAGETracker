const APP_NAME="RGB Mileage", VERSION="2.1.3oa", SCHEMA_VERSION=VERSION, BUILD_DATE="2026-06-09", KEY="RGBM_DATA_v213d";
function formatBuildDate(d){const [y,m,day]=String(d||"").split("-");return y&&m&&day?`${day}/${m}/${String(y).slice(-2)}`:String(d||"");}
const LEGACY_KEYS=["RGBM_DATA_v213c","RGBM_DATA_v213b","RGBM_DATA_v213a","RGBM_DATA_v213","RGBM_DATA_v212d","RGBM_DATA_v212c","RGBM_DATA_v212b","RGBM_DATA_v212a","RGBM_DATA_v212","RGBM_DATA_v211","RGBM_DATA_v210","rgbMileage","rgbm_data_v110","rgbMileage_v2_0_6","rgbMileage_v2_0_7","rgbMileage_v2_0_8","rgbMileage_v2_0_9","rgbMileage_v2_0_10","rgbMileage_v2_0_11"];
const STATIONS_DEFAULT=["Murphy USA","Circle K","refuel","BP","Shell","Other"], MAINT_CATS=["Oil Change","Tire Rotation","Brakes","Cooling System","Suspension","Electrical","Engine","Transmission","Inspection","Detailing","Repair","Other"], DATA_QUALITIES=["Verified","Review","Estimated","Historical"], FUEL_GRADES=["","87","89","90","91","93","Other"];
let state, route={screen:"home"}, historyStack=[], longTimer=null, suppressTap=false;
let rowInteraction={timer:null,long:false,type:null,recordId:null};
function nowISO(){return new Date().toISOString()} function uid(p="ID"){return p+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)} function arr(v){return Array.isArray(v)?v:[]} function tags(v){return Array.isArray(v)?v:(v?[String(v)]:[])} function hasTag(r,t){return tags(r.classificationTags).includes(t)} function addTag(r,t){r.classificationTags=tags(r.classificationTags);if(!r.classificationTags.includes(t))r.classificationTags.push(t)} function numVal(v){if(v===null||v===undefined||v==="")return "";const n=Number(String(v).replace(/[$,]/g,""));return Number.isFinite(n)?n:""} function cleanText(v){return String(v??"").trim()} function requireValue(v,label){const s=cleanText(v);if(!s)throw new Error(`${label} is required.`);return s} function requireNonNegative(v,label){const n=numVal(v);if(n==="")return "";if(n<0)throw new Error(`${label} cannot be negative.`);return n} function requirePositive(v,label){const n=numVal(v);if(n==="")return "";if(n<=0)throw new Error(`${label} must be greater than zero.`);return n}



function initV213aShell(){
  try{
    document.documentElement.style.background="#0a1324";
    document.body.style.background="#0a1324";
    document.body.style.overflow="hidden";
    document.body.style.position="fixed";
    document.body.style.inset="0";
    document.body.style.width="100%";
    document.body.style.height="100dvh";
    const vp=document.querySelector("meta[name=viewport]");
    if(vp)vp.setAttribute("content","width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover");
    window.addEventListener("orientationchange",()=>setTimeout(()=>{try{render()}catch(e){}},200),{passive:true});
  }catch(e){}
}
function initV213Shell(){
  try{
    document.documentElement.style.background="#0a1324";
    document.body.style.background="#0a1324";
    document.body.style.overflow="hidden";
    document.body.style.position="fixed";
    document.body.style.inset="0";
    document.body.style.width="100%";
    document.body.style.height="100dvh";
    const vp=document.querySelector("meta[name=viewport]");
    if(vp)vp.setAttribute("content","width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover");
    window.addEventListener("orientationchange",()=>setTimeout(()=>{try{render()}catch(e){}},250),{passive:true});
    document.addEventListener("gesturestart",e=>e.preventDefault(),{passive:false});
    let lastTouchEnd=0;
    document.addEventListener("touchend",e=>{const now=Date.now();if(now-lastTouchEnd<=300)e.preventDefault();lastTouchEnd=now;},{passive:false});
  }catch(e){}
}
function clearRGBMStorage(keepCurrent=false){
  const prefixes=["RGBM_DATA_","rgbMileage","rgbm_data_"];
  const keys=[];
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(prefixes.some(p=>k&&k.startsWith(p))) keys.push(k);
  }
  keys.forEach(k=>{ if(!keepCurrent || k!==KEY) localStorage.removeItem(k); });
}
function storageBytes(obj){
  try{return new Blob([JSON.stringify(obj)]).size}
  catch(e){return JSON.stringify(obj).length}
}
function blankData(){return {fuelGrades:[...FUEL_GRADES],app:"RGB Mileage",schemaVersion:SCHEMA_VERSION,appVersion:VERSION,settings:{lastBackupDate:"",showArchived:false},nextEntrySequence:1,stations:[...STATIONS_DEFAULT],maintenanceCategories:[...MAINT_CATS],vehicles:[null,null],vehicleAcquisitionRecords:[],fuelRecords:[],maintenanceRecords:[],insuranceRecords:[],attachments:[],createdAt:nowISO(),modifiedAt:nowISO()}}

function normalizeData(input){
  const d=blankData();
  if(!input || typeof input!=="object") return d;
  d.app="RGB Mileage";
  d.schemaVersion=SCHEMA_VERSION;
  d.appVersion=VERSION;
  d.createdAt=input.createdAt||nowISO();
  d.modifiedAt=input.modifiedAt||nowISO();
  d.settings={...d.settings,...(input.settings||{})};
  d.stations=(Array.isArray(input.stations)&&input.stations.length)?input.stations.slice():[...STATIONS_DEFAULT];
  if(!d.stations.includes("Other")) d.stations.push("Other");
  d.fuelGrades=(Array.isArray(input.fuelGrades)&&input.fuelGrades.length)?input.fuelGrades.slice():[...FUEL_GRADES];
  if(!d.fuelGrades.includes("Other")) d.fuelGrades.push("Other");
  d.maintenanceCategories=(Array.isArray(input.maintenanceCategories)&&input.maintenanceCategories.length)?input.maintenanceCategories.slice():[...MAINT_CATS];
  if(!d.maintenanceCategories.includes("Other")) d.maintenanceCategories.push("Other");
  d.nextEntrySequence=Number(input.nextEntrySequence)||1;
  d.vehicles=arr(input.vehicles).slice(0,2).map((v,i)=>v?normVehicle(v,i):null);
  while(d.vehicles.length<2) d.vehicles.push(null);
  d.vehicleAcquisitionRecords=arr(input.vehicleAcquisitionRecords).map(r=>normRecord(r,"VehicleAcquisition",r.vehicleId));
  d.fuelRecords=arr(input.fuelRecords).map(r=>normFuel(r,r.vehicleId));
  d.maintenanceRecords=arr(input.maintenanceRecords).map(r=>normMaint(r,r.vehicleId));
  d.insuranceRecords=arr(input.insuranceRecords).map(r=>normIns(r,r.vehicleId));
  arr(input.entries).forEach(r=>{
    const typ=(r.recordType||r.entryType||"Fuel").toString().toLowerCase();
    if(typ.includes("maint")) d.maintenanceRecords.push(normMaint(r,r.vehicleId));
    else if(typ.includes("ins")) d.insuranceRecords.push(normIns(r,r.vehicleId));
    else d.fuelRecords.push(normFuel(r,r.vehicleId));
  });
  arr(input.maintenance).forEach(r=>d.maintenanceRecords.push(normMaint(r,r.vehicleId)));
  arr(input.maintenanceEntries).forEach(r=>d.maintenanceRecords.push(normMaint(r,r.vehicleId)));
  arr(input.serviceRecords).forEach(r=>d.maintenanceRecords.push(normMaint(r,r.vehicleId)));
  arr(input.repairs).forEach(r=>d.maintenanceRecords.push(normMaint(r,r.vehicleId)));
  arr(input.insurance).forEach(r=>d.insuranceRecords.push(normIns(r,r.vehicleId)));
  arr(input.vehicles).slice(0,2).forEach((v,i)=>{
    if(!v || !d.vehicles[i]) return;
    const vid=d.vehicles[i].vehicleId;
    const hasAcq=v.acquisitionDate||v.purchaseDate||v.startingOdometer||v.purchaseCost||v.purchasePrice||v.seller;
    if(hasAcq && !d.vehicleAcquisitionRecords.some(r=>r.vehicleId===vid)){
      d.vehicleAcquisitionRecords.push(normRecord({
        acquisitionDate:v.acquisitionDate||v.purchaseDate||"",
        purchaseDate:v.purchaseDate||v.acquisitionDate||"",
        startingOdometer:v.startingOdometer||"",
        purchasePrice:v.purchasePrice||v.purchaseCost||"",
        seller:v.seller||"",
        source:"JSON Restore",
        dataQuality:"Review",
        classificationTags:["Imported"]
      },"VehicleAcquisition",vid));
    }
    arr(v.fuel).forEach(r=>d.fuelRecords.push(normFuel({...r,source:r.source||"JSON Restore",classificationTags:r.classificationTags||["Imported"]},vid)));
    arr(v.maintenance).forEach(r=>d.maintenanceRecords.push(normMaint({...r,source:r.source||"JSON Restore",classificationTags:r.classificationTags||["Imported"]},vid)));
    arr(v.insuranceRecords).forEach(r=>d.insuranceRecords.push(normIns({...r,source:r.source||"JSON Restore",classificationTags:r.classificationTags||["Imported"]},vid)));
    const legacyIns=v.insCompany||v.policyNumber||v.insuranceValue||v.effectiveDate||v.expirationDate||(v.insurance&&Object.keys(v.insurance).length);
    if(legacyIns){
      d.insuranceRecords.push(normIns({
        company:v.insCompany||v.insurance?.company||"",
        policyNumber:v.policyNumber||v.insurance?.policy||"",
        effectiveDate:v.effectiveDate||v.insurance?.effective||"",
        expirationDate:v.expirationDate||v.insurance?.expiration||"",
        coverageValue:v.insuranceValue||v.insurance?.value||"",
        source:"JSON Restore",
        classificationTags:["Imported"],
        dataQuality:"Review"
      },vid));
    }
  });
  dedupeRecords(d);
  let maxSeq=0;
  [...d.vehicleAcquisitionRecords,...d.fuelRecords,...d.maintenanceRecords,...d.insuranceRecords].forEach(r=>maxSeq=Math.max(maxSeq,Number(r.entrySequence)||0));
  d.nextEntrySequence=Math.max(d.nextEntrySequence||1,maxSeq+1);
  return d;
}
function dedupeRecords(d){
  ["fuelRecords","maintenanceRecords","insuranceRecords","vehicleAcquisitionRecords"].forEach(k=>{
    const seen=new Set();
    d[k]=arr(d[k]).filter(r=>{
      const id=r.recordId||r.id||"";
      if(id && seen.has(id)) return false;
      if(id) seen.add(id);
      return true;
    });
  });
}
function loadData(){let raw=localStorage.getItem(KEY); if(raw){try{return normalizeData(JSON.parse(raw))}catch(e){console.warn(e)}} for(const k of LEGACY_KEYS){raw=localStorage.getItem(k); if(raw){try{const d=normalizeData(JSON.parse(raw)); saveData(d); return d}catch(e){console.warn(e)}}} const d=blankData(); saveData(d); return d}
function saveData(d=state){
  d.schemaVersion=SCHEMA_VERSION;
  d.appVersion=VERSION;
  d.modifiedAt=nowISO();
  const payload=JSON.stringify(d);
  try{
    localStorage.setItem(KEY,payload);
  }catch(e){
    const msg=String((e&&e.name)||"")+" "+String((e&&e.message)||"");
    if(/quota|exceeded|storage/i.test(msg)){
      clearRGBMStorage(true);
      try{
        localStorage.setItem(KEY,payload);
      }catch(e2){
        throw new Error("Storage quota exceeded. Backup size "+Math.round(payload.length/1024)+" KB. Legacy RGB Mileage storage was cleared, but the current data was preserved and the save still failed.");
      }
    }else{
      throw e;
    }
  }
  state=d;
}
function nextSeq(){const n=state.nextEntrySequence||1;state.nextEntrySequence=n+1;return n} function baseRecord(type,vid,source="Manual Entry"){return {recordId:uid(type.toUpperCase()),entrySequence:nextSeq(),recordType:type,vehicleId:vid,source,classificationTags:[],dataQuality:source==="Manual Entry"?"Verified":"Review",createdAt:nowISO(),modifiedAt:nowISO(),notes:""}}
function normVehicle(v,i){return {vehicleId:v.vehicleId||v.id||uid("VEH"),id:v.vehicleId||v.id||uid("VEH"),slot:Number.isFinite(+v.slot)?+v.slot:i,displayName:v.displayName||[v.year,v.make,v.model].filter(Boolean).join(" ")||v.nickname||"Vehicle",nickname:v.nickname||"",year:v.year||"",make:v.make||"",model:v.model||"",badge:v.badge||"",vin:v.vin||"",plate:v.plate||"",plateState:v.plateState||"",status:v.status||"Active",primaryPhoto:v.primaryPhoto||v.photo||"",primaryPhotoZoom:Number(v.primaryPhotoZoom||v.photoZoom||1.25),primaryPhotoOffsetX:Number(v.primaryPhotoOffsetX||0),primaryPhotoOffsetY:Number(v.primaryPhotoOffsetY||0),acquisitionDate:v.acquisitionDate||v.purchaseDate||"",purchaseDate:v.purchaseDate||v.acquisitionDate||"",startingOdometer:v.startingOdometer||"",purchasePrice:v.purchasePrice||v.purchaseCost||"",purchaseCost:v.purchaseCost||v.purchasePrice||"",seller:v.seller||"",insCompany:v.insCompany||"",policyNumber:v.policyNumber||"",effectiveDate:v.effectiveDate||"",expirationDate:v.expirationDate||"",insuranceValue:v.insuranceValue||"",agreedValue:v.agreedValue||"",defaultFuelGrade:v.defaultFuelGrade||"",registration:v.registration||{},photos:arr(v.photos),createdAt:v.createdAt||nowISO(),modifiedAt:v.modifiedAt||nowISO()}}
function normRecord(r,type,vid){const rec={...r};rec.recordType=rec.recordType||type;rec.vehicleId=rec.vehicleId||vid||"";rec.recordId=rec.recordId||rec.id||uid(type.toUpperCase());rec.entrySequence=Number(rec.entrySequence)||nextSeq();rec.source=rec.source||"JSON Restore";rec.classificationTags=tags(rec.classificationTags);rec.dataQuality=DATA_QUALITIES.includes(rec.dataQuality)?rec.dataQuality:"Review";rec.createdAt=rec.createdAt||nowISO();rec.modifiedAt=rec.modifiedAt||nowISO();rec.notes=rec.notes||"";return rec}
function normFuel(r,vid){const rec=normRecord(r,"Fuel",vid);Object.assign(rec,{date:r.date||"",time:r.time||"",odometer:numVal(r.odometer),miles:numVal(r.miles||r.totalMiles),gallons:numVal(r.gallons),mpg:numVal(r.mpg),fuelGrade:r.fuelGrade||r.grade||"",ethanolFree:r.ethanolFree||"",station:r.station||"",fuelPricePerGallon:numVal(r.fuelPricePerGallon||r.price),totalFuelCost:numVal(r.totalFuelCost||r.cost),fuelCostSource:r.fuelCostSource||"",attachments:arr(r.attachments)}); if((rec.odometer!==""&&rec.miles==="")||(rec.mpg!==""&&(+rec.mpg>18||+rec.mpg<6)))addTag(rec,"Historical");return rec}
function normMaint(r,vid){const rec=normRecord(r,"Maintenance",vid);Object.assign(rec,{date:r.date||r.dropOffDate||r.serviceDate||"",dropOffDate:r.dropOffDate||r.date||r.serviceDate||r.drop||"",pickUpDate:r.pickUpDate||r.pick||"",category:r.category||r.service||r.type||"Maintenance",status:r.status||"",odometer:numVal(r.odometer||r.mileage),location:r.location||r.shop||"",serviceProvider:r.serviceProvider||r.provider||r.vendor||"",provider:r.provider||r.serviceProvider||r.vendor||"",performedBy:r.performedBy||"",totalCost:numVal(r.totalCost||r.cost||r.amount),cost:numVal(r.totalCost||r.cost||r.amount),notes:r.notes||r.description||"",attachments:arr(r.attachments)});return rec}
function normIns(r,vid){const rec=normRecord(r,"Insurance",vid);Object.assign(rec,{company:r.company||r.insCompany||"",policyNumber:r.policyNumber||r.policy||"",effectiveDate:r.effectiveDate||"",expirationDate:r.expirationDate||"",coverageValue:numVal(r.coverageValue||r.insuranceValue),insuranceValue:numVal(r.insuranceValue||r.coverageValue),agreedValue:numVal(r.agreedValue),premium:numVal(r.premium),agent:r.agent||r.agentName||"",agentName:r.agentName||r.agent||"",agency:r.agency||"",phone:r.phone||"",email:r.email||"",coverageNotes:r.coverageNotes||"",attachments:arr(r.attachments)});return rec}
function $(id){return document.getElementById(id)} function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))} function fmt(v,d=2){return v!==""&&v!=null&&Number.isFinite(+v)?(+v).toFixed(d):""} function money(v){return v!==""&&v!=null&&Number.isFinite(+v)?"$"+(+v).toFixed(2):""}
function nav(screen,params={},push=true){if(push)historyStack.push({...route});route={screen,...params};render();setTimeout(()=>{const app=$("app"); if(app)app.scrollTo(0,0); scrollTo(0,0)},0)} function goBack(){const prev=historyStack.pop(); if(prev){route=prev;render();setTimeout(()=>{const app=$("app"); if(app)app.scrollTo(0,0); scrollTo(0,0)},0)}else nav("home",{},false)}
function focusEditTop(){setTimeout(()=>{const app=$("app"); if(app)app.scrollTo({top:0,left:0,behavior:"auto"}); const first=document.querySelector(".form-grid input,.form-grid select,.form-grid textarea"); if(first&&first.focus)try{first.focus({preventScroll:true})}catch(e){}},0)}
function navRecord(type,recordId,mode){const screen=mode==="edit"?"recordEdit":"recordView";const push=!(["recordView","recordEdit"].includes(route.screen));nav(screen,{type,recordId},push);if(screen==="recordEdit")focusEditTop()}

 function footer(){return `<div class="version">RGB Mileage v${VERSION} - ${formatBuildDate(BUILD_DATE)}</div>`} 

function vehicleLabel(v){return v?([v.year,v.make,v.model].filter(Boolean).join(" ")||v.nickname||v.displayName||"Vehicle"):"Vehicle"} function vehicleBadge(v){if(!v)return "+"; if(v.badge)return v.badge; const s=vehicleLabel(v); if(/grand wagoneer/i.test(s))return "JGW"; if(/cj\s*7/i.test(s))return "CJ7"; return s.split(/\s+/).map(x=>x[0]).join("").slice(0,6).toUpperCase()||"+"} function getVehicle(id){return state.vehicles.find(v=>v&&v.vehicleId===id)}
function render(){const app=$("app"),s=route.screen; app.className="app-screen screen-"+String(s||"home"); document.body.classList.toggle("home-active",s==="home"); if(s==="home")return home(app); if(s==="vehicleView")return vehicleView(app,route.vehicleId); if(s==="vehicleEdit")return vehicleEdit(app,route.vehicleId,route.slot); if(s==="quickFuel")return quickFuel(app,route.vehicleId); if(s==="quickMaintenance")return quickMaintenance(app,route.vehicleId); if(s==="quickInsurance")return quickInsurance(app,route.vehicleId); if(s==="recordView")return recordView(app,route.type,route.recordId); if(s==="recordEdit")return recordEdit(app,route.type,route.recordId); if(s==="data")return dataScreen(app); if(s==="reports")return reportsHome(app); if(s.startsWith("report"))return reportDetail(app,s); if(s==="settings")return settings(app)}




































































function header(title){return `<div class="topbar"><button class="nav-control back-btn" type="button" onclick="goBack()">‹ Back</button><h1>${esc(title||"RGB Mileage")}</h1></div>`}
function bottomNav(){return `<div class="bottom-nav"><button class="nav-control" type="button" onclick="nav('home')"><span>⌂</span>Home</button><button class="nav-control" type="button" onclick="nav('reports')"><span>▣</span>Reports</button><button class="nav-control" type="button" onclick="nav('data')"><span>⇅</span>Data</button><button class="nav-control" type="button" onclick="nav('settings')"><span>⚙</span>Settings</button></div>`}
function viewField(label,value,full=false){return `<div class="view-field ${full?'full':''}"><span class="view-label">${esc(label)}</span><span class="view-value">${esc(value??"")}</span></div>`}
function showToast(msg){alert(msg)}
function clearInputs(ids){ids.forEach(id=>{const el=$(id);if(el){if(el.tagName==="SELECT")el.selectedIndex=0;else el.value=""}})}
function sortWithOther(list,defaults=[]){const out=[];defaults.forEach(x=>{if(x&&x!=="Other"&&!out.some(y=>String(y).toLowerCase()===String(x).toLowerCase()))out.push(x)});(list||[]).forEach(x=>{if(x&&x!=="Other"&&!out.some(y=>String(y).toLowerCase()===String(x).toLowerCase()))out.push(x)});out.push("Other");return out}
function activeList(listName){if(listName==="fuelGrades"){if(!state.fuelGrades)state.fuelGrades=[...FUEL_GRADES];return sortWithOther(state.fuelGrades,FUEL_GRADES)}if(listName==="stations"){if(!state.stations)state.stations=[...STATIONS_DEFAULT];return sortWithOther(state.stations,STATIONS_DEFAULT)}if(listName==="maintenanceCategories"){if(!state.maintenanceCategories)state.maintenanceCategories=[...MAINT_CATS];return sortWithOther(state.maintenanceCategories,MAINT_CATS)}if(!state[listName])state[listName]=[];return sortWithOther(state[listName],[])}
function saveOtherValueToState(listName,val){if(listName==="fuelGrades"){if(!state.fuelGrades)state.fuelGrades=[...FUEL_GRADES];if(!state.fuelGrades.some(x=>String(x).toLowerCase()===String(val).toLowerCase()))state.fuelGrades.push(val);return}if(listName==="stations"){if(!state.stations)state.stations=[...STATIONS_DEFAULT];if(!state.stations.some(x=>String(x).toLowerCase()===String(val).toLowerCase()))state.stations.push(val);return}if(listName==="maintenanceCategories"){if(!state.maintenanceCategories)state.maintenanceCategories=[...MAINT_CATS];if(!state.maintenanceCategories.some(x=>String(x).toLowerCase()===String(val).toLowerCase()))state.maintenanceCategories.push(val);return}if(!state[listName])state[listName]=[];if(!state[listName].some(x=>String(x).toLowerCase()===String(val).toLowerCase()))state[listName].push(val)}
function selectValueWithOption(sel,val){let opt=[...sel.options].find(o=>o.value===val);if(!opt){opt=document.createElement("option");opt.value=val;opt.textContent=val;const other=[...sel.options].find(o=>o.value==="Other");if(other)sel.insertBefore(opt,other);else sel.appendChild(opt)}sel.value=val;sel.setAttribute("data-prev",val)}
function otherUseOnce(){if(!pendingOtherSelect)return;const val=otherEnteredValue();if(!val)return alert("Enter a value first.");selectValueWithOption(pendingOtherSelect.sel,val);otherClose();pendingOtherSelect=null}
function otherSaveToList(){if(!pendingOtherSelect)return;const val=otherEnteredValue();if(!val)return alert("Enter a value first.");saveOtherValueToState(pendingOtherSelect.listName,val);selectValueWithOption(pendingOtherSelect.sel,val);saveData();otherClose();pendingOtherSelect=null}














function clearEditForm(type){if(type==="Fuel")clearInputs(["efdate","eftime","efodo","efmiles","efgal","efmpg","efgrade","efstation","efnotes"]);if(type==="Maintenance")clearInputs(["emdate","emcat","emodo","emcost","emloc","emprov","emnotes"]);if(type==="Insurance")clearInputs(["eicomp","eipol","eieff","eiexp","eicov","eiprem","eiagent","eiphone","eiemail","eiagency","einotes"])}
function saveRecordEdit(type,recordId){try{const a=recArray(type);const r=a.find(x=>x.recordId===recordId);if(!r)return alert("Record not found.");if(type==="Fuel"){const date=requireValue($("efdate").value,"Date");const gallons=requirePositive($("efgal").value,"Gallons");const odometer=requireNonNegative($("efodo").value,"Odometer");const miles=requireNonNegative($("efmiles").value,"Miles");const price=requireNonNegative($("efprice").value,"Price/Gal");const total=requireNonNegative($("efcost").value,"Total Cost");Object.assign(r,{date,time:$("eftime").value,odometer,miles,gallons,mpg:requireNonNegative($("efmpg").value,"MPG"),fuelGrade:cleanText($("efgrade").value),ethanolFree:cleanText($("efef").value),station:cleanText($("efstation").value),fuelCostSource:cleanText($("efcostsource").value)||(total!==""?"Entered":price!==""?"Calculated":""),fuelPricePerGallon:price,totalFuelCost:total,notes:cleanText($("efnotes").value),modifiedAt:nowISO()})}else if(type==="Maintenance"){const date=requireValue($("emdate").value,"Date");const odometer=requireNonNegative($("emodo").value,"Odometer");const totalCost=requireNonNegative($("emcost").value,"Cost");const provider=cleanText($("emprov").value);Object.assign(r,{date,dropOffDate:date,category:cleanText($("emcat").value)||"Maintenance",odometer,totalCost,cost:totalCost,location:cleanText($("emloc").value),serviceProvider:provider,provider,notes:cleanText($("emnotes").value),modifiedAt:nowISO()})}else if(type==="Insurance"){const company=requireValue($("eicomp").value,"Company");const policyNumber=requireValue($("eipol").value,"Policy Number");const effectiveDate=requireValue($("eieff").value,"Effective Date");const expirationDate=cleanText($("eiexp").value);if(expirationDate&&expirationDate<effectiveDate)throw new Error("Expiration Date cannot be earlier than Effective Date.");const coverageValue=requireNonNegative($("eicov").value,"Coverage Value");const premium=requireNonNegative($("eiprem").value,"Premium");const agent=cleanText($("eiagent").value);Object.assign(r,{company,policyNumber,effectiveDate,expirationDate,coverageValue,insuranceValue:coverageValue,premium,agent,agentName:agent,phone:cleanText($("eiphone").value),email:cleanText($("eiemail").value),agency:cleanText($("eiagency").value),notes:cleanText($("einotes").value),modifiedAt:nowISO()})}saveData();showToast("Edit saved.");clearEditForm(type)}catch(e){alert(e.message||String(e))}}
function vehicleView(app,vid){const v=getVehicle(vid);if(!v)return nav("home");const acq=getAcq(vid);app.innerHTML=header(vehicleLabel(v))+`<div class="card"><div class="vehicle-view-photo">${v.primaryPhoto?`<div class="circleBtn"><img src="${v.primaryPhoto}" alt=""></div>`:`<div class="circleBtn"><span>${vehicleInitials(v)}</span></div>`}</div><div class="view-grid">${viewField("Year",v.year||"")}${viewField("Make",v.make||"")}${viewField("Model",v.model||"")}${viewField("Badge",v.badge||"")}${viewField("Acquisition Date",acq.acquisitionDate||"")}${viewField("Starting Odometer",acq.startingOdometer||"")}${viewField("Purchase Price",acq.purchasePrice||"")}${viewField("Status",v.status||"Active")}${viewField("Seller",acq.seller||"",true)}</div><button class="wide primary nav-control" type="button" onclick="nav('vehicleEdit',{vehicleId:'${vid}'})">Edit Vehicle</button><button class="wide nav-control" type="button" onclick="nav('quickFuel',{vehicleId:'${vid}'})">Quick Fuel Entry</button><button class="wide nav-control" type="button" onclick="nav('quickMaintenance',{vehicleId:'${vid}'})">Quick Maintenance Entry</button><button class="wide nav-control" type="button" onclick="nav('quickInsurance',{vehicleId:'${vid}'})">Quick Insurance Entry</button></div>`+previousRecordsHtml("Fuel",vid)+previousRecordsHtml("Maintenance",vid)+previousRecordsHtml("Insurance",vid)+bottomNav()+footer()}
function recordEdit(app,type,recordId){const r=records(type,null,true).find(x=>x.recordId===recordId);if(!r)return nav("home");const vid=r.vehicleId;if(type==="Fuel"){app.innerHTML=header("Edit Fuel Record")+`<div class="card"><div class="form-grid"><label>Date<input type="date" id="efdate" value="${esc(r.date||"")}"></label><label>Time<input type="time" id="eftime" value="${esc(r.time||"")}"></label><label>Odometer<input type="number" step="0.01" id="efodo" value="${esc(r.odometer||"")}"></label><label>Miles<input type="number" step="0.01" id="efmiles" value="${esc(r.miles||"")}"></label><label>Gallons<input type="number" step="0.001" id="efgal" value="${esc(r.gallons||"")}"></label><label>MPG<input type="number" step="0.01" id="efmpg" value="${esc(r.mpg||"")}"></label><label>Fuel Grade<select id="efgrade" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'fuelGrades')">${activeList("fuelGrades").map(g=>`<option ${g===(r.fuelGrade||"")?"selected":""}>${esc(g)}</option>`).join("")}</select></label><label>Ethanol Free<select id="efef"><option ${String(r.ethanolFree||"")===""?"selected":""}></option><option ${String(r.ethanolFree||"")==="Yes"?"selected":""}>Yes</option><option ${String(r.ethanolFree||"")==="No"?"selected":""}>No</option></select></label><label>Station<select id="efstation" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'stations')">${activeList("stations").map(s=>`<option ${s===(r.station||"")?"selected":""}>${esc(s)}</option>`).join("")}</select></label><label>Cost Source<select id="efcostsource"><option ${String(r.fuelCostSource||"")===""?"selected":""}></option><option ${String(r.fuelCostSource||"")==="Calculated"?"selected":""}>Calculated</option><option ${String(r.fuelCostSource||"")==="Entered"?"selected":""}>Entered</option></select></label><label>Price/Gal<input type="number" step="0.01" id="efprice" value="${esc(r.fuelPricePerGallon||"")}" oninput="calcEditCost()"></label><label>Total Cost<input type="number" step="0.01" id="efcost" value="${esc(r.totalFuelCost||"")}"></label><label class="full">Notes<textarea id="efnotes">${esc(r.notes||"")}</textarea></label></div><button class="wide primary nav-control" type="button" onclick="saveRecordEdit('Fuel','${recordId}')">Save Changes</button><button class="wide ghost nav-control" type="button" onclick="goBack()">Cancel</button></div>`+previousRecordsHtml("Fuel",vid)+bottomNav()+footer();return}if(type==="Maintenance"){app.innerHTML=header("Edit Maintenance Record")+`<div class="card"><div class="form-grid"><label>Date<input type="date" id="emdate" value="${esc(r.dropOffDate||r.date||"")}"></label><label>Category<select id="emcat" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'maintenanceCategories')">${activeList("maintenanceCategories").map(c=>`<option ${c===(r.category||"")?"selected":""}>${esc(c)}</option>`).join("")}</select></label><label>Odometer<input type="number" step="0.01" id="emodo" value="${esc(r.odometer||"")}"></label><label>Cost<input type="number" step="0.01" id="emcost" value="${esc(r.totalCost||r.cost||"")}"></label><label>Location<input id="emloc" value="${esc(r.location||"")}"></label><label>Provider<input id="emprov" value="${esc(r.serviceProvider||r.provider||"")}"></label><label class="full">Notes<textarea id="emnotes">${esc(r.notes||"")}</textarea></label></div><button class="wide primary nav-control" type="button" onclick="saveRecordEdit('Maintenance','${recordId}')">Save Changes</button><button class="wide ghost nav-control" type="button" onclick="goBack()">Cancel</button></div>`+previousRecordsHtml("Maintenance",vid)+bottomNav()+footer();return}if(type==="Insurance"){app.innerHTML=header("Edit Insurance Record")+`<div class="card"><div class="form-grid"><label>Company<input id="eicomp" value="${esc(r.company||"")}"></label><label>Policy Number<input id="eipol" value="${esc(r.policyNumber||"")}"></label><label>Effective Date<input type="date" id="eieff" value="${esc(r.effectiveDate||"")}"></label><label>Expiration Date<input type="date" id="eiexp" value="${esc(r.expirationDate||"")}"></label><label>Coverage Value<input type="number" step="0.01" id="eicov" value="${esc(r.coverageValue||r.insuranceValue||"")}"></label><label>Premium<input type="number" step="0.01" id="eiprem" value="${esc(r.premium||"")}"></label><label>Agent<input id="eiagent" value="${esc(r.agent||r.agentName||"")}"></label><label>Phone<input id="eiphone" value="${esc(r.phone||"")}"></label><label>Email<input type="email" id="eiemail" value="${esc(r.email||"")}"></label><label class="full">Agency<input id="eiagency" value="${esc(r.agency||"")}"></label><label class="full">Notes<textarea id="einotes">${esc(r.notes||"")}</textarea></label></div><button class="wide primary nav-control" type="button" onclick="saveRecordEdit('Insurance','${recordId}')">Save Changes</button><button class="wide ghost nav-control" type="button" onclick="goBack()">Cancel</button></div>`+previousRecordsHtml("Insurance",vid)+bottomNav()+footer()}}


function home(app){app.innerHTML=`<div class="screen home"><div class="home-head"><h1 class="chrome-title">${APP_NAME}</h1><div class="subtitle version-subtitle">v${VERSION} • Build ${formatBuildDate(BUILD_DATE)}</div></div><div class="vehicle-area">${state.vehicles.map((v,i)=>circleHtml(v,i)).join("")}</div></div>${bottomNav()}`}

function pressStart(cb,e,delay=750){
  clearLP();
  suppressTap=false;
  longTimer=setTimeout(()=>{
    suppressTap=true;
    try{ cb(); }catch(err){ console.error(err); }
  },delay);
}
function clearLP(){
  if(longTimer) clearTimeout(longTimer);
  longTimer=null;
}
function rowPressStart(type,recordId,e){
  pressStart(()=>nav("recordEdit",{type,recordId},false),e,650);
}
function rowPressEnd(type,recordId,e){
  const longFired=suppressTap;
  clearLP();
  if(longFired){
    suppressTap=false;
    return false;
  }
  nav("recordView",{type,recordId},false);
  return false;
}
function rowPressCancel(){
  clearLP();
}
function rowTap(type,recordId,e){
  if(e && e.preventDefault) e.preventDefault();
  if(suppressTap){
    suppressTap=false;
    return false;
  }
  nav("recordView",{type,recordId},false);
  return false;
}
function entryRow(type,r){
  const b=tags(r.classificationTags).map(t=>`<span class="badge ${t==='Historical'?'warn':t==='Archived'?'arch':''}">${esc(t)}</span>`).join("");
  return `<div class="entry-row" role="button" tabindex="0"
    onpointerdown="rowPressStart('${type}','${r.recordId}',event)"
    onpointerup="return rowPressEnd('${type}','${r.recordId}',event)"
    onpointercancel="rowPressCancel()"
    onclick="return rowTap('${type}','${r.recordId}',event)">
    <div class="entry-main"><span>${recordTitle(type,r)}</span><span class="muted">${esc(r.dataQuality||"")}</span></div><div class="badges">${b}</div></div>`;
}

function circleHtml(v,i){const inner=v&&v.primaryPhoto?`<img src="${v.primaryPhoto}" alt="">`:esc(vehicleBadge(v)); const label=v?vehicleLabel(v):"Add Vehicle"; return `<div class="circle-wrap"><button class="circleBtn" onpointerdown="pressStart(()=>vehicleLong(${i}),event,500)" onpointerup="clearLP()" onpointercancel="clearLP()" onclick="vehicleTap(${i})">${inner}</button><div class="vehicle-label">${esc(label)}</div></div>`}
function vehicleTap(i){if(suppressTap){suppressTap=false;return} const v=state.vehicles[i]; if(v)nav("quickFuel",{vehicleId:v.vehicleId}); else nav("vehicleEdit",{slot:i})} function vehicleLong(i){const v=state.vehicles[i]; if(v)nav("vehicleView",{vehicleId:v.vehicleId}); else nav("vehicleEdit",{slot:i})}
function getAcq(vid){let a=state.vehicleAcquisitionRecords.find(r=>r.vehicleId===vid);const v=getVehicle(vid)||{};return a||{vehicleId:vid,acquisitionDate:v.acquisitionDate||v.purchaseDate||"",purchaseDate:v.purchaseDate||v.acquisitionDate||"",startingOdometer:v.startingOdometer||"",purchasePrice:v.purchasePrice||v.purchaseCost||"",seller:v.seller||""}}
function saveAcq(vid,vals){let a=state.vehicleAcquisitionRecords.find(r=>r.vehicleId===vid);if(!a){a=baseRecord("VehicleAcquisition",vid,"Manual Entry");state.vehicleAcquisitionRecords.push(a)}Object.assign(a,vals,{modifiedAt:nowISO()});const v=getVehicle(vid);if(v){v.acquisitionDate=vals.acquisitionDate||"";v.purchaseDate=vals.acquisitionDate||"";v.startingOdometer=vals.startingOdometer||"";v.purchasePrice=vals.purchasePrice||"";v.purchaseCost=vals.purchasePrice||"";v.seller=vals.seller||"";v.modifiedAt=nowISO()}}

function vehicleEdit(app,vid,slot=0){let v=vid?getVehicle(vid):null;if(!v)v={vehicleId:uid("VEH"),slot,status:"Active"};const acq=getAcq(v.vehicleId);const currentImg=v.primaryPhoto?`<div class="edit-image-preview"><div class="circleBtn imagePreviewCircle"><img src="${v.primaryPhoto}" alt=""></div><div class="muted">Current vehicle image saved</div></div>`:`<div class="muted">No vehicle image saved</div>`;app.innerHTML=header(vid?"Edit Vehicle":"Add Vehicle")+`<div class="card"><div class="form-grid"><label>Year<input id="vehYear" value="${esc(v.year||"")}"></label><label>Make<input id="vehMake" value="${esc(v.make||"")}"></label><label>Model<input id="vehModel" value="${esc(v.model||"")}"></label><label>Badge<input id="vehBadge" value="${esc(v.badge||"")}"></label></div><div class="image-edit-block"><h3>Vehicle Image</h3>${currentImg}<label>Replace Image<input type="file" id="vehPhoto" accept="image/*"></label><div class="muted">Saved image data: ${v.primaryPhoto?"Present":"None"}</div></div><h3>Vehicle Acquisition Record</h3><div class="form-grid"><label>Acquisition Date<input type="date" id="acqDate" value="${esc(acq.acquisitionDate||"")}"></label><label>Starting Odometer<input type="number" step="0.01" id="startOdo" value="${esc(acq.startingOdometer||"")}"></label><label>Purchase Price<input type="number" step="0.01" id="purchasePrice" value="${esc(acq.purchasePrice||"")}"></label><label>Status<select id="vehStatus"><option ${v.status==="Active"?"selected":""}>Active</option><option ${v.status==="Archived"?"selected":""}>Archived</option></select></label><label class="full">Seller<input id="seller" value="${esc(acq.seller||"")}"></label></div><button class="wide primary" onclick="saveVehicle('${v.vehicleId}',${v.slot??slot})">Save Vehicle</button><button class="wide ghost" onclick="clearVehicleFormExit()">Clear & Exit</button></div>`+bottomNav()+footer()}
async function imgData(file){return new Promise(resolve=>{const r=new FileReader();r.onload=e=>{const img=new Image();img.onload=()=>{let w=img.width,h=img.height,sc=Math.min(1,1200/Math.max(w,h));const c=document.createElement("canvas");c.width=Math.round(w*sc);c.height=Math.round(h*sc);c.getContext("2d").drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL("image/jpeg",.85))};img.onerror=()=>resolve(e.target.result);img.src=e.target.result};r.readAsDataURL(file)})}
async function saveVehicle(vid,slot){let v=getVehicle(vid)||{vehicleId:vid,id:vid,slot,status:"Active",createdAt:nowISO()};v.year=$("vehYear").value.trim();v.make=$("vehMake").value.trim();v.model=$("vehModel").value.trim();v.badge=$("vehBadge").value.trim();v.status=$("vehStatus")?$("vehStatus").value:(v.status||"Active");v.displayName=vehicleLabel(v);v.modifiedAt=nowISO();const f=$("vehPhoto").files[0];if(f)v.primaryPhoto=await imgData(f);state.vehicles[slot]=v;saveAcq(vid,{acquisitionDate:$("acqDate").value,startingOdometer:numVal($("startOdo").value),purchasePrice:numVal($("purchasePrice").value),seller:$("seller").value});saveData();alert("Vehicle saved.");nav("home",{},false)}
function clearVehicleFormExit(){nav("home")} function archiveVehicle(vid){if(confirm("Archive vehicle?")){const v=getVehicle(vid);v.status="Archived";v.modifiedAt=nowISO();saveData();nav("home")}}
function recArray(type){return type==="Fuel"?state.fuelRecords:type==="Maintenance"?state.maintenanceRecords:type==="Insurance"?state.insuranceRecords:state.vehicleAcquisitionRecords}
function dateValue(r,type){const d=r.date||r.dropOffDate||r.effectiveDate||r.acquisitionDate||"";const t=r.time||"";if(!d)return 0;const ms=Date.parse((d+" "+t).trim());return Number.isFinite(ms)?ms:0}
function previousSort(type,a,b){const ad=dateValue(a,type),bd=dateValue(b,type);if(ad||bd){if(bd!==ad)return bd-ad}const ao=Number(a.odometer||a.startingOdometer||0),bo=Number(b.odometer||b.startingOdometer||0);if((type==="Fuel"||type==="Maintenance")&&(ao||bo)&&bo!==ao)return bo-ao;const as=Number(a.entrySequence||0),bs=Number(b.entrySequence||0);if(bs!==as)return bs-as;const am=Date.parse(a.modifiedAt||a.createdAt||"")||0,bm=Date.parse(b.modifiedAt||b.createdAt||"")||0;return bm-am}
function records(type,vid,includeArchived=false){return recArray(type).filter(r=>(!vid||r.vehicleId===vid)&&(includeArchived||!hasTag(r,"Archived"))).sort((a,b)=>previousSort(type,a,b))}
function recordTitle(type,r){if(type==="Fuel")return `${r.date||"No Date"} Odo ${fmt(r.odometer)}`; if(type==="Maintenance")return `${r.dropOffDate||r.date||"No Date"} ${r.category||"Maintenance"}`; if(type==="Insurance")return `${r.company||"Insurance"} ${r.policyNumber||""}`; return r.recordId}
function line(k,v){return `<div><b>${esc(k)}:</b> ${esc(v??"")}</div>`}
function recordDetails(type,r){if(type==="Fuel")return line("Odometer",fmt(r.odometer))+line("Miles",fmt(r.miles))+line("Gallons",fmt(r.gallons,3))+line("MPG",fmt(r.mpg))+line("Station",r.station)+line("Notes",r.notes); if(type==="Maintenance")return line("Odometer",fmt(r.odometer))+line("Cost",money(r.totalCost))+line("Provider",r.serviceProvider||r.provider||"")+line("Notes",r.notes); if(type==="Insurance")return line("Effective",r.effectiveDate)+line("Expiration",r.expirationDate)+line("Premium",money(r.premium))+line("Agency",r.agency||"");return ""}












function previousRecordsHtml(type,vid){const rows=records(type,vid,false);return `<details class="card" open><summary><strong>Previous ${type} Records</strong></summary>${rows.length?rows.map(r=>entryRow(type,r)).join(""):'<p class="muted">No records.</p>'}</details>`}



function meta(r){return `<div class="readonly-grid"><div class="fieldbox"><b>Record ID</b><span>${esc(r.recordId)}</span></div><div class="fieldbox"><b>Sequence</b><span>${r.entrySequence}</span></div><div class="fieldbox"><b>Source</b><span>${esc(r.source)}</span></div><div class="fieldbox"><b>Quality</b><span>${esc(r.dataQuality)}</span></div><div class="fieldbox"><b>Tags</b><span>${esc(tags(r.classificationTags).join('; '))}</span></div></div>`} function roBox(label,val){return `<div class="fieldbox"><b>${esc(label)}</b><span>${esc(val??"")}</span></div>`}
function findRecord(type,id){
  return recArray(type).find(r=>String(r.recordId)===String(id));
}
function recordView(app,type,id){const r=findRecord(type,id);if(!r)return nav("home",{},false);app.innerHTML=header("View "+type+" Record")+`<div class="card">${meta(r)}<h3>${type} Information</h3><div class="readonly-grid">${viewFields(type,r)}</div><div class="form-actions"><button onclick="navRecord('${type}','${id}','edit')">Edit</button><button class="danger" onclick="archiveRecord('${type}','${id}')">Archive</button></div></div>`+bottomNav()+footer()} function viewFields(type,r){if(type==="Fuel")return roBox("Date",r.date)+roBox("Time",r.time)+roBox("Odometer",fmt(r.odometer))+roBox("Miles",fmt(r.miles))+roBox("Gallons",fmt(r.gallons,3))+roBox("MPG",fmt(r.mpg))+roBox("Fuel Grade",r.fuelGrade)+roBox("Ethanol Free",r.ethanolFree)+roBox("Station",r.station)+roBox("Cost Source",r.fuelCostSource)+roBox("Price/Gal",money(r.fuelPricePerGallon))+roBox("Total Cost",money(r.totalFuelCost))+roBox("Notes",r.notes); if(type==="Maintenance")return roBox("Date",r.dropOffDate)+roBox("Category",r.category)+roBox("Odometer",fmt(r.odometer))+roBox("Cost",money(r.totalCost))+roBox("Notes",r.notes); if(type==="Insurance")return roBox("Company",r.company)+roBox("Policy",r.policyNumber)+roBox("Effective",r.effectiveDate)+roBox("Expiration",r.expirationDate)+roBox("Premium",money(r.premium))+roBox("Notes",r.notes);return ""}
function commonEdit(r){return `<label>Data Quality<select id="rq">${DATA_QUALITIES.map(q=>`<option ${r.dataQuality===q?'selected':''}>${q}</option>`).join("")}</select></label><label>Tags<input id="rtags" value="${esc(tags(r.classificationTags).join('; '))}"></label><label>Notes<textarea id="rnotes">${esc(r.notes||"")}</textarea></label>`} 




function editFields(type,r){if(type==="Fuel")return `<div class="row"><label>Date<input type="date" id="rdate" value="${esc(r.date||"")}"></label><label>Time<input type="time" id="rtime" value="${esc(r.time||"")}"></label></div><div class="row"><label>Odometer<input type="number" step="0.01" id="rodo" value="${esc(r.odometer)}"></label><label>Miles<input type="number" step="0.01" id="rmiles" value="${esc(r.miles)}"></label></div><div class="row"><label>Gallons<input type="number" step="0.001" id="rgal" value="${esc(r.gallons)}"></label><label>MPG<input type="number" step="0.01" id="rmpg" value="${esc(r.mpg)}"></label></div><label>Station<input id="rstation" value="${esc(r.station||"")}"></label>`; if(type==="Maintenance")return `<label>Date<input type="date" id="rdrop" value="${esc(r.dropOffDate||"")}"></label><label>Category<select id="rcat">${state.maintenanceCategories.map(c=>`<option ${r.category===c?'selected':''}>${esc(c)}</option>`).join("")}</select></label><label>Cost<input type="number" step="0.01" id="rcost" value="${esc(r.totalCost)}"></label>`; if(type==="Insurance")return `<label>Company<input id="rcompany" value="${esc(r.company||"")}"></label><label>Policy Number<input id="rpol" value="${esc(r.policyNumber||"")}"></label><div class="row"><label>Effective<input type="date" id="reff" value="${esc(r.effectiveDate||"")}"></label><label>Expiration<input type="date" id="rexp" value="${esc(r.expirationDate||"")}"></label></div><label>Premium<input type="number" step="0.01" id="rprem" value="${esc(r.premium)}"></label>`;return ""}
 function archiveRecord(type,id){const r=findRecord(type,id);if(confirm("Archive this record?")){addTag(r,"Archived");r.modifiedAt=nowISO();saveData();alert("Record archived.");nav("vehicleView",{vehicleId:r.vehicleId})}}
function openOtherList(selectId,listName,label){const sel=$(selectId);if(sel.value!=="Other")return;showOtherSheet(label,(name,save)=>{if(!name){sel.value="";return}let list=state[listName];if(save&&!list.includes(name)){list.splice(Math.max(0,list.length-1),0,name);saveData()}if(![...sel.options].some(o=>o.value===name)){const opt=document.createElement("option");opt.value=name;opt.textContent=name;sel.insertBefore(opt,sel.querySelector('option[value="Other"]'))}sel.value=name})} function showOtherSheet(label,cb){const div=document.createElement("div");div.className="modal";div.innerHTML=`<div class="sheet"><h2>Other ${esc(label)}</h2><label>${esc(label)} Name<input id="otherName"></label><div class="form-actions"><button class="primary" id="useOnce">Use Once</button><button class="ok" id="saveList">Save To List</button></div><button class="wide danger" id="cancelOther">Cancel</button></div>`;document.body.appendChild(div);$("otherName").focus();$("useOnce").onclick=()=>{const v=$("otherName").value.trim();div.remove();cb(v,false)};$("saveList").onclick=()=>{const v=$("otherName").value.trim();div.remove();cb(v,true)};$("cancelOther").onclick=()=>{div.remove();cb("",false)}}
function quickFuel(app,vid){const v=getVehicle(vid),n=new Date();if(!v)return nav("home");app.innerHTML=header(vehicleLabel(v)+" - Quick Fuel Entry")+`<div class="card"><div class="form-grid"><label>Date<input type="date" id="fdate" value="${n.toISOString().slice(0,10)}"></label><label>Time<input type="time" id="ftime" value="${n.toTimeString().slice(0,5)}"></label><label>Odometer<input type="number" step="0.01" id="fodo" oninput="calcFuel('${vid}')"></label><label>Miles<input type="number" step="0.01" id="fmiles" oninput="calcMpg()"></label><label>Gallons<input type="number" step="0.001" id="fgal" oninput="calcMpg()"></label><label>MPG<input type="number" step="0.01" id="fmpg" readonly></label><label>Fuel Grade<select id="fgrade" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'fuelGrades')">${activeList("fuelGrades").map(g=>`<option>${esc(g)}</option>`).join("")}</select></label><label>Ethanol Free<select id="fef"><option></option><option>Yes</option><option>No</option></select></label><label>Station<select id="fstation" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'stations')">${state.stations.map(s=>`<option>${esc(s)}</option>`).join("")}</select></label><label>Cost Source<select id="fcostsource"><option></option><option>Calculated</option><option>Entered</option></select></label><label>Price/Gal<input type="number" step="0.01" id="fprice" oninput="calcCost()"></label><label>Total Cost<input type="number" step="0.01" id="fcost"></label><label class="full">Notes<textarea id="fnotes"></textarea></label></div><button class="wide primary" onclick="saveQuickFuel('${vid}')">Save Entry</button><button class="wide ghost" onclick="nav('home')">Cancel</button></div>`+previousRecordsHtml("Fuel",vid)+bottomNav()+footer()}

let pendingOtherSelect=null;

function otherTitleFromList(listName){
  if(listName==="fuelGrades")return ["Other Fuel Grade","Fuel Grade Name"];
  if(listName==="stations")return ["Other Station","Station Name"];
  if(listName==="maintenanceCategories")return ["Other Maintenance Category","Maintenance Category Name"];
  return ["Other Value","Value"];
}
function selectOther(sel,listName){
  if(!sel || sel.value!=="Other")return;
  openOtherModal(sel,listName);
}
function openOtherModal(sel,listName){
  const previous=sel.getAttribute("data-prev")||"";
  pendingOtherSelect={sel,listName,previous};
  const pair=otherTitleFromList(listName), title=pair[0], label=pair[1];
  const old=document.getElementById("otherModalBackdrop");
  if(old)old.remove();
  const div=document.createElement("div");
  div.id="otherModalBackdrop";
  div.className="other-modal-backdrop";
  div.innerHTML=`<div class="other-modal"><h2>${esc(title)}</h2><label>${esc(label)}<input id="otherModalInput" autocomplete="off"></label><div class="other-actions"><button class="primary" onclick="otherUseOnce()">Use Once</button><button onclick="otherSaveToList()">Save To List</button><button class="ghost" onclick="otherCancel()">Cancel</button></div></div>`;
  document.body.appendChild(div);
  setTimeout(()=>{const i=document.getElementById("otherModalInput");if(i)i.focus()},50);
}
function otherClose(){const old=document.getElementById("otherModalBackdrop");if(old)old.remove()}
function otherEnteredValue(){const i=document.getElementById("otherModalInput");return (i&&i.value?i.value:"").trim()}
function addOptionToSelect(sel,val){
  let opt=[...sel.options].find(o=>o.value===val);
  if(!opt){
    opt=document.createElement("option");
    opt.value=val;
    opt.textContent=val;
    const other=[...sel.options].find(o=>o.value==="Other");
    if(other)sel.insertBefore(opt,other);else sel.appendChild(opt);
  }
  sel.value=val;
  sel.setAttribute("data-prev",val);
}


function otherCancel(){
  if(pendingOtherSelect&&pendingOtherSelect.sel)pendingOtherSelect.sel.value=pendingOtherSelect.previous||"";
  otherClose();
  pendingOtherSelect=null;
}

function previousFuelOdo(vid,odo){const rows=records("Fuel",vid,false).filter(r=>r.odometer!==""&&Number(r.odometer)<Number(odo)).sort((a,b)=>Number(b.odometer)-Number(a.odometer));return rows[0]?.odometer??""} function calcFuel(vid){const odo=numVal($("fodo").value),prev=previousFuelOdo(vid,odo);if(odo!==""&&prev!=="")$("fmiles").value=(odo-prev).toFixed(2);calcMpg()} function calcMpg(){const m=numVal($("fmiles").value),g=numVal($("fgal").value);$("fmpg").value=(m!==""&&g>0)?(m/g).toFixed(2):"";calcCost()} function calcCost(){const g=numVal($("fgal")?.value),p=numVal($("fprice")?.value);if($("fcost")&&g!==""&&p!=="")$("fcost").value=(g*p).toFixed(2)} function calcEditCost(){const g=numVal($("efgal")?.value),p=numVal($("efprice")?.value);if($("efcost")&&g!==""&&p!=="")$("efcost").value=(g*p).toFixed(2)} function saveQuickFuel(vid){try{const date=requireValue($("fdate").value,"Date");const gallons=requirePositive($("fgal").value,"Gallons");const odometer=requireNonNegative($("fodo").value,"Odometer");const miles=requireNonNegative($("fmiles").value,"Miles");const price=requireNonNegative($("fprice").value,"Price/Gal");const total=requireNonNegative($("fcost").value,"Total Cost");const r=baseRecord("Fuel",vid,"Manual Entry");Object.assign(r,{date,time:$("ftime").value,odometer,miles,gallons,mpg:requireNonNegative($("fmpg").value,"MPG"),fuelGrade:cleanText($("fgrade").value),ethanolFree:cleanText($("fef").value),station:cleanText($("fstation").value),fuelPricePerGallon:price,totalFuelCost:total,fuelCostSource:cleanText($("fcostsource").value)||(total!==""?"Entered":price!==""?"Calculated":""),notes:cleanText($("fnotes").value),attachments:[]});if(r.odometer!==""&&r.miles==="")addTag(r,"Historical");state.fuelRecords.push(r);saveData();alert("Fuel entry saved.");nav("home")}catch(e){alert(e.message||String(e))}}
function quickMaintenance(app,vid){const n=new Date().toISOString().slice(0,10);app.innerHTML=header("Quick Maintenance Entry")+`<div class="card"><div class="form-grid"><label>Date<input type="date" id="mdrop" value="${n}"></label><label>Category<select id="mcat" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'maintenanceCategories')">${activeList("maintenanceCategories").map(c=>`<option>${esc(c)}</option>`).join("")}</select></label><label>Odometer<input type="number" step="0.01" id="modo"></label><label>Cost<input type="number" step="0.01" id="mcost"></label><label>Location<input id="mloc"></label><label>Provider<input id="mprov"></label><label class="full">Notes<textarea id="mnotes"></textarea></label></div><button class="wide primary" onclick="saveQuickMaintenance('${vid}')">Save Maintenance</button><button class="wide ghost" onclick="nav('home')">Cancel</button></div>`+previousRecordsHtml("Maintenance",vid)+bottomNav()+footer()} function saveQuickMaintenance(vid){try{const date=requireValue($("mdrop").value,"Date");const odometer=requireNonNegative($("modo").value,"Odometer");const totalCost=requireNonNegative($("mcost").value,"Cost");const provider=cleanText($("mprov").value);const r=baseRecord("Maintenance",vid,"Manual Entry");Object.assign(r,{date,dropOffDate:date,category:cleanText($("mcat").value)||"Maintenance",odometer,totalCost,cost:totalCost,location:cleanText($("mloc").value),serviceProvider:provider,provider,notes:cleanText($("mnotes").value),attachments:[]});state.maintenanceRecords.push(r);saveData();alert("Maintenance saved.");nav("vehicleView",{vehicleId:vid})}catch(e){alert(e.message||String(e))}}
function quickInsurance(app,vid){app.innerHTML=header("Quick Insurance Entry")+`<div class="card"><div class="form-grid"><label>Company<input id="icomp"></label><label>Policy Number<input id="ipol"></label><label>Effective Date<input type="date" id="ieff"></label><label>Expiration Date<input type="date" id="iexp"></label><label>Coverage Value<input type="number" step="0.01" id="icov"></label><label>Premium<input type="number" step="0.01" id="iprem"></label><label>Agent<input id="iagent"></label><label>Phone<input id="iphone"></label><label>Email<input type="email" id="iemail"></label><label class="full">Agency<input id="iagency"></label><label class="full">Notes<textarea id="inotes"></textarea></label></div><button class="wide primary" onclick="saveQuickInsurance('${vid}')">Save Policy</button><button class="wide ghost" onclick="nav('home')">Cancel</button></div>`+previousRecordsHtml("Insurance",vid)+bottomNav()+footer()} function saveQuickInsurance(vid){try{const company=requireValue($("icomp").value,"Company");const policyNumber=requireValue($("ipol").value,"Policy Number");const effectiveDate=requireValue($("ieff").value,"Effective Date");const expirationDate=cleanText($("iexp").value);if(expirationDate&&expirationDate<effectiveDate)throw new Error("Expiration Date cannot be earlier than Effective Date.");const coverageValue=requireNonNegative($("icov").value,"Coverage Value");const premium=requireNonNegative($("iprem").value,"Premium");const agent=cleanText($("iagent").value);const r=baseRecord("Insurance",vid,"Manual Entry");Object.assign(r,{company,policyNumber,effectiveDate,expirationDate,coverageValue,insuranceValue:coverageValue,premium,agent,agentName:agent,phone:cleanText($("iphone").value),email:cleanText($("iemail").value),agency:cleanText($("iagency").value),notes:cleanText($("inotes").value),attachments:[]});state.insuranceRecords.push(r);saveData();alert("Insurance policy saved.");nav("vehicleView",{vehicleId:vid})}catch(e){alert(e.message||String(e))}}
function dataScreen(app){app.innerHTML=header("Data Management")+`<div class="card"><h2>Backup & Restore</h2><button class="wide primary" onclick="downloadBackup()">Create JSON Backup</button><label>Restore JSON<input type="file" id="restoreFile" accept=".json"></label><label>Restore Mode<select id="restoreMode"><option>Replace</option><option>Update</option><option>Duplicate</option><option>Skip</option></select></label><button class="wide" onclick="restoreBackup()">Restore JSON Backup</button><button class="wide ghost" onclick="if(confirm('Clear old RGB Mileage cached storage? Current active data may be removed.')){clearRGBMStorage(false);alert('Old RGB Mileage storage cleared.')}">Clear Old Cached Storage</button><pre id="dataStatus" class="small"></pre></div><div class="card"><h2>CSV Import</h2><p class="muted">CSV import supports Fuel and Maintenance records.</p><label>Vehicle<select id="importVehicle">${state.vehicles.filter(Boolean).map(v=>`<option value="${v.vehicleId}">${esc(vehicleLabel(v))}</option>`).join("")}</select></label><label>CSV File<input type="file" id="csvFile" accept=".csv"></label><label>Duplicate Mode<select id="importMode"><option>Skip</option><option>Update</option><option>Duplicate</option><option>Replace</option><option>Cancel</option></select></label><button class="wide" onclick="previewCSV()">Preview Import</button><button class="wide primary" onclick="savePreviewRows()">Save Previewed Rows</button><pre id="importStatus" class="small"></pre></div>`+bottomNav()+footer()}
function backupPayload(){const p=JSON.parse(JSON.stringify(state));p.app="RGB Mileage";p.schemaVersion=SCHEMA_VERSION;p.exportedAt=nowISO();p.exportedByVersion=VERSION;p.backupType="Full JSON";p.metadata={vehicleCount:state.vehicles.filter(Boolean).length,fuelRecordCount:state.fuelRecords.length,maintenanceRecordCount:state.maintenanceRecords.length,insuranceRecordCount:state.insuranceRecords.length,attachmentCount:state.attachments.length};return p} function downloadBackup(){const p=backupPayload(),txt=JSON.stringify(p,null,2);if(!confirm(`Backup Summary\nVehicles: ${p.metadata.vehicleCount}\nFuel: ${p.metadata.fuelRecordCount}\nMaintenance: ${p.metadata.maintenanceRecordCount}\nInsurance: ${p.metadata.insuranceRecordCount}\nEstimated Size: ${new Blob([txt]).size} bytes\n\nCreate backup?`))return;const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type:"application/json"}));a.download=`RGBM_Backup_v${VERSION}_${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);state.settings.lastBackupDate=nowISO();saveData()} function restoreBackup(){
  const f=$("restoreFile").files[0];
  if(!f)return alert("Choose a JSON backup first.");
  const r=new FileReader();
  r.onload=()=>{
    try{
      const incoming=normalizeData(JSON.parse(r.result));
      const mode=($("restoreMode")?.value||"Replace");
      const summary=mergeSummary(incoming,mode);
      if(!confirm(summary+"\n\nContinue?"))return;
      if(mode==="Replace"){
        clearRGBMStorage(false);
        saveData(incoming);
      }else{
        mergeData(incoming,mode);
        saveData();
      }
      alert("Restore complete.");
      nav("home");
    }catch(e){
      alert("Restore failed: "+(e&&e.message?e.message:"invalid or unsupported JSON."));
    }
  };
  r.readAsText(f);
}
function mergeSummary(d,mode){
  return `Restore Mode: ${mode}
Vehicles: ${d.vehicles.filter(Boolean).length}
Fuel: ${d.fuelRecords.length}
Maintenance: ${d.maintenanceRecords.length}
Insurance: ${d.insuranceRecords.length}`;
}
function mergeArray(target, incoming, mode){const ids=new Map(target.map((r,i)=>[r.recordId||r.id,i]));incoming.forEach(r=>{const id=r.recordId||r.id;if(mode==="Cancel")return;if(id&&ids.has(id)){if(mode==="Skip")return;if(mode==="Update"||mode==="Replace"){target[ids.get(id)]={...target[ids.get(id)],...r,modifiedAt:nowISO()}}if(mode==="Duplicate"){const c={...r,recordId:(r.recordId||r.id||uid("REC"))+"-DUP-"+Date.now().toString(36),id:undefined};target.push(c)}}else target.push(r)})}
function mergeData(d,mode){if(mode==="Cancel")return;d.vehicles.filter(Boolean).forEach((v,i)=>{if(!state.vehicles[i])state.vehicles[i]=v;else if(mode==="Update"||mode==="Replace")state.vehicles[i]={...state.vehicles[i],...v}});mergeArray(state.fuelRecords,d.fuelRecords,mode);mergeArray(state.maintenanceRecords,d.maintenanceRecords,mode);mergeArray(state.insuranceRecords,d.insuranceRecords,mode);mergeArray(state.vehicleAcquisitionRecords,d.vehicleAcquisitionRecords,mode)}
let previewRows=[];function parseCSV(t){const rows=[];let row=[],cell="",q=false;for(let i=0;i<t.length;i++){const ch=t[i],nx=t[i+1];if(ch==='"'&&q&&nx==='"'){cell+='"';i++;continue}if(ch==='"'){q=!q;continue}if(ch===","&&!q){row.push(cell);cell="";continue}if((ch==="\n"||ch==="\r")&&!q){if(ch==="\r"&&nx==="\n")i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell="";continue}cell+=ch}row.push(cell);if(row.some(x=>x.trim()))rows.push(row);return rows} function previewCSV(){const file=$("csvFile").files[0];if(!file)return alert("Choose a CSV file.");const reader=new FileReader();reader.onload=()=>{const parsed=parseCSV(reader.result);if(parsed.length<2){$("importStatus").textContent="No records.";return}const headers=parsed[0].map(h=>h.trim());const idx=n=>headers.findIndex(h=>h.toLowerCase()===n.toLowerCase());const get=(row,n)=>{const x=idx(n);return x>=0?row[x]:""};const vid=$("importVehicle").value;previewRows=parsed.slice(1).map(row=>{const typ=(get(row,"recordType")||get(row,"entryType")||"Fuel").toLowerCase();const base={recordId:get(row,"recordId")||get(row,"Record ID")||uid("IMP"),entrySequence:Number(get(row,"entrySequence")||get(row,"Entry Sequence"))||nextSeq(),source:get(row,"source")||"CSV Import",classificationTags:(get(row,"classificationTags")||"Imported").split(";").map(x=>x.trim()).filter(Boolean),dataQuality:get(row,"dataQuality")||"Review",notes:get(row,"notes")||get(row,"Notes")};if(typ.includes("maint"))return normMaint({...base,date:get(row,"date")||get(row,"Date"),dropOffDate:get(row,"dropOffDate")||get(row,"Date"),pickUpDate:get(row,"pickUpDate"),odometer:get(row,"odometer")||get(row,"Odometer"),category:get(row,"category")||"Maintenance",status:get(row,"status"),location:get(row,"location"),serviceProvider:get(row,"serviceProvider")||get(row,"provider"),performedBy:get(row,"performedBy"),totalCost:get(row,"totalCost")||get(row,"cost")},vid);return normFuel({...base,date:get(row,"date")||get(row,"Date"),time:get(row,"time")||get(row,"Time"),odometer:get(row,"odometer")||get(row,"Odometer"),miles:get(row,"miles")||get(row,"Total Miles"),gallons:get(row,"gallons")||get(row,"Gallons"),mpg:get(row,"mpg")||get(row,"MPG"),fuelGrade:get(row,"fuelGrade")||get(row,"Fuel Grade"),ethanolFree:get(row,"ethanolFree")||get(row,"Ethanol Free"),station:get(row,"station")||get(row,"Fuel Station"),fuelPricePerGallon:get(row,"fuelPricePerGallon"),totalFuelCost:get(row,"totalFuelCost"),fuelCostSource:get(row,"fuelCostSource")},vid)});const dup=previewRows.filter(r=>[...state.fuelRecords,...state.maintenanceRecords,...state.insuranceRecords].some(e=>e.recordId===r.recordId)).length;$("importStatus").textContent=`Preview complete.\\nRows ready: ${previewRows.length}\\nDuplicates: ${dup}\\nChoose duplicate mode before saving.`};reader.readAsText(file)}
function savePreviewRows(){if(!previewRows.length)return alert("Preview first.");const mode=$("importMode")?.value||"Skip";if(mode==="Cancel"){$("importStatus").textContent="Import cancelled.";previewRows=[];return}let imported=0,updated=0,skipped=0,duplicated=0,replaced=0;function targetFor(r){return r.recordType==="Maintenance"?state.maintenanceRecords:r.recordType==="Insurance"?state.insuranceRecords:state.fuelRecords}previewRows.forEach(r=>{const target=targetFor(r),i=target.findIndex(e=>e.recordId===r.recordId);if(i>=0){if(mode==="Skip"){skipped++;return}if(mode==="Update"){target[i]={...target[i],...r,modifiedAt:nowISO()};updated++;return}if(mode==="Replace"){target[i]=r;replaced++;return}if(mode==="Duplicate"){r={...r,recordId:r.recordId+"-DUP-"+Date.now().toString(36)};target.push(r);duplicated++;return}}else{target.push(r);imported++}});saveData();$("importStatus").textContent=`Import Summary\\nImported: ${imported}\\nUpdated: ${updated}\\nReplaced: ${replaced}\\nDuplicated: ${duplicated}\\nSkipped: ${skipped}`;previewRows=[]}
function reportsHome(app){app.innerHTML=header("Reports")+`<div class="card report-menu"><h2>Report Menu</h2><button class="wide" onclick="nav('reportFuel')">Fuel History Report</button><button class="wide" onclick="nav('reportMPG')">MPG Report</button><button class="wide" onclick="nav('reportMaintenance')">Maintenance Report</button><button class="wide" onclick="nav('reportInsurance')">Insurance History Report</button><button class="wide" onclick="nav('reportVehicle')">Vehicle Summary Report</button></div>`+bottomNav()+footer()} function reportDetail(app,s){let title="Report", rows=[]; if(s==="reportFuel"){title="Fuel History Report";rows=state.fuelRecords.filter(r=>!hasTag(r,"Archived")).sort((a,b)=>previousSort("Fuel",a,b)).map(r=>[r.date||"",getVehicle(r.vehicleId)?vehicleLabel(getVehicle(r.vehicleId)):"",fmt(r.odometer),fmt(r.miles),fmt(r.gallons,3),fmt(r.mpg)])} if(s==="reportMPG"){title="MPG Report";rows=state.fuelRecords.filter(r=>!hasTag(r,"Archived")&&!hasTag(r,"Historical")).sort((a,b)=>previousSort("Fuel",a,b)).map(r=>[r.date||"",fmt(r.odometer),fmt(r.miles),fmt(r.gallons,3),fmt(r.mpg)])} if(s==="reportMaintenance"){title="Maintenance Report";rows=state.maintenanceRecords.filter(r=>!hasTag(r,"Archived")).sort((a,b)=>previousSort("Maintenance",a,b)).map(r=>[r.dropOffDate||"",r.category||"",fmt(r.odometer),money(r.totalCost)])} if(s==="reportInsurance"){title="Insurance History Report";rows=state.insuranceRecords.filter(r=>!hasTag(r,"Archived")).sort((a,b)=>previousSort("Insurance",a,b)).map(r=>[r.company||"",r.policyNumber||"",r.effectiveDate||"",r.expirationDate||"",money(r.premium)])} if(s==="reportVehicle"){title="Vehicle Summary Report";rows=state.vehicles.filter(Boolean).map(v=>[vehicleLabel(v),v.status,state.fuelRecords.filter(r=>r.vehicleId===v.vehicleId&&!hasTag(r,"Archived")).length,state.maintenanceRecords.filter(r=>r.vehicleId===v.vehicleId&&!hasTag(r,"Archived")).length])} app.innerHTML=header(title)+`<div class="card"><p class="muted">Default views exclude Archived records. MPG report also excludes Historical records.</p><div style="overflow:auto"><table><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")||'<tr><td>No records.</td></tr>'}</tbody></table></div></div>`+bottomNav()+footer()}
function settings(app){app.innerHTML=header("Settings")+`<div class="card"><h2>Vehicle Order</h2><button class="wide" onclick="swapVehicles()">Swap Vehicle Circles</button></div><div class="card"><h2>About</h2><p>RGB Mileage v${VERSION}<br>Build Date: ${formatBuildDate(BUILD_DATE)}<br>Schema: ${SCHEMA_VERSION}</p><button class="wide danger" onclick="if(confirm('Clear all local data?')){localStorage.removeItem(KEY);state=blankData();saveData();nav('home')}">Clear Local Data</button></div>`+bottomNav()+footer()} function swapVehicles(){[state.vehicles[0],state.vehicles[1]]=[state.vehicles[1],state.vehicles[0]];state.vehicles.forEach((v,i)=>{if(v)v.slot=i});saveData();alert("Vehicle order swapped.");nav("home")}

function initV213eStabilization(){
  try{
    document.addEventListener("touchmove",e=>{if(route&&route.screen==="home")e.preventDefault()},{passive:false});
    const lock=()=>{try{if(screen.orientation&&screen.orientation.lock)screen.orientation.lock("portrait").catch(()=>{})}catch(e){}};
    lock();
    window.addEventListener("orientationchange",()=>setTimeout(lock,50),{passive:true});
  }catch(e){}
}
initV213aShell();initV213Shell();initV213eStabilization();state=loadData();render();if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js?v=213oa').catch(()=>{})}