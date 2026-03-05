/**
 * popup.js
 * Manages the extension popup: preview, regenerate, and toggle.
 */
(async function () {
  const preview = document.getElementById('preview');
  const hostnameEl = document.getElementById('hostname');
  const seedDisplay = document.getElementById('seed-display');
  const btnRegen = document.getElementById('btn-regen');
  const btnToggle = document.getElementById('btn-toggle');

  // ── Get the active tab ────────────────────────────────────────────────────
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  let tabUrl;
  try {
    tabUrl = new URL(tab.url);
  } catch {
    hostnameEl.textContent = tab.url || '(unknown)';
    return;
  }

  const urlKey = tabUrl.hostname || tab.url;
  const defaultSeed = PixelArt.hashString(urlKey);
  const STORAGE_SEED_KEY = 'pta-seed-' + defaultSeed;
  const STORAGE_ENABLED_KEY = 'pta-enabled';

  hostnameEl.textContent = tabUrl.hostname || tab.url;

  // ── Load persisted state ─────────────────────────────────────────────────
  let currentSeed;
  let enabled;

  const stored = await chrome.storage.local.get([STORAGE_SEED_KEY, STORAGE_ENABLED_KEY]);
  currentSeed = (stored[STORAGE_SEED_KEY] !== undefined) ? stored[STORAGE_SEED_KEY] : defaultSeed;
  enabled = stored[STORAGE_ENABLED_KEY] !== false;

  // ── Render preview (128×128 — 16px blocks for clarity) ──────────────────
  function renderPreview(seed) {
    PixelArt.generate(preview, seed, 16);
    seedDisplay.textContent = 'seed: 0x' + (seed >>> 0).toString(16).padStart(8, '0');
  }

  renderPreview(currentSeed);
  syncToggleButton();

  // ── Toggle button label sync ──────────────────────────────────────────────
  function syncToggleButton() {
    if (enabled) {
      btnToggle.textContent = 'Disable';
      btnToggle.classList.remove('on');
    } else {
      btnToggle.textContent = 'Enable';
      btnToggle.classList.add('on');
    }
  }

  // ── Send message to content script (best-effort — tab might be restricted) ──
  async function sendToTab(msg) {
    try {
      await chrome.tabs.sendMessage(tab.id, msg);
    } catch {
      // Tab may not have a content script (e.g., chrome:// pages) — ignore.
    }
  }

  // ── Regenerate ────────────────────────────────────────────────────────────
  btnRegen.addEventListener('click', async () => {
    // XOR the current time with a random value for a fresh seed
    const newSeed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    currentSeed = newSeed;

    await chrome.storage.local.set({ [STORAGE_SEED_KEY]: newSeed });
    renderPreview(newSeed);
    await sendToTab({ type: 'regenerate', seed: newSeed });
  });

  // ── Toggle ────────────────────────────────────────────────────────────────
  btnToggle.addEventListener('click', async () => {
    enabled = !enabled;
    await chrome.storage.local.set({ [STORAGE_ENABLED_KEY]: enabled });
    syncToggleButton();
    await sendToTab({ type: 'toggle', enabled });
  });
})();
