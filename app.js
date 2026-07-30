const TOTAL_LAYERS = 52;
const GRID_SIZE = 19;
const STORAGE_KEY = "ancientGuardianOakBuilderV3"; // keep existing key so progress is preserved
const APP_VERSION = 11;
const COLUMNS = "ABCDEFGHIJKLMNOPQRS".split("");
const $ = (id) => document.getElementById(id);

const LAYER_ONE_RANGES = {
  1: [[7,12]], 2: [[3,16]], 3: [[3,16]], 4: [[1,4],[15,18]],
  5: [[2,4],[15,18]], 6: [[1,4],[15,17],[19,19]], 7: [[2,4],[15,17]],
  8: [[2,4],[15,17]], 9: [[1,1],[3,4],[15,18]], 10: [[1,4],[15,16],[18,19]],
  11: [[1,4],[15,18]], 12: [[1,4],[15,18]], 13: [[2,4],[15,17]],
  14: [[3,4],[15,16]], 15: [[3,8],[11,16]], 16: [[3,8],[11,16]],
  17: [[3,8],[11,16]], 18: [[4,8],[11,15]], 19: [[5,7],[12,14]]
};

const LAYER_THREE_RANGES = {
  1: [[8,11]], 2: [[4,15]], 3: [[4,15]], 4: [[2,4],[15,17]],
  5: [[2,4],[15,17]], 6: [[2,4],[15,17]], 7: [[2,4],[15,17]],
  8: [[2,4],[15,17]], 9: [[3,4],[15,17]], 10: [[2,4],[15,16],[18,18]],
  11: [[2,4],[15,17]], 12: [[2,4],[15,17]], 13: [[3,4],[15,16]],
  14: [[3,4],[15,16]], 15: [[4,8],[11,15]], 16: [[4,8],[11,15]],
  17: [[4,8],[11,15]], 18: [[5,8],[11,14]], 19: [[6,7],[12,13]]
};

const LAYER_FOUR_RANGES = {
  1: [[8,11]], 2: [[5,14]], 3: [[4,15]], 4: [[2,4],[15,17]],
  5: [[3,4],[15,17]], 6: [[2,4],[15,17]], 7: [[3,4],[15,17]],
  8: [[2,4],[15,17]], 9: [[3,4],[15,17]], 10: [[2,4],[15,16],[18,18]],
  11: [[3,4],[15,17]], 12: [[2,4],[15,17]], 13: [[3,4],[15,16]],
  14: [[3,4],[15,16]], 15: [[4,7],[12,15]], 16: [[4,7],[12,15]],
  17: [[5,7],[12,14]], 18: [[6,7],[12,13]], 19: [[6,7],[12,13]]
};

function cellsFromRanges(ranges) {
  const cells = {};
  Object.entries(ranges).forEach(([row, rowRanges]) => {
    rowRanges.forEach(([start, end]) => {
      for (let col = start; col <= end; col++) cells[`${col - 1},${Number(row) - 1}`] = "wood";
    });
  });
  return cells;
}

function layerOneCells() { return cellsFromRanges(LAYER_ONE_RANGES); }
function layerThreeCells() { return cellsFromRanges(LAYER_THREE_RANGES); }
function layerFourCells() { return cellsFromRanges(LAYER_FOUR_RANGES); }

