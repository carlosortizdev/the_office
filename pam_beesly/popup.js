// Doodle Tab — Pam Beesly Extension (popup)
// "I just want to express myself." — Pam Beesly

'use strict';

// ————— Get current tab info —————

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function getDomainFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// ————— Storage helpers —————

async function getCanvasState(domain) {
  const result = await chrome.storage.local.get(`canvas_visible_${domain}`);
  return result[`canvas_visible_${domain}`] || false;
}

async function setCanvasState(domain, visible) {
  await chrome.storage.local.set({ [`canvas_visible_${domain}`]: visible });
}

async function getAllDoodles() {
  const all = await chrome.storage.local.get(null);
  const doodles = [];
  for (const [key, value] of Object.entries(all)) {
    if (key.startsWith('doodle_')) {
      const domain = key.replace('doodle_', '');
      doodles.push({ domain, dataUrl: value });
    }
  }
  return doodles;
}

async function deleteDoodle(domain) {
  await chrome.storage.local.remove(`doodle_${domain}`);
  await chrome.storage.local.remove(`canvas_visible_${domain}`);
}

// ————— Gallery render —————

async function renderGallery() {
  const doodles = await getAllDoodles();
  const gallery = document.getElementById('gallery');
  const artEmpty = document.getElementById('art-empty');
  gallery.innerHTML = '';

  // Filter out doodles with empty/blank data (all transparent canvases)
  const nonEmpty = doodles.filter(d => d.dataUrl && d.dataUrl.length > 500);

  if (nonEmpty.length === 0) {
    artEmpty.style.display = 'block';
    return;
  }

  artEmpty.style.display = 'none';

  nonEmpty.forEach(({ domain, dataUrl }) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.title = domain;

    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = `Doodle on ${domain}`;

    const label = document.createElement('div');
    label.className = 'gallery-domain';
    label.textContent = domain;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'gallery-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Delete doodle';
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await deleteDoodle(domain);
      renderGallery();
    });

    item.appendChild(img);
    item.appendChild(label);
    item.appendChild(deleteBtn);
    gallery.appendChild(item);
  });
}

// ————— Toggle canvas on current page —————

async function toggleCanvas(tab, domain) {
  const currentlyVisible = await getCanvasState(domain);
  const newVisible = !currentlyVisible;
  await setCanvasState(domain, newVisible);

  // Send message to content script to toggle
  try {
    await chrome.tabs.sendMessage(tab.id, {
      action: newVisible ? 'show_canvas' : 'hide_canvas',
    });
  } catch {
    // Content script might not be loaded yet — inject it
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    });
    // Try again after injection
    await chrome.tabs.sendMessage(tab.id, {
      action: newVisible ? 'show_canvas' : 'hide_canvas',
    });
  }

  return newVisible;
}

// ————— Init —————

async function init() {
  const tab = await getCurrentTab();
  const domain = tab ? getDomainFromUrl(tab.url) : null;

  const toggleBtn = document.getElementById('toggle-btn');
  const toggleLabel = document.getElementById('toggle-label');
  const toggleHint = document.getElementById('toggle-hint');
  const canvasState = document.getElementById('canvas-state');

  if (!domain || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    // Can't inject into chrome:// pages
    toggleBtn.disabled = true;
    toggleBtn.textContent = '✏️ Not available on this page';
    toggleHint.textContent = "Doodle Tab can't draw on Chrome's own pages.";
  } else {
    const visible = await getCanvasState(domain);
    toggleLabel.textContent = visible ? '🎨 Hide Drawing Canvas' : '✏️ Show Drawing Canvas';
    canvasState.textContent = visible ? 'visible' : 'hidden';
    if (visible) toggleBtn.classList.add('active');

    toggleBtn.addEventListener('click', async () => {
      const nowVisible = await toggleCanvas(tab, domain);
      toggleLabel.textContent = nowVisible ? '🎨 Hide Drawing Canvas' : '✏️ Show Drawing Canvas';
      canvasState.textContent = nowVisible ? 'visible' : 'hidden';
      toggleBtn.classList.toggle('active', nowVisible);
    });
  }

  await renderGallery();
}

init();
