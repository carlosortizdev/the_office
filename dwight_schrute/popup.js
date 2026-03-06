// Threat Assessor — Dwight Schrute Extension
// "I am ready to face any challenges that might be foolish enough to face me." — Dwight K. Schrute

'use strict';

// ————— Scan log steps with delays (ms after previous step) —————
// Each step: [delay_ms, text, css_class]
const SCAN_STEPS = [
  [300,  "Initializing Schrute Farms Security Protocol v4.2...",        "log-ok"],
  [500,  "Checking for Lackawanna County vulnerabilities...",            "log-warn"],
  [700,  "Cross-referencing with Schrute Farms beet database...",       "log-ok"],
  [500,  "Scanning for zombie activity (Class 3 and above)...",         "log-warn"],
  [600,  "Verifying Dunder Mifflin supplier credentials...",            "log-ok"],
  [400,  "Assessing bear threat level: brown, black, and polar...",     "log-warn"],
  [700,  "Querying Assistant Regional Manager watch list...",           "log-ok"],
  [500,  "Checking for Office Administrator override attempts...",      "log-warn"],
  [600,  "Running Battlestar Galactica threat matrix...",               "log-ok"],
  [400,  "Pinging Mose for perimeter confirmation...",                  "log-ok"],
  [800,  "Analyzing server for signs of weakness or cowardice...",      "log-warn"],
  [500,  "Verifying site has not been flagged by the Lackawanna Sheriff...", "log-ok"],
  [600,  "Cross-referencing with Pennsylvania State Volunteer Constable records...", "log-ok"],
  [400,  "Final validation: confirming no affiliation with Ryan Howard...", "log-warn"],
  [700,  "Assessment complete. Compiling results...",                   "log-ok"],
];

// The verdict is randomly determined, with a slight bias toward safety
// (Dwight is thorough but most sites pass — he reserves the watch list for real threats)
function determineVerdict() {
  return Math.random() < 0.35 ? 'threat' : 'safe';
}

// ————— Get current tab domain —————

async function getCurrentDomain() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) return 'unknown';
    const url = new URL(tab.url);
    return url.hostname || 'unknown';
  } catch {
    return 'unknown';
  }
}

// ————— Storage helpers —————

async function getWatchList() {
  const result = await chrome.storage.local.get('watchList');
  return result.watchList || [];
}

async function addToWatchList(domain) {
  const list = await getWatchList();
  // Avoid duplicates
  if (!list.find(e => e.domain === domain)) {
    list.push({ domain, addedAt: new Date().toLocaleDateString() });
    await chrome.storage.local.set({ watchList: list });
  }
}

async function clearWatchList() {
  await chrome.storage.local.set({ watchList: [] });
}

// ————— Render watch list —————

async function renderWatchList() {
  const list = await getWatchList();
  const ul = document.getElementById('watchlist');
  const empty = document.getElementById('watchlist-empty');
  const clearBtn = document.getElementById('clear-watchlist');

  ul.innerHTML = '';

  if (list.length === 0) {
    empty.style.display = 'block';
    clearBtn.style.display = 'none';
  } else {
    empty.style.display = 'none';
    clearBtn.style.display = 'block';
    list.forEach(entry => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="site">⚠ ${entry.domain}</span><span class="added">${entry.addedAt}</span>`;
      ul.appendChild(li);
    });
  }
}

// ————— Run the scan animation —————

function runScan(domain) {
  const scanBtn   = document.getElementById('scan-btn');
  const scanPanel = document.getElementById('scan-panel');
  const progressBar = document.getElementById('progress-bar');
  const scanLog   = document.getElementById('scan-log');
  const resultBox = document.getElementById('result-box');

  scanBtn.disabled = true;
  scanPanel.style.display = 'block';
  scanLog.innerHTML = '';
  resultBox.style.display = 'none';
  resultBox.className = 'result-box';
  progressBar.style.width = '0%';

  let elapsed = 0;
  const totalTime = SCAN_STEPS.reduce((sum, s) => sum + s[0], 0);

  // Schedule each log line
  SCAN_STEPS.forEach(([delay, text, cls]) => {
    elapsed += delay;
    const cumulative = elapsed; // closure capture

    setTimeout(() => {
      // Append log line
      const span = document.createElement('span');
      span.className = `log-line ${cls}`;
      span.textContent = `> ${text}`;
      scanLog.appendChild(span);
      scanLog.scrollTop = scanLog.scrollHeight;

      // Advance progress bar
      progressBar.style.width = `${(cumulative / totalTime) * 100}%`;
    }, cumulative);
  });

  // Final verdict
  setTimeout(async () => {
    progressBar.style.width = '100%';
    const verdict = determineVerdict();

    resultBox.style.display = 'block';

    if (verdict === 'safe') {
      resultBox.className = 'result-box result-safe';
      resultBox.innerHTML = `✅ NO THREAT DETECTED<br><small>Website cleared by Assistant (to the) Regional Manager<br>${domain} is authorized for Dunder Mifflin use.</small>`;
    } else {
      resultBox.className = 'result-box result-threat';
      resultBox.innerHTML = `🚨 THREAT DETECTED 🚨<br><small>${domain} has been added to the watch list.<br>Do not visit without proper authorization.</small>`;
      await addToWatchList(domain);
      await renderWatchList();
    }

    scanBtn.disabled = false;
  }, elapsed + 300);
}

// ————— Initialize —————

async function init() {
  const domain = await getCurrentDomain();
  document.getElementById('current-domain').textContent = domain;

  // Scan button
  document.getElementById('scan-btn').addEventListener('click', () => {
    runScan(domain);
  });

  // Watch list toggle
  const watchlistPanel = document.getElementById('watchlist-panel');
  document.getElementById('watchlist-toggle').addEventListener('click', async () => {
    const isVisible = watchlistPanel.style.display !== 'none';
    watchlistPanel.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) {
      await renderWatchList();
    }
  });

  // Clear watch list
  document.getElementById('clear-watchlist').addEventListener('click', async () => {
    await clearWatchList();
    await renderWatchList();
  });
}

init();