function freshState() {
  const layers = {};
  for (let i = 1; i <= TOTAL_LAYERS; i++) {
    layers[i] = { cells: (i === 1 || i === 2) ? layerOneCells() : i === 3 ? layerThreeCells() : i === 4 ? layerFourCells() : {}, completed: false, notes: "" };
  }
  return {
    currentLayer: 1,
    selected: null,
    settings: { coordinates: true, grid: true, center: true, showCurrent: true, showPrevious: false, showChanges: true, previewZoom: 95, previewReserved: true },
    layers
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved?.layers) return freshState();
    const base = freshState();
    const mergedLayers = { ...base.layers, ...saved.layers };
    // Layer 2 is a locked verified blueprint. Always restore its approved
    // 162-block pattern while preserving completion status and notes.
    mergedLayers[2] = { ...base.layers[2], ...(mergedLayers[2] || {}), cells: layerOneCells() };
    mergedLayers[3] = { ...base.layers[3], ...(mergedLayers[3] || {}), cells: layerThreeCells() };
    mergedLayers[4] = { ...base.layers[4], ...(mergedLayers[4] || {}), cells: layerFourCells() };
    const savedSettings = saved.settings || {};
    const migratedSettings = { ...base.settings, ...savedSettings };
    // Migrate the old single “Changes Only” checkbox to the new comparison controls.
    if (Object.prototype.hasOwnProperty.call(savedSettings, "changesOnly")) {
      migratedSettings.showCurrent = !savedSettings.changesOnly;
      migratedSettings.showPrevious = false;
      migratedSettings.showChanges = true;
      delete migratedSettings.changesOnly;
    }
    return {
      ...base,
      ...saved,
      settings: migratedSettings,
      layers: mergedLayers
    };
  } catch { return freshState(); }
}

let state = loadState();

const previewView = { yaw: -0.72, pitch: 0.66, dragging: false, pointerId: null, lastX: 0, lastY: 0 };

function authoredPreviewLayer() {
  let last = 1;
  for (let i = 1; i <= state.currentLayer; i++) {
    if (Object.keys(state.layers[i]?.cells || {}).length) last = i;
  }
  return last;
}

function previewBlocks() {
  const blocks = [];
  const top = authoredPreviewLayer();
  for (let z = 0; z < top; z++) {
    const cells = state.layers[z + 1]?.cells || {};
    Object.keys(cells).forEach(key => {
      const [x, y] = key.split(",").map(Number);
      blocks.push({ x: x - (GRID_SIZE - 1) / 2, y: y - (GRID_SIZE - 1) / 2, z });
    });
  }
  return { blocks, top };
}

function rotatePreviewPoint(x, y, z) {
  const cy = Math.cos(previewView.yaw), sy = Math.sin(previewView.yaw);
  const cp = Math.cos(previewView.pitch), sp = Math.sin(previewView.pitch);
  const rx = x * cy - y * sy;
  const ry = x * sy + y * cy;
  return { x: rx, y: ry * cp - z * sp, depth: ry * sp + z * cp };
}

function previewPalette(face, reserved = false) {
  if (reserved) return face === "top" ? "rgba(227,238,247,.72)" : face === "left" ? "rgba(190,211,226,.66)" : "rgba(205,224,236,.68)";
  if (face === "top") return "#a98565";
  if (face === "left") return "#76543d";
  return "#89654b";
}

