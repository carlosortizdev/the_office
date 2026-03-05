/**
 * popup.js — shows a critter preview + toggle for the active tab.
 */
(async function () {
  const preview      = document.getElementById('preview');
  const hostnameEl   = document.getElementById('hostname');
  const labelEl      = document.getElementById('critter-label');
  const btnToggle    = document.getElementById('btn-toggle');
  const STORAGE_KEY  = 'pta-enabled';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  let tabUrl;
  try { tabUrl = new URL(tab.url); } catch { hostnameEl.textContent = tab.url; return; }

  const urlKey = tabUrl.hostname || tab.url;
  const seed   = PixelArt.hashString(urlKey);
  const type   = PixelArt.getCritterType(seed);
  const colors = PixelArt.getColors(seed);

  hostnameEl.textContent = tabUrl.hostname || tab.url;
  labelEl.textContent    = type;

  // Draw a still preview at 3× scale (120×120)
  const BLOCK_PREVIEW = 15; // 8 logical px × 15 = 120px
  const tempCanvas = document.createElement('canvas');
  PixelArt.drawCritter(tempCanvas, type, 0, 'right', colors);

  // Scale up onto the visible canvas
  preview.width  = 120;
  preview.height = 120;
  const ctx = preview.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tempCanvas, 0, 0, 120, 120);

  // ── Toggle ────────────────────────────────────────────────────────────────
  const stored = await chrome.storage.local.get([STORAGE_KEY]);
  let enabled  = stored[STORAGE_KEY] !== false;
  syncBtn();

  function syncBtn() {
    btnToggle.textContent = enabled ? 'Disable' : 'Enable';
    btnToggle.classList.toggle('enabled', enabled);
  }

  async function sendToTab(msg) {
    try { await chrome.tabs.sendMessage(tab.id, msg); } catch { /* restricted page */ }
  }

  btnToggle.addEventListener('click', async () => {
    enabled = !enabled;
    await chrome.storage.local.set({ [STORAGE_KEY]: enabled });
    syncBtn();
    await sendToTab({ type: 'toggle', enabled });
  });
})();
