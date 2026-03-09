/* ============================================================
   Liturgical Commentary Index — Static Site App
   Single-page app with hash-based routing
   ============================================================ */

let DATA = null;       // { entries: [...], eras: [...] }
let currentPage = 1;
const PAGE_SIZE = 25;
let filteredEntries = [];
let sortCol = null;
let sortDir = 'asc';

// ── Data loading ──────────────────────────────────────────────
async function loadData() {
  if (DATA) return DATA;
  const resp = await fetch('data/data.json');
  DATA = await resp.json();
  return DATA;
}

// ── Router ────────────────────────────────────────────────────
function getHash() {
  const h = window.location.hash.replace('#', '') || 'home';
  return h.split('?')[0];
}
function getHashParams() {
  const h = window.location.hash;
  const idx = h.indexOf('?');
  if (idx === -1) return {};
  const params = {};
  new URLSearchParams(h.slice(idx + 1)).forEach((v, k) => { params[k] = v; });
  return params;
}
function navigate(page, params = {}) {
  const qs = new URLSearchParams(params).toString();
  window.location.hash = qs ? `${page}?${qs}` : page;
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', () => {
  loadData().then(route);
});

async function route() {
  await loadData();
  const page = getHash();
  const params = getHashParams();

  // Hide all sections
  document.querySelectorAll('.page-section').forEach(s => s.style.display = 'none');

  // Update nav active state
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  switch (page) {
    case 'home':    renderHome(); break;
    case 'browse':  renderBrowse(params); break;
    case 'eras':    renderEras(); break;
    case 'map':     renderMap(); break;
    case 'submit':  renderSubmit(); break;
    default:        renderHome();
  }
}

// ── HOME ──────────────────────────────────────────────────────
function renderHome() {
  const sec = document.getElementById('page-home');
  sec.style.display = 'block';

  const { entries, eras } = DATA;
  const withCoords = entries.filter(e => e.lat && e.lon).length;
  const withLinks  = entries.filter(e => e.link).length;
  const withTrans  = entries.filter(e => e.translations).length;

  document.getElementById('stat-total').textContent   = entries.length;
  document.getElementById('stat-eras').textContent    = eras.length;
  document.getElementById('stat-coords').textContent  = withCoords;
  document.getElementById('stat-links').textContent   = withLinks;
  document.getElementById('stat-trans').textContent   = withTrans;

  // Era cards
  const grid = document.getElementById('era-cards-home');
  grid.innerHTML = '';
  eras.forEach(era => {
    const count = entries.filter(e => e.era === era.name).length;
    if (!count) return;
    const card = document.createElement('div');
    card.className = 'era-card';
    card.innerHTML = `<h3>${escHtml(era.name)}</h3>
      <div class="count">${count}</div>
      <div class="count-label">entr${count === 1 ? 'y' : 'ies'}</div>`;
    card.addEventListener('click', () => navigate('browse', { era: era.name }));
    grid.appendChild(card);
  });
}

// ── BROWSE ────────────────────────────────────────────────────
function renderBrowse(params = {}) {
  const sec = document.getElementById('page-browse');
  sec.style.display = 'block';

  // Populate era dropdown
  const eraSelect = document.getElementById('filter-era');
  if (eraSelect.options.length <= 1) {
    DATA.eras.forEach(era => {
      const opt = document.createElement('option');
      opt.value = era.name;
      opt.textContent = era.name;
      eraSelect.appendChild(opt);
    });
  }

  // Set filter values from params
  if (params.q)   document.getElementById('filter-q').value = params.q;
  if (params.era) eraSelect.value = params.era;
  if (params.location) document.getElementById('filter-location').value = params.location;
  if (params.rank)     document.getElementById('filter-rank').value = params.rank;
  if (params.has_trans === '1') document.getElementById('filter-trans').checked = true;
  if (params.has_link  === '1') document.getElementById('filter-link').checked  = true;
  if (params.has_coords === '1') document.getElementById('filter-coords').checked = true;

  applyFilters();
}

