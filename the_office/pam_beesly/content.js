// Doodle Tab — Content Script
// Injects Pam's floating drawing canvas overlay into any webpage
// "I am a receptionist. And I am an artist." — Pam Beesly

'use strict';

// ————— Constants —————
const CANVAS_ID      = '__doodle_tab_canvas__';
const WRAPPER_ID     = '__doodle_tab_wrapper__';
const TOOLBAR_ID     = '__doodle_tab_toolbar__';
const SAVE_DELAY_MS  = 800; // debounce save after drawing

// Pam's muted, artistic color palette
const PALETTE_COLORS = [
  '#2c2c2c', // charcoal (default)
  '#8a3a60', // mauve rose
  '#4a8a6a', // sage green
  '#b46482', // dusty pink
  '#5a7a9a', // muted blue
  '#c8a860', // warm gold
  '#8a5a3a', // earthy brown
  '#6a4a8a', // soft purple
  '#d4806a', // terracotta
  '#ffffff', // white
];

// ————— State —————
let isDrawing  = false;
let lastX      = 0;
let lastY      = 0;
let brushSize  = 4;
let brushColor = PALETTE_COLORS[0];
let isEraser   = false;
let saveTimer  = null;

// ————— Get domain —————
function getDomain() {
  return window.location.hostname;
}

// ————— Storage —————
async function saveDoodle(canvas) {
  const domain = getDomain();
  const dataUrl = canvas.toDataURL('image/png');
  await chrome.storage.local.set({ [`doodle_${domain}`]: dataUrl });
}

async function loadDoodle(canvas) {
  const domain = getDomain();
  const result = await chrome.storage.local.get(`doodle_${domain}`);
  const dataUrl = result[`doodle_${domain}`];
  if (!dataUrl) return;

  const img = new Image();
  img.onload = () => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
  img.src = dataUrl;
}

