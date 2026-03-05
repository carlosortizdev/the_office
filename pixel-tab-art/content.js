/**
 * content.js
 * Injects a pixel-art critter that walks along the top of every page.
 * Depends on utils/pixelart.js (loaded first via manifest).
 */
(function () {
  if (document.getElementById('pta-critter')) return;
  if (!document.body) return;

  // ── Constants ────────────────────────────────────────────────────────────
  const W             = 40;               // critter canvas width  (8 * 5)
  const TOP           = 4;                // px from top of viewport
  const SPEED_WALK    = 0.65;             // px per animation frame
  const FRAME_STRIDE  = 10;               // px walked between walk-frame advances
  const STORAGE_KEY   = 'pta-enabled';

  // ── Identity (deterministic per hostname) ────────────────────────────────
  const urlKey  = window.location.hostname || window.location.href;
  const seed    = PixelArt.hashString(urlKey);
  const type    = PixelArt.getCritterType(seed);
  const colors  = PixelArt.getColors(seed);

  // ── Canvas element ───────────────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.id = 'pta-critter';
  Object.assign(canvas.style, {
    position:       'fixed',
    top:            TOP + 'px',
    left:           '0px',
    zIndex:         '2147483647',
    pointerEvents:  'none',             // never blocks page interactions
    imageRendering: 'pixelated',
    filter:         'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
  });
  document.body.appendChild(canvas);

  // ── Walk state ───────────────────────────────────────────────────────────
  let posX          = Math.random() * Math.max(0, window.innerWidth - W);
  let direction     = Math.random() < 0.5 ? 'right' : 'left';
  let walkFrame     = 0;
  let pxSinceFrame  = 0;
  let enabled       = true;
  let rafId         = null;

  // ── Render ───────────────────────────────────────────────────────────────
  function draw() {
    PixelArt.drawCritter(canvas, type, walkFrame % 2, direction, colors);
    canvas.style.left = posX + 'px';
  }

  // ── Animation loop ───────────────────────────────────────────────────────
  function step() {
    rafId = requestAnimationFrame(step);
    if (!enabled) return;

    posX += direction === 'right' ? SPEED_WALK : -SPEED_WALK;
    pxSinceFrame += speed;

    if (pxSinceFrame >= FRAME_STRIDE) {
      pxSinceFrame = 0;
      walkFrame++;
    }

    const maxX = window.innerWidth - W;
    if (posX <= 0)    { posX = 0;    direction = 'right'; }
    if (posX >= maxX) { posX = maxX; direction = 'left';  }

    draw();
  }

  // ── Hover → flip direction (once per entry) ──────────────────────────────
  let wasOver = false;
  document.addEventListener('mousemove', (e) => {
    if (!enabled) return;
    const rect  = canvas.getBoundingClientRect();
    const over  = e.clientX >= rect.left && e.clientX <= rect.right &&
                  e.clientY >= rect.top  && e.clientY <= rect.bottom;
    if (over && !wasOver) direction = direction === 'right' ? 'left' : 'right';
    wasOver = over;
  }, { passive: true });

  // ── Init ─────────────────────────────────────────────────────────────────
  chrome.storage.local.get([STORAGE_KEY], (data) => {
    enabled = data[STORAGE_KEY] !== false;
    canvas.style.display = enabled ? 'block' : 'none';
    draw();
    rafId = requestAnimationFrame(step);
  });

  // ── Messages from popup ───────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'toggle') {
      enabled = msg.enabled;
      canvas.style.display = enabled ? 'block' : 'none';
      sendResponse({ ok: true });
    } else if (msg.type === 'getState') {
      sendResponse({ seed, enabled, type });
    }
    return true;
  });
})();
