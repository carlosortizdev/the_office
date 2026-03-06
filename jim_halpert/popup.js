// Prank Planner — Jim Halpert Extension
// "Bears. Beets. Battlestar Galactica." — Jim Halpert (as Dwight)

'use strict';

// ————— Pre-loaded classic pranks from the show —————
const DEFAULT_PRANKS = [
  {
    id: 'default-1',
    target: 'Dwight',
    desc: 'Put all of Dwight\'s office supplies in Jell-O, including his stapler.',
    difficulty: 3,
    status: 'Complete',
    checked: true,
  },
  {
    id: 'default-2',
    target: 'Dwight',
    desc: 'Convince Dwight that he has been recruited into the CIA. Have him report for a "mission" at the loading dock.',
    difficulty: 4,
    status: 'Complete',
    checked: true,
  },
  {
    id: 'default-3',
    target: 'Dwight',
    desc: 'Dress up as Dwight — glasses, mustard yellow shirt, short sleeve button-down, hair parted — and mirror his exact behavior all day.',
    difficulty: 5,
    status: 'Complete',
    checked: true,
  },
  {
    id: 'default-4',
    target: 'Dwight',
    desc: 'Move Dwight\'s entire desk into the bathroom. Every item in its exact position.',
    difficulty: 3,
    status: 'Complete',
    checked: true,
  },
  {
    id: 'default-5',
    target: 'Dwight',
    desc: 'Send Dwight a fax, purportedly from Future Dwight, warning him about the coffee. Watch him slap the coffee out of Meredith\'s hand.',
    difficulty: 2,
    status: 'Planned',
    checked: false,
  },
];

// Status → CSS class mapping
const STATUS_CLASS = {
  'Planned':         'status-planned',
  'In Progress':     'status-in-progress',
  'Complete':        'status-complete',
  'Dwight Suspected':'status-dwight',
};

// ————— State —————
let pranks = [];
let selectedDifficulty = 3;

// ————— Storage —————

async function loadPranks() {
  const result = await chrome.storage.local.get('pranks');
  if (result.pranks && result.pranks.length > 0) {
    pranks = result.pranks;
  } else {
    // First run — seed with defaults
    pranks = DEFAULT_PRANKS;
    await savePranks();
  }
}

async function savePranks() {
  await chrome.storage.local.set({ pranks });
}

// ————— Render —————

function renderPranks() {
  const list = document.getElementById('prank-list');
  const empty = document.getElementById('empty-state');
  list.innerHTML = '';

  if (pranks.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  // Show newest first (reverse order)
  [...pranks].reverse().forEach(prank => {
    const item = document.createElement('div');
    item.className = `prank-item${prank.checked ? ' done' : ''}`;
    item.dataset.id = prank.id;

    const statusClass = STATUS_CLASS[prank.status] || 'status-planned';
    const jelloMolds = '🍮'.repeat(prank.difficulty) + '⬜'.repeat(5 - prank.difficulty);

    item.innerHTML = `
      <div class="prank-check${prank.checked ? ' checked' : ''}" data-action="check">
        ${prank.checked ? '✓' : ''}
      </div>
      <div class="prank-content">
        <div class="prank-top">
          <span class="prank-target">▸ ${escapeHtml(prank.target)}</span>
          <span class="prank-status ${statusClass}">${escapeHtml(prank.status)}</span>
        </div>
        <div class="prank-desc">${escapeHtml(prank.desc)}</div>
        <div class="prank-jello">${jelloMolds} Jell-O difficulty</div>
      </div>
      <button class="prank-delete" data-action="delete" title="Delete">✕</button>
    `;

    list.appendChild(item);
  });

  // Event delegation on list
  list.onclick = async (e) => {
    const item = e.target.closest('.prank-item');
    if (!item) return;
    const id = item.dataset.id;
    const action = e.target.closest('[data-action]')?.dataset.action;

    if (action === 'check') {
      const prank = pranks.find(p => p.id === id);
      if (prank) {
        prank.checked = !prank.checked;
        await savePranks();
        renderPranks();
      }
    } else if (action === 'delete') {
      pranks = pranks.filter(p => p.id !== id);
      await savePranks();
      renderPranks();
    }
  };
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ————— Jell-O Rating Widget —————

function renderJelloRating() {
  const container = document.getElementById('jello-rating');
  container.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const mold = document.createElement('span');
    mold.className = `jello-mold${i <= selectedDifficulty ? ' active' : ''}`;
    mold.textContent = '🍮';
    mold.dataset.val = i;
    mold.title = `${i} Jell-O mold${i !== 1 ? 's' : ''}`;
    container.appendChild(mold);
  }
  document.getElementById('diff-val').textContent = selectedDifficulty;
}

// ————— Add Prank —————

async function addPrank() {
  const target = document.getElementById('target-input').value.trim();
  const desc   = document.getElementById('desc-input').value.trim();
  const status = document.getElementById('status-select').value;

  if (!target || !desc) {
    // Shake inputs gently if empty
    ['target-input', 'desc-input'].forEach(id => {
      const el = document.getElementById(id);
      if (!el.value.trim()) {
        el.style.borderColor = '#e74c3c';
        setTimeout(() => el.style.borderColor = '', 1000);
      }
    });
    return;
  }

  const newPrank = {
    id: `prank-${Date.now()}`,
    target,
    desc,
    difficulty: selectedDifficulty,
    status,
    checked: status === 'Complete',
  };

  pranks.push(newPrank);
  await savePranks();
  renderPranks();

  // Clear form
  document.getElementById('target-input').value = '';
  document.getElementById('desc-input').value = '';
  document.getElementById('status-select').value = 'Planned';
  selectedDifficulty = 3;
  renderJelloRating();
}

// ————— Camera Overlay —————

function triggerCameraGlance() {
  const overlay = document.getElementById('camera-overlay');
  overlay.classList.add('active');
  // Auto-dismiss after 1.2 seconds
  setTimeout(() => overlay.classList.remove('active'), 1200);
}

document.getElementById('camera-overlay').addEventListener('click', () => {
  document.getElementById('camera-overlay').classList.remove('active');
});

// ————— Init —————

async function init() {
  await loadPranks();
  renderPranks();
  renderJelloRating();

  // Jell-O rating clicks
  document.getElementById('jello-rating').addEventListener('click', (e) => {
    const mold = e.target.closest('.jello-mold');
    if (mold) {
      selectedDifficulty = parseInt(mold.dataset.val, 10);
      renderJelloRating();
    }
  });

  // Add button
  document.getElementById('add-btn').addEventListener('click', addPrank);

  // Enter key on inputs
  ['target-input', 'desc-input'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addPrank();
    });
  });

  // Camera glance button
  document.getElementById('camera-btn').addEventListener('click', triggerCameraGlance);
}

init();