// ————— Build the canvas widget —————
function buildWidget() {
  // Outer wrapper (positions the whole widget, draggable)
  const wrapper = document.createElement('div');
  wrapper.id = WRAPPER_ID;
  wrapper.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    gap: 0;
    box-shadow: 0 8px 30px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15);
    border-radius: 12px;
    overflow: hidden;
    font-family: Georgia, Palatino, serif;
    user-select: none;
    transition: width 0.25s ease, height 0.25s ease;
    width: 60px;
    height: 60px;
  `;

  // Collapsed toggle button (paintbrush icon)
  const toggleBtn = document.createElement('button');
  toggleBtn.id = '__doodle_toggle__';
  toggleBtn.title = "Pam's Doodle Canvas";
  toggleBtn.style.cssText = `
    width: 60px;
    height: 60px;
    border: none;
    background: linear-gradient(135deg, #b46482, #8a3a60);
    color: white;
    font-size: 1.6rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    z-index: 1;
  `;
  toggleBtn.textContent = '🖌️';

  // Expanded panel
  const panel = document.createElement('div');
  panel.id = '__doodle_panel__';
  panel.style.cssText = `
    display: none;
    flex-direction: column;
    background: #fdf6f0;
    border: 2px solid #b46482;
    border-top: none;
    width: 320px;
  `;

  // ——— Toolbar ———
  const toolbar = document.createElement('div');
  toolbar.id = TOOLBAR_ID;
  toolbar.style.cssText = `
    background: linear-gradient(135deg, #b46482, #8a3a60);
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  `;

  // Row 1: color palette
  const colorRow = document.createElement('div');
  colorRow.style.cssText = 'display: flex; gap: 4px; align-items: center; flex-wrap: wrap;';

  PALETTE_COLORS.forEach(color => {
    const swatch = document.createElement('button');
    swatch.title = color;
    swatch.dataset.color = color;
    swatch.style.cssText = `
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.4);
      background: ${color};
      cursor: pointer;
      transition: transform 0.1s, border-color 0.1s;
      flex-shrink: 0;
    `;
    if (color === brushColor) {
      swatch.style.borderColor = 'white';
      swatch.style.transform = 'scale(1.25)';
    }
    swatch.addEventListener('click', () => {
      isEraser = false;
      brushColor = color;
      // Update active swatch
      colorRow.querySelectorAll('button').forEach(s => {
        s.style.borderColor = 'rgba(255,255,255,0.4)';
        s.style.transform = 'scale(1)';
      });
      swatch.style.borderColor = 'white';
      swatch.style.transform = 'scale(1.25)';
    });
    colorRow.appendChild(swatch);
  });
  toolbar.appendChild(colorRow);

  // Row 2: brush size, eraser, clear
  const toolRow = document.createElement('div');
  toolRow.style.cssText = 'display: flex; gap: 6px; align-items: center;';

  // Brush size label
  const sizeLabel = document.createElement('span');
  sizeLabel.style.cssText = 'color: rgba(255,255,255,0.8); font-size: 0.7rem; flex-shrink: 0;';
  sizeLabel.textContent = '🖊️ Size:';
  toolRow.appendChild(sizeLabel);

  // Brush size slider
  const sizeSlider = document.createElement('input');
  sizeSlider.type = 'range';
  sizeSlider.min = '1';
  sizeSlider.max = '30';
  sizeSlider.value = brushSize;
  sizeSlider.style.cssText = `
    flex: 1;
    cursor: pointer;
    accent-color: #fdf6f0;
  `;
  sizeSlider.addEventListener('input', () => {
    brushSize = parseInt(sizeSlider.value, 10);
  });
  toolRow.appendChild(sizeSlider);

  // Eraser button
  const eraserBtn = document.createElement('button');
  eraserBtn.textContent = '⬜ Eraser';
  eraserBtn.title = 'Eraser';
  eraserBtn.style.cssText = `
    padding: 3px 7px;
    border: 1px solid rgba(255,255,255,0.5);
    background: transparent;
    color: white;
    border-radius: 4px;
    font-size: 0.7rem;
    cursor: pointer;
    font-family: Georgia, serif;
    flex-shrink: 0;
    transition: background 0.1s;
  `;
  eraserBtn.addEventListener('click', () => {
    isEraser = !isEraser;
    eraserBtn.style.background = isEraser ? 'rgba(255,255,255,0.3)' : 'transparent';
  });
  toolRow.appendChild(eraserBtn);

  // Clear button
  const clearBtn = document.createElement('button');
  clearBtn.textContent = '🗑️ Clear';
  clearBtn.title = 'Clear canvas';
  clearBtn.style.cssText = `
    padding: 3px 7px;
    border: 1px solid rgba(255,255,255,0.5);
    background: transparent;
    color: white;
    border-radius: 4px;
    font-size: 0.7rem;
    cursor: pointer;
    font-family: Georgia, serif;
    flex-shrink: 0;
    transition: background 0.1s;
  `;
  clearBtn.addEventListener('click', async () => {
    const canvas = document.getElementById(CANVAS_ID);
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      await chrome.storage.local.remove(`doodle_${getDomain()}`);
    }
  });
  toolRow.appendChild(clearBtn);
  toolbar.appendChild(toolRow);
  panel.appendChild(toolbar);

  // ——— Canvas ———
  const canvas = document.createElement('canvas');
  canvas.id = CANVAS_ID;
  canvas.width  = 320;
  canvas.height = 200;
  canvas.style.cssText = `
    display: block;
    cursor: crosshair;
    background: rgba(255,255,255,0.85);
    touch-action: none;
  `;

  // Mouse drawing events
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.strokeStyle = isEraser ? 'rgba(0,0,0,1)' : brushColor;
    ctx.lineWidth   = brushSize;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastX = x;
    lastY = y;

    // Debounced save
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveDoodle(canvas), SAVE_DELAY_MS);
  });

  const stopDrawing = () => { isDrawing = false; };
  canvas.addEventListener('pointerup', stopDrawing);
  canvas.addEventListener('pointerleave', stopDrawing);

  panel.appendChild(canvas);

  // Caption
  const caption = document.createElement('div');
  caption.style.cssText = `
    background: #f0e0d0;
    color: #b09080;
    text-align: center;
    font-size: 0.65rem;
    padding: 4px;
    font-style: italic;
    border-top: 1px solid #e8d8c8;
  `;
  caption.textContent = `Drawing on: ${getDomain()}`;
  panel.appendChild(caption);

  // ——— Toggle expand/collapse ———
  let expanded = false;

  function expand() {
    expanded = true;
    wrapper.style.width  = '320px';
    wrapper.style.height = 'auto';
    toggleBtn.style.borderRadius = '0';
    toggleBtn.style.width = '100%';
    toggleBtn.style.height = '36px';
    toggleBtn.style.fontSize = '1rem';
    toggleBtn.textContent = '🖌️ Pam\'s Canvas ▲';
    panel.style.display = 'flex';
    // Load saved doodle when expanding
    loadDoodle(canvas);
  }

  function collapse() {
    expanded = false;
    panel.style.display = 'none';
    wrapper.style.width  = '60px';
    wrapper.style.height = '60px';
    toggleBtn.style.width = '60px';
    toggleBtn.style.height = '60px';
    toggleBtn.style.borderRadius = '0';
    toggleBtn.style.fontSize = '1.6rem';
    toggleBtn.textContent = '🖌️';
  }

  toggleBtn.addEventListener('click', () => {
    if (expanded) collapse(); else expand();
  });

  wrapper.appendChild(toggleBtn);
  wrapper.appendChild(panel);

  return { wrapper, canvas, expand, collapse };
}

// ————— Inject / remove widget —————

let widget = null;

function injectWidget(visible) {
  if (document.getElementById(WRAPPER_ID)) return; // already injected

  const { wrapper, canvas, expand, collapse } = buildWidget();
  document.body.appendChild(wrapper);
  widget = { wrapper, canvas, expand, collapse };

  if (visible) {
    widget.expand();
  }
}

function removeWidget() {
  const existing = document.getElementById(WRAPPER_ID);
  if (existing) existing.remove();
  widget = null;
}

// ————— Message listener (from popup) —————

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'show_canvas') {
    if (!document.getElementById(WRAPPER_ID)) {
      injectWidget(true);
    } else if (widget) {
      widget.expand();
    }
    sendResponse({ ok: true });
  } else if (message.action === 'hide_canvas') {
    if (widget) {
      widget.collapse();
    }
    sendResponse({ ok: true });
  }
  return true; // keep channel open for async
});

// ————— On page load: restore canvas visibility if it was visible before —————

(async () => {
  const domain = getDomain();
  if (!domain) return;

  const result = await chrome.storage.local.get(`canvas_visible_${domain}`);
  const wasVisible = result[`canvas_visible_${domain}`] || false;

  if (wasVisible) {
    // Wait for DOM to be ready
    if (document.body) {
      injectWidget(true);
    } else {
      document.addEventListener('DOMContentLoaded', () => injectWidget(true));
    }
  }
})();
