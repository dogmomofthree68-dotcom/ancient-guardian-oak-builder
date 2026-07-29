\
const GRID_SIZE = 31;
const TOTAL_LAYERS = 52;
const STORAGE_KEY = "ancientGuardianOakBuilderV2";

const BLOCKS = {
  wood: { label: "Ancient wood", color: "#805a3f" },
  darkwood: { label: "Dark bark", color: "#543c2d" },
  moss: { label: "Moss", color: "#718851" },
  leaves: { label: "Leaves", color: "#527247" },
  stone: { label: "Stone", color: "#8d8b83" },
  erase: { label: "Eraser", color: "#f7f2e9" }
};

const $ = (id) => document.getElementById(id);

function defaultSettings() {
  return {
    pokeWidth: 10,
    pokeDepth: 11,
    roofLayer: 8,
    southOffset: 3,
    showCoordinates: true,
    showGrid: true,
    showPokeCenter: true
  };
}

function starterLayer(layer) {
  const cells = {};
  const centerX = 15 - Math.round(Math.max(0, layer - 9) * 0.12);
  const centerY = 15;
  let rx, ry;

  if (layer <= 8) {
    rx = 8 - Math.floor((layer - 1) / 3);
    ry = 7 - Math.floor((layer - 1) / 4);
  } else if (layer <= 34) {
    rx = Math.max(4, 7 - Math.floor((layer - 8) / 7));
    ry = Math.max(4, 7 - Math.floor((layer - 8) / 8));
  } else if (layer <= 43) {
    rx = Math.max(2, 5 - Math.floor((layer - 34) / 3));
    ry = Math.max(2, 5 - Math.floor((layer - 34) / 3));
  } else {
    rx = 2;
    ry = 2;
  }

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const dx = (x - centerX) / rx;
      const dy = (y - centerY) / ry;
      let inside = dx * dx + dy * dy <= 1;

      if (layer <= 8) {
        const rootA = y >= 17 && y <= 23 && Math.abs(x - 15) <= Math.max(1, 11 - (y - 17) * 2);
        const rootB = x >= 4 && x <= 12 && Math.abs(y - 19) <= Math.max(1, 4 - Math.floor((x - 4) / 3));
        const rootC = x >= 19 && x <= 27 && Math.abs(y - 19) <= Math.max(1, 4 - Math.floor((27 - x) / 3));
        const rootD = y >= 20 && y <= 27 && Math.abs(x - 8) <= 2;
        const rootE = y >= 20 && y <= 27 && Math.abs(x - 23) <= 2;
        inside = inside || rootA || rootB || rootC || rootD || rootE;
      }

      if (layer >= 35 && layer <= 45) {
        const branchLeft = y >= 13 && y <= 15 && x >= centerX - 10 && x < centerX;
        const branchRight = y >= 16 && y <= 18 && x > centerX && x <= centerX + 10;
        inside = inside || branchLeft || branchRight;
      }

      if (inside) {
        const edge = Math.abs(dx * dx + dy * dy - 1) < 0.35;
        cells[`${x},${y}`] = edge ? "darkwood" : "wood";
      }
    }
  }

  if (layer >= 42) {
    const crownRadius = Math.max(5, 12 - Math.floor((layer - 42) * 0.7));
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const d = Math.hypot(x - centerX, y - centerY);
        const organic = Math.sin(x * 1.7 + y * 2.3 + layer) + Math.cos(x * .8 - y * 1.1);
        if (d <= crownRadius + organic * .8 && d >= 2.4 && !cells[`${x},${y}`]) {
          cells[`${x},${y}`] = layer % 3 === 0 && organic > 1 ? "moss" : "leaves";
        }
      }
    }
  }

  if (layer <= 8) {
    for (let y = 16; y <= 24; y++) {
      for (let x = 14; x <= 16; x++) {
        delete cells[`${x},${y}`];
      }
    }
  }

  return cells;
}

