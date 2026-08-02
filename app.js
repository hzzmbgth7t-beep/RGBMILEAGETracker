const APP_NAME="RGB Mileage", BUILD=Object.freeze({id:"v2.1.6l-wc10-f17",date:"2026-08-01",cacheRevision:"216lwc10f17"}), VERSION=BUILD.id, BUILD_DATE=BUILD.date, SCHEMA_VERSION=RGBMDataV3.SCHEMA_VERSION, KEY=RGBMDataV3.ACTIVE_KEY;
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

  const candidates=orientation==="portrait"
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
  for(const [left,top] of candidates){
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
function saveData(d=state){
  applyRecordLabelModel(d);
  d.schemaVersion=SCHEMA_VERSION;
  d.migrationVersion=RGBMDataV3.MIGRATION_VERSION;
  d.appVersion=VERSION;
  d.buildId=VERSION;
  d.buildDate=BUILD_DATE;
  d.modifiedAt=nowISO();
  state=RGBMDataV3.saveActiveState(localStorage,d,dataContext("active-save"));
  return state;
}
function nextSeq(){const n=state.nextEntrySequence||1;state.nextEntrySequence=n+1;return n} function baseRecord(type,vid,source="Manual Entry"){return {recordId:uid(type.toUpperCase()),entrySequence:nextSeq(),recordType:type,vehicleId:vid,source,origin:source,status:"",lifecycle:"",classificationTags:[],dataQuality:"",createdAt:nowISO(),modifiedAt:nowISO(),notes:""}}
function normRecord(r,type,vid){const rec={...r};rec.recordType=rec.recordType||type;rec.vehicleId=rec.vehicleId||vid||"";rec.recordId=rec.recordId||rec.id||uid(type.toUpperCase());rec.entrySequence=Number(rec.entrySequence)||nextSeq();rec.source=rec.source||rec.origin||"JSON Restore";rec.origin=rec.origin||rec.source||"JSON Restore";rec.classificationTags=tags(rec.classificationTags);rec.lifecycle=rec.lifecycle||canonicalLifecycle(rec);rec.status=RECORD_STATUSES.includes(rec.status)?rec.status:"";rec.dataQuality=rec.dataQuality||rec.status||"";rec.createdAt=rec.createdAt||nowISO();rec.modifiedAt=rec.modifiedAt||nowISO();rec.notes=rec.notes||"";return rec}
function normFuel(r,vid){const rec=normRecord(r,"Fuel",vid);Object.assign(rec,{date:r.date||"",time:r.time||"",odometer:numVal(r.odometer),miles:numVal(r.miles||r.totalMiles),gallons:numVal(r.gallons),mpg:numVal(r.mpg),fuelGrade:r.fuelGrade||r.grade||"",ethanolFree:r.ethanolFree||"",station:r.station||"",fuelPricePerGallon:numVal(r.fuelPricePerGallon||r.price),totalFuelCost:numVal(r.totalFuelCost||r.cost),fuelCostSource:r.fuelCostSource||"",attachments:arr(r.attachments)}); if((rec.odometer!==""&&rec.miles==="")||(rec.mpg!==""&&(+rec.mpg>18||+rec.mpg<6))) rec.status=rec.status||"Historical"; return rec}
function normMaint(r,vid){const rec=normRecord(r,"Maintenance",vid);Object.assign(rec,{date:r.date||r.dropOffDate||r.serviceDate||"",dropOffDate:r.dropOffDate||r.date||r.serviceDate||r.drop||"",pickUpDate:r.pickUpDate||r.pick||"",category:r.category||r.service||r.type||"Maintenance",status:r.status||"",odometer:numVal(r.odometer||r.mileage),location:r.location||r.shop||"",serviceProvider:r.serviceProvider||r.provider||r.vendor||"",provider:r.provider||r.serviceProvider||r.vendor||"",performedBy:r.performedBy||"",totalCost:numVal(r.totalCost||r.cost||r.amount),cost:numVal(r.totalCost||r.cost||r.amount),notes:r.notes||r.description||"",attachments:arr(r.attachments)});return rec}
function normIns(r,vid){const rec=normRecord(r,"Insurance",vid);Object.assign(rec,{company:r.company||r.insCompany||"",policyNumber:r.policyNumber||r.policy||"",effectiveDate:r.effectiveDate||"",expirationDate:r.expirationDate||"",coverageValue:numVal(r.coverageValue||r.insuranceValue),insuranceValue:numVal(r.insuranceValue||r.coverageValue),agreedValue:numVal(r.agreedValue),premium:numVal(r.premium),agent:r.agent||r.agentName||"",agentName:r.agentName||r.agent||"",agency:r.agency||"",phone:r.phone||"",email:r.email||"",coverageNotes:r.coverageNotes||"",attachments:arr(r.attachments)});return rec}
function $(id){return document.getElementById(id)} function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))} function fmt(v,d=2){return v!==""&&v!=null&&Number.isFinite(+v)?(+v).toFixed(d):""} function money(v){return v!==""&&v!=null&&Number.isFinite(+v)?"$"+(+v).toFixed(2):""}
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
function vehicleLabel(v){
  if(!v||!isVehicleConfigured(v))return "Add Vehicle";
  return [v.year,v.make,v.model].filter(Boolean).join(" ")||v.nickname||v.displayName||"Vehicle";
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
  else if(s==="settings")settings(app);
  else{home(app);return}
  finalizeNonHomeShell(app,s);
}




































