function drawPreviewPolygon(ctx, points, fill, stroke = "rgba(50,38,27,.34)") {
  ctx.beginPath();
  points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

function renderPreview() {
  const canvas = $("previewCanvas");
  if (!canvas) return;
  const stage = $("previewStage");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(320, stage.clientWidth);
  const height = Math.max(300, stage.clientHeight);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const { blocks, top } = previewBlocks();
  $("previewLayerNumber").textContent = top;
  const zoom = Number(state.settings.previewZoom || 95) / 100;
  const scale = Math.min(width / 34, height / 21) * zoom;
  const centerX = width / 2;
  const centerY = height * .67;
  const projected = (x, y, z) => {
    const p = rotatePreviewPoint(x, y, z);
    return { x: centerX + p.x * scale, y: centerY + p.y * scale, depth: p.depth };
  };

  const items = [];
  const addCube = (x, y, z, reserved = false, h = 1) => {
    const pts = [
      [x-.5,y-.5,z], [x+.5,y-.5,z], [x+.5,y+.5,z], [x-.5,y+.5,z],
      [x-.5,y-.5,z+h], [x+.5,y-.5,z+h], [x+.5,y+.5,z+h], [x-.5,y+.5,z+h]
    ].map(v => projected(...v));
    const avg = pts.reduce((sum,p)=>sum+p.depth,0)/pts.length;
    items.push({ depth: avg, pts, reserved });
  };
  blocks.forEach(b => addCube(b.x,b.y,b.z));

  if (state.settings.previewReserved) {
    // E4–N14 reserved footprint, shown as one translucent volume from ground to the authored top.
    const xCenter = ((4 + 13) / 2) - (GRID_SIZE - 1) / 2;
    const yCenter = ((3 + 13) / 2) - (GRID_SIZE - 1) / 2;
    const xSize = 10, ySize = 11;
    const x0=xCenter-xSize/2, x1=xCenter+xSize/2, y0=yCenter-ySize/2, y1=yCenter+ySize/2, z0=0, z1=Math.max(2.3, top*.82);
    const pts = [[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]].map(v=>projected(...v));
    items.push({ depth: pts.reduce((s,p)=>s+p.depth,0)/8 - .15, pts, reserved:true });
  }

  items.sort((a,b)=>a.depth-b.depth);
  items.forEach(({pts,reserved}) => {
    const topFace=[pts[4],pts[5],pts[6],pts[7]];
    const leftFace=[pts[0],pts[3],pts[7],pts[4]];
    const rightFace=[pts[1],pts[2],pts[6],pts[5]];
    drawPreviewPolygon(ctx,leftFace,previewPalette("left",reserved), reserved ? "rgba(76,113,137,.32)" : undefined);
    drawPreviewPolygon(ctx,rightFace,previewPalette("right",reserved), reserved ? "rgba(76,113,137,.32)" : undefined);
    drawPreviewPolygon(ctx,topFace,previewPalette("top",reserved), reserved ? "rgba(76,113,137,.42)" : undefined);
  });

  // Ground orientation marker.
  ctx.save();
  ctx.fillStyle = "rgba(40,39,31,.75)";
  ctx.font = "800 12px ui-rounded, system-ui";
  ctx.textAlign = "center";
  const north = projected(0,-12,0);
  ctx.fillText("NORTH ↑", north.x, north.y - 5);
  ctx.restore();
}

function resetPreviewView() {
  previewView.yaw = -0.72;
  previewView.pitch = 0.66;
  renderPreview();
}

function setupPreviewControls() {
  const stage = $("previewStage");
  const zoom = $("previewZoom");
  const reserved = $("previewReserved");
  if (!stage || !zoom || !reserved) return;
  zoom.value = state.settings.previewZoom || 95;
  reserved.checked = state.settings.previewReserved !== false;
  zoom.addEventListener("input", e => { state.settings.previewZoom = Number(e.target.value); save(); renderPreview(); });
  reserved.addEventListener("change", e => { state.settings.previewReserved = e.target.checked; save(); renderPreview(); });
  $("previewReset").addEventListener("click", resetPreviewView);

  stage.addEventListener("pointerdown", e => {
    previewView.dragging = true; previewView.pointerId = e.pointerId; previewView.lastX = e.clientX; previewView.lastY = e.clientY;
    stage.setPointerCapture(e.pointerId); stage.classList.add("dragging");
  });
  stage.addEventListener("pointermove", e => {
    if (!previewView.dragging || e.pointerId !== previewView.pointerId) return;
    const dx=e.clientX-previewView.lastX, dy=e.clientY-previewView.lastY;
    previewView.lastX=e.clientX; previewView.lastY=e.clientY;
    previewView.yaw += dx * .010;
    previewView.pitch = Math.max(.22, Math.min(1.18, previewView.pitch + dy * .008));
    renderPreview();
  });
  const endDrag = e => {
    if (e.pointerId !== previewView.pointerId) return;
    previewView.dragging=false; previewView.pointerId=null; stage.classList.remove("dragging");
  };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("wheel", e => {
    e.preventDefault();
    const next=Math.max(55,Math.min(150,Number(state.settings.previewZoom||95)-Math.sign(e.deltaY)*5));
    state.settings.previewZoom=next; zoom.value=next; save(); renderPreview();
  }, {passive:false});
  window.addEventListener("resize", renderPreview);
}

let deferredPrompt = null;
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const centerCell = (x,y) => x >= 4 && x <= 13 && y >= 3 && y <= 13;
const entranceCell = (x,y) => x >= 8 && x <= 9 && y >= 14 && y <= 18;

function cellDisplay(x,y) {
  const key = `${x},${y}`;
  const currentHas = Boolean(state.layers[state.currentLayer].cells[key]);
  const hasPreviousLayer = state.currentLayer > 1;
  const previousHas = hasPreviousLayer && Boolean(state.layers[state.currentLayer - 1].cells[key]);
  const classes = [];
  let primary = "ground";

  // Base view: current-layer blocks always remain ordinary brown build blocks.
  // The previous layer is only a gray ghost when explicitly enabled and when
  // there is no current block in that square.
  if (state.settings.showCurrent && currentHas) {
    primary = "wood";
    classes.push("wood");
  } else if (state.settings.showPrevious && previousHas) {
    primary = "previous";
    classes.push("previous");
  } else if (state.currentLayer <= 4 && state.settings.center && entranceCell(x,y)) {
    primary = "entrance";
    classes.push("entrance");
  } else if (state.currentLayer <= 4 && state.settings.center && centerCell(x,y)) {
    primary = "clearance";
    classes.push("clearance");
  } else {
    classes.push("ground");
  }

  // Changes are overlays, not replacement cell types. A removal X can only
  // appear where the current layer is empty and the previous layer had a block.
  // An addition marker can only appear on a current block absent below.
  if (state.settings.showChanges && hasPreviousLayer) {
    if (!currentHas && previousHas) classes.push("change-removed");
    if (currentHas && !previousHas) classes.push("change-added");
  }

  return { primary, classes, currentHas, previousHas };
}

function cellType(x,y) {
  const display = cellDisplay(x,y);
  if (display.classes.includes("change-removed")) return "removed";
  if (display.classes.includes("change-added")) return "added";
  return display.primary;
}

function materialName(type) {
  return ({wood:"Puffy Tree Pillar on current layer", added:"Add Puffy Tree Pillar", removed:"Block existed below — do not place one here", previous:"Previous-layer block (reference only)", clearance:"Reserved Pokémon Center", entrance:"South entrance opening", ground:"Empty ground"})[type];
}

function statusName(type) {
  return ["wood","added"].includes(type) ? "Place block" : type === "removed" ? "Omit on this layer" : type === "previous" ? "Reference only — already built below" : type === "ground" ? "Leave empty" : "Keep clear";
}

function renderBlueprint() {
  const grid = $("blueprint");
  grid.innerHTML = "";
  grid.classList.toggle("no-grid", !state.settings.grid);
  grid.classList.toggle("hide-coordinates", !state.settings.coordinates);

  const corner = document.createElement("div");
  corner.className = "axis-label";
  grid.appendChild(corner);
  COLUMNS.forEach(letter => {
    const label = document.createElement("div");
    label.className = "axis-label";
    label.textContent = letter;
    grid.appendChild(label);
  });

  for (let y = 0; y < GRID_SIZE; y++) {
    const rowLabel = document.createElement("div");
    rowLabel.className = "axis-label";
    rowLabel.textContent = y + 1;
    grid.appendChild(rowLabel);
    for (let x = 0; x < GRID_SIZE; x++) {
      const display = cellDisplay(x,y);
      const type = cellType(x,y);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `cell ${display.classes.join(" ")}`;
      button.dataset.x = x;
      button.dataset.y = y;
      button.setAttribute("aria-label", `${COLUMNS[x]}${y+1}, ${materialName(type)}`);
      if (state.selected?.x === x && state.selected?.y === y) button.classList.add("selected");
      button.addEventListener("click", () => {
        state.selected = {x,y};
        save();
        renderBlueprint();
        renderInspector();
      });
      grid.appendChild(button);
    }
  }
}

function renderInspector() {
  if (!state.selected) {
    $("selectedCoordinate").textContent = "Tap a square";
    $("selectedMaterial").textContent = "—";
    $("selectedStatus").textContent = "—";
    return;
  }
  const {x,y} = state.selected;
  const type = cellType(x,y);
  $("selectedCoordinate").textContent = `${COLUMNS[x]}${y+1}`;
  $("selectedMaterial").textContent = materialName(type);
  $("selectedStatus").textContent = statusName(type);
}

function renderSummary() {
  const count = Object.keys(state.layers[state.currentLayer].cells).length;
  $("blockTotal").textContent = `${count} block${count === 1 ? "" : "s"}`;
  $("focusCount").textContent = `${count} blocks`;
  const facts = state.currentLayer === 1
    ? [["Grid","19 × 19"],["Center","E4–N14 (10 × 11)"],["Wall","2 blocks thick"],["Entrance","I15–J19"],["Material","Puffy Tree Pillar"]]
    : state.currentLayer === 2
      ? [["Grid","19 × 19"],["Placement","Directly above Layer 1"],["Changes","None"],["Entrance","I15–J19 remains open"],["Material","Puffy Tree Pillar"]]
      : state.currentLayer === 3
        ? [["Grid","19 × 19"],["Placement","Above Layer 2"],["Blocks","131 Puffy Tree Pillars"],["Omitted from Layer 2","31 positions"],["Front","Courtyard remains open"]]
        : state.currentLayer === 4
          ? [["Grid","19 × 19"],["Placement","Above Layer 3"],["Blocks","114 Puffy Tree Pillars"],["Omitted from Layer 3","17 positions"],["Shape","Gentle trunk taper; shelf bulbs retained"]]
          : [["Status","Awaiting verified blueprint"],["Placed blocks",String(count)]];
  $("summaryFacts").innerHTML = facts.map(([k,v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
}

function renderMeta() {
  const layer = state.currentLayer;
  const data = state.layers[layer];
  $("layerRange").value = layer;
  $("layerNumber").value = layer;
  $("layerTitle").textContent = `Layer ${layer}`;
  $("focusLayer").textContent = `Layer ${layer}`;
  $("phaseLabel").textContent = layer === 1
    ? "Exact foundation blueprint"
    : layer === 2
      ? "Verified matching footprint"
      : layer === 3
        ? "Root taper and open courtyard"
        : layer === 4
          ? "Lower trunk shaping and natural shelves"
          : "Awaiting verified blueprint";
  $("layerGuidance").textContent = layer === 1
    ? "Build the approved 19×19 ground-level footprint. Keep E4–N14 empty for the Pokémon Center and I15–J19 open for the south entrance."
    : layer === 2
      ? "Place one Puffy Tree Pillar directly above every Layer 1 tree block. Do not add or remove blocks. Keep the Pokémon Center space and south entrance open."
      : layer === 3
        ? "Build 131 Puffy Tree Pillars above Layer 2. Red X squares show the 31 Layer 2 positions that stop here—do not place blocks above them. Brown squares are Layer 3 blocks."
        : layer === 4
          ? "Build 114 Puffy Tree Pillars above Layer 3. Red X squares mark 17 positions that stop at Layer 3. Keep the front courtyard open and preserve the small side shelf protrusions for mushrooms, glowing lights, and other decorations."
          : "This layer remains blank until we verify its shape in Pokopia.";
  $("layerNotes").value = data.notes || "";
  $("layerStatus").textContent = data.completed ? "Complete" : "Not complete";
  $("layerStatus").classList.toggle("complete", data.completed);
  $("completeLayer").textContent = data.completed ? "Mark layer incomplete" : "Mark layer complete";
}

function renderProgress() {
  const completed = Object.values(state.layers).filter(l => l.completed).length;
  $("progressLabel").textContent = `${completed} / ${TOTAL_LAYERS}`;
  $("progressBar").style.width = `${completed / TOTAL_LAYERS * 100}%`;
}

function renderSettings() {
  $("coordinatesToggle").checked = state.settings.coordinates;
  $("gridToggle").checked = state.settings.grid;
  $("pokeCenterToggle").checked = state.settings.center;
  $("currentToggle").checked = state.settings.showCurrent;
  $("previousToggle").checked = state.settings.showPrevious;
  $("changesToggle").checked = state.settings.showChanges;
  $("previousToggle").disabled = state.currentLayer === 1;
  $("changesToggle").disabled = state.currentLayer === 1;
}

function renderAll() { renderMeta(); renderSettings(); renderBlueprint(); renderInspector(); renderSummary(); renderProgress(); renderPreview(); }
function setLayer(value) {
  state.currentLayer = Math.max(1, Math.min(TOTAL_LAYERS, Number(value) || 1));
  state.selected = null;
  // Always open a selected layer in normal build view. This prevents a
  // previously configured changes-only view from making the new layer look
  // like it contains nothing but red removal markers.
  state.settings.showCurrent = true;
  state.settings.showPrevious = false;
  state.settings.showChanges = state.currentLayer > 1;
  save(); renderAll();
}

$("previousLayer").addEventListener("click", () => setLayer(state.currentLayer - 1));
$("nextLayer").addEventListener("click", () => setLayer(state.currentLayer + 1));
$("layerRange").addEventListener("input", e => setLayer(e.target.value));
$("layerNumber").addEventListener("change", e => setLayer(e.target.value));

[["coordinatesToggle","coordinates"],["gridToggle","grid"],["pokeCenterToggle","center"],["currentToggle","showCurrent"],["previousToggle","showPrevious"],["changesToggle","showChanges"]].forEach(([id,key]) => {
  $(id).addEventListener("change", e => { state.settings[key] = e.target.checked; save(); renderBlueprint(); renderInspector(); });
});

$("completeLayer").addEventListener("click", () => {
  state.layers[state.currentLayer].completed = !state.layers[state.currentLayer].completed;
  save(); renderMeta(); renderProgress();
});

$("resetLayer").addEventListener("click", () => {
  if (!confirm(`Restore the approved pattern for Layer ${state.currentLayer}?`)) return;
  state.layers[state.currentLayer].cells = state.currentLayer <= 2 ? layerOneCells() : state.currentLayer === 3 ? layerThreeCells() : state.currentLayer === 4 ? layerFourCells() : {};
  state.selected = null;
  save(); renderAll();
});

$("layerNotes").addEventListener("input", e => { state.layers[state.currentLayer].notes = e.target.value; save(); });

$("focusMode").addEventListener("click", () => {
  document.body.classList.add("focus-active");
  $("focusToolbar").classList.remove("hidden");
});
$("exitFocus").addEventListener("click", () => {
  document.body.classList.remove("focus-active");
  $("focusToolbar").classList.add("hidden");
});

$("exportProject").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "ancient-guardian-oak-progress.json"; a.click();
  URL.revokeObjectURL(url);
});

$("importProject").addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const incoming = JSON.parse(await file.text());
    if (!incoming.layers) throw new Error();
    const base = freshState();
    const incomingSettings = incoming.settings || {};
    const migratedSettings = { ...base.settings, ...incomingSettings };
    if (Object.prototype.hasOwnProperty.call(incomingSettings, "changesOnly")) {
      migratedSettings.showCurrent = !incomingSettings.changesOnly;
      migratedSettings.showPrevious = false;
      migratedSettings.showChanges = true;
      delete migratedSettings.changesOnly;
    }
    state = { ...base, ...incoming, settings: migratedSettings, layers: { ...base.layers, ...incoming.layers } };
    state.layers[2] = { ...state.layers[2], cells: layerOneCells() };
    state.layers[3] = { ...state.layers[3], cells: layerThreeCells() };
    state.layers[4] = { ...state.layers[4], cells: layerFourCells() };
    save(); renderAll(); alert("Progress imported.");
  } catch { alert("That progress file could not be imported."); }
  e.target.value = "";
});

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault(); deferredPrompt = e; $("installButton").classList.remove("hidden");
});
$("installButton").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null;
  $("installButton").classList.add("hidden");
});

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
setupPreviewControls();
renderAll();