function defaultState() {
  const layers = {};
  for (let i = 1; i <= TOTAL_LAYERS; i++) {
    layers[i] = {
      cells: starterLayer(i),
      completed: false,
      notes: ""
    };
  }
  return {
    currentLayer: 1,
    selectedBlock: "wood",
    settings: defaultSettings(),
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

function phaseFor(layer) {
  if (layer <= 8) return "Root foundation";
  if (layer <= 22) return "Lower trunk";
  if (layer <= 34) return "Pokécenter chamber and trunk";
  if (layer <= 43) return "Upper trunk and main branches";
  return "Ancient canopy";
}

function guidanceFor(layer) {
  if (layer <= 8) return "Build the broad, uneven roots first. Keep the south approach open and let the base feel naturally asymmetrical.";
  if (layer <= 22) return "Raise the heavy lower trunk. The starter design leans slightly left so the tree does not feel perfectly manufactured.";
  if (layer <= 34) return "Continue the trunk around the Pokécenter footprint. The blue overlay is a guide only and follows your settings.";
  if (layer <= 43) return "Taper the upper trunk and form the main branch supports before adding the crown.";
  return "Build the canopy in broken clusters rather than a perfect circle. Mix leaves and moss for an old, forgotten-world feeling.";
}

function pokeCenterCells(layer) {
  if (!state.settings.showPokeCenter || layer > state.settings.roofLayer) return new Set();
  const w = Number(state.settings.pokeWidth);
  const d = Number(state.settings.pokeDepth);
  const southOffset = Number(state.settings.southOffset);
  const startX = Math.floor((GRID_SIZE - w) / 2);
  const startY = Math.floor((GRID_SIZE - d) / 2) + southOffset;
  const result = new Set();

  for (let y = startY; y < startY + d; y++) {
    for (let x = startX; x < startX + w; x++) {
      if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
        result.add(`${x},${y}`);
      }
    }
  }
  return result;
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
  if (state.selectedBlock === "erase") {
    delete layer.cells[key];
  } else {
    layer.cells[key] = state.selectedBlock;
  }
  saveState();
  renderBlueprint();
  renderMaterials();
}

function renderBlueprint() {
  const container = $("blueprint");
  container.innerHTML = "";
  container.classList.toggle("hide-coordinates", !state.settings.showCoordinates);
  container.classList.toggle("no-grid", !state.settings.showGrid);

  const overlay = pokeCenterCells(state.currentLayer);
  const cells = state.layers[state.currentLayer].cells;

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.setAttribute("aria-label", `Column ${x + 1}, row ${y + 1}`);
      cell.dataset.col = x + 1;
      cell.dataset.row = y + 1;
      if (y === 0) cell.classList.add("coordinate-x");
      if (x === 0) cell.classList.add("coordinate-y");

      const value = cells[`${x},${y}`];
      if (value) cell.classList.add(value);
      else if (overlay.has(`${x},${y}`)) cell.classList.add("clearance");

      const entranceX = Math.floor(GRID_SIZE / 2);
      const entranceY = Math.min(GRID_SIZE - 1, Math.floor((GRID_SIZE - state.settings.pokeDepth) / 2) + Number(state.settings.southOffset) + Number(state.settings.pokeDepth));
      if (state.settings.showPokeCenter && state.currentLayer <= state.settings.roofLayer && x === entranceX && y === entranceY) {
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

  const used = Object.entries(BLOCKS).filter(([key]) => key !== "erase");
  used.forEach(([key, block]) => {
    const count = counts[key] || 0;
    const row = document.createElement("div");
    row.className = "material-row";
    const percent = total ? (count / total) * 100 : 0;
    row.innerHTML = `
      <span class="palette-chip" style="background:${block.color}"></span>
      <div>
        <div>${block.label}</div>
        <div class="material-bar"><div style="width:${percent}%"></div></div>
      </div>
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
}

function renderSettings() {
  $("coordinatesToggle").checked = state.settings.showCoordinates;
  $("gridToggle").checked = state.settings.showGrid;
  $("pokeCenterToggle").checked = state.settings.showPokeCenter;
  $("pokeWidth").value = state.settings.pokeWidth;
  $("pokeDepth").value = state.settings.pokeDepth;
  $("roofLayer").value = state.settings.roofLayer;
  $("southOffset").value = state.settings.southOffset;
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
  if (!confirm(`Restore the original starter pattern for Layer ${state.currentLayer}?`)) return;
  state.layers[state.currentLayer].cells = starterLayer(state.currentLayer);
  saveState();
  renderBlueprint();
  renderMaterials();
});

$("layerNotes").addEventListener("input", (event) => {
  state.layers[state.currentLayer].notes = event.target.value;
  saveState();
});

[
  ["coordinatesToggle", "showCoordinates"],
  ["gridToggle", "showGrid"],
  ["pokeCenterToggle", "showPokeCenter"]
].forEach(([elementId, setting]) => {
  $(elementId).addEventListener("change", (event) => {
    state.settings[setting] = event.target.checked;
    saveState();
    renderBlueprint();
  });
});

[
  ["pokeWidth", "pokeWidth"],
  ["pokeDepth", "pokeDepth"],
  ["roofLayer", "roofLayer"],
  ["southOffset", "southOffset"]
].forEach(([elementId, setting]) => {
  $(elementId).addEventListener("change", (event) => {
    state.settings[setting] = Number(event.target.value);
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
  if (!confirm("Reset all 52 layers, progress, notes, and settings? This cannot be undone.")) return;
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
