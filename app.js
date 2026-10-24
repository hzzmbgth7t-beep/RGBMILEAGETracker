const APP_NAME="RGB Mileage", BUILD=Object.freeze({id:"v2.1.6l-wc10-f29-rc13",date:"2026-10-24",cacheRevision:"216lwc10f29rc13"}), VERSION=BUILD.id, BUILD_DATE=BUILD.date, SCHEMA_VERSION=RGBMDataV3.SCHEMA_VERSION, KEY=RGBMDataV3.ACTIVE_KEY;
const CUSTOM_LABEL_MAX_LENGTH=50;
const LAUNCH_URL_STATE={observed:"",normalized:"",changed:false,error:""};
const OFFLINE_STATE={
  online:typeof navigator==="undefined"||navigator.onLine!==false,
  supported:typeof navigator!=="undefined"&&"serviceWorker" in navigator,
  controlled:typeof navigator!=="undefined"
    &&!!navigator.serviceWorker
    &&!!navigator.serviceWorker.controller,
  cacheReady:false,
  updateReady:false,
  updateApplying:false,
  registration:null,
  error:"",
  lastMessage:""
};

function offlineStatusSummary(){
  if(!OFFLINE_STATE.supported){
    return "Offline shell is unavailable in this browser.";
  }
  if(OFFLINE_STATE.updateApplying){
    return "Applying the offline update…";
  }
  if(OFFLINE_STATE.updateReady){
    return "An offline update is ready.";
  }
  if(!OFFLINE_STATE.online){
    return OFFLINE_STATE.controlled||OFFLINE_STATE.cacheReady
      ?"Offline — local records and cached app files remain available."
      :"Offline — this browser has not confirmed the cached app shell.";
  }
  if(OFFLINE_STATE.controlled||OFFLINE_STATE.cacheReady){
    return "Online — offline app shell is ready.";
  }
  return "Online — preparing the offline app shell.";
}

function ensureNetworkStatusElement(){
  try{
    let element=$("networkStatus");
    if(element)return element;
    if(
      !document.body
      ||typeof document.createElement!=="function"
      ||typeof document.body.appendChild!=="function"
    ){
      return null;
    }
    element=document.createElement("div");
    element.id="networkStatus";
    element.className="network-status";
    element.setAttribute("role","status");
    element.setAttribute("aria-live","polite");
    element.hidden=true;
    document.body.appendChild(element);
    return element;
  }catch(error){
    return null;
  }
}

function serviceWorkerUpdateBadgeMarkup(){
  return [
    '<span>Update</span>',
    '<span>Offline</span>',
    '<span>Service</span>',
    '<span>Worker</span>'
  ].join("");
}

function ensureServiceWorkerUpdateBadge(){
  try{
    let badge=$("serviceWorkerUpdateBadge");
    if(badge)return badge;
    if(
      !document.body
      ||typeof document.createElement!=="function"
    ){
      return null;
    }
    badge=document.createElement("button");
    badge.id="serviceWorkerUpdateBadge";
    badge.className="service-worker-update-badge";
    badge.type="button";
    badge.setAttribute(
      "aria-label",
      "Apply Offline Service Worker Update"
    );
    badge.setAttribute(
      "title",
      "Apply Offline Service Worker Update"
    );
    badge.innerHTML=serviceWorkerUpdateBadgeMarkup();
    badge.hidden=true;
    badge.addEventListener("click",()=>{
      if(!OFFLINE_STATE.updateApplying)applyOfflineUpdate();
    });
    document.body.appendChild(badge);
    return badge;
  }catch(error){
    return null;
  }
}

function rectanglesOverlap(a,b,margin=0){
  return !(
    a.right+margin<=b.left
    ||a.left-margin>=b.right
    ||a.bottom+margin<=b.top
    ||a.top-margin>=b.bottom
  );
}

function badgeCandidateRect(left,top,width,height){
  return {
    left,
    top,
    right:left+width,
    bottom:top+height,
    width,
    height
  };
}

function placeServiceWorkerUpdateBadge(){
  const badge=$("serviceWorkerUpdateBadge");
  const app=$("app");
  if(
    !badge
    ||badge.hidden
    ||!route
    ||route.screen!=="home"
    ||!app
    ||typeof app.querySelector!=="function"
  ){
    return false;
  }

  const shell=app.querySelector(".home-shell");
  const vehicleArea=app.querySelector(".vehicle-area");
  if(!shell||!vehicleArea)return false;
  if(badge.parentElement!==shell)shell.appendChild(badge);

  const shellRect=shell.getBoundingClientRect();
  const areaRect=vehicleArea.getBoundingClientRect();
  const badgeRect=badge.getBoundingClientRect();
  const orientation=(
    shellRect.width>shellRect.height
      ?"landscape"
      :"portrait"
  );
  const width=Math.max(
    orientation==="landscape"?40:64,
    Math.round(
      badgeRect.width
      ||(orientation==="landscape"?46:72)
    )
  );
  const height=Math.max(
    orientation==="landscape"?40:78,
    Math.round(
      badgeRect.height
      ||(orientation==="landscape"?44:92)
    )
  );
  const inset=orientation==="landscape"?4:8;
  const clearance=orientation==="landscape"?2:12;

  const occupied=Array.from(
    shell.querySelectorAll(
      ".chrome-title, .version-subtitle, "
      +".circle-wrap, .bottom-nav"
    )
  ).filter(element=>element!==badge).map(element=>{
    let rect=element.getBoundingClientRect();
    if(
      element.matches(
        ".chrome-title, .version-subtitle"
      )
      &&document.createRange
      &&element.firstChild
    ){
      const range=document.createRange();
      range.selectNodeContents(element);
      const textRect=range.getBoundingClientRect();
      if(textRect.width>0&&textRect.height>0)rect=textRect;
    }
    return {
      left:rect.left-shellRect.left,
      top:rect.top-shellRect.top,
      right:rect.right-shellRect.left,
      bottom:rect.bottom-shellRect.top
    };
  });

  const area={
    left:areaRect.left-shellRect.left,
    top:areaRect.top-shellRect.top,
    right:areaRect.right-shellRect.left,
    bottom:areaRect.bottom-shellRect.top
  };

  const releases=orientation==="portrait"
    ?[
      [area.left+inset,area.top+clearance],
      [area.right-width-inset,area.top+clearance],
      [area.left+inset,area.bottom-height-inset],
      [area.right-width-inset,area.bottom-height-inset],
      [inset,inset]
    ]
    :[
      [inset,inset],
      [shellRect.width-width-inset,inset],
      [area.left+inset,area.top+inset],
      [area.right-width-inset,area.top+inset],
      [area.left+inset,area.bottom-height-inset],
      [area.right-width-inset,area.bottom-height-inset]
    ];

  let chosen=null;
  for(const [left,top] of releases){
    const rect=badgeCandidateRect(left,top,width,height);
    const inside=(
      rect.left>=inset
      &&rect.top>=inset
      &&rect.right<=shellRect.width-inset
      &&rect.bottom<=shellRect.height-inset
    );
    if(!inside)continue;
    if(occupied.some(item=>rectanglesOverlap(rect,item,clearance)))continue;
    chosen=rect;
    break;
  }

  if(!chosen){
    const step=8;
    let best=null;
    for(
      let top=inset;
      top+height<=shellRect.height-inset;
      top+=step
    ){
      for(
        let left=inset;
        left+width<=shellRect.width-inset;
        left+=step
      ){
        const rect=badgeCandidateRect(left,top,width,height);
        if(occupied.some(item=>rectanglesOverlap(rect,item,clearance)))continue;
        const edgeDistance=Math.min(
          rect.left,
          rect.top,
          shellRect.width-rect.right,
          shellRect.height-rect.bottom
        );
        const score=edgeDistance-(top*.01);
        if(!best||score>best.score)best={...rect,score};
      }
    }
    chosen=best;
  }

  if(!chosen){
    badge.hidden=true;
    return false;
  }

  badge.style.left=`${Math.round(chosen.left)}px`;
  badge.style.top=`${Math.round(chosen.top)}px`;
  badge.dataset.placement=orientation;
  return true;
}

function refreshServiceWorkerUpdateBadge(){
  const badge=ensureServiceWorkerUpdateBadge();
  if(!badge)return;
  const show=!!(
    OFFLINE_STATE.updateReady
    &&route
    &&route.screen==="home"
  );
  badge.hidden=!show;
  badge.disabled=OFFLINE_STATE.updateApplying;
  badge.setAttribute(
    "aria-busy",
    OFFLINE_STATE.updateApplying?"true":"false"
  );
  if(show){
    badge.innerHTML=serviceWorkerUpdateBadgeMarkup();
    requestAnimationFrame(()=>placeServiceWorkerUpdateBadge());
  }
}

function refreshOfflineUI(){
  const element=ensureNetworkStatusElement();
  const showOffline=!OFFLINE_STATE.online;
  const showUpdate=OFFLINE_STATE.updateReady;
  const showError=!!OFFLINE_STATE.error;

  if(element){
    element.hidden=!(showOffline||showError);
    element.className=[
      "network-status",
      showOffline?"is-offline":"",
      showError?"has-error":""
    ].filter(Boolean).join(" ");
    element.textContent=showError
      ?"Offline unavailable"
      :"Offline";
  }

  refreshServiceWorkerUpdateBadge();

  if(route&&route.screen==="settings"){
    const status=$("offlineModeStatus");
    if(status)status.textContent=offlineStatusSummary();
    const applyButton=$("applyOfflineUpdateButton");
    if(applyButton){
      applyButton.hidden=!OFFLINE_STATE.updateReady;
      applyButton.disabled=OFFLINE_STATE.updateApplying;
    }
  }
}

function setOnlineState(online){
  OFFLINE_STATE.online=online!==false;
  OFFLINE_STATE.error="";
  refreshOfflineUI();
}

function serviceWorkerStateChanged(worker){
  if(!worker)return;
  if(worker.state==="installed"){
    if(navigator.serviceWorker.controller){
      OFFLINE_STATE.updateReady=true;
    }else{
      OFFLINE_STATE.cacheReady=true;
    }
    refreshOfflineUI();
  }
}

function observeServiceWorkerRegistration(registration){
  OFFLINE_STATE.registration=registration;
  OFFLINE_STATE.controlled=!!navigator.serviceWorker.controller;
  OFFLINE_STATE.cacheReady=(
    OFFLINE_STATE.controlled
    ||!!registration.active
    ||!!registration.waiting
  );
  OFFLINE_STATE.updateReady=!!(
    registration.waiting
    &&navigator.serviceWorker.controller
  );

  if(registration.installing){
    registration.installing.addEventListener(
      "statechange",
      ()=>serviceWorkerStateChanged(registration.installing)
    );
  }

  registration.addEventListener("updatefound",()=>{
    const worker=registration.installing;
    if(worker){
      worker.addEventListener(
        "statechange",
        ()=>serviceWorkerStateChanged(worker)
      );
    }
  });

  refreshOfflineUI();
}

async function requestOfflineUpdate(){
  const registration=OFFLINE_STATE.registration;
  if(!registration)return false;
  try{
    await registration.update();
    OFFLINE_STATE.error="";
    refreshOfflineUI();
    return true;
  }catch(error){
    OFFLINE_STATE.error=error&&error.message
      ?String(error.message)
      :"Update check failed";
    refreshOfflineUI();
    return false;
  }
}

function applyOfflineUpdate(){
  const registration=OFFLINE_STATE.registration;
  const waiting=registration&&registration.waiting;
  if(!waiting)return false;
  OFFLINE_STATE.updateApplying=true;
  refreshOfflineUI();
  waiting.postMessage({type:"SKIP_WAITING"});
  return true;
}


function currentAppBaseUrl(){
  try{
    const url=new URL("./",location.href);
    url.search="";
    url.hash="";
    return url.href;
  }catch(error){
    return "";
  }
}

function isCurrentAppServiceWorkerRegistration(registration){
  if(!registration||!registration.scope)return false;
  const base=currentAppBaseUrl();
  if(!base)return true;
  return base.startsWith(registration.scope)||registration.scope.startsWith(base);
}

async function clearAppShellCaches(){
  if(typeof caches==="undefined"||!caches.keys)return [];
  const keys=await caches.keys();
  const appShellKeys=keys.filter(key=>/^rgbm-app-shell-/i.test(String(key)));
  await Promise.all(appShellKeys.map(key=>caches.delete(key)));
  return appShellKeys;
}

async function unregisterCurrentAppServiceWorkers(){
  if(
    !navigator.serviceWorker
    ||typeof navigator.serviceWorker.getRegistrations!=="function"
  ){
    return [];
  }
  const registrations=await navigator.serviceWorker.getRegistrations();
  const targets=registrations.filter(isCurrentAppServiceWorkerRegistration);
  await Promise.all(targets.map(registration=>registration.unregister()));
  return targets.map(registration=>registration.scope);
}

function cacheResetReloadUrl(){
  const url=new URL(canonicalLaunchUrl(location.href));
  url.searchParams.set("reset",Date.now().toString(36));
  return url.href;
}

function setAppShellResetStatus(message){
  const status=$("appShellResetStatus");
  if(status)status.textContent=message;
}

async function resetAppShellCache(){
  if(!confirm("Reset cached app files and reload the current version? Vehicle data is preserved. Create a JSON backup first if you have not already done so."))return false;
  setAppShellResetStatus("Resetting cached app files…");
  try{
    saveData();
    const deletedCaches=await clearAppShellCaches();
    const unregisteredScopes=await unregisterCurrentAppServiceWorkers();
    setAppShellResetStatus(
      `Reset complete.\nDeleted app-shell caches: ${deletedCaches.length}\nUnregistered service workers: ${unregisteredScopes.length}\nReloading current version…`
    );
    setTimeout(()=>location.replace(cacheResetReloadUrl()),400);
    return true;
  }catch(error){
    const message=error&&error.message?String(error.message):String(error);
    setAppShellResetStatus(`Reset failed: ${message}`);
    alert(`App cache reset failed: ${message}`);
    return false;
  }
}


function requestOfflineStatus(){
  const controller=navigator.serviceWorker&&navigator.serviceWorker.controller;
  if(!controller)return false;
  controller.postMessage({type:"GET_OFFLINE_STATUS"});
  return true;
}

function initOfflineMode(){
  ensureNetworkStatusElement();
  refreshOfflineUI();

  window.addEventListener(
    "online",
    ()=>setOnlineState(true),
    {passive:true}
  );
  window.addEventListener(
    "offline",
    ()=>setOnlineState(false),
    {passive:true}
  );

  if(!OFFLINE_STATE.supported)return;

  navigator.serviceWorker.addEventListener("message",event=>{
    const message=event&&event.data;
    if(!message||typeof message!=="object")return;
    if(message.type==="RGBM_OFFLINE_READY"){
      OFFLINE_STATE.cacheReady=true;
      OFFLINE_STATE.lastMessage="RGBM_OFFLINE_READY";
      refreshOfflineUI();
    }
    if(message.type==="RGBM_OFFLINE_STATUS"){
      OFFLINE_STATE.cacheReady=message.cacheReady===true;
      OFFLINE_STATE.lastMessage="RGBM_OFFLINE_STATUS";
      refreshOfflineUI();
    }
  });

  navigator.serviceWorker.addEventListener("controllerchange",()=>{
    OFFLINE_STATE.controlled=true;
    OFFLINE_STATE.cacheReady=true;
    OFFLINE_STATE.updateReady=false;
    OFFLINE_STATE.updateApplying=false;
    refreshOfflineUI();
    if(document.visibilityState==="visible"){
      location.reload();
    }
  });

  navigator.serviceWorker.register(
    `sw.js?v=${BUILD.cacheRevision}`
  ).then(registration=>{
    observeServiceWorkerRegistration(registration);
    requestOfflineStatus();
    return registration.update().catch(()=>null);
  }).catch(error=>{
    OFFLINE_STATE.error=error&&error.message
      ?String(error.message)
      :"Service worker registration failed";
    refreshOfflineUI();
  });
}

function canonicalLaunchUrl(input){try{const url=new URL(String(input||""));if(!/^https?:$/.test(url.protocol))return url.href;url.pathname=url.pathname.replace(/index\.html$/i,"");if(!url.pathname.endsWith("/"))url.pathname+="/";url.search="";url.searchParams.set("v",BUILD.cacheRevision);return url.href}catch(e){return String(input||"")}}
function normalizeLaunchUrl(){const observed=String(typeof location!=="undefined"&&location.href?location.href:"");const normalized=canonicalLaunchUrl(observed);let changed=false,error="";try{if(normalized&&observed!==normalized&&typeof history!=="undefined"&&typeof history.replaceState==="function"){history.replaceState(history.state||null,"",normalized);changed=true}}catch(e){error=e&&e.message?String(e.message):"URL normalization failed"}Object.assign(LAUNCH_URL_STATE,{observed,normalized:normalized||observed,changed,error});return {...LAUNCH_URL_STATE}}
function isStandaloneDisplayMode(){
  return !!(
    (
      window.matchMedia
      &&window.matchMedia("(display-mode: standalone)").matches
    )
    ||navigator.standalone===true
  );
}

let browserHomeViewportToken=0;
let browserHomeViewportTimer=0;

function styleSet(element,name,value){
  if(!element||!element.style)return;
  if(typeof element.style.setProperty==="function"){
    element.style.setProperty(name,value);
  }else{
    element.style[name]=value;
  }
}

function styleRemove(element,name){
  if(!element||!element.style)return;
  if(typeof element.style.removeProperty==="function"){
    element.style.removeProperty(name);
  }else{
    delete element.style[name];
  }
}

function browserHomeViewportSize(){
  if(isStandaloneDisplayMode())return null;
  const viewport=window.visualViewport;
  const width=Math.max(
    1,
    Math.round(
      viewport&&viewport.width
        ?viewport.width
        :window.innerWidth
          ||document.documentElement.clientWidth
          ||1
    )
  );
  const height=Math.max(
    1,
    Math.round(
      viewport&&viewport.height
        ?viewport.height
        :window.innerHeight
          ||document.documentElement.clientHeight
          ||1
    )
  );
  const offsetTop=Math.round(
    viewport&&Number.isFinite(viewport.offsetTop)
      ?viewport.offsetTop
      :0
  );
  const offsetLeft=Math.round(
    viewport&&Number.isFinite(viewport.offsetLeft)
      ?viewport.offsetLeft
      :0
  );
  return {
    width,
    height,
    offsetTop,
    offsetLeft,
    visibleBottom:offsetTop+height,
    source:viewport
      ?"browser-visualViewport-height"
      :"browser-innerHeight-fallback"
  };
}

function cancelBrowserHomeViewportStabilization(){
  browserHomeViewportToken+=1;
  if(browserHomeViewportTimer){
    clearTimeout(browserHomeViewportTimer);
    browserHomeViewportTimer=0;
  }
}

function applyBrowserHomeViewport(){
  const app=$("app");
  if(!app||!app.style)return null;

  if(isStandaloneDisplayMode()){
    styleRemove(app,"--home-browser-viewport-height");
    styleRemove(app,"--home-browser-viewport-width");
    if(app.dataset){
      app.dataset.homeViewportMode="standalone-100vh";
    }
    return null;
  }

  const size=browserHomeViewportSize();
  if(!size)return null;
  styleSet(
    app,
    "--home-browser-viewport-height",
    `${size.height}px`
  );
  styleSet(
    app,
    "--home-browser-viewport-width",
    `${size.width}px`
  );
  if(app.dataset){
    app.dataset.homeViewportMode=size.source;
  }
  return size;
}

function stabilizeBrowserHomeViewport(maxFrames=12){
  cancelBrowserHomeViewportStabilization();

  if(isStandaloneDisplayMode()){
    applyBrowserHomeViewport();
    scheduleHomeGeometry();
    return null;
  }

  const token=browserHomeViewportToken;
  let frame=0;
  let stableFrames=0;
  let previousSignature="";

  const sample=()=>{
    if(
      token!==browserHomeViewportToken
      ||!route
      ||route.screen!=="home"
      ||isStandaloneDisplayMode()
    ){
      return;
    }

    const size=applyBrowserHomeViewport();
    if(!size)return;
    const signature=[
      size.width,
      size.height,
      size.offsetTop,
      size.offsetLeft
    ].join(":");

    stableFrames=signature===previousSignature
      ?stableFrames+1
      :0;
    previousSignature=signature;
    frame+=1;
    scheduleHomeGeometry();

    if(frame<maxFrames&&stableFrames<3){
      if(window.requestAnimationFrame){
        requestAnimationFrame(sample);
      }else{
        setTimeout(sample,16);
      }
    }
  };

  if(window.requestAnimationFrame){
    requestAnimationFrame(sample);
  }else{
    setTimeout(sample,0);
  }

  browserHomeViewportTimer=setTimeout(()=>{
    browserHomeViewportTimer=0;
    if(
      token===browserHomeViewportToken
      &&route
      &&route.screen==="home"
      &&!isStandaloneDisplayMode()
    ){
      applyBrowserHomeViewport();
      scheduleHomeGeometry();
    }
  },300);

  return token;
}
function formatDisplayDate(d){const value=String(d||"").trim();if(!value)return "";const match=/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(value);return match?`${match[2]}/${match[3]}/${match[1]}`:value} function formatBuildDate(d){return formatDisplayDate(d)}
const LEGACY_KEYS=[...RGBMDataV3.LEGACY_KEYS];
const STATIONS_DEFAULT=["Murphy USA","Circle K","refuel","BP","Shell","Other"], MAINT_CATS=["Oil Change","Tire Rotation","Brakes","Cooling System","Suspension","Electrical","Engine","Transmission","Inspection","Detailing","Repair","Other"], RECORD_ORIGINS=["Manual Entry","Other Data","Migration"], RECORD_STATUSES=["","Incomplete","Historical","Review"], RECORD_LIFECYCLES=["","Archived"], FUEL_GRADES=["","87","89","90","91","93","Other"];
let state, route={screen:"home"}, historyStack=[], longTimer=null, suppressTap=false, editSnapshot=null;
let rowInteraction={timer:null,long:false,type:null,recordId:null};
let rowTouchState={active:false,pointerId:null,startX:0,startY:0,moved:false};
let recentRowSuppressUntil=0;
let pendingRecordOpen=null;
function nowISO(){return new Date().toISOString()} function uid(p="ID"){return p+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)} function arr(v){return Array.isArray(v)?v:[]} function tags(v){return Array.isArray(v)?v:(v?[String(v)]:[])} function hasTag(r,t){return tags(r.classificationTags).includes(t)} function addTag(r,t){r.classificationTags=tags(r.classificationTags);if(!r.classificationTags.includes(t))r.classificationTags.push(t)} function removeTag(r,t){r.classificationTags=tags(r.classificationTags).filter(x=>x!==t)}
function hasExplicitOriginMetadata(r){
  const raw=String((r&& (r.origin||r.source)) || "").trim();
  return /manual entry|other data|import|migration|legacy|normalized|converted|restore/i.test(raw);
}
function canonicalOrigin(r){
  const raw=String((r&& (r.origin||r.source)) || "").trim();
  const imported=hasTag(r,"Imported");
  if(/^manual entry$/i.test(raw)) return "Manual Entry";
  if(/^other data$/i.test(raw)) return "Other Data";
  if(/^import$/i.test(raw)) return "Other Data";
  if(imported || /csv|xlsx|file upload/i.test(raw)) return "Other Data";
  if(/migration|legacy|normalized|converted/i.test(raw)) return "Migration";
  if(/restore/i.test(raw)) return String(r.previousOrigin||r.originBeforeRestore||"").trim() || "Migration";
  if(raw==="Other Data" || raw==="Migration" || raw==="Manual Entry") return raw;
  if(raw==="") return "";
  return "Migration";
}
function canonicalLifecycle(r){
  return hasTag(r,"Archived") || String(r.lifecycle||"")==="Archived" ? "Archived" : "";
}
function isFuelManualIncomplete(r){
  return String(r.origin||canonicalOrigin(r))==="Manual Entry" && (r.odometer==="" || r.gallons==="");
}
function applyFuelLabelModel(d){
  const fuel=arr(d&&d.fuelRecords);
  fuel.forEach(r=>{
    const existingOrigin=canonicalOrigin(r);
    if(!String(r.date||"").trim()){
      r.origin="Migration";
      r.source="Migration";
    }else{
      r.origin=existingOrigin || "Migration";
      r.source=r.origin;
    }
  });
  const incompleteIds=fuel.filter(r=>canonicalLifecycle(r)!=="Archived" && isFuelManualIncomplete(r)).sort((a,b)=>previousSort("Fuel",a,b)).map(r=>r.recordId);
  const currentIncomplete=incompleteIds.length?String(incompleteIds[0]):"";
  fuel.forEach(r=>{
    r.lifecycle=canonicalLifecycle(r);
    const hadReview = String(r.status||r.dataQuality||"")==="Review";
    const hadHistorical = String(r.status||r.dataQuality||"")==="Historical" || hasTag(r,"Historical");
    removeTag(r,"Imported");
    removeTag(r,"Historical");
    if(r.lifecycle==="Archived") addTag(r,"Archived"); else removeTag(r,"Archived");
    if(hadReview){
      r.status="Review";
    }else if(isFuelManualIncomplete(r)){
      r.status=String(r.recordId)===currentIncomplete ? "Incomplete" : "Historical";
    }else if(hadHistorical){
      r.status="Historical";
    }else{
      r.status="";
    }
    r.dataQuality=r.status||"";
    r.classificationTags=tags(r.classificationTags).filter(t=>t==="Archived");
  });
  return d;
}
function applyMaintenanceLabelModel(d){
  const maint=arr(d&&d.maintenanceRecords);
  maint.forEach(r=>{
    const existingOrigin=canonicalOrigin(r);
    if(!String(r.date||r.dropOffDate||"").trim()){
      r.origin="Migration";
      r.source="Migration";
    }else{
      r.origin=existingOrigin || "Migration";
      r.source=r.origin;
    }
  });
  maint.forEach(r=>{
    r.lifecycle=canonicalLifecycle(r);
    const hadReview = String(r.status||r.dataQuality||"")==="Review";
    const hadHistorical = String(r.status||r.dataQuality||"")==="Historical" || hasTag(r,"Historical");
    removeTag(r,"Imported");
    removeTag(r,"Historical");
    if(r.lifecycle==="Archived") addTag(r,"Archived"); else removeTag(r,"Archived");
    if(hadReview){
      r.status="Review";
    }else if(hadHistorical){
      r.status="Historical";
    }else{
      r.status="";
    }
    r.dataQuality=r.status||"";
    r.classificationTags=tags(r.classificationTags).filter(t=>t==="Archived");
  });
  return d;
}
function applyInsuranceLabelModel(d){
  const ins=arr(d&&d.insuranceRecords);
  ins.forEach(r=>{
    const existingOrigin=canonicalOrigin(r);
    if(!String(r.effectiveDate||"").trim()){
      r.origin="Migration";
      r.source="Migration";
    }else{
      r.origin=existingOrigin || "Migration";
      r.source=r.origin;
    }
  });
  ins.forEach(r=>{
    r.lifecycle=canonicalLifecycle(r);
    const hadReview = String(r.status||r.dataQuality||"")==="Review";
    const hadHistorical = String(r.status||r.dataQuality||"")==="Historical" || hasTag(r,"Historical");
    removeTag(r,"Imported");
    removeTag(r,"Historical");
    if(r.lifecycle==="Archived") addTag(r,"Archived"); else removeTag(r,"Archived");
    if(hadReview){
      r.status="Review";
    }else if(hadHistorical){
      r.status="Historical";
    }else{
      r.status="";
    }
    r.dataQuality=r.status||"";
    r.classificationTags=tags(r.classificationTags).filter(t=>t==="Archived");
  });
  return d;
}
function applyRecordLabelModel(d){
  if(!d || typeof d!=="object") return d;
  applyFuelLabelModel(d);
  applyMaintenanceLabelModel(d);
  applyInsuranceLabelModel(d);
  return d;
}
function meaningfulStatus(r){return String((r&&r.status)||"").trim()}
function numVal(v){if(v===null||v===undefined||v==="")return "";const n=Number(String(v).replace(/[$,]/g,""));return Number.isFinite(n)?n:""} function cleanText(v){return String(v??"").trim()} function requireValue(v,label){const s=cleanText(v);if(!s)throw new Error(`${label} is required.`);return s} function requireNonNegative(v,label){const n=numVal(v);if(n==="")return "";if(n<0)throw new Error(`${label} cannot be negative.`);return n} function requirePositive(v,label){const n=numVal(v);if(n==="")return "";if(n<=0)throw new Error(`${label} must be greater than zero.`);return n}



function initApplicationShell(){
  try{
    document.documentElement.style.background="#0a1324";
    document.body.style.background="#0a1324";
    document.body.style.overflow="hidden";
    document.body.style.position="fixed";
    document.body.style.inset="0";
    document.body.style.width="100%";
    document.body.style.height="100dvh";
    const viewportMeta=document.querySelector("meta[name=viewport]");
    if(viewportMeta){
      viewportMeta.setAttribute(
        "content",
        "width=device-width, initial-scale=1, maximum-scale=1, "
          +"user-scalable=no, viewport-fit=cover"
      );
    }
    document.addEventListener(
      "gesturestart",
      event=>event.preventDefault(),
      {passive:false}
    );
    let lastTouchEnd=0;
    document.addEventListener(
      "touchend",
      event=>{
        const current=Date.now();
        if(current-lastTouchEnd<=300)event.preventDefault();
        lastTouchEnd=current;
      },
      {passive:false}
    );
  }catch(error){}
}
function clearRGBMStorage(keepCurrent=false){
  const prefixes=["RGBM_DATA_","rgbMileage","rgbm_data_"];
  const keys=[];
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(prefixes.some(p=>k&&k.startsWith(p))) keys.push(k);
  }
  keys.forEach(k=>{ if(!keepCurrent || k!==KEY) localStorage.removeItem(k); });
  if(!keepCurrent){try{localStorage.removeItem("RGBM_CLOUD_SYNCED");localStorage.removeItem("RGBM_CLOUD_LINKED")}catch(e){}}
}
function storageBytes(obj){
  try{return new Blob([JSON.stringify(obj)]).size}
  catch(e){return JSON.stringify(obj).length}
}
function dataContext(sourceKey=""){
  return {
    appVersion:VERSION,
    sourceKey,
    now:nowISO,
    idFactory:uid,
    legacyKeys:LEGACY_KEYS,
    defaults:{
      fuelGrades:[...FUEL_GRADES],
      stations:[...STATIONS_DEFAULT],
      maintenanceCategories:[...MAINT_CATS],
      settings:{lastBackupDate:"",showArchived:false},
      nextEntrySequence:1
    }
  };
}
function blankData(){return RGBMDataV3.createBlankDataV3(dataContext("new-install"))}
function normalizeData(input,sourceKey="restore"){
  const result=RGBMDataV3.migrateToV3(input,dataContext(sourceKey));
  const d=result.state;
  if(!Array.isArray(d.stations)||!d.stations.length)d.stations=[...STATIONS_DEFAULT];
  if(!d.stations.includes("Other"))d.stations.push("Other");
  if(!Array.isArray(d.fuelGrades)||!d.fuelGrades.length)d.fuelGrades=[...FUEL_GRADES];
  if(!d.fuelGrades.includes("Other"))d.fuelGrades.push("Other");
  if(!Array.isArray(d.maintenanceCategories)||!d.maintenanceCategories.length)d.maintenanceCategories=[...MAINT_CATS];
  if(!d.maintenanceCategories.includes("Other"))d.maintenanceCategories.push("Other");
  applyRecordLabelModel(d);
  window.__RGBM_WC10_LAST_MIGRATION_REPORT=result.report;
  return d;
}
function loadData(){
  const result=RGBMDataV3.loadCanonicalState(localStorage,dataContext());
  const d=result.state;
  if(!Array.isArray(d.stations)||!d.stations.length)d.stations=[...STATIONS_DEFAULT];
  if(!d.stations.includes("Other"))d.stations.push("Other");
  if(!Array.isArray(d.fuelGrades)||!d.fuelGrades.length)d.fuelGrades=[...FUEL_GRADES];
  if(!d.fuelGrades.includes("Other"))d.fuelGrades.push("Other");
  if(!Array.isArray(d.maintenanceCategories)||!d.maintenanceCategories.length)d.maintenanceCategories=[...MAINT_CATS];
  if(!d.maintenanceCategories.includes("Other"))d.maintenanceCategories.push("Other");
  applyRecordLabelModel(d);
  window.__RGBM_WC10_LAST_MIGRATION_REPORT=result.report;
  if(d.appVersion!==VERSION||d.buildId!==VERSION||d.buildDate!==BUILD_DATE){
    d.appVersion=VERSION;
    d.buildId=VERSION;
    d.buildDate=BUILD_DATE;
    return saveData(d);
  }
  return d;
}
function saveData(d=state,opts={}){
  applyRecordLabelModel(d);
  d.schemaVersion=SCHEMA_VERSION;
  d.migrationVersion=RGBMDataV3.MIGRATION_VERSION;
  d.appVersion=VERSION;
  d.buildId=VERSION;
  d.buildDate=BUILD_DATE;
  d.modifiedAt=nowISO();
  state=RGBMDataV3.saveActiveState(localStorage,d,dataContext("active-save"));
  if(!(opts&&opts.skipCloud)&&typeof cloudSchedulePush==="function")cloudSchedulePush();
  return state;
}
function nextSeq(){const n=state.nextEntrySequence||1;state.nextEntrySequence=n+1;return n} function baseRecord(type,vid,source="Manual Entry"){return {recordId:uid(type.toUpperCase()),entrySequence:nextSeq(),recordType:type,vehicleId:vid,source,origin:source,status:"",lifecycle:"",classificationTags:[],dataQuality:"",createdAt:nowISO(),modifiedAt:nowISO(),notes:""}}
function normRecord(r,type,vid){const rec={...r};rec.recordType=rec.recordType||type;rec.vehicleId=rec.vehicleId||vid||"";rec.recordId=rec.recordId||rec.id||uid(type.toUpperCase());rec.entrySequence=Number(rec.entrySequence)||nextSeq();rec.source=rec.source||rec.origin||"JSON Restore";rec.origin=rec.origin||rec.source||"JSON Restore";rec.classificationTags=tags(rec.classificationTags);rec.lifecycle=rec.lifecycle||canonicalLifecycle(rec);rec.status=RECORD_STATUSES.includes(rec.status)?rec.status:"";rec.dataQuality=rec.dataQuality||rec.status||"";rec.createdAt=rec.createdAt||nowISO();rec.modifiedAt=rec.modifiedAt||nowISO();rec.notes=rec.notes||"";return rec}
function normFuel(r,vid){const rec=normRecord(r,"Fuel",vid);Object.assign(rec,{date:r.date||"",time:r.time||"",odometer:numVal(r.odometer),miles:numVal(r.miles||r.totalMiles),gallons:numVal(r.gallons),mpg:numVal(r.mpg),fuelGrade:r.fuelGrade||r.grade||"",ethanolFree:r.ethanolFree||"",station:r.station||"",fuelPricePerGallon:numVal(r.fuelPricePerGallon||r.price),totalFuelCost:numVal(r.totalFuelCost||r.cost),fuelCostSource:r.fuelCostSource||"",attachments:arr(r.attachments)}); if((rec.odometer!==""&&rec.miles==="")||(rec.mpg!==""&&(+rec.mpg>18||+rec.mpg<6))) rec.status=rec.status||"Historical"; return rec}
function normMaint(r,vid){const rec=normRecord(r,"Maintenance",vid);Object.assign(rec,{date:r.date||r.dropOffDate||r.serviceDate||"",dropOffDate:r.dropOffDate||r.date||r.serviceDate||r.drop||"",pickUpDate:r.pickUpDate||r.pick||"",category:r.category||r.service||r.type||"Maintenance",status:r.status||"",odometer:numVal(r.odometer||r.mileage),location:r.location||r.shop||"",serviceProvider:r.serviceProvider||r.provider||r.vendor||"",provider:r.provider||r.serviceProvider||r.vendor||"",performedBy:r.performedBy||"",totalCost:numVal(r.totalCost||r.cost||r.amount),cost:numVal(r.totalCost||r.cost||r.amount),notes:r.notes||r.description||"",attachments:arr(r.attachments)});return rec}
function normIns(r,vid){const rec=normRecord(r,"Insurance",vid);Object.assign(rec,{company:r.company||r.insCompany||"",policyNumber:r.policyNumber||r.policy||"",effectiveDate:r.effectiveDate||"",expirationDate:r.expirationDate||"",coverageValue:numVal(r.coverageValue||r.insuranceValue),insuranceValue:numVal(r.insuranceValue||r.coverageValue),agreedValue:numVal(r.agreedValue),premium:numVal(r.premium),agent:r.agent||r.agentName||"",agentName:r.agentName||r.agent||"",agency:r.agency||"",phone:r.phone||"",email:r.email||"",coverageNotes:r.coverageNotes||"",attachments:arr(r.attachments)});return rec}
function $(id){return document.getElementById(id)} function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))} function fmt(v,d=2){return v!==""&&v!=null&&Number.isFinite(+v)?(+v).toFixed(d):""} function fmtMpg(v){return fmt(v,3)} function fmtPricePerGallon(v){return v!==""&&v!=null&&Number.isFinite(+v)?"$"+(+v).toFixed(3):""} function money(v){return v!==""&&v!=null&&Number.isFinite(+v)?"$"+(+v).toFixed(2):""}
function cloneRoute(r){return r?JSON.parse(JSON.stringify(r)):null}
function renderRoute(){render();setTimeout(()=>{const app=$("app"); if(app)app.scrollTo(0,0); scrollTo(0,0)},0)}
function rawNav(screen,params={},push=true){if(push)historyStack.push(cloneRoute(route));route={screen,...params};renderRoute()}
function nav(screen,params={},push=true){
  if(screen==="home" && route.screen==="quickFuel") return handleQuickFuelHome();
  if(screen==="home" && route.screen==="quickMaintenance") return handleQuickMaintenanceHome();
  if(screen==="home" && route.screen==="quickInsurance") return handleQuickInsuranceHome();
  return rawNav(screen,params,push);
}
function resolveRecordReturnTo(){return (["recordView","recordEdit"].includes(route.screen)&&route.returnTo)?cloneRoute(route.returnTo):cloneRoute(route)}
function resolveReportReturnTo(){return (String(route.screen||"").startsWith("report")&&route.returnTo)?cloneRoute(route.returnTo):cloneRoute(route)}
function navRecord(type,recordId,mode){const screen=mode==="edit"?"recordEdit":"recordView";route={screen,...{type,recordId,returnTo:resolveRecordReturnTo()}};renderRoute();if(screen==="recordEdit")focusEditTop()}
function openReport(screen){route={screen,returnTo:resolveReportReturnTo()};renderRoute()}
function performBackNavigation(){
  const target=(route&&route.returnTo&&((["recordView","recordEdit"].includes(route.screen))||String(route.screen||"").startsWith("report")))?cloneRoute(route.returnTo):historyStack.pop();
  if(target){route=target;editSnapshot=null;renderRoute()}else rawNav("home",{},false)
}
function goHome(){if(route.screen==="quickFuel")return handleQuickFuelHome();if(route.screen==="quickMaintenance")return handleQuickMaintenanceHome();if(route.screen==="quickInsurance")return handleQuickInsuranceHome();return nav("home")}
function goBack(){if(route.screen==="recordEdit")return handleRecordEditBack();if(route.screen==="quickFuel")return handleQuickFuelBack();if(route.screen==="quickMaintenance")return handleQuickMaintenanceBack();if(route.screen==="quickInsurance")return handleQuickInsuranceBack();performBackNavigation()}
function focusEditTop(){setTimeout(()=>{const app=$("app"); if(app)app.scrollTo({top:0,left:0,behavior:"auto"}); const first=document.querySelector(".form-grid input,.form-grid select,.form-grid textarea"); if(first&&first.focus)try{first.focus({preventScroll:true})}catch(e){}},0)}
function currentRecordEditValues(type){if(type==="Fuel")return {date:cleanText($("efdate")?.value),time:cleanText($("eftime")?.value),odometer:cleanText($("efodo")?.value),miles:cleanText($("efmiles")?.value),gallons:cleanText($("efgal")?.value),mpg:cleanText($("efmpg")?.value),fuelGrade:cleanText($("efgrade")?.value),ethanolFree:cleanText($("efef")?.value),station:cleanText($("efstation")?.value),fuelCostSource:cleanText($("efcostsource")?.value),fuelPricePerGallon:cleanText($("efprice")?.value),totalFuelCost:cleanText($("efcost")?.value),notes:cleanText($("efnotes")?.value)};if(type==="Maintenance")return {date:cleanText($("emdate")?.value),category:cleanText($("emcat")?.value),odometer:cleanText($("emodo")?.value),totalCost:cleanText($("emcost")?.value),location:cleanText($("emloc")?.value),serviceProvider:cleanText($("emprov")?.value),notes:cleanText($("emnotes")?.value)};if(type==="Insurance")return {company:cleanText($("eicomp")?.value),policyNumber:cleanText($("eipol")?.value),effectiveDate:cleanText($("eieff")?.value),expirationDate:cleanText($("eiexp")?.value),coverageValue:cleanText($("eicov")?.value),premium:cleanText($("eiprem")?.value),agent:cleanText($("eiagent")?.value),phone:cleanText($("eiphone")?.value),email:cleanText($("eiemail")?.value),agency:cleanText($("eiagency")?.value),notes:cleanText($("einotes")?.value)};return {}}
function setEditSnapshot(type,recordId){editSnapshot={type,recordId,values:currentRecordEditValues(type)}}
function isRecordEditDirty(){return !!(route.screen==="recordEdit"&&editSnapshot&&JSON.stringify(editSnapshot.values)!==JSON.stringify(currentRecordEditValues(route.type)))}
function handleRecordEditBack(){if(!isRecordEditDirty())return performBackNavigation();if(confirm("You have unsaved changes. Press OK to save them before leaving.")){if(saveRecordEdit(route.type,route.recordId,true))return false;return false}if(confirm("Discard your unsaved changes and go back?")){editSnapshot=null;performBackNavigation()}return false}

 function footer(){return `<div class="version">RGB Mileage ${VERSION} - ${formatBuildDate(BUILD_DATE)}</div>`} 

function isVehicleConfigured(v){return RGBMDataV3.isVehicleConfigured(v)}
function orderedVehicles(){return RGBMDataV3.getOrderedVehicles(state)}
function configuredVehicles(){return RGBMDataV3.getConfiguredVehicles(state)}
function normalizeVehicleCustomLabel(value){
  return cleanText(value).slice(0,CUSTOM_LABEL_MAX_LENGTH);
}
function vehicleDefaultLabel(v){
  if(!v)return "Vehicle";
  return [v.year,v.make,v.model,v.badge]
    .map(cleanText)
    .filter(Boolean)
    .join(" ")
    ||cleanText(v.nickname)
    ||cleanText(v.displayName)
    ||"Vehicle";
}
function vehicleLabel(v){
  if(!v||!isVehicleConfigured(v))return "Add Vehicle";
  return normalizeVehicleCustomLabel(v.customLabel)||vehicleDefaultLabel(v);
}
function vehicleBadge(v){
  if(!v||!isVehicleConfigured(v))return "+";
  if(v.badge)return v.badge;
  const s=vehicleLabel(v);
  if(/grand wagoneer/i.test(s))return "JGW";
  if(/cj\s*7/i.test(s))return "CJ7";
  return s.split(/\s+/).map(x=>x[0]).join("").slice(0,6).toUpperCase()||"+";
}
function getVehicle(id){return RGBMDataV3.getVehicleById(state,id)}
function applyNonHomeViewport(){
  if(!route||route.screen==="home")return null;
  const app=$("app");
  if(!app||!app.style)return null;
  const viewport=window.visualViewport;
  const width=Math.max(1,Math.round(viewport&&viewport.width?viewport.width:window.innerWidth||document.documentElement.clientWidth||1));
  const height=Math.max(1,Math.round(viewport&&viewport.height?viewport.height:window.innerHeight||document.documentElement.clientHeight||1));
  app.style.setProperty("--non-home-viewport-width",`${width}px`);
  app.style.setProperty("--non-home-viewport-height",`${height}px`);
  app.dataset.orientation=width>height?"landscape":"portrait";
  return {width,height,orientation:app.dataset.orientation};
}
function finalizeNonHomeShell(app,screen){
  if(!app||screen==="home"||typeof app.querySelector!=="function")return;
  const topbar=app.querySelector(":scope > .topbar");
  const dock=app.querySelector(":scope > .bottom-nav");
  if(!dock)return;
  const scroll=document.createElement("main");
  scroll.className="non-home-scroll";
  scroll.setAttribute("data-screen",String(screen||""));
  scroll.setAttribute("aria-label",`${String(screen||"Application")} content`);
  const movable=[...app.childNodes].filter(node=>node!==topbar&&node!==dock);
  movable.forEach(node=>scroll.appendChild(node));
  app.insertBefore(scroll,dock);
  scroll.scrollTop=0;
  applyNonHomeViewport();
}
function render(){
  const app=$("app"),s=route.screen;
  app.className="app-screen screen-"+String(s||"home");
  document.body.classList.toggle("home-active",s==="home");
  document.body.classList.toggle("non-home-active",s!=="home");
  if(s==="home"){home(app);return}
  cancelBrowserHomeViewportStabilization();
  disconnectHomeResizeObserver();
  if(s==="vehicleView")vehicleView(app,route.vehicleId);
  else if(s==="vehicleEdit")vehicleEdit(app,route.vehicleId);
  else if(s==="quickFuel")quickFuel(app,route.vehicleId);
  else if(s==="quickMaintenance")quickMaintenance(app,route.vehicleId);
  else if(s==="quickInsurance")quickInsurance(app,route.vehicleId);
  else if(s==="recordView")recordView(app,route.type,route.recordId);
  else if(s==="recordEdit")recordEdit(app,route.type,route.recordId);
  else if(s==="data")dataScreen(app);
  else if(s==="reports")reportsHome(app);
  else if(s.startsWith("report"))reportDetail(app,s);
  else if(s==="guide")guideScreen(app);
  else if(s==="users")usersScreen(app);
  else if(s==="lists")listsScreen(app);
  else if(s==="settings")settings(app);
  else if(s==="cloud")cloudScreen(app);
  else{home(app);return}
  finalizeNonHomeShell(app,s);
}




































































function header(title){return `<div class="topbar"><button class="nav-control back-btn" type="button" onclick="goBack()">‹ Back</button><h1>${esc(title||"RGB Mileage")}</h1></div>`}
function bottomNav(){return `<div class="bottom-nav"><button class="nav-control" type="button" onclick="goHome()"><span>⌂</span>Home</button><button class="nav-control" type="button" onclick="nav('reports')"><span>▣</span>Reports</button><button class="nav-control" type="button" onclick="nav('data')"><span>⇅</span>Data</button><button class="nav-control" type="button" onclick="nav('settings')"><span>⚙</span>Settings</button></div>`}
function viewField(label,value,full=false){return `<div class="view-field ${full?'full':''}"><span class="view-label">${esc(label)}</span><span class="view-value">${esc(value??"")}</span></div>`}
function showToast(msg){alert(msg)}
function clearInputs(ids){ids.forEach(id=>{const el=$(id);if(el){if(el.tagName==="SELECT")el.selectedIndex=0;else el.value=""}})}
function sortWithOther(list,defaults=[]){const out=[];defaults.forEach(x=>{if(x&&x!=="Other"&&!out.some(y=>String(y).toLowerCase()===String(x).toLowerCase()))out.push(x)});(list||[]).forEach(x=>{if(x&&x!=="Other"&&!out.some(y=>String(y).toLowerCase()===String(x).toLowerCase()))out.push(x)});out.push("Other");return out}
function activeList(listName){if(state.customizedLists&&state.customizedLists[listName]&&Array.isArray(state[listName]))return [...state[listName].filter(x=>x&&x!=="Other"),"Other"];if(listName==="fuelGrades"){if(!state.fuelGrades)state.fuelGrades=[...FUEL_GRADES];return sortWithOther(state.fuelGrades,FUEL_GRADES)}if(listName==="stations"){if(!state.stations)state.stations=[...STATIONS_DEFAULT];return sortWithOther(state.stations,STATIONS_DEFAULT)}if(listName==="maintenanceCategories"){if(!state.maintenanceCategories)state.maintenanceCategories=[...MAINT_CATS];return sortWithOther(state.maintenanceCategories,MAINT_CATS)}if(!state[listName])state[listName]=[];return sortWithOther(state[listName],[])}
function saveOtherValueToState(listName,val){if(listName==="fuelGrades"){if(!state.fuelGrades)state.fuelGrades=[...FUEL_GRADES];if(!state.fuelGrades.some(x=>String(x).toLowerCase()===String(val).toLowerCase()))state.fuelGrades.push(val);return}if(listName==="stations"){if(!state.stations)state.stations=[...STATIONS_DEFAULT];if(!state.stations.some(x=>String(x).toLowerCase()===String(val).toLowerCase()))state.stations.push(val);return}if(listName==="maintenanceCategories"){if(!state.maintenanceCategories)state.maintenanceCategories=[...MAINT_CATS];if(!state.maintenanceCategories.some(x=>String(x).toLowerCase()===String(val).toLowerCase()))state.maintenanceCategories.push(val);return}if(!state[listName])state[listName]=[];if(!state[listName].some(x=>String(x).toLowerCase()===String(val).toLowerCase()))state[listName].push(val)}
function selectValueWithOption(sel,val){let opt=[...sel.options].find(o=>o.value===val);if(!opt){opt=document.createElement("option");opt.value=val;opt.textContent=val;const other=[...sel.options].find(o=>o.value==="Other");if(other)sel.insertBefore(opt,other);else sel.appendChild(opt)}sel.value=val;sel.setAttribute("data-prev",val)}
function otherUseOnce(){if(!pendingOtherSelect)return;const val=otherEnteredValue();if(!val)return alert("Enter a value first.");selectValueWithOption(pendingOtherSelect.sel,val);otherClose();pendingOtherSelect=null}
function otherSaveToList(){if(!pendingOtherSelect)return;const val=otherEnteredValue();if(!val)return alert("Enter a value first.");saveOtherValueToState(pendingOtherSelect.listName,val);selectValueWithOption(pendingOtherSelect.sel,val);saveData();otherClose();pendingOtherSelect=null}














function clearEditForm(type){if(type==="Fuel")clearInputs(["efdate","eftime","efodo","efmiles","efgal","efmpg","efgrade","efstation","efnotes"]);if(type==="Maintenance")clearInputs(["emdate","emcat","emodo","emcost","emloc","emprov","emnotes"]);if(type==="Insurance")clearInputs(["eicomp","eipol","eieff","eiexp","eicov","eiprem","eiagent","eiphone","eiemail","eiagency","einotes"])}
function saveRecordEdit(type,recordId,goBackAfterSave=false){try{const a=recArray(type);const r=a.find(x=>x.recordId===recordId);if(!r)return alert("Record not found.");if(type==="Fuel"){const date=requireValue($("efdate").value,"Date");const gallons=requirePositive($("efgal").value,"Gallons");const odometer=requireNonNegative($("efodo").value,"Odometer");const miles=requireNonNegative($("efmiles").value,"Miles");const price=requireNonNegative($("efprice").value,"Price/Gal");const total=requireNonNegative($("efcost").value,"Total Cost");Object.assign(r,{date,time:$("eftime").value,odometer,miles,gallons,mpg:requireNonNegative($("efmpg").value,"MPG"),fuelGrade:cleanText($("efgrade").value),ethanolFree:cleanText($("efef").value),station:cleanText($("efstation").value),fuelCostSource:cleanText($("efcostsource").value)||(total!==""?"Entered":price!==""?"Calculated":""),fuelPricePerGallon:price,totalFuelCost:total,notes:cleanText($("efnotes").value),modifiedAt:nowISO()})}else if(type==="Maintenance"){const date=requireValue($("emdate").value,"Date");const odometer=requireNonNegative($("emodo").value,"Odometer");const totalCost=requireNonNegative($("emcost").value,"Cost");const provider=cleanText($("emprov").value);Object.assign(r,{date,dropOffDate:date,pickUpDate:cleanText($("empick").value),category:cleanText($("emcat").value)||"Maintenance",odometer,totalCost,cost:totalCost,location:cleanText($("emloc").value),serviceProvider:provider,provider,performedBy:cleanText($("emperf").value),notes:cleanText($("emnotes").value),modifiedAt:nowISO()})}else if(type==="Insurance"){const agency=cleanText($("eiagency").value);const policyNumber=cleanText($("eipol").value);const effectiveDate=cleanText($("eieff").value);const expirationDate=cleanText($("eiexp").value);if(expirationDate&&expirationDate<effectiveDate)throw new Error("Expiration Date cannot be earlier than Effective Date.");const agreedValue=requireNonNegative($("eiagree").value,"Agreed Value");const premium=requireNonNegative($("eiprem").value,"Premium");const agent=cleanText($("eiagent").value);const notes=cleanText($("einotes").value);Object.assign(r,{company:agency,agency,policyNumber,effectiveDate,expirationDate,agreedValue,coverageValue:agreedValue,insuranceValue:agreedValue,premium,agent,agentName:agent,phone:cleanText($("eiphone").value),email:cleanText($("eiemail").value),notes,coverageNotes:notes,modifiedAt:nowISO()})}saveData();editSnapshot=null;showToast("Edit saved.");if(goBackAfterSave){performBackNavigation();return true}clearEditForm(type);return true}catch(e){alert(e.message||String(e));return false}}
function vehicleView(app,vid){
  const v=getVehicle(vid);
  if(!v)return nav("home");
  const acq=getAcq(vid);
  app.innerHTML=header(vehicleLabel(v))+`<div class="card vehicle-detail-card"><div class="vehicle-view-photo">${v.primaryPhoto?`<div class="vehicle-detail-photo-frame"><img src="${v.primaryPhoto}" alt="${esc(vehicleLabel(v))}"></div>`:`<div class="vehicle-detail-photo-frame vehicle-detail-photo-placeholder"><span>${vehicleInitials(v)}</span></div>`}</div><div class="view-grid">${viewField("Year",v.year||"")}${viewField("Make",v.make||"")}${viewField("Model",v.model||"")}${viewField("Badge",v.badge||"")}${viewField("Custom Label",normalizeVehicleCustomLabel(v.customLabel))}${viewField("Acquisition Date",formatDisplayDate(acq.acquisitionDate))}${viewField("Starting Odometer",acq.startingOdometer||"")}${vehicleMileageFieldsHtml(vid)}${viewField("Purchase Price",acq.purchasePrice||"")}${viewField("Status",v.status||"Active")}${viewField("Seller",acq.seller||"",true)}</div><div class="vehicle-detail-actions"><button class="wide primary nav-control" type="button" onclick="nav('vehicleEdit',{vehicleId:'${vid}'})">Edit Vehicle</button><button class="wide nav-control" type="button" onclick="openFuelFromVehicle('${vid}')">Fuel Entry</button><button class="wide nav-control" type="button" onclick="openMaintenanceFromVehicle('${vid}')">Maintenance Entry</button><button class="wide nav-control" type="button" onclick="openInsuranceFromVehicle('${vid}')">Insurance Entry</button></div></div>`+vehicleMileageErrorCardHtml(vid)+previousRecordsHtml("Fuel",vid)+previousRecordsHtml("Maintenance",vid)+previousRecordsHtml("Insurance",vid)+bottomNav()+footer();
}
function recordEdit(app,type,recordId){const r=records(type,null,true).find(x=>x.recordId===recordId);if(!r)return nav("home");const vid=r.vehicleId;if(type==="Fuel"){app.innerHTML=header("Edit Fuel Record")+`<div class="card"><div class="form-grid"><label>Date<input type="date" id="efdate" value="${esc(r.date||"")}"></label><label>Time<input type="time" id="eftime" value="${esc(r.time||"")}"></label><label>Odometer<input type="number" step="0.01" id="efodo" value="${esc(r.odometer||"")}" oninput="calcEditFuel('${vid}')"></label><label>Miles<input type="number" step="0.01" id="efmiles" value="${esc(r.miles||"")}" oninput="calcEditMpg()"></label><label>Gallons<input type="number" step="0.001" id="efgal" value="${esc(r.gallons||"")}" oninput="calcEditMpg()"></label><label>MPG<input type="number" step="0.001" id="efmpg" value="${esc(r.mpg||"")}" readonly></label><label>Fuel Grade<select id="efgrade" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'fuelGrades')">${activeList("fuelGrades").map(g=>`<option ${g===(r.fuelGrade||"")?"selected":""}>${esc(g)}</option>`).join("")}</select></label><label>Ethanol Free<select id="efef"><option ${String(r.ethanolFree||"")===""?"selected":""}></option><option ${String(r.ethanolFree||"")==="Yes"?"selected":""}>Yes</option><option ${String(r.ethanolFree||"")==="No"?"selected":""}>No</option></select></label><label>Station<select id="efstation" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'stations')">${activeList("stations").map(s=>`<option ${s===(r.station||"")?"selected":""}>${esc(s)}</option>`).join("")}</select></label><label>Cost Source<select id="efcostsource"><option ${String(r.fuelCostSource||"")===""?"selected":""}></option><option ${String(r.fuelCostSource||"")==="Calculated"?"selected":""}>Calculated</option><option ${String(r.fuelCostSource||"")==="Entered"?"selected":""}>Entered</option></select></label><label>Price/Gal<input type="number" step="0.001" id="efprice" value="${esc(r.fuelPricePerGallon||"")}" oninput="calcEditCost()"></label><label>Total Cost<input type="number" step="0.01" id="efcost" value="${esc(r.totalFuelCost||"")}" oninput="calcEditPriceFromTotal()"></label><label class="full">Notes<textarea id="efnotes">${esc(r.notes||"")}</textarea></label></div><button class="wide primary nav-control" type="button" onclick="saveRecordEdit('Fuel','${recordId}')">Save Changes</button><button class="wide ghost nav-control" type="button" onclick="goBack()">Cancel</button></div>`+previousRecordsHtml("Fuel",vid)+bottomNav()+footer();setEditSnapshot(type,recordId);return}if(type==="Maintenance"){app.innerHTML=header("Edit Maintenance Record")+`<div class="card"><div class="form-grid"><label>Date<input type="date" id="emdate" value="${esc(r.dropOffDate||r.date||"")}"></label><label>Pickup Date<input type="date" id="empick" value="${esc(r.pickUpDate||"")}"></label><label>Category<select id="emcat" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'maintenanceCategories')">${activeList("maintenanceCategories").map(c=>`<option ${c===(r.category||"")?"selected":""}>${esc(c)}</option>`).join("")}</select></label><label>Odometer<input type="number" step="0.01" id="emodo" value="${esc(r.odometer||"")}"></label><label>Cost<input type="number" step="0.01" id="emcost" value="${esc(r.totalCost||r.cost||"")}"></label><label>Location${maintPickSelect("emloc","maintenanceLocations",r.location)}</label><label>Provider${maintPickSelect("emprov","maintenanceProviders",r.serviceProvider||r.provider)}</label><label>Performed By${maintPickSelect("emperf","maintenancePerformers",r.performedBy)}</label><label class="full">Notes<textarea id="emnotes">${esc(r.notes||"")}</textarea></label></div><button class="wide primary nav-control" type="button" onclick="saveRecordEdit('Maintenance','${recordId}')">Save Changes</button><button class="wide ghost nav-control" type="button" onclick="goBack()">Cancel</button></div>`+previousRecordsHtml("Maintenance",vid)+bottomNav()+footer();setEditSnapshot(type,recordId);return}if(type==="Insurance"){app.innerHTML=header("Edit Insurance Record")+`<div class="card"><div class="form-grid"><label>Agency<input id="eiagency" value="${esc(r.agency||r.company||"")}"></label><label>Policy Number<input id="eipol" value="${esc(r.policyNumber||"")}"></label><label>Effective Date<input type="date" id="eieff" value="${esc(r.effectiveDate||"")}"></label><label>Expiration Date<input type="date" id="eiexp" value="${esc(r.expirationDate||"")}"></label><label>Agreed Value<input type="number" step="0.01" id="eiagree" value="${esc((r.agreedValue!==""&&r.agreedValue!=null)?r.agreedValue:(r.coverageValue!==""&&r.coverageValue!=null?r.coverageValue:r.insuranceValue||""))}"></label><label>Premium<input type="number" step="0.01" id="eiprem" value="${esc(r.premium||"")}"></label><label>Agent<input id="eiagent" value="${esc(r.agent||r.agentName||"")}"></label><label>Phone<input id="eiphone" value="${esc(r.phone||"")}"></label><label>Email<input type="email" id="eiemail" value="${esc(r.email||"")}"></label><label class="full">Notes<textarea id="einotes">${esc(r.notes||r.coverageNotes||"")}</textarea></label></div><button class="wide primary nav-control" type="button" onclick="saveRecordEdit('Insurance','${recordId}')">Save Changes</button><button class="wide ghost nav-control" type="button" onclick="goBack()">Cancel</button></div>`+previousRecordsHtml("Insurance",vid)+bottomNav()+footer()}}


let homeGeometryFrame=0;
let homeResizeObserver=null;

function finitePixels(value){
  const parsed=Number.parseFloat(value);
  return Number.isFinite(parsed)?parsed:0;
}

function disconnectHomeResizeObserver(){
  if(homeResizeObserver){
    homeResizeObserver.disconnect();
    homeResizeObserver=null;
  }
}

function homeContainerSize(homeScreen){
  const rect=homeScreen.getBoundingClientRect();
  return {
    width:Math.max(1,Math.round(rect.width)),
    height:Math.max(1,Math.round(rect.height)),
    top:rect.top,
    right:rect.right,
    bottom:rect.bottom,
    left:rect.left
  };
}


function homeLabelMeasurements(vehicleArea){
  const labels=Array.from(vehicleArea.querySelectorAll(".vehicle-label"));
  const fallbackWidth=Math.max(
    44,
    Math.round(vehicleArea.getBoundingClientRect().width*0.42)
  );
  const maxWidth=Math.max(
    88,
    Math.min(220,Math.round(vehicleArea.getBoundingClientRect().width*0.56))
  );
  let context=null;
  try{
    const canvas=document.createElement("canvas");
    context=canvas.getContext("2d");
  }catch(_error){
    context=null;
  }
  return labels.slice(0,3).map(label=>{
    const style=getComputedStyle(label);
    const font=[
      style.fontStyle,
      style.fontVariant,
      style.fontWeight,
      style.fontSize,
      style.fontFamily
    ].filter(Boolean).join(" ");
    if(context)context.font=font;
    const text=(label.textContent||"").trim()||"Add Vehicle";
    const words=text.split(/\s+/).filter(Boolean);
    const paddingLeft=finitePixels(style.paddingLeft);
    const paddingRight=finitePixels(style.paddingRight);
    const paddingTop=finitePixels(style.paddingTop);
    const paddingBottom=finitePixels(style.paddingBottom);
    const lineHeight=(()=>{
      const parsed=finitePixels(style.lineHeight);
      if(parsed>0)return parsed;
      const fontSize=finitePixels(style.fontSize);
      return fontSize>0?fontSize*1.12:18;
    })();
    const measure=value=>context
      ?context.measureText(value).width
      :value.length*8.5;
    const lines=[];
    words.forEach(word=>{
      if(lines.length===0){
        lines.push(word);
        return;
      }
      const next=`${lines[lines.length-1]} ${word}`;
      if(measure(next)+paddingLeft+paddingRight<=maxWidth){
        lines[lines.length-1]=next;
      }else if(lines.length<2){
        lines.push(word);
      }else{
        lines[lines.length-1]=`${lines[lines.length-1]} ${word}`;
      }
    });
    const textWidth=Math.max(
      44,
      ...lines.map(line=>measure(line)+paddingLeft+paddingRight)
    );
    const height=Math.ceil(
      (Math.max(1,lines.length)*lineHeight)
      +paddingTop
      +paddingBottom
    );
    return {
      width:Math.ceil(Math.min(maxWidth,Math.max(44,textWidth))),
      height:Math.ceil(Math.max(24,height)),
      maxWidth
    };
  });
}

function applyHomeGeometry(){
  if(!route||route.screen!=="home"||!window.RGBMHomeLayout)return null;
  const app=$("app");
  if(!app||typeof app.querySelector!=="function")return null;
  const homeScreen=app.querySelector(".home-shell");
  const homeHead=app.querySelector(".home-head");
  const vehicleArea=app.querySelector(".vehicle-area");
  const dock=app.querySelector(".home-shell > .bottom-nav");
  if(!homeScreen||!homeHead||!vehicleArea||!dock)return null;

  const container=homeContainerSize(homeScreen);
  const appStyle=getComputedStyle(app);
  const orientation=container.width>container.height
    ?"landscape"
    :"portrait";
  const headRect=homeHead.getBoundingClientRect();
  const areaRect=vehicleArea.getBoundingClientRect();
  const dockRect=dock.getBoundingClientRect();
  app.dataset.orientation=orientation;

  const layout=RGBMHomeLayout.calculateHomeLayout({
    viewportWidth:container.width,
    viewportHeight:container.height,
    vehicleAreaWidth:Math.max(1,Math.floor(areaRect.width)),
    vehicleAreaHeight:Math.max(1,Math.floor(areaRect.height)),
    paddingTop:0,
    paddingRight:0,
    paddingBottom:0,
    paddingLeft:0,
    headerHeight:Math.ceil(headRect.height),
    headerGap:0,
    dockHeight:Math.ceil(dockRect.height),
    dockGap:0,
    orientation,
    labelMeasurements:homeLabelMeasurements(vehicleArea)
  });

  homeScreen.dataset.layoutMode=layout.mode;
  homeScreen.dataset.compact=layout.compact?"true":"false";
  homeScreen.style.setProperty(
    "--home-column-gap",
    `${layout.columnGap}px`
  );
  homeScreen.style.setProperty(
    "--home-min-row-gap",
    `${layout.minimumRowGap}px`
  );
  homeScreen.style.setProperty(
    "--home-label-height",
    `${layout.labelHeight}px`
  );
  homeScreen.style.setProperty(
    "--home-shared-diameter",
    `${layout.sharedDiameter}px`
  );

  if(layout.mode==="portrait-circle-label-f24"){
    homeScreen.style.setProperty(
      "--home-label-gap",
      `${layout.labelGap}px`
    );
    homeScreen.style.setProperty(
      "--home-circle-item-height",
      `${layout.itemHeight}px`
    );
    homeScreen.style.setProperty(
      "--home-horizontal-space",
      `${layout.horizontalSpace}px`
    );
    homeScreen.style.setProperty(
      "--home-vertical-space",
      `${layout.verticalSpace}px`
    );
    homeScreen.style.setProperty(
      "--home-primary-diameter",
      `${layout.primaryDiameter}px`
    );
    homeScreen.style.setProperty(
      "--home-secondary-diameter",
      `${layout.secondaryDiameter}px`
    );
    homeScreen.style.setProperty(
      "--home-primary-x",
      `${layout.primary.x}px`
    );
    homeScreen.style.setProperty(
      "--home-primary-y",
      `${layout.primary.y}px`
    );
    homeScreen.style.setProperty(
      "--home-primary-label-width",
      `${layout.primary.labelWidth}px`
    );
    homeScreen.style.setProperty(
      "--home-primary-label-height",
      `${layout.primary.labelHeight}px`
    );
    homeScreen.style.setProperty(
      "--home-upper-x",
      `${layout.upperSecondary.x}px`
    );
    homeScreen.style.setProperty(
      "--home-upper-y",
      `${layout.upperSecondary.y}px`
    );
    homeScreen.style.setProperty(
      "--home-upper-label-width",
      `${layout.upperSecondary.labelWidth}px`
    );
    homeScreen.style.setProperty(
      "--home-upper-label-height",
      `${layout.upperSecondary.labelHeight}px`
    );
    homeScreen.style.setProperty(
      "--home-lower-x",
      `${layout.lowerSecondary.x}px`
    );
    homeScreen.style.setProperty(
      "--home-lower-y",
      `${layout.lowerSecondary.y}px`
    );
    homeScreen.style.setProperty(
      "--home-lower-label-width",
      `${layout.lowerSecondary.labelWidth}px`
    );
    homeScreen.style.setProperty(
      "--home-lower-label-height",
      `${layout.lowerSecondary.labelHeight}px`
    );
  }else{
    homeScreen.style.removeProperty("--home-label-gap");
    homeScreen.style.removeProperty("--home-circle-item-height");
    homeScreen.style.removeProperty("--home-horizontal-space");
    homeScreen.style.removeProperty("--home-vertical-space");
    homeScreen.style.removeProperty("--home-primary-diameter");
    homeScreen.style.removeProperty("--home-secondary-diameter");
    homeScreen.style.removeProperty("--home-primary-x");
    homeScreen.style.removeProperty("--home-primary-y");
    homeScreen.style.removeProperty("--home-primary-label-width");
    homeScreen.style.removeProperty("--home-primary-label-height");
    homeScreen.style.removeProperty("--home-upper-x");
    homeScreen.style.removeProperty("--home-upper-y");
    homeScreen.style.removeProperty("--home-upper-label-width");
    homeScreen.style.removeProperty("--home-upper-label-height");
    homeScreen.style.removeProperty("--home-lower-x");
    homeScreen.style.removeProperty("--home-lower-y");
    homeScreen.style.removeProperty("--home-lower-label-width");
    homeScreen.style.removeProperty("--home-lower-label-height");
  }

  const circleRects=Array.from(
    vehicleArea.querySelectorAll(".circle-wrap")
  ).map((element,index)=>{
    const wrapRect=element.getBoundingClientRect();
    const circle=element.querySelector(".home-circle-visual");
    const circleRect=circle
      ?circle.getBoundingClientRect()
      :wrapRect;
    return {
      position:index+1,
      wrapLeft:Math.round(wrapRect.left-areaRect.left),
      wrapTop:Math.round(wrapRect.top-areaRect.top),
      circleLeft:Math.round(circleRect.left-areaRect.left),
      circleTop:Math.round(circleRect.top-areaRect.top),
      diameter:Math.round(circleRect.width)
    };
  });
  const innerHeight=window.innerHeight||0;
  const visualHeight=window.visualViewport
    ?window.visualViewport.height
    :null;
  const standalone=isStandaloneDisplayMode();
  const browserViewport=standalone
    ?null
    :browserHomeViewportSize();
  const visibleBottom=browserViewport
    ?browserViewport.visibleBottom
    :innerHeight;

  placeServiceWorkerUpdateBadge();

  window.__RGBM_HOME_LAYOUT_DIAGNOSTICS={
    ...layout,
    heightSource:standalone
      ?"standalone-100vh-home-shell"
      :browserViewport
        ?browserViewport.source
        :"browser-innerHeight-fallback",
    geometryInputSource:"vehicleArea.getBoundingClientRect()",
    appPaddingTop:finitePixels(appStyle.paddingTop),
    containerTop:container.top,
    containerBottom:container.bottom,
    titleTop:headRect.top,
    titleBottom:headRect.bottom,
    vehicleTop:areaRect.top,
    vehicleBottom:areaRect.bottom,
    renderedVehicleWidth:Math.round(areaRect.width),
    renderedVehicleHeight:Math.round(areaRect.height),
    circleRects,
    renderedEqualDiameters:(
      circleRects.length===3
      &&circleRects.every(
        item=>item.diameter===circleRects[0].diameter
      )
    ),
    dockTop:dockRect.top,
    dockBottom:dockRect.bottom,
    dockDistanceFromContainerBottom:Math.max(
      0,
      Math.round(container.bottom-dockRect.bottom)
    ),
    dockDistanceFromInnerHeight:Math.max(
      0,
      Math.round(innerHeight-dockRect.bottom)
    ),
    dockDistanceFromVisibleViewportBottom:Math.max(
      0,
      Math.round(visibleBottom-dockRect.bottom)
    ),
    windowInnerHeight:innerHeight,
    visualViewportHeight:visualHeight,
    visualViewportOffsetTop:browserViewport
      ?browserViewport.offsetTop
      :0,
    visibleViewportBottom:visibleBottom,
    standalone,
    visualViewportExcludedFromHomeSizing:standalone,
    browserVisualViewportHeightOwner:(
      !standalone&&!!window.visualViewport
    )
  };
  return layout;
}
function scheduleHomeGeometry(){
  if(homeGeometryFrame&&window.cancelAnimationFrame){
    cancelAnimationFrame(homeGeometryFrame);
  }
  const run=()=>{
    homeGeometryFrame=0;
    applyHomeGeometry();
  };
  homeGeometryFrame=window.requestAnimationFrame
    ?requestAnimationFrame(run)
    :setTimeout(run,0);
}

function observeHomeGeometry(){
  disconnectHomeResizeObserver();
  if(typeof ResizeObserver!=="function")return;
  const app=$("app");
  const homeScreen=app&&app.querySelector(".home-shell");
  const homeHead=app&&app.querySelector(".home-head");
  const vehicleArea=app&&app.querySelector(".vehicle-area");
  const dock=app&&app.querySelector(".home-shell > .bottom-nav");
  if(!homeScreen||!homeHead||!vehicleArea||!dock)return;
  homeResizeObserver=new ResizeObserver(()=>scheduleHomeGeometry());
  homeResizeObserver.observe(homeScreen);
  homeResizeObserver.observe(homeHead);
  homeResizeObserver.observe(vehicleArea);
  homeResizeObserver.observe(dock);
}
function home(app){
  app.innerHTML=`<section class="screen home home-shell" data-layout-mode="portrait-staggered" data-compact="false"><header class="home-head"><h1 class="chrome-title">${APP_NAME}</h1><div class="subtitle version-subtitle" data-build-id="${VERSION}">${VERSION} • Build ${formatBuildDate(BUILD_DATE)}</div></header><main class="vehicle-area" aria-label="Vehicles">${orderedVehicles().map((v,i)=>circleHtml(v,i)).join("")}</main>${bottomNav()}</section>`;
  applyBrowserHomeViewport();
  observeHomeGeometry();
  if(document.fonts&&document.fonts.ready){
    document.fonts.ready
      .then(()=>scheduleHomeGeometry())
      .catch(()=>{});
  }
  if(isStandaloneDisplayMode()){
    scheduleHomeGeometry();
  }else{
    stabilizeBrowserHomeViewport();
  }
  refreshOfflineUI();
}

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
function queuePendingRecordOpen(type,recordId,mode){
  pendingRecordOpen={type,recordId,mode};
}
function continuePendingRecordOpen(){
  const p=pendingRecordOpen;
  pendingRecordOpen=null;
  if(!p)return false;
  return openRecordFlow(p.type,p.recordId,p.mode,true);
}
function guardMergedRecordOpen(type,recordId,mode){
  if(route.screen==="quickFuel" && route.mode==="edit" && isQuickFuelDirty()){
    queuePendingRecordOpen(type,recordId,mode);
    return showChoiceModal("Unsaved Changes",[
      {label:"Save And Continue",className:"primary",onClick:()=>{if(saveQuickFuel(route.vehicleId,true)) continuePendingRecordOpen();}},
      {label:"Discard And Continue",className:"danger",onClick:()=>{editSnapshot=null;continuePendingRecordOpen();}},
      {label:"Stay On This Screen",className:"ghost",onClick:()=>{pendingRecordOpen=null;return false;}}
    ]);
  }
  if(route.screen==="quickMaintenance" && route.mode==="edit" && isQuickMaintenanceDirty()){
    queuePendingRecordOpen(type,recordId,mode);
    return showChoiceModal("Unsaved Changes",[
      {label:"Save And Continue",className:"primary",onClick:()=>{if(saveQuickMaintenance(route.vehicleId,true)) continuePendingRecordOpen();}},
      {label:"Discard And Continue",className:"danger",onClick:()=>{editSnapshot=null;continuePendingRecordOpen();}},
      {label:"Stay On This Screen",className:"ghost",onClick:()=>{pendingRecordOpen=null;return false;}}
    ]);
  }
  if(route.screen==="quickInsurance" && route.mode==="edit" && isQuickInsuranceDirty()){
    queuePendingRecordOpen(type,recordId,mode);
    return showChoiceModal("Unsaved Changes",[
      {label:"Save And Continue",className:"primary",onClick:()=>{if(saveQuickInsurance(route.vehicleId,true)) continuePendingRecordOpen();}},
      {label:"Discard And Continue",className:"danger",onClick:()=>{editSnapshot=null;continuePendingRecordOpen();}},
      {label:"Stay On This Screen",className:"ghost",onClick:()=>{pendingRecordOpen=null;return false;}}
    ]);
  }
  return null;
}

function openRecordFlow(type,recordId,mode,bypassGuard){
  if(!bypassGuard){
    const guarded=guardMergedRecordOpen(type,recordId,mode);
    if(guarded!==null) return guarded;
  }
  if(type==="Fuel"){
    const r=findRecord("Fuel",recordId);
    if(!r)return false;
    const source=(route.screen==="quickFuel"&&route.returnTo)?cloneRoute(route.returnTo):cloneRoute(route);
    route={screen:"quickFuel",vehicleId:r.vehicleId,mode:mode==="edit"?"edit":"view",recordId:r.recordId,returnTo:source};
    renderRoute();
    return false;
  }
  if(type==="Maintenance"){
    const r=findRecord("Maintenance",recordId);
    if(!r)return false;
    const source=(route.screen==="quickMaintenance"&&route.returnTo)?cloneRoute(route.returnTo):cloneRoute(route);
    route={screen:"quickMaintenance",vehicleId:r.vehicleId,mode:mode==="edit"?"edit":"view",recordId:r.recordId,returnTo:source};
    renderRoute();
    return false;
  }
  if(type==="Insurance"){
    const r=findRecord("Insurance",recordId);
    if(!r)return false;
    const source=(route.screen==="quickInsurance"&&route.returnTo)?cloneRoute(route.returnTo):cloneRoute(route);
    route={screen:"quickInsurance",vehicleId:r.vehicleId,mode:mode==="edit"?"edit":"view",recordId:r.recordId,returnTo:source};
    renderRoute();
    return false;
  }
  navRecord(type,recordId,mode);
  return false;
}
function rowPressStart(type,recordId,e){
  rowTouchState={
    active:true,
    pointerId:e&&typeof e.pointerId!=="undefined"?e.pointerId:null,
    startX:e&&typeof e.clientX==="number"?e.clientX:0,
    startY:e&&typeof e.clientY==="number"?e.clientY:0,
    moved:false
  };
  pressStart(()=>type==="Fuel"?fuelRowActions(recordId):type==="Maintenance"?maintenanceRowActions(recordId):type==="Insurance"?insuranceRowActions(recordId):openRecordFlow(type,recordId,"edit"),e,650);
}
function rowPressMove(e){
  if(!rowTouchState.active) return;
  if(rowTouchState.pointerId!==null && e && typeof e.pointerId!=="undefined" && e.pointerId!==rowTouchState.pointerId) return;
  const x=e&&typeof e.clientX==="number"?e.clientX:rowTouchState.startX;
  const y=e&&typeof e.clientY==="number"?e.clientY:rowTouchState.startY;
  if(Math.abs(x-rowTouchState.startX)>10 || Math.abs(y-rowTouchState.startY)>10){
    rowTouchState.moved=true;
    recentRowSuppressUntil=Date.now()+250;
    clearLP();
  }
}
function rowPressEnd(type,recordId,e){
  const longFired=suppressTap;
  const moved=rowTouchState.moved || Date.now()<recentRowSuppressUntil;
  rowTouchState.active=false;
  clearLP();
  if(longFired){
    suppressTap=false;
    return false;
  }
  if(moved){
    return false;
  }
  return openRecordFlow(type,recordId,"view");
}
function rowPressCancel(){
  if(rowTouchState.active) recentRowSuppressUntil=Date.now()+250;
  rowTouchState.active=false;
  clearLP();
}
function rowTap(type,recordId,e){
  if(e && e.preventDefault) e.preventDefault();
  if(suppressTap){
    suppressTap=false;
    return false;
  }
  if(Date.now()<recentRowSuppressUntil){
    return false;
  }
  return openRecordFlow(type,recordId,"view");
}
function entryRow(type,r){
  const status=meaningfulStatus(r);
  const origin=canonicalOrigin(r);
  const badges=[];
  if(origin && origin!=="Manual Entry") badges.push(`<span class="badge">${esc(origin)}</span>`);
  if(status) badges.push(`<span class="badge warn">${esc(status)}</span>`);
  if(canonicalLifecycle(r)==="Archived") badges.push(`<span class="badge arch">Archived</span>`);
  const warningClass=mileageWarningRowClass(type,r);
  return `<div class="entry-row${warningClass}" role="button" tabindex="0"
    onpointerdown="rowPressStart('${type}','${r.recordId}',event)"
    onpointermove="rowPressMove(event)"
    onpointerup="return rowPressEnd('${type}','${r.recordId}',event)"
    onpointercancel="rowPressCancel()"
    onpointerleave="rowPressCancel()"
    onclick="return rowTap('${type}','${r.recordId}',event)">
    <div class="entry-main"><span>${recordTitle(type,r)}</span><span class="muted"></span></div><div class="badges">${badges.join("")}</div></div>`;
}

function fuelRowActions(recordId){
  const r=findRecord("Fuel",recordId);
  if(!r) return false;
  return showChoiceModal("Fuel Record Actions",[
    {label:"Edit",className:"primary",onClick:()=>openRecordFlow("Fuel",recordId,"edit",true)},
    {label:"Delete",className:"danger",onClick:()=>fuelDeleteChoices(recordId)},
    {label:"Cancel",className:"ghost",onClick:()=>false}
  ]);
}
function fuelDeleteChoices(recordId){
  const r=findRecord("Fuel",recordId);
  if(!r) return false;
  return showChoiceModal("Delete Fuel Record",[
    {label:"Delete Permanently",className:"danger",onClick:()=>fuelDeletePermanent(recordId)},
    {label:"Archive Instead",className:"ghost",onClick:()=>fuelArchiveFromChoices(recordId)},
    {label:"Cancel",className:"ghost",onClick:()=>false}
  ]);
}
function fuelArchiveFromChoices(recordId){
  const r=findRecord("Fuel",recordId);
  if(!r) return false;
  addTag(r,"Archived");
  r.modifiedAt=nowISO();
  saveData();
  if(route.screen==="quickFuel"){
    route={screen:"quickFuel",vehicleId:r.vehicleId,mode:"empty",returnTo:route.returnTo||cloneRoute(route)};
    renderRoute();
  }else{
    renderRoute();
  }
  return false;
}
function fuelDeletePermanent(recordId){
  const idx=state.fuelRecords.findIndex(r=>r.recordId===recordId);
  if(idx<0) return false;
  const r=state.fuelRecords[idx];
  state.fuelRecords.splice(idx,1);
  saveData();
  editSnapshot=null;
  if(route.screen==="quickFuel"){
    route={screen:"quickFuel",vehicleId:r.vehicleId,mode:"empty",returnTo:route.returnTo||cloneRoute(route)};
    renderRoute();
  }else{
    renderRoute();
  }
  return false;
}
function fuelDeleteFromEdit(){
  if(route.screen!=="quickFuel" || route.mode!=="edit" || !route.recordId) return false;
  return fuelDeleteChoices(route.recordId);
}

function maintenanceRowActions(recordId){
  const r=findRecord("Maintenance",recordId);
  if(!r) return false;
  return showChoiceModal("Maintenance Record Actions",[
    {label:"Edit",className:"primary",onClick:()=>openRecordFlow("Maintenance",recordId,"edit",true)},
    {label:"Delete",className:"danger",onClick:()=>maintenanceDeleteChoices(recordId)},
    {label:"Cancel",className:"ghost",onClick:()=>false}
  ]);
}
function maintenanceDeleteChoices(recordId){
  const r=findRecord("Maintenance",recordId);
  if(!r) return false;
  return showChoiceModal("Delete Maintenance Record",[
    {label:"Delete Permanently",className:"danger",onClick:()=>maintenanceDeletePermanent(recordId)},
    {label:"Archive Instead",className:"ghost",onClick:()=>maintenanceArchiveFromChoices(recordId)},
    {label:"Cancel",className:"ghost",onClick:()=>false}
  ]);
}
function maintenanceArchiveFromChoices(recordId){
  const r=findRecord("Maintenance",recordId);
  if(!r) return false;
  addTag(r,"Archived");
  r.modifiedAt=nowISO();
  saveData();
  if(route.screen==="quickMaintenance"){
    route={screen:"quickMaintenance",vehicleId:r.vehicleId,mode:"empty",returnTo:route.returnTo||cloneRoute(route)};
    renderRoute();
  }else{
    renderRoute();
  }
  return false;
}
function maintenanceDeletePermanent(recordId){
  const idx=state.maintenanceRecords.findIndex(r=>r.recordId===recordId);
  if(idx<0) return false;
  const r=state.maintenanceRecords[idx];
  state.maintenanceRecords.splice(idx,1);
  saveData();
  editSnapshot=null;
  if(route.screen==="quickMaintenance"){
    route={screen:"quickMaintenance",vehicleId:r.vehicleId,mode:"empty",returnTo:route.returnTo||cloneRoute(route)};
    renderRoute();
  }else{
    renderRoute();
  }
  return false;
}
function maintenanceDeleteFromEdit(){
  if(route.screen!=="quickMaintenance" || route.mode!=="edit" || !route.recordId) return false;
  return maintenanceDeleteChoices(route.recordId);
}

function insuranceRowActions(recordId){
  const r=findRecord("Insurance",recordId);
  if(!r) return false;
  return showChoiceModal("Insurance Record Actions",[
    {label:"Edit",className:"primary",onClick:()=>openRecordFlow("Insurance",recordId,"edit",true)},
    {label:"Delete",className:"danger",onClick:()=>insuranceDeleteChoices(recordId)},
    {label:"Cancel",className:"ghost",onClick:()=>false}
  ]);
}
function insuranceDeleteChoices(recordId){
  const r=findRecord("Insurance",recordId);
  if(!r) return false;
  return showChoiceModal("Delete Insurance Record",[
    {label:"Delete Permanently",className:"danger",onClick:()=>insuranceDeletePermanent(recordId)},
    {label:"Archive Instead",className:"ghost",onClick:()=>insuranceArchiveFromChoices(recordId)},
    {label:"Cancel",className:"ghost",onClick:()=>false}
  ]);
}
function insuranceArchiveFromChoices(recordId){
  const r=findRecord("Insurance",recordId);
  if(!r) return false;
  addTag(r,"Archived");
  r.modifiedAt=nowISO();
  saveData();
  if(route.screen==="quickInsurance"){
    route={screen:"quickInsurance",vehicleId:r.vehicleId,mode:"empty",returnTo:route.returnTo||cloneRoute(route)};
    renderRoute();
  }else{
    renderRoute();
  }
  return false;
}
function insuranceDeletePermanent(recordId){
  const idx=state.insuranceRecords.findIndex(r=>r.recordId===recordId);
  if(idx<0) return false;
  const r=state.insuranceRecords[idx];
  state.insuranceRecords.splice(idx,1);
  saveData();
  editSnapshot=null;
  if(route.screen==="quickInsurance"){
    route={screen:"quickInsurance",vehicleId:r.vehicleId,mode:"empty",returnTo:route.returnTo||cloneRoute(route)};
    renderRoute();
  }else{
    renderRoute();
  }
  return false;
}
function insuranceDeleteFromEdit(){
  if(route.screen!=="quickInsurance" || route.mode!=="edit" || !route.recordId) return false;
  return insuranceDeleteChoices(route.recordId);
}

function circleHtml(v,i){
  const configured=isVehicleConfigured(v);
  const inner=configured&&v.primaryPhoto?`<img src="${v.primaryPhoto}" alt="">`:esc(vehicleBadge(v));
  const label=configured?vehicleLabel(v):"Add Vehicle";
  const accessible=esc(label);
  const mileage=configured?homeLastRefuelMileageText(v.vehicleId):"";
  const mileageHtml=mileage?`<span class="home-mileage-label" aria-hidden="true">${esc(mileage)}</span>`:"";
  return `<button class="circle-wrap" type="button" data-position="${i+1}" aria-label="${accessible}" onpointerdown="pressStart(()=>vehicleLong(${i}),event,500)" onpointerup="clearLP()" onpointercancel="clearLP()" onclick="vehicleTap(${i})"><span class="home-circle-visual" aria-hidden="true">${inner}</span>${mileageHtml}<span class="vehicle-label">${esc(label)}</span></button>`;
}
function formatHomeMileage(value){
  return value!==""&&value!=null&&Number.isFinite(+value)?Math.round(+value).toLocaleString():"";
}
function homeLastRefuelMileageText(vehicleId){
  const summary=vehicleMileageSummary(vehicleId);
  return formatHomeMileage(summary.lastFuelMileage);
}
function vehicleTap(i){
  if(suppressTap){suppressTap=false;return}
  const v=orderedVehicles()[i];
  if(!v)return;
  if(isVehicleConfigured(v))openFuelFromHome(v.vehicleId);
  else nav("vehicleEdit",{vehicleId:v.vehicleId});
}
function vehicleLong(i){
  const v=orderedVehicles()[i];
  if(!v)return;
  if(isVehicleConfigured(v))nav("vehicleView",{vehicleId:v.vehicleId});
  else nav("vehicleEdit",{vehicleId:v.vehicleId});
}
function getAcq(vid){let a=state.vehicleAcquisitionRecords.find(r=>r.vehicleId===vid);const v=getVehicle(vid)||{};return a||{vehicleId:vid,acquisitionDate:v.acquisitionDate||v.purchaseDate||"",purchaseDate:v.purchaseDate||v.acquisitionDate||"",startingOdometer:v.startingOdometer||"",purchasePrice:v.purchasePrice||v.purchaseCost||"",seller:v.seller||""}}

function normalizedMileageValue(value){
  if(value===null||value===undefined||value==="") return "";
  const n=Number(String(value).replace(/[$,]/g,"").trim());
  return Number.isFinite(n)?n:"";
}
function recordMileageValue(record){
  if(!record) return "";
  if(record.odometer!=="" && record.odometer!==null && record.odometer!==undefined) return normalizedMileageValue(record.odometer);
  if(record.mileage!=="" && record.mileage!==null && record.mileage!==undefined) return normalizedMileageValue(record.mileage);
  if(record.startingOdometer!=="" && record.startingOdometer!==null && record.startingOdometer!==undefined) return normalizedMileageValue(record.startingOdometer);
  return "";
}
function mileageDateParts(date,time){
  const d=String(date||"").trim();
  const t=String(time||"").trim();
  if(!d) return {stamp:0,displayDate:"",displayTime:"",hasDate:false};
  const isoTime=t?`T${t}`:"T00:00";
  const ms=Date.parse(`${d}${isoTime}`);
  return {stamp:Number.isFinite(ms)?ms:0,displayDate:d,displayTime:t,hasDate:Number.isFinite(ms)};
}
function mileageRecordDate(record,type){
  if(type==="Maintenance") return record.dropOffDate||record.date||record.serviceDate||"";
  if(type==="Starting") return record.acquisitionDate||record.purchaseDate||record.date||"";
  return record.date||"";
}
function mileageRecordTime(record){
  return record.time||record.dropOffTime||record.serviceTime||"";
}
function mileageSequence(record,index){
  const seq=Number(record.entrySequence||0);
  if(Number.isFinite(seq) && seq) return seq;
  const modified=Date.parse(record.modifiedAt||record.createdAt||"");
  if(Number.isFinite(modified) && modified) return modified/1000;
  return index+1;
}
function mileageLabel(reading){
  if(!reading) return "";
  if(reading.type==="Starting") return "Starting Mileage";
  if(reading.type==="Fuel") return "Refuel";
  if(reading.type==="Maintenance") return "Maintenance";
  return "Mileage";
}
function vehicleMileageReadings(vid){
  const readings=[];
  const acq=getAcq(vid);
  const starting=normalizedMileageValue(acq.startingOdometer);
  if(starting!==""){
    const parts=mileageDateParts(acq.acquisitionDate||acq.purchaseDate||"","");
    readings.push({
      type:"Starting",
      recordId:"starting",
      vehicleId:vid,
      odometer:starting,
      stamp:parts.stamp,
      date:parts.displayDate,
      time:"",
      hasDate:parts.hasDate,
      sequence:0,
      label:"Starting Mileage"
    });
  }
  records("Fuel",vid,false).forEach((record,index)=>{
    const odometer=recordMileageValue(record);
    if(odometer==="") return;
    const parts=mileageDateParts(mileageRecordDate(record,"Fuel"),mileageRecordTime(record));
    readings.push({
      type:"Fuel",
      recordId:record.recordId,
      vehicleId:vid,
      odometer,
      stamp:parts.stamp,
      date:parts.displayDate,
      time:parts.displayTime,
      hasDate:parts.hasDate,
      sequence:mileageSequence(record,index),
      label:"Refuel"
    });
  });
  records("Maintenance",vid,false).forEach((record,index)=>{
    const odometer=recordMileageValue(record);
    if(odometer==="") return;
    const parts=mileageDateParts(mileageRecordDate(record,"Maintenance"),mileageRecordTime(record));
    readings.push({
      type:"Maintenance",
      recordId:record.recordId,
      vehicleId:vid,
      odometer,
      stamp:parts.stamp,
      date:parts.displayDate,
      time:parts.displayTime,
      hasDate:parts.hasDate,
      sequence:mileageSequence(record,index),
      label:"Maintenance"
    });
  });
  return readings;
}
function compareMileageReadingDate(a,b){
  if((a.stamp||0)!==(b.stamp||0)) return (a.stamp||0)-(b.stamp||0);
  if((a.sequence||0)!==(b.sequence||0)) return (a.sequence||0)-(b.sequence||0);
  return String(a.recordId||"").localeCompare(String(b.recordId||""));
}
function highestMileageReading(readings,type){
  const scoped=type?readings.filter(reading=>reading.type===type):readings.slice();
  scoped.sort((a,b)=>{
    if(a.odometer!==b.odometer) return a.odometer-b.odometer;
    return compareMileageReadingDate(a,b);
  });
  return scoped.length?scoped[scoped.length-1]:null;
}
function mostRecentMileageReading(readings,type){
  const scoped=type?readings.filter(reading=>reading.type===type):readings.slice();
  const dated=scoped.filter(reading=>reading.hasDate);
  if(dated.length){
    dated.sort(compareMileageReadingDate);
    return dated[dated.length-1];
  }
  return highestMileageReading(scoped,null);
}
function vehicleMileageSummary(vid){
  const readings=vehicleMileageReadings(vid);
  const lastFuel=mostRecentMileageReading(readings,"Fuel");
  const lastMaintenance=mostRecentMileageReading(readings,"Maintenance");
  const current=mostRecentMileageReading(readings,null);
  return {
    lastFuelMileage:lastFuel?lastFuel.odometer:"",
    lastMaintenanceMileage:lastMaintenance?lastMaintenance.odometer:"",
    currentMileage:current?current.odometer:"",
    currentSource:current?current.type:"",
    issues:vehicleMileageIssuesFromReadings(readings)
  };
}
function vehicleMileageIssuesFromReadings(readings){
  const dated=readings.filter(reading=>reading.hasDate).sort(compareMileageReadingDate);
  const issues=[];
  let highest=null;
  dated.forEach(reading=>{
    if(highest && reading.odometer<highest.odometer){
      issues.push({older:highest,newer:reading});
    }
    if(!highest || reading.odometer>highest.odometer) highest=reading;
  });
  return issues;
}
function vehicleMileageIssues(vid){
  return vehicleMileageSummary(vid).issues;
}
function formatMileageReading(reading){
  if(!reading) return "";
  const date=formatDisplayDate(reading.date);
  const time=reading.time?` ${reading.time}`:"";
  return `${mileageLabel(reading)} ${date}${time} Odo ${fmt(reading.odometer)}`.trim();
}
function mileageIssueMessage(issue){
  if(!issue) return "";
  return `Newer ${formatMileageReading(issue.newer)} is lower than older ${formatMileageReading(issue.older)}. Check date, time, and odometer values.`;
}
function mileageIssuesForRecord(vid,recordId,type){
  return vehicleMileageIssues(vid).filter(issue=>{
    if(!recordId) return true;
    return (issue.older.type===type && String(issue.older.recordId)===String(recordId))
      || (issue.newer.type===type && String(issue.newer.recordId)===String(recordId));
  });
}
function mileageRecordHasIssue(vid,recordId,type){
  if(!(type==="Fuel"||type==="Maintenance")) return false;
  return !!mileageIssuesForRecord(vid,recordId,type).length;
}
function mileageWarningClass(vid,recordId,type){
  return mileageRecordHasIssue(vid,recordId,type)?" mileage-warning-field":"";
}
function mileageWarningRowClass(type,r){
  return mileageRecordHasIssue(r.vehicleId,r.recordId,type)?" mileage-warning-row":"";
}
function roBoxClass(label,val,className){
  return `<div class="fieldbox${className||""}"><b>${esc(label)}</b><span>${esc(val??"")}</span></div>`;
}
function mileageIssueHtml(vid,recordId,type){
  const issues=mileageIssuesForRecord(vid,recordId,type);
  if(!issues.length) return "";
  return `<div class="fieldbox full mileage-error"><b>Mileage Error</b><span>${esc(issues.map(mileageIssueMessage).join(" "))}</span></div>`;
}
function vehicleMileageFieldsHtml(vid){
  const summary=vehicleMileageSummary(vid);
  return viewField("Last Refuel Mileage",summary.lastFuelMileage===""?"":fmt(summary.lastFuelMileage))
    +viewField("Last Maintenance Mileage",summary.lastMaintenanceMileage===""?"":fmt(summary.lastMaintenanceMileage))
    +viewField("Current Mileage",summary.currentMileage===""?"":fmt(summary.currentMileage));
}
function vehicleMileageErrorCardHtml(vid){
  const warning=mileageIssueHtml(vid);
  return warning?`<div class="card"><div class="readonly-grid">${warning}</div></div>`:"";
}


function vehicleEdit(app,vid){
  const v=getVehicle(vid);
  if(!v){alert("Vehicle position not found.");return nav("home")}
  const configured=isVehicleConfigured(v);
  const acq=getAcq(v.vehicleId);
  const currentImg=v.primaryPhoto?`<div class="edit-image-preview"><div class="vehicle-edit-photo-frame"><img src="${v.primaryPhoto}" alt="${esc(vehicleLabel(v))}"></div><div class="muted">Current vehicle image saved</div></div>`:`<div class="muted">No vehicle image saved</div>`;
  app.innerHTML=header(configured?"Edit Vehicle":"Add Vehicle")+`<div class="card"><div class="form-grid"><label>Year<input id="vehYear" value="${esc(v.year||"")}"></label><label>Make<input id="vehMake" value="${esc(v.make||"")}"></label><label>Model<input id="vehModel" value="${esc(v.model||"")}"></label><label>Badge<input id="vehBadge" value="${esc(v.badge||"")}"></label><label class="full">Custom Label<input id="vehCustomLabel" maxlength="50" value="${esc(normalizeVehicleCustomLabel(v.customLabel))}"></label></div><div class="image-edit-block"><h3>Vehicle Image</h3>${currentImg}<label>Replace Image<input type="file" id="vehPhoto" accept="image/*"></label><div class="muted">Saved image data: ${v.primaryPhoto?"Present":"None"}</div></div><h3>Vehicle Acquisition Record</h3><div class="form-grid"><label>Acquisition Date<input type="date" id="acqDate" value="${esc(acq.acquisitionDate||"")}"></label><label>Starting Odometer<input type="number" step="0.01" id="startOdo" value="${esc(acq.startingOdometer||"")}"></label><label>Purchase Price<input type="number" step="0.01" id="purchasePrice" value="${esc(acq.purchasePrice||"")}"></label><label>Status<select id="vehStatus"><option ${v.status==="Active"?"selected":""}>Active</option><option ${v.status==="Archived"?"selected":""}>Archived</option></select></label><label class="full">Seller<input id="seller" value="${esc(acq.seller||"")}"></label></div><button class="wide primary" onclick="saveVehicle('${v.vehicleId}')">Save Vehicle</button><button class="wide ghost" onclick="clearVehicleFormExit()">Clear & Exit</button></div>`+bottomNav()+footer();
}
async function imgData(file){return new Promise(resolve=>{const r=new FileReader();r.onload=e=>{const img=new Image();img.onload=()=>{let w=img.width,h=img.height,sc=Math.min(1,1200/Math.max(w,h));const c=document.createElement("canvas");c.width=Math.round(w*sc);c.height=Math.round(h*sc);c.getContext("2d").drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL("image/jpeg",.85))};img.onerror=()=>resolve(e.target.result);img.src=e.target.result};r.readAsDataURL(file)})}
function meaningfulAcquisition(vals){return !!(vals.acquisitionDate||vals.startingOdometer!==""||vals.purchasePrice!==""||vals.seller)}
function saveAcq(vid,vals){
  let a=state.vehicleAcquisitionRecords.find(r=>r.vehicleId===vid);
  if(!a&&!meaningfulAcquisition(vals))return;
  if(!a){a=baseRecord("VehicleAcquisition",vid,"Manual Entry");state.vehicleAcquisitionRecords.push(a)}
  Object.assign(a,vals,{modifiedAt:nowISO()});
  const v=getVehicle(vid);
  if(v){
    v.acquisitionDate=vals.acquisitionDate||"";
    v.purchaseDate=vals.acquisitionDate||"";
    v.startingOdometer=vals.startingOdometer||"";
    v.purchasePrice=vals.purchasePrice||"";
    v.purchaseCost=vals.purchasePrice||"";
    v.seller=vals.seller||"";
    v.modifiedAt=nowISO();
  }
}
async function saveVehicle(vid){
  const existing=getVehicle(vid);
  if(!existing)return alert("Vehicle position not found.");
  const patch={
    year:$("vehYear").value.trim(),
    make:$("vehMake").value.trim(),
    model:$("vehModel").value.trim(),
    badge:$("vehBadge").value.trim(),
    customLabel:normalizeVehicleCustomLabel($("vehCustomLabel").value),
    status:$("vehStatus")?$("vehStatus").value:(existing.status||"Active"),
    modifiedAt:nowISO()
  };
  const identifyingText=patch.make||patch.model||existing.nickname||existing.displayName;
  if(!identifyingText)return alert("Enter a vehicle make, model, nickname, or display name before saving.");
  patch.displayName=[patch.year,patch.make,patch.model].filter(Boolean).join(" ")||existing.nickname||existing.displayName;
  patch.setupComplete=true;
  const f=$("vehPhoto").files[0];
  if(f)patch.primaryPhoto=await imgData(f);
  state=RGBMDataV3.updateVehicleById(state,vid,patch);
  saveAcq(vid,{
    acquisitionDate:$("acqDate").value,
    startingOdometer:numVal($("startOdo").value),
    purchasePrice:numVal($("purchasePrice").value),
    seller:$("seller").value.trim()
  });
  saveData();
  alert("Vehicle saved.");
  nav("home",{},false);
}
function clearVehicleFormExit(){nav("home")} function archiveVehicle(vid){if(confirm("Archive vehicle?")){const v=getVehicle(vid);v.status="Archived";v.modifiedAt=nowISO();saveData();nav("home")}}
function recArray(type){return type==="Fuel"?state.fuelRecords:type==="Maintenance"?state.maintenanceRecords:type==="Insurance"?state.insuranceRecords:state.vehicleAcquisitionRecords}
function dateValue(r,type){const d=r.date||r.dropOffDate||r.effectiveDate||r.acquisitionDate||"";const t=r.time||"";if(!d)return 0;const ms=Date.parse((d+" "+t).trim());return Number.isFinite(ms)?ms:0}
function previousSort(type,a,b){const ad=dateValue(a,type),bd=dateValue(b,type);if(ad||bd){if(bd!==ad)return bd-ad}const ao=Number(a.odometer||a.startingOdometer||0),bo=Number(b.odometer||b.startingOdometer||0);if((type==="Fuel"||type==="Maintenance")&&(ao||bo)&&bo!==ao)return bo-ao;const as=Number(a.entrySequence||0),bs=Number(b.entrySequence||0);if(bs!==as)return bs-as;const am=Date.parse(a.modifiedAt||a.createdAt||"")||0,bm=Date.parse(b.modifiedAt||b.createdAt||"")||0;return bm-am}
function records(type,vid,includeArchived=false){return recArray(type).filter(r=>(!vid||r.vehicleId===vid)&&(includeArchived||!hasTag(r,"Archived"))).sort((a,b)=>previousSort(type,a,b))}
function recordTitle(type,r){
  if(type==="Fuel") return `${formatDisplayDate(r.date)||"No Date"} Odo ${fmt(r.odometer)}`;
  if(type==="Maintenance"){
    const category=r.category||r.service||r.type||"Maintenance";
    const rawOdometer=(r.odometer!==""&&r.odometer!=null)?r.odometer:r.mileage;
    const odometer=rawOdometer==="" || rawOdometer==null ? "" : ` Odo ${fmt(rawOdometer)}`;
    return `${formatDisplayDate(r.dropOffDate||r.date||r.serviceDate)||"No Date"} ${category}${odometer}`;
  }
  if(type==="Insurance") return `${r.agency||r.company||"Insurance"} ${r.policyNumber||""}`;
  return r.recordId;
}
function line(k,v){return `<div><b>${esc(k)}:</b> ${esc(v??"")}</div>`}
function recordDetails(type,r){if(type==="Fuel")return line("Odometer",fmt(r.odometer))+line("Miles",fmt(r.miles))+line("Gallons",fmt(r.gallons,3))+line("MPG",fmtMpg(r.mpg))+line("Station",r.station)+line("Notes",r.notes); if(type==="Maintenance")return line("Odometer",fmt(r.odometer))+line("Cost",money(r.totalCost))+line("Provider",r.serviceProvider||r.provider||"")+line("Notes",r.notes); if(type==="Insurance")return line("Effective",formatDisplayDate(r.effectiveDate))+line("Expiration",formatDisplayDate(r.expirationDate))+line("Premium",money(r.premium))+line("Agency",r.agency||"");return ""}












function previousRecordsHtml(type,vid){const rows=records(type,vid,false);return `<details class="card" open><summary><strong>Previous ${type} Records</strong></summary>${rows.length?rows.map(r=>entryRow(type,r)).join(""):'<p class="muted">No records.</p>'}</details>`}



function meta(r){return `<details class="card data-information"><summary><strong>Data Information</strong></summary><div class="readonly-grid"><div class="fieldbox"><b>Record ID</b><span>${esc(r.recordId)}</span></div><div class="fieldbox"><b>Sequence</b><span>${r.entrySequence}</span></div><div class="fieldbox"><b>Origin</b><span>${esc(canonicalOrigin(r))}</span></div><div class="fieldbox"><b>Status</b><span>${esc(meaningfulStatus(r))}</span></div><div class="fieldbox"><b>Lifecycle</b><span>${esc(canonicalLifecycle(r))}</span></div></div></details>`} function roBox(label,val){return `<div class="fieldbox"><b>${esc(label)}</b><span>${esc(val??"")}</span></div>`}
function findRecord(type,id){
  return recArray(type).find(r=>String(r.recordId)===String(id));
}
function recordView(app,type,id){
  const r=findRecord(type,id);
  if(!r)return nav("home",{},false);
  const warning=(type==="Fuel"||type==="Maintenance")?`<div class="readonly-grid">${mileageIssueHtml(r.vehicleId,id,type)}</div>`:"";
  app.innerHTML=header("View "+type+" Record")+`<div class="card">${meta(r)}${warning}<h3>${type} Information</h3><div class="readonly-grid">${viewFields(type,r)}</div><div class="view-actions"><button class="danger" onclick="archiveRecord('${type}','${id}')">Archive</button><button onclick="navRecord('${type}','${id}','edit')">Edit</button></div></div>`+bottomNav()+footer();
}
function viewFields(type,r){
  if(type==="Fuel"){
    const odometerWarningClass=mileageWarningClass(r.vehicleId,r.recordId,"Fuel");
    return roBox("Date",formatDisplayDate(r.date))+roBox("Time",r.time)+roBoxClass("Odometer",fmt(r.odometer),odometerWarningClass)+roBox("Miles",fmt(r.miles))+roBox("Gallons",fmt(r.gallons,3))+roBox("MPG",fmtMpg(r.mpg))+roBox("Fuel Grade",r.fuelGrade)+roBox("Ethanol Free",r.ethanolFree)+roBox("Station",r.station)+roBox("Cost Source",r.fuelCostSource)+roBox("Price/Gal",fmtPricePerGallon(r.fuelPricePerGallon))+roBox("Total Cost",money(r.totalFuelCost))+roBox("Notes",r.notes);
  }
  if(type==="Maintenance"){
    const odometerWarningClass=mileageWarningClass(r.vehicleId,r.recordId,"Maintenance");
    return roBox("Date",formatDisplayDate(r.dropOffDate||r.date))+roBox("Category",r.category)+roBoxClass("Odometer",fmt(r.odometer),odometerWarningClass)+roBox("Cost",money(r.totalCost||r.cost))+roBox("Location",r.location)+roBox("Provider",r.serviceProvider||r.provider)+roBox("Pickup Date",formatDisplayDate(r.pickUpDate))+roBox("Performed By",r.performedBy)+roBox("Notes",r.notes);
  }
  if(type==="Insurance")return roBox("Agency",r.agency||r.company)+roBox("Policy Number",r.policyNumber)+roBox("Effective Date",formatDisplayDate(r.effectiveDate))+roBox("Expiration Date",formatDisplayDate(r.expirationDate))+roBox("Agreed Value",money(r.agreedValue!==""&&r.agreedValue!=null?r.agreedValue:(r.coverageValue!==""&&r.coverageValue!=null?r.coverageValue:r.insuranceValue)))+roBox("Premium",money(r.premium))+roBox("Agent",r.agent||r.agentName)+roBox("Phone",r.phone)+roBox("Email",r.email)+roBox("Notes",r.notes||r.coverageNotes);
  return "";
}
function commonEdit(r){return `<label>Data Quality<select id="rq">${DATA_QUALITIES.map(q=>`<option ${r.dataQuality===q?'selected':''}>${q}</option>`).join("")}</select></label><label>Tags<input id="rtags" value="${esc(tags(r.classificationTags).join('; '))}"></label><label>Notes<textarea id="rnotes">${esc(r.notes||"")}</textarea></label>`} 




function editFields(type,r){if(type==="Fuel")return `<div class="row"><label>Date<input type="date" id="rdate" value="${esc(r.date||"")}"></label><label>Time<input type="time" id="rtime" value="${esc(r.time||"")}"></label></div><div class="row"><label>Odometer<input type="number" step="0.01" id="rodo" value="${esc(r.odometer)}"></label><label>Miles<input type="number" step="0.01" id="rmiles" value="${esc(r.miles)}"></label></div><div class="row"><label>Gallons<input type="number" step="0.001" id="rgal" value="${esc(r.gallons)}"></label><label>MPG<input type="number" step="0.001" id="rmpg" value="${esc(r.mpg)}"></label></div><label>Station<input id="rstation" value="${esc(r.station||"")}"></label>`; if(type==="Maintenance")return `<label>Date<input type="date" id="rdrop" value="${esc(r.dropOffDate||"")}"></label><label>Category<select id="rcat">${state.maintenanceCategories.map(c=>`<option ${r.category===c?'selected':''}>${esc(c)}</option>`).join("")}</select></label><label>Cost<input type="number" step="0.01" id="rcost" value="${esc(r.totalCost)}"></label>`; if(type==="Insurance")return `<label>Company<input id="rcompany" value="${esc(r.company||"")}"></label><label>Policy Number<input id="rpol" value="${esc(r.policyNumber||"")}"></label><div class="row"><label>Effective<input type="date" id="reff" value="${esc(r.effectiveDate||"")}"></label><label>Expiration<input type="date" id="rexp" value="${esc(r.expirationDate||"")}"></label></div><label>Premium<input type="number" step="0.01" id="rprem" value="${esc(r.premium)}"></label>`;return ""}
 function archiveRecord(type,id){const r=findRecord(type,id);if(confirm("Archive this record?")){addTag(r,"Archived");r.modifiedAt=nowISO();saveData();alert("Record archived.");nav("vehicleView",{vehicleId:r.vehicleId})}}
function openOtherList(selectId,listName,label){const sel=$(selectId);if(sel.value!=="Other")return;showOtherSheet(label,(name,save)=>{if(!name){sel.value="";return}let list=state[listName];if(save&&!list.includes(name)){list.splice(Math.max(0,list.length-1),0,name);saveData()}if(![...sel.options].some(o=>o.value===name)){const opt=document.createElement("option");opt.value=name;opt.textContent=name;sel.insertBefore(opt,sel.querySelector('option[value="Other"]'))}sel.value=name})} function showOtherSheet(label,cb){const div=document.createElement("div");div.className="modal";div.innerHTML=`<div class="sheet"><h2>Other ${esc(label)}</h2><label>${esc(label)} Name<input id="otherName"></label><div class="form-actions"><button class="primary" id="useOnce">Use Once</button><button class="ok" id="saveList">Save To List</button></div><button class="wide danger" id="cancelOther">Cancel</button></div>`;document.body.appendChild(div);$("otherName").focus();$("useOnce").onclick=()=>{const v=$("otherName").value.trim();div.remove();cb(v,false)};$("saveList").onclick=()=>{const v=$("otherName").value.trim();div.remove();cb(v,true)};$("cancelOther").onclick=()=>{div.remove();cb("",false)}}

let activeChoiceModal=null;
function closeChoiceModal(){if(activeChoiceModal){activeChoiceModal.remove();activeChoiceModal=null}return false}
function showChoiceModal(title,actions,message){
  closeChoiceModal();
  const overlay=document.createElement("div");
  overlay.className="modal choice-modal";
  const box=document.createElement("div");
  box.className="choice-box";
  const h2=document.createElement("h2");
  h2.textContent=title||"Choose next action";
  box.appendChild(h2);
  if(message){const p=document.createElement("p");p.className="choice-message";p.textContent=message;box.appendChild(p)}
  const wrap=document.createElement("div");
  wrap.className="choice-buttons";
  (actions||[]).forEach(action=>{
    const btn=document.createElement("button");
    btn.type="button";
    btn.className=((action.className||"ghost")+" wide").trim();
    btn.textContent=action.label||"Continue";
    btn.onclick=()=>{closeChoiceModal(); if(typeof action.onClick==="function") action.onClick();};
    wrap.appendChild(btn);
  });
  box.appendChild(wrap);
  overlay.appendChild(box);
  overlay.addEventListener("click",e=>{if(e.target===overlay)e.preventDefault()});
  document.body.appendChild(overlay);
  activeChoiceModal=overlay;
  const first=wrap.querySelector("button");
  if(first&&first.focus) setTimeout(()=>first.focus(),0);
  return false;
}

function currentQuickFuelValues(){
  return {
    date:cleanText($("fdate")?.value),
    time:cleanText($("ftime")?.value),
    odometer:cleanText($("fodo")?.value),
    miles:cleanText($("fmiles")?.value),
    gallons:cleanText($("fgal")?.value),
    mpg:cleanText($("fmpg")?.value),
    fuelGrade:cleanText($("fgrade")?.value),
    ethanolFree:cleanText($("fef")?.value),
    station:cleanText($("fstation")?.value),
    fuelCostSource:cleanText($("fcostsource")?.value),
    fuelPricePerGallon:cleanText($("fprice")?.value),
    totalFuelCost:cleanText($("fcost")?.value),
    notes:cleanText($("fnotes")?.value)
  };
}
function fuelDefaultRecord(vid){
  const n=new Date();
  return {
    vehicleId:vid,date:n.toISOString().slice(0,10),time:n.toTimeString().slice(0,5),
    odometer:"",miles:"",gallons:"",mpg:"",fuelGrade:activeList("fuelGrades")[0]||"",
    ethanolFree:"",station:(activeList("stations")[0]||""),fuelCostSource:"",
    fuelPricePerGallon:"",totalFuelCost:"",notes:""
  };
}
function isQuickFuelDirty(){
  return !!(route.screen==="quickFuel" && route.mode==="edit" && editSnapshot && editSnapshot.screen==="quickFuel" && JSON.stringify(editSnapshot.values)!==JSON.stringify(currentQuickFuelValues()));
}
function setQuickFuelSnapshot(){
  if(route.screen==="quickFuel" && route.mode==="edit"){
    editSnapshot={screen:"quickFuel",vehicleId:route.vehicleId,recordId:route.recordId||"",values:currentQuickFuelValues()};
  }
}
function fuelReturnPrevious(){
  pendingRecordOpen=null;
  editSnapshot=null;
  const target=route.returnTo?cloneRoute(route.returnTo):historyStack.pop();
  if(target){route=target;renderRoute();return false;}
  rawNav("home",{},false);
  return false;
}
function fuelReturnToList(){
  pendingRecordOpen=null;
  route={screen:"quickFuel",vehicleId:route.vehicleId,mode:"empty",returnTo:route.returnTo||null};
  editSnapshot=null;
  renderRoute();
  return false;
}
function fuelNewEntry(){
  pendingRecordOpen=null;
  route={screen:"quickFuel",vehicleId:route.vehicleId,mode:"edit",recordId:"",returnTo:route.returnTo||null};
  editSnapshot=null;
  renderRoute();
  setTimeout(setQuickFuelSnapshot,0);
  return false;
}

function fuelAfterSavePrompt(){
  return showChoiceModal("Fuel Record Saved",[
    {label:"New Entry",className:"primary",onClick:()=>fuelNewEntry()},
    {label:"Return To List",className:"ghost",onClick:()=>fuelReturnToList()},
    {label:"Return To Previous Screen",className:"ghost",onClick:()=>fuelReturnPrevious()}
  ]);
}
function fuelAfterDiscardPrompt(title){
  return showChoiceModal(title||"Changes Discarded",[
    {label:"New Entry",className:"primary",onClick:()=>fuelNewEntry()},
    {label:"Return To List",className:"ghost",onClick:()=>fuelReturnToList()},
    {label:"Return To Previous Screen",className:"ghost",onClick:()=>fuelReturnPrevious()}
  ]);
}
function fuelViewExitPrompt(){
  return showChoiceModal("Choose next action",[
    {label:"Return To List",className:"primary",onClick:()=>fuelReturnToList()},
    {label:"Return To Previous Screen",className:"ghost",onClick:()=>fuelReturnPrevious()},
    {label:"Stay On This Screen",className:"ghost",onClick:()=>false}
  ]);
}


function fuelBackDestination(){
  const target=(route&&route.returnTo)?route.returnTo:null;
  return (target && target.screen==="home")?"home":"list";
}
function fuelReturnHome(){
  editSnapshot=null;
  rawNav("home",{},false);
  return false;
}
function fuelBackActions(){
  const dest=fuelBackDestination();
  if(dest==="home"){
    return [
      {label:"Save And Return To Home",className:"primary",onClick:()=>{if(saveQuickFuel(route.vehicleId,true)) fuelReturnHome();}},
      {label:"Discard And Return To Home",className:"danger",onClick:()=>fuelReturnHome()},
      {label:"Stay On This Screen",className:"ghost",onClick:()=>false}
    ];
  }
  return [
    {label:"Save And Return To List",className:"primary",onClick:()=>{if(saveQuickFuel(route.vehicleId,true)) fuelReturnToList();}},
    {label:"Discard And Return To List",className:"danger",onClick:()=>fuelReturnToList()},
    {label:"Stay On This Screen",className:"ghost",onClick:()=>false}
  ];
}
function fuelHomeDestinationActions(){
  return [
    {label:"Save And Go Home",className:"primary",onClick:()=>{if(saveQuickFuel(route.vehicleId,true)) fuelReturnHome();}},
    {label:"Discard And Go Home",className:"danger",onClick:()=>fuelReturnHome()},
    {label:"Stay On This Screen",className:"ghost",onClick:()=>false}
  ];
}

function handleQuickFuelHome(){
  if(route.screen==="quickFuel" && route.mode==="edit" && isQuickFuelDirty()){
    return showChoiceModal("Unsaved Changes",fuelHomeDestinationActions());
  }
  return rawNav("home",{},true);
}

function fuelToggleMode(){
  if(route.mode==="view"){
    route={...route,mode:"edit"};
    renderRoute();
    setTimeout(setQuickFuelSnapshot,0);
    return false;
  }
  if(route.mode==="edit" && route.recordId){
    if(isQuickFuelDirty()){
      return showChoiceModal("Unsaved Changes",[
        {label:"Save And View Record",className:"primary",onClick:()=>{if(saveQuickFuel(route.vehicleId,true)){route={...route,mode:"view"};renderRoute();}}},
        {label:"Discard And View Record",className:"danger",onClick:()=>{editSnapshot=null;route={...route,mode:"view"};renderRoute();}},
        {label:"Stay On This Screen",className:"ghost",onClick:()=>false}
      ]);
    }
    route={...route,mode:"view"};
    renderRoute();
  }
  return false;
}

function handleQuickFuelBack(){
  if(route.mode==="view") return fuelViewExitPrompt();
  if(route.mode==="edit"){
    if(isQuickFuelDirty()){
      return showChoiceModal("Unsaved Changes",fuelBackActions());
    }
    return fuelBackDestination()==="home" ? fuelReturnHome() : fuelReturnToList();
  }
  return fuelReturnPrevious();
}

function fuelCancel(){
  if(route.mode==="view") return fuelViewExitPrompt();
  if(route.mode==="edit"){
    if(isQuickFuelDirty()){
      return showChoiceModal("Unsaved Changes",[
        {label:"Save Changes",className:"primary",onClick:()=>{if(saveQuickFuel(route.vehicleId,true)) fuelAfterSavePrompt();}},
        {label:"Discard Changes",className:"danger",onClick:()=>fuelAfterDiscardPrompt("Changes Discarded")},
        {label:"Stay On This Screen",className:"ghost",onClick:()=>false}
      ]);
    }
    return fuelAfterDiscardPrompt("Choose next action");
  }
  return false;
}
function fuelNew(){
  return fuelNewEntry();
}
function openFuelFromHome(vehicleId){
  route={screen:'quickFuel',vehicleId,mode:'edit',returnTo:{screen:'home'}};
  renderRoute();
  setTimeout(setQuickFuelSnapshot,0);
  return false;
}
function openFuelFromVehicle(vehicleId){
  route={screen:'quickFuel',vehicleId,mode:'edit',returnTo:cloneRoute(route)};
  renderRoute();
  setTimeout(setQuickFuelSnapshot,0);
  return false;
}
function fuelFormHtml(vid,r,readOnly){
  const stationList=activeList("stations");
  const gradeList=activeList("fuelGrades");
  const odometerWarningClass=mileageWarningClass(vid,r.recordId,"Fuel");
  if(readOnly){
    return `<div class="readonly-grid">
      ${roBox("Date",formatDisplayDate(r.date))}
      ${roBox("Time",r.time||"")}
      ${roBoxClass("Odometer",fmt(r.odometer),odometerWarningClass)}
      ${roBox("Miles",fmt(r.miles))}
      ${roBox("Gallons",fmt(r.gallons,3))}
      ${roBox("MPG",fmtMpg(r.mpg))}
      ${roBox("Fuel Grade",r.fuelGrade||"")}
      ${roBox("Ethanol Free",r.ethanolFree||"")}
      ${roBox("Station",r.station||"")}
      ${roBox("Cost Source",r.fuelCostSource||"")}
      ${roBox("Price/Gal",fmtPricePerGallon(r.fuelPricePerGallon))}
      ${roBox("Total Cost",money(r.totalFuelCost))}
      ${roBox("Status",meaningfulStatus(r))}
      <div class="fieldbox full"><b>Notes</b><span>${esc(r.notes||"")}</span></div>
    </div>`;
  }
  return `<div class="form-grid">
    <label>Date<input type="date" id="fdate" value="${esc(r.date||"")}"></label>
    <label>Time<input type="time" id="ftime" value="${esc(r.time||"")}"></label>
    <label class="${odometerWarningClass.trim()}">Odometer<input type="number" step="0.01" id="fodo" value="${esc(r.odometer||"")}" oninput="calcFuel('${vid}')"></label>
    <label>Miles<input type="number" step="0.01" id="fmiles" value="${esc(r.miles||"")}" oninput="calcMpg()"></label>
    <label>Gallons<input type="number" step="0.001" id="fgal" value="${esc(r.gallons||"")}" oninput="calcMpg()"></label>
    <label>MPG<input type="number" step="0.001" id="fmpg" value="${esc(r.mpg||"")}" readonly></label>
    <label>Fuel Grade<select id="fgrade" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'fuelGrades')">${gradeList.map(g=>`<option ${g===(r.fuelGrade||"")?'selected':''}>${esc(g)}</option>`).join("")}</select></label>
    <label>Ethanol Free<select id="fef"><option ${String(r.ethanolFree||"")===""?"selected":""}></option><option ${String(r.ethanolFree||"")==="Yes"?"selected":""}>Yes</option><option ${String(r.ethanolFree||"")==="No"?"selected":""}>No</option></select></label>
    <label>Station<select id="fstation" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'stations')">${stationList.map(s=>`<option ${s===(r.station||"")?'selected':''}>${esc(s)}</option>`).join("")}</select></label>
    <label>Cost Source<select id="fcostsource"><option ${String(r.fuelCostSource||"")===""?"selected":""}></option><option ${String(r.fuelCostSource||"")==="Calculated"?"selected":""}>Calculated</option><option ${String(r.fuelCostSource||"")==="Entered"?"selected":""}>Entered</option></select></label>
    <label>Price/Gal<input type="number" step="0.001" id="fprice" value="${esc(r.fuelPricePerGallon||"")}" data-source="${esc(r.fuelPriceSource||"Entered")}" data-original-value="${esc(r.fuelPricePerGallon||"")}" onfocus="fuelCalcFieldFocus('fprice')" onblur="fuelCalcFieldBlur('fprice','Price/Gal')" oninput="calcCost()"></label>
    <label>Total Cost<input type="number" step="0.01" id="fcost" value="${esc(r.totalFuelCost||"")}" data-source="${esc(r.totalFuelCostSource||((r.totalFuelCost!==""&&r.totalFuelCost!=null)?"Entered":"Blank"))}" data-original-value="${esc(r.totalFuelCost||"")}" onfocus="fuelCalcFieldFocus('fcost')" onblur="fuelCalcFieldBlur('fcost','Total Cost')" oninput="calcPriceFromTotal()"></label>
    <label class="full">Notes<textarea id="fnotes">${esc(r.notes||"")}</textarea></label>
  </div>`;
}
function fuelActionButtons(){
  const mode=route.mode||"edit";
  if(mode==="empty") return `<div class="fuel-actions single"><button class="primary" onclick="fuelNew()">New</button></div>`;
  if(mode==="view") return `<div class="fuel-actions"><button class="ghost" onclick="fuelNew()">New</button><button onclick="fuelToggleMode()">Edit</button><button class="ghost" onclick="fuelCancel()">Cancel</button></div>`;
  const toggleBtn=route.recordId?`<button onclick="fuelToggleMode()">View</button>`:'';
  const deleteBtn=route.recordId?`<button class="danger" onclick="fuelDeleteFromEdit()">Delete</button>`:'';
  const spacer=route.recordId?`<span class="fuel-action-spacer" aria-hidden="true" style="visibility:hidden"></span>`:'';
  if(route.recordId){
    return `<div class="fuel-actions"><button class="ghost" onclick="fuelNew()">New</button>${toggleBtn}${deleteBtn}<button class="primary" onclick="saveQuickFuel('${route.vehicleId}')">Save</button>${spacer}<button class="ghost" onclick="fuelCancel()">Cancel</button></div>`;
  }
  return `<div class="fuel-actions"><button class="ghost" onclick="fuelNew()">New</button>${toggleBtn}<button class="primary" onclick="saveQuickFuel('${route.vehicleId}')">Save</button><button class="ghost" onclick="fuelCancel()">Cancel</button></div>`;
}
function quickFuel(app,vid){
  const v=getVehicle(vid);
  if(!v)return nav("home");
  const mode=route.mode||"edit";
  const recordId=route.recordId||"";
  const existing=recordId?findRecord("Fuel",recordId):null;
  const r=existing?existing:fuelDefaultRecord(vid);
  let body=`<div class="card">`;
  if(mode==="empty"){
    body += `<div class="empty-state"><p class="muted">No record selected. Choose a record below or tap New.</p>${fuelActionButtons()}</div>`;
  }else{
    if(existing) body += meta(existing)+`<div class="readonly-grid">${mileageIssueHtml(vid,recordId,"Fuel")}</div>`;
    body += `<div class="rc-title-row"><h3>Fuel Information</h3>${mode==="edit"?receiptButton("fuel"):""}</div>`+fuelFormHtml(vid,r,mode==="view")+fuelActionButtons();
  }
  body += `</div>`;
  app.innerHTML=header(vehicleLabel(v)+" - Fuel")+body+previousRecordsHtml("Fuel",vid)+bottomNav()+footer();
  if(mode==="edit") setTimeout(setQuickFuelSnapshot,0);
}

function otherTitleFromList(listName){
  if(listName==="fuelGrades")return ["Other Fuel Grade","Fuel Grade Name"];
  if(listName==="stations")return ["Other Station","Station Name"];
  if(listName==="maintenanceCategories")return ["Other Maintenance Category","Maintenance Category Name"];
  if(listName==="maintenanceLocations")return ["Other Location","Location Name"];
  if(listName==="maintenanceProviders")return ["Other Provider","Provider Name"];
  if(listName==="maintenancePerformers")return ["Other Performed By","Name"];
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

function previousFuelOdo(vid,odo){
  const rows=records("Fuel",vid,false)
    .filter(r=>r.odometer!==""&&Number(r.odometer)<Number(odo))
    .sort((a,b)=>Number(b.odometer)-Number(a.odometer));
  return rows[0]?.odometer??"";
}
function calcFuel(vid){
  const odo=numVal($("fodo")?.value),prev=previousFuelOdo(vid,odo);
  if(odo!==""&&prev!=="")$("fmiles").value=(odo-prev).toFixed(2);
  calcMpg();
}
function calcMpg(){
  const m=numVal($("fmiles")?.value),g=numVal($("fgal")?.value);
  if($("fmpg"))$("fmpg").value=(m!==""&&g>0)?(m/g).toFixed(3):"";
  calcCost();
}
function calcCost(){
  const g=numVal($("fgal")?.value),p=numVal($("fprice")?.value);
  if($("fcost")&&g!==""&&p!=="")$("fcost").value=(g*p).toFixed(2);
}
function calcPriceFromTotal(){
  const g=numVal($("fgal")?.value),t=numVal($("fcost")?.value);
  if($("fprice")&&g>0&&t!=="")$("fprice").value=(t/g).toFixed(3);
}
function calcEditFuel(vid){
  const odo=numVal($("efodo")?.value),prev=previousFuelOdo(vid,odo);
  if(odo!==""&&prev!=="")$("efmiles").value=(odo-prev).toFixed(2);
  calcEditMpg();
}
function calcEditMpg(){
  const m=numVal($("efmiles")?.value),g=numVal($("efgal")?.value);
  if($("efmpg"))$("efmpg").value=(m!==""&&g>0)?(m/g).toFixed(3):"";
  calcEditCost();
}
function calcEditCost(){
  const g=numVal($("efgal")?.value),p=numVal($("efprice")?.value);
  if($("efcost")&&g!==""&&p!=="")$("efcost").value=(g*p).toFixed(2);
}
function calcEditPriceFromTotal(){
  const g=numVal($("efgal")?.value),t=numVal($("efcost")?.value);
  if($("efprice")&&g>0&&t!=="")$("efprice").value=(t/g).toFixed(3);
}

function fuelRound2(n){return Math.round(Number(n)*100)/100}
function fuelCalcPrice(g,total){const gg=numVal(g),tt=numVal(total); if(gg===""||tt==="") return ""; if(Number(gg)<=0) return ""; return (Number(tt)/Number(gg)).toFixed(3)}
function fuelCalcTotal(g,price){const gg=numVal(g),pp=numVal(price); if(gg===""||pp==="") return ""; if(Number(gg)<=0) return ""; return fuelRound2(Number(gg)*Number(pp)).toFixed(2)}
function fuelToleranceMatch(g,price,total){
  const calc=fuelCalcTotal(g,price);
  if(calc===""||numVal(total)==="") return true;
  return Math.abs(Number(calc)-Number(total))<=0.01;
}
function fuelSourceSummary(priceSource,totalSource){
  if(priceSource==="Calculated" || totalSource==="Calculated") return "Calculated";
  if(priceSource==="Entered" || totalSource==="Entered") return "Entered";
  return "";
}
function fuelCalcFieldFocus(id){
  const el=$(id); if(!el) return;
  el.dataset.preFocusValue = String(el.value ?? "");
}
function fuelCalculatedOverwritePrompt(id,label){
  const el=$(id); if(!el) return false;
  const original=String(el.dataset.originalValue ?? "");
  const current=String(el.value ?? "");
  if(String(el.dataset.source||"")!=="Calculated") return false;
  if(current===original) return false;
  if(current==="") return fuelCalculatedBlankPrompt(id,label);
  return showChoiceModal(label+" Was Calculated",[
    {label:"Change The Value",className:"primary",onClick:()=>{el.dataset.source="Entered"; el.dataset.originalValue=String(el.value ?? "");}},
    {label:"Keep The Value",className:"ghost",onClick:()=>{el.value=original; el.dataset.source="Calculated";}},
    {label:"Cancel",className:"ghost",onClick:()=>{el.value=original; el.dataset.source="Calculated"; setTimeout(()=>el.focus(),0);}}
  ]);
}
function fuelCalculatedBlankPrompt(id,label){
  const el=$(id); if(!el) return false;
  const original=String(el.dataset.originalValue ?? "");
  const isPrice=id==="fprice";
  const calc=isPrice?fuelCalcPrice($("fgal")?.value,$("fcost")?.value):fuelCalcTotal($("fgal")?.value,$("fprice")?.value);
  return showChoiceModal(label+" Was Cleared",[
    {label:"Leave Field Blank",className:"ghost",onClick:()=>{el.dataset.source="Blank"; el.dataset.originalValue="";}},
    {label:"Recalculate",className:"primary",onClick:()=>{ if(calc!==""){ el.value=calc; el.dataset.source="Calculated"; el.dataset.originalValue=calc; }}},
    {label:"Restore Original Value",className:"ghost",onClick:()=>{el.value=original; el.dataset.source="Calculated";}}
  ]);
}
function fuelCalcFieldBlur(id,label){
  const el=$(id); if(!el) return false;
  if(String(el.dataset.source||"")!=="Calculated") return false;
  const original=String(el.dataset.originalValue ?? "");
  const current=String(el.value ?? "");
  if(current===original) return false;
  return current==="" ? fuelCalculatedBlankPrompt(id,label) : fuelCalculatedOverwritePrompt(id,label);
}

function saveQuickFuel(vid,silent,opts){
  opts=opts||{};
  try{
    const date=requireValue($("fdate").value,"Date");
    const gallons=requireNonNegative($("fgal").value,"Gallons");
    const odometer=requireNonNegative($("fodo").value,"Odometer");
    const miles=requireNonNegative($("fmiles").value,"Miles");
    const rawPrice=cleanText($("fprice").value);
    const rawTotal=cleanText($("fcost").value);
    const canCalcPrice=(rawPrice==="" && rawTotal!=="" && gallons!=="");
    const canCalcTotal=(rawTotal==="" && rawPrice!=="" && gallons!=="");
    if(canCalcPrice && !opts.allowBlankPrice && !opts.didCalcPrice){
      return showChoiceModal("Price/Gal Is Blank",[
        {label:"Calculate Value",className:"primary",onClick:()=>{const calc=fuelCalcPrice($("fgal").value,$("fcost").value); if(calc!==""){ $("fprice").value=calc; $("fprice").dataset.source="Calculated"; $("fprice").dataset.originalValue=calc; saveQuickFuel(vid,silent,{didCalcPrice:true}); }}},
        {label:"Leave Field Blank",className:"ghost",onClick:()=>saveQuickFuel(vid,silent,{allowBlankPrice:true})},
        {label:"Cancel",className:"ghost",onClick:()=>false}
      ]);
    }
    if(canCalcTotal && !opts.allowBlankTotal && !opts.didCalcTotal){
      return showChoiceModal("Total Cost Is Blank",[
        {label:"Calculate Value",className:"primary",onClick:()=>{const calc=fuelCalcTotal($("fgal").value,$("fprice").value); if(calc!==""){ $("fcost").value=calc; $("fcost").dataset.source="Calculated"; $("fcost").dataset.originalValue=calc; saveQuickFuel(vid,silent,{didCalcTotal:true}); }}},
        {label:"Leave Field Blank",className:"ghost",onClick:()=>saveQuickFuel(vid,silent,{allowBlankTotal:true})},
        {label:"Cancel",className:"ghost",onClick:()=>false}
      ]);
    }
    const price=(rawPrice==="")?"":requireNonNegative(rawPrice,"Price/Gal");
    const total=(rawTotal==="")?"":requireNonNegative(rawTotal,"Total Cost");
    const substantive=[odometer,gallons,miles,cleanText($("fstation").value),cleanText($("fgrade").value),cleanText($("fef").value),price,total,cleanText($("fnotes").value),requireNonNegative($("fmpg").value,"MPG")].some(v=>v!=="");
    if(!substantive) throw new Error("Enter record details before saving.");
    let r=route.recordId?findRecord("Fuel",route.recordId):null;
    if(!r){
      r=baseRecord("Fuel",vid,"Manual Entry");
      state.fuelRecords.push(r);
    }
    const priceSource=(rawPrice==="")?String($("fprice").dataset.source||"Blank"):String($("fprice").dataset.source||"Entered");
    const totalSource=(rawTotal==="")?String($("fcost").dataset.source||"Blank"):String($("fcost").dataset.source||"Entered");
    Object.assign(r,{
      date,
      time:$("ftime").value,
      odometer,
      miles,
      gallons,
      mpg:requireNonNegative($("fmpg").value,"MPG"),
      fuelGrade:cleanText($("fgrade").value),
      ethanolFree:cleanText($("fef").value),
      station:cleanText($("fstation").value),
      fuelPricePerGallon:price,
      totalFuelCost:total,
      fuelPriceSource:priceSource,
      totalFuelCostSource:totalSource,
      fuelCostSource:fuelSourceSummary(priceSource,totalSource),
      notes:cleanText($("fnotes").value),
      attachments:r.attachments||[],
      origin:"Manual Entry",
      source:"Manual Entry",
      lifecycle:canonicalLifecycle(r)
    });
    r.modifiedAt=nowISO();
    applyRecordLabelModel(state);
    saveData();
    editSnapshot=null;
    if(!silent) return fuelAfterSavePrompt();
    return true;
  }catch(e){alert(e.message||String(e));return false;}
}


function currentQuickMaintenanceValues(){
  return {
    dropOffDate:cleanText($("mdrop")?.value),
    pickUpDate:cleanText($("mpick")?.value),
    category:cleanText($("mcat")?.value),
    odometer:cleanText($("modo")?.value),
    totalCost:cleanText($("mcost")?.value),
    location:cleanText($("mloc")?.value),
    provider:cleanText($("mprov")?.value),
    performedBy:cleanText($("mperf")?.value),
    notes:cleanText($("mnotes")?.value)
  };
}
function maintenanceDefaultRecord(vid){
  const n=new Date().toISOString().slice(0,10);
  return {vehicleId:vid,dropOffDate:n,pickUpDate:"",category:activeList("maintenanceCategories")[0]||"Maintenance",odometer:"",totalCost:"",location:"",provider:"",performedBy:"",notes:""};
}
function isQuickMaintenanceDirty(){
  return !!(route.screen==="quickMaintenance" && route.mode==="edit" && editSnapshot && editSnapshot.screen==="quickMaintenance" && JSON.stringify(editSnapshot.values)!==JSON.stringify(currentQuickMaintenanceValues()));
}
function setQuickMaintenanceSnapshot(){
  if(route.screen==="quickMaintenance" && route.mode==="edit") editSnapshot={screen:"quickMaintenance",vehicleId:route.vehicleId,recordId:route.recordId||"",values:currentQuickMaintenanceValues()};
}
function maintenanceReturnPrevious(){
  pendingRecordOpen=null;
  editSnapshot=null;
  const target=route.returnTo?cloneRoute(route.returnTo):historyStack.pop();
  if(target){route=target;renderRoute();return false;}
  rawNav("home",{},false);
  return false;
}
function maintenanceReturnToList(){
  pendingRecordOpen=null;
  route={screen:"quickMaintenance",vehicleId:route.vehicleId,mode:"empty",returnTo:route.returnTo||null};
  editSnapshot=null; renderRoute(); return false;
}
function maintenanceNewEntry(){
  pendingRecordOpen=null;
  route={screen:"quickMaintenance",vehicleId:route.vehicleId,mode:"edit",recordId:"",returnTo:route.returnTo||null};
  editSnapshot=null; renderRoute(); setTimeout(setQuickMaintenanceSnapshot,0); return false;
}
function maintenanceAfterSavePrompt(){
  return showChoiceModal("Maintenance Record Saved",[
    {label:"New Entry",className:"primary",onClick:()=>maintenanceNewEntry()},
    {label:"Return To List",className:"ghost",onClick:()=>maintenanceReturnToList()},
    {label:"Return To Previous Screen",className:"ghost",onClick:()=>maintenanceReturnPrevious()}
  ]);
}
function maintenanceAfterDiscardPrompt(title){
  return showChoiceModal(title||"Changes Discarded",[
    {label:"New Entry",className:"primary",onClick:()=>maintenanceNewEntry()},
    {label:"Return To List",className:"ghost",onClick:()=>maintenanceReturnToList()},
    {label:"Return To Previous Screen",className:"ghost",onClick:()=>maintenanceReturnPrevious()}
  ]);
}
function maintenanceViewExitPrompt(){
  return showChoiceModal("Choose Next Action",[
    {label:"Return To List",className:"primary",onClick:()=>maintenanceReturnToList()},
    {label:"Return To Previous Screen",className:"ghost",onClick:()=>maintenanceReturnPrevious()},
    {label:"Stay On This Screen",className:"ghost",onClick:()=>false}
  ]);
}
function maintenanceReturnHome(){ editSnapshot=null; rawNav("home",{},false); return false; }
function maintenanceBackActions(){
  return [
    {label:"Save And Return To List",className:"primary",onClick:()=>{if(saveQuickMaintenance(route.vehicleId,true)) maintenanceReturnToList();}},
    {label:"Discard And Return To List",className:"danger",onClick:()=>maintenanceReturnToList()},
    {label:"Stay On This Screen",className:"ghost",onClick:()=>false}
  ];
}
function maintenanceHomeActions(){
  return [
    {label:"Save And Go Home",className:"primary",onClick:()=>{if(saveQuickMaintenance(route.vehicleId,true)) maintenanceReturnHome();}},
    {label:"Discard And Go Home",className:"danger",onClick:()=>maintenanceReturnHome()},
    {label:"Stay On This Screen",className:"ghost",onClick:()=>false}
  ];
}
function handleQuickMaintenanceHome(){
  if(route.screen==="quickMaintenance" && route.mode==="edit" && isQuickMaintenanceDirty()) return showChoiceModal("Unsaved Changes",maintenanceHomeActions());
  return rawNav("home",{},true);
}
function maintenanceToggleMode(){
  if(route.mode==="view"){
    route={...route,mode:"edit"}; renderRoute(); setTimeout(setQuickMaintenanceSnapshot,0); return false;
  }
  if(route.mode==="edit" && route.recordId){
    if(isQuickMaintenanceDirty()) return showChoiceModal("Unsaved Changes",[
      {label:"Save And View Record",className:"primary",onClick:()=>{if(saveQuickMaintenance(route.vehicleId,true)){route={...route,mode:"view"};renderRoute();}}},
      {label:"Discard And View Record",className:"danger",onClick:()=>{editSnapshot=null;route={...route,mode:"view"};renderRoute();}},
      {label:"Stay On This Screen",className:"ghost",onClick:()=>false}
    ]);
    route={...route,mode:"view"}; renderRoute();
  }
  return false;
}
function handleQuickMaintenanceBack(){
  if(route.mode==="view") return maintenanceViewExitPrompt();
  if(route.mode==="edit"){
    if(isQuickMaintenanceDirty()) return showChoiceModal("Unsaved Changes",maintenanceBackActions());
    return maintenanceReturnToList();
  }
  return maintenanceReturnPrevious();
}
function maintenanceCancel(){
  if(route.mode==="view") return maintenanceViewExitPrompt();
  if(route.mode==="edit"){
    if(isQuickMaintenanceDirty()) return showChoiceModal("Unsaved Changes",[
      {label:"Save Changes",className:"primary",onClick:()=>{if(saveQuickMaintenance(route.vehicleId,true)) maintenanceAfterSavePrompt();}},
      {label:"Discard Changes",className:"danger",onClick:()=>maintenanceAfterDiscardPrompt("Changes Discarded")},
      {label:"Stay On This Screen",className:"ghost",onClick:()=>false}
    ]);
    return maintenanceAfterDiscardPrompt("Choose Next Action");
  }
  return false;
}
function maintenanceNew(){ return maintenanceNewEntry(); }
function openMaintenanceFromVehicle(vehicleId){ route={screen:'quickMaintenance',vehicleId,mode:'edit',returnTo:cloneRoute(route)}; renderRoute(); setTimeout(setQuickMaintenanceSnapshot,0); return false; }
function maintenanceFormHtml(vid,r,readOnly){
  const catList=activeList("maintenanceCategories");
  const odometerWarningClass=mileageWarningClass(vid,r.recordId,"Maintenance");
  if(readOnly){
    return `<div class="readonly-grid">
      ${roBox("Date",formatDisplayDate(r.dropOffDate||r.date))}
      ${roBox("Pickup Date",formatDisplayDate(r.pickUpDate))}
      ${roBox("Category",r.category||"")}
      ${roBoxClass("Odometer",fmt(r.odometer),odometerWarningClass)}
      ${roBox("Cost",money(r.totalCost||r.cost))}
      ${roBox("Location",r.location||"")}
      ${roBox("Provider",r.serviceProvider||r.provider||"")}
      ${roBox("Performed By",r.performedBy||"")}
      ${roBox("Status",meaningfulStatus(r))}
      <div class="fieldbox full"><b>Notes</b><span>${esc(r.notes||"")}</span></div>
    </div>`;
  }
  return `<div class="form-grid">
    <label>Date<input type="date" id="mdrop" value="${esc(r.dropOffDate||r.date||"")}"></label>
    <label>Pickup Date<input type="date" id="mpick" value="${esc(r.pickUpDate||"")}"></label>
    <label>Category<select id="mcat" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'maintenanceCategories')">${catList.map(c=>`<option ${c===(r.category||"")?'selected':''}>${esc(c)}</option>`).join("")}</select></label>
    <label class="${odometerWarningClass.trim()}">Odometer<input type="number" step="0.01" id="modo" value="${esc(r.odometer||"")}"></label>
    <label>Cost<input type="number" step="0.01" id="mcost" value="${esc(r.totalCost||r.cost||"")}"></label>
    <label>Location${maintPickSelect("mloc","maintenanceLocations",r.location)}</label>
    <label>Provider${maintPickSelect("mprov","maintenanceProviders",r.serviceProvider||r.provider)}</label>
    <label>Performed By${maintPickSelect("mperf","maintenancePerformers",r.performedBy)}</label>
    <label class="full">Notes<textarea id="mnotes">${esc(r.notes||"")}</textarea></label>
  </div>`;
}
function maintenanceActionButtons(){
  const mode=route.mode||"edit";
  if(mode==="empty") return `<div class="fuel-actions single"><button class="primary" onclick="maintenanceNew()">New</button></div>`;
  if(mode==="view") return `<div class="fuel-actions"><button class="ghost" onclick="maintenanceNew()">New</button><button onclick="maintenanceToggleMode()">Edit</button><button class="ghost" onclick="maintenanceCancel()">Cancel</button></div>`;
  const toggleBtn=route.recordId?`<button onclick="maintenanceToggleMode()">View</button>`:'';
  const deleteBtn=route.recordId?`<button class="danger" onclick="maintenanceDeleteFromEdit()">Delete</button>`:'';
  const spacer=route.recordId?`<span class="fuel-action-spacer" aria-hidden="true" style="visibility:hidden"></span>`:'';
  if(route.recordId){
    return `<div class="fuel-actions"><button class="ghost" onclick="maintenanceNew()">New</button>${toggleBtn}${deleteBtn}<button class="primary" onclick="saveQuickMaintenance('${route.vehicleId}')">Save</button>${spacer}<button class="ghost" onclick="maintenanceCancel()">Cancel</button></div>`;
  }
  return `<div class="fuel-actions"><button class="ghost" onclick="maintenanceNew()">New</button>${toggleBtn}<button class="primary" onclick="saveQuickMaintenance('${route.vehicleId}')">Save</button><button class="ghost" onclick="maintenanceCancel()">Cancel</button></div>`;
}
function quickMaintenance(app,vid){
  const v=getVehicle(vid); if(!v)return nav("home");
  const mode=route.mode||"edit"; const recordId=route.recordId||""; const existing=recordId?findRecord("Maintenance",recordId):null; const r=existing?existing:maintenanceDefaultRecord(vid);
  let body=`<div class="card">`;
  if(mode==="empty") body += `<div class="empty-state"><p class="muted">No record selected. Choose a record below or tap New.</p>${maintenanceActionButtons()}</div>`;
  else { if(existing) body += meta(existing)+`<div class="readonly-grid">${mileageIssueHtml(vid,recordId,"Maintenance")}</div>`; body += `<div class="rc-title-row"><h3>Maintenance Information</h3>${mode==="edit"?receiptButton("maintenance"):""}</div>`+maintenanceFormHtml(vid,r,mode==="view")+maintenanceActionButtons(); }
  body += `</div>`;
  app.innerHTML=header(vehicleLabel(v)+" - Maintenance")+body+previousRecordsHtml("Maintenance",vid)+bottomNav()+footer();
  if(mode==="edit") setTimeout(setQuickMaintenanceSnapshot,0);
}
function saveQuickMaintenance(vid,silent){
  try{
    const date=requireValue($("mdrop").value,"Date");
    const odometer=requireNonNegative($("modo").value,"Odometer");
    const totalCost=requireNonNegative($("mcost").value,"Cost");
    const provider=cleanText($("mprov").value);
    let r=route.recordId?findRecord("Maintenance",route.recordId):null;
    if(!r){ r=baseRecord("Maintenance",vid,"Manual Entry"); state.maintenanceRecords.push(r); }
    Object.assign(r,{date,dropOffDate:date,pickUpDate:cleanText($("mpick").value),category:cleanText($("mcat").value)||"Maintenance",odometer,totalCost,cost:totalCost,location:cleanText($("mloc").value),serviceProvider:provider,provider,performedBy:cleanText($("mperf").value),notes:cleanText($("mnotes").value),attachments:r.attachments||[],origin:"Manual Entry",source:"Manual Entry",lifecycle:canonicalLifecycle(r)});
    r.modifiedAt=nowISO(); applyRecordLabelModel(state); saveData(); editSnapshot=null; if(!silent) return maintenanceAfterSavePrompt(); return true;
  }catch(e){alert(e.message||String(e));return false;}
}

function currentQuickInsuranceValues(){
  return {
    agency:cleanText($("iagency")?.value),
    policyNumber:cleanText($("ipol")?.value),
    effectiveDate:cleanText($("ieff")?.value),
    expirationDate:cleanText($("iexp")?.value),
    agreedValue:cleanText($("iagree")?.value),
    premium:cleanText($("iprem")?.value),
    agent:cleanText($("iagent")?.value),
    phone:cleanText($("iphone")?.value),
    email:cleanText($("iemail")?.value),
    notes:cleanText($("inotes")?.value),
    docs:DOC.pending.length
  };
}
function insuranceDefaultRecord(vid){
  return {vehicleId:vid,agency:"",policyNumber:"",effectiveDate:"",expirationDate:"",agreedValue:"",premium:"",agent:"",phone:"",email:"",notes:""};
}
function isQuickInsuranceDirty(){
  return !!(route.screen==="quickInsurance" && route.mode==="edit" && editSnapshot && editSnapshot.screen==="quickInsurance" && JSON.stringify(editSnapshot.values)!==JSON.stringify(currentQuickInsuranceValues()));
}
function setQuickInsuranceSnapshot(){
  if(route.screen==="quickInsurance" && route.mode==="edit") editSnapshot={screen:"quickInsurance",vehicleId:route.vehicleId,recordId:route.recordId||"",values:currentQuickInsuranceValues()};
}
function insuranceReturnPrevious(){
  pendingRecordOpen=null;
  editSnapshot=null;
  const target=route.returnTo?cloneRoute(route.returnTo):historyStack.pop();
  if(target){route=target;renderRoute();return false;}
  rawNav("home",{},false);
  return false;
}
function insuranceReturnToList(){
  pendingRecordOpen=null;
  route={screen:"quickInsurance",vehicleId:route.vehicleId,mode:"empty",returnTo:route.returnTo||null};
  editSnapshot=null;
  renderRoute();
  return false;
}
function insuranceNewEntry(){
  pendingRecordOpen=null;
  route={screen:"quickInsurance",vehicleId:route.vehicleId,mode:"edit",recordId:"",returnTo:route.returnTo||null};
  editSnapshot=null;
  renderRoute();
  setTimeout(setQuickInsuranceSnapshot,0);
  return false;
}
function insuranceAfterSavePrompt(){
  return showChoiceModal("Insurance Record Saved",[
    {label:"New Entry",className:"primary",onClick:()=>insuranceNewEntry()},
    {label:"Return To List",className:"ghost",onClick:()=>insuranceReturnToList()},
    {label:"Return To Previous Screen",className:"ghost",onClick:()=>insuranceReturnPrevious()}
  ]);
}
function insuranceAfterDiscardPrompt(title){
  return showChoiceModal(title||"Changes Discarded",[
    {label:"New Entry",className:"primary",onClick:()=>insuranceNewEntry()},
    {label:"Return To List",className:"ghost",onClick:()=>insuranceReturnToList()},
    {label:"Return To Previous Screen",className:"ghost",onClick:()=>insuranceReturnPrevious()}
  ]);
}
function insuranceViewExitPrompt(){
  return showChoiceModal("Choose Next Action",[
    {label:"Return To List",className:"primary",onClick:()=>insuranceReturnToList()},
    {label:"Return To Previous Screen",className:"ghost",onClick:()=>insuranceReturnPrevious()},
    {label:"Stay On This Screen",className:"ghost",onClick:()=>false}
  ]);
}
function insuranceReturnHome(){ pendingRecordOpen=null; editSnapshot=null; rawNav("home",{},false); return false; }
function insuranceBackActions(){
  return [
    {label:"Save And Return To List",className:"primary",onClick:()=>{if(saveQuickInsurance(route.vehicleId,true)) insuranceReturnToList();}},
    {label:"Discard And Return To List",className:"danger",onClick:()=>insuranceReturnToList()},
    {label:"Stay On This Screen",className:"ghost",onClick:()=>false}
  ];
}
function insuranceHomeActions(){
  return [
    {label:"Save And Go Home",className:"primary",onClick:()=>{if(saveQuickInsurance(route.vehicleId,true)) insuranceReturnHome();}},
    {label:"Discard And Go Home",className:"danger",onClick:()=>insuranceReturnHome()},
    {label:"Stay On This Screen",className:"ghost",onClick:()=>false}
  ];
}
function handleQuickInsuranceHome(){
  if(route.screen==="quickInsurance" && route.mode==="edit" && isQuickInsuranceDirty()) return showChoiceModal("Unsaved Changes",insuranceHomeActions());
  return rawNav("home",{},true);
}
function insuranceToggleMode(){
  if(route.mode==="view"){
    route={...route,mode:"edit"}; renderRoute(); setTimeout(setQuickInsuranceSnapshot,0); return false;
  }
  if(route.mode==="edit" && route.recordId){
    if(isQuickInsuranceDirty()) return showChoiceModal("Unsaved Changes",[
      {label:"Save And View Record",className:"primary",onClick:()=>{if(saveQuickInsurance(route.vehicleId,true)){route={...route,mode:"view"};renderRoute();}}},
      {label:"Discard And View Record",className:"danger",onClick:()=>{editSnapshot=null;route={...route,mode:"view"};renderRoute();}},
      {label:"Stay On This Screen",className:"ghost",onClick:()=>false}
    ]);
    route={...route,mode:"view"}; renderRoute();
  }
  return false;
}
function handleQuickInsuranceBack(){
  if(route.mode==="view") return insuranceViewExitPrompt();
  if(route.mode==="edit"){
    if(isQuickInsuranceDirty()) return showChoiceModal("Unsaved Changes",insuranceBackActions());
    return insuranceReturnToList();
  }
  return insuranceReturnPrevious();
}
function insuranceCancel(){
  if(route.mode==="view") return insuranceViewExitPrompt();
  if(route.mode==="edit"){
    if(isQuickInsuranceDirty()) return showChoiceModal("Unsaved Changes",[
      {label:"Save Changes",className:"primary",onClick:()=>{if(saveQuickInsurance(route.vehicleId,true)) insuranceAfterSavePrompt();}},
      {label:"Discard Changes",className:"danger",onClick:()=>insuranceAfterDiscardPrompt("Changes Discarded")},
      {label:"Stay On This Screen",className:"ghost",onClick:()=>false}
    ]);
    return insuranceAfterDiscardPrompt("Choose Next Action");
  }
  return false;
}
function insuranceNew(){ return insuranceNewEntry(); }
function openInsuranceFromVehicle(vehicleId){ route={screen:'quickInsurance',vehicleId,mode:'edit',returnTo:cloneRoute(route)}; renderRoute(); setTimeout(setQuickInsuranceSnapshot,0); return false; }
function insuranceFormHtml(vid,r,readOnly){
  if(readOnly){
    return `<div class="readonly-grid">
      ${roBox("Agency",r.agency||r.company||"")}
      ${roBox("Policy Number",r.policyNumber||"")}
      ${roBox("Effective Date",formatDisplayDate(r.effectiveDate))}
      ${roBox("Expiration Date",formatDisplayDate(r.expirationDate))}
      ${roBox("Agreed Value",money(r.agreedValue!==""&&r.agreedValue!=null?r.agreedValue:(r.coverageValue!==""&&r.coverageValue!=null?r.coverageValue:r.insuranceValue)))}
      ${roBox("Premium",money(r.premium))}
      ${roBox("Agent",r.agent||r.agentName||"")}
      ${roBox("Phone",r.phone||"")}
      ${roBox("Email",r.email||"")}
      ${roBox("Status",meaningfulStatus(r))}
      <div class="fieldbox full"><b>Notes</b><span>${esc(r.notes||r.coverageNotes||"")}</span></div>
    </div>`;
  }
  return `<div class="form-grid">
    <label>Agency<input id="iagency" value="${esc(r.agency||r.company||"")}"></label>
    <label>Policy Number<input id="ipol" value="${esc(r.policyNumber||"")}"></label>
    <label>Effective Date<input type="date" id="ieff" value="${esc(r.effectiveDate||"")}"></label>
    <label>Expiration Date<input type="date" id="iexp" value="${esc(r.expirationDate||"")}"></label>
    <label>Agreed Value<input type="number" step="0.01" id="iagree" value="${esc(r.agreedValue!==""&&r.agreedValue!=null?r.agreedValue:(r.coverageValue!==""&&r.coverageValue!=null?r.coverageValue:r.insuranceValue))}"></label>
    <label>Premium<input type="number" step="0.01" id="iprem" value="${esc(r.premium||"")}"></label>
    <label>Agent<input id="iagent" value="${esc(r.agent||r.agentName||"")}"></label>
    <label>Phone<input id="iphone" value="${esc(r.phone||"")}"></label>
    <label>Email<input type="email" id="iemail" value="${esc(r.email||"")}"></label>
    <label class="full">Notes<textarea id="inotes">${esc(r.notes||r.coverageNotes||"")}</textarea></label>
  </div>`;
}
function insuranceActionButtons(){
  const mode=route.mode||"edit";
  if(mode==="empty") return `<div class="fuel-actions single"><button class="primary" onclick="insuranceNew()">New</button></div>`;
  if(mode==="view") return `<div class="fuel-actions"><button class="ghost" onclick="insuranceNew()">New</button><button onclick="insuranceToggleMode()">Edit</button><button class="ghost" onclick="insuranceCancel()">Cancel</button></div>`;
  const toggleBtn=route.recordId?`<button onclick="insuranceToggleMode()">View</button>`:'';
  const deleteBtn=route.recordId?`<button class="danger" onclick="insuranceDeleteFromEdit()">Delete</button>`:'';
  const spacer=route.recordId?`<span class="fuel-action-spacer" aria-hidden="true" style="visibility:hidden"></span>`:'';
  if(route.recordId){
    return `<div class="fuel-actions"><button class="ghost" onclick="insuranceNew()">New</button>${toggleBtn}${deleteBtn}<button class="primary" onclick="saveQuickInsurance('${route.vehicleId}')">Save</button>${spacer}<button class="ghost" onclick="insuranceCancel()">Cancel</button></div>`;
  }
  return `<div class="fuel-actions"><button class="ghost" onclick="insuranceNew()">New</button>${toggleBtn}<button class="primary" onclick="saveQuickInsurance('${route.vehicleId}')">Save</button><button class="ghost" onclick="insuranceCancel()">Cancel</button></div>`;
}
function quickInsurance(app,vid){
  const v=getVehicle(vid); if(!v)return nav("home");
  const mode=route.mode||"edit"; const recordId=route.recordId||""; const existing=recordId?findRecord("Insurance",recordId):null; const r=existing?existing:insuranceDefaultRecord(vid);
  DOC.pending=[];   /* links for an unsaved record are only kept until this form is left */
  let body=`<div class="card">`;
  if(mode==="empty") body += `<div class="empty-state"><p class="muted">No record selected. Choose a record below or tap New.</p>${insuranceActionButtons()}</div>`;
  else { if(existing) body += meta(existing); body += `<div class="rc-title-row"><h3>Insurance Information</h3>${mode==="edit"?docButton():""}</div>`+insuranceFormHtml(vid,r,mode==="view")+docListHtml(existing,mode==="edit")+insuranceActionButtons(); }
  body += `</div>`;
  app.innerHTML=header(vehicleLabel(v)+" - Insurance")+body+previousRecordsHtml("Insurance",vid)+bottomNav()+footer();
  if(mode==="edit") setTimeout(setQuickInsuranceSnapshot,0);
}
function saveQuickInsurance(vid,silent){
  try{
    const agency=cleanText($("iagency").value);
    const policyNumber=cleanText($("ipol").value);
    const effectiveDate=cleanText($("ieff").value);
    const expirationDate=cleanText($("iexp").value);
    if(expirationDate&&expirationDate<effectiveDate) throw new Error("Expiration Date cannot be earlier than Effective Date.");
    const agreedValue=requireNonNegative($("iagree").value,"Agreed Value");
    const premium=requireNonNegative($("iprem").value,"Premium");
    const agent=cleanText($("iagent").value);
    const notes=cleanText($("inotes").value);
    let r=route.recordId?findRecord("Insurance",route.recordId):null;
    if(!r){ r=baseRecord("Insurance",vid,"Manual Entry"); state.insuranceRecords.push(r); }
    Object.assign(r,{
      company:agency,
      agency,
      policyNumber,
      effectiveDate,
      expirationDate,
      agreedValue,
      coverageValue:agreedValue,
      insuranceValue:agreedValue,
      premium,
      agent,
      agentName:agent,
      phone:cleanText($("iphone").value),
      email:cleanText($("iemail").value),
      notes,
      coverageNotes:notes,
      attachments:[...(r.attachments||[]),...DOC.pending.splice(0)],
      origin:"Manual Entry",
      source:"Manual Entry",
      lifecycle:canonicalLifecycle(r)
    });
    r.modifiedAt=nowISO();
    applyRecordLabelModel(state);
    saveData();
    editSnapshot=null;
    if(!silent) return insuranceAfterSavePrompt();
    return true;
  }catch(e){ alert(e.message||String(e)); return false; }
}

function dataScreen(app){app.innerHTML=header("Data Management")+`<div class="card"><h2>Backup & Restore</h2><button class="wide primary" onclick="downloadBackup()">Create JSON Backup</button><label>Restore JSON<input type="file" id="restoreFile" accept=".json"></label><label>Restore Mode<select id="restoreMode"><option>Replace</option><option>Update</option><option>Duplicate</option><option>Skip</option></select></label><button class="wide" onclick="restoreBackup()">Restore JSON Backup</button><button class="wide ghost" onclick="if(confirm('Clear old RGB Mileage cached storage? Current active data may be removed.')){clearRGBMStorage(false);alert('Old RGB Mileage storage cleared.')}">Clear Old Cached Storage</button><pre id="dataStatus" class="small"></pre></div><div class="card"><h2>CSV Import</h2><p class="muted">CSV import supports Fuel and Maintenance records.</p><label>Vehicle<select id="importVehicle">${configuredVehicles().map(v=>`<option value="${v.vehicleId}">${esc(vehicleLabel(v))}</option>`).join("")}</select></label><label>Imported Data Type<select id="importDataType"><option>Migrated Data</option><option>Other Data</option></select></label><label>CSV File<input type="file" id="csvFile" accept=".csv"></label><label>Duplicate Mode<select id="importMode"><option>Skip</option><option>Update</option><option>Duplicate</option><option>Replace</option><option>Cancel</option></select></label><button class="wide" onclick="previewCSV()">Preview Import</button><button class="wide primary" onclick="savePreviewRows()">Save Previewed Rows</button><pre id="importStatus" class="small"></pre></div>`+bottomNav()+footer()}
function backupPayload(){
  const p=JSON.parse(JSON.stringify(state));
  p.vehicles=(p.vehicles||[]).map(v=>({...v,customLabel:normalizeVehicleCustomLabel(v.customLabel)}));
  p.app="RGB Mileage";
  p.appVersion=VERSION;
  p.buildId=VERSION;
  p.buildDate=BUILD_DATE;
  p.schemaVersion=SCHEMA_VERSION;
  p.migrationVersion=RGBMDataV3.MIGRATION_VERSION;
  p.exportedAt=nowISO();
  p.exportedByVersion=VERSION;
  p.backupType="Full JSON";
  p.metadata={
    vehicleCount:configuredVehicles().length,
    vehicleSlotCount:state.vehicles.length,
    vehicleOrder:[...state.vehicleOrder],
    fuelRecordCount:state.fuelRecords.length,
    maintenanceRecordCount:state.maintenanceRecords.length,
    insuranceRecordCount:state.insuranceRecords.length,
    attachmentCount:state.attachments.length
  };
  return p;
}
function downloadBackup(){
  const p=backupPayload(),txt=JSON.stringify(p,null,2);
  if(!confirm(`Backup Summary\nConfigured Vehicles: ${p.metadata.vehicleCount}\nVehicle Positions: ${p.metadata.vehicleSlotCount}\nFuel: ${p.metadata.fuelRecordCount}\nMaintenance: ${p.metadata.maintenanceRecordCount}\nInsurance: ${p.metadata.insuranceRecordCount}\nEstimated Size: ${new Blob([txt]).size} bytes\n\nCreate backup?`))return;
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([txt],{type:"application/json"}));
  a.download=`RGBM_Backup_${VERSION}_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  state.settings.lastBackupDate=nowISO();
  saveData();
}
function restoreBackup(){
  const f=$("restoreFile").files[0];
  if(!f)return alert("Choose a JSON backup first.");
  const r=new FileReader();
  r.onload=()=>{
    try{
      const raw=JSON.parse(r.result);
      const incoming=normalizeData(raw,"restore-preview");
      const mode=($("restoreMode")?.value||"Replace");
      const summary=mergeSummary(incoming,mode);
      if(!confirm(summary+"\n\nContinue?"))return;
      const merged=RGBMDataV3.mergeRestoreState(state,raw,mode,{
        context:dataContext("restore"),
        sourceKey:"restore",
        adoptIncomingOrder:mode==="Replace"
      });
      state=merged.state;
      saveData();
      window.__RGBM_WC10_LAST_RESTORE_REPORT=merged.report;
      alert("Restore complete.");
      nav("home");
    }catch(e){
      const code=e&&e.code?` [${e.code}]`:"";
      alert("Restore failed"+code+": "+(e&&e.message?e.message:"invalid or unsupported JSON."));
    }
  };
  r.readAsText(f);
}
function mergeSummary(d,mode){
  return `Restore Mode: ${mode}
Configured Vehicles: ${RGBMDataV3.getConfiguredVehicles(d).length}
Vehicle Positions: ${d.vehicles.length}
Fuel: ${d.fuelRecords.length}
Maintenance: ${d.maintenanceRecords.length}
Insurance: ${d.insuranceRecords.length}`;
}
function mergeData(d,mode){
  const merged=RGBMDataV3.mergeRestoreState(state,d,mode,{
    context:dataContext("restore-merge"),
    sourceKey:"restore",
    adoptIncomingOrder:false
  });
  state=merged.state;
  return merged.report;
}
let previewRows=[];function parseCSV(t){const rows=[];let row=[],cell="",q=false;for(let i=0;i<t.length;i++){const ch=t[i],nx=t[i+1];if(ch==='"'&&q&&nx==='"'){cell+='"';i++;continue}if(ch==='"'){q=!q;continue}if(ch===","&&!q){row.push(cell);cell="";continue}if((ch==="\n"||ch==="\r")&&!q){if(ch==="\r"&&nx==="\n")i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell="";continue}cell+=ch}row.push(cell);if(row.some(x=>x.trim()))rows.push(row);return rows} function previewCSV(){const vehicleSelect=$("importVehicle");if(!vehicleSelect||!vehicleSelect.value)return alert("Configure a vehicle before importing records.");const file=$("csvFile").files[0];if(!file)return alert("Choose a CSV file.");const reader=new FileReader();reader.onload=()=>{const parsed=parseCSV(reader.result);if(parsed.length<2){$("importStatus").textContent="No records.";return}const headers=parsed[0].map(h=>h.trim());const idx=n=>headers.findIndex(h=>h.toLowerCase()===n.toLowerCase());const get=(row,n)=>{const x=idx(n);return x>=0?row[x]:""};const vid=$("importVehicle").value;const importType=(($("importDataType")?.value||"Migrated Data")==="Other Data")?"Other Data":"Migration";previewRows=parsed.slice(1).map(row=>{const typ=(get(row,"recordType")||get(row,"entryType")||"Fuel").toLowerCase();const base={recordId:get(row,"recordId")||get(row,"Record ID")||uid("IMP"),entrySequence:Number(get(row,"entrySequence")||get(row,"Entry Sequence"))||nextSeq(),source:get(row,"source")||importType,origin:get(row,"origin")||importType,classificationTags:(get(row,"classificationTags")||"").split(";").map(x=>x.trim()).filter(Boolean),dataQuality:get(row,"dataQuality")||"Review",notes:get(row,"notes")||get(row,"Notes")};if(typ.includes("maint"))return normMaint({...base,date:get(row,"date")||get(row,"Date"),dropOffDate:get(row,"dropOffDate")||get(row,"Date"),pickUpDate:get(row,"pickUpDate"),odometer:get(row,"odometer")||get(row,"Odometer"),category:get(row,"category")||"Maintenance",status:get(row,"status"),location:get(row,"location"),serviceProvider:get(row,"serviceProvider")||get(row,"provider"),performedBy:get(row,"performedBy"),totalCost:get(row,"totalCost")||get(row,"cost")},vid);return normFuel({...base,date:get(row,"date")||get(row,"Date"),time:get(row,"time")||get(row,"Time"),odometer:get(row,"odometer")||get(row,"Odometer"),miles:get(row,"miles")||get(row,"Total Miles"),gallons:get(row,"gallons")||get(row,"Gallons"),mpg:get(row,"mpg")||get(row,"MPG"),fuelGrade:get(row,"fuelGrade")||get(row,"Fuel Grade"),ethanolFree:get(row,"ethanolFree")||get(row,"Ethanol Free"),station:get(row,"station")||get(row,"Fuel Station"),fuelPricePerGallon:get(row,"fuelPricePerGallon"),totalFuelCost:get(row,"totalFuelCost"),fuelCostSource:get(row,"fuelCostSource")},vid)});const dup=previewRows.filter(r=>[...state.fuelRecords,...state.maintenanceRecords,...state.insuranceRecords].some(e=>e.recordId===r.recordId)).length;$("importStatus").textContent=`Preview complete.\nRows ready: ${previewRows.length}\nDuplicates: ${dup}\nImported data type: ${importType}\nChoose duplicate mode before saving.`};reader.readAsText(file)}
function savePreviewRows(){if(!previewRows.length)return alert("Preview first.");const mode=$("importMode")?.value||"Skip";if(mode==="Cancel"){$("importStatus").textContent="Import cancelled.";previewRows=[];return}let imported=0,updated=0,skipped=0,duplicated=0,replaced=0;function targetFor(r){return r.recordType==="Maintenance"?state.maintenanceRecords:r.recordType==="Insurance"?state.insuranceRecords:state.fuelRecords}previewRows.forEach(r=>{const target=targetFor(r),i=target.findIndex(e=>e.recordId===r.recordId);if(i>=0){if(mode==="Skip"){skipped++;return}if(mode==="Update"){target[i]={...target[i],...r,modifiedAt:nowISO()};updated++;return}if(mode==="Replace"){target[i]=r;replaced++;return}if(mode==="Duplicate"){r={...r,recordId:r.recordId+"-DUP-"+Date.now().toString(36)};target.push(r);duplicated++;return}}else{target.push(r);imported++}});saveData();$("importStatus").textContent=`Import Summary\\nImported: ${imported}\\nUpdated: ${updated}\\nReplaced: ${replaced}\\nDuplicated: ${duplicated}\\nSkipped: ${skipped}`;previewRows=[]}
function reportsHome(app){app.innerHTML=header("Reports")+`<div class="card report-menu"><h2>Report Menu</h2><button class="wide" onclick="openReport('reportFuel')">Fuel History Report</button><button class="wide" onclick="openReport('reportMPG')">MPG Report</button><button class="wide" onclick="openReport('reportMaintenance')">Maintenance Report</button><button class="wide" onclick="openReport('reportInsurance')">Insurance History Report</button><button class="wide" onclick="openReport('reportVehicle')">Vehicle Summary Report</button></div>`+bottomNav()+footer()} function reportDetail(app,s){let title="Report", rows=[]; if(s==="reportFuel"){title="Fuel History Report";rows=state.fuelRecords.filter(r=>!hasTag(r,"Archived")).sort((a,b)=>previousSort("Fuel",a,b)).map(r=>[r.date||"",getVehicle(r.vehicleId)?vehicleLabel(getVehicle(r.vehicleId)):"",fmt(r.odometer),fmt(r.miles),fmt(r.gallons,3),fmtMpg(r.mpg)])} if(s==="reportMPG"){title="MPG Report";rows=state.fuelRecords.filter(r=>!hasTag(r,"Archived")&&!hasTag(r,"Historical")).sort((a,b)=>previousSort("Fuel",a,b)).map(r=>[r.date||"",fmt(r.odometer),fmt(r.miles),fmt(r.gallons,3),fmtMpg(r.mpg)])} if(s==="reportMaintenance"){title="Maintenance Report";rows=state.maintenanceRecords.filter(r=>!hasTag(r,"Archived")).sort((a,b)=>previousSort("Maintenance",a,b)).map(r=>[r.dropOffDate||"",r.category||"",fmt(r.odometer),money(r.totalCost)])} if(s==="reportInsurance"){title="Insurance History Report";rows=state.insuranceRecords.filter(r=>!hasTag(r,"Archived")).sort((a,b)=>previousSort("Insurance",a,b)).map(r=>[r.company||"",r.policyNumber||"",r.effectiveDate||"",r.expirationDate||"",money(r.premium)])} if(s==="reportVehicle"){title="Vehicle Summary Report";rows=configuredVehicles().map(v=>[vehicleLabel(v),v.status,state.fuelRecords.filter(r=>r.vehicleId===v.vehicleId&&!hasTag(r,"Archived")).length,state.maintenanceRecords.filter(r=>r.vehicleId===v.vehicleId&&!hasTag(r,"Archived")).length])} app.innerHTML=header(title)+`<div class="card"><p class="muted">Default views exclude Archived records. MPG report also excludes Historical records.</p><div style="overflow:auto"><table><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")||'<tr><td>No records.</td></tr>'}</tbody></table></div></div>`+bottomNav()+footer()}
function migrationEvidenceEnvironment(){
  const standalone=isStandaloneDisplayMode();
  const orientation=screen.orientation&&screen.orientation.type
    ?screen.orientation.type
    :(window.innerWidth>window.innerHeight?"landscape":"portrait");
  const browserViewport=standalone
    ?null
    :browserHomeViewportSize();
  return {
    generatedAt:nowISO(),
    userAgent:navigator.userAgent||"",
    standalone,
    orientation,
    url:LAUNCH_URL_STATE.normalized||location.href||"",
    observedUrl:LAUNCH_URL_STATE.observed||location.href||"",
    urlNormalized:LAUNCH_URL_STATE.changed,
    urlNormalizationError:LAUNCH_URL_STATE.error,
    cacheRevision:BUILD.cacheRevision,
    visibilityState:document.visibilityState||"",
    homeViewportStrategy:standalone
      ?"standalone-100vh"
      :browserViewport
        ?browserViewport.source
        :"browser-innerHeight-fallback",
    visualViewport:window.visualViewport
      ?{
        width:Math.round(window.visualViewport.width||0),
        height:Math.round(window.visualViewport.height||0),
        offsetTop:Math.round(window.visualViewport.offsetTop||0),
        offsetLeft:Math.round(window.visualViewport.offsetLeft||0)
      }
      :null,
    networkOnline:OFFLINE_STATE.online,
    serviceWorkerSupported:OFFLINE_STATE.supported,
    serviceWorkerControlled:OFFLINE_STATE.controlled,
    offlineShellReady:(
      OFFLINE_STATE.cacheReady
      ||OFFLINE_STATE.controlled
    ),
    offlineUpdateReady:OFFLINE_STATE.updateReady,
    build:VERSION,
    buildDate:BUILD_DATE
  };
}
function migrationEvidenceReport(){
  const report=RGBMWC10Evidence.generateEvidence(
    localStorage,
    state,
    migrationEvidenceEnvironment()
  );
  window.__RGBM_WC10_LAST_EVIDENCE=report;
  return report;
}
function downloadMigrationEvidence(){
  try{
    const report=migrationEvidenceReport();
    const text=JSON.stringify(report,null,2);
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([text],{type:"application/json"}));
    a.download=`RGBM_WC10_Migration_Evidence_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    alert(`Migration evidence exported: ${report.result}`);
  }catch(e){
    const code=e&&e.code?` [${e.code}]`:"";
    alert(`Migration evidence failed${code}: ${e&&e.message?e.message:"unknown error"}`);
  }
}
async function copyMigrationEvidenceSummary(){
  try{
    const report=migrationEvidenceReport();
    const text=RGBMWC10Evidence.summaryText(report);
    if(navigator.clipboard&&navigator.clipboard.writeText){
      await navigator.clipboard.writeText(text);
      alert("Migration evidence summary copied.");
      return;
    }
    prompt("Copy the migration evidence summary:",text);
  }catch(e){
    const code=e&&e.code?` [${e.code}]`:"";
    alert(`Migration evidence failed${code}: ${e&&e.message?e.message:"unknown error"}`);
  }
}
function settings(app){
  const buildCard=`<div class="card settings-build-card" data-build-id="${VERSION}"><strong class="settings-build-id">${VERSION}</strong><div class="muted settings-build-date">Build date: ${formatBuildDate(BUILD_DATE)}</div></div>`;
  const orderRows=orderedVehicles().map((v,i)=>{
    const label=esc(vehicleLabel(v));
    const up=i>0?`<button type="button" onclick="moveVehicleOrder('${v.vehicleId}',-1)">Move Up</button>`:"";
    const down=i<2?`<button type="button" onclick="moveVehicleOrder('${v.vehicleId}',1)">Move Down</button>`:"";
    return `<div class="card"><strong>Position ${i+1}: ${label}</strong><div class="actions">${up}${down}</div></div>`;
  }).join("");
  let evidence;
  try{evidence=migrationEvidenceReport()}
  catch(e){evidence={result:"FAIL",migrationAcceptance:"FAIL",storage:{legacySourceKey:null},canonical:{validation:{valid:false}}}}
  const evidenceCard=`<div class="card"><h2>WC-10 Migration Evidence</h2><p><strong>Current check: ${esc(evidence.result)}</strong><br>Migration acceptance: ${esc(evidence.migrationAcceptance)}<br>Legacy source: ${esc(evidence.storage.legacySourceKey||"N/A")}<br>Canonical validation: ${evidence.canonical.validation.valid?"PASS":"FAIL"}</p><p class="muted">The exported JSON contains IDs, counts, order, and record-ID fingerprints. It excludes images, VINs, plates, and record amounts.</p><button class="wide primary" type="button" onclick="downloadMigrationEvidence()">Download Migration Evidence</button><button class="wide ghost" type="button" onclick="copyMigrationEvidenceSummary()">Copy Migration Summary</button></div>`;
  const offlineCard=`<div class="card offline-mode-card"><h2>Offline Mode</h2><p id="offlineModeStatus">${esc(offlineStatusSummary())}</p><p class="muted">Vehicle data remains in local storage. The service worker caches only application files and icons.</p><button class="wide ghost" type="button" onclick="requestOfflineUpdate()">Check for App Update</button><button id="applyOfflineUpdateButton" class="wide primary" type="button" onclick="applyOfflineUpdate()" ${OFFLINE_STATE.updateReady?"":"hidden"}>Apply Offline Update</button></div>`;
  const cacheRepairCard=`<div class="card app-shell-repair-card"><h2>App Cache Reset</h2><p class="muted">Use this if the Home Screen app opens an older version or wrong layout while Safari shows the current version. This clears cached app files and service worker registrations for this app, then reloads the current cache-busting URL. Vehicle data is preserved.</p><button class="wide ghost" type="button" onclick="downloadBackup()">Create JSON Backup First</button><button class="wide primary" type="button" onclick="resetAppShellCache()">Reset App Cache / Reload Current Version</button><pre id="appShellResetStatus" class="small"></pre></div>`;
  app.innerHTML=header("Settings")+buildCard+guideSettingsCard()+cloudSettingsCard()+adminSettingsCard()+faceIdSettingsCard()+listsSettingsCard()+driveSettingsCard()+`<div class="card"><h2>Vehicle Order</h2><p class="muted">Position 1 is the primary portrait position. Landscape order is left to right.</p></div>${orderRows}${offlineCard}${cacheRepairCard}${evidenceCard}<div class="card"><h2>About</h2><p>RGB Mileage ${VERSION}<br>Build Date: ${formatBuildDate(BUILD_DATE)}<br>Schema: ${SCHEMA_VERSION}<br>Migration: ${RGBMDataV3.MIGRATION_VERSION}<br>Evidence: ${RGBMWC10Evidence.EVIDENCE_VERSION}</p><button class="wide danger" onclick="if(confirm('Clear all local data, including retained rollback data?')){clearRGBMStorage(false);state=blankData();saveData();nav('home')}">Clear Local Data</button></div>`+bottomNav()+footer();
}
function moveVehicleOrder(vid,delta){
  const index=state.vehicleOrder.indexOf(vid);
  if(index<0)return alert("Vehicle order entry not found.");
  state=RGBMDataV3.moveVehicle(state,vid,index+delta);
  saveData();
  nav("settings",{},false);
}
function dataDiagnostics(){
  return {
    version:VERSION,
    schemaVersion:state.schemaVersion,
    migrationVersion:state.migrationVersion,
    vehicleOrder:[...state.vehicleOrder],
    vehicles:orderedVehicles().map((v,i)=>({
      position:i+1,
      vehicleId:v.vehicleId,
      setupComplete:v.setupComplete,
      label:vehicleLabel(v),
      acquisitionRecords:state.vehicleAcquisitionRecords.filter(r=>r.vehicleId===v.vehicleId).length,
      fuelRecords:state.fuelRecords.filter(r=>r.vehicleId===v.vehicleId).length,
      maintenanceRecords:state.maintenanceRecords.filter(r=>r.vehicleId===v.vehicleId).length,
      insuranceRecords:state.insuranceRecords.filter(r=>r.vehicleId===v.vehicleId).length
    })),
    validation:RGBMDataV3.validateStateV3(state),
    migrationReport:window.__RGBM_WC10_LAST_MIGRATION_REPORT||null,
    restoreReport:window.__RGBM_WC10_LAST_RESTORE_REPORT||null,
    migrationEvidence:window.__RGBM_WC10_LAST_EVIDENCE||null,
    launchUrl:{...LAUNCH_URL_STATE},
    homeLayout:window.__RGBM_HOME_LAYOUT_DIAGNOSTICS||null,
    offline:{
      online:OFFLINE_STATE.online,
      supported:OFFLINE_STATE.supported,
      controlled:OFFLINE_STATE.controlled,
      cacheReady:OFFLINE_STATE.cacheReady,
      updateReady:OFFLINE_STATE.updateReady,
      error:OFFLINE_STATE.error
    }
  };
}
let viewportRefreshTimer=0;
function initResponsiveViewportHandling(){
  try{
    document.addEventListener(
      "touchmove",
      event=>{
        const recoveryActive=(
          document.body.classList.contains("recovery-active")
          ||event.target.closest?.("#app.screen-recovery")
        );
        if(!recoveryActive&&route&&route.screen==="home"){
          event.preventDefault();
        }
      },
      {passive:false}
    );

    const refresh=(delay=0)=>{
      if(viewportRefreshTimer)clearTimeout(viewportRefreshTimer);
      viewportRefreshTimer=setTimeout(()=>{
        viewportRefreshTimer=0;
        if(route&&route.screen==="home"){
          if(isStandaloneDisplayMode()){
            scheduleHomeGeometry();
          }else{
            stabilizeBrowserHomeViewport();
          }
        }else{
          applyNonHomeViewport();
        }
      },delay);
    };

    window.addEventListener(
      "resize",
      ()=>refresh(0),
      {passive:true}
    );
    window.addEventListener(
      "orientationchange",
      ()=>refresh(80),
      {passive:true}
    );
    window.addEventListener(
      "pageshow",
      ()=>refresh(0),
      {passive:true}
    );
    document.addEventListener(
      "visibilitychange",
      ()=>{
        if(document.visibilityState==="visible")refresh(0);
      },
      {passive:true}
    );

    if(window.visualViewport){
      const refreshVisualViewport=()=>{
        if(route&&route.screen==="home"){
          if(!isStandaloneDisplayMode()){
            stabilizeBrowserHomeViewport();
          }
        }else{
          refresh(0);
        }
      };
      window.visualViewport.addEventListener(
        "resize",
        refreshVisualViewport,
        {passive:true}
      );
      window.visualViewport.addEventListener(
        "scroll",
        refreshVisualViewport,
        {passive:true}
      );
    }

    if(screen.orientation&&screen.orientation.addEventListener){
      screen.orientation.addEventListener(
        "change",
        ()=>refresh(80),
        {passive:true}
      );
    }
  }catch(error){}
}

let recoverySnapshotDownloaded=false;
let recoveryBackupCandidate=null;
let recoveryInspection=null;
let recoveryFatalError=null;
const RECOVERY_REQUIRED_CONFIGURED_COUNT=3;

function recoveryEntrySummary(entry){
  if(!entry)return "Not inspected";
  if(!entry.present)return "Not present";
  const validity=entry.canonicalValid
    ?"Valid schema-3 data"
    :entry.migratable
      ?"Migratable data"
      :entry.parses
        ?"Parsed but invalid"
        :"Invalid JSON";
  const summary=entry.summary;
  const counts=summary
    ?` • ${summary.configuredCount} configured vehicle${summary.configuredCount===1?"":"s"} • ${summary.fuelRecordCount} fuel • ${summary.maintenanceRecordCount} maintenance • ${summary.insuranceRecordCount} insurance`
    :"";
  return `${validity} • ${entry.characterCount} characters • ${entry.fingerprint||"no fingerprint"}${counts}`;
}
function recoveryLegacyHtml(entries){
  const present=(entries||[]).filter(entry=>entry.present);
  if(!present.length)return `<div class="recovery-key-row"><strong>Legacy keys</strong><span>None detected</span></div>`;
  return present.map(entry=>`<div class="recovery-key-row"><strong>${esc(entry.key)}</strong><span>${esc(recoveryEntrySummary(entry))}</span></div>`).join("");
}
function setRecoveryStatus(message,result="info"){
  const target=$("recoveryStatus");
  if(!target)return;
  target.className=`recovery-status ${result}`;
  target.textContent=message;
}
function recoveryConfirmed(){
  return recoverySnapshotDownloaded&&$("recoverySnapshotConfirmed")?.checked===true;
}
function recoveryStandaloneFloor(inspection=recoveryInspection){
  const entries=[
    inspection&&inspection.active,
    inspection&&inspection.pending,
    ...((inspection&&inspection.legacy)||[])
  ].filter(entry=>entry&&entry.summary&&(entry.canonicalValid||entry.migratable));
  return entries.reduce((floor,entry)=>{
    const summary=entry.summary;
    return {
      configuredCount:Math.max(floor.configuredCount,Number(summary.configuredCount)||0),
      fuelRecordCount:Math.max(floor.fuelRecordCount,Number(summary.fuelRecordCount)||0),
      maintenanceRecordCount:Math.max(floor.maintenanceRecordCount,Number(summary.maintenanceRecordCount)||0),
      insuranceRecordCount:Math.max(floor.insuranceRecordCount,Number(summary.insuranceRecordCount)||0),
      acquisitionRecordCount:Math.max(floor.acquisitionRecordCount,Number(summary.acquisitionRecordCount)||0),
      attachmentCount:Math.max(floor.attachmentCount,Number(summary.attachmentCount)||0)
    };
  },{
    configuredCount:0,
    fuelRecordCount:0,
    maintenanceRecordCount:0,
    insuranceRecordCount:0,
    acquisitionRecordCount:0,
    attachmentCount:0
  });
}
function recoveryCandidateSafety(summary,inspection=recoveryInspection){
  const floor=recoveryStandaloneFloor(inspection);
  const deficits=[];
  if((Number(summary&&summary.configuredCount)||0)<RECOVERY_REQUIRED_CONFIGURED_COUNT){
    deficits.push(`requires ${RECOVERY_REQUIRED_CONFIGURED_COUNT} configured vehicles`);
  }
  for(const [key,label] of [
    ["fuelRecordCount","fuel"],
    ["maintenanceRecordCount","maintenance"],
    ["insuranceRecordCount","insurance"],
    ["acquisitionRecordCount","acquisition"],
    ["attachmentCount","attachments"]
  ]){
    const release=Number(summary&&summary[key])||0;
    const minimum=Number(floor[key])||0;
    if(release<minimum)deficits.push(`${label} ${release} < standalone ${minimum}`);
  }
  return {safe:deficits.length===0,deficits,floor};
}
function pendingRecoverySafety(){
  const pending=recoveryInspection&&recoveryInspection.pending;
  if(!pending||pending.canonicalValid!==true||!pending.summary){
    return {safe:false,deficits:["pending migration is not valid schema-3 data"],floor:recoveryStandaloneFloor()};
  }
  return recoveryCandidateSafety(pending.summary);
}
function updateRecoveryControls(){
  const ready=recoveryConfirmed();
  const pendingButton=$("recoverPendingButton");
  const restoreButton=$("restoreRecoveryButton");
  if(pendingButton)pendingButton.disabled=true;
  if(restoreButton){
    restoreButton.disabled=!(
      ready
      &&recoveryBackupCandidate
      &&recoveryBackupCandidate.reconciled===true
    );
  }
}
function downloadRecoverySnapshot(){
  try{
    const snapshot=RGBMDataV3.buildRecoverySnapshot(
      localStorage,
      dataContext("standalone-recovery-snapshot")
    );
    const text=JSON.stringify(snapshot,null,2);
    const anchor=document.createElement("a");
    anchor.href=URL.createObjectURL(
      new Blob([text],{type:"application/json"})
    );
    anchor.download=`RGBM_Recovery_Snapshot_${new Date().toISOString().replace(/[:.]/g,"-")}.json`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    recoverySnapshotDownloaded=true;
    setRecoveryStatus("Recovery snapshot downloaded. Check the confirmation box before changing storage.","pass");
    updateRecoveryControls();
  }catch(error){
    setRecoveryStatus(`Snapshot failed: ${error&&error.message?error.message:String(error)}`,"fail");
  }
}
function recoverPendingStorage(){
  if(!recoveryConfirmed()){
    return alert("Download the recovery snapshot and confirm it before recovery.");
  }
  const safety=pendingRecoverySafety();
  if(!safety.safe){
    return alert(`Pending recovery is locked because it could omit required data: ${safety.deficits.join("; ")}.`);
  }
  if(!confirm("Promote the validated pending migration to active storage? The exact current active and pending values will be restored if the transaction fails. Legacy keys will not be deleted."))return;
  try{
    const result=RGBMDataV3.promotePendingRecovery(
      localStorage,
      {
        ...dataContext("standalone-pending-recovery"),
        snapshotConfirmed:true
      }
    );
    setRecoveryStatus(`Pending recovery completed with ${result.state.vehicles.length} vehicle positions. Reloading…`,"pass");
    setTimeout(()=>location.reload(),250);
  }catch(error){
    const details=error&&error.details&&error.details.rollback
      ?` Rollback success: ${error.details.rollback.success===true?"yes":"no"}.`
      :"";
    setRecoveryStatus(`Pending recovery failed: ${error&&error.message?error.message:String(error)}${details}`,"fail");
  }
}
function previewRecoveryBackup(){
  const file=$("recoveryBackupFile")?.files?.[0];
  if(!file)return alert("Choose the reconciled recovery release JSON first.");
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const raw=JSON.parse(reader.result);
      const validated=RGBMDataV3.validateReconciledRecoveryCandidate(
        localStorage,
        raw,
        dataContext("standalone-reconciled-preview")
      );
      const summary=validated.summary;
      recoveryBackupCandidate={
        raw,
        fileName:file.name,
        summary,
        reconciled:true,
        sourceMatch:validated.sourceMatch,
        floor:validated.floor
      };
      setRecoveryStatus(
        `Reconciled release verified: ${summary.configuredCount} configured vehicles, ${summary.fuelRecordCount} fuel, ${summary.maintenanceRecordCount} maintenance, ${summary.insuranceRecordCount} insurance. Source fingerprints match the saved standalone snapshot.`,
        "pass"
      );
      updateRecoveryControls();
    }catch(error){
      recoveryBackupCandidate=null;
      const details=error&&error.details&&error.details.deficits
        ?` ${error.details.deficits.join("; ")}.`
        :"";
      setRecoveryStatus(
        `Reconciled release rejected: ${error&&error.message?error.message:String(error)}${details}`,
        "fail"
      );
      updateRecoveryControls();
    }
  };
  reader.onerror=()=>{
    recoveryBackupCandidate=null;
    setRecoveryStatus("The selected reconciliation file could not be read.","fail");
    updateRecoveryControls();
  };
  reader.readAsText(file);
}
function restoreSelectedRecoveryBackup(){
  if(!recoveryConfirmed()){
    return alert("Download the recovery snapshot and confirm it before reconciliation.");
  }
  if(!recoveryBackupCandidate||recoveryBackupCandidate.reconciled!==true){
    return alert("Choose and validate the reconciled recovery release first.");
  }
  const summary=recoveryBackupCandidate.summary;
  if(!confirm(
    `Restore the reconciled release?\n\n`
    +`Configured vehicles: ${summary.configuredCount}\n`
    +`Fuel: ${summary.fuelRecordCount}\n`
    +`Maintenance: ${summary.maintenanceRecordCount}\n`
    +`Insurance: ${summary.insuranceRecordCount}\n\n`
    +`The saved recovery snapshot remains the external archive. `
    +`The pending and legacy local-storage keys will be removed before the larger active state is written. `
    +`If the write or read-back validation fails, the exact original keys will be restored.`
  ))return;
  try{
    const result=RGBMDataV3.archiveAndRestoreReconciledBackup(
      localStorage,
      recoveryBackupCandidate.raw,
      {
        ...dataContext("standalone-reconciled-recovery"),
        snapshotConfirmed:true,
        archiveConfirmed:true
      }
    );
    setRecoveryStatus(
      `Reconciled recovery completed: ${result.report.summary.configuredCount} vehicles, ${result.report.summary.fuelRecordCount} fuel, ${result.report.summary.maintenanceRecordCount} maintenance, ${result.report.summary.insuranceRecordCount} insurance. Reloading…`,
      "pass"
    );
    setTimeout(()=>location.reload(),400);
  }catch(error){
    const rollback=error&&error.details&&error.details.rollback;
    const details=rollback
      ?` Rollback exact match: ${rollback.exactMatch===true?"yes":"no"}.`
      :"";
    setRecoveryStatus(
      `Reconciled recovery failed: ${error&&error.message?error.message:String(error)}${details}`,
      "fail"
    );
  }
}
function enterRecoveryScrollMode(){
  route={screen:"recovery"};
  const root=document.documentElement;
  const body=document.body;
  const app=$("app");
  const setStyle=(element,name,value)=>{
    if(element.style&&typeof element.style.setProperty==="function"){
      element.style.setProperty(name,value,"important");
    }else if(element.style){
      element.style[name]=value;
    }
  };

  setStyle(root,"width","100%");
  setStyle(root,"height","100%");
  setStyle(root,"overflow","hidden");
  setStyle(root,"overscroll-behavior","none");

  setStyle(body,"position","fixed");
  setStyle(body,"inset","0");
  setStyle(body,"width","100%");
  setStyle(body,"height","100dvh");
  setStyle(body,"overflow","hidden");
  setStyle(body,"touch-action","none");

  setStyle(app,"position","fixed");
  setStyle(app,"inset","0");
  setStyle(app,"width","100%");
  setStyle(app,"height","100dvh");
  setStyle(app,"max-width","none");
  setStyle(app,"overflow-x","hidden");
  setStyle(app,"overflow-y","scroll");
  setStyle(app,"-webkit-overflow-scrolling","touch");
  setStyle(app,"touch-action","pan-y");
  app.scrollTop=0;
}
function renderRecoveryConsole(error){
  const app=$("app");
  recoveryFatalError=error||null;
  recoverySnapshotDownloaded=false;
  recoveryBackupCandidate=null;
  document.body.classList.remove("home-active","non-home-active");
  document.body.classList.add("recovery-active");
  app.className="app-screen screen-recovery";
  enterRecoveryScrollMode();
  const code=error&&error.code?error.code:"DATA_LOAD_FAILED";
  const message=error&&error.message?error.message:String(error||"Unknown data error");
  try{
    recoveryInspection=RGBMDataV3.inspectRecoveryStorage(
      localStorage,
      dataContext("standalone-recovery-inspection")
    );
  }catch(inspectError){
    recoveryInspection={
      active:{present:false},
      pending:{present:false},
      legacy:[],
      recommendedAction:"RECONCILED_CANDIDATE_REQUIRED",
      inspectionError:inspectError&&inspectError.message?inspectError.message:String(inspectError)
    };
  }
  const floor=recoveryStandaloneFloor(recoveryInspection);
  app.innerHTML=`<main class="recovery-console">
    <section class="recovery-card recovery-warning">
      <p class="recovery-kicker">${VERSION} reconciliation</p>
      <h1 class="recovery-title">Reconciled Recovery Required</h1>
      <p><strong>${esc(code)}</strong> — ${esc(message)}</p>
      <p><strong>Do not delete the Home Screen app or clear Safari website data.</strong></p>
    </section>

    <section class="recovery-card recovery-primary-actions">
      <h2>1 — Preserve storage</h2>
      <p>Download a fresh exact snapshot before the reconciliation transaction.</p>
      <button id="downloadRecoverySnapshotButton" class="wide primary" type="button" onclick="downloadRecoverySnapshot()"><span>Download Recovery Snapshot</span></button>
      <label class="recovery-confirm"><input id="recoverySnapshotConfirmed" type="checkbox" onchange="updateRecoveryControls()"> I saved the recovery snapshot file.</label>
    </section>

    <section class="recovery-card recovery-backup-card">
      <h2>2 — Select reconciled release</h2>
      <p>Select the downloaded release:</p><p class="recovery-filename">RGBM_Reconciled_Recovery_Candidate_3Vehicles_48Fuel_13Maintenance_8Insurance_2026-07-27.json</p>
      <label>Reconciled JSON release<input id="recoveryBackupFile" type="file" accept=".json,application/json" onchange="previewRecoveryBackup()"></label>
      <button id="restoreRecoveryButton" class="wide primary" type="button" onclick="restoreSelectedRecoveryBackup()" disabled><span>Archive Source Keys and Restore Reconciled Data</span></button>
      <p class="muted">The button activates only after the release matches the standalone pending and legacy fingerprints and does not reduce any preserved count.</p>
    </section>

    <pre id="recoveryStatus" class="recovery-status info">No storage value has been changed.</pre>

    <section class="recovery-card recovery-inspection-card">
      <h2>Standalone preservation floor</h2>
      <p><strong>${floor.configuredCount}</strong> configured vehicles • <strong>${floor.fuelRecordCount}</strong> fuel • <strong>${floor.maintenanceRecordCount}</strong> maintenance • <strong>${floor.insuranceRecordCount}</strong> insurance</p>
      <div class="recovery-key-row"><strong>Active: ${esc(RGBMDataV3.ACTIVE_KEY)}</strong><span>${esc(recoveryEntrySummary(recoveryInspection.active))}</span></div>
      <div class="recovery-key-row"><strong>Pending: ${esc(RGBMDataV3.PENDING_KEY)}</strong><span>${esc(recoveryEntrySummary(recoveryInspection.pending))}</span></div>
      ${recoveryLegacyHtml(recoveryInspection.legacy)}
    </section>

    <section class="recovery-card recovery-pending-card">
      <h2>Direct pending recovery remains locked</h2>
      <p>The pending state contains only two configured vehicles. It cannot restore the third vehicle.</p>
      <button id="recoverPendingButton" class="wide primary" type="button" disabled>Pending Recovery Locked</button>
    </section>

    <div class="recovery-scroll-end" aria-hidden="true">End of reconciliation details</div>
  </main>`;
  updateRecoveryControls();
}
function renderDataFatal(error){
  renderRecoveryConsole(error);
}
/* ===== F29 Cloud Sync (Supabase) =====
   Local storage stays the working copy (offline-first). When signed in, every save is
   pushed to Supabase; on launch/foreground/Sync Now, local changes are pushed first and
   then any changes made on another device are pulled. Vehicle photos stay on the device. */
const CLOUD_CONFIG=Object.freeze(Object.assign({
  url:"https://nlfivcxlzmivjzwlhlot.supabase.co",
  key:"sb_publishable_fBNYoq7AJ2po0RM62R0lBg_pIYccnPM"
},(typeof window!=="undefined"&&window.__RGBM_CLOUD_CONFIG__)||{}));
const CLOUD_KEYS=Object.freeze({session:"RGBM_CLOUD_SESSION",synced:"RGBM_CLOUD_SYNCED",linked:"RGBM_CLOUD_LINKED",last:"RGBM_CLOUD_LAST"});
const CLOUD_TABLES=Object.freeze([
  {table:"vehicle_acquisition_records",collection:"vehicleAcquisitionRecords",pk:"record_id",idField:"recordId"},
  {table:"fuel_records",collection:"fuelRecords",pk:"record_id",idField:"recordId"},
  {table:"maintenance_records",collection:"maintenanceRecords",pk:"record_id",idField:"recordId"},
  {table:"insurance_records",collection:"insuranceRecords",pk:"record_id",idField:"recordId"},
  {table:"attachments",collection:"attachments",pk:"attachment_id",idField:"attachmentId"}
]);
const CLOUD_LOCAL_ONLY_VEHICLE_FIELDS=Object.freeze(["primaryPhoto","photos"]);
const CLOUD_DELETE_GUARD=10;
const CLOUD={busy:false,again:false,timer:null,status:"",error:"",blocked:null,choice:null,authNotice:"",passwordMode:""};

function cloudStoreGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function cloudStoreSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function cloudStoreDel(k){try{localStorage.removeItem(k)}catch(e){}}
function cloudJSON(k,f){try{const v=cloudStoreGet(k);return v?JSON.parse(v):f}catch(e){return f}}
function cloudSession(){return cloudJSON(CLOUD_KEYS.session,null)}
function cloudSignedIn(){const s=cloudSession();return !!(s&&s.refresh_token&&s.user&&s.user.id)}
function cloudLinked(){const s=cloudSession();return !!(s&&s.user&&cloudStoreGet(CLOUD_KEYS.linked)===s.user.id)}
function cloudOnline(){return typeof navigator==="undefined"||navigator.onLine!==false}
function cloudNote(status,error=""){CLOUD.status=status;CLOUD.error=error;cloudRefreshStatusUi()}
function cloudSaveSession(t){
  if(!t||!t.access_token)return null;
  const prev=cloudSession()||{};
  const user=t.user&&t.user.id?{id:t.user.id,email:t.user.email||""}:prev.user||cloudUserFromJwt(t.access_token);
  const s={access_token:t.access_token,refresh_token:t.refresh_token||prev.refresh_token,expires_at:Date.now()+((+t.expires_in||3600)*1000),user};
  cloudStoreSet(CLOUD_KEYS.session,JSON.stringify(s));return s;
}
function cloudUserFromJwt(tok){try{const p=JSON.parse(atob(String(tok).split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));return {id:p.sub,email:p.email||""}}catch(e){return null}}

async function cloudAuthFetch(path,body,method="POST",bearer){
  const headers={"apikey":CLOUD_CONFIG.key,"Content-Type":"application/json"};
  if(bearer)headers.Authorization="Bearer "+bearer;
  const res=await fetch(CLOUD_CONFIG.url+"/auth/v1/"+path,{method,headers,body:body?JSON.stringify(body):undefined});
  let data=null;try{data=await res.json()}catch(e){}
  if(!res.ok){const m=(data&&(data.msg||data.error_description||data.message||data.error))||("HTTP "+res.status);const err=new Error(m);err.status=res.status;throw err}
  return data;
}
async function cloudToken(){
  const s=cloudSession();if(!s)throw new Error("Not signed in");
  if(s.access_token&&s.expires_at-Date.now()>60000)return s.access_token;
  try{const t=await cloudAuthFetch("token?grant_type=refresh_token",{refresh_token:s.refresh_token});return cloudSaveSession(t).access_token}
  catch(e){if(e.status===400||e.status===401||e.status===403){cloudStoreDel(CLOUD_KEYS.session);CLOUD.authNotice="Your cloud sign-in expired. Sign in again."}throw e}
}
async function cloudRest(path,{method="GET",body,prefer}={}){
  const tok=await cloudToken();
  const headers={"apikey":CLOUD_CONFIG.key,"Authorization":"Bearer "+tok,"Content-Type":"application/json"};
  if(prefer)headers.Prefer=prefer;
  const res=await fetch(CLOUD_CONFIG.url+"/rest/v1/"+path,{method,headers,body:body!==undefined?JSON.stringify(body):undefined});
  if(!res.ok){let m="";try{const d=await res.json();m=d.message||d.hint||JSON.stringify(d)}catch(e){}throw new Error(`Cloud ${method} ${path.split("?")[0]} failed (${res.status}) ${m}`)}
  if(res.status===204)return null;
  const txt=await res.text();return txt?JSON.parse(txt):null;
}

/* ---- state <-> rows ---- */
function cloudHash(str){let h=0x811c9dc5;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,0x01000193)}return (h>>>0).toString(16)+":"+str.length}
function cloudStable(v){if(Array.isArray(v))return "["+v.map(cloudStable).join(",")+"]";if(v&&typeof v==="object")return "{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+cloudStable(v[k])).join(",")+"}";return JSON.stringify(v===undefined?null:v)}
function cloudVehicleRaw(v){const r={...v};CLOUD_LOCAL_ONLY_VEHICLE_FIELDS.forEach(f=>delete r[f]);return r}
function cloudSettingsRaw(st){const r={...st};["vehicles",...CLOUD_TABLES.map(t=>t.collection)].forEach(k=>delete r[k]);return r}
function cloudRecordId(rec,t){return String(rec[t.idField]||rec.id||"")}
function cloudRowsFromState(st,userId){
  const out={app_settings:[{user_id:userId,raw_json:cloudSettingsRaw(st)}],vehicles:[]};
  (st.vehicles||[]).forEach(v=>{const p=String(v.primaryPhoto||"");out.vehicles.push({vehicle_id:String(v.vehicleId),raw_json:cloudVehicleRaw(v)})});
  CLOUD_TABLES.forEach(t=>{out[t.table]=(st[t.collection]||[]).map((r,i)=>{const row={[t.pk]:cloudRecordId(r,t),raw_json:r,list_position:i};if(t.table!=="attachments")row.vehicle_id=String(r.vehicleId||"");else{row.vehicle_id=r.vehicleId||null;row.record_id=r.recordId||null}return row})});
  return out;
}
function cloudRowKey(table,row){if(table==="app_settings")return "app_settings";if(table==="vehicles")return "vehicles:"+row.vehicle_id;const t=CLOUD_TABLES.find(x=>x.table===table);return table+":"+row[t.pk]}
function cloudRowFingerprint(table,row,withPosition=true){const pos=withPosition&&row.list_position!=null?"|"+row.list_position:"";return cloudHash(cloudStable(row.raw_json)+pos)}
function cloudFingerprints(rows,withPosition=true,skipSettings=false){const m={};Object.keys(rows).forEach(table=>{if(skipSettings&&table==="app_settings")return;rows[table].forEach(row=>{m[cloudRowKey(table,row)]=cloudRowFingerprint(table,row,withPosition)})});return m}

async function cloudFetchRows(){
  const rows={};
  const set=await cloudRest("app_settings?select=user_id,raw_json");
  rows.app_settings=(set||[]).map(r=>({user_id:r.user_id,raw_json:r.raw_json}));
  const veh=await cloudRest("vehicles?select=vehicle_id,raw_json,sort_order&order=vehicle_id.asc");
  rows.vehicles=(veh||[]).map(r=>({vehicle_id:r.vehicle_id,raw_json:cloudVehicleRaw(r.raw_json||{})}));
  for(const t of CLOUD_TABLES){
    const sel=t.table==="attachments"?"attachment_id,vehicle_id,record_id,raw_json,list_position":`${t.pk},vehicle_id,raw_json,list_position`;
    const order=t.table==="attachments"?`list_position.asc.nullslast,${t.pk}.asc`:`list_position.asc.nullslast,entry_sequence.asc.nullslast,${t.pk}.asc`;
    const data=await cloudRest(`${t.table}?select=${sel}&order=${order}`);
    rows[t.table]=data||[];
  }
  return rows;
}
function cloudStateFromRows(rows,localState){
  const base=(rows.app_settings[0]&&rows.app_settings[0].raw_json)||{};
  const st=JSON.parse(JSON.stringify(base));
  const localById={};((localState&&localState.vehicles)||[]).forEach(v=>{localById[v.vehicleId]=v});
  const order=Array.isArray(st.vehicleOrder)?st.vehicleOrder:[];
  const vs=rows.vehicles.map(r=>{const v={...r.raw_json};const lv=localById[v.vehicleId];CLOUD_LOCAL_ONLY_VEHICLE_FIELDS.forEach(f=>{if(lv&&lv[f]!==undefined)v[f]=lv[f];else if(f==="photos")v.photos=v.photos||[];else v[f]=v[f]||""});return v});
  vs.sort((a,b)=>{const ia=order.indexOf(a.vehicleId),ib=order.indexOf(b.vehicleId);return (ia<0?999:ia)-(ib<0?999:ib)});
  st.vehicles=vs;
  CLOUD_TABLES.forEach(t=>{st[t.collection]=(rows[t.table]||[]).map(r=>r.raw_json)});
  return st;
}
function cloudCounts(st){return {vehicles:(st.vehicles||[]).filter(v=>RGBMDataV3.isVehicleConfigured(v)).length,fuel:(st.fuelRecords||[]).length,maintenance:(st.maintenanceRecords||[]).length,insurance:(st.insuranceRecords||[]).length}}
function cloudRowsEmpty(rows){return !rows.vehicles.length&&CLOUD_TABLES.every(t=>!(rows[t.table]||[]).length)}

/* ---- push ---- */
async function cloudPush(opts={}){
  const s=cloudSession();if(!s||!s.user)throw new Error("Not signed in");
  const rows=cloudRowsFromState(state,s.user.id);
  const cur=cloudFingerprints(rows);
  const prev=opts.prev||cloudJSON(CLOUD_KEYS.synced,{});
  const ups={},dels={};let upCount=0,delCount=0;
  Object.keys(rows).forEach(table=>{rows[table].forEach(row=>{const k=cloudRowKey(table,row);if(prev[k]!==cur[k]){(ups[table]=ups[table]||[]).push(row);upCount++}})});
  Object.keys(prev).forEach(k=>{if(k==="app_settings"||cur[k]!==undefined)return;const i=k.indexOf(":");const table=k.slice(0,i),id=k.slice(i+1);(dels[table]=dels[table]||[]).push(id);delCount++});
  const vehiclesLeft=rows.vehicles.length,vehiclesBefore=Object.keys(prev).filter(k=>k.startsWith("vehicles:")).length;
  if(!opts.allowLargeDelete&&(delCount>CLOUD_DELETE_GUARD||(vehiclesBefore>0&&vehiclesLeft===0))){
    CLOUD.blocked={deletes:delCount};cloudNote("Sync paused: this device would remove "+delCount+" cloud item(s).","Open Cloud Sync to choose what to do.");if(route&&route.screen==="cloud")render();return {blocked:true};
  }
  CLOUD.blocked=null;
  if(!upCount&&!delCount)return {pushed:0};
  const up=async(table,pk)=>{const list=ups[table];if(!list||!list.length)return;for(let i=0;i<list.length;i+=200)await cloudRest(`${table}?on_conflict=${pk}`,{method:"POST",body:list.slice(i,i+200),prefer:"resolution=merge-duplicates,return=minimal"})};
  const del=async(table,pk)=>{const ids=dels[table];if(!ids||!ids.length)return;for(let i=0;i<ids.length;i+=50){const list=ids.slice(i,i+50).map(id=>'"'+String(id).replace(/\\/g,"\\\\").replace(/"/g,'\\"')+'"').join(",");await cloudRest(`${table}?${pk}=in.(${encodeURIComponent(list)})`,{method:"DELETE",prefer:"return=minimal"})}};
  await up("app_settings","user_id");
  await up("vehicles","vehicle_id");
  for(const t of CLOUD_TABLES)await up(t.table,t.pk);
  for(const t of CLOUD_TABLES)await del(t.table,t.pk);
  await del("vehicles","vehicle_id");
  cloudStoreSet(CLOUD_KEYS.synced,JSON.stringify(cur));
  return {pushed:upCount,deleted:delCount};
}

/* ---- adopt cloud data on this device (photos kept) ---- */
function cloudAdopt(rows){
  const next=cloudStateFromRows(rows,state);
  const v=RGBMDataV3.validateStateV3(next);
  if(!v.valid)throw new Error("Cloud data failed validation: "+(v.errors||[]).slice(0,3).join("; "));
  const prevRoute=route&&route.screen;
  state=saveData(next,{skipCloud:true});
  cloudStoreSet(CLOUD_KEYS.synced,JSON.stringify(cloudFingerprints(rows)));
  const safe=["home","settings","cloud","reports","data","vehicleView"].includes(prevRoute)||String(prevRoute||"").startsWith("report");
  if(safe)render();
}

/* ---- full sync ---- */
async function cloudSync(reason="manual"){
  if(!cloudSignedIn()){cloudNote("Signed out");return}
  if(CLOUD.passwordMode)return;
  if(!cloudOnline()){cloudNote("Offline — changes are saved on this device and will sync later.");return}
  if(CLOUD.busy){CLOUD.again=true;return}
  CLOUD.busy=true;cloudNote("Syncing…");
  try{
    const s=cloudSession();
    if(!cloudLinked()){
      const owner=cloudStoreGet(CLOUD_OWNER_KEY);
      if(owner&&owner!==s.user.id&&cloudHasLocalData()){CLOUD.switchAcct={from:owner};cloudNote("This device has another account's data.","Choose what to do on the Cloud Sync screen.");if(route.screen!=="cloud")nav("cloud");else render();return}
      const rows=await cloudFetchRows();
      if(cloudRowsEmpty(rows)){await cloudPush({prev:{}});cloudMarkLinked(s.user.id);cloudNote("Synced — this device's data was uploaded.")}
      else{
        const local=cloudFingerprints(cloudRowsFromState(state,s.user.id),false,true);
        const remote=cloudFingerprints(rows,false,true);
        const same=Object.keys(local).length===Object.keys(remote).length&&Object.keys(local).every(k=>local[k]===remote[k]);
        if(same){await cloudPush({prev:cloudFingerprints(rows)});cloudMarkLinked(s.user.id);CLOUD.choice=null;cloudNote("Synced — this device matches the cloud.")}
        else{const diff=Object.keys({...local,...remote}).filter(k=>local[k]!==remote[k]).length;CLOUD.choice={rows,diff,cloud:cloudCounts(cloudStateFromRows(rows,state)),device:cloudCounts(state)};cloudNote("Choose which data to keep.","This device and the cloud have different data.");if(route.screen!=="cloud")nav("cloud");else render()}
      }
    }else{
      const pushed=await cloudPush();
      if(pushed.blocked)return;
      const rows=await cloudFetchRows();
      const local=cloudFingerprints(cloudRowsFromState(state,s.user.id),false,!(rows.app_settings&&rows.app_settings.length));
      const remote=cloudFingerprints(rows,false,!(rows.app_settings&&rows.app_settings.length));
      const same=Object.keys(local).length===Object.keys(remote).length&&Object.keys(local).every(k=>local[k]===remote[k]);
      if(!same)cloudAdopt(rows);
      else cloudStoreSet(CLOUD_KEYS.synced,JSON.stringify({...cloudJSON(CLOUD_KEYS.synced,{}),...cloudFingerprints(rows)}));
      cloudStoreSet(CLOUD_KEYS.last,new Date().toISOString());
      cloudNote(same?"Synced":"Synced — updates from the cloud were applied.");
    }
    if(cloudLinked()&&!CLOUD.blocked&&!CLOUD.choice)await cloudPhotoSyncSafe();
  }catch(e){console.error(e);cloudNote(cloudSignedIn()?"Sync failed — changes are safe on this device.":"Signed out",String(e&&e.message||e))}
  finally{CLOUD.busy=false;if(CLOUD.again){CLOUD.again=false;setTimeout(()=>cloudSync("again"),300)}else{setTimeout(cloudMaybeWelcome,50);setTimeout(adminCheck,80)}}
}
function cloudSchedulePush(){
  if(!cloudLinked())return;
  clearTimeout(CLOUD.timer);
  CLOUD.timer=setTimeout(async()=>{
    if(!cloudOnline()){cloudNote("Offline — changes are saved on this device and will sync later.");return}
    if(CLOUD.busy){CLOUD.again=true;return}
    CLOUD.busy=true;
    try{const r=await cloudPush();if(!r.blocked){await cloudPhotoSyncSafe();cloudStoreSet(CLOUD_KEYS.last,new Date().toISOString());cloudNote("Synced")}}
    catch(e){console.error(e);cloudNote("Sync failed — changes are safe on this device.",String(e&&e.message||e))}
    finally{CLOUD.busy=false;if(CLOUD.again){CLOUD.again=false;setTimeout(()=>cloudSync("again"),300)}}
  },1200);
}
async function cloudResolveChoice(which){
  const c=CLOUD.choice;if(!c)return;const s=cloudSession();
  if(which==="cloud"){
    if(!confirm("Replace the data on this device with the cloud data?\n\nVehicle photos on this device are kept. Create a JSON backup first if you are unsure."))return;
    try{cloudAdopt(c.rows);await cloudPush({prev:cloudFingerprints(c.rows)});cloudMarkLinked(s.user.id);CLOUD.choice=null;cloudStoreSet(CLOUD_KEYS.last,new Date().toISOString());cloudNote("Synced — this device now uses the cloud data.");await cloudPhotoSyncSafe();nav("cloud",{},false);cloudMaybeWelcome()}
    catch(e){cloudNote("Could not use cloud data.",String(e.message||e))}
  }else{
    if(!confirm("Replace the cloud data with this device's data?\n\nCloud records that are not on this device will be removed from the cloud."))return;
    try{await cloudPush({prev:cloudFingerprints(c.rows),allowLargeDelete:true});cloudMarkLinked(s.user.id);CLOUD.choice=null;cloudStoreSet(CLOUD_KEYS.last,new Date().toISOString());cloudNote("Synced — the cloud now matches this device.");await cloudPhotoSyncSafe();render();cloudMaybeWelcome()}
    catch(e){cloudNote("Could not upload this device's data.",String(e.message||e))}
  }
}
async function cloudResolveBlocked(which){
  if(which==="push"){if(!confirm("Remove these items from the cloud too?"))return;CLOUD.busy=true;try{await cloudPush({allowLargeDelete:true});cloudStoreSet(CLOUD_KEYS.last,new Date().toISOString());cloudNote("Synced")}catch(e){cloudNote("Sync failed",String(e.message||e))}finally{CLOUD.busy=false}render()}
  else{if(!confirm("Replace this device's data with the cloud data?"))return;CLOUD.busy=true;try{const rows=await cloudFetchRows();cloudAdopt(rows);CLOUD.blocked=null;cloudNote("Synced — this device now uses the cloud data.")}catch(e){cloudNote("Could not load cloud data.",String(e.message||e))}finally{CLOUD.busy=false}render()}
}

/* ---- auth actions ---- */
async function cloudSignIn(){
  const email=($("cloudEmail")||{}).value||"",pw=($("cloudPassword")||{}).value||"";
  if(!email||!pw){cloudNote("Enter your email and password.");return}
  cloudNote("Signing in…");
  try{const t=await cloudAuthFetch("token?grant_type=password",{email:email.trim(),password:pw});cloudSaveSession(t);cloudStoreDel("RGBM_CLOUD_SKIP_SIGNIN");CLOUD.authNotice="";CLOUD.welcomePending=true;render();cloudSync("sign-in")}
  catch(e){cloudNote("Sign-in failed.",String(e.message||e))}
}
async function cloudSendReset(){
  const email=(($("cloudEmail")||{}).value||"").trim();
  if(!email){cloudNote("Enter your email first.");return}
  try{const redirect=location.origin+location.pathname;await cloudAuthFetch("recover?redirect_to="+encodeURIComponent(redirect),{email});cloudNote("Email sent. Open the link on this device to set your password.")}
  catch(e){cloudNote("Could not send the email.",String(e.message||e))}
}
async function cloudSetPassword(){
  const a=($("cloudNewPassword")||{}).value||"",b=($("cloudNewPassword2")||{}).value||"";
  if(a.length<8){cloudNote("Use at least 8 characters.");return}
  if(a!==b){cloudNote("The two passwords do not match.");return}
  try{const tok=await cloudToken();await cloudAuthFetch("user",{password:a},"PUT",tok);const changed=CLOUD.passwordMode==="change";if(!changed)CLOUD.welcomePending=true;CLOUD.passwordMode="";cloudNote(changed?"Password changed.":"Password saved.");render();cloudSync("password-set")}
  catch(e){cloudNote("Could not save the password.",String(e.message||e))}
}
async function cloudSignOut(){
  if(!confirm("Sign out of cloud sync on this device?\n\nYour data stays on this device. Changes will not sync until you sign in again."))return;
  const s=cloudSession();
  try{if(s&&s.access_token)await cloudAuthFetch("logout",null,"POST",s.access_token)}catch(e){}
  [CLOUD_KEYS.session,CLOUD_KEYS.synced,CLOUD_KEYS.linked,CLOUD_KEYS.last].forEach(cloudStoreDel);
  CLOUD.choice=null;CLOUD.blocked=null;CLOUD.switchAcct=null;adminReset();cloudNote("Signed out");render();
}
function cloudCaptureAuthRedirect(){
  try{
    const h=String(location.hash||"");if(!h||h.length<2)return;
    const p=new URLSearchParams(h.slice(1));
    if(!p.get("access_token")&&!p.get("error")&&!p.get("error_code"))return;
    if(p.get("error")||p.get("error_code")){CLOUD.authNotice="That email link did not work ("+(p.get("error_description")||p.get("error_code")||p.get("error")).replace(/\+/g," ")+"). Use “Set or reset password” to get a new link.";CLOUD.pendingRoute=true}
    else{cloudSaveSession({access_token:p.get("access_token"),refresh_token:p.get("refresh_token"),expires_in:p.get("expires_in")});const type=p.get("type")||"";if(type==="invite"||type==="recovery"||type==="signup")CLOUD.passwordMode=type;CLOUD.pendingRoute=true}
    history.replaceState(history.state||null,"",location.pathname+location.search);
  }catch(e){console.error(e)}
}
function cloudSkipSignIn(){cloudStoreSet("RGBM_CLOUD_SKIP_SIGNIN","1");nav("home",{},false)}
function cloudAge(){const t=cloudStoreGet(CLOUD_KEYS.last);if(!t)return "never";const d=new Date(t);return isNaN(d)?"never":d.toLocaleString()}
function cloudStatusLine(){
  if(!cloudSignedIn())return "Not signed in. Data is stored on this device only.";
  const s=cloudSession();
  return `Signed in as ${s.user.email||"your account"} • Last sync: ${cloudAge()}${CLOUD.status?" • "+CLOUD.status:""}`;
}
function cloudRefreshStatusUi(){const el=$("cloudStatusText");if(el)el.textContent=cloudStatusLine();const er=$("cloudErrorText");if(er)er.textContent=CLOUD.error||""}
function cloudSettingsCard(){return `<div class="card cloud-sync-card"><h2>Cloud Sync</h2><p id="cloudStatusText">${esc(cloudStatusLine())}</p><button class="wide primary" type="button" onclick="nav('cloud')">Open Cloud Sync</button></div>`}
function cloudScreen(app){
  let body="";
  const notice=CLOUD.authNotice?`<p class="cloud-notice">${esc(CLOUD.authNotice)}</p>`:"";
  if(CLOUD.passwordMode&&cloudSignedIn()){
    body=`<div class="card"><h2>${CLOUD.passwordMode==="change"?"Change Password":"Set Your Password"}</h2><p class="muted">Choose the password you will use to sign in to RGB Mileage cloud sync.</p><label>New password<input id="cloudNewPassword" type="password" autocomplete="new-password"></label><label>Confirm password<input id="cloudNewPassword2" type="password" autocomplete="new-password"></label><button class="wide primary" type="button" onclick="cloudSetPassword()">Save Password</button>${CLOUD.passwordMode==="change"?'<button class="wide ghost" type="button" onclick="cloudCancelPassword()">Cancel</button>':""}</div>`;
  }else if(!cloudSignedIn()){
    body=`<div class="card"><h2>Sign In</h2>${notice}<p class="muted">Sign in to keep this device's data in sync with your RGB Mileage cloud database.</p><label>Email<input id="cloudEmail" type="email" autocomplete="username" autocapitalize="none"></label><label>Password<input id="cloudPassword" type="password" autocomplete="current-password"></label><button class="wide primary" type="button" onclick="cloudSignIn()">Sign In</button>${faceIdApiAvailable()?`<button class="wide" type="button" onclick="faceIdSignIn()">Sign In with Face ID</button>`:""}<button class="wide ghost" type="button" onclick="cloudSendReset()">Set or Reset Password by Email</button><button class="wide ghost" type="button" onclick="cloudSkipSignIn()">Not Now — Use This Device Only</button><button class="wide ghost" type="button" onclick="nav('guide')">Open User Guide</button></div>`;
  }else{
    let extra="";
    if(CLOUD.switchAcct){extra=`<div class="card cloud-choice-card cloud-switch-card"><h2>Another Account's Data Is on This Device</h2><p>The vehicles and records on this device belong to a different RGB Mileage account. To use your account here, this device's copy will be replaced with your own data. The other account's data stays safe in its cloud account.</p><button class="wide primary" type="button" onclick="cloudSwitchAccount()">Switch This Device to My Account</button><button class="wide ghost" type="button" onclick="cloudSignOut()">Sign Out</button></div>`}
    else if(CLOUD.choice){const c=CLOUD.choice;extra=`<div class="card cloud-choice-card"><h2>Choose Which Data to Keep</h2><p>This device and the cloud have different data (${c.diff} item(s) differ).</p><p><strong>Cloud:</strong> ${c.cloud.vehicles} vehicles • ${c.cloud.fuel} fuel • ${c.cloud.maintenance} maintenance • ${c.cloud.insurance} insurance<br><strong>This device:</strong> ${c.device.vehicles} vehicles • ${c.device.fuel} fuel • ${c.device.maintenance} maintenance • ${c.device.insurance} insurance</p><button class="wide ghost" type="button" onclick="downloadBackup()">Create JSON Backup First</button><button class="wide primary" type="button" onclick="cloudResolveChoice('cloud')">Use Cloud Data on This Device</button><button class="wide" type="button" onclick="cloudResolveChoice('device')">Upload This Device's Data to Cloud</button></div>`}
    else if(CLOUD.blocked){extra=`<div class="card cloud-choice-card"><h2>Sync Paused</h2><p>Saving here would remove ${CLOUD.blocked.deletes} item(s) from the cloud. Nothing has been removed yet.</p><button class="wide ghost" type="button" onclick="downloadBackup()">Create JSON Backup First</button><button class="wide primary" type="button" onclick="cloudResolveBlocked('pull')">Restore This Device from Cloud</button><button class="wide danger" type="button" onclick="cloudResolveBlocked('push')">Remove Them from the Cloud Too</button></div>`}
    body=`${extra}<div class="card"><h2>Status</h2>${notice}<p id="cloudStatusText">${esc(cloudStatusLine())}</p><p id="cloudErrorText" class="small muted">${esc(CLOUD.error||"")}</p><button class="wide primary" type="button" onclick="cloudSync('manual')">Sync Now</button><button class="wide" type="button" onclick="cloudStartChangePassword()">Change Password</button><button class="wide ghost" type="button" onclick="cloudSignOut()">Sign Out</button><p class="muted">Records, vehicles, settings and vehicle photos sync.</p></div>`;
  }
  app.innerHTML=header("Cloud Sync")+body+`<pre id="cloudErrorPre" class="small"></pre>`+bottomNav()+footer();
}
function initCloudSync(){
  if(typeof window==="undefined")return;
  try{const L=cloudStoreGet(CLOUD_KEYS.linked);if(L&&!cloudStoreGet(CLOUD_OWNER_KEY))cloudStoreSet(CLOUD_OWNER_KEY,L);const s0=cloudSession();if(s0&&s0.user&&s0.user.id&&!CLOUD.passwordMode)cloudStoreSet("RGBM_WELCOME_"+s0.user.id,"1")}catch(e){}
  window.addEventListener("online",()=>cloudSync("online"));
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")cloudSync("foreground")});
  const go=()=>{if(CLOUD.pendingRoute){CLOUD.pendingRoute=false;nav("cloud")}else if(!cloudSignedIn()&&cloudStoreGet("RGBM_CLOUD_SKIP_SIGNIN")!=="1"){nav("cloud")}setTimeout(()=>cloudSync("launch"),600)};
  const s=cloudSession();
  if(s&&s.access_token&&!(s.user&&s.user.id)){
    cloudAuthFetch("user",null,"GET",s.access_token).then(u=>{if(u&&u.id){s.user={id:u.id,email:u.email||""};cloudStoreSet(CLOUD_KEYS.session,JSON.stringify(s))}}).catch(e=>{CLOUD.authNotice="Could not confirm your sign-in. Sign in again.";cloudStoreDel(CLOUD_KEYS.session)}).finally(go);
  }else go();
}

/* ===== F29 RC2: Vehicle photo sync (Supabase Storage) =====
   Photos are stored in the private "vehicle-photos" bucket at <user id>/<vehicle id>.
   vehicles.primary_photo_md5 holds the photo fingerprint so other devices know when to download.
   RGBM_CLOUD_PHOTOS remembers, per vehicle, the local and cloud fingerprints at the last photo sync. */
const CLOUD_PHOTO_BUCKET="vehicle-photos";
function cloudPhotoState(){return cloudJSON("RGBM_CLOUD_PHOTOS",{})}
function cloudPhotoStateSave(m){cloudStoreSet("RGBM_CLOUD_PHOTOS",JSON.stringify(m))}
function cloudPhotoPath(uid,vid){return encodeURIComponent(uid)+"/"+encodeURIComponent(vid)}
function cloudDataUrlToBlob(u){const m=/^data:([^;,]+)?(;base64)?,(.*)$/s.exec(String(u||""));if(!m)return null;const mime=m[1]||"image/jpeg";if(m[2]){const bin=atob(m[3]);const a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return new Blob([a],{type:mime})}return new Blob([decodeURIComponent(m[3])],{type:mime})}
function cloudBlobToDataUrl(b){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result));r.onerror=()=>rej(r.error);r.readAsDataURL(b)})}
async function cloudStorage(method,path,body,headers={}){
  const tok=await cloudToken();
  const res=await fetch(CLOUD_CONFIG.url+"/storage/v1/object/"+path,{method,headers:{"apikey":CLOUD_CONFIG.key,"Authorization":"Bearer "+tok,...headers},body});
  if(!res.ok){let m="";try{m=(await res.json()).message||""}catch(e){}const err=new Error(`Photo ${method} failed (${res.status}) ${m}`);err.status=res.status;throw err}
  return res;
}
function cloudApplyPhoto(vid,dataUrl){
  const v=(state.vehicles||[]).find(x=>x.vehicleId===vid);if(!v)return false;
  v.primaryPhoto=dataUrl||"";
  state=saveData(state,{skipCloud:true});
  return true;
}
async function cloudPhotoSync(){
  const s=cloudSession();if(!s||!s.user)return;
  const uid=s.user.id,rec=cloudPhotoState();let changed=false,uploaded=0,downloaded=0;
  // push local photo changes
  for(const v of (state.vehicles||[])){
    const vid=v.vehicleId,photo=String(v.primaryPhoto||""),lh=photo?cloudHash(photo):null,r=rec[vid];
    if(lh&&(!r||r.local!==lh)){
      const blob=cloudDataUrlToBlob(photo);if(!blob)continue;
      await cloudStorage("POST",CLOUD_PHOTO_BUCKET+"/"+cloudPhotoPath(uid,vid),blob,{"Content-Type":blob.type||"image/jpeg","x-upsert":"true"});
      await cloudRest(`vehicles?vehicle_id=eq.${encodeURIComponent(vid)}`,{method:"PATCH",body:{primary_photo_md5:lh,primary_photo_present:true,primary_photo_chars:photo.length},prefer:"return=minimal"});
      rec[vid]={local:lh,cloud:lh};uploaded++;changed=true;
    }else if(!lh&&r&&r.local){
      try{await cloudStorage("DELETE",CLOUD_PHOTO_BUCKET+"/"+cloudPhotoPath(uid,vid))}catch(e){if(e.status!==404&&e.status!==400)throw e}
      await cloudRest(`vehicles?vehicle_id=eq.${encodeURIComponent(vid)}`,{method:"PATCH",body:{primary_photo_md5:null,primary_photo_present:false,primary_photo_chars:null},prefer:"return=minimal"});
      delete rec[vid];changed=true;
    }
  }
  // pull photo changes made on other devices
  const cloud=await cloudRest("vehicles?select=vehicle_id,primary_photo_md5")||[];
  for(const row of cloud){
    const vid=row.vehicle_id,cm=row.primary_photo_md5||null,r=rec[vid];
    const v=(state.vehicles||[]).find(x=>x.vehicleId===vid);if(!v)continue;
    const lh=v.primaryPhoto?cloudHash(String(v.primaryPhoto)):null;
    if(cm&&(!r||r.cloud!==cm)){
      if(r&&r.local===lh&&lh===cm)continue;
      let res;try{res=await cloudStorage("GET","authenticated/"+CLOUD_PHOTO_BUCKET+"/"+cloudPhotoPath(uid,vid))}catch(e){if(e.status===404||e.status===400)continue;throw e}
      const url=await cloudBlobToDataUrl(await res.blob());
      cloudApplyPhoto(vid,url);rec[vid]={local:cloudHash(url),cloud:cm};downloaded++;changed=true;
    }else if(!cm&&r&&r.cloud&&r.local===lh){
      cloudApplyPhoto(vid,"");delete rec[vid];changed=true;
    }
  }
  if(changed)cloudPhotoStateSave(rec);
  if(downloaded){const sc=route&&route.screen;if(["home","settings","cloud","vehicleView"].includes(sc))render()}
  return {uploaded,downloaded};
}
async function cloudPhotoSyncSafe(){try{return await cloudPhotoSync()}catch(e){console.error(e);CLOUD.error="Photos: "+String(e&&e.message||e);cloudRefreshStatusUi();return null}}

/* ===== F29 RC2: Face ID (passkeys) =====
   One passkey does two jobs: it signs in to Supabase (server-verified) and it unlocks the app on this
   device (checked by the iPhone's Face ID / passcode). The app lock hides the screen; it does not
   encrypt data stored on the phone. */
const LOCK_KEY="RGBM_LOCK";
const LOCK={hiddenAt:0,visible:false};
function b64uToBuf(s){s=String(s).replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";const bin=atob(s);const a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a.buffer}
function bufToB64u(b){const a=new Uint8Array(b);let s="";for(let i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
function lockConfig(){return cloudJSON(LOCK_KEY,{enabled:false,credId:"",passkeyId:"",after:1})}
function lockSave(c){cloudStoreSet(LOCK_KEY,JSON.stringify(c))}
function faceIdApiAvailable(){return typeof window!=="undefined"&&!!window.PublicKeyCredential&&!!(navigator.credentials&&navigator.credentials.create)}
async function faceIdAvailable(){try{return faceIdApiAvailable()&&await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()}catch(e){return false}}
function faceIdParseCreate(o){
  if(PublicKeyCredential.parseCreationOptionsFromJSON)return PublicKeyCredential.parseCreationOptionsFromJSON(o);
  const r={...o,challenge:b64uToBuf(o.challenge),user:{...o.user,id:b64uToBuf(o.user.id)}};
  if(o.excludeCredentials)r.excludeCredentials=o.excludeCredentials.map(c=>({...c,id:b64uToBuf(c.id)}));
  return r;
}
function faceIdParseGet(o){
  if(PublicKeyCredential.parseRequestOptionsFromJSON)return PublicKeyCredential.parseRequestOptionsFromJSON(o);
  const r={...o,challenge:b64uToBuf(o.challenge)};
  if(o.allowCredentials)r.allowCredentials=o.allowCredentials.map(c=>({...c,id:b64uToBuf(c.id)}));
  return r;
}
function faceIdSerialize(c){
  if(typeof c.toJSON==="function")return c.toJSON();
  const r=c.response,out={id:c.id,rawId:c.id,type:"public-key",clientExtensionResults:c.getClientExtensionResults?c.getClientExtensionResults():{},authenticatorAttachment:c.authenticatorAttachment||undefined,response:{clientDataJSON:bufToB64u(r.clientDataJSON)}};
  if(r.attestationObject)out.response.attestationObject=bufToB64u(r.attestationObject);
  if(r.authenticatorData){out.response.authenticatorData=bufToB64u(r.authenticatorData);out.response.signature=bufToB64u(r.signature);if(r.userHandle)out.response.userHandle=bufToB64u(r.userHandle)}
  return out;
}
async function faceIdSetup(){
  if(!cloudSignedIn()){alert("Sign in to Cloud Sync first, then set up Face ID.");return}
  if(!await faceIdAvailable()){alert("Face ID is not available in this browser.");return}
  try{
    const tok=await cloudToken();
    const start=await cloudAuthFetch("passkeys/registration/options",{},"POST",tok);
    const cred=await navigator.credentials.create({publicKey:faceIdParseCreate(start.options)});
    if(!cred)throw new Error("Face ID was cancelled.");
    const done=await cloudAuthFetch("passkeys/registration/verify",{challenge_id:start.challenge_id,credential:faceIdSerialize(cred)},"POST",await cloudToken());
    lockSave({...lockConfig(),enabled:true,credId:cred.id,passkeyId:(done&&done.id)||""});
    alert("Face ID is set up. The app will ask for Face ID when it opens.");
    render();
  }catch(e){console.error(e);alert("Face ID setup did not finish: "+String(e&&e.message||e))}
}
async function faceIdSignIn(){
  try{
    const start=await cloudAuthFetch("passkeys/authentication/options",{});
    const cred=await navigator.credentials.get({publicKey:faceIdParseGet(start.options)});
    if(!cred)throw new Error("Face ID was cancelled.");
    const data=await cloudAuthFetch("passkeys/authentication/verify",{challenge_id:start.challenge_id,credential:faceIdSerialize(cred)});
    const sess=data&&data.session?{...data.session,user:data.session.user||data.user}:data;
    if(!cloudSaveSession(sess))throw new Error("No session returned.");
    const c=lockConfig();if(!c.credId)lockSave({...c,credId:cred.id});
    cloudStoreDel("RGBM_CLOUD_SKIP_SIGNIN");CLOUD.authNotice="";CLOUD.welcomePending=true;render();cloudSync("faceid-sign-in");
  }catch(e){console.error(e);cloudNote("Face ID sign-in failed.",String(e&&e.message||e))}
}
async function faceIdRemove(){
  if(!confirm("Turn off Face ID on this device?\n\nThe app will open without Face ID, and Face ID sign-in will be removed from your account."))return;
  const c=lockConfig();
  if(c.passkeyId&&cloudSignedIn()){try{await cloudAuthFetch("passkeys/"+encodeURIComponent(c.passkeyId),null,"DELETE",await cloudToken())}catch(e){console.error(e)}}
  lockSave({enabled:false,credId:"",passkeyId:"",after:c.after||1});render();
}
function lockSetEnabled(on){const c=lockConfig();if(on&&!c.credId){faceIdSetup();return}lockSave({...c,enabled:!!on});render()}
function lockSetAfter(v){const c=lockConfig();lockSave({...c,after:Math.max(0,+v||0)})}
function lockShow(){
  const c=lockConfig();if(!c.enabled||!c.credId||LOCK.visible)return;
  LOCK.visible=true;
  let el=document.getElementById("rgbmLock");
  if(!el){el=document.createElement("div");el.id="rgbmLock";document.body.appendChild(el)}
  const pw=cloudSignedIn()?`<button class="wide ghost" type="button" onclick="lockPasswordForm()">Use Cloud Password</button>`:"";
  el.innerHTML=`<div class="rgbm-lock-inner"><h1>RGB Mileage</h1><p class="muted">Locked</p><button class="wide primary" type="button" onclick="lockUnlock()">Unlock with Face ID</button>${pw}<div id="rgbmLockExtra"></div><p id="rgbmLockMsg" class="small muted"></p></div>`;
  document.body.classList.add("rgbm-locked");
}
function lockHide(){LOCK.visible=false;const el=document.getElementById("rgbmLock");if(el)el.remove();document.body.classList.remove("rgbm-locked")}
async function lockUnlock(){
  const c=lockConfig(),msg=document.getElementById("rgbmLockMsg");
  try{
    const challenge=new Uint8Array(32);crypto.getRandomValues(challenge);
    const cred=await navigator.credentials.get({publicKey:{challenge,allowCredentials:[{type:"public-key",id:b64uToBuf(c.credId)}],userVerification:"required",timeout:60000}});
    if(cred&&cred.id===c.credId)lockHide();else if(msg)msg.textContent="Face ID did not match.";
  }catch(e){if(msg)msg.textContent="Face ID did not unlock. Try again"+(cloudSignedIn()?" or use your cloud password.":".")}
}
function lockPasswordForm(){const x=document.getElementById("rgbmLockExtra");if(x)x.innerHTML=`<label>Cloud password<input id="rgbmLockPw" type="password" autocomplete="current-password"></label><button class="wide" type="button" onclick="lockPasswordUnlock()">Unlock</button>`}
async function lockPasswordUnlock(){
  const s=cloudSession(),pw=(document.getElementById("rgbmLockPw")||{}).value||"",msg=document.getElementById("rgbmLockMsg");
  try{const t=await cloudAuthFetch("token?grant_type=password",{email:s.user.email,password:pw});cloudSaveSession(t);lockHide()}
  catch(e){if(msg)msg.textContent="That password did not work."}
}
function faceIdSettingsCard(){
  const c=lockConfig();
  if(!faceIdApiAvailable())return `<div class="card faceid-card"><h2>Face ID</h2><p class="muted">Face ID is not available in this browser.</p></div>`;
  if(!c.credId){
    return `<div class="card faceid-card"><h2>Face ID</h2><p class="muted">Use Face ID to open the app and to sign in to Cloud Sync.${cloudSignedIn()?"":" Sign in to Cloud Sync first."}</p><button class="wide primary" type="button" onclick="faceIdSetup()" ${cloudSignedIn()?"":"disabled"}>Set Up Face ID</button></div>`;
  }
  const opt=(v,l)=>`<option value="${v}" ${(+c.after)===v?"selected":""}>${l}</option>`;
  return `<div class="card faceid-card"><h2>Face ID</h2><label class="faceid-toggle"><input type="checkbox" ${c.enabled?"checked":""} onchange="lockSetEnabled(this.checked)"> Require Face ID to open the app</label><label>Lock again after<select onchange="lockSetAfter(this.value)">${opt(0,"Immediately")}${opt(1,"1 minute")}${opt(5,"5 minutes")}${opt(15,"15 minutes")}</select></label><p class="muted">Face ID sign-in is also turned on for Cloud Sync.</p><button class="wide ghost" type="button" onclick="faceIdRemove()">Turn Off Face ID on This Device</button></div>`;
}
function initFaceIdLock(){
  if(typeof document==="undefined")return;
  lockShow();
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="hidden"){LOCK.hiddenAt=Date.now();return}
    const c=lockConfig();
    if(c.enabled&&LOCK.hiddenAt&&Date.now()-LOCK.hiddenAt>=(+c.after||0)*60000)lockShow();
  });
}

/* ===== F29 RC4: User Guide, welcome, account ownership, change password ===== */
/*RGBM_GUIDE_START*/const RGBM_GUIDE={"version": "v2.1.6l-wc10-f29-rc13", "intro": "<p>RGB Mileage tracks fuel, maintenance, and insurance for up to three vehicles. Your data is saved on your device first and copied to your private cloud account when you are signed in. Each person who signs in sees only their own vehicles.</p>", "sections": [{"title": "Install on iPhone or iPad", "html": "<ol>\n<li>Open <strong>Safari</strong> and go to <a href=\"https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/\" target=\"_blank\" rel=\"noopener\">https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/</a></li>\n<li>Tap the <strong>Share</strong> button (the square with an arrow pointing up). On iPhone it is at the bottom of the screen; on iPad it is at the top right.</li>\n<li>Scroll down and tap <strong>Add to Home Screen</strong>. If you don't see it, tap <strong>Edit Actions</strong> and add it.</li>\n<li>Leave the name as <strong>RGB Mileage</strong> and tap <strong>Add</strong>.</li>\n<li>Close Safari and open RGB Mileage from the new Home Screen icon.</li>\n</ol>\n<p>Always open the app from the Home Screen icon. Safari, the GitHub app, and other in-app browsers each keep a separate copy of the data.</p>"}, {"title": "Install on Android", "html": "<ol>\n<li>Open <strong>Chrome</strong> and go to <a href=\"https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/\" target=\"_blank\" rel=\"noopener\">https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/</a></li>\n<li>Tap the <strong>⋮</strong> menu at the top right.</li>\n<li>Tap <strong>Add to Home screen</strong> (on some phones it says <strong>Install app</strong>).</li>\n<li>Tap <strong>Install</strong> or <strong>Add</strong>, then confirm adding the icon to your Home screen.</li>\n<li>Open RGB Mileage from the new icon.</li>\n</ol>\n<p>Samsung Internet works the same way: tap the menu (☰), then <strong>Add page to</strong>, then <strong>Home screen</strong>.</p>"}, {"title": "Getting an account and signing in", "html": "<p>Accounts are by invitation only. Ask the app administrator to add you. You will get the app link, your email address, and a temporary password.</p>\n<ol>\n<li>Open the app. The <strong>Sign In</strong> screen appears when you are not signed in.</li>\n<li>Enter your email and temporary password, then tap <strong>Sign In</strong>.</li>\n<li>Go to Settings → <strong>Open Cloud Sync</strong> → <strong>Change Password</strong> and choose your own password (at least 8 characters).</li>\n</ol>\n<p>The first time you sign in, the app offers to set up Face ID and points you to this guide.</p>\n<p>To use the app without an account, tap <strong>Not Now — Use This Device Only</strong>. Your data then stays on that device only. You can sign in later from Settings.</p>"}, {"title": "Home screen", "html": "<p>Home shows one circle per vehicle, with its photo and last refuel mileage.</p>\n<table>\n<thead>\n<tr>\n<th>Action</th>\n<th>What happens</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Tap a vehicle circle</td>\n<td>Opens a new Fuel entry for that vehicle</td>\n</tr>\n<tr>\n<td>Press and hold a circle</td>\n<td>Opens the vehicle page: details, records, Edit Vehicle, Maintenance Entry, Insurance Entry</td>\n</tr>\n<tr>\n<td>Tap an <strong>Add Vehicle</strong> circle</td>\n<td>Opens the form to add a vehicle</td>\n</tr>\n</tbody>\n</table>\n<p>The bar at the bottom has <strong>Home</strong>, <strong>Reports</strong>, <strong>Data</strong> (backup, restore, CSV import), and <strong>Settings</strong>. <strong>‹ Back</strong> at the top returns to the previous screen.</p>"}, {"title": "Vehicles", "html": "<p>Tap an <strong>Add Vehicle</strong> circle to add a vehicle. To change one, press and hold its circle, then tap <strong>Edit Vehicle</strong>.</p>\n<ul>\n<li><strong>Year, Make, Model, Badge</strong> make up the vehicle's name.</li>\n<li><strong>Custom Label</strong> (up to 50 characters) is shown instead of Year/Make/Model.</li>\n<li><strong>Vehicle Image</strong> is the circle photo. It syncs to your other devices.</li>\n<li><strong>Acquisition Record</strong> holds the purchase date, starting odometer, price, and seller.</li>\n<li><strong>Status</strong> is Active or Archived.</li>\n</ul>\n<p>Tap <strong>Save Vehicle</strong> to keep the changes, or <strong>Clear &amp; Exit</strong> to discard them. To change the order of the circles, go to Settings → <strong>Vehicle Order</strong>. Position 1 is the large circle in portrait view.</p>"}, {"title": "Fuel, maintenance, and insurance records", "html": "<table>\n<thead>\n<tr>\n<th>Record</th>\n<th>How to open it</th>\n<th>Main fields</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Fuel</td>\n<td>Tap the vehicle circle</td>\n<td>Date, odometer, gallons, grade, station, price/gal or total. Miles and MPG fill in automatically.</td>\n</tr>\n<tr>\n<td>Maintenance</td>\n<td>Hold the circle → <strong>Maintenance Entry</strong></td>\n<td>Date, category, odometer, cost, location, provider</td>\n</tr>\n<tr>\n<td>Insurance</td>\n<td>Hold the circle → <strong>Insurance Entry</strong></td>\n<td>Agency, policy number, dates, agreed value, premium, agent</td>\n</tr>\n</tbody>\n</table>\n<p>Tap <strong>Save</strong> to save, or <strong>Cancel</strong> to leave without saving. Earlier records for that vehicle are listed under the form. Tap one to view, edit, archive, or delete it.</p>\n<p><strong>Lists you build as you go:</strong> Fuel Grade, Station, Category, Location, Provider, and Performed By are drop-down lists. To use a new name, pick <strong>Other</strong>, type it, then tap <strong>Save To List</strong> to keep it in the list, or <strong>Use Once</strong> for just this record. Location, Provider, and Performed By start with the names already in your maintenance records.</p>\n<p>For fuel cost, set <strong>Cost Source</strong> to <strong>Calculated</strong> to work out the total from the price per gallon, or <strong>Entered</strong> to type the total yourself.</p>"}, {"title": "Scanning receipts", "html": "<p>On a new Fuel or Maintenance entry, use the green <strong>Read Receipt</strong> button beside the form title. <strong>Tap</strong> it to take a photo with the camera. <strong>Press and hold</strong> it until it says <strong>Release for Photos</strong>, then let go, to pick a receipt picture from your camera roll or photo library.</p>\n<ol>\n<li>Lay the receipt flat in good light and fill the screen with it.</li>\n<li>A <strong>Crop Receipt</strong> screen opens. Drag the corners or edges so only the receipt is inside the frame; crop out other papers or anything confusing. <strong>Rotate ↻</strong>, <strong>Auto Frame</strong> and <strong>Whole Picture</strong> are there too. Tap <strong>Read Receipt</strong>.</li>\n<li>The app reads it on your phone in a few seconds. The first scan downloads the reader (about 5 MB), so it needs internet.</li>\n<li>Check the values. <strong>read</strong> means it was read clearly; <strong>check this</strong> means it was a guess. Fix anything that is wrong.</li>\n<li>Tap <strong>Use These</strong> to fill the entry, then enter the odometer and tap <strong>Save</strong> as usual.</li>\n</ol>\n<p>What gets filled in, and other tips:</p>\n<ul>\n<li><strong>Fuel</strong> fills Date, Time, Station, Fuel Grade, Gallons, Price/Gal, and Total Cost.</li>\n<li><strong>Maintenance</strong> fills Date, Provider, Category, Odometer (when printed), and Cost.</li>\n<li>For a long receipt, use <strong>Add Another Part</strong> for the rest (tap for the camera, hold for your photos).</li>\n<li><strong>Text read</strong> shows exactly what the app read. You can correct it and tap <strong>Fill In Again</strong>.</li>\n<li>The picture is never saved or uploaded. Very faded receipts may not read at all; type those.</li>\n</ul>"}, {"title": "Insurance documents (Google Drive)", "html": "<p>Scanned insurance documents (cards, declarations pages, bills) are saved to <strong>your own Google Drive</strong>. The app keeps only a link.</p>\n<p><strong>Set up once:</strong> go to Settings → <strong>Insurance Documents</strong>.</p>\n<ol>\n<li>Tap <strong>Connect Google Drive</strong> and sign in to your Google account.</li>\n<li>Pick how to organize: <strong>One folder, with a subfolder for each vehicle</strong> (the app makes the vehicle folders), or <strong>A separate folder for each vehicle</strong>.</li>\n<li>Tap <strong>Choose Folder</strong> and pick the Drive folder(s). Tap <strong>Change</strong> later to use a different one.</li>\n</ol>\n<p><strong>Add a document:</strong> open an Insurance entry and use the green <strong>Scan Document</strong> button beside the title. <strong>Tap</strong> it for the camera, or <strong>press and hold</strong> until it says <strong>Release for Photos</strong> to choose a picture on your phone.</p>\n<p>Then:</p>\n<ul>\n<li>A <strong>Crop Document</strong> screen opens. Drag the corners or edges to frame the document (drag inside to move the frame). <strong>Rotate ↻</strong> turns it, <strong>Auto Frame</strong> finds the paper, <strong>Whole Picture</strong> keeps everything. Tap <strong>Save to Drive</strong>.</li>\n<li>Only the cropped part is uploaded to the folder, and its link appears under <strong>Documents</strong>. Tap a link to open it in Google Drive.</li>\n<li>On a new entry, tap <strong>Save</strong> to keep the links.</li>\n<li><strong>Remove Link</strong> takes the link out of the app. The file stays in Drive.</li>\n<li>Folder choices belong to the signed-in user; each person sets their own.</li>\n<li>Google asks you to reconnect about once an hour of use; just approve and try again.</li>\n</ul>"}, {"title": "Editing drop-down lists", "html": "<p>Go to Settings → <strong>Edit Lists</strong>, then pick the list at the top: Fuel Grade, Station, Maintenance Category, Location, Provider, or Performed By.</p>\n<ul>\n<li><strong>Edit</strong> fixes a spelling. If records use the old spelling, the app offers to correct them too. If the new name is already in the list, the two are combined.</li>\n<li><strong>Up</strong> and <strong>Down</strong> change the order. <strong>Sort A–Z</strong> puts the list in alphabetical order.</li>\n<li><strong>Delete</strong> removes a choice from the list. Records that already use it keep it.</li>\n<li><strong>Add</strong> puts a new choice at the end of the list.</li>\n<li>Each entry shows how many records use it. <strong>Other</strong> always stays last on entry screens.</li>\n</ul>\n<p>Your lists sync to your other signed-in devices.</p>"}, {"title": "Reports", "html": "<p>Tap <strong>Reports</strong> in the bottom bar. The reports are Fuel History, MPG, Maintenance, Insurance History, and Vehicle Summary. Archived records are left out.</p>"}, {"title": "Cloud Sync", "html": "<p>While you are signed in, every save is copied to your cloud account within a few seconds. Your other devices pick up changes when they open the app or when you tap <strong>Sync Now</strong>. Vehicle photos sync too.</p>\n<ul>\n<li><strong>Offline:</strong> keep using the app. Changes wait on the device and upload when you are back online.</li>\n<li><strong>Status:</strong> Settings → <strong>Open Cloud Sync</strong> shows who is signed in and when the last sync happened.</li>\n<li><strong>New device:</strong> install the app and sign in. If that device already has different data, you'll be asked to <strong>Choose Which Data to Keep</strong>. Pick <strong>Use Cloud Data on This Device</strong> unless you know the device has the newer data.</li>\n<li><strong>Shared device:</strong> if the device holds someone else's data, the app asks before switching it to your account. The other person's data stays in their own cloud account.</li>\n<li><strong>Sync Paused:</strong> if one save would delete more than 10 items from the cloud, sync stops and asks first. <strong>Restore This Device from Cloud</strong> undoes the deletion. <strong>Remove Them from the Cloud Too</strong> confirms it.</li>\n<li><strong>Change Password:</strong> Settings → Open Cloud Sync → <strong>Change Password</strong>.</li>\n<li><strong>Sign Out</strong> stops syncing on that device. The data stays on the device.</li>\n</ul>"}, {"title": "Face ID and fingerprint", "html": "<p>Face ID (or fingerprint or face unlock on Android) can lock the app and sign you in without a password. Set it up on each device after you sign in.</p>\n<ol>\n<li>Settings → Face ID → <strong>Set Up Face ID</strong>, then approve the prompt.</li>\n<li><strong>Require Face ID to open the app</strong> turns the lock on or off.</li>\n<li><strong>Lock again after</strong> sets how long the app can be in the background before it asks again.</li>\n</ol>\n<p>If Face ID fails, tap <strong>Use Cloud Password</strong>. On the Sign In screen, <strong>Sign In with Face ID</strong> signs you in without typing your password. <strong>Turn Off Face ID on This Device</strong> removes it.</p>\n<p>The lock hides the screen. It does not encrypt the data stored on the device.</p>"}, {"title": "Managing users (administrator)", "html": "<p>Only the app administrator sees this. Go to Settings → <strong>Manage Users</strong>.</p>\n<ul>\n<li><strong>Add a user:</strong> enter their email. A temporary password is filled in for you (tap <strong>New Password</strong> for a different one). Tap <strong>Add User</strong>.</li>\n<li><strong>Share the sign-in details:</strong> after adding, tap <strong>Share</strong> to send the app link, their email, and the temporary password by text or email, or <strong>Copy</strong> to paste it yourself. The password is shown only once.</li>\n<li><strong>Reset a password:</strong> tap <strong>Reset Password</strong> next to the person, then share the new temporary password.</li>\n<li>Each person sees only their own vehicles and records. They change the temporary password after signing in.</li>\n</ul>"}, {"title": "Backup and restore", "html": "<p><strong>Back up:</strong> Data → <strong>Create JSON Backup</strong>, then save the file to Files, iCloud, or Google Drive. Do this before a reset or reinstall.</p>\n<p><strong>Restore:</strong> Data → <strong>Restore JSON</strong> → pick the file → choose a Restore Mode → <strong>Restore JSON Backup</strong>.</p>\n<table>\n<thead>\n<tr>\n<th>Restore Mode</th>\n<th>What it does</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Replace</td>\n<td>Replaces all data on the device with the backup</td>\n</tr>\n<tr>\n<td>Update</td>\n<td>Updates matching records and adds missing ones (safest)</td>\n</tr>\n<tr>\n<td>Duplicate</td>\n<td>Adds the backup's records as copies</td>\n</tr>\n<tr>\n<td>Skip</td>\n<td>Adds only records that aren't already there</td>\n</tr>\n</tbody>\n</table>\n<p><strong>CSV Import</strong> (Data screen) brings in fuel and maintenance records from a spreadsheet. Tap <strong>Preview Import</strong> first, then <strong>Save Previewed Rows</strong>.</p>"}, {"title": "Updates", "html": "<p>When an <strong>Update</strong> badge appears on Home, tap it to load the new version. If the app still shows an old version, go to Settings → <strong>Reset App Cache / Reload Current Version</strong>. Your data is kept. The version number is shown under the app name on Home and at the top of Settings.</p>\n<p>This guide is updated with every new version of the app.</p>"}, {"title": "Troubleshooting", "html": "<table>\n<thead>\n<tr>\n<th>Problem</th>\n<th>Fix</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>App shows an old version or old data</td>\n<td>Settings → <strong>Reset App Cache / Reload Current Version</strong>, then sign in</td>\n</tr>\n<tr>\n<td>Vehicles are blank on a new device</td>\n<td>Sign in, then choose <strong>Use Cloud Data on This Device</strong></td>\n</tr>\n<tr>\n<td>Photos missing</td>\n<td>Tap <strong>Sync Now</strong> on the device that has the photos, then on the other device</td>\n</tr>\n<tr>\n<td>Forgot password</td>\n<td>Ask the app administrator to tap <strong>Reset Password</strong> for you in Manage Users</td>\n</tr>\n<tr>\n<td>Face ID not offered</td>\n<td>Sign in first and open the app from the Home Screen icon</td>\n</tr>\n<tr>\n<td>Data gone after deleting the app</td>\n<td>Sign in to restore from the cloud, or restore a JSON backup in <strong>Update</strong> mode</td>\n</tr>\n</tbody>\n</table>\n<p><strong>Clear Local Data</strong> (bottom of Settings) erases this device only. It never deletes cloud data.</p>"}]};/*RGBM_GUIDE_END*/
const CLOUD_OWNER_KEY="RGBM_CLOUD_OWNER";
function guideSettingsCard(){return `<div class="card guide-card"><h2>User Guide</h2><p class="muted">How to install the app on iPhone or Android and how to use every screen.</p><button class="wide primary" type="button" onclick="nav('guide')">Open User Guide</button></div>`}
function guideScreen(app){
  const g=RGBM_GUIDE||{},secs=g.sections||[];
  const toc=secs.map((x,i)=>`<button class="guide-toc-item" type="button" onclick="guideJump(${i})">${esc(x.title)}</button>`).join("");
  const body=secs.map((x,i)=>`<details class="card guide-section" id="guideSec${i}"><summary>${esc(x.title)}</summary><div class="guide-body">${x.html}</div></details>`).join("");
  app.innerHTML=header("User Guide")+`<div class="card guide-intro"><p class="muted guide-version">For version ${esc(g.version||VERSION)}</p>${g.intro||""}<div class="guide-toc">${toc}</div></div>`+body+bottomNav()+footer();
}
function guideJump(i){const d=$("guideSec"+i);if(!d)return;d.open=true;setTimeout(()=>{try{d.scrollIntoView({behavior:"smooth",block:"start"})}catch(e){d.scrollIntoView()}},0)}
function cloudMarkLinked(uid){cloudStoreSet(CLOUD_KEYS.linked,uid);cloudStoreSet(CLOUD_OWNER_KEY,uid)}
function cloudHasLocalData(){return RGBMDataV3.getConfiguredVehicles(state).length>0||CLOUD_TABLES.some(t=>(state[t.collection]||[]).length>0)}
async function cloudSwitchAccount(){
  if(!confirm("Switch this device to your account?\n\nThe vehicles and records now on this device will be removed from this device and replaced with your own data. They stay safe in the other account's cloud."))return;
  try{
    ["RGBM_CLOUD_SYNCED","RGBM_CLOUD_PHOTOS","RGBM_CLOUD_LAST"].forEach(cloudStoreDel);
    lockSave({enabled:false,credId:"",passkeyId:"",after:1});
    state=saveData(blankData(),{skipCloud:true});
    cloudStoreDel(CLOUD_OWNER_KEY);CLOUD.switchAcct=null;
    const rows=await cloudFetchRows();
    if(!cloudRowsEmpty(rows)){cloudAdopt(rows);cloudMarkLinked(cloudSession().user.id)}
    render();await cloudSync("switch-account");
  }catch(e){console.error(e);cloudNote("Could not switch accounts.",String(e&&e.message||e))}
}
function cloudStartChangePassword(){CLOUD.passwordMode="change";render()}
function cloudCancelPassword(){CLOUD.passwordMode="";render()}
function cloudMaybeWelcome(){
  if(!CLOUD.welcomePending)return;
  const s=cloudSession();if(!s||!s.user||!s.user.id)return;
  if(CLOUD.busy||CLOUD.choice||CLOUD.blocked||CLOUD.switchAcct||CLOUD.passwordMode)return;
  CLOUD.welcomePending=false;
  const k="RGBM_WELCOME_"+s.user.id;
  if(cloudStoreGet(k)==="1")return;
  cloudStoreSet(k,"1");
  rgbmShowWelcome();
}
function rgbmShowWelcome(){
  const needFace=faceIdApiAvailable()&&!lockConfig().credId;
  const acts=[];
  if(needFace)acts.push({label:"Set Up Face ID",className:"primary",onClick:()=>faceIdSetup()});
  acts.push({label:"Open User Guide",className:needFace?"ok":"primary",onClick:()=>nav("guide")});
  acts.push({label:"Later",className:"ghost"});
  return showChoiceModal("Welcome to RGB Mileage",acts,(needFace?"Set up Face ID so you can open the app and sign in without typing your password. ":"")+"Explore the User Guide for instructions on using the app. You can open it any time from Settings.");
}

/* ===== F29 RC5: in-app user management (administrator only) =====
   The app never holds the secret key. It calls the admin-users Edge Function with the signed-in
   user's token; the function checks public.app_admins before listing, adding, or resetting users. */
const ADMIN={users:null,loading:false,error:"",result:null,draftEmail:"",draftPw:"",busy:false};
const APP_PUBLIC_URL="https://hzzmbgth7t-beep.github.io/RGBMILEAGETracker/";
function adminFlagKey(){const s=cloudSession();return s&&s.user&&s.user.id?"RGBM_IS_ADMIN_"+s.user.id:""}
function adminIsAdmin(){const k=adminFlagKey();return !!k&&cloudSignedIn()&&cloudStoreGet(k)==="1"}
function adminReset(){ADMIN.users=null;ADMIN.error="";ADMIN.result=null;ADMIN.draftEmail="";ADMIN.draftPw=""}
async function adminCheck(){
  if(!cloudSignedIn()||!cloudOnline())return;
  const k=adminFlagKey();if(!k)return;
  const before=cloudStoreGet(k)==="1";
  let now=before;
  try{const rows=await cloudRest("app_admins?select=user_id");now=Array.isArray(rows)&&rows.length>0}
  catch(e){if(/\((401|403|404)\)/.test(String(e&&e.message)))now=false;else return}
  if(now)cloudStoreSet(k,"1");else cloudStoreDel(k);
  if(now!==before&&route&&["settings","users"].includes(route.screen))render();
}
function adminSettingsCard(){
  if(!adminIsAdmin())return "";
  return `<div class="card admin-card"><h2>Users</h2><p class="muted">Add people and reset their passwords. Each person sees only their own data.</p><button class="wide primary" type="button" onclick="nav('users')">Manage Users</button></div>`;
}
function adminTempPassword(){
  const a="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const r=new Uint32Array(12);crypto.getRandomValues(r);
  let p="";for(let i=0;i<12;i++){p+=a[r[i]%a.length];if(i===3||i===7)p+="-"}
  return p;
}
async function adminCall(action,payload={}){
  const tok=await cloudToken();
  const res=await fetch(CLOUD_CONFIG.url+"/functions/v1/admin-users",{method:"POST",headers:{"apikey":CLOUD_CONFIG.key,"Authorization":"Bearer "+tok,"Content-Type":"application/json"},body:JSON.stringify({action,...payload})});
  let data=null;try{data=await res.json()}catch(e){}
  if(!res.ok)throw new Error((data&&(data.error||data.message||data.msg))||("The user service did not respond ("+res.status+")."));
  return data||{};
}
async function adminLoad(){
  if(ADMIN.loading)return;
  ADMIN.loading=true;ADMIN.error="";if(route.screen==="users")render();
  try{const d=await adminCall("list");ADMIN.users=d.users||[]}
  catch(e){ADMIN.error=String(e&&e.message||e)}
  finally{ADMIN.loading=false;if(route.screen==="users")render()}
}
function adminDate(v){if(!v)return "never";const d=new Date(v);return isNaN(d)?"":d.toLocaleDateString(undefined,{month:"2-digit",day:"2-digit",year:"numeric"})}
function adminShareText(r){return `You've been ${r.reset?"given a new password for":"added to"} RGB Mileage.\n\nApp: ${APP_PUBLIC_URL}\nEmail: ${r.email}\nTemporary password: ${r.password}\n\nOpen the link on your phone, add it to your Home Screen (the User Guide in the app shows how), sign in, then change your password under Settings → Open Cloud Sync → Change Password.`}
function usersScreen(app){
  let body="";
  if(!cloudSignedIn()){body=`<div class="card"><h2>Users</h2><p class="muted">Sign in to manage users.</p></div>`}
  else if(!adminIsAdmin()){body=`<div class="card"><h2>Users</h2><p class="muted">Only the app administrator can manage users.</p></div>`}
  else{
    if(ADMIN.users===null&&!ADMIN.loading&&!ADMIN.error)setTimeout(adminLoad,0);
    if(!ADMIN.draftPw)ADMIN.draftPw=adminTempPassword();
    const r=ADMIN.result;
    const result=r?`<div class="card cloud-choice-card admin-result"><h2>${r.reset?"New Password for":"Added"} ${esc(r.email)}</h2><p>Send these details to them now. The temporary password is not shown again.</p><pre class="admin-share">${esc(adminShareText(r))}</pre><button class="wide primary" type="button" onclick="adminShare()">Share</button><button class="wide" type="button" onclick="adminCopy()">Copy</button><button class="wide ghost" type="button" onclick="adminDone()">Done</button></div>`:"";
    const add=`<div class="card admin-add"><h2>Add a User</h2><label>Email<input id="adminEmail" type="email" autocapitalize="none" autocomplete="off" value="${esc(ADMIN.draftEmail)}" oninput="ADMIN.draftEmail=this.value"></label><label>Temporary password<input id="adminPw" type="text" autocapitalize="none" autocomplete="off" spellcheck="false" value="${esc(ADMIN.draftPw)}" oninput="ADMIN.draftPw=this.value"></label><button class="wide ghost" type="button" onclick="adminNewPw()">New Password</button><button class="wide primary" type="button" onclick="adminAdd()" ${ADMIN.busy?"disabled":""}>Add User</button></div>`;
    const me=(cloudSession().user||{}).id;
    const list=ADMIN.loading&&!ADMIN.users?`<p class="muted">Loading users…</p>`:(ADMIN.users||[]).map(u=>`<div class="admin-user"><div><strong>${esc(u.email)}</strong>${u.is_admin?' <span class="badge">Admin</span>':""}<div class="small muted">Added ${esc(adminDate(u.created_at))} • Last sign-in ${esc(adminDate(u.last_sign_in_at))}</div></div>${u.id===me?"":`<button class="smallbtn" type="button" onclick="adminResetPw('${esc(u.id)}')">Reset Password</button>`}</div>`).join("");
    const err=ADMIN.error?`<p class="cloud-notice">${esc(ADMIN.error)}</p>`:"";
    body=result+add+`<div class="card admin-list"><h2>Users${ADMIN.users?` (${ADMIN.users.length})`:""}</h2>${err}${list}<button class="wide ghost" type="button" onclick="adminLoad()">Refresh</button></div>`;
  }
  app.innerHTML=header("Users")+body+bottomNav()+footer();
}
function adminNewPw(){ADMIN.draftPw=adminTempPassword();const el=$("adminPw");if(el)el.value=ADMIN.draftPw}
async function adminAdd(){
  const email=(($("adminEmail")||{}).value||"").trim().toLowerCase();
  const password=(($("adminPw")||{}).value||"").trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ADMIN.error="Enter a valid email address.";render();return}
  if(password.length<8){ADMIN.error="The temporary password must be at least 8 characters.";render();return}
  ADMIN.busy=true;ADMIN.error="";render();
  try{await adminCall("create",{email,password});ADMIN.result={email,password,reset:false};ADMIN.draftEmail="";ADMIN.draftPw="";await adminLoad()}
  catch(e){ADMIN.error=String(e&&e.message||e)}
  finally{ADMIN.busy=false;render()}
}
async function adminResetPw(id){
  const u=(ADMIN.users||[]).find(x=>x.id===id);if(!u)return;
  if(!confirm("Set a new temporary password for "+u.email+"?\n\nTheir current password will stop working."))return;
  const password=adminTempPassword();
  ADMIN.error="";
  try{await adminCall("set_password",{user_id:id,password});ADMIN.result={email:u.email,password,reset:true}}
  catch(e){ADMIN.error=String(e&&e.message||e)}
  render();
}
async function adminCopy(){
  if(!ADMIN.result)return;const t=adminShareText(ADMIN.result);
  try{await navigator.clipboard.writeText(t);alert("Copied.")}catch(e){alert("Copy did not work. Press and hold the text to copy it.")}
}
async function adminShare(){
  if(!ADMIN.result)return;const t=adminShareText(ADMIN.result);
  if(navigator.share){try{await navigator.share({title:"RGB Mileage sign-in",text:t});return}catch(e){if(e&&e.name==="AbortError")return}}
  adminCopy();
}
function adminDone(){ADMIN.result=null;render()}

/* ===== F29 RC6: Maintenance Location / Provider / Performed By pick lists =====
   Same Other -> Use Once / Save To List flow as Fuel Grade and Station. Each list starts with the
   distinct values already used in maintenance records; saved lists live in state (synced with settings). */
const MAINT_PICK_FIELDS={maintenanceLocations:r=>r.location,maintenanceProviders:r=>r.serviceProvider||r.provider,maintenancePerformers:r=>r.performedBy};
function maintPickList(listName){
  if(!Array.isArray(state[listName])){
    const get=MAINT_PICK_FIELDS[listName]||(()=>"");const seen=[];
    (state.maintenanceRecords||[]).forEach(r=>{const v=cleanText(get(r));if(v&&v!=="Other"&&!seen.some(x=>x.toLowerCase()===v.toLowerCase()))seen.push(v)});
    seen.sort((a,b)=>a.localeCompare(b));state[listName]=seen;
  }
  return sortWithOther(state[listName],[]);
}
function maintPickSelect(id,listName,value){
  const v=cleanText(value);const list=maintPickList(listName);const opts=["",...list];
  if(v&&!opts.includes(v))opts.splice(opts.length-1,0,v);
  return `<select id="${id}" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'${listName}')">${opts.map(o=>`<option value="${esc(o)}" ${o===v?"selected":""}>${esc(o)}</option>`).join("")}</select>`;
}

/* ===== F29 RC7: Edit Lists (Settings) =====
   One screen to rename, reorder, add, delete, and sort the drop-down lists. Once a list is edited here
   it is marked in state.customizedLists and its saved order is used exactly (defaults are no longer
   re-added). Renaming can also correct the records that use the old spelling. */
const LIST_DEFS=[
  {key:"fuelGrades",label:"Fuel Grade",coll:"fuelRecords",fields:["fuelGrade"]},
  {key:"stations",label:"Station",coll:"fuelRecords",fields:["station"]},
  {key:"maintenanceCategories",label:"Maintenance Category",coll:"maintenanceRecords",fields:["category"]},
  {key:"maintenanceLocations",label:"Location",coll:"maintenanceRecords",fields:["location"]},
  {key:"maintenanceProviders",label:"Provider",coll:"maintenanceRecords",fields:["serviceProvider","provider"]},
  {key:"maintenancePerformers",label:"Performed By",coll:"maintenanceRecords",fields:["performedBy"]}
];
function listDef(key){return LIST_DEFS.find(d=>d.key===key)||LIST_DEFS[0]}
function listItems(key){const raw=MAINT_PICK_FIELDS[key]?maintPickList(key):activeList(key);return raw.filter(x=>x&&x!=="Other")}
function listMaterialize(key){const items=listItems(key);state[key]=items.slice();state.customizedLists={...(state.customizedLists||{}),[key]:true};return state[key]}
function listUsage(key,value){const d=listDef(key);return (state[d.coll]||[]).filter(r=>d.fields.some(f=>cleanText(r[f])===value)).length}
function listsSettingsCard(){return `<div class="card lists-card"><h2>Drop-Down Lists</h2><p class="muted">Fix spelling, reorder, add, or remove choices for Fuel Grade, Station, Category, Location, Provider, and Performed By.</p><button class="wide primary" type="button" onclick="nav('lists',{list:'fuelGrades'})">Edit Lists</button></div>`}
function listsScreen(app){
  const key=listDef(route.list).key,d=listDef(key),items=listItems(key);
  const pick=`<label>List<select id="listPick" onchange="listsPick(this.value)">${LIST_DEFS.map(x=>`<option value="${x.key}" ${x.key===key?"selected":""}>${esc(x.label)}</option>`).join("")}</select></label>`;
  const rows=items.length?items.map((v,i)=>{const n=listUsage(key,v);return `<div class="list-row"><div class="list-name"><strong>${esc(v)}</strong><span class="small muted">${n?`used in ${n} record${n===1?"":"s"}`:"not used yet"}</span></div><div class="list-actions"><button class="smallbtn" type="button" onclick="listsMove(${i},-1)" ${i===0?"disabled":""} aria-label="Move up">Up</button><button class="smallbtn" type="button" onclick="listsMove(${i},1)" ${i===items.length-1?"disabled":""} aria-label="Move down">Down</button><button class="smallbtn" type="button" onclick="listsRename(${i})">Edit</button><button class="smallbtn danger" type="button" onclick="listsDelete(${i})">Delete</button></div></div>`}).join(""):`<p class="muted">This list is empty.</p>`;
  app.innerHTML=header("Edit Lists")+`<div class="card">${pick}<p class="muted small">“Other” always appears last on entry screens so you can type a new name.</p></div><div class="card lists-items"><h2>${esc(d.label)} (${items.length})</h2>${rows}<div class="list-add"><label>Add to list<input id="listNew" autocomplete="off" placeholder="New ${esc(d.label.toLowerCase())}"></label><button class="wide primary" type="button" onclick="listsAdd()">Add</button><button class="wide ghost" type="button" onclick="listsSortAZ()">Sort A–Z</button></div></div>`+bottomNav()+footer();
}
function listsPick(key){route.list=key;render()}
function listsKey(){return listDef(route.list).key}
function listsSave(){saveData();render()}
function listsMove(i,dir){const key=listsKey();const a=listMaterialize(key);const j=i+dir;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];listsSave()}
function listsDelete(i){const key=listsKey();const a=listMaterialize(key);const v=a[i];if(v==null)return;if(!confirm(`Remove “${v}” from the ${listDef(key).label} list?\n\nRecords that already use it keep it.`))return;a.splice(i,1);listsSave()}
function listsAdd(){
  const key=listsKey();const el=$("listNew");const v=cleanText(el&&el.value);
  if(!v)return alert("Type a name first.");
  if(v==="Other")return alert("“Other” is reserved.");
  const a=listMaterialize(key);
  if(a.some(x=>x.toLowerCase()===v.toLowerCase()))return alert(`“${v}” is already in the list.`);
  a.push(v);listsSave();
}
function listsSortAZ(){const key=listsKey();const a=listMaterialize(key);a.sort((x,y)=>x.localeCompare(y,undefined,{numeric:true,sensitivity:"base"}));listsSave()}
function listsRename(i){
  const key=listsKey(),d=listDef(key);const a=listMaterialize(key);const old=a[i];if(old==null)return;
  const input=prompt(`Change “${old}” to:`,old);if(input==null)return;
  const nv=cleanText(input);if(!nv||nv===old)return;
  if(nv==="Other")return alert("“Other” is reserved.");
  const dup=a.findIndex((x,k)=>k!==i&&x.toLowerCase()===nv.toLowerCase());
  if(dup>=0){if(!confirm(`“${a[dup]}” is already in the list. Combine “${old}” into it?`))return;a.splice(i,1)}else a[i]=nv;
  const target=dup>=0?a[dup>i?dup-1:dup]:nv;
  const n=listUsage(key,old);
  if(n&&confirm(`Also change ${n} record${n===1?"":"s"} from “${old}” to “${target}”?`)){
    const now=nowISO();
    (state[d.coll]||[]).forEach(r=>{let hit=false;d.fields.forEach(f=>{if(cleanText(r[f])===old){r[f]=target;hit=true}});if(hit)r.modifiedAt=now});
  }
  listsSave();
}

/* ===== F29 RC8: Scan Receipt (read on the phone; the picture is never saved or uploaded) ===== */
/*RGBM_RECEIPT_START*//* RGBM receipt reader core — shared by the app (browser canvas) and the bench (@napi-rs/canvas).
   Method adapted from the SS Conferences card reader: clean up on the device, read twice at two
   sizes, keep words with confidence >= 40, split wide gaps, then fill fields with simple rules.
   The picture is never stored or uploaded. */
var RGBMReceipt=(function(){
  "use strict";
  var MIN_CONF=40;

  /* ---------- image clean-up ---------- */
  function greyData(ctx,w,h){var d=ctx.getImageData(0,0,w,h),p=d.data,g=new Uint8ClampedArray(w*h);for(var i=0,j=0;j<g.length;i+=4,j++)g[j]=(p[i]*299+p[i+1]*587+p[i+2]*114)/1000;return g}
  /* bright paper area (receipt on a darker table) */
  function paperBox(g,w,h){
    var thr=0,hist=new Array(256).fill(0);for(var i=0;i<g.length;i+=7)hist[g[i]]++;
    var tot=0;for(i=0;i<256;i++)tot+=hist[i];var acc=0,p70=0;for(i=0;i<256;i++){acc+=hist[i];if(acc>=tot*0.7){p70=i;break}}
    thr=Math.max(110,p70-45);
    var colCnt=new Array(w).fill(0),rowCnt=new Array(h).fill(0);
    for(var y=0;y<h;y+=2)for(var x=0;x<w;x+=2)if(g[y*w+x]>=thr){colCnt[x]++;rowCnt[y]++}
    function span(cnt,n,other){var need=other*0.25/2,a=0,b=n-1;while(a<n&&cnt[a]<need)a++;while(b>a&&cnt[b]<need)b--;return [a,b]}
    var xs=span(colCnt,w,h),ys=span(rowCnt,h,w);
    var bw=xs[1]-xs[0],bh=ys[1]-ys[0];
    if(bw<w*0.2||bh<h*0.2)return {x:0,y:0,w:w,h:h};
    var pad=-Math.round(Math.min(w,h)*0.004);
    var x0=Math.max(0,xs[0]-pad),y0=Math.max(0,ys[0]-pad);
    return {x:x0,y:y0,w:Math.min(w-x0,bw+2*pad),h:Math.min(h-y0,bh+2*pad)};
  }
  /* grey, resize to target width, even out shadows (pixel vs. local paper), stretch contrast */
  function prepPaper(src,srcW,srcH,box,target,createCanvas,opts){
    opts=opts||{};
    var scale=target/box.w,w=Math.round(box.w*scale),h=Math.round(box.h*scale);
    var c=createCanvas(w,h),ctx=c.getContext("2d");
    ctx.drawImage(src,box.x,box.y,box.w,box.h,0,0,w,h);
    var g=greyData(ctx,w,h);
    var bs=Math.max(8,Math.round(w/40)),bx=Math.ceil(w/bs),by=Math.ceil(h/bs),bg=new Float32Array(bx*by);
    for(var j=0;j<by;j++)for(var i=0;i<bx;i++){
      var vals=[];for(var y=j*bs;y<Math.min(h,(j+1)*bs);y+=2)for(var x=i*bs;x<Math.min(w,(i+1)*bs);x+=2)vals.push(g[y*w+x]);
      vals.sort(function(a,b){return a-b});bg[j*bx+i]=vals.length?vals[Math.floor(vals.length*0.9)]:255;
    }
    /* smooth the paper level a little (3x3 max then mean) */
    var bg2=new Float32Array(bg.length);
    for(j=0;j<by;j++)for(i=0;i<bx;i++){var s=0,n=0;for(var dj=-1;dj<=1;dj++)for(var di=-1;di<=1;di++){var ii=i+di,jj=j+dj;if(ii>=0&&jj>=0&&ii<bx&&jj<by){s+=bg[jj*bx+ii];n++}}bg2[j*bx+i]=s/n}
    var out=new Uint8ClampedArray(w*h);
    for(y=0;y<h;y++){var fy=Math.min(by-1,Math.max(0,y/bs-0.5)),j0=Math.floor(fy),j1=Math.min(by-1,j0+1),ty=fy-j0;
      for(x=0;x<w;x++){var fx=Math.min(bx-1,Math.max(0,x/bs-0.5)),i0=Math.floor(fx),i1=Math.min(bx-1,i0+1),tx=fx-i0;
        var b=(bg2[j0*bx+i0]*(1-tx)+bg2[j0*bx+i1]*tx)*(1-ty)+(bg2[j1*bx+i0]*(1-tx)+bg2[j1*bx+i1]*tx)*ty;
        var v=g[y*w+x];
        if(b<90){out[y*w+x]=255;continue}            /* table / background around the paper: blank it */
        out[y*w+x]=Math.min(255,Math.round(255*v/Math.max(30,b)));
      }}
    if(opts.stretch!==false){
      var hist=new Array(256).fill(0);for(i=0;i<out.length;i+=3)hist[out[i]]++;var tot=0;for(i=0;i<256;i++)tot+=hist[i];
      var lo=0,hi=255,acc=0;for(i=0;i<256;i++){acc+=hist[i];if(acc>=tot*0.02){lo=i;break}}
      acc=0;for(i=255;i>=0;i--){acc+=hist[i];if(acc>=tot*0.02){hi=i;break}}
      if(hi-lo>40){var k=255/(hi-lo);for(i=0;i<out.length;i++)out[i]=Math.max(0,Math.min(255,(out[i]-lo)*k))}
    }
    var id=ctx.createImageData(w,h),p=id.data;for(i=0,j=0;j<out.length;i+=4,j++){p[i]=p[i+1]=p[i+2]=out[j];p[i+3]=255}
    ctx.putImageData(id,0,0);return c;
  }
  /* ---------- reading ---------- */
  /* rows of words (conf >= minConf). Receipts put labels and amounts far apart on the same row, so
     words are grouped into rows by height after correcting the page tilt (median baseline slope). */
  function readLines(data,minConf){
    minConf=minConf==null?MIN_CONF:minConf;
    var words=[],slopes=[];
    (data.blocks||[]).forEach(function(bl){(bl.paragraphs||[]).forEach(function(pa){(pa.lines||[]).forEach(function(ln){
      var b=ln.baseline;if(b&&b.x1-b.x0>60)slopes.push((b.y1-b.y0)/(b.x1-b.x0));
      (ln.words||[]).forEach(function(w){if(w.confidence>=minConf&&String(w.text).trim())words.push(w)});
    })})});
    slopes.sort(function(a,b){return a-b});var sl=slopes.length?slopes[Math.floor(slopes.length/2)]:0;if(Math.abs(sl)>0.06)sl=0;
    words.forEach(function(w){var cx=(w.bbox.x0+w.bbox.x1)/2;w._y=(w.bbox.y0+w.bbox.y1)/2-sl*cx;w._h=w.bbox.y1-w.bbox.y0});
    words.sort(function(a,b){return a._y-b._y});
    var rows=[];
    words.forEach(function(w){var r=rows[rows.length-1];if(r&&Math.abs(w._y-r.y)<Math.max(6,Math.min(r.h,w._h)*0.55)){r.ws.push(w);r.y=(r.y*(r.ws.length-1)+w._y)/r.ws.length;r.h=Math.max(r.h,w._h)}else rows.push({ws:[w],y:w._y,h:w._h})});
    var out=rows.map(function(r){r.ws.sort(function(a,b){return a.bbox.x0-b.bbox.x0});return {text:r.ws.map(function(w){return w.text}).join(" "),h:r.h,y:r.y,x:r.ws[0].bbox.x0}});
    var hs=out.map(function(l){return l.h}).sort(function(a,b){return a-b});var med=hs.length?hs[Math.floor(hs.length/2)]:0;
    return {text:out.map(function(l){return l.text}).join("\n"),big:out.filter(function(l){return l.h>=med*1.35}).map(function(l){return l.text}),lines:out};
  }

  /* ---------- field rules ---------- */
  var MONTHS={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,sept:9,oct:10,nov:11,dec:12};
  function numFix(s){return String(s).replace(/[0-9OolI|SB$.,:\/\-]{2,}/g,function(t){return /\d/.test(t)?t.replace(/[Oo]/g,"0").replace(/[lI|]/g,"1").replace(/S/g,"5").replace(/B/g,"8"):t})}
  function clean(t){return String(t||"").replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/ /g," ")}
  function pad2(n){return String(n).padStart(2,"0")}
  function iso(y,m,d){if(y<100)y+=2000;if(m<1||m>12||d<1||d>31||y<2000||y>2100)return "";return y+"-"+pad2(m)+"-"+pad2(d)}
  function findDates(line){
    var s=numFix(line),out=[],m,re=/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})(?!\d)/g;
    while((m=re.exec(s)))out.push(iso(+m[3],+m[1],+m[2]));
    re=/(20\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})(?!\d)/g;while((m=re.exec(s)))out.push(iso(+m[1],+m[2],+m[3]));
    re=/\b(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{2,4})/ig;while((m=re.exec(s)))out.push(iso(+m[3],MONTHS[m[1].toLowerCase()],+m[2]));
    re=/\b(\d{1,2})[\s\-]?(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*[\s\-]?(\d{2,4})/ig;while((m=re.exec(s)))out.push(iso(+m[3],MONTHS[m[2].toLowerCase()],+m[1]));
    return out.filter(Boolean);
  }
  function findTime(line){var m=numFix(line).match(/\b(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp])?\.?[Mm]?\b/);if(!m)return "";var h=+m[1],mi=+m[2];if(h>23||mi>59)return "";if(m[3]){var pm=/p/i.test(m[3]);if(h===12)h=pm?12:0;else if(pm)h+=12}return pad2(h)+":"+pad2(mi)}
  var AMT=/(-?)\$?\s?(\d{1,4}(?:,\d{3})*)[.,](\d{2})(?![\d.,]*\d)/g;
  function amounts(line){var s=numFix(line).replace(/(\d)\s+([.,])\s*(\d{2})\b/g,"$1$2$3"),out=[],m;AMT.lastIndex=0;
    if(/\d{3}[\-.\s]\d{3}[\-.\s]\d{4}/.test(s))return out;           /* phone */
    s=s.replace(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g," ").replace(/\b\d{1,2}:\d{2}(:\d{2})?/g," ");
    while((m=AMT.exec(s))){var v=+(m[2].replace(/,/g,"")+"."+m[3]);if(m[1])v=-v;out.push(v)}return out}
  function threeDec(line){var s=numFix(line),out=[],m,re=/(\d{1,3})[.,](\d{3})(?!\d)/g;while((m=re.exec(s)))out.push(+(m[1]+"."+m[2]));return out}
  function titleCase(s){return s.toLowerCase().replace(/\b([a-z])/g,function(c){return c.toUpperCase()}).replace(/\b(Bp|Qt|Usa|Llc|Inc)\b/g,function(x){return x.toUpperCase()}).replace(/'S\b/g,"'s")}
  var BRANDS=["Murphy USA","Murphy Express","Circle K","Shell","Exxon","Mobil","BP","Amoco","Chevron","Texaco","Sheetz","Wawa","QuikTrip","Speedway","Marathon","Sunoco","Citgo","Valero","Phillips 66","Conoco","76","Buc-ee's","Costco","Sam's Club","Kroger","Pilot","Flying J","Love's","Casey's","RaceTrac","Kangaroo","Arco","Gulf","Hess","Sinclair","Holiday","Kwik Trip","Maverik","Royal Farms","Food Lion","Harris Teeter","Walmart","Refuel","GoMart","Mapco","Thorntons","Getty"];
  function norm(s){return String(s).toLowerCase().replace(/[^a-z0-9]/g,"")}
  function lev(a,b){var m=a.length,n=b.length;if(!m)return n;if(!n)return m;var d=[];for(var i=0;i<=m;i++){d[i]=[i]}for(var j=1;j<=n;j++)d[0][j]=j;for(i=1;i<=m;i++)for(j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n]}
  function matchName(line,names){var L=norm(line);if(!L)return "";var best="",bs=0;
    names.forEach(function(n){var N=norm(n);if(!N||N==="other")return;var sc=0;
      if(N.length>=3&&L.indexOf(N)>=0)sc=N.length*2;
      else if(N.length<3&&String(line).toLowerCase().split(/[^a-z0-9]+/).indexOf(N)>=0&&String(line).trim().split(/\s+/).length<=3)sc=N.length*2;
      else if(N.length>=4){var words=String(line).toLowerCase().split(/[^a-z0-9']+/).filter(Boolean);for(var k=0;k<words.length;k++){var w=norm(words.slice(k,k+N.length>6?2:1).join(""));if(w.length>=4&&lev(w,N)<=Math.max(1,Math.floor(N.length/5)))sc=Math.max(sc,N.length)}}
      if(sc>bs){bs=sc;best=n}});return best}
  var NOT_MERCHANT=/(\d{3}[\-.\s]\d{3}[\-.\s]\d{4})|(\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b)|(\$|\d+[.,]\d{2}\b)|\b(receipt|welcome|store|station|tel|phone|www|http|thank|customer|copy|invoice|order|date|time|pump|terminal|tran|auth)\b/i;
  var STREET=/\b\d{1,6}\s+\w+.*\b(st|street|rd|road|ave|avenue|blvd|hwy|highway|dr|drive|ln|lane|pkwy|parkway|ct|way|pl|place|cir|circle|us|nc|sc|va)\b/i;
  var CITYST=/^([A-Za-z .'-]{2,30}),?\s+([A-Z]{2})\s+(\d{5})(?:-\d{4})?$/;
  function merchantFrom(lines,big){
    var cands=lines.slice(0,6).filter(function(l){var t=l.trim();return t.length>=3&&/[A-Za-z]{3}/.test(t)&&!NOT_MERCHANT.test(t)&&!STREET.test(t)&&!CITYST.test(t.toUpperCase())});
    var bigSet={};(big||[]).forEach(function(b){bigSet[b]=1});
    var pick=cands.find(function(c){return bigSet[c]})||cands[0]||"";
    pick=pick.replace(/[^A-Za-z0-9&'.\- ]/g," ").replace(/\s+/g," ").trim();
    if(pick&&pick===pick.toUpperCase())pick=titleCase(pick);
    return pick;
  }
  var TOTAL_LABELS=[[/\b(grand\s*total|amount\s*due|balance\s*due|total\s*due|total\s*sale|fuel\s*total|fuel\s*sale|sale\s*total|purchase|total\s*amount)\b/i,5],[/\btotal\b/i,4],[/\b(amount|sale|amt)\b/i,2]];
  var NOT_TOTAL=/\b(sub\s*-?\s*total|subtotal|tax|tip|gratuity|change|cash\s*tend|tendered|savings|discount|you\s*saved|points|balance\s*remaining|reward)\b/i;
  function labelled(lines,re,pick){for(var i=0;i<lines.length;i++){if(re.test(lines[i])){var a=amounts(lines[i]);if(!a.length&&i+1<lines.length&&!/[A-Za-z]{3}/.test(lines[i+1]))a=amounts(lines[i+1]);if(a.length)return pick==="first"?a[0]:a[a.length-1]}}return null}
  function findTotal(lines){
    var best=null,bestScore=0;
    lines.forEach(function(l,i){if(NOT_TOTAL.test(l))return;for(var k=0;k<TOTAL_LABELS.length;k++){if(TOTAL_LABELS[k][0].test(l)){var a=amounts(l);if(!a.length&&i+1<lines.length&&!/[A-Za-z]{3}/.test(lines[i+1]))a=amounts(lines[i+1]);if(a.length){var sc=TOTAL_LABELS[k][1];if(sc>bestScore||(sc===bestScore&&a[a.length-1]>best)){best=a[a.length-1];bestScore=sc}}break}}});
    if(best!=null)return {v:best,labelled:true};
    var all=[];lines.forEach(function(l){if(/\b(cash|tender|change)\b/i.test(l))return;all=all.concat(amounts(l))});
    if(!all.length)return null;return {v:Math.max.apply(null,all),labelled:false};
  }
  var GAL_LABEL=/\b(gal(lon)?s?|volume|vol|qty|quantity)\b|\bG\b/i, PPG_LABEL=/(price\s*\/?\s*(gal|g)\b|\$\s*\/\s*g|\/\s*gal|\bppg\b|per\s*gal|unit\s*price|\bprice\b|@)/i;
  function findGallons(lines){
    for(var i=0;i<lines.length;i++){var s=numFix(lines[i]);
      var m=s.match(/(\d{1,3}[.,]\d{3})\s*(?:gal(?:lon)?s?\b|g\b)/i);if(m)return +m[1].replace(",",".");
      if(/\b(gal(lon)?s?|volume|vol)\b/i.test(s)&&!/price|\/\s*gal|per/i.test(s)){var t=threeDec(s);if(t.length)return t[0];var m2=s.match(/(\d{1,3}[.,]\d{1,2})\b/);if(m2)return +m2[1].replace(",",".")}
    }return null}
  function findPPG(lines){
    for(var i=0;i<lines.length;i++){var s=numFix(lines[i]);
      var m=s.match(/\$?\s?(\d[.,]\d{2,3})\s*\/\s*(?:gal|g)\b/i);if(m)return +m[1].replace(",",".");
      if(PPG_LABEL.test(s)){var t=threeDec(s).filter(function(v){return v>0.5&&v<15});if(t.length)return t[0];var a=amounts(s).filter(function(v){return v>0.5&&v<15});if(a.length)return a[0]}
    }return null}
  var GRADES=[[/\b(e-?0|ethanol\s*free|non\s*-?\s*ethanol|rec(reational)?\s*90|pure\s*gas|clear)\b/i,"90",true],[/\b(diesel|dsl)\b/i,"Diesel",false],[/\b(premium|super|prem|supreme|v-?power|ultimate|synergy\s*supreme)\b/i,"93",false],[/\b(plus|mid\s*-?\s*grade|midgrade|special|silver)\b/i,"89",false],[/\b(unleaded|unl|regular|reg|unld)\b/i,"87",false]];
  function findGrade(lines){
    for(var li=0;li<lines.length;li++){var ln=lines[li];if(/\b(thank|have a|welcome|stopping)\b/i.test(ln))continue;
      for(var k=0;k<GRADES.length;k++){if(GRADES[k][0].test(ln)){var g=GRADES[k][1];var o=ln.match(/\b(8[5-9]|9[0-4])\b/);if(o&&g!=="Diesel")g=o[1];return {grade:g,ethanolFree:GRADES[k][2]}}}
      var oc=ln.match(/\b(8[5-9]|9[0-4])\s*(octane|oct)\b/i);if(oc)return {grade:oc[1],ethanolFree:false};
    }
    return null;
  }
  function findGradeOld(lines){
    var all=lines.join("\n");
    var oct=all.match(/\b(8[5-9]|9[0-4])\s*(octane|oct\b)/i)||all.match(/\b(octane|oct)\s*:?\s*(8[5-9]|9[0-4])\b/i);
    for(var k=0;k<GRADES.length;k++){if(GRADES[k][0].test(all)){var g=GRADES[k][1];var o=all.match(new RegExp(GRADES[k][0].source+"\\D{0,6}(8[5-9]|9[0-4])\\b","i"));if(o&&g!=="Diesel")g=o[o.length-1];else if(oct)g=oct[1].length===2&&/\d/.test(oct[1])?oct[1]:oct[2];return {grade:g,ethanolFree:GRADES[k][2]}}}
    if(oct)return {grade:/\d/.test(oct[1])?oct[1]:oct[2],ethanolFree:false};return null}
  function findOdometer(lines){for(var i=0;i<lines.length;i++){var s=numFix(lines[i]);if(/\b(odometer|odom|mileage|miles\s*in|mi\s*in|odo)\b/i.test(s)){var m=s.match(/\b(\d{1,3}(?:[,. ]\d{3})+|\d{3,7})(?![\d])/);if(m)return +m[1].replace(/[,. ]/g,"")}}return null}
  var MAINT_CATS=[[/\b(oil\s*change|lube|lof|oil\s*&?\s*filter|synthetic\s*oil)\b/i,"Oil Change"],[/\b(tire\s*rotation|rotate\s*tires?)\b/i,"Tire Rotation"],[/\b(brake|pads?|rotors?)\b/i,"Brakes"],[/\b(inspection|emissions|safety\s*insp)\b/i,"Inspection"],[/\b(coolant|radiator|thermostat|water\s*pump)\b/i,"Cooling System"],[/\b(battery|alternator|starter)\b/i,"Electrical"],[/\b(transmission|trans\s*fluid)\b/i,"Transmission"],[/\b(detail|car\s*wash|wash)\b/i,"Detailing"]];

  /* amount variants: a "$" read as 3/5/8/S adds a leading digit ("$34.29" -> "534.29") */
  function variants(v){var out=[v],s=v.toFixed(2);if(/^[3589]\d{2,}\./.test(s))out.push(+s.slice(1));return out}
  function allNums(lines,re,lo,hi){var out=[];lines.forEach(function(l){var s=numFix(l),m;re.lastIndex=0;while((m=re.exec(s))){var v=+(m[1]+"."+m[2]);if(v>=lo&&v<=hi)out.push(v)}});return out}
  /* fuel: find gallons x price/gal = total among everything read */
  function fuelTriple(lines,total){
    var G=allNums(lines,/(\d{1,2})[.,](\d{3})(?!\d)/g,0.5,60),P=allNums(lines,/(\d)[.,](\d{3})(?!\d)/g,1.2,9.99).concat(allNums(lines,/(\d)[.,](\d{2})(?:\d)?\s*\/\s*g/gi,1.2,9.99));
    var T=[];lines.forEach(function(l){amounts(l).forEach(function(a){variants(a).forEach(function(v){if(v>0.5&&v<500)T.push(v)})})});
    var best=null;
    G.forEach(function(g){P.forEach(function(p){if(g===p)return;var t=Math.round(g*p*100)/100;
      T.forEach(function(x){if(Math.abs(x-t)<=0.011){var n=T.filter(function(y){return Math.abs(y-x)<0.005}).length;if(!best||n>best.n)best={g:g,p:p,t:x,n:n}}})})});
    return best;
  }
  /* total by vote: labelled total lines and card-payment lines, with $-misread variants */
  function totalVote(lines){
    var votes={};function add(v,w){var k=v.toFixed(2);votes[k]=(votes[k]||0)+w}
    lines.forEach(function(l,i){if(NOT_TOTAL.test(l))return;var w=0;
      if(TOTAL_LABELS[0][0].test(l))w=3;else if(TOTAL_LABELS[1][0].test(l))w=2.5;else if(/\b(visa|master\s*card|mastercard|mc|amex|american\s*express|discover|debit|credit|card)\b/i.test(l))w=1.5;else if(TOTAL_LABELS[2][0].test(l))w=1;
      if(!w)return;var a=amounts(l);if(!a.length&&i+1<lines.length&&!/[A-Za-z]{3}/.test(lines[i+1]))a=amounts(lines[i+1]);if(!a.length)return;
      var v=a[a.length-1];var vs=variants(v);add(vs[0],w);if(vs[1]!=null)add(vs[1],w*0.6)});
    var keys=Object.keys(votes);if(!keys.length)return null;
    keys.sort(function(a,b){return votes[b]-votes[a]||(+a)-(+b)});
    return {v:+keys[0],score:votes[keys[0]],runner:keys[1]?votes[keys[1]]:0};
  }
  function pickDate(lines,now){
    var today=(now||new Date());var max=new Date(today.getTime()+36e5*24).toISOString().slice(0,10);
    var lab=null,first=null;
    lines.forEach(function(l){var ds=findDates(l).filter(function(d){return d<=max});if(!ds.length)return;if(!first)first=ds[0];if(!lab&&/\bdate\b/i.test(l))lab=ds[0]});
    return lab?{v:lab,c:"High"}:first?{v:first,c:"Check"}:null;
  }
  function vote(a,b){return a!=null&&b!=null&&Math.abs(a-b)<0.0005}
  function parse(texts,bigs,kind,ctx){
    ctx=ctx||{};
    var passes=texts.map(function(t){return clean(t).split(/\n+/).map(function(l){return l.trim()}).filter(Boolean)});
    var all=[].concat.apply([],passes),big=[].concat.apply([],bigs||[]);
    var F={},C={};
    function each(fn){return passes.map(function(p){return fn(p)})}
    function agree(vals){var v=vals.filter(function(x){return x!=null});if(!v.length)return null;for(var i=0;i<v.length;i++)for(var j=i+1;j<v.length;j++)if(vote(v[i],v[j]))return {v:v[i],agree:true};return {v:v[0],agree:false}}
    var d=null;passes.some(function(p){d=pickDate(p,ctx.now);return d&&d.c==="High"});if(!d)d=pickDate(all,ctx.now);
    if(d){F.date=d.v;C.date=d.c}
    var tm="";all.some(function(l){tm=findTime(l);return !!tm});if(tm){F.time=tm;C.time="Check"}
    var tv=totalVote(all);
    if(tv){F.total=tv.v;C.total=tv.score>=4&&tv.score>=tv.runner*2?"High":"Check"}
    else{var ft=findTotal(all);if(ft){F.total=ft.v;C.total="Check"}}
    var names=(ctx.names||[]).concat(kind==="fuel"?BRANDS:[]);
    var brand="";for(var i=0;i<Math.min(all.length,40)&&!brand;i++)brand=matchName(all[i],names);
    var merch=merchantFrom(passes[0]||[],big);
    if(kind==="fuel"){
      if(brand){F.station=brand;C.station="Check"}else if(merch){F.station=merch;C.station="Check"}
      var tri=fuelTriple(all,F.total);
      if(tri){F.gallons=tri.g;F.pricePerGallon=tri.p;F.total=tri.t;C.gallons=C.pricePerGallon=C.total="High"}
      var ga=tri?null:agree(each(findGallons)),pa=tri?null:agree(each(findPPG));
      if(ga){F.gallons=ga.v;C.gallons=ga.agree?"High":"Check"}
      if(pa){F.pricePerGallon=pa.v;C.pricePerGallon=pa.agree?"High":"Check"}
      var g=findGrade(all);if(g){F.fuelGrade=g.grade;C.fuelGrade="Check";if(g.ethanolFree){F.ethanolFree="Yes";C.ethanolFree="Check"}}
      if(tri){}
      else if(F.gallons!=null&&F.pricePerGallon!=null&&F.total!=null){
        if(Math.abs(F.gallons*F.pricePerGallon-F.total)<=0.02+F.total*0.002){C.gallons=C.pricePerGallon=C.total="High"}
        else{C.total=C.total==="High"?"High":"Check";C.gallons="Check";C.pricePerGallon="Check"}
      }else if(F.gallons!=null&&F.total!=null&&F.pricePerGallon==null){F.pricePerGallon=Math.round(F.total/F.gallons*1000)/1000;C.pricePerGallon="Check"}
      else if(F.pricePerGallon!=null&&F.total!=null&&F.gallons==null){F.gallons=Math.round(F.total/F.pricePerGallon*1000)/1000;C.gallons="Check"}
    }else{
      if(brand){F.provider=brand;C.provider="Check"}else if(merch){F.provider=merch;C.provider="Check"}
      var sub=labelled(all,/\b(sub\s*-?\s*total)\b/i),tax=labelled(all,/\b(sales\s*tax|tax)\b/i);
      if(sub!=null&&tax!=null){var st=Math.round((sub+tax)*100)/100;
        if(F.total!=null&&Math.abs(st-F.total)<0.011)C.total="High";
        else{var hit=null;all.forEach(function(l){amounts(l).forEach(function(a){variants(a).forEach(function(v){if(Math.abs(v-st)<0.011)hit=v})})});if(hit!=null){F.total=hit;C.total="High"}}}
      var od=findOdometer(all);if(od!=null){F.odometer=od;C.odometer="Check"}
      var body=[].concat.apply([],passes.map(function(p){return p.slice(3)})).filter(function(l){return !/\b(thank|invoice|mileage|subtotal|tax|total|visa)\b/i.test(l)});
      outer:for(var bi=0;bi<body.length;bi++)for(var k=0;k<MAINT_CATS.length;k++)if(MAINT_CATS[k][0].test(body[bi])){F.category=MAINT_CATS[k][1];C.category="Check";break outer}
      var cs=all.map(function(l){return l.toUpperCase().match(CITYST)}).filter(Boolean)[0];if(cs){F.city=titleCase(cs[1].trim())+", "+cs[2];C.city="Check"}
    }
    return {fields:F,conf:C};
  }
  return {MIN_CONF:MIN_CONF,greyData:greyData,paperBox:paperBox,prepPaper:prepPaper,readLines:readLines,parse:parse,_amounts:amounts,_findDates:findDates,_matchName:matchName,BRANDS:BRANDS};
})();
if(typeof module!=="undefined")module.exports=RGBMReceipt;
/*RGBM_RECEIPT_END*/
const RECEIPT_TESS={js:"https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js",worker:"https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js",core:"https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1",lang:"https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/4.0.0_best_int"};
const RECEIPT_WIDTHS=[1000,700];
const RECEIPT_FIELDS={
  fuel:[["date","Date"],["time","Time"],["station","Station"],["fuelGrade","Fuel Grade"],["ethanolFree","Ethanol Free"],["gallons","Gallons"],["pricePerGallon","Price/Gal"],["total","Total Cost"]],
  maintenance:[["date","Date"],["provider","Provider"],["category","Category"],["odometer","Odometer"],["total","Cost"]]
};
let receiptWorkerP=null;
const RECEIPT={kind:"",vid:"",texts:[],bigs:[],result:null,showAll:false};
/* One button, two actions: tap = camera, press and hold (0.5 s) = photos.
   Touch: touchstart is cancelled so the phone does not start its own long-press (text selection, callout, pointercancel);
   the picker opens on touchend, which phones count as a tap. Mouse: mousedown/mouseup. Keyboard: click = camera. */
const RC_HOLD_MS=500;
function pressButton(label,act,extra){return `<button class="receipt-btn${act==="doc"?" doc-btn":""}" type="button" data-act="${act}" ${extra||""} ontouchstart="pbTouchStart(event,this)" ontouchmove="pbTouchMove(event,this)" ontouchend="pbTouchEnd(event,this)" ontouchcancel="pbCancel(this)" onmousedown="pbMouseDown(event,this)" onmouseup="pbMouseUp(event,this)" onmouseleave="pbCancel(this)" oncontextmenu="return false" onclick="pbClick(event,this)">${label}</button>`}
function receiptButton(kind,append,label){return pressButton(label||"Read Receipt","receipt",`data-rc-kind="${kind}" data-rc-append="${append?"true":"false"}"`)}
function pbBegin(btn){btn._rcDown=Date.now();btn._rcLabel=btn._rcLabel||btn.textContent;clearTimeout(btn._rcT);btn._rcT=setTimeout(()=>{btn.classList.add("rc-hold");btn.textContent="Release for Photos";try{navigator.vibrate&&navigator.vibrate(15)}catch(e){}},RC_HOLD_MS)}
function pbCancel(btn){clearTimeout(btn._rcT);if(btn._rcLabel)btn.textContent=btn._rcLabel;btn.classList.remove("rc-hold");btn._rcDown=0}
function pbFinish(btn){if(!btn._rcDown)return;const held=Date.now()-btn._rcDown;pbCancel(btn);btn._rcHandled=Date.now();pbFire(btn,held>=RC_HOLD_MS?"library":"camera")}
function pbFire(btn,src){if(btn.dataset.act==="doc")return docStart(src);receiptStart(btn.dataset.rcKind==="_"?RECEIPT.kind:btn.dataset.rcKind,btn.dataset.rcAppend==="true",src)}
function pbTouchStart(ev,btn){if(ev.touches&&ev.touches.length>1)return;ev.preventDefault();const t=ev.touches[0];btn._rcX=t.clientX;btn._rcY=t.clientY;pbBegin(btn)}
function pbTouchMove(ev,btn){const t=ev.touches&&ev.touches[0];if(t&&btn._rcDown&&Math.hypot(t.clientX-btn._rcX,t.clientY-btn._rcY)>24)pbCancel(btn)}
function pbTouchEnd(ev,btn){ev.preventDefault();pbFinish(btn)}
function pbMouseDown(ev,btn){if(ev.button!==0)return;pbBegin(btn)}
function pbMouseUp(ev,btn){pbFinish(btn)}
function pbClick(ev,btn){if(btn._rcHandled&&Date.now()-btn._rcHandled<1500)return;pbFire(btn,"camera")}
/* kept for older callers */
function receiptPressStart(ev,btn){pbBegin(btn)}function receiptPressCancel(btn){pbCancel(btn)}function receiptPressEnd(ev,btn){pbFinish(btn)}function receiptPressClick(ev,btn){pbClick(ev,btn)}
function receiptLoadScript(src){return new Promise((res,rej)=>{if(window.Tesseract)return res();const el=document.createElement("script");el.src=src;el.async=true;el.onload=()=>res();el.onerror=()=>rej(new Error("The receipt reader could not be downloaded. Check your internet connection and try again."));document.head.appendChild(el)})}
function receiptWorker(){
  if(!receiptWorkerP)receiptWorkerP=(async()=>{
    await receiptLoadScript(RECEIPT_TESS.js);
    const w=await Tesseract.createWorker("eng",1,{workerPath:RECEIPT_TESS.worker,corePath:RECEIPT_TESS.core,langPath:RECEIPT_TESS.lang});
    await w.setParameters({tessedit_pageseg_mode:"6",preserve_interword_spaces:"1"});
    return w;
  })().catch(e=>{receiptWorkerP=null;throw e});
  return receiptWorkerP;
}
function receiptStart(kind,append,src){
  RECEIPT.kind=kind;RECEIPT.vid=route.vehicleId||"";
  if(!append){RECEIPT.texts=[];RECEIPT.bigs=[];RECEIPT.result=null;RECEIPT.showAll=false}
  let inp=$("receiptFile");
  if(!inp){inp=document.createElement("input");inp.type="file";inp.accept="image/*";inp.id="receiptFile";inp.style.display="none";document.body.appendChild(inp)}
  if(src==="camera")inp.setAttribute("capture","environment");else inp.removeAttribute("capture");   /* camera opens the camera; library opens the photo picker */
  inp.value="";inp.onchange=()=>{const f=inp.files&&inp.files[0];inp.onchange=null;if(f)receiptRead(f)};
  inp.click();
}
function receiptCanvas(w,h){const c=document.createElement("canvas");c.width=w;c.height=h;return c}
async function receiptImage(file){
  if(window.createImageBitmap){try{return await createImageBitmap(file)}catch(e){}}
  const url=URL.createObjectURL(file);
  try{return await new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(new Error("That picture could not be opened."));im.src=url})}
  finally{setTimeout(()=>URL.revokeObjectURL(url),1000)}
}
function receiptRead(file){
  cropOpen(file,{title:"Crop Receipt",hint:"Frame just the receipt. Crop out anything confusing (other papers, the table, a hand). Drag the corners or edges; drag inside to move.",save:"Read Receipt",onSave:c=>receiptReadCanvas(c)});
}
async function receiptReadCanvas(c0){
  receiptSheet(`<h2>Reading Receipt…</h2><p class="muted">This takes a few seconds. The first time, the reader (about 5 MB) is downloaded.</p><p id="receiptProgress" class="small muted"></p><button class="wide ghost" type="button" onclick="receiptClose()">Cancel</button>`);
  try{
    const prog=t=>{const el=$("receiptProgress");if(el)el.textContent=t};
    prog("Getting the reader ready…");
    const worker=await receiptWorker();
    prog("Cleaning up the picture…");
    const g=RGBMReceipt.greyData(c0.getContext("2d"),c0.width,c0.height),box=RGBMReceipt.paperBox(g,c0.width,c0.height);
    let n=0;
    for(const W of RECEIPT_WIDTHS){
      n++;prog(`Reading (${n} of ${RECEIPT_WIDTHS.length})…`);
      const c=RGBMReceipt.prepPaper(c0,c0.width,c0.height,box,W,receiptCanvas,{});
      const r=await worker.recognize(c,{},{blocks:true});
      const rl=RGBMReceipt.readLines(r.data);RECEIPT.texts.push(rl.text);RECEIPT.bigs.push(rl.big);
      c.width=c.height=0;
    }
    c0.width=c0.height=0;
    if(!$("receiptSheet"))return;   /* cancelled */
    receiptParse();receiptReview();
  }catch(e){console.error(e);receiptSheet(`<h2>Receipt Not Read</h2><p>${esc(String(e&&e.message||e))}</p><p class="small muted">Tap to take a photo; press and hold to choose one from your photos.</p>${receiptButton("_",false,"Try Again")}<button class="wide ghost" type="button" onclick="receiptClose()">Close</button>`)}
}
function receiptNames(kind){try{return kind==="fuel"?activeList("stations"):maintPickList("maintenanceProviders")}catch(e){return []}}
function receiptParse(){RECEIPT.result=RGBMReceipt.parse(RECEIPT.texts,RECEIPT.bigs,RECEIPT.kind,{names:receiptNames(RECEIPT.kind)})}
function receiptFmt(key,v){if(v==null||v==="")return "";if(key==="gallons"||key==="pricePerGallon")return (+v).toFixed(3);if(key==="total")return (+v).toFixed(2);return String(v)}
function receiptReview(){
  const res=RECEIPT.result||{fields:{},conf:{}},defs=RECEIPT_FIELDS[RECEIPT.kind];
  const filled=defs.filter(d=>res.fields[d[0]]!=null&&res.fields[d[0]]!=="");
  const shown=RECEIPT.showAll?defs:filled,hidden=defs.length-filled.length;
  const rows=shown.map(d=>{const v=receiptFmt(d[0],res.fields[d[0]]),c=res.conf[d[0]];const mark=v?(c==="High"?`<span class="rc-mark rc-read">read</span>`:`<span class="rc-mark rc-check">check this</span>`):"";
    const type=d[0]==="date"?"date":d[0]==="time"?"time":"text";
    return `<label class="rc-field">${esc(d[1])} ${mark}<input id="rc_${d[0]}" type="${type}" value="${esc(v)}" ${["gallons","pricePerGallon","total","odometer"].includes(d[0])?'inputmode="decimal"':""}></label>`}).join("");
  const none=!filled.length?`<p class="cloud-notice">Nothing could be filled in from this picture. Try again with the receipt flat, well lit, and filling the screen, or type the values.</p>`:"";
  receiptSheet(`<h2>Receipt Read</h2><p class="muted small">Check each value. Nothing is saved until you tap Save on the entry screen. The picture was not kept.</p>${none}<div class="rc-grid">${rows}</div>${hidden&&!RECEIPT.showAll?`<button class="wide ghost" type="button" onclick="RECEIPT.showAll=true;receiptReview()">Show All Fields (${hidden} hidden)</button>`:""}<details class="rc-text"><summary>Text read</summary><textarea id="rcText" rows="8">${esc(RECEIPT.texts.join("\n"))}</textarea><button class="wide ghost" type="button" onclick="receiptRefill()">Fill In Again</button></details><button class="wide primary" type="button" onclick="receiptUse()">Use These</button>${receiptButton("_",true,"Add Another Part")}<button class="wide ghost" type="button" onclick="receiptClose()">Cancel</button>`);
}
function receiptRefill(){const t=($("rcText")||{}).value||"";RECEIPT.texts=[t];RECEIPT.bigs=[[]];receiptParse();receiptReview()}
function receiptSheet(html){let o=$("receiptSheet");if(!o){o=document.createElement("div");o.id="receiptSheet";o.className="receipt-modal";document.body.appendChild(o)}o.innerHTML=`<div class="receipt-box">${html}</div>`}
function receiptClose(){const o=$("receiptSheet");if(o)o.remove()}
function receiptSetSelect(id,val){const sel=$(id);if(!sel||!val)return false;const o=[...sel.options].find(x=>x.value.toLowerCase()===String(val).toLowerCase()||x.text.toLowerCase()===String(val).toLowerCase());if(o){sel.value=o.value;sel.setAttribute("data-prev",o.value)}else selectValueWithOption(sel,val);return true}
function receiptMark(id,check){const el=$(id);if(!el)return;const lab=el.closest("label");if(lab){lab.classList.toggle("rc-check-field",!!check);el.addEventListener("input",()=>lab.classList.remove("rc-check-field"),{once:true});el.addEventListener("change",()=>lab.classList.remove("rc-check-field"),{once:true})}}
function receiptUse(){
  const res=RECEIPT.result||{conf:{}},defs=RECEIPT_FIELDS[RECEIPT.kind],v={};
  defs.forEach(d=>{const el=$("rc_"+d[0]);v[d[0]]=el?cleanText(el.value):receiptFmt(d[0],(res.fields||{})[d[0]])});
  const chk=k=>res.conf[k]!=="High";
  const setv=(id,val,key)=>{const el=$(id);if(el&&val!==""&&val!=null){el.value=val;receiptMark(id,chk(key))}};
  if(RECEIPT.kind==="fuel"){
    setv("fdate",v.date,"date");setv("ftime",v.time,"time");
    const g=numVal(v.gallons),p=numVal(v.pricePerGallon),t=numVal(v.total);
    if(g!=="")setv("fgal",(+g).toFixed(3),"gallons");
    if(p!==""){setv("fprice",(+p).toFixed(3),"pricePerGallon");const el=$("fprice");if(el){el.dataset.source="Entered";el.dataset.originalValue=el.value}}
    if(t!==""){setv("fcost",(+t).toFixed(2),"total");const el=$("fcost");if(el){el.dataset.source="Entered";el.dataset.originalValue=el.value}const cs=$("fcostsource");if(cs)cs.value="Entered"}
    if(v.fuelGrade&&receiptSetSelect("fgrade",v.fuelGrade))receiptMark("fgrade",chk("fuelGrade"));
    if(v.ethanolFree&&receiptSetSelect("fef",v.ethanolFree))receiptMark("fef",chk("ethanolFree"));
    if(v.station&&receiptSetSelect("fstation",v.station))receiptMark("fstation",chk("station"));
    const m=numVal($("fmiles")?.value),gg=numVal($("fgal")?.value);if($("fmpg"))$("fmpg").value=(m!==""&&gg>0)?(m/gg).toFixed(3):"";
  }else{
    setv("mdrop",v.date,"date");
    if(numVal(v.odometer)!=="")setv("modo",String(numVal(v.odometer)),"odometer");
    if(numVal(v.total)!=="")setv("mcost",(+numVal(v.total)).toFixed(2),"total");
    if(v.provider&&receiptSetSelect("mprov",v.provider))receiptMark("mprov",chk("provider"));
    if(v.category){const sel=$("mcat");if(sel&&[...sel.options].some(o=>o.value.toLowerCase()===v.category.toLowerCase())){receiptSetSelect("mcat",v.category);receiptMark("mcat",chk("category"))}}
  }
  receiptClose();RECEIPT.texts=[];RECEIPT.bigs=[];
}

/* ===== F29 RC11: Insurance documents to Google Drive (only a link is kept in the app) ===== */
/* Google sign-in setup for the app (filled in once by the administrator). Each RGBM user connects their OWN Google account. */
const DRIVE_CONFIG=Object.freeze(Object.assign({clientId:"174154543708-mdpe2dokdjkpj2cjm5pdoelt5fjffl7o.apps.googleusercontent.com",apiKey:"AIzaSyD188Ey75acX6S30T0ZvxtHJ-A1wmuX2l4",appId:"174154543708"},(typeof window!=="undefined"&&window.__RGBM_DRIVE_CONFIG__)||{}));
const DRIVE_SCOPE="https://www.googleapis.com/auth/drive.file";
const DRIVE_FOLDER_MIME="application/vnd.google-apps.folder";
const DOC={pending:[],busy:false,tokenClient:null};
function driveReady(){return !!(DRIVE_CONFIG.clientId&&DRIVE_CONFIG.apiKey&&DRIVE_CONFIG.appId)}
function driveUserKey(){const s=(typeof cloudSession==="function")&&cloudSession();return "RGBM_DRIVE_TOKEN_"+((s&&s.user&&s.user.id)||"local")}
function driveSettings(){if(!state.driveDocs||typeof state.driveDocs!=="object")state.driveDocs={mode:"subfolders",parent:null,vehicles:{},sub:{},account:""};const d=state.driveDocs;d.vehicles=d.vehicles||{};d.sub=d.sub||{};d.mode=d.mode==="perVehicle"?"perVehicle":"subfolders";return d}
function driveToken(){try{const t=JSON.parse(localStorage.getItem(driveUserKey())||"null");return t&&t.access_token&&t.expires_at-Date.now()>120000?t.access_token:""}catch(e){return ""}}
function driveSaveToken(r){try{localStorage.setItem(driveUserKey(),JSON.stringify({access_token:r.access_token,expires_at:Date.now()+((+r.expires_in||3600)*1000)}))}catch(e){}}
function driveForget(){try{localStorage.removeItem(driveUserKey())}catch(e){}}
function driveLoadScript(src,test){return new Promise((res,rej)=>{if(test())return res();const el=document.createElement("script");el.src=src;el.async=true;el.onload=()=>res();el.onerror=()=>rej(new Error("Google could not be reached. Check your internet connection."));document.head.appendChild(el)})}
async function driveLoadGis(){await driveLoadScript("https://accounts.google.com/gsi/client",()=>window.google&&google.accounts&&google.accounts.oauth2)}
async function driveLoadPicker(){await driveLoadScript("https://apis.google.com/js/api.js",()=>window.gapi);if(!(window.google&&google.picker))await new Promise((res,rej)=>gapi.load("picker",{callback:res,onerror:()=>rej(new Error("The Google folder picker could not load."))}))}
/* Must be called straight from a tap: Google shows its own sign-in / permission window. */
function driveConnect(then,switchAccount){
  if(!driveReady())return driveNotReady();
  const go=()=>{
    if(!DOC.tokenClient)DOC.tokenClient=google.accounts.oauth2.initTokenClient({client_id:DRIVE_CONFIG.clientId,scope:DRIVE_SCOPE,callback:()=>{}});
    DOC.tokenClient.callback=async r=>{if(r&&r.access_token){driveSaveToken(r);try{const a=await driveApi("about?fields=user(emailAddress)");const d=driveSettings();if(a&&a.user&&a.user.emailAddress&&d.account!==a.user.emailAddress){d.account=a.user.emailAddress;saveData()}}catch(e){}if(then)then();else renderRoute()}else alert("Google did not connect.")};
    DOC.tokenClient.error_callback=e=>{if(e&&e.type!=="popup_closed")alert("Google did not connect: "+(e.message||e.type||"unknown"))};
    const d=driveSettings();DOC.tokenClient.requestAccessToken(switchAccount?{prompt:"select_account consent"}:{prompt:d.account?"":"consent",login_hint:d.account||undefined});
  };
  if(window.google&&google.accounts&&google.accounts.oauth2)go();else driveLoadGis().then(()=>alert("Google is ready. Tap the button again.")).catch(e=>alert(e.message));
}
function driveNotReady(){alert("Google Drive isn't set up for this app yet. Ask the app administrator.");return false}
async function driveApi(path,opts={}){
  const tok=driveToken();if(!tok){const e=new Error("Google sign-in expired. Tap the button again to reconnect.");e.reauth=true;throw e}
  const res=await fetch((opts.upload?"https://www.googleapis.com/upload/drive/v3/":"https://www.googleapis.com/drive/v3/")+path,{method:opts.method||"GET",headers:Object.assign({Authorization:"Bearer "+tok},opts.headers||{}),body:opts.body});
  if(res.status===401){driveForget();const e=new Error("Google sign-in expired. Tap the button again to reconnect.");e.reauth=true;throw e}
  let data=null;try{data=await res.json()}catch(e){}
  if(!res.ok){const m=data&&data.error&&data.error.message||("HTTP "+res.status);const e=new Error(res.status===404?"The Drive folder can't be found. Choose it again in Settings → Insurance Documents.":"Google Drive: "+m);e.status=res.status;throw e}
  return data;
}
function drivePickFolder(target){
  if(!driveReady())return driveNotReady();
  if(!driveToken())return driveConnect(()=>drivePickFolder(target));
  driveLoadPicker().then(()=>{
    const view=new google.picker.DocsView(google.picker.ViewId.FOLDERS).setIncludeFolders(true).setSelectFolderEnabled(true).setMimeTypes(DRIVE_FOLDER_MIME);
    new google.picker.PickerBuilder().addView(view).setTitle(target==="parent"?"Choose the insurance folder":"Choose the folder for "+vehicleLabel(getVehicle(target))).setOAuthToken(driveToken()).setDeveloperKey(DRIVE_CONFIG.apiKey).setAppId(DRIVE_CONFIG.appId)
      .setCallback(data=>{if(data.action!==google.picker.Action.PICKED)return;const f=data.docs&&data.docs[0];if(!f)return;drivePicked(target,{id:f.id,name:f.name})}).build().setVisible(true);
  }).catch(e=>alert(e.message));
}
function drivePicked(target,f){const d=driveSettings();if(target==="parent"){d.parent=f;d.sub={}}else d.vehicles[target]=f;saveData();renderRoute()}
function driveSetMode(m){const d=driveSettings();d.mode=m==="perVehicle"?"perVehicle":"subfolders";saveData();renderRoute()}
function driveClearFolder(target){const d=driveSettings();if(target==="parent"){d.parent=null;d.sub={}}else delete d.vehicles[target];saveData();renderRoute()}
async function driveFolderFor(vid){
  const d=driveSettings();
  if(d.mode==="perVehicle"){const f=d.vehicles[vid];if(!f)throw new Error("No Drive folder is set for "+vehicleLabel(getVehicle(vid))+". Set it in Settings → Insurance Documents.");return f.id}
  if(!d.parent)throw new Error("No Drive folder is set. Choose one in Settings → Insurance Documents.");
  if(d.sub[vid])return d.sub[vid].id;
  const name=driveSafeName(vehicleLabel(getVehicle(vid)));
  const q=encodeURIComponent(`'${d.parent.id}' in parents and name='${name.replace(/'/g,"\\'")}' and mimeType='${DRIVE_FOLDER_MIME}' and trashed=false`);
  const found=await driveApi(`files?q=${q}&fields=files(id,name)&spaces=drive`);
  let f=found&&found.files&&found.files[0];
  if(!f)f=await driveApi("files?fields=id,name",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,mimeType:DRIVE_FOLDER_MIME,parents:[d.parent.id]})});
  d.sub[vid]={id:f.id,name:f.name};saveData();return f.id;
}
function driveSafeName(s){return String(s||"Vehicle").replace(/[\\/:*?"<>|]+/g," ").replace(/\s+/g," ").trim().slice(0,100)||"Vehicle"}
function driveFolderLabel(vid){const d=driveSettings();if(d.mode==="perVehicle"){const f=d.vehicles[vid];return f?f.name:""}if(!d.parent)return "";return d.parent.name+" / "+(d.sub[vid]?d.sub[vid].name:driveSafeName(vehicleLabel(getVehicle(vid))))}
async function docJpeg(file){
  const img=await receiptImage(file);const iw=img.width||img.naturalWidth,ih=img.height||img.naturalHeight;const k=Math.min(1,2400/Math.max(iw,ih));
  const c=receiptCanvas(Math.round(iw*k),Math.round(ih*k));const ctx=c.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);if(img.close)try{img.close()}catch(e){}
  const blob=await new Promise(r=>c.toBlob(r,"image/jpeg",0.85));c.width=c.height=0;if(!blob)throw new Error("That picture could not be prepared.");return blob;
}
/* Scan Document button: tap = camera, press and hold = photos/files. Same press handling as Read Receipt. */
function docButton(){return pressButton("Scan Document","doc")}
function docStart(src){
  if(!driveReady())return driveNotReady();
  const vid=route.vehicleId;
  if(!driveToken())return driveConnect(()=>docSheet(`<h2>Google Connected</h2><p>Now choose how to add the document.</p>${docPickButtons()}<button class="wide ghost" type="button" onclick="receiptClose()">Cancel</button>`));
  if(!driveFolderLabel(vid)){alert("Choose where documents go first: Settings → Insurance Documents.");return}
  let inp=$("docFile");
  if(!inp){inp=document.createElement("input");inp.type="file";inp.id="docFile";inp.style.display="none";document.body.appendChild(inp)}
  inp.accept="image/*";if(src==="camera")inp.setAttribute("capture","environment");else inp.removeAttribute("capture");
  inp.value="";inp.onchange=()=>{const f=inp.files&&inp.files[0];inp.onchange=null;if(f)docCrop(f,vid)};inp.click();
}
function docPickButtons(){return `<button class="wide primary" type="button" onclick="docStart('camera')">Take Photo</button><button class="wide" type="button" onclick="docStart('library')">Choose From Phone</button>`}
function docSheet(html){receiptSheet(html)}
async function docUpload(file,vid){return docSend(await docJpeg(file),vid)}
async function docSend(blob,vid){
  docSheet(`<h2>Saving to Google Drive…</h2><p class="muted">The document is sent to your Drive folder. Only a link is kept in the app.</p><p id="docProgress" class="small muted">Preparing the picture…</p>`);
  const prog=t=>{const el=$("docProgress");if(el)el.textContent=t};
  try{
    prog("Finding the folder…");const folderId=await driveFolderFor(vid);
    const v=getVehicle(vid),stamp=new Date(),pad=n=>String(n).padStart(2,"0");
    const name=driveSafeName(`${vehicleLabel(v)} Insurance ${stamp.getFullYear()}-${pad(stamp.getMonth()+1)}-${pad(stamp.getDate())} ${pad(stamp.getHours())}${pad(stamp.getMinutes())}${pad(stamp.getSeconds())}`)+".jpg";
    const boundary="rgbm"+Math.random().toString(36).slice(2);
    const body=new Blob([`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,JSON.stringify({name,mimeType:"image/jpeg",parents:[folderId]}),`\r\n--${boundary}\r\nContent-Type: image/jpeg\r\n\r\n`,blob,`\r\n--${boundary}--`]);
    prog("Uploading…");
    const f=await driveApi("files?uploadType=multipart&fields=id,name,webViewLink",{upload:true,method:"POST",headers:{"Content-Type":"multipart/related; boundary="+boundary},body});
    const link={attachmentId:"att_"+Date.now().toString(36)+Math.random().toString(36).slice(2,6),kind:"Google Drive",name:f.name||name,url:f.webViewLink||("https://drive.google.com/file/d/"+f.id+"/view"),driveFileId:f.id,mimeType:"image/jpeg",addedAt:nowISO()};
    const r=route.recordId?findRecord("Insurance",route.recordId):null;
    if(r){r.attachments=[...(r.attachments||[]),link];r.updatedAt=nowISO();saveData();}
    else DOC.pending.push(link);
    receiptClose();docRefreshList();
  }catch(e){console.error(e);docSheet(`<h2>Document Not Saved</h2><p>${esc(e.message||String(e))}</p>${e.reauth?`<button class="wide primary" type="button" onclick="driveConnect(()=>receiptClose())">Reconnect Google</button>`:""}<button class="wide ghost" type="button" onclick="receiptClose()">Close</button>`)}
}
function docLinks(r){return [...((r&&r.attachments)||[]).filter(a=>a&&a.url),...(route.mode==="edit"&&!(r&&r.recordId)?DOC.pending:[])]}
function docListHtml(r,editable){
  const links=docLinks(r);
  const rows=links.map(a=>`<li class="doc-link"><a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.name||"Document")}</a>${editable?`<button class="smallbtn ghost" type="button" onclick="docRemove('${esc(a.attachmentId)}')">Remove Link</button>`:""}</li>`).join("");
  return `<div id="docList" class="doc-list"><b>Documents</b>${rows?`<ul>${rows}</ul>`:`<p class="small muted">${editable?"None yet. Tap Scan Document to add one.":"None."}</p>`}</div>`;
}
function docRefreshList(){const el=$("docList");if(!el)return;const r=route.recordId?findRecord("Insurance",route.recordId):null;el.outerHTML=docListHtml(r,route.mode==="edit")}
function docRemove(id){
  if(!confirm("Remove this link from the app? The file stays in your Google Drive."))return;
  const r=route.recordId?findRecord("Insurance",route.recordId):null;
  if(r&&(r.attachments||[]).some(a=>a.attachmentId===id)){r.attachments=r.attachments.filter(a=>a.attachmentId!==id);r.updatedAt=nowISO();saveData()}
  DOC.pending=DOC.pending.filter(a=>a.attachmentId!==id);docRefreshList();
}
function driveSettingsCard(){
  const d=driveSettings(),vs=(state.vehicles||[]).filter(v=>v.status!=="Archived");
  if(!driveReady())return `<div class="card drive-card"><h2>Insurance Documents</h2><p class="muted">Scanned insurance documents are saved to Google Drive. Google Drive isn't set up for this app yet.</p></div>`;
  const acct=driveToken()?`Connected${d.account?" as "+esc(d.account):""}.`:(d.account?`Last used: ${esc(d.account)}. You'll be asked to reconnect when needed.`:"Not connected.");
  const radio=(m,label)=>`<label class="drive-mode"><input type="radio" name="driveMode" ${d.mode===m?"checked":""} onchange="driveSetMode('${m}')"> ${label}</label>`;
  let body="";
  if(d.mode==="subfolders"){
    body=`<div class="drive-row"><span>${d.parent?`Folder: <b>${esc(d.parent.name)}</b>`:"No folder chosen."}</span><button class="smallbtn" type="button" onclick="drivePickFolder('parent')">${d.parent?"Change":"Choose Folder"}</button></div>`+(d.parent?`<p class="small muted">Each vehicle gets its own subfolder inside it: ${vs.map(v=>esc(driveSafeName(vehicleLabel(v)))).join(", ")}.</p>`:"");
  }else{
    body=vs.map(v=>{const f=d.vehicles[v.vehicleId];return `<div class="drive-row"><span>${esc(vehicleLabel(v))}: ${f?`<b>${esc(f.name)}</b>`:"<i>not set</i>"}</span><button class="smallbtn" type="button" onclick="drivePickFolder('${esc(v.vehicleId)}')">${f?"Change":"Choose Folder"}</button></div>`}).join("");
  }
  return `<div class="card drive-card"><h2>Insurance Documents</h2><p class="muted">Scan Document on the Insurance screen saves the picture to your Google Drive and keeps only a link here. These folders belong to your account.</p><p class="small">${acct}</p><button class="wide" type="button" onclick="driveConnect(null,${driveToken()?"true":"false"})">${driveToken()?"Switch Google Account":"Connect Google Drive"}</button>${radio("subfolders","One folder, with a subfolder for each vehicle")}${radio("perVehicle","A separate folder for each vehicle")}${body}</div>`;
}
/* ===== F29 RC12: crop (and rotate) a document picture before it is saved to Drive ===== */
const CROP={src:null,rect:null,vid:"",drag:null,scale:1,ox:0,oy:0,opts:null};
function docCrop(file,vid){CROP.vid=vid;return cropOpen(file,{title:"Crop Document",hint:"Drag the corners or edges to frame the document. Drag inside the box to move it.",save:"Save to Drive",onSave:async c=>{const blob=await new Promise(res=>c.toBlob(res,"image/jpeg",0.85));c.width=c.height=0;if(!blob){docSheet(`<h2>Document Not Saved</h2><p>That picture could not be prepared.</p><button class="wide ghost" type="button" onclick="receiptClose()">Close</button>`);return}docSend(blob,vid)}})}
async function cropOpen(file,opts){
  CROP.opts=opts;
  receiptSheet(`<h2>Preparing Picture…</h2>`);
  try{
    const img=await receiptImage(file);const iw=img.width||img.naturalWidth,ih=img.height||img.naturalHeight;const k=Math.min(1,2400/Math.max(iw,ih));
    const c=receiptCanvas(Math.round(iw*k),Math.round(ih*k));const ctx=c.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);if(img.close)try{img.close()}catch(e){}
    CROP.src=c;cropAutoRect();
    receiptSheet(`<h2>${esc(opts.title)}</h2><p class="small muted">${esc(opts.hint)}</p><div class="crop-wrap"><canvas id="cropView"></canvas></div><div class="crop-tools"><button class="smallbtn" type="button" onclick="cropRotate()">Rotate ↻</button><button class="smallbtn" type="button" onclick="cropAutoRect();cropDraw()">Auto Frame</button><button class="smallbtn" type="button" onclick="cropFull()">Whole Picture</button></div><button class="wide primary" type="button" onclick="cropSave()">${esc(opts.save)}</button><button class="wide ghost" type="button" onclick="cropCancel()">Cancel</button>`);
    const v=$("cropView");v.addEventListener("pointerdown",cropDown);v.addEventListener("pointermove",cropMove);v.addEventListener("pointerup",cropUp);v.addEventListener("pointercancel",cropUp);
    cropDraw();
  }catch(e){console.error(e);receiptSheet(`<h2>Picture Not Opened</h2><p>${esc(e.message||String(e))}</p><button class="wide ghost" type="button" onclick="receiptClose()">Close</button>`)}
}
function cropFull(){const s=CROP.src;CROP.rect={x:0,y:0,w:s.width,h:s.height};cropDraw()}
function cropAutoRect(){const s=CROP.src;try{const g=RGBMReceipt.greyData(s.getContext("2d"),s.width,s.height);const b=RGBMReceipt.paperBox(g,s.width,s.height);CROP.rect=(b.w<s.width*0.98||b.h<s.height*0.98)?{x:b.x,y:b.y,w:b.w,h:b.h}:{x:0,y:0,w:s.width,h:s.height}}catch(e){CROP.rect={x:0,y:0,w:s.width,h:s.height}}}
function cropRotate(){const s=CROP.src,c=receiptCanvas(s.height,s.width),ctx=c.getContext("2d");ctx.translate(c.width,0);ctx.rotate(Math.PI/2);ctx.drawImage(s,0,0);const r=CROP.rect;CROP.rect={x:s.height-r.y-r.h,y:r.x,w:r.h,h:r.w};s.width=s.height=0;CROP.src=c;cropDraw()}
function cropDraw(){
  const v=$("cropView");if(!v||!CROP.src)return;const s=CROP.src;
  const maxW=Math.max(200,(v.parentElement.clientWidth||320)),maxH=Math.max(220,Math.round(window.innerHeight*0.55));
  const sc=Math.min(maxW/s.width,maxH/s.height);CROP.scale=sc;
  const dpr=window.devicePixelRatio||1;v.style.width=Math.round(s.width*sc)+"px";v.style.height=Math.round(s.height*sc)+"px";v.width=Math.round(s.width*sc*dpr);v.height=Math.round(s.height*sc*dpr);
  const ctx=v.getContext("2d");ctx.setTransform(dpr*sc,0,0,dpr*sc,0,0);ctx.drawImage(s,0,0);
  const r=CROP.rect;ctx.fillStyle="rgba(0,0,0,.55)";ctx.beginPath();ctx.rect(0,0,s.width,s.height);ctx.rect(r.x,r.y,r.w,r.h);ctx.fill("evenodd");
  ctx.lineWidth=3/sc;ctx.strokeStyle="#4fd18b";ctx.strokeRect(r.x,r.y,r.w,r.h);
  const hs=14/sc;ctx.fillStyle="#fff";[[r.x,r.y],[r.x+r.w,r.y],[r.x,r.y+r.h],[r.x+r.w,r.y+r.h]].forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,hs/1.4,0,Math.PI*2);ctx.fill();ctx.stroke()});
}
function cropPt(ev){const v=$("cropView"),b=v.getBoundingClientRect();return {x:(ev.clientX-b.left)/CROP.scale,y:(ev.clientY-b.top)/CROP.scale}}
function cropDown(ev){
  const p=cropPt(ev),r=CROP.rect,tol=28/CROP.scale;
  const near=(a,b)=>Math.abs(a-b)<=tol;const inY=p.y>=r.y-tol&&p.y<=r.y+r.h+tol,inX=p.x>=r.x-tol&&p.x<=r.x+r.w+tol;
  const e={l:near(p.x,r.x)&&inY,r:near(p.x,r.x+r.w)&&inY,t:near(p.y,r.y)&&inX,b:near(p.y,r.y+r.h)&&inX};
  let mode=(e.l||e.r||e.t||e.b)?e:(p.x>r.x&&p.x<r.x+r.w&&p.y>r.y&&p.y<r.y+r.h?"move":null);if(!mode)return;
  CROP.drag={mode,p,r:{...r}};ev.target.setPointerCapture&&ev.target.setPointerCapture(ev.pointerId);ev.preventDefault();
}
function cropMove(ev){
  const d=CROP.drag;if(!d)return;ev.preventDefault();const p=cropPt(ev),s=CROP.src,dx=p.x-d.p.x,dy=p.y-d.p.y,min=Math.max(40,Math.min(s.width,s.height)*0.05);
  let {x,y,w,h}=d.r;
  if(d.mode==="move"){x=Math.min(Math.max(0,x+dx),s.width-w);y=Math.min(Math.max(0,y+dy),s.height-h)}
  else{let x2=x+w,y2=y+h;if(d.mode.l)x=Math.min(Math.max(0,x+dx),x2-min);if(d.mode.r)x2=Math.max(Math.min(s.width,x2+dx),x+min);if(d.mode.t)y=Math.min(Math.max(0,y+dy),y2-min);if(d.mode.b)y2=Math.max(Math.min(s.height,y2+dy),y+min);w=x2-x;h=y2-y}
  CROP.rect={x,y,w,h};cropDraw();
}
function cropUp(){CROP.drag=null}
function cropCancel(){if(CROP.src){CROP.src.width=CROP.src.height=0}CROP.src=null;receiptClose()}
async function cropSave(){
  const s=CROP.src,r=CROP.rect;if(!s)return;
  const x=Math.round(r.x),y=Math.round(r.y),w=Math.round(Math.min(r.w,s.width-x)),h=Math.round(Math.min(r.h,s.height-y));
  const c=receiptCanvas(w,h);const cx=c.getContext("2d");cx.fillStyle="#fff";cx.fillRect(0,0,w,h);cx.drawImage(s,x,y,w,h,0,0,w,h);
  s.width=s.height=0;CROP.src=null;const o=CROP.opts;CROP.opts=null;
  if(o&&o.onSave)o.onSave(c);
}
cloudCaptureAuthRedirect();normalizeLaunchUrl();initApplicationShell();initResponsiveViewportHandling();initOfflineMode();
try{
  state=loadData();
  window.RGBM_WC10_DATA_DIAGNOSTICS=dataDiagnostics;
  window.RGBM_WC10_MIGRATION_EVIDENCE=migrationEvidenceReport;
  render();
  initFaceIdLock();
  initCloudSync()
}
catch(e){console.error(e);renderDataFatal(e)}
