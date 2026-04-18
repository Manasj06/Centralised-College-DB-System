// ── Toast notifications ────────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'success'
        ? '<polyline points="20 6 9 17 4 12"/>'
        : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
    </svg>
    <span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ── Modal ──────────────────────────────────────────────────────
function openModal(title, bodyHTML, onConfirm) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal-overlay').classList.add('active');
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal(evt) {
  if (evt && evt.target !== document.getElementById('modal-overlay')) return;
  document.getElementById('modal-overlay').classList.remove('active');
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ── Spinner ────────────────────────────────────────────────────
function spinner() { return '<div class="spinner"></div>'; }

// ── Date formatter ─────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}
function fmtDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

// ── Role badge ─────────────────────────────────────────────────
function roleBadge(role) {
  const map = { Admin:'badge-admin', Faculty:'badge-faculty', Student:'badge-student' };
  return `<span class="badge ${map[role] || 'badge-default'}">${role}</span>`;
}

// ── Icon SVGs ──────────────────────────────────────────────────
const icons = {
  edit:   `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  delete: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  view:   `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  plus:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
};

// ── Confirm delete ─────────────────────────────────────────────
function confirmDelete(label, onConfirm) {
  openModal('Confirm Delete', `
    <p style="color:var(--text-muted);margin-bottom:20px;">
      Are you sure you want to delete <strong>${label}</strong>? This action cannot be undone.
    </p>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-danger" onclick="(${onConfirm})();closeModal()">Delete</button>
    </div>
  `);
}

// ── Search filter helper ────────────────────────────────────────
function setupSearch(inputId, tableBodyId, cols) {
  document.getElementById(inputId)?.addEventListener('input', function() {
    const q = this.value.toLowerCase();
    const rows = document.querySelectorAll(`#${tableBodyId} tr`);
    rows.forEach(row => {
      const text = cols.map(i => row.cells[i]?.textContent.toLowerCase() || '').join(' ');
      row.style.display = text.includes(q) ? '' : 'none';
    });
  });
}
