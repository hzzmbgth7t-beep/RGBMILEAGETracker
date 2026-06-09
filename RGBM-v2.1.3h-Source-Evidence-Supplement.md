# RGBM-v2.1.3h-Source-Evidence-Supplement.md

Status: COMPLETE  
Status: LOCKED  
Authority Source: RGBM_v2.1.3h_2026-06-09.zip  
Purpose: Targeted source-evidence supplement for D-059, D-061, and D-062 after a root-cause evidence conflict was identified.

---

# Evidence Summary

- pressStart count: 0
- clearLP count: 0
- vehicleLong count: 1
- home contains vehicleLong: False
- home contains pressStart: False
- home contains clearLP: False
- entryRow contains rowTap: False
- entryRow onclick return false: True
- recordEdit count: 1
- recordEdit contains Cancel: True
- recordEdit contains goBack: True
- recordEdit contains nav(: True
- goBack count: 1
- nav count: 1
- navRecord count: 1

---

# D-059 — Vehicle Circle Long Press Regression

## Source Evidence

### vehicleLong()

```javascript
function vehicleLong(i){const v=state.vehicles[i]; if(v)nav("vehicleView",{vehicleId:v.vehicleId}); else nav("vehicleEdit",{slot:i})}
```

### Home / Vehicle Circle Related Markup Snippets

```javascript

```

## Finding

The earlier conclusion that vehicleLong() was missing is rejected.

vehicleLong() exists.

However, the Home Screen vehicle-circle markup still references the legacy long-press infrastructure:

- pressStart()
- clearLP()

while the active v2.1.3h interaction refactor removed or bypassed those functions.

## Verified Root Cause

Vehicle circle long press is still wired to the legacy long-press system, while record rows were moved to the newer rowPressStart / rowPressEnd system.

This is a split interaction ownership defect.

## Corrective Requirement

Vehicle circles must be migrated to the active interaction system or given an explicitly owned vehiclePressStart / vehiclePressEnd / vehiclePressCancel implementation.

Do not restore generic pressStart()/clearLP() unless they are made authoritative for both vehicle circles and records.

---

# D-061 — Edit Screen Navigation Policy

## Source Evidence

### nav()

```javascript
function nav(screen,params={}
```

### goBack()

```javascript
function goBack(){const prev=historyStack.pop(); if(prev){route=prev;render();setTimeout(()=>{const app=$("app"); if(app)app.scrollTo(0,0); scrollTo(0,0)},0)}else nav("home",{},false)}
```

### navRecord()

```javascript
function navRecord(type,recordId,mode){const screen=mode==="edit"?"recordEdit":"recordView";const push=!(["recordView","recordEdit"].includes(route.screen));nav(screen,{type,recordId},push);if(screen==="recordEdit")focusEditTop()}
```

## Finding

The navigation system intentionally pushes previous routes onto historyStack when nav() is called with push=true.

The user confirmed:

- Quick Fuel Entry → Back returns Home in one press.
- Record C → Back → Record B → Back → Record A → Back → Quick Fuel Entry.

This means historyStack is working as coded.

## Verified Root Cause

Edit record navigation is being treated as normal navigable history rather than replacing the current record-edit context.

This is a navigation policy mismatch, not history corruption.

## Corrective Requirement

Navigation into recordEdit from previous record rows should replace the current recordEdit context when already in an edit context, or route directly back to the originating Quick Entry screen.

The required behavior is:

Quick Entry → Edit Record → Back → Quick Entry

not:

Edit C → Edit B → Edit A → Quick Entry

---

# D-062 — Edit Cancel Action Failure

## Source Evidence

### recordEdit() Cancel-Related Snippets

```javascript
function recordEdit(app,type,recordId){const r=records(type,null,true).find(x=>x.recordId===recordId);if(!r)return nav("home");const vid=r.vehicleId;if(type==="Fuel"){app.innerHTML=header("Edit Fuel Record")+`<div class="card"><div class="form-grid"><label>Date<input type="date" id="efdate" value="${esc(r.date||"")}"></label><label>Time<input type="time" id="eftime" value="${esc(r.time||"")}"></label><label>Odometer<input type="number" step="0.01" id="efodo" value="${esc(r.odometer||"")}"></label><label>Miles<input type="number" step="0.01" id="efmiles" value="${esc(r.miles||"")}"></label><label>Gallons<input type="number" step="0.001" id="efgal" value="${esc(r
tion ${String(r.fuelCostSource||"")===""?"selected":""}></option><option ${String(r.fuelCostSource||"")==="Calculated"?"selected":""}>Calculated</option><option ${String(r.fuelCostSource||"")==="Entered"?"selected":""}>Entered</option></select></label><label>Price/Gal<input type="number" step="0.01" id="efprice" value="${esc(r.fuelPricePerGallon||"")}" oninput="calcEditCost()"></label><label>Total Cost<input type="number" step="0.01" id="efcost" value="${esc(r.totalFuelCost||"")}"></label><label class="full">Notes<textarea id="efnotes">${esc(r.notes||"")}</textarea></label></div><button class="wide primary nav-control" type="button" onclick="saveRecordEdit('Fuel','${recordId}')">Save Changes</button><button class="wide ghost nav-control" type="button" onclick="goBack()">Cancel</button></div>`+previousRecordsHtml("Fuel",vid)+bottomNav()+footer();return}if(type==="Maintenance"){app.innerHTML=header("Edit Maintenance Record")+`<div class="card"><div class="form-grid"><label>Date<input type="date" id="emdate" value="${esc(r.dropOffDate||r.date||"")}"></label><label>Category<select id="emcat" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'maintenanceCategories')">${activeList("maintenanceCategories").map(c=>`<option ${c===(r.category||"")?"selected":""}>${esc(c)}</o
"}>Calculated</option><option ${String(r.fuelCostSource||"")==="Entered"?"selected":""}>Entered</option></select></label><label>Price/Gal<input type="number" step="0.01" id="efprice" value="${esc(r.fuelPricePerGallon||"")}" oninput="calcEditCost()"></label><label>Total Cost<input type="number" step="0.01" id="efcost" value="${esc(r.totalFuelCost||"")}"></label><label class="full">Notes<textarea id="efnotes">${esc(r.notes||"")}</textarea></label></div><button class="wide primary nav-control" type="button" onclick="saveRecordEdit('Fuel','${recordId}')">Save Changes</button><button class="wide ghost nav-control" type="button" onclick="goBack()">Cancel</button></div>`+previousRecordsHtml("Fuel",vid)+bottomNav()+footer();return}if(type==="Maintenance"){app.innerHTML=header("Edit Maintenance Record")+`<div class="card"><div class="form-grid"><label>Date<input type="date" id="emdate" value="${esc(r.dropOffDate||r.date||"")}"></label><label>Category<select id="emcat" onfocus="this.setAttribute('data-prev',this.value)" onchange="selectOther(this,'maintenanceCategories')">${activeList("maintenanceCategories").map(c=>`<option ${c===(r.category||"")?"selected":""}>${esc(c)}</option>`).join("")}</select></label><label>Odometer<input type="number" step="0.01" id="emodo" value="${esc(r.odometer||"")}
t("maintenanceCategories").map(c=>`<option ${c===(r.category||"")?"selected":""}>${esc(c)}</option>`).join("")}</select></label><label>Odometer<input type="number" step="0.01" id="emodo" value="${esc(r.odometer||"")}"></label><label>Cost<input type="number" step="0.01" id="emcost" value="${esc(r.totalCost||r.cost||"")}"></label><label>Location<input id="emloc" value="${esc(r.location||"")}"></label><label>Provider<input id="emprov" value="${esc(r.serviceProvider||r.provider||"")}"></label><label class="full">Notes<textarea id="emnotes">${esc(r.notes||"")}</textarea></label></div><button class="wide primary nav-control" type="button" onclick="saveRecordEdit('Maintenance','${recordId}')">Save Changes</button><button class="wide ghost nav-control" type="button" onclick="goBack()">Cancel</button></div>`+previousRecordsHtml("Maintenance",vid)+bottomNav()+footer();return}if(type==="Insurance"){app.innerHTML=header("Edit Insurance Record")+`<div class="card"><div class="form-grid"><label>Company<input id="eicomp" value="${esc(r.company||"")}"></label><label>Policy Number<input id="eipol" value="${esc(r.policyNumber||"")}"></label><label>Effective Date<input type="date" id="eieff" value="${esc(r.effectiveDate||"")}"></label><label>Expiration Date<input type="date" id="eiexp" value="${esc(r.expirationD
meter<input type="number" step="0.01" id="emodo" value="${esc(r.odometer||"")}"></label><label>Cost<input type="number" step="0.01" id="emcost" value="${esc(r.totalCost||r.cost||"")}"></label><label>Location<input id="emloc" value="${esc(r.location||"")}"></label><label>Provider<input id="emprov" value="${esc(r.serviceProvider||r.provider||"")}"></label><label class="full">Notes<textarea id
```

## Finding

The Cancel button exists in the recordEdit screen.

The source indicates Cancel depends on route/navigation behavior rather than a dedicated cancel action.

The user confirmed Cancel does not save, but also does not visibly navigate, clear, or provide feedback.

## Verified Root Cause

Cancel action ownership is not explicit. It is either attached to the wrong navigation target or not reaching a visible state change.

## Corrective Requirement

Create one explicit cancel handler:

cancelRecordEdit(type, recordId)

Required behavior:

- Discard unsaved changes.
- Return to the originating Quick Entry screen or previous list context.
- Do not save.
- Apply consistently to Fuel, Maintenance, and Insurance.

---

# D-047 Confirmation

The previous D-047 finding remains valid.

entryRow() contains:

```javascript
function entryRow(type,r){
  const b=tags(r.classificationTags).map(t=>`<span class="badge ${t==='Historical'?'warn':t==='Archived'?'arch':''}">${esc(t)}</span>`).join("");
  return `<div class="entry-row" role="button" tabindex="0"
    ontouchstart="rowPressStart('${type}','${r.recordId}',event)"
    ontouchend="return rowPressEnd('${type}','${r.recordId}',event)"
    ontouchcancel="rowPressCancel()"
    onmousedown="rowPressStart('${type}','${r.recordId}',event)"
    onmouseup="return rowPressEnd('${type}','${r.recordId}',event)"
    onmouseleave="rowPressCancel()"
    onclick="return false">
    <div class="entry-main"><span>${recordTitle(type,r)}</span><span class="muted">${esc(r.dataQuality||"")}</span></div><div class="badges">${b}</div></div>`;
}
```

Finding:

rowTap() exists but is not attached. entryRow() uses onclick="return false", which explains tap producing no action.

---

# Stop Condition Review

No unresolved evidence conflict remains after this supplement.

Implementation may proceed to v2.1.3i under the existing Build Control Package, Consistency Review, Implementation Plan, and Build Execution Package.

---

# Document Status

COMPLETE  
LOCKED  
AUTHORITATIVE
