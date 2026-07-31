const TOTAL_LAYERS = 52;
const GRID_SIZE = 19;
const STORAGE_KEY = "ancientGuardianOakBuilderV3"; // keep existing key so progress is preserved
const APP_VERSION = 2115;
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

const LAYER_FIVE_RANGES = {
  1: [[8,11]], 2: [[5,13]], 3: [[4,14]], 4: [[2,4],[15,17]],
  5: [[3,4],[15,16]], 6: [[2,4],[15,17]], 7: [[3,4],[15,16]],
  8: [[2,4],[15,17]], 9: [[3,4],[15,16]], 10: [[2,4],[15,16],[18,18]],
  11: [[3,4],[15,16]], 12: [[2,4],[15,16]], 13: [[3,4],[15,16]],
  14: [[3,4],[15,16]], 15: [[4,7],[12,15]], 16: [[4,7],[12,15]],
  17: [[5,7],[12,14]], 18: [[6,7],[12,13]], 19: [[6,7],[12,13]]
};

const LAYER_SIX_RANGES = {
  1: [[8,11]], 2: [[5,12]], 3: [[4,13]], 4: [[2,4],[15,16]],
  5: [[3,4],[15,16]], 6: [[2,4],[15,17]], 7: [[3,4],[15,16]],
  8: [[2,4],[15,16]], 9: [[3,4],[15,16]], 10: [[2,4],[15,16],[18,18]],
  11: [[3,4],[15,16]], 12: [[2,4],[15,16]], 13: [[3,4],[15,16]],
  14: [[3,4],[15,16]], 15: [[4,7],[12,14]], 16: [[4,7],[12,14]],
  17: [[5,7],[12,14]], 18: [[6,7],[12,13]], 19: [[6,7],[12,13]]
};

const LAYER_SEVEN_RANGES = {
  1: [[8,10]], 2: [[6,12]], 3: [[4,12]], 4: [[2,4],[15,16]],
  5: [[3,4],[15,16]], 6: [[2,4],[15,16]], 7: [[3,4],[15,16]],
  8: [[3,4],[15,16]], 9: [[3,4],[15,16]], 10: [[2,4],[15,16],[18,18]],
  11: [[3,4],[15,16]], 12: [[3,4],[15,16]], 13: [[3,4],[15,16]],
  14: [[3,4],[15,16]], 15: [[4,7],[12,13]], 16: [[4,7],[12,14]],
  17: [[6,7],[12,14]], 18: [[6,7],[12,13]], 19: [[6,7],[12,13]]
};

const LAYER_EIGHT_RANGES = {
  1: [[8,10]], 2: [[6,11]], 3: [[5,12]], 4: [[2,4],[15,16]],
  5: [[3,4],[15,16]], 6: [[2,4],[15,16]], 7: [[3,4],[15,16]],
  8: [[3,4],[15,16]], 9: [[3,4],[15,16]], 10: [[2,4],[15,16],[18,18]],
  11: [[3,4],[15,16]], 12: [[3,4],[15,16]], 13: [[3,4],[15,16]],
  14: [[3,4],[15,16]], 15: [[4,7],[12,13]], 16: [[4,7],[12,13]],
  17: [[6,7],[12,13]], 18: [[6,7],[12,13]], 19: [[6,7],[12,13]]
};

const LAYER_NINE_RANGES = {
  1: [[8,9]], 2: [[6,10]], 3: [[4,11]], 4: [[2,3],[15,16]],
  5: [[3,4],[15,15]], 6: [[2,4],[15,16]], 7: [[3,3],[15,16]],
  8: [[3,4],[15,15]], 9: [[3,3],[15,16]], 10: [[2,4],[15,16],[18,18]],
  11: [[3,4],[15,15]], 12: [[3,3],[15,16]], 13: [[3,4],[15,16]],
  14: [[3,3],[15,15]], 15: [[4,6],[12,14]], 16: [[4,7],[12,14]],
  17: [[6,7],[12,14]], 18: [[6,7],[12,13]], 19: [[6,6],[12,13]]
};