function header(title){return `<div class="topbar"><button class="nav-control back-btn" type="button" onclick="goBack()">‹ Back</button><h1>${esc(title||"RGB Mileage")}</h1></div>`}
function bottomNav(){return `<div class="bottom-nav"><button class="nav-control" type="button" onclick="goHome()"><span>⌂</span>Home</button><button class="nav-control" type="button" onclick="nav('reports')"><span>▣</span>Reports</button><button class="nav-control" type="button" onclick="nav('data')"><span>⇅</span>Data</button><button class="nav-control" type="button" onclick="nav('settings')"><span>⚙</span>Settings</button></div>`}
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
function saveRecordEdit(type,recordId,goBackAfterSave=false){try{const a=recArray(type);const r=a.find(x=>x.recordId===recordId);if(!r)return alert("Record not found.");if(type==="Fuel"){const date=requireValue($("efdate").value,"Date");const gallons=requirePositive($("efgal").value,"Gallons");const odometer=requireNonNegative($("efodo").value,"Odometer");const miles=requireNonNegative($("efmiles").value,"Miles");const price=requireNonNegative($("efprice").value,"Price/Gal");const total=requireNonNegative($("efcost").value,"Total Cost");Object.assign(r,{date,time:$("eftime").value,odometer,miles,gallons,mpg:requireNonNegative($("efmpg").value,"MPG"),fuelGrade:cleanText($("efgrade").value),ethanolFree:cleanText($("efef").value),station:cleanText($("efstation").value),fuelCostSource:cleanText($("efcostsource").value)||(total!==""?"Entered":price!==""?"Calculated":""),fuelPricePerGallon:price,totalFuelCost:total,notes:cleanText($("efnotes").value),modifiedAt:nowISO()})}else if(type==="Maintenance"){const date=requireValue($("emdate").value,"Date");const odometer=requireNonNegative($("emodo").value,"Odometer");const totalCost=requireNonNegative($("emcost").value,"Cost");const provider=cleanText($("emprov").value);Object.assign(r,{date,dropOffDate:date,pickUpDate:cleanText($("empick").value),category:cleanText($("emcat").value)||"Maintenance",odometer,totalCost,cost:totalCost,location:cleanText($("emloc").value),serviceProvider:provider,provider,performedBy:cleanText($("emperf").value),notes:cleanText($("emnotes").value),modifiedAt:nowISO()})}else if(type==="Insurance"){const agency=cleanText($("eiagency").value);const policyNumber=cleanText($("eipol").value);const effectiveDate=cleanText($("eieff").value);const expirationDate=cleanText($("eiexp").value);if(expirationDate&&expirationDate<effectiveDate)throw new Error("Expiration Date cannot be earlier than Effective Date.");const agreedValue=requireNonNegative($("eiagree").value,"Agreed Value");const premium=requireNonNegative($("eiprem").value,"Premium");const agent=cleanText($("eiagent").value);const notes=cleanText($("einotes").value);Object.assign(r,{company:agency,agency,policyNumber,effectiveDate,expirationDate,agreedValue,coverageValue:agreedValue,insuranceValue:agreedValue,premium,agent,agentName:agent,phone:cleanText($("eiphone").value),email:cleanText($("eiemail").value),notes,coverageNotes:notes,modifiedAt:nowISO()})}saveData();editSnapshot=null;showToast("Edit saved.");if(goBackAfterSave){performBackNavigation();return true}clearEditForm(type);return true}catch(e){alert(e.message||String(e));return false}}
function vehicleView(app,vid){const v=getVehicle(vid);if(!v)return nav("home");const acq=getAcq(vid);app.innerHTML=header(vehicleLabel(v))+`<div class="card vehicle-detail-card"><div class="vehicle-view-photo">${v.primaryPhoto?`<div class="vehicle-detail-photo-frame"><img src="${v.primaryPhoto}" alt="${esc(vehicleLabel(v))}"></div>`:`<div class="vehicle-detail-photo-frame vehicle-detail-photo-placeholder"><span>${vehicleInitials(v)}</span></div>`}</div><div class="view-grid">${viewField("Year",v.year||"")}${viewField("Make",v.make||"")}${viewField("Model",v.model||"")}${viewField("Badge",v.badge||"")}${viewField("Acquisition Date",formatDisplayDate(acq.acquisitionDate))}${viewField("Starting Odometer",acq.startingOdometer||"")}${viewField("Purchase Price",acq.purchasePrice||"")}${viewField("Status",v.status||"Active")}${viewField("Seller",acq.seller||"",true)}</div><div class="vehicle-detail-actions"><button class="wide primary nav-control" type="button" onclick="nav('vehicleEdit',{vehicleId:'${vid}'})">Edit Vehicle</button><button class="wide nav-control" type="button" onclick="openFuelFromVehicle('${vid}')">Fuel Entry</button><button class="wide nav-control" type="button" onclick="openMaintenanceFromVehicle('${vid}')">Maintenance Entry</button><button class="wide nav-control" type="button" onclick="openInsuranceFromVehicle('${vid}')">Insurance Entry</button></div></div>`+previousRecordsHtml("Fuel",vid)+previousRecordsHtml("Maintenance",vid)+previousRecordsHtml("Insurance",vid)+bottomNav()+footer()}
function recordEdit(app,type,recordId){const r=records(type,null,true).find(x=>x.recordId===recordId);if(!r)return nav("home");const vid=r.vehicleId;if(type==="Fuel"){app.innerHTML=header("Edit Fuel Record")+`<div class="card"><div class="form-grid"><label>Date<input type="date" id="efdate" value="${esc(r.date||"")}"></label><label>Time<input type="time" id="eftime" value="${esc(r.time||"")}"></label><label>Odometer<input type="number" step="0.01" id="efodo" value="${esc(r.odometer||"")}"></label><label>Miles<input type="number" step="0.01" id="efmiles" value="${esc(r.miles||"")}"></label><label>Gallons<input type="number" step="0.001" id="efgal" value="${esc(r.gallons||"")}"></label><label>MPG<input type="number" step="0.01" id="efmpg" value="${esc(r.mpg||"")}"></label><label>Fuel Grade<select id="efgrade" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'fuelGrades')">${activeList("fuelGrades").map(g=>`<option ${g===(r.fuelGrade||"")?"selected":""}>${esc(g)}</option>`).join("")}</select></label><label>Ethanol Free<select id="efef"><option ${String(r.ethanolFree||"")===""?"selected":""}></option><option ${String(r.ethanolFree||"")==="Yes"?"selected":""}>Yes</option><option ${String(r.ethanolFree||"")==="No"?"selected":""}>No</option></select></label><label>Station<select id="efstation" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'stations')">${activeList("stations").map(s=>`<option ${s===(r.station||"")?"selected":""}>${esc(s)}</option>`).join("")}</select></label><label>Cost Source<select id="efcostsource"><option ${String(r.fuelCostSource||"")===""?"selected":""}></option><option ${String(r.fuelCostSource||"")==="Calculated"?"selected":""}>Calculated</option><option ${String(r.fuelCostSource||"")==="Entered"?"selected":""}>Entered</option></select></label><label>Price/Gal<input type="number" step="0.01" id="efprice" value="${esc(r.fuelPricePerGallon||"")}" oninput="calcEditCost()"></label><label>Total Cost<input type="number" step="0.01" id="efcost" value="${esc(r.totalFuelCost||"")}"></label><label class="full">Notes<textarea id="efnotes">${esc(r.notes||"")}</textarea></label></div><button class="wide primary nav-control" type="button" onclick="saveRecordEdit('Fuel','${recordId}')">Save Changes</button><button class="wide ghost nav-control" type="button" onclick="goBack()">Cancel</button></div>`+previousRecordsHtml("Fuel",vid)+bottomNav()+footer();setEditSnapshot(type,recordId);return}if(type==="Maintenance"){app.innerHTML=header("Edit Maintenance Record")+`<div class="card"><div class="form-grid"><label>Date<input type="date" id="emdate" value="${esc(r.dropOffDate||r.date||"")}"></label><label>Pickup Date<input type="date" id="empick" value="${esc(r.pickUpDate||"")}"></label><label>Category<select id="emcat" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'maintenanceCategories')">${activeList("maintenanceCategories").map(c=>`<option ${c===(r.category||"")?"selected":""}>${esc(c)}</option>`).join("")}</select></label><label>Odometer<input type="number" step="0.01" id="emodo" value="${esc(r.odometer||"")}"></label><label>Cost<input type="number" step="0.01" id="emcost" value="${esc(r.totalCost||r.cost||"")}"></label><label>Location<input id="emloc" value="${esc(r.location||"")}"></label><label>Provider<input id="emprov" value="${esc(r.serviceProvider||r.provider||"")}"></label><label>Performed By<input id="emperf" value="${esc(r.performedBy||"")}"></label><label class="full">Notes<textarea id="emnotes">${esc(r.notes||"")}</textarea></label></div><button class="wide primary nav-control" type="button" onclick="saveRecordEdit('Maintenance','${recordId}')">Save Changes</button><button class="wide ghost nav-control" type="button" onclick="goBack()">Cancel</button></div>`+previousRecordsHtml("Maintenance",vid)+bottomNav()+footer();setEditSnapshot(type,recordId);return}if(type==="Insurance"){app.innerHTML=header("Edit Insurance Record")+`<div class="card"><div class="form-grid"><label>Agency<input id="eiagency" value="${esc(r.agency||r.company||"")}"></label><label>Policy Number<input id="eipol" value="${esc(r.policyNumber||"")}"></label><label>Effective Date<input type="date" id="eieff" value="${esc(r.effectiveDate||"")}"></label><label>Expiration Date<input type="date" id="eiexp" value="${esc(r.expirationDate||"")}"></label><label>Agreed Value<input type="number" step="0.01" id="eiagree" value="${esc((r.agreedValue!==""&&r.agreedValue!=null)?r.agreedValue:(r.coverageValue!==""&&r.coverageValue!=null?r.coverageValue:r.insuranceValue||""))}"></label><label>Premium<input type="number" step="0.01" id="eiprem" value="${esc(r.premium||"")}"></label><label>Agent<input id="eiagent" value="${esc(r.agent||r.agentName||"")}"></label><label>Phone<input id="eiphone" value="${esc(r.phone||"")}"></label><label>Email<input type="email" id="eiemail" value="${esc(r.email||"")}"></label><label class="full">Notes<textarea id="einotes">${esc(r.notes||r.coverageNotes||"")}</textarea></label></div><button class="wide primary nav-control" type="button" onclick="saveRecordEdit('Insurance','${recordId}')">Save Changes</button><button class="wide ghost nav-control" type="button" onclick="goBack()">Cancel</button></div>`+previousRecordsHtml("Insurance",vid)+bottomNav()+footer()}}


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
    orientation
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

  if(layout.mode==="portrait-staggered"){
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
      "--home-primary-x",
      `${layout.primary.x}px`
    );
    homeScreen.style.setProperty(
      "--home-primary-y",
      `${layout.primary.y}px`
    );
    homeScreen.style.setProperty(
      "--home-upper-secondary-x",
      `${layout.upperSecondary.x}px`
    );
    homeScreen.style.setProperty(
      "--home-upper-secondary-y",
      `${layout.upperSecondary.y}px`
    );
    homeScreen.style.setProperty(
      "--home-lower-secondary-x",
      `${layout.lowerSecondary.x}px`
    );
    homeScreen.style.setProperty(
      "--home-lower-secondary-y",
      `${layout.lowerSecondary.y}px`
    );
    homeScreen.style.removeProperty("--home-primary-diameter");
    homeScreen.style.removeProperty("--home-secondary-diameter");
  }else{
    homeScreen.style.removeProperty("--home-label-gap");
    homeScreen.style.removeProperty("--home-circle-item-height");
    homeScreen.style.removeProperty("--home-horizontal-space");
    homeScreen.style.removeProperty("--home-vertical-space");
    homeScreen.style.removeProperty("--home-primary-x");
    homeScreen.style.removeProperty("--home-primary-y");
    homeScreen.style.removeProperty("--home-upper-secondary-x");
    homeScreen.style.removeProperty("--home-upper-secondary-y");
    homeScreen.style.removeProperty("--home-lower-secondary-x");
    homeScreen.style.removeProperty("--home-lower-secondary-y");
    homeScreen.style.removeProperty("--home-primary-diameter");
    homeScreen.style.removeProperty("--home-secondary-diameter");
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
  pressStart(()=>type==="Fuel"?fuelRowActions(recordId):openRecordFlow(type,recordId,"edit"),e,650);
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
  return `<div class="entry-row" role="button" tabindex="0"
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

function circleHtml(v,i){
  const configured=isVehicleConfigured(v);
  const inner=configured&&v.primaryPhoto?`<img src="${v.primaryPhoto}" alt="">`:esc(vehicleBadge(v));
  const label=configured?vehicleLabel(v):"Add Vehicle";
  const accessible=esc(label);
  return `<button class="circle-wrap" type="button" data-position="${i+1}" aria-label="${accessible}" onpointerdown="pressStart(()=>vehicleLong(${i}),event,500)" onpointerup="clearLP()" onpointercancel="clearLP()" onclick="vehicleTap(${i})"><span class="home-circle-visual" aria-hidden="true">${inner}</span><span class="vehicle-label">${esc(label)}</span></button>`;
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

function vehicleEdit(app,vid){
  const v=getVehicle(vid);
  if(!v){alert("Vehicle position not found.");return nav("home")}
  const configured=isVehicleConfigured(v);
  const acq=getAcq(v.vehicleId);
  const currentImg=v.primaryPhoto?`<div class="edit-image-preview"><div class="vehicle-edit-photo-frame"><img src="${v.primaryPhoto}" alt="${esc(vehicleLabel(v))}"></div><div class="muted">Current vehicle image saved</div></div>`:`<div class="muted">No vehicle image saved</div>`;
  app.innerHTML=header(configured?"Edit Vehicle":"Add Vehicle")+`<div class="card"><div class="form-grid"><label>Year<input id="vehYear" value="${esc(v.year||"")}"></label><label>Make<input id="vehMake" value="${esc(v.make||"")}"></label><label>Model<input id="vehModel" value="${esc(v.model||"")}"></label><label>Badge<input id="vehBadge" value="${esc(v.badge||"")}"></label></div><div class="image-edit-block"><h3>Vehicle Image</h3>${currentImg}<label>Replace Image<input type="file" id="vehPhoto" accept="image/*"></label><div class="muted">Saved image data: ${v.primaryPhoto?"Present":"None"}</div></div><h3>Vehicle Acquisition Record</h3><div class="form-grid"><label>Acquisition Date<input type="date" id="acqDate" value="${esc(acq.acquisitionDate||"")}"></label><label>Starting Odometer<input type="number" step="0.01" id="startOdo" value="${esc(acq.startingOdometer||"")}"></label><label>Purchase Price<input type="number" step="0.01" id="purchasePrice" value="${esc(acq.purchasePrice||"")}"></label><label>Status<select id="vehStatus"><option ${v.status==="Active"?"selected":""}>Active</option><option ${v.status==="Archived"?"selected":""}>Archived</option></select></label><label class="full">Seller<input id="seller" value="${esc(acq.seller||"")}"></label></div><button class="wide primary" onclick="saveVehicle('${v.vehicleId}')">Save Vehicle</button><button class="wide ghost" onclick="clearVehicleFormExit()">Clear & Exit</button></div>`+bottomNav()+footer();
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
function recordTitle(type,r){if(type==="Fuel")return `${formatDisplayDate(r.date)||"No Date"} Odo ${fmt(r.odometer)}`; if(type==="Maintenance")return `${formatDisplayDate(r.dropOffDate||r.date)||"No Date"} ${r.category||"Maintenance"}`; if(type==="Insurance")return `${r.agency||r.company||"Insurance"} ${r.policyNumber||""}`; return r.recordId}
function line(k,v){return `<div><b>${esc(k)}:</b> ${esc(v??"")}</div>`}
function recordDetails(type,r){if(type==="Fuel")return line("Odometer",fmt(r.odometer))+line("Miles",fmt(r.miles))+line("Gallons",fmt(r.gallons,3))+line("MPG",fmt(r.mpg))+line("Station",r.station)+line("Notes",r.notes); if(type==="Maintenance")return line("Odometer",fmt(r.odometer))+line("Cost",money(r.totalCost))+line("Provider",r.serviceProvider||r.provider||"")+line("Notes",r.notes); if(type==="Insurance")return line("Effective",formatDisplayDate(r.effectiveDate))+line("Expiration",formatDisplayDate(r.expirationDate))+line("Premium",money(r.premium))+line("Agency",r.agency||"");return ""}












function previousRecordsHtml(type,vid){const rows=records(type,vid,false);return `<details class="card" open><summary><strong>Previous ${type} Records</strong></summary>${rows.length?rows.map(r=>entryRow(type,r)).join(""):'<p class="muted">No records.</p>'}</details>`}



function meta(r){return `<details class="card data-information"><summary><strong>Data Information</strong></summary><div class="readonly-grid"><div class="fieldbox"><b>Record ID</b><span>${esc(r.recordId)}</span></div><div class="fieldbox"><b>Sequence</b><span>${r.entrySequence}</span></div><div class="fieldbox"><b>Origin</b><span>${esc(canonicalOrigin(r))}</span></div><div class="fieldbox"><b>Status</b><span>${esc(meaningfulStatus(r))}</span></div><div class="fieldbox"><b>Lifecycle</b><span>${esc(canonicalLifecycle(r))}</span></div></div></details>`} function roBox(label,val){return `<div class="fieldbox"><b>${esc(label)}</b><span>${esc(val??"")}</span></div>`}
function findRecord(type,id){
  return recArray(type).find(r=>String(r.recordId)===String(id));
}
function recordView(app,type,id){const r=findRecord(type,id);if(!r)return nav("home",{},false);app.innerHTML=header("View "+type+" Record")+`<div class="card">${meta(r)}<h3>${type} Information</h3><div class="readonly-grid">${viewFields(type,r)}</div><div class="view-actions"><button class="danger" onclick="archiveRecord('${type}','${id}')">Archive</button><button onclick="navRecord('${type}','${id}','edit')">Edit</button></div></div>`+bottomNav()+footer()} function viewFields(type,r){if(type==="Fuel")return roBox("Date",formatDisplayDate(r.date))+roBox("Time",r.time)+roBox("Odometer",fmt(r.odometer))+roBox("Miles",fmt(r.miles))+roBox("Gallons",fmt(r.gallons,3))+roBox("MPG",fmt(r.mpg))+roBox("Fuel Grade",r.fuelGrade)+roBox("Ethanol Free",r.ethanolFree)+roBox("Station",r.station)+roBox("Cost Source",r.fuelCostSource)+roBox("Price/Gal",money(r.fuelPricePerGallon))+roBox("Total Cost",money(r.totalFuelCost))+roBox("Notes",r.notes); if(type==="Maintenance")return roBox("Date",formatDisplayDate(r.dropOffDate||r.date))+roBox("Category",r.category)+roBox("Odometer",fmt(r.odometer))+roBox("Cost",money(r.totalCost||r.cost))+roBox("Location",r.location)+roBox("Provider",r.serviceProvider||r.provider)+roBox("Pickup Date",formatDisplayDate(r.pickUpDate))+roBox("Performed By",r.performedBy)+roBox("Notes",r.notes); if(type==="Insurance")return roBox("Agency",r.agency||r.company)+roBox("Policy Number",r.policyNumber)+roBox("Effective Date",formatDisplayDate(r.effectiveDate))+roBox("Expiration Date",formatDisplayDate(r.expirationDate))+roBox("Agreed Value",money(r.agreedValue!==""&&r.agreedValue!=null?r.agreedValue:(r.coverageValue!==""&&r.coverageValue!=null?r.coverageValue:r.insuranceValue)))+roBox("Premium",money(r.premium))+roBox("Agent",r.agent||r.agentName)+roBox("Phone",r.phone)+roBox("Email",r.email)+roBox("Notes",r.notes||r.coverageNotes);return ""}
function commonEdit(r){return `<label>Data Quality<select id="rq">${DATA_QUALITIES.map(q=>`<option ${r.dataQuality===q?'selected':''}>${q}</option>`).join("")}</select></label><label>Tags<input id="rtags" value="${esc(tags(r.classificationTags).join('; '))}"></label><label>Notes<textarea id="rnotes">${esc(r.notes||"")}</textarea></label>`} 




function editFields(type,r){if(type==="Fuel")return `<div class="row"><label>Date<input type="date" id="rdate" value="${esc(r.date||"")}"></label><label>Time<input type="time" id="rtime" value="${esc(r.time||"")}"></label></div><div class="row"><label>Odometer<input type="number" step="0.01" id="rodo" value="${esc(r.odometer)}"></label><label>Miles<input type="number" step="0.01" id="rmiles" value="${esc(r.miles)}"></label></div><div class="row"><label>Gallons<input type="number" step="0.001" id="rgal" value="${esc(r.gallons)}"></label><label>MPG<input type="number" step="0.01" id="rmpg" value="${esc(r.mpg)}"></label></div><label>Station<input id="rstation" value="${esc(r.station||"")}"></label>`; if(type==="Maintenance")return `<label>Date<input type="date" id="rdrop" value="${esc(r.dropOffDate||"")}"></label><label>Category<select id="rcat">${state.maintenanceCategories.map(c=>`<option ${r.category===c?'selected':''}>${esc(c)}</option>`).join("")}</select></label><label>Cost<input type="number" step="0.01" id="rcost" value="${esc(r.totalCost)}"></label>`; if(type==="Insurance")return `<label>Company<input id="rcompany" value="${esc(r.company||"")}"></label><label>Policy Number<input id="rpol" value="${esc(r.policyNumber||"")}"></label><div class="row"><label>Effective<input type="date" id="reff" value="${esc(r.effectiveDate||"")}"></label><label>Expiration<input type="date" id="rexp" value="${esc(r.expirationDate||"")}"></label></div><label>Premium<input type="number" step="0.01" id="rprem" value="${esc(r.premium)}"></label>`;return ""}
 function archiveRecord(type,id){const r=findRecord(type,id);if(confirm("Archive this record?")){addTag(r,"Archived");r.modifiedAt=nowISO();saveData();alert("Record archived.");nav("vehicleView",{vehicleId:r.vehicleId})}}
function openOtherList(selectId,listName,label){const sel=$(selectId);if(sel.value!=="Other")return;showOtherSheet(label,(name,save)=>{if(!name){sel.value="";return}let list=state[listName];if(save&&!list.includes(name)){list.splice(Math.max(0,list.length-1),0,name);saveData()}if(![...sel.options].some(o=>o.value===name)){const opt=document.createElement("option");opt.value=name;opt.textContent=name;sel.insertBefore(opt,sel.querySelector('option[value="Other"]'))}sel.value=name})} function showOtherSheet(label,cb){const div=document.createElement("div");div.className="modal";div.innerHTML=`<div class="sheet"><h2>Other ${esc(label)}</h2><label>${esc(label)} Name<input id="otherName"></label><div class="form-actions"><button class="primary" id="useOnce">Use Once</button><button class="ok" id="saveList">Save To List</button></div><button class="wide danger" id="cancelOther">Cancel</button></div>`;document.body.appendChild(div);$("otherName").focus();$("useOnce").onclick=()=>{const v=$("otherName").value.trim();div.remove();cb(v,false)};$("saveList").onclick=()=>{const v=$("otherName").value.trim();div.remove();cb(v,true)};$("cancelOther").onclick=()=>{div.remove();cb("",false)}}

let activeChoiceModal=null;
function closeChoiceModal(){if(activeChoiceModal){activeChoiceModal.remove();activeChoiceModal=null}return false}
function showChoiceModal(title,actions){
  closeChoiceModal();
  const overlay=document.createElement("div");
  overlay.className="modal choice-modal";
  const box=document.createElement("div");
  box.className="choice-box";
  const h2=document.createElement("h2");
  h2.textContent=title||"Choose next action";
  box.appendChild(h2);
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
  if(readOnly){
    return `<div class="readonly-grid">
      ${roBox("Date",formatDisplayDate(r.date))}
      ${roBox("Time",r.time||"")}
      ${roBox("Odometer",fmt(r.odometer))}
      ${roBox("Miles",fmt(r.miles))}
      ${roBox("Gallons",fmt(r.gallons,3))}
      ${roBox("MPG",fmt(r.mpg))}
      ${roBox("Fuel Grade",r.fuelGrade||"")}
      ${roBox("Ethanol Free",r.ethanolFree||"")}
      ${roBox("Station",r.station||"")}
      ${roBox("Cost Source",r.fuelCostSource||"")}
      ${roBox("Price/Gal",money(r.fuelPricePerGallon))}
      ${roBox("Total Cost",money(r.totalFuelCost))}
      ${roBox("Status",meaningfulStatus(r))}
      <div class="fieldbox full"><b>Notes</b><span>${esc(r.notes||"")}</span></div>
    </div>`;
  }
  return `<div class="form-grid">
    <label>Date<input type="date" id="fdate" value="${esc(r.date||"")}"></label>
    <label>Time<input type="time" id="ftime" value="${esc(r.time||"")}"></label>
    <label>Odometer<input type="number" step="0.01" id="fodo" value="${esc(r.odometer||"")}" oninput="calcFuel('${vid}')"></label>
    <label>Miles<input type="number" step="0.01" id="fmiles" value="${esc(r.miles||"")}" oninput="calcMpg()"></label>
    <label>Gallons<input type="number" step="0.001" id="fgal" value="${esc(r.gallons||"")}" oninput="calcMpg()"></label>
    <label>MPG<input type="number" step="0.01" id="fmpg" value="${esc(r.mpg||"")}" readonly></label>
    <label>Fuel Grade<select id="fgrade" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'fuelGrades')">${gradeList.map(g=>`<option ${g===(r.fuelGrade||"")?'selected':''}>${esc(g)}</option>`).join("")}</select></label>
    <label>Ethanol Free<select id="fef"><option ${String(r.ethanolFree||"")===""?"selected":""}></option><option ${String(r.ethanolFree||"")==="Yes"?"selected":""}>Yes</option><option ${String(r.ethanolFree||"")==="No"?"selected":""}>No</option></select></label>
    <label>Station<select id="fstation" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'stations')">${stationList.map(s=>`<option ${s===(r.station||"")?'selected':''}>${esc(s)}</option>`).join("")}</select></label>
    <label>Cost Source<select id="fcostsource"><option ${String(r.fuelCostSource||"")===""?"selected":""}></option><option ${String(r.fuelCostSource||"")==="Calculated"?"selected":""}>Calculated</option><option ${String(r.fuelCostSource||"")==="Entered"?"selected":""}>Entered</option></select></label>
    <label>Price/Gal<input type="number" step="0.01" id="fprice" value="${esc(r.fuelPricePerGallon||"")}" data-source="${esc(r.fuelPriceSource||"Entered")}" data-original-value="${esc(r.fuelPricePerGallon||"")}" onfocus="fuelCalcFieldFocus('fprice')" onblur="fuelCalcFieldBlur('fprice','Price/Gal')" oninput="calcCost()"></label>
    <label>Total Cost<input type="number" step="0.01" id="fcost" value="${esc(r.totalFuelCost||"")}" data-source="${esc(r.totalFuelCostSource||((r.totalFuelCost!==""&&r.totalFuelCost!=null)?"Entered":"Blank"))}" data-original-value="${esc(r.totalFuelCost||"")}" onfocus="fuelCalcFieldFocus('fcost')" onblur="fuelCalcFieldBlur('fcost','Total Cost')"></label>
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
    if(existing) body += meta(existing);
    body += `<h3>Fuel Information</h3>`+fuelFormHtml(vid,r,mode==="view")+fuelActionButtons();
  }
  body += `</div>`;
  app.innerHTML=header(vehicleLabel(v)+" - Fuel")+body+previousRecordsHtml("Fuel",vid)+bottomNav()+footer();
  if(mode==="edit") setTimeout(setQuickFuelSnapshot,0);
}

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