function applyFilters() {
  const q       = document.getElementById('filter-q').value.trim().toLowerCase();
  const era     = document.getElementById('filter-era').value;
  const loc     = document.getElementById('filter-location').value.trim().toLowerCase();
  const rank    = document.getElementById('filter-rank').value.trim().toLowerCase();
  const hasTrans  = document.getElementById('filter-trans').checked;
  const hasLink   = document.getElementById('filter-link').checked;
  const hasCoords = document.getElementById('filter-coords').checked;

  filteredEntries = DATA.entries.filter(e => {
    if (q && ![e.author, e.title, e.remarks, e.editions, e.localization, e.order_rank]
              .some(f => f && f.toLowerCase().includes(q))) return false;
    if (era && e.era !== era) return false;
    if (loc && !(e.localization && e.localization.toLowerCase().includes(loc))) return false;
    if (rank && !(e.order_rank && e.order_rank.toLowerCase().includes(rank))) return false;
    if (hasTrans && !e.translations) return false;
    if (hasLink  && !e.link)         return false;
    if (hasCoords && !(e.lat && e.lon)) return false;
    return true;
  });

  if (sortCol !== null) {
    filteredEntries.sort((a, b) => {
      const av = (a[sortCol] || '').toString().toLowerCase();
      const bv = (b[sortCol] || '').toString().toLowerCase();
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }

  currentPage = 1;
  renderTable();
}

function renderTable() {
  const total = filteredEntries.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = filteredEntries.slice(start, start + PAGE_SIZE);

  document.getElementById('results-info').innerHTML =
    `Showing <strong>${start + 1}–${Math.min(start + PAGE_SIZE, total)}</strong> of <strong>${total}</strong> results`;

  const tbody = document.getElementById('browse-tbody');
  tbody.innerHTML = '';

  if (!slice.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--ink-light);">No entries found.</td></tr>`;
  } else {
    slice.forEach(e => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="td-author">${escHtml(e.author)}</td>
        <td class="td-title">${escHtml(truncate(e.title, 70))}</td>
        <td class="td-date">${escHtml(e.date)}</td>
        <td><span class="badge badge-era" style="font-size:0.68rem;">${escHtml(truncate(e.era, 28))}</span></td>
        <td style="font-size:0.82rem;color:var(--ink-light);">${escHtml(truncate(e.localization, 35))}</td>
        <td style="font-size:0.82rem;color:var(--ink-light);">${escHtml(truncate(e.order_rank, 28))}</td>
        <td>
          ${e.translations ? '<span class="badge badge-trans">Trans.</span> ' : ''}
          ${e.link ? '<span class="badge badge-link">Link</span>' : ''}
        </td>
        <td><button class="btn btn-secondary btn-sm" onclick="openDetail(${e.id})">View</button></td>`;
      tbody.appendChild(tr);
    });
  }

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const pag = document.getElementById('pagination');
  pag.innerHTML = '';

  const addBtn = (label, page, disabled, active) => {
    const btn = document.createElement('button');
    btn.innerHTML = label;
    btn.disabled = disabled;
    if (active) btn.classList.add('active');
    btn.addEventListener('click', () => { currentPage = page; renderTable(); });
    pag.appendChild(btn);
  };

  addBtn('&laquo;', 1, currentPage === 1, false);
  addBtn('&lsaquo;', currentPage - 1, currentPage === 1, false);

  const start = Math.max(1, currentPage - 2);
  const end   = Math.min(totalPages, currentPage + 2);
  for (let p = start; p <= end; p++) addBtn(p, p, false, p === currentPage);

  addBtn('&rsaquo;', currentPage + 1, currentPage === totalPages, false);
  addBtn('&raquo;', totalPages, currentPage === totalPages, false);
}

// Column sorting
function setSortCol(col) {
  if (sortCol === col) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortCol = col;
    sortDir = 'asc';
  }
  document.querySelectorAll('thead th[data-sort]').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
    if (th.dataset.sort === col) th.classList.add(`sort-${sortDir}`);
  });
  applyFilters();
}

// ── DETAIL MODAL ──────────────────────────────────────────────
function openDetail(id) {
  const e = DATA.entries.find(x => x.id === id);
  if (!e) return;

  const field = (label, val, isLink) => {
    if (!val) return '';
    let v;
    if (isLink) {
      if (isPdfLink(val)) {
        // PDF links open in internal viewer
        v = `<a href="#" onclick="openPdfModal('${escHtml(val)}', '${escHtml(e.title || 'Document')}'); return false;" style="color:var(--crimson);">${escHtml(truncate(val, 70))}</a>`;
      } else {
        // Non-PDF links open in new tab
        v = `<a href="${escHtml(val)}" target="_blank" rel="noopener">${escHtml(truncate(val, 70))}</a>`;
      }
    } else {
      v = escHtml(val);
    }
    return `<div class="detail-field"><div class="detail-label">${label}</div><div class="detail-value">${v}</div></div>`;
  };

  document.getElementById('modal-title').textContent = e.title || '(Untitled)';
  document.getElementById('modal-author').textContent = e.author + (e.date ? ' — ' + e.date : '');
  document.getElementById('modal-body').innerHTML = `
    <div class="detail-grid">
      <div>
        ${field('Author', e.author)}
        ${field('Title', e.title)}
        ${field('Date of Composition', e.date)}
        ${field('PL Reference', e.pl)}
        ${field('Editions', e.editions)}
        ${field('Remarks', e.remarks)}
        ${field('External Link', e.link, true)}
      </div>
      <div>
        ${field('Historical Era', e.era)}
        ${field('Order / Rank', e.order_rank)}
        ${field('Localization', e.localization)}
        ${field('Dedicatee', e.dedicatee)}
        ${field('Translations', e.translations)}
        ${e.lat && e.lon ? field('Coordinates', `${e.lat.toFixed(4)}° N, ${e.lon.toFixed(4)}° E`) : ''}
      </div>
    </div>`;

  document.getElementById('modal-overlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  document.body.style.overflow = '';
}

// ── PDF MODAL ─────────────────────────────────────────────
function openPdfModal(url, title) {
  document.getElementById('pdf-modal-title').textContent = title || 'Document Viewer';
  document.getElementById('pdf-iframe').src = url;
  document.getElementById('pdf-modal-overlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closePdfModal() {
  document.getElementById('pdf-modal-overlay').style.display = 'none';
  document.getElementById('pdf-iframe').src = '';
  document.body.style.overflow = '';
}

function handlePdfOverlayClick(e) {
  if (e.target === document.getElementById('pdf-modal-overlay')) closePdfModal();
}

function isPdfLink(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes('.pdf') || lower.includes('libgen.is') || lower.includes('pdf');
}

// ── ERAS ──────────────────────────────────────────────────────
function renderEras() {
  const sec = document.getElementById('page-eras');
  sec.style.display = 'block';

  const container = document.getElementById('eras-container');
  container.innerHTML = '';

  const { entries, eras } = DATA;

  // Era summary cards
  const grid = document.createElement('div');
  grid.className = 'era-grid';
  grid.style.marginBottom = '3rem';
  eras.forEach(era => {
    const count = entries.filter(e => e.era === era.name).length;
    if (!count) return;
    const card = document.createElement('div');
    card.className = 'era-card';
    card.innerHTML = `<h3>${escHtml(era.name)}</h3>
      <div class="count">${count}</div>
      <div class="count-label">entr${count === 1 ? 'y' : 'ies'} — click to expand</div>`;
    card.addEventListener('click', () => {
      // Create a safe ID from the era name
      const safeId = era.name.replace(/[^a-zA-Z0-9]/g, '-');
      const tbl = document.getElementById(`era-table-${safeId}`);
      if (tbl) tbl.style.display = tbl.style.display === 'none' ? 'block' : 'none';
    });
    grid.appendChild(card);
  });
  container.appendChild(grid);

  // Era detail tables
  eras.forEach(era => {
    const eraEntries = entries.filter(e => e.era === era.name);
    if (!eraEntries.length) return;

    // Create a safe ID from the era name
    const safeId = era.name.replace(/[^a-zA-Z0-9]/g, '-');
    const section = document.createElement('div');
    section.id = `era-table-${safeId}`;
    section.style.display = 'none';
    section.style.marginBottom = '2.5rem';
    section.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;padding-bottom:0.75rem;border-bottom:2px solid var(--border);">
        <h2 style="font-family:'EB Garamond',serif;font-size:1.5rem;color:var(--crimson);">${escHtml(era.name)}</h2>
        <button class="btn btn-secondary btn-sm" onclick="navigate('browse',{era:'${escHtml(era.name)}'})">Browse all ${eraEntries.length}</button>
      </div>
      <div class="table-wrapper">
        <table>
          <thead><tr>
            <th>Author</th><th>Title</th><th>Date</th><th>Location</th><th></th>
          </tr></thead>
          <tbody>
            ${eraEntries.map(e => `<tr>
              <td class="td-author">${escHtml(e.author)}</td>
              <td class="td-title">${escHtml(truncate(e.title, 65))}</td>
              <td class="td-date">${escHtml(e.date)}</td>
              <td style="font-size:0.82rem;color:var(--ink-light);">${escHtml(truncate(e.localization, 35))}</td>
              <td><button class="btn btn-secondary btn-sm" onclick="openDetail(${e.id})">View</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    container.appendChild(section);
  });
}

// ── MAP ───────────────────────────────────────────────────────
let mapInstance = null;
let allMarkers  = [];
let markerLayer = null;

function renderMap() {
  const sec = document.getElementById('page-map');
  sec.style.cssText = 'display:flex !important; flex-direction:column; height:calc(100vh - 60px);';

  const { entries } = DATA;
  const geoEntries = entries.filter(e => e.lat && e.lon);

  // Build century list for slider
  // Centuries: 1st–18th (100–1800)
  const CENTURIES = [
    { label: 'All Periods', min: 0, max: 9999 },
    { label: 'Early Christian (1st–6th c.)', min: 1, max: 600 },
    { label: '7th–8th Century', min: 601, max: 800 },
    { label: '9th Century (Carolingian)', min: 801, max: 900 },
    { label: '10th Century', min: 901, max: 1000 },
    { label: '11th Century', min: 1001, max: 1100 },
    { label: '12th Century', min: 1101, max: 1200 },
    { label: '13th Century', min: 1201, max: 1300 },
    { label: '14th Century', min: 1301, max: 1400 },
    { label: '15th Century', min: 1401, max: 1500 },
    { label: '16th Century', min: 1501, max: 1600 },
    { label: '17th–18th Century', min: 1601, max: 1800 },
  ];

  const slider = document.getElementById('century-slider');
  slider.min = 0;
  slider.max = CENTURIES.length - 1;
  slider.value = 0;

  function updateMapFilter() {
    const idx = parseInt(slider.value);
    const cent = CENTURIES[idx];
    document.getElementById('century-display').textContent = cent.label;

    const visible = geoEntries.filter(e => {
      if (cent.min === 0) return true;
      if (!e.year) return false;
      return e.year >= cent.min && e.year <= cent.max;
    });

    document.getElementById('map-count').textContent = `${visible.length} entries`;

    if (markerLayer) {
      mapInstance.removeLayer(markerLayer);
    }

    const markers = visible.map(e => {
      const marker = L.circleMarker([e.lat, e.lon], {
        radius: 8,
        fillColor: '#8b1a1a',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
      });
      marker.bindPopup(`
        <strong style="color:#8b1a1a;">${escHtml(e.author)}</strong><br>
        <em>${escHtml(truncate(e.title, 70))}</em><br>
        <small style="color:#5a4e3a;">${escHtml(e.date)}${e.localization ? ' · ' + escHtml(e.localization) : ''}</small><br>
        <small style="color:#5a4e3a;">${escHtml(truncate(e.era, 40))}</small><br>
        <a href="#" onclick="openDetail(${e.id});return false;" style="color:#8b1a1a;font-size:0.8rem;">View full entry →</a>
      `);
      return marker;
    });

    markerLayer = L.layerGroup(markers);
    markerLayer.addTo(mapInstance);

    if (visible.length > 0) {
      const bounds = visible.map(e => [e.lat, e.lon]);
      mapInstance.fitBounds(bounds, { padding: [30, 30], maxZoom: 8 });
    }
  }

  // Init Leaflet map if not already done
  if (!mapInstance) {
    mapInstance = L.map('leaflet-map').setView([48.5, 10.0], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(mapInstance);
  }

  slider.addEventListener('input', updateMapFilter);
  updateMapFilter();

  // Force map resize after display
  setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 100);
}

// ── SUBMIT ────────────────────────────────────────────────────
function renderSubmit() {
  const sec = document.getElementById('page-submit');
  sec.style.display = 'block';

  // Populate era dropdown in form
  const eraSelect = document.getElementById('submit-era');
  if (eraSelect.options.length <= 1) {
    DATA.eras.forEach(era => {
      const opt = document.createElement('option');
      opt.value = era.name;
      opt.textContent = era.name;
      eraSelect.appendChild(opt);
    });
  }
}

// ── HELPERS ───────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}
