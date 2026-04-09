// ============================================================
// DATA DEFINITIONS
// ============================================================

const PAGE_MODELS = [
  // 0 → J-3/J-4
  ['ARPEGE 10', 'ICON EU 7', 'NEMS 12', 'ECMWF 9', 'WRF 5', 'GFS 25'],
  // 1 → J-1/J-2
  ['AROME 1,3', 'AROME 2,5', 'ICON D2', 'ICON CH1', 'NEMS 4', 'RASP'],
  // 2 → Jour J
  ['AROME 1,3', 'AROME 2,5', 'ICON D2', 'ICON CH1', 'NEMS 4', 'RASP'],
];

const EVAL_SECTIONS = [
  {
    title: "Analyse des masses d'air",
    rows: [
      { label: 'Anticyclone / marais barométrique ?' },
      { label: 'Dépression / front / traîne active ?' },
    ]
  },
  {
    title: 'Vent météo',
    rows: [
      { label: 'Vent moyen au sol',    sub: 'Force, direction' },
      { label: 'En altitude',          sub: 'Coupes verticales' },
      { label: 'Brises',               sub: 'Force / direction' },
      { label: 'Pièges aérologiques',  sub: 'Foehn, rafales, cisaillements', danger: true },
    ]
  },
  {
    title: 'Nébulosité / Humidité',
    rows: [
      { label: 'Base nuages / octas',  sub: 'Étalements, sur-développements Cb' },
      { label: 'Précipitations',       sub: 'Pluie, grêle, neige, brouillard' },
      { label: 'Convection / sondage', sub: "Inversion, couche d'arrêt" },
      { label: 'Pièges aérologiques',  sub: 'Dust, orage Cb, cisaillements', danger: true },
    ]
  },
  {
    title: 'Stabilité / Instabilité',
    rows: [
      { label: 'Indice global de stabilité' },
    ]
  },
  {
    title: 'Indice de confiance',
    rows: [
      { label: 'Cohérence / Fiabilité des modèles' },
      { label: 'Sécurité / Risques', danger: true },
    ]
  },
];

const LS_INDEX_KEY  = 'meteo_competitions_index';
const LS_DATA_PREFIX = 'meteo_competition_';

// ============================================================
// RUNTIME STATE
// ============================================================
let verdicts = [null, null, null];
let winds    = [null, null, null];

// lights[pageIdx][sectionIdx][rowIdx][modelIdx] = 'green'|'orange'|'red'|null
let lights = makeEmptyLights();

function makeEmptyLights() {
  return [0, 1, 2].map(p =>
    EVAL_SECTIONS.map(sec =>
      sec.rows.map(() =>
        PAGE_MODELS[p].map(() => null)
      )
    )
  );
}

// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('date-display').textContent =
    new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  buildAllPages();
  renderCompetitionsList();
});

// ============================================================
// PAGE BUILDER
// ============================================================
function buildAllPages() {
  buildDayPage(0);
  buildDayPage(1);
  buildDayPage(2);
}

