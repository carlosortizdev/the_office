/**
 * content.js
 * Injects a draggable, animated pixel-art overlay into every page.
 * Depends on utils/pixelart.js (loaded first via manifest content_scripts).
 */
(function () {
  // Guard against double-injection (e.g., history navigation)
  if (document.getElementById('pta-root')) return;
  if (!document.body) return;

  // ── Keys ────────────────────────────────────────────────────────────────
  const urlKey = window.location.hostname || window.location.href;
  const DEFAULT_SEED = PixelArt.hashString(urlKey);
  const STORAGE_SEED_KEY = 'pta-seed-' + DEFAULT_SEED;
  const STORAGE_ENABLED_KEY = 'pta-enabled';

  // ── DOM: fixed container ─────────────────────────────────────────────────
  const root = document.createElement('div');
  root.id = 'pta-root';
  Object.assign(root.style, {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    width: '64px',
    height: '64px',
    zIndex: '2147483647',
    borderRadius: '6px',
    cursor: 'grab',
    userSelect: 'none',
    // semi-transparent drop-shadow to help it float above busy pages
    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.45))',
    opacity: '0.85',
  });

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;border-radius:6px;image-rendering:pixelated;';
  root.appendChild(canvas);
  document.body.appendChild(root);

  // ── State ────────────────────────────────────────────────────────────────
  let currentSeed = DEFAULT_SEED;
  let enabled = true;
  let animId = null;
  let phase = Math.random() * Math.PI * 2; // stagger pulses across tabs

  // ── Animation: subtle opacity pulse ──────────────────────────────────────
  function tick() {
    phase += 0.018;
    root.style.opacity = (0.78 + Math.sin(phase) * 0.12).toFixed(3);
    animId = requestAnimationFrame(tick);
  }

  function startAnim() {
    if (!animId) animId = requestAnimationFrame(tick);
  }

  function stopAnim() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    root.style.opacity = '0.85';
  }

  // ── Render ───────────────────────────────────────────────────────────────
  function render(seed) {
    PixelArt.generate(canvas, seed, 8); // 8×8 logical grid, 8px blocks → 64px
  }

  // ── Drag ─────────────────────────────────────────────────────────────────
  let dragging = false;
  let dragOX = 0, dragOY = 0;

  root.addEventListener('mousedown', (e) => {
    dragging = true;
    const rect = root.getBoundingClientRect();
    dragOX = e.clientX - rect.left;
    dragOY = e.clientY - rect.top;
    root.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    // Switch from right/bottom anchoring to left/top once dragged
    root.style.right = 'auto';
    root.style.bottom = 'auto';
    root.style.left = Math.max(0, e.clientX - dragOX) + 'px';
    root.style.top = Math.max(0, e.clientY - dragOY) + 'px';
  });

  document.addEventListener('mouseup', () => {
    dragging = false;
    root.style.cursor = 'grab';
  });

  // ── Init: load persisted seed + enabled state ─────────────────────────────
  chrome.storage.local.get([STORAGE_SEED_KEY, STORAGE_ENABLED_KEY], (data) => {
    currentSeed = (data[STORAGE_SEED_KEY] !== undefined)
      ? data[STORAGE_SEED_KEY]
      : DEFAULT_SEED;
    enabled = data[STORAGE_ENABLED_KEY] !== false; // default true

    render(currentSeed);

    if (enabled) {
      root.style.display = 'block';
      startAnim();
    } else {
      root.style.display = 'none';
    }
  });

  // ── Message listener (popup → content) ───────────────────────────────────
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    switch (msg.type) {
      case 'regenerate':
        currentSeed = msg.seed;
        render(currentSeed);
        sendResponse({ ok: true });
        break;

      case 'toggle':
        enabled = msg.enabled;
        if (enabled) {
          root.style.display = 'block';
          startAnim();
        } else {
          root.style.display = 'none';
          stopAnim();
        }
        sendResponse({ ok: true });
        break;

      case 'getSeed':
        sendResponse({ seed: currentSeed, enabled });
        break;
    }
    return true; // keep channel open for async sendResponse
  });
})();