const LAYER_TEN_RANGES = {
  1: [[8,8]], 2: [[6,10]], 3: [[4,11]], 4: [[2,3],[15,16]],
  5: [[3,6],[15,15]], 6: [[2,7],[15,16]], 7: [[3,3],[5,6],[15,16]],
  8: [[3,4],[15,15]], 9: [[3,3],[15,16]], 10: [[2,4],[15,16],[18,18]],
  11: [[3,4],[15,15]], 12: [[3,3],[15,16]], 13: [[3,4],[11,16]],
  14: [[3,3],[12,15]], 15: [[4,6],[12,14]], 16: [[4,7],[12,14]],
  17: [[6,7],[12,14]], 18: [[6,7],[12,13]], 19: [[6,6],[12,12]]
};

const LAYER_ELEVEN_RANGES = {
  1: [[8,8]], 2: [[6,9]], 3: [[5,11]], 4: [[2,4],[15,15]],
  5: [[3,7],[15,15]], 6: [[2,8],[15,16]], 7: [[3,3],[5,7],[15,16]],
  8: [[3,3],[15,15]], 9: [[3,3],[15,16]], 10: [[1,4],[15,18]],
  11: [[3,4],[15,15]], 12: [[3,3],[14,15]], 13: [[3,4],[10,16]],
  14: [[3,3],[11,15]], 15: [[4,6],[11,14]], 16: [[4,7],[12,14]],
  17: [[6,7],[12,14]], 18: [[6,7],[12,13]], 19: [[6,6],[12,12]]
};

const LAYER_TWELVE_RANGES = {
  1: [[8,8]], 2: [[6,9]], 3: [[5,10]], 4: [[3,4],[15,15]],
  5: [[3,7],[15,15]], 6: [[3,8],[15,16]], 7: [[3,3],[5,8],[15,16]],
  8: [[3,3],[15,15]], 9: [[3,3],[15,16]], 10: [[2,4],[15,16],[18,18]],
  11: [[3,4],[15,15]], 12: [[3,3],[14,15]], 13: [[3,4],[10,15]],
  14: [[3,3],[11,15]], 15: [[4,6],[12,14]], 16: [[5,7],[12,14]],
  17: [[6,7],[12,13]], 18: [[6,7],[12,13]], 19: [[6,6],[12,12]]
};