function previousFuelOdo(vid,odo){const rows=records("Fuel",vid,false).filter(r=>r.odometer!==""&&Number(r.odometer)<Number(odo)).sort((a,b)=>Number(b.odometer)-Number(a.odometer));return rows[0]?.odometer??""} function calcFuel(vid){const odo=numVal($("fodo").value),prev=previousFuelOdo(vid,odo);if(odo!==""&&prev!=="")$("fmiles").value=(odo-prev).toFixed(2);calcMpg()} function calcMpg(){const m=numVal($("fmiles").value),g=numVal($("fgal").value);$("fmpg").value=(m!==""&&g>0)?(m/g).toFixed(2):"";calcCost()} function calcCost(){const g=numVal($("fgal")?.value),p=numVal($("fprice")?.value);if($("fcost")&&g!==""&&p!=="")$("fcost").value=(g*p).toFixed(2)} function calcEditCost(){const g=numVal($("efgal")?.value),p=numVal($("efprice")?.value);if($("efcost")&&g!==""&&p!=="")$("efcost").value=(g*p).toFixed(2)} 
function fuelRound2(n){return Math.round(Number(n)*100)/100}
function fuelCalcPrice(g,total){const gg=numVal(g),tt=numVal(total); if(gg===""||tt==="") return ""; if(Number(gg)<=0) return ""; return fuelRound2(Number(tt)/Number(gg)).toFixed(2)}
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
  if(readOnly){
    return `<div class="readonly-grid">
      ${roBox("Date",formatDisplayDate(r.dropOffDate||r.date))}
      ${roBox("Pickup Date",formatDisplayDate(r.pickUpDate))}
      ${roBox("Category",r.category||"")}
      ${roBox("Odometer",fmt(r.odometer))}
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
    <label>Odometer<input type="number" step="0.01" id="modo" value="${esc(r.odometer||"")}"></label>
    <label>Cost<input type="number" step="0.01" id="mcost" value="${esc(r.totalCost||r.cost||"")}"></label>
    <label>Location<input id="mloc" value="${esc(r.location||"")}"></label>
    <label>Provider<input id="mprov" value="${esc(r.serviceProvider||r.provider||"")}"></label>
    <label>Performed By<input id="mperf" value="${esc(r.performedBy||"")}"></label>
    <label class="full">Notes<textarea id="mnotes">${esc(r.notes||"")}</textarea></label>
  </div>`;
}
function maintenanceActionButtons(){
  const mode=route.mode||"edit";
  if(mode==="empty") return `<div class="fuel-actions single"><button class="primary" onclick="maintenanceNew()">New</button></div>`;
  if(mode==="view") return `<div class="fuel-actions"><button class="ghost" onclick="maintenanceNew()">New</button><button onclick="maintenanceToggleMode()">Edit</button><button class="ghost" onclick="maintenanceCancel()">Cancel</button></div>`;
  const toggleBtn=route.recordId?`<button onclick="maintenanceToggleMode()">View</button>`:'';
  return `<div class="fuel-actions"><button class="ghost" onclick="maintenanceNew()">New</button>${toggleBtn}<button class="primary" onclick="saveQuickMaintenance('${route.vehicleId}')">Save</button><button class="ghost" onclick="maintenanceCancel()">Cancel</button></div>`;
}
function quickMaintenance(app,vid){
  const v=getVehicle(vid); if(!v)return nav("home");
  const mode=route.mode||"edit"; const recordId=route.recordId||""; const existing=recordId?findRecord("Maintenance",recordId):null; const r=existing?existing:maintenanceDefaultRecord(vid);
  let body=`<div class="card">`;
  if(mode==="empty") body += `<div class="empty-state"><p class="muted">No record selected. Choose a record below or tap New.</p>${maintenanceActionButtons()}</div>`;
  else { if(existing) body += meta(existing); body += `<h3>Maintenance Information</h3>`+maintenanceFormHtml(vid,r,mode==="view")+maintenanceActionButtons(); }
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
    notes:cleanText($("inotes")?.value)
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
  return `<div class="fuel-actions"><button class="ghost" onclick="insuranceNew()">New</button>${toggleBtn}<button class="primary" onclick="saveQuickInsurance('${route.vehicleId}')">Save</button><button class="ghost" onclick="insuranceCancel()">Cancel</button></div>`;
}
function quickInsurance(app,vid){
  const v=getVehicle(vid); if(!v)return nav("home");
  const mode=route.mode||"edit"; const recordId=route.recordId||""; const existing=recordId?findRecord("Insurance",recordId):null; const r=existing?existing:insuranceDefaultRecord(vid);
  let body=`<div class="card">`;
  if(mode==="empty") body += `<div class="empty-state"><p class="muted">No record selected. Choose a record below or tap New.</p>${insuranceActionButtons()}</div>`;
  else { if(existing) body += meta(existing); body += `<h3>Insurance Information</h3>`+insuranceFormHtml(vid,r,mode==="view")+insuranceActionButtons(); }
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
      attachments:r.attachments||[],
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
function reportsHome(app){app.innerHTML=header("Reports")+`<div class="card report-menu"><h2>Report Menu</h2><button class="wide" onclick="openReport('reportFuel')">Fuel History Report</button><button class="wide" onclick="openReport('reportMPG')">MPG Report</button><button class="wide" onclick="openReport('reportMaintenance')">Maintenance Report</button><button class="wide" onclick="openReport('reportInsurance')">Insurance History Report</button><button class="wide" onclick="openReport('reportVehicle')">Vehicle Summary Report</button></div>`+bottomNav()+footer()} function reportDetail(app,s){let title="Report", rows=[]; if(s==="reportFuel"){title="Fuel History Report";rows=state.fuelRecords.filter(r=>!hasTag(r,"Archived")).sort((a,b)=>previousSort("Fuel",a,b)).map(r=>[r.date||"",getVehicle(r.vehicleId)?vehicleLabel(getVehicle(r.vehicleId)):"",fmt(r.odometer),fmt(r.miles),fmt(r.gallons,3),fmt(r.mpg)])} if(s==="reportMPG"){title="MPG Report";rows=state.fuelRecords.filter(r=>!hasTag(r,"Archived")&&!hasTag(r,"Historical")).sort((a,b)=>previousSort("Fuel",a,b)).map(r=>[r.date||"",fmt(r.odometer),fmt(r.miles),fmt(r.gallons,3),fmt(r.mpg)])} if(s==="reportMaintenance"){title="Maintenance Report";rows=state.maintenanceRecords.filter(r=>!hasTag(r,"Archived")).sort((a,b)=>previousSort("Maintenance",a,b)).map(r=>[r.dropOffDate||"",r.category||"",fmt(r.odometer),money(r.totalCost)])} if(s==="reportInsurance"){title="Insurance History Report";rows=state.insuranceRecords.filter(r=>!hasTag(r,"Archived")).sort((a,b)=>previousSort("Insurance",a,b)).map(r=>[r.company||"",r.policyNumber||"",r.effectiveDate||"",r.expirationDate||"",money(r.premium)])} if(s==="reportVehicle"){title="Vehicle Summary Report";rows=configuredVehicles().map(v=>[vehicleLabel(v),v.status,state.fuelRecords.filter(r=>r.vehicleId===v.vehicleId&&!hasTag(r,"Archived")).length,state.maintenanceRecords.filter(r=>r.vehicleId===v.vehicleId&&!hasTag(r,"Archived")).length])} app.innerHTML=header(title)+`<div class="card"><p class="muted">Default views exclude Archived records. MPG report also excludes Historical records.</p><div style="overflow:auto"><table><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")||'<tr><td>No records.</td></tr>'}</tbody></table></div></div>`+bottomNav()+footer()}
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
  app.innerHTML=header("Settings")+buildCard+`<div class="card"><h2>Vehicle Order</h2><p class="muted">Position 1 is the primary portrait position. Landscape order is left to right.</p></div>${orderRows}${offlineCard}${evidenceCard}<div class="card"><h2>About</h2><p>RGB Mileage ${VERSION}<br>Build Date: ${formatBuildDate(BUILD_DATE)}<br>Schema: ${SCHEMA_VERSION}<br>Migration: ${RGBMDataV3.MIGRATION_VERSION}<br>Evidence: ${RGBMWC10Evidence.EVIDENCE_VERSION}</p><button class="wide danger" onclick="if(confirm('Clear all local data, including retained rollback data?')){clearRGBMStorage(false);state=blankData();saveData();nav('home')}">Clear Local Data</button></div>`+bottomNav()+footer();
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
    const candidate=Number(summary&&summary[key])||0;
    const minimum=Number(floor[key])||0;
    if(candidate<minimum)deficits.push(`${label} ${candidate} < standalone ${minimum}`);
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
  if(!file)return alert("Choose the reconciled recovery candidate JSON first.");
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
        `Reconciled candidate verified: ${summary.configuredCount} configured vehicles, ${summary.fuelRecordCount} fuel, ${summary.maintenanceRecordCount} maintenance, ${summary.insuranceRecordCount} insurance. Source fingerprints match the saved standalone snapshot.`,
        "pass"
      );
      updateRecoveryControls();
    }catch(error){
      recoveryBackupCandidate=null;
      const details=error&&error.details&&error.details.deficits
        ?` ${error.details.deficits.join("; ")}.`
        :"";
      setRecoveryStatus(
        `Reconciled candidate rejected: ${error&&error.message?error.message:String(error)}${details}`,
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
    return alert("Choose and validate the reconciled recovery candidate first.");
  }
  const summary=recoveryBackupCandidate.summary;
  if(!confirm(
    `Restore the reconciled candidate?\n\n`
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
      <h2>2 — Select reconciled candidate</h2>
      <p>Select the downloaded candidate:</p><p class="recovery-filename">RGBM_Reconciled_Recovery_Candidate_3Vehicles_48Fuel_13Maintenance_8Insurance_2026-07-27.json</p>
      <label>Reconciled JSON candidate<input id="recoveryBackupFile" type="file" accept=".json,application/json" onchange="previewRecoveryBackup()"></label>
      <button id="restoreRecoveryButton" class="wide primary" type="button" onclick="restoreSelectedRecoveryBackup()" disabled><span>Archive Source Keys and Restore Reconciled Data</span></button>
      <p class="muted">The button activates only after the candidate matches the standalone pending and legacy fingerprints and does not reduce any preserved count.</p>
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
normalizeLaunchUrl();initApplicationShell();initResponsiveViewportHandling();initOfflineMode();
try{
  state=loadData();
  window.RGBM_WC10_DATA_DIAGNOSTICS=dataDiagnostics;
  window.RGBM_WC10_MIGRATION_EVIDENCE=migrationEvidenceReport;
  render()
}
catch(e){console.error(e);renderDataFatal(e)}
