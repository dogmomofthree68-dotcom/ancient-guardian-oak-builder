const GRID_SIZE = 19;
const TOTAL_LAYERS = 52;
const STORAGE_KEY = "ancientGuardianOakBuilderLayer1V1";
const COLUMN_LABELS = "ABCDEFGHIJKLMNOPQRS".split("");

const BLOCKS = {
  wood: { label: "Puffy Tree Pillar", color: "#9a592b" },
  moss: { label: "Moss Block", color: "#718851" },
  lightwall: { label: "Light Wooden Wall", color: "#caa873" },
  gravel: { label: "Gravel", color: "#8d8b83" },
  erase: { label: "Eraser", color: "#eef0dc" }
};

const $ = (id) => document.getElementById(id);

// Exact Layer 1 footprint transcribed from the approved 19×19 PDF.
// Each row lists inclusive brown-cell column ranges using 1-based columns A–S.
const LAYER_ONE_RANGES = {
  1: [[7, 12]],
  2: [[3, 16]],
  3: [[3, 16]],
  4: [[1, 4], [15, 18]],
  5: [[2, 4], [15, 18]],
  6: [[1, 4], [15, 17], [19, 19]],
  7: [[2, 4], [15, 17]],
  8: [[2, 4], [15, 17]],
  9: [[1, 1], [3, 4], [15, 18]],
  10: [[1, 4], [15, 16], [18, 19]],
  11: [[1, 4], [15, 18]],
  12: [[1, 4], [15, 18]],
  13: [[2, 4], [15, 17]],
  14: [[3, 4], [15, 16]],
  15: [[3, 8], [11, 16]],
  16: [[3, 8], [11, 16]],
  17: [[3, 8], [11, 16]],
  18: [[4, 8], [11, 15]],
  19: [[5, 7], [12, 14]]
};

function exactLayerOne() {
  const cells = {};
  Object.entries(LAYER_ONE_RANGES).forEach(([rowText, ranges]) => {
    const y = Number(rowText) - 1;
    ranges.forEach(([start, end]) => {
      for (let col = start; col <= end; col++) cells[`${col - 1},${y}`] = "wood";
    });
  });
  return cells;
}

function starterLayer(layer) {
  return layer === 1 ? exactLayerOne() : {};
}

function defaultState() {
  const layers = {};
  for (let i = 1; i <= TOTAL_LAYERS; i++) {
    layers[i] = { cells: starterLayer(i), completed: false, notes: "" };
  }
  return {
    currentLayer: 1,
    selectedBlock: "wood",
    settings: { showCoordinates: true, showGrid: true, showPokeCenter: true },
    layers
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !saved.layers) return defaultState();
    const fresh = defaultState();
    return {
      ...fresh,
      ...saved,
      settings: { ...fresh.settings, ...(saved.settings || {}) },
      layers: { ...fresh.layers, ...saved.layers }
    };
  } catch {
    return defaultState();
  }
}

let state = loadState();
let deferredPrompt = null;

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function isCenterCell(x, y) {
  // E4 through N14: columns 5–14, rows 4–14.
  return x >= 4 && x <= 13 && y >= 3 && y <= 13;
}

function isEntranceCell(x, y) {
  // I15 through J19.
  return x >= 8 && x <= 9 && y >= 14 && y <= 18;
}

function phaseFor(layer) {
  if (layer === 1) return "Exact foundation blueprint";
  return "Awaiting verified blueprint";
}

function guidanceFor(layer) {
  if (layer === 1) {
    return "Build the approved 19×19 ground-level footprint. Keep E4–N14 empty for the 10×11 Pokémon Center and leave I15–J19 open as the south entrance.";
  }
  return "This layer is intentionally blank until its block pattern is verified in Pokopia.";
}

function renderPalette() {
  $("palette").innerHTML = "";
  Object.entries(BLOCKS).forEach(([key, block]) => {
    const button = document.createElement("button");
    button.className = "palette-button";
    if (state.selectedBlock === key) button.classList.add("selected");
    button.innerHTML = `<span class="palette-chip" style="background:${block.color}"></span>${block.label}`;
    button.addEventListener("click", () => {
      state.selectedBlock = key;
      saveState();
      renderPalette();
    });
    $("palette").appendChild(button);
  });
}

function paintCell(x, y) {
  const layer = state.layers[state.currentLayer];
  const key = `${x},${y}`;
  if (state.selectedBlock === "erase") delete layer.cells[key];
  else layer.cells[key] = state.selectedBlock;
  saveState();
  renderBlueprint();
  renderMaterials();
}

function renderBlueprint() {
  const container = $("blueprint");
  container.innerHTML = "";
  container.classList.toggle("hide-coordinates", !state.settings.showCoordinates);
  container.classList.toggle("no-grid", !state.settings.showGrid);
  const cells = state.layers[state.currentLayer].cells;

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell empty-ground";
      cell.setAttribute("aria-label", `Column ${COLUMN_LABELS[x]}, row ${y + 1}`);
      cell.dataset.col = COLUMN_LABELS[x];
      cell.dataset.row = y + 1;
      if (y === 0) cell.classList.add("coordinate-x");
      if (x === 0) cell.classList.add("coordinate-y");

      const value = cells[`${x},${y}`];
      if (value) {
        cell.classList.remove("empty-ground");
        cell.classList.add(value);
      } else if (state.settings.showPokeCenter && state.currentLayer === 1 && isCenterCell(x, y)) {
        cell.classList.remove("empty-ground");
        cell.classList.add("clearance");
      } else if (state.settings.showPokeCenter && state.currentLayer === 1 && isEntranceCell(x, y)) {
        cell.classList.remove("empty-ground");
        cell.classList.add("entrance");
      }

      cell.addEventListener("click", () => paintCell(x, y));
      container.appendChild(cell);
    }
  }
}