const LAYER_THIRTEEN_RANGES = {
  1: [[8,8]], 2: [[6,9]], 3: [[5,9]], 4: [[3,4],[15,15]],
  5: [[3,7],[15,15]], 6: [[3,8],[15,15]], 7: [[3,3],[5,8],[15,15]],
  8: [[3,3],[15,15]], 9: [[3,3],[15,15]], 10: [[2,4],[15,16]],
  11: [[2,4],[15,15]], 12: [[3,3],[14,15]], 13: [[3,4],[10,14]],
  14: [[3,3],[11,14]], 15: [[4,6],[12,14]], 16: [[5,7],[12,13]],
  17: [[6,7],[12,13]], 18: [[6,7],[12,13]], 19: [[6,6],[12,12]]
};
const LAYER_FOURTEEN_RANGES = {
  1: [[8,8]], 2: [[6,8]], 3: [[6,8]], 4: [[4,4],[15,15]],
  5: [[4,7],[15,15]], 6: [[4,8],[15,15]], 7: [[3,3],[6,8],[15,15]],
  8: [[3,3],[15,15]], 9: [[3,3],[15,15]], 10: [[1,4],[15,16]],
  11: [[3,4],[15,15]], 12: [[3,3],[14,15]], 13: [[3,4],[11,14]],
  14: [[3,3],[11,14]], 15: [[4,6],[12,13]], 16: [[5,7],[12,13]],
  17: [[6,7],[12,13]], 18: [[6,7],[12,12]], 19: [[6,6],[12,12]]
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
function layerFiveCells() { return cellsFromRanges(LAYER_FIVE_RANGES); }
function layerSixCells() { return cellsFromRanges(LAYER_SIX_RANGES); }
function layerSevenCells() { return cellsFromRanges(LAYER_SEVEN_RANGES); }
function layerEightCells() { return cellsFromRanges(LAYER_EIGHT_RANGES); }
function layerNineCells() { return cellsFromRanges(LAYER_NINE_RANGES); }
function layerTenCells() { return cellsFromRanges(LAYER_TEN_RANGES); }
function layerElevenCells() { return cellsFromRanges(LAYER_ELEVEN_RANGES); }
function layerTwelveCells() { return cellsFromRanges(LAYER_TWELVE_RANGES); }
function layerThirteenCells() { return cellsFromRanges(LAYER_THIRTEEN_RANGES); }
function layerFourteenCells() { return cellsFromRanges(LAYER_FOURTEEN_RANGES); }

function freshState() {
  const layers = {};
  for (let i = 1; i <= TOTAL_LAYERS; i++) {
    layers[i] = { cells: (i === 1 || i === 2) ? layerOneCells() : i === 3 ? layerThreeCells() : i === 4 ? layerFourCells() : i === 5 ? layerFiveCells() : i === 6 ? layerSixCells() : i === 7 ? layerSevenCells() : i === 8 ? layerEightCells() : i === 9 ? layerNineCells() : i === 10 ? layerTenCells() : i === 11 ? layerElevenCells() : i === 12 ? layerTwelveCells() : i === 13 ? layerThirteenCells() : i === 14 ? layerFourteenCells() : {}, completed: false, notes: "" };
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
    mergedLayers[5] = { ...base.layers[5], ...(mergedLayers[5] || {}), cells: layerFiveCells() };
    mergedLayers[6] = { ...base.layers[6], ...(mergedLayers[6] || {}), cells: layerSixCells() };
    mergedLayers[7] = { ...base.layers[7], ...(mergedLayers[7] || {}), cells: layerSevenCells() };
    mergedLayers[8] = { ...base.layers[8], ...(mergedLayers[8] || {}), cells: layerEightCells() };
    mergedLayers[9] = { ...base.layers[9], ...(mergedLayers[9] || {}), cells: layerNineCells() };
    mergedLayers[10] = { ...base.layers[10], ...(mergedLayers[10] || {}), cells: layerTenCells() };
    mergedLayers[11] = { ...base.layers[11], ...(mergedLayers[11] || {}), cells: layerElevenCells() };
    mergedLayers[12] = { ...base.layers[12], ...(mergedLayers[12] || {}), cells: layerTwelveCells() };
    mergedLayers[13] = { ...base.layers[13], ...(mergedLayers[13] || {}), cells: layerThirteenCells() };
    mergedLayers[14] = { ...base.layers[14], ...(mergedLayers[14] || {}), cells: layerFourteenCells() };
    const savedSettings = saved.settings || {};
    const migratedSettings = { ...base.settings, ...savedSettings };
    // Migrate the old single “Changes Only” checkbox to the new comparison controls.
    if (Object.prototype.hasOwnProperty.call(savedSettings, "changesOnly")) {
      migratedSettings.showCurrent = !savedSettings.changesOnly;
      migratedSettings.showPrevious = false;
      migratedSettings.showChanges = true;
      delete migratedSettings.changesOnly;
    }
    // Always open the app in normal build view. A saved changes-only view
    // can otherwise make a taper layer appear to be made entirely of red Xs.
    migratedSettings.showCurrent = true;
    migratedSettings.showPrevious = false;
    migratedSettings.showChanges = Number(saved.currentLayer || 1) > 1;
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
  // A blueprint block must always be visible. Comparison controls may add
  // reference overlays, but they can never hide the current layer pattern.
  if (currentHas) {
    primary = "wood";
    classes.push("wood");
  } else if (state.settings.showPrevious && previousHas) {
    primary = "previous";
    classes.push("previous");
  } else if (state.currentLayer <= 8 && state.settings.center && entranceCell(x,y)) {
    primary = "entrance";
    classes.push("entrance");
  } else if (state.currentLayer <= 8 && state.settings.center && centerCell(x,y)) {
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
          : state.currentLayer === 5
            ? [["Grid","19 × 19"],["Placement","Above Layer 4"],["Blocks","107 Puffy Tree Pillars"],["Omitted from Layer 4","7 positions"],["Shape","Subtle taper with a slightly heavier left side"]]
            : state.currentLayer === 6
              ? [["Grid","19 × 19"],["Placement","Above Layer 5"],["Blocks","101 Puffy Tree Pillars"],["Omitted from Layer 5","6 positions"],["Shape","Gentle east-side taper; left mass and decorative shelves retained"]]
              : state.currentLayer === 7
                ? [["Grid","19 × 19"],["Placement","Above Layer 6"],["Blocks","93 Puffy Tree Pillars"],["Omitted from Layer 6","8 positions"],["Shape","First sculpting layer; staggered ridges and subtle clockwise twist"]]
                : state.currentLayer === 8
                  ? [["Grid","19 × 19"],["Placement","Above Layer 7"],["Blocks","89 Puffy Tree Pillars"],["Omitted from Layer 7","4 positions"],["Milestone","Final layer enclosing the Pokémon Center"]]
                  : state.currentLayer === 9
                    ? [["Grid","19 × 19"],["Placement","Above Layer 8"],["Blocks","79 Puffy Tree Pillars"],["Changes","14 omissions · 4 additions"],["Shape","First branch shoulders and broken skyline"]]
                    : state.currentLayer === 10
                      ? [["Grid","19 × 19"],["Placement","Above Layer 9"],["Blocks","91 Puffy Tree Pillars"],["Changes","2 omissions · 14 additions"],["Shape","First overhead branch shoulders"]]
                      : state.currentLayer === 11
                        ? [["Grid","19 × 19"],["Placement","Above Layer 10"],["Blocks","96 Puffy Tree Pillars"],["Changes","5 omissions · 10 additions"],["Shape","Crown transition and rising leaders"]]
                        : state.currentLayer === 12
                          ? [["Grid","19 × 19"],["Placement","Above Layer 11"],["Blocks","88 Puffy Tree Pillars"],["Changes","9 omissions · 1 addition"],["Shape","First noticeable inward taper; center remains open"]]
                          : state.currentLayer === 13
                            ? [["Grid","19 × 19"],["Placement","Above Layer 12"],["Blocks","81 Puffy Tree Pillars"],["Changes","8 omissions · 1 addition"],["Shape","Visible taper with a subtle leftward lean"]]
                            : state.currentLayer === 14
                              ? [["Grid","19 × 19"],["Placement","Above Layer 13"],["Blocks","71 Puffy Tree Pillars"],["Changes","11 omissions · 1 addition"],["Shape","Stronger inward taper with a westward leader"]]
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
          : layer === 5
            ? "First gentle trunk taper"
            : layer === 6
              ? "Gradual taper with a subtle leftward weight"
              : layer === 7
                ? "First sculpting layer with staggered bark ridges"
                : layer === 8
                  ? "Final Pokémon Center enclosure layer"
                  : layer === 9
                    ? "First branch shoulders and broken trunk skyline"
                  : layer === 10
                    ? "First overhead branch shoulders"
                    : layer === 11
                      ? "Crown transition and rising leaders"
                      : layer === 12
                        ? "First noticeable inward crown taper"
                        : layer === 13
                          ? "Visible taper and first leftward lean"
                          : layer === 14
                            ? "Stronger taper and westward crown transition"
                            : "Awaiting verified blueprint";
  $("layerGuidance").textContent = layer === 1
    ? "Build the approved 19×19 ground-level footprint. Keep E4–N14 empty for the Pokémon Center and I15–J19 open for the south entrance."
    : layer === 2
      ? "Place one Puffy Tree Pillar directly above every Layer 1 tree block. Do not add or remove blocks. Keep the Pokémon Center space and south entrance open."
      : layer === 3
        ? "Build 131 Puffy Tree Pillars above Layer 2. Red X squares show the 31 Layer 2 positions that stop here—do not place blocks above them. Brown squares are Layer 3 blocks."
        : layer === 4
          ? "Build 114 Puffy Tree Pillars above Layer 3. Red X squares mark 17 positions that stop at Layer 3. Keep the front courtyard open and preserve the small side shelf protrusions for mushrooms, glowing lights, and other decorations."
          : layer === 5
            ? "Build 107 Puffy Tree Pillars above Layer 4. Red X squares mark the 7 Layer 4 positions that stop here. The taper is intentionally gentle: keep the front courtyard and decorative side shelves while allowing the right side and back edge to pull inward slightly."
            : layer === 6
              ? "Build 101 Puffy Tree Pillars above Layer 5. Red X squares mark the 6 Layer 5 positions that stop here. Keep the front courtyard open, preserve the one-block decorative shelf at R10, and let the east side pull inward slightly while the left side remains heavier."
              : layer === 7
                ? "Build 93 Puffy Tree Pillars above Layer 6. Red X squares mark the 8 Layer 6 positions that stop here. This is the first sculpting layer: keep the entrance open, preserve the R10 shelf, and follow the staggered outline so several bark ridges continue upward while neighboring columns pause."
                : layer === 8
                  ? "Build 89 Puffy Tree Pillars above Layer 7. Red X squares mark the 4 Layer 7 positions that stop here. This is the final layer where the trunk volume encloses the Pokémon Center. Keep the entrance open, retain the R10 decorative shelf, and follow the uneven taper so the strongest bark ridges continue while the upper trunk begins to narrow."
                  : layer === 9
                    ? "Build 79 Puffy Tree Pillars above Layer 8. Red X squares mark 14 Layer 8 positions that stop here, while green-marked brown squares show 4 new outward shoulder blocks. Layer 9 is above the Pokémon Center blocking volume, so the blue clearance overlay is no longer shown. Keep the R10 shelf, strengthen the rear-left shoulder, add the smaller front-right shoulder, and allow several bark ribs to terminate so the top edge is no longer level."
                  : layer === 10
                    ? "Build 91 Puffy Tree Pillars above Layer 9. Red X squares mark 2 Layer 9 positions that stop here, while green-marked brown squares show 14 new overhead shoulder blocks. The rear-left shoulder reaches inward across E5–G7, and the smaller front-right shoulder reaches inward across K13–N14. Keep the center open between them; these shoulders do not connect yet."
                    : layer === 11
                      ? "Build 96 Puffy Tree Pillars above Layer 10. Red X squares mark 5 Layer 10 positions that stop here, while green-marked brown squares show 10 new blocks. Continue the rear-left leader inward through G5–H7, widen the front-right shoulder through J13–K15, keep the central roof opening unbridged, and preserve the small R10 shelf as part of the irregular bark silhouette."
                      : layer === 12
                        ? "Build 88 Puffy Tree Pillars above Layer 11. Red X squares mark 9 Layer 11 positions that stop here, and one green-marked brown square at H7 is new. Pull the upper front and side edges inward, keep the central Pokémon Center roof opening visible, and preserve the isolated R10 shelf."
                        : layer === 13
                          ? "Build 81 Puffy Tree Pillars above Layer 12. Red X squares mark 8 Layer 12 positions that stop here, and the green-marked brown square at B11 is new. The east and rear edges taper inward more noticeably while the new west-side block begins the gentle leftward lean. Keep the south entrance and central roof opening clear."
                          : layer === 14
                            ? "Build 71 Puffy Tree Pillars above Layer 13. Red X squares mark 11 Layer 13 positions that stop here, and the green-marked brown square at A10 begins a stronger westward leader. Pull the upper rear, west, and east edges inward, simplify the bark ridges, and keep both the south entrance and central roof opening clear."
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
  $("currentToggle").checked = true;
  $("currentToggle").disabled = true;
  $("previousToggle").checked = state.settings.showPrevious;
  $("changesToggle").checked = state.settings.showChanges;
  $("previousToggle").disabled = state.currentLayer === 1;
  $("changesToggle").disabled = state.currentLayer === 1;
}

function renderAll() { renderMeta(); renderSettings(); renderBlueprint(); renderInspector(); renderSummary(); renderProgress(); }
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

[["coordinatesToggle","coordinates"],["gridToggle","grid"],["pokeCenterToggle","center"],["previousToggle","showPrevious"],["changesToggle","showChanges"]].forEach(([id,key]) => {
  $(id).addEventListener("change", e => { state.settings[key] = e.target.checked; save(); renderBlueprint(); renderInspector(); });
});

$("completeLayer").addEventListener("click", () => {
  state.layers[state.currentLayer].completed = !state.layers[state.currentLayer].completed;
  save(); renderMeta(); renderProgress();
});

$("resetLayer").addEventListener("click", () => {
  if (!confirm(`Restore the approved pattern for Layer ${state.currentLayer}?`)) return;
  state.layers[state.currentLayer].cells = state.currentLayer <= 2 ? layerOneCells() : state.currentLayer === 3 ? layerThreeCells() : state.currentLayer === 4 ? layerFourCells() : state.currentLayer === 5 ? layerFiveCells() : state.currentLayer === 6 ? layerSixCells() : state.currentLayer === 7 ? layerSevenCells() : state.currentLayer === 8 ? layerEightCells() : state.currentLayer === 9 ? layerNineCells() : state.currentLayer === 10 ? layerTenCells() : state.currentLayer === 11 ? layerElevenCells() : state.currentLayer === 12 ? layerTwelveCells() : state.currentLayer === 13 ? layerThirteenCells() : state.currentLayer === 14 ? layerFourteenCells() : {};
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
    migratedSettings.showCurrent = true;
    migratedSettings.showPrevious = false;
    migratedSettings.showChanges = Number(incoming.currentLayer || 1) > 1;
    state = { ...base, ...incoming, settings: migratedSettings, layers: { ...base.layers, ...incoming.layers } };
    state.layers[2] = { ...state.layers[2], cells: layerOneCells() };
    state.layers[3] = { ...state.layers[3], cells: layerThreeCells() };
    state.layers[4] = { ...state.layers[4], cells: layerFourCells() };
    state.layers[5] = { ...state.layers[5], cells: layerFiveCells() };
    state.layers[6] = { ...state.layers[6], cells: layerSixCells() };
    state.layers[7] = { ...state.layers[7], cells: layerSevenCells() };
    state.layers[8] = { ...state.layers[8], cells: layerEightCells() };
    state.layers[9] = { ...state.layers[9], cells: layerNineCells() };
    state.layers[10] = { ...state.layers[10], cells: layerTenCells() };
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

// ----- Rotatable 3D build preview (Canvas; no external library required) -----
const preview = {
  yaw: -0.72,
  pitch: 0.56,
  zoom: 1,
  dragging: false,
  lastX: 0,
  lastY: 0,
  showCenter: true
};

function rotatePoint(x, y, z) {
  const cy = Math.cos(preview.yaw), sy = Math.sin(preview.yaw);
  const cp = Math.cos(preview.pitch), sp = Math.sin(preview.pitch);
  const x1 = x * cy - z * sy;
  const z1 = x * sy + z * cy;
  const y1 = y * cp - z1 * sp;
  const depth = y * sp + z1 * cp;
  return { x: x1, y: y1, depth };
}

function projectPoint(x, y, z, scale, cx, cy) {
  const r = rotatePoint(x, y, z);
  return { x: cx + r.x * scale, y: cy - r.y * scale, depth: r.depth };
}

function polygon(ctx, points, fill, stroke = "rgba(42,31,20,.35)") {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 0.7;
  ctx.stroke();
}

function cubeFaces(x, y, z, size, scale, cx, cy, colorSet, kind = "wood") {
  const h = size / 2;
  const v = [
    projectPoint(x-h,y-h,z-h,scale,cx,cy), projectPoint(x+h,y-h,z-h,scale,cx,cy),
    projectPoint(x+h,y+h,z-h,scale,cx,cy), projectPoint(x-h,y+h,z-h,scale,cx,cy),
    projectPoint(x-h,y-h,z+h,scale,cx,cy), projectPoint(x+h,y-h,z+h,scale,cx,cy),
    projectPoint(x+h,y+h,z+h,scale,cx,cy), projectPoint(x-h,y+h,z+h,scale,cx,cy)
  ];
  const faces = [
    { pts:[v[3],v[2],v[6],v[7]], fill:colorSet.top, depth:(v[3].depth+v[2].depth+v[6].depth+v[7].depth)/4 },
    { pts:[v[1],v[2],v[6],v[5]], fill:colorSet.side, depth:(v[1].depth+v[2].depth+v[6].depth+v[5].depth)/4 },
    { pts:[v[0],v[3],v[7],v[4]], fill:colorSet.front, depth:(v[0].depth+v[3].depth+v[7].depth+v[4].depth)/4 }
  ];
  return faces.map(face => ({...face, kind}));
}

function previewGeometry() {
  const faces = [];
  const selectedLayer = Math.min(state.currentLayer, 14);
  for (let layer = 1; layer <= selectedLayer; layer++) {
    const cells = state.layers[layer].cells;
    Object.keys(cells).forEach(key => {
      const [x,z] = key.split(",").map(Number);
      const selected = layer === selectedLayer;
      const colors = selected
        ? {top:"#b9824c", side:"#8d572f", front:"#6f4226"}
        : {top:"#9a6a3f", side:"#704527", front:"#57351f"};
      faces.push(...cubeFaces(x-9, layer-1, z-9, .92, 1, 0, 0, colors, "wood"));
    });
  }
  if (preview.showCenter && selectedLayer <= 8) {
    // Reserved Pokémon Center volume: E4–N14, eight blocks tall.
    const colors = {top:"rgba(115,177,203,.16)", side:"rgba(81,143,171,.12)", front:"rgba(151,207,225,.12)"};
    const centerX = ((4+13)/2)-9;
    const centerZ = ((3+13)/2)-9;
    const width = 10, depth = 11, height = 8;
    const hX=width/2, hY=height/2, hZ=depth/2;
    const corners = [
      projectPoint(centerX-hX,hY-height/2,centerZ-hZ,1,0,0), projectPoint(centerX+hX,hY-height/2,centerZ-hZ,1,0,0),
      projectPoint(centerX+hX,hY+height/2,centerZ-hZ,1,0,0), projectPoint(centerX-hX,hY+height/2,centerZ-hZ,1,0,0),
      projectPoint(centerX-hX,hY-height/2,centerZ+hZ,1,0,0), projectPoint(centerX+hX,hY-height/2,centerZ+hZ,1,0,0),
      projectPoint(centerX+hX,hY+height/2,centerZ+hZ,1,0,0), projectPoint(centerX-hX,hY+height/2,centerZ+hZ,1,0,0)
    ];
    [
      [3,2,6,7,colors.top], [1,2,6,5,colors.side], [0,3,7,4,colors.front]
    ].forEach(([a,b,c,d,fill]) => faces.push({pts:[corners[a],corners[b],corners[c],corners[d]],fill,depth:(corners[a].depth+corners[b].depth+corners[c].depth+corners[d].depth)/4,kind:"center"}));
  }
  return faces;
}

function drawPreview() {
  const canvas = $("previewCanvas");
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,rect.width,rect.height);
  const gradient = ctx.createLinearGradient(0,0,0,rect.height);
  gradient.addColorStop(0,"#f7f5ef"); gradient.addColorStop(1,"#e7e0d3");
  ctx.fillStyle=gradient; ctx.fillRect(0,0,rect.width,rect.height);
  const scale = Math.min(rect.width/31, rect.height/22) * preview.zoom;
  const cx=rect.width/2, cy=rect.height*.64;
  const raw = previewGeometry();
  // Geometry is calculated at unit scale and origin; convert to canvas coordinates here.
  const faces = raw.map(face => ({...face, pts:face.pts.map(p=>({x:cx+p.x*scale,y:cy+p.y*scale,depth:p.depth}))}));
  faces.sort((a,b)=>a.depth-b.depth || (a.kind === "center" ? -1 : 1));
  faces.forEach(face=>polygon(ctx,face.pts,face.fill,face.kind === "center" ? "rgba(48,112,139,.38)" : "rgba(42,31,20,.34)"));
  ctx.fillStyle="rgba(44,51,38,.8)"; ctx.font="700 12px system-ui";
  ctx.fillText(`Layers 1–${Math.min(state.currentLayer,14)} • drag to rotate`,12,20);
}

function setupPreview() {
  const canvas=$("previewCanvas");
  if (!canvas) return;
  const point = e => e.touches ? e.touches[0] : e;
  const start=e=>{ const p=point(e); preview.dragging=true; preview.lastX=p.clientX; preview.lastY=p.clientY; canvas.setPointerCapture?.(e.pointerId); };
  const move=e=>{ if(!preview.dragging)return; const p=point(e); preview.yaw+=(p.clientX-preview.lastX)*.012; preview.pitch=Math.max(-.2,Math.min(1.2,preview.pitch+(p.clientY-preview.lastY)*.008)); preview.lastX=p.clientX; preview.lastY=p.clientY; drawPreview(); e.preventDefault(); };
  const end=()=>{preview.dragging=false;};
  canvas.addEventListener("pointerdown",start); canvas.addEventListener("pointermove",move); canvas.addEventListener("pointerup",end); canvas.addEventListener("pointercancel",end);
  $("previewZoom").addEventListener("input",e=>{preview.zoom=Number(e.target.value);drawPreview();});
  $("previewReset").addEventListener("click",()=>{preview.yaw=-.72;preview.pitch=.56;preview.zoom=1;$("previewZoom").value=1;drawPreview();});
  $("previewCenterToggle").addEventListener("change",e=>{preview.showCenter=e.target.checked;drawPreview();});
  window.addEventListener("resize",drawPreview);
}

const baseRenderAll = renderAll;
renderAll = function() { baseRenderAll(); requestAnimationFrame(drawPreview); };

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("sw.js?v=21-layer14", { updateViaCache: "none" });
    } catch (error) {
      console.warn("Service worker registration failed", error);
    }
  });
}
setupPreview();
renderAll();
