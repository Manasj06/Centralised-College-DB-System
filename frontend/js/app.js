// ── State ──────────────────────────────────────────────────────
let currentUser = null;
let currentPage = null;

// ── Nav config per role ────────────────────────────────────────
const NAV = {
  Admin: [
    { section: 'Overview' },
    { id: 'dashboard',     label: 'Dashboard',     icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { section: 'Management' },
    { id: 'students',      label: 'Students',      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'courses',       label: 'Courses',       icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'colleges',      label: 'Colleges',      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'registrations', label: 'Registrations', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { section: 'System' },
    { id: 'users',         label: 'Users & Roles', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  ],
  Faculty: [
    { section: 'Overview' },
    { id: 'dashboard',     label: 'Dashboard',     icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { section: 'Manage' },
    { id: 'courses',       label: 'Courses',       icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'students',      label: 'Students',      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'registrations', label: 'Registrations', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  ],
  Student: [
    { section: 'My Account' },
    { id: 'courses',    label: 'Browse Courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'my-courses', label: 'My Courses',    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  ],
};

// ── Page router ────────────────────────────────────────────────
const PAGES = {
  dashboard:     () => renderDashboard(),
  students:      () => renderStudents(),
  courses:       () => renderCourses(),
  colleges:      () => renderColleges(),
  registrations: () => renderRegistrations(),
  users:         () => renderUsers(),
  'my-courses':  () => renderMyCourses(),
};

async function navigate(pageId) {
  currentPage = pageId;
  // Update active nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pageId);
  });
  // Update topbar title
  const label = document.querySelector(`.nav-item[data-page="${pageId}"]`)?.textContent.trim() || pageId;
  document.getElementById('page-title').textContent = label;
  // Clear topbar actions
  document.getElementById('topbar-actions').innerHTML = '';
  // Load page
  const contentArea = document.getElementById('content-area');
  contentArea.innerHTML = spinner();

  // Collapse the sidebar after navigation on smaller screens.
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
  }

  try {
    if (PAGES[pageId]) {
      await PAGES[pageId]();
    } else {
      contentArea.innerHTML = '<p>Page not found</p>';
    }
  } catch (err) {
    console.error(`Failed to render page "${pageId}"`, err);
    contentArea.innerHTML = `
      <div class="card">
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h4>Couldn't load this page</h4>
          <p>Please try again. If it keeps happening, check the browser console for details.</p>
        </div>
      </div>`;
    toast('Failed to load page', 'error');
  }
}

// ── Login ──────────────────────────────────────────────────────
async function doLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  const btn      = document.getElementById('login-btn');

  if (!username || !password) {
    errEl.textContent = 'Please enter username and password.';
    errEl.classList.remove('hidden');
    return;
  }

  btn.disabled = true;
  btn.querySelector('span').textContent = 'Signing in…';
  errEl.classList.add('hidden');

  const res = await api.post('/auth/login', { username, password });

  btn.disabled = false;
  btn.querySelector('span').textContent = 'Sign In';

  if (!res.ok) {
    errEl.textContent = res.data.message || 'Login failed';
    errEl.classList.remove('hidden');
    return;
  }

  const { token, user } = res.data;
  localStorage.setItem('cms_token', token);
  localStorage.setItem('cms_user', JSON.stringify(user));
  currentUser = user;

  bootApp();
}

// Handle Enter key on login
document.getElementById('login-password')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});
document.getElementById('login-username')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});

// ── Logout ─────────────────────────────────────────────────────
function doLogout() {
  localStorage.removeItem('cms_token');
  localStorage.removeItem('cms_user');
  currentUser = null;
  setAuthenticatedView(false);
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
}

function setAuthenticatedView(isAuthenticated) {
  document.getElementById('login-page').classList.toggle('active', !isAuthenticated);
  document.getElementById('app-shell').classList.toggle('hidden', !isAuthenticated);

  if (!isAuthenticated) {
    document.getElementById('sidebar').classList.remove('open');
    closeModal();
  }

  window.scrollTo(0, 0);
}

// ── Boot app ───────────────────────────────────────────────────
function bootApp() {
  setAuthenticatedView(true);

  // Set sidebar user info
  document.getElementById('sidebar-username').textContent = currentUser.name;
  document.getElementById('sidebar-role').textContent = currentUser.role;
  document.getElementById('user-avatar').textContent = currentUser.name.charAt(0).toUpperCase();

  // Build nav
  buildNav(currentUser.role);

  // Navigate to default page
  const defaultPage = currentUser.role === 'Student' ? 'courses' : 'dashboard';
  navigate(defaultPage);
}

function buildNav(role) {
  const nav = document.getElementById('sidebar-nav');
  const items = NAV[role] || [];
  nav.innerHTML = items.map(item => {
    if (item.section) {
      return `<div class="nav-section">${item.section}</div>`;
    }
    return `
      <div class="nav-item" data-page="${item.id}" onclick="navigate('${item.id}')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="${item.icon}" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        ${item.label}
      </div>`;
  }).join('');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── Auto-login if token present ────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('cms_token');
  const user  = localStorage.getItem('cms_user');
  if (token && user) {
    currentUser = JSON.parse(user);
    bootApp();
  }
});
