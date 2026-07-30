const TOTAL_LAYERS = 52;
const GRID_SIZE = 19;
const STORAGE_KEY = "ancientGuardianOakBuilderV3"; // keep existing key so progress is preserved
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
    settings: { coordinates: true, grid: true, center: true, showCurrent: true, showPrevious: false, showChanges: true },
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
let deferredPrompt = null;
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const centerCell = (x,y) => x >= 4 && x <= 13 && y >= 3 && y <= 13;
const entranceCell = (x,y) => x >= 8 && x <= 9 && y >= 14 && y <= 18;

function cellType(x,y) {
  const key = `${x},${y}`;
  const currentHas = Boolean(state.layers[state.currentLayer].cells[key]);
  const hasPreviousLayer = state.currentLayer > 1;
  const previousHas = hasPreviousLayer && Boolean(state.layers[state.currentLayer - 1].cells[key]);

  // Changes are always drawn first so removals can never disappear beneath
  // the Pokémon Center overlay or the previous-layer ghost.
  if (state.settings.showChanges && hasPreviousLayer) {
    if (currentHas && !previousHas) return "added";
    if (!currentHas && previousHas) return "removed";
  }

  if (state.settings.showCurrent && currentHas) return "wood";
  if (state.settings.showPrevious && previousHas) return "previous";

  if (state.currentLayer <= 4 && state.settings.center && entranceCell(x,y)) return "entrance";
  if (state.currentLayer <= 4 && state.settings.center && centerCell(x,y)) return "clearance";
  return "ground";
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
      const type = cellType(x,y);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `cell ${type}`;
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

function renderAll() { renderMeta(); renderSettings(); renderBlueprint(); renderInspector(); renderSummary(); renderProgress(); }
function setLayer(value) {
  state.currentLayer = Math.max(1, Math.min(TOTAL_LAYERS, Number(value) || 1));
  state.selected = null;
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
renderAll();