function buildDayPage(p) {
  const container = document.getElementById('eval-sections-' + p);
  if (!container) return;
  container.innerHTML = '';

  EVAL_SECTIONS.forEach((sec, si) => {
    const models = PAGE_MODELS[p];
    const div = document.createElement('div');
    div.className = 'section';

    const hdr = document.createElement('div');
    hdr.className = 'section-header';
    hdr.textContent = sec.title;
    div.appendChild(hdr);

    const table = document.createElement('table');
    table.className = 'eval-table';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    const thCrit = document.createElement('th');
    thCrit.textContent = 'Critère';
    headRow.appendChild(thCrit);
    models.forEach(m => {
      const th = document.createElement('th');
      th.innerHTML = '<div class="model-col-head"><span>' + m + '</span></div>';
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    sec.rows.forEach((row, ri) => {
      const tr = document.createElement('tr');

      const tdLabel = document.createElement('td');
      if (row.danger) tdLabel.classList.add('danger-label');
      tdLabel.innerHTML = row.label + (row.sub ? '<span class="row-sub">' + row.sub + '</span>' : '');
      tr.appendChild(tdLabel);

      models.forEach((m, mi) => {
        const td = document.createElement('td');
        td.innerHTML =
          '<div class="lights">' +
            '<div class="light green"  onclick="toggleLight(' + p + ',' + si + ',' + ri + ',' + mi + ',\'green\')"></div>' +
            '<div class="light orange" onclick="toggleLight(' + p + ',' + si + ',' + ri + ',' + mi + ',\'orange\')"></div>' +
            '<div class="light red"    onclick="toggleLight(' + p + ',' + si + ',' + ri + ',' + mi + ',\'red\')"></div>' +
          '</div>';
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    div.appendChild(table);

    if (sec.title === 'Indice de confiance') {
      const bar = document.createElement('div');
      bar.className = 'confidence-bar';
      bar.innerHTML =
        '<div class="conf-label">Score favorable estimé (tous critères, tous modèles)</div>' +
        '<div class="conf-track"><div class="conf-fill" id="confill' + p + '" style="width:0%;background:#2ecc71;"></div></div>' +
        '<div class="conf-value" id="confval' + p + '">—</div>';
      div.appendChild(bar);
    }

    container.appendChild(div);
  });
}

// ============================================================
// INTERACTIONS
// ============================================================
function switchPage(i) {
  document.querySelectorAll('.page').forEach((p, j) => p.classList.toggle('active', i === j));
  document.querySelectorAll('.tab').forEach((t, j)  => t.classList.toggle('active', i === j));
  if (i === 3) updateBilan();
}

function toggleLight(p, si, ri, mi, color) {
  const current = lights[p][si][ri][mi];
  lights[p][si][ri][mi] = (current === color) ? null : color;
  renderLight(p, si, ri, mi);
  updateConfidence(p);
}

function renderLight(p, si, ri, mi) {
  const container = document.getElementById('eval-sections-' + p);
  const tables    = container.querySelectorAll('.eval-table');
  const table     = tables[si];
  const rows      = table.querySelectorAll('tbody tr');
  const tr        = rows[ri];
  const tds       = tr.querySelectorAll('td');
  const td        = tds[mi + 1];
  const lightEls  = td.querySelectorAll('.light');
  const val       = lights[p][si][ri][mi];
  lightEls.forEach(l => {
    const c = [...l.classList].find(x => ['green', 'orange', 'red'].includes(x));
    l.classList.toggle('active', c === val);
  });
}

function setVerdict(page, v) {
  verdicts[page] = v;
  const pg = document.getElementById('page' + page);
  pg.querySelectorAll('.verdict-btn').forEach(b => b.classList.remove('active'));
  pg.querySelector('.verdict-btn.' + v).classList.add('active');
}

function setWind(page, w) {
  winds[page] = w;
  const pg = document.getElementById('page' + page);
  pg.querySelectorAll('.wind-cell').forEach(c => c.classList.remove('active'));
  pg.querySelector('.wind-cell.' + w).classList.add('active');
}

function updateConfidence(p) {
  let green = 0, total = 0;
  lights[p].forEach(sec =>
    sec.forEach(row =>
      row.forEach(val => {
        if (val !== null) { total++; if (val === 'green') green++; }
      })
    )
  );
  const fill = document.getElementById('confill' + p);
  const val  = document.getElementById('confval' + p);
  if (!fill || !val) return;
  if (total === 0) { fill.style.width = '0%'; val.textContent = '—'; return; }
  const score = Math.round((green / total) * 100);
  fill.style.width      = score + '%';
  fill.style.background = score >= 70 ? '#2ecc71' : score >= 40 ? '#f39c12' : '#e74c3c';
  val.textContent       = score + '% favorable';
}

// ============================================================
// BILAN
// ============================================================
function updateBilan() {
  const labels   = ['J-3/J-4', 'J-1/J-2', 'Jour J'];
  const vLabels  = { go: 'Maintien ✓', wait: 'En attente ~', stop: 'Annulation ✗', null: 'Non renseigné' };
  const vClasses = { go: 'green', wait: 'orange', stop: 'red', null: 'neutral' };

  const sv = document.getElementById('summary-verdicts');
  sv.innerHTML = labels.map((l, i) =>
    '<div class="sum-card ' + vClasses[verdicts[i]] + '">' +
      '<div class="sval">' + vLabels[verdicts[i]] + '</div>' +
      '<div class="slab">' + l + '</div>' +
    '</div>'
  ).join('');

  const ss = document.getElementById('summary-scores');
  ss.innerHTML = labels.map((l, i) => {
    const el  = document.getElementById('confval' + i);
    const val = el ? el.textContent : '—';
    return '<div class="sum-card neutral">' +
      '<div class="sval" style="font-size:14px;">' + val + '</div>' +
      '<div class="slab">' + l + '</div>' +
    '</div>';
  }).join('');

  const fd = document.getElementById('final-decision');
  const counts = { go: 0, wait: 0, stop: 0 };
  verdicts.forEach(v => { if (v) counts[v]++; });
  if      (counts.stop >= 2) { fd.textContent = '❌ Annulation recommandée'; fd.style.color = '#c0392b'; }
  else if (counts.go   >= 2) { fd.textContent = '✅ Maintien recommandé';   fd.style.color = '#27ae60'; }
  else if (counts.wait >= 1) { fd.textContent = '⏳ Décision en attente';   fd.style.color = '#d68910'; }
  else                       { fd.textContent = '— Données insuffisantes';  fd.style.color = '#888';    }

  renderCompetitionsList();
}

// ============================================================
// STATE SNAPSHOT HELPERS
// ============================================================
function collectObs() {
  const selects = [...document.querySelectorAll('.obs-grid select')];
  const inputs  = [...document.querySelectorAll('.obs-grid input[type=text]')];
  const result  = {};
  selects.forEach((s, i) => result['s' + i] = s.value);
  inputs.forEach((inp, i) => result['i' + i] = inp.value);
  return result;
}

function applyObs(obs) {
  if (!obs) return;
  const selects = [...document.querySelectorAll('.obs-grid select')];
  const inputs  = [...document.querySelectorAll('.obs-grid input[type=text]')];
  selects.forEach((s, i) => { if (obs['s' + i] !== undefined) s.value = obs['s' + i]; });
  inputs.forEach((inp, i) => { if (obs['i' + i] !== undefined) inp.value = obs['i' + i]; });
}

function collectNotes() {
  return [0, 1, 2].map(i => {
    const el = document.getElementById('note' + i);
    return el ? el.value : '';
  });
}

function applyNotes(arr) {
  if (!arr) return;
  arr.forEach((v, i) => {
    const el = document.getElementById('note' + i);
    if (el) el.value = v || '';
  });
}

function buildSnapshot(name) {
  return {
    version:  1,
    name:     name || '',
    savedAt:  new Date().toISOString(),
    verdicts: [...verdicts],
    winds:    [...winds],
    lights:   JSON.parse(JSON.stringify(lights)),
    notes:    collectNotes(),
    obs:      collectObs(),
  };
}

function applySnapshot(snap) {
  // verdicts
  [0,1,2].forEach(i => {
    verdicts[i] = snap.verdicts?.[i] ?? null;
    const pg = document.getElementById('page' + i);
    pg.querySelectorAll('.verdict-btn').forEach(b => b.classList.remove('active'));
    if (verdicts[i]) {
      const btn = pg.querySelector('.verdict-btn.' + verdicts[i]);
      if (btn) btn.classList.add('active');
    }
  });

  // winds
  [0,1,2].forEach(i => {
    winds[i] = snap.winds?.[i] ?? null;
    const pg = document.getElementById('page' + i);
    pg.querySelectorAll('.wind-cell').forEach(c => c.classList.remove('active'));
    if (winds[i]) {
      const cell = pg.querySelector('.wind-cell.' + winds[i]);
      if (cell) cell.classList.add('active');
    }
  });

  // lights
  if (snap.lights) {
    lights = JSON.parse(JSON.stringify(snap.lights));
    [0,1,2].forEach(p =>
      EVAL_SECTIONS.forEach((sec, si) =>
        sec.rows.forEach((row, ri) =>
          PAGE_MODELS[p].forEach((m, mi) => renderLight(p, si, ri, mi))
        )
      )
    );
    [0,1,2].forEach(p => updateConfidence(p));
  }

  applyNotes(snap.notes);
  applyObs(snap.obs);
}

// ============================================================
// LOCAL STORAGE CRUD
// ============================================================
function lsGetIndex() {
  try { return JSON.parse(localStorage.getItem(LS_INDEX_KEY)) || []; }
  catch { return []; }
}

function lsSetIndex(idx) {
  localStorage.setItem(LS_INDEX_KEY, JSON.stringify(idx));
}

function lsSave(snap) {
  const idx      = lsGetIndex();
  const existing = idx.find(c => c.id === snap.id);
  if (existing) {
    existing.name    = snap.name;
    existing.savedAt = snap.savedAt;
  } else {
    idx.push({ id: snap.id, name: snap.name, savedAt: snap.savedAt });
  }
  lsSetIndex(idx);
  localStorage.setItem(LS_DATA_PREFIX + snap.id, JSON.stringify(snap));
}

function lsLoad(id) {
  try { return JSON.parse(localStorage.getItem(LS_DATA_PREFIX + id)); }
  catch { return null; }
}

function lsDelete(id) {
  lsSetIndex(lsGetIndex().filter(c => c.id !== id));
  localStorage.removeItem(LS_DATA_PREFIX + id);
}

// ============================================================
// SAVE MODAL
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('save-name-input').addEventListener('keydown', e => {
    if (e.key === 'Enter')  confirmSave();
    if (e.key === 'Escape') closeSaveModal();
  });
  document.getElementById('save-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('save-modal')) closeSaveModal();
  });
});

function openSaveModal() {
  const input = document.getElementById('save-name-input');
  input.value = 'Compétition ' + new Date().toLocaleDateString('fr-FR');
  document.getElementById('save-modal').classList.add('open');
  setTimeout(() => { input.focus(); input.select(); }, 50);
}

function closeSaveModal() {
  document.getElementById('save-modal').classList.remove('open');
}

function confirmSave() {
  const name = document.getElementById('save-name-input').value.trim();
  if (!name) { alert('Veuillez saisir un nom.'); return; }
  const snap = buildSnapshot(name);
  snap.id    = 'comp_' + Date.now();
  lsSave(snap);
  closeSaveModal();
  renderCompetitionsList();
  showToast('« ' + name + ' » sauvegardée.');
}

// ============================================================
// COMPETITIONS LIST (rendered in Bilan tab)
// ============================================================
function renderCompetitionsList() {
  const container = document.getElementById('competitions-list');
  if (!container) return;
  const idx = lsGetIndex();

  if (idx.length === 0) {
    container.innerHTML = '<div class="comp-empty">Aucune compétition sauvegardée.</div>';
    return;
  }

  const sorted = [...idx].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  container.innerHTML = sorted.map(c => {
    const d = new Date(c.savedAt).toLocaleString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    return '<div class="comp-row" id="comprow-' + c.id + '">' +
        '<div class="comp-info">' +
          '<div class="comp-name">' + escHtml(c.name) + '</div>' +
          '<div class="comp-date">Sauvegardée le ' + d + '</div>' +
        '</div>' +
        '<div class="comp-actions">' +
          '<button class="comp-btn load-btn"   onclick="loadComp(\'' + c.id + '\')">Charger</button>' +
          '<button class="comp-btn export-btn" onclick="exportSingle(\'' + c.id + '\')">JSON ↓</button>' +
          '<button class="comp-btn delete-btn" onclick="deleteComp(\'' + c.id + '\')">✕</button>' +
        '</div>' +
      '</div>';
  }).join('');
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function loadComp(id) {
  const snap = lsLoad(id);
  if (!snap) { alert('Données introuvables.'); return; }
  if (!confirm('Charger « ' + snap.name + ' » ?\nLes données actuelles non sauvegardées seront perdues.')) return;
  applySnapshot(snap);
  switchPage(0);
  showToast('« ' + snap.name + ' » chargée.');
}

function deleteComp(id) {
  const idx  = lsGetIndex();
  const item = idx.find(c => c.id === id);
  if (!item) return;
  if (!confirm('Supprimer « ' + item.name + ' » ?')) return;
  lsDelete(id);
  renderCompetitionsList();
  showToast('Compétition supprimée.');
}

// ============================================================
// JSON EXPORT
// ============================================================

/** Export a single saved competition by id */
function exportSingle(id) {
  const snap = lsLoad(id);
  if (!snap) { alert('Données introuvables.'); return; }
  downloadJson(snap, sanitizeFilename(snap.name) + '.json');
}

/** Export current (unsaved) state as JSON */
function exportCurrent() {
  const name = prompt('Nom pour l\'export :', 'Compétition ' + new Date().toLocaleDateString('fr-FR'));
  if (name === null) return;
  const snap = buildSnapshot(name.trim() || 'export');
  snap.id    = 'export_' + Date.now();
  downloadJson(snap, sanitizeFilename(snap.name || 'export') + '.json');
}

/** Export ALL saved competitions as one JSON array */
function exportAll() {
  const idx = lsGetIndex();
  if (idx.length === 0) { alert('Aucune compétition à exporter.'); return; }
  const all = idx.map(c => lsLoad(c.id)).filter(Boolean);
  downloadJson(all, 'meteo_competitions_' + isoDate() + '.json');
}

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================
// JSON IMPORT
// ============================================================
function triggerImport() {
  document.getElementById('import-file-input').click();
}

function handleImportFile(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      let data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) data = [data];
      let count = 0;
      data.forEach(snap => {
        if (!snap || !snap.verdicts) return;
        if (!snap.id)      snap.id      = 'import_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
        if (!snap.name)    snap.name    = 'Import ' + new Date().toLocaleDateString('fr-FR');
        if (!snap.savedAt) snap.savedAt = new Date().toISOString();
        lsSave(snap);
        count++;
      });
      renderCompetitionsList();
      showToast(count + ' compétition(s) importée(s).');
    } catch {
      alert('Fichier JSON invalide.');
    }
    input.value = '';
  };
  reader.readAsText(file);
}

// ============================================================
// RESET
// ============================================================
function resetAll() {
  if (!confirm('Réinitialiser toutes les données du formulaire ?')) return;

  verdicts.fill(null);
  winds.fill(null);
  lights = makeEmptyLights();

  document.querySelectorAll('.light').forEach(l       => l.classList.remove('active'));
  document.querySelectorAll('.verdict-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.wind-cell').forEach(c   => c.classList.remove('active'));
  document.querySelectorAll('.note-area').forEach(t   => t.value = '');
  document.querySelectorAll('.obs-grid select').forEach(s => s.selectedIndex = 0);
  document.querySelectorAll('.obs-grid input').forEach(i  => i.value = '');
  for (let i = 0; i < 3; i++) {
    const f = document.getElementById('confill' + i);
    const v = document.getElementById('confval' + i);
    if (f) f.style.width = '0%';
    if (v) v.textContent = '—';
  }
}

// ============================================================
// UTILS
// ============================================================
function sanitizeFilename(str) {
  return String(str).replace(/[^a-zA-Z0-9_\-éèêàùûîïôœæç ]/g, '_').replace(/\s+/g, '_').slice(0, 60);
}

function isoDate() {
  return new Date().toISOString().slice(0, 10);
}

let _toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}