function renderMaterials() {
  const counts = {};
  Object.values(state.layers[state.currentLayer].cells).forEach((type) => {
    counts[type] = (counts[type] || 0) + 1;
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  $("blockTotal").textContent = `${total} block${total === 1 ? "" : "s"}`;
  $("materialList").innerHTML = "";

  Object.entries(BLOCKS).filter(([key]) => key !== "erase").forEach(([key, block]) => {
    const count = counts[key] || 0;
    const row = document.createElement("div");
    row.className = "material-row";
    const percent = total ? (count / total) * 100 : 0;
    row.innerHTML = `
      <span class="palette-chip" style="background:${block.color}"></span>
      <div><div>${block.label}</div><div class="material-bar"><div style="width:${percent}%"></div></div></div>
      <strong>${count}</strong>`;
    $("materialList").appendChild(row);
  });
}

function renderProgress() {
  const completed = Object.values(state.layers).filter((layer) => layer.completed).length;
  $("progressLabel").textContent = `${completed} / ${TOTAL_LAYERS}`;
  $("progressBar").style.width = `${(completed / TOTAL_LAYERS) * 100}%`;
}

function renderLayerMeta() {
  const layer = state.currentLayer;
  const layerData = state.layers[layer];
  $("layerRange").value = layer;
  $("layerNumber").value = layer;
  $("layerTitle").textContent = `Layer ${layer}`;
  $("phaseLabel").textContent = phaseFor(layer);
  $("layerGuidance").textContent = guidanceFor(layer);
  $("layerNotes").value = layerData.notes || "";
  $("layerStatus").textContent = layerData.completed ? "Complete" : "Not complete";
  $("layerStatus").classList.toggle("complete", layerData.completed);
  $("completeLayer").textContent = layerData.completed ? "Mark layer incomplete" : "Mark layer complete";
  $("lockedFacts").hidden = layer !== 1;
}

function renderSettings() {
  $("coordinatesToggle").checked = state.settings.showCoordinates;
  $("gridToggle").checked = state.settings.showGrid;
  $("pokeCenterToggle").checked = state.settings.showPokeCenter;
}

function renderAll() {
  renderPalette();
  renderLayerMeta();
  renderSettings();
  renderBlueprint();
  renderMaterials();
  renderProgress();
}

function setLayer(layer) {
  state.currentLayer = Math.min(TOTAL_LAYERS, Math.max(1, Number(layer) || 1));
  saveState();
  renderAll();
  document.querySelector(".blueprint-wrap").scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

$("previousLayer").addEventListener("click", () => setLayer(state.currentLayer - 1));
$("nextLayer").addEventListener("click", () => setLayer(state.currentLayer + 1));
$("layerRange").addEventListener("input", (event) => setLayer(event.target.value));
$("layerNumber").addEventListener("change", (event) => setLayer(event.target.value));

$("completeLayer").addEventListener("click", () => {
  state.layers[state.currentLayer].completed = !state.layers[state.currentLayer].completed;
  saveState();
  renderLayerMeta();
  renderProgress();
});

$("clearLayer").addEventListener("click", () => {
  if (!confirm(`Clear every placed block from Layer ${state.currentLayer}?`)) return;
  state.layers[state.currentLayer].cells = {};
  saveState();
  renderBlueprint();
  renderMaterials();
});

$("resetLayer").addEventListener("click", () => {
  if (!confirm(`Restore the approved starter pattern for Layer ${state.currentLayer}?`)) return;
  state.layers[state.currentLayer].cells = starterLayer(state.currentLayer);
  saveState();
  renderBlueprint();
  renderMaterials();
});

$("layerNotes").addEventListener("input", (event) => {
  state.layers[state.currentLayer].notes = event.target.value;
  saveState();
});

[["coordinatesToggle", "showCoordinates"], ["gridToggle", "showGrid"], ["pokeCenterToggle", "showPokeCenter"]].forEach(([elementId, setting]) => {
  $(elementId).addEventListener("change", (event) => {
    state.settings[setting] = event.target.checked;
    saveState();
    renderBlueprint();
  });
});

$("exportProject").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "ancient-guardian-oak-save.json";
  anchor.click();
  URL.revokeObjectURL(url);
});

$("importProject").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    if (!imported.layers || !imported.settings) throw new Error("Invalid save file");
    state = imported;
    saveState();
    renderAll();
    alert("Save file imported.");
  } catch {
    alert("That file could not be imported.");
  }
  event.target.value = "";
});

$("resetProject").addEventListener("click", () => {
  if (!confirm("Reset all 52 layers, progress, notes, and edits? This cannot be undone.")) return;
  state = defaultState();
  saveState();
  renderAll();
});

$("comparisonInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const preview = $("comparisonPreview");
  preview.innerHTML = "";
  const image = document.createElement("img");
  image.alt = "Selected build comparison";
  image.src = URL.createObjectURL(file);
  preview.appendChild(image);
});

$("removeComparison").addEventListener("click", () => {
  $("comparisonInput").value = "";
  $("comparisonPreview").innerHTML = "<span>No image selected</span>";
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  $("installButton").classList.remove("hidden");
});

$("installButton").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  $("installButton").classList.add("hidden");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
}

renderAll();
