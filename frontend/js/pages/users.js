let _users = [];
let _roles  = [];

async function renderUsers() {
  const [uRes, rRes] = await Promise.all([api.get('/users'), api.get('/roles')]);
  _users = uRes.data?.data || [];
  _roles = rRes.data?.data || [];

  document.getElementById('topbar-actions').innerHTML = `
    <button class="btn btn-primary" onclick="openUserModal()">
      ${icons.plus} Add User
    </button>`;

  document.getElementById('content-area').innerHTML = `
    <div class="table-wrapper">
      <div class="table-header">
        <h3>System Users <span style="font-size:13px;color:var(--text-muted);font-weight:400">(${_users.length})</span></h3>
        <div class="search-input">${icons.search}<input id="user-search" placeholder="Search users…"/></div>
      </div>
      <table>
        <thead>
          <tr><th>#</th><th>Name</th><th>Email</th><th>Username</th><th>Role</th><th>Last Login</th><th>Actions</th></tr>
        </thead>
        <tbody id="users-body">
          ${_users.map((u, i) => `
            <tr>
              <td style="color:var(--text-muted)">${i+1}</td>
              <td><strong>${u.full_name}</strong></td>
              <td style="color:var(--text-muted)">${u.email}</td>
              <td style="font-family:var(--font-mono);font-size:13px">${u.username || '—'}</td>
              <td>${roleBadge(u.role_name)}</td>
              <td>${fmtDateTime(u.last_login)}</td>
              <td>
                <div class="td-actions">
                  <button class="btn btn-sm btn-icon" onclick="openUserModal(${u.user_id})" title="Edit">${icons.edit}</button>
                  <button class="btn btn-sm btn-icon" onclick="deleteUser(${u.user_id},'${u.full_name}')" title="Delete">${icons.delete}</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  setupSearch('user-search', 'users-body', [1, 2, 3]);
}

function openUserModal(id) {
  const u = id ? _users.find(x => x.user_id === id) : null;
  const roleOpts = _roles.map(r =>
    `<option value="${r.role_id}" ${u?.role_name === r.role_name ? 'selected' : ''}>${r.role_name}</option>`
  ).join('');

  openModal(u ? 'Edit User' : 'Add User', `
    <div class="form-row">
      <div class="form-group">
        <label>Full Name *</label>
        <input id="u-name" value="${u?.full_name || ''}" placeholder="Full name"/>
      </div>
      <div class="form-group">
        <label>Email *</label>
        <input id="u-email" type="email" value="${u?.email || ''}" placeholder="email@example.com"/>
      </div>
    </div>
    <div class="form-group">
      <label>Role *</label>
      <select id="u-role"><option value="">Select role</option>${roleOpts}</select>
    </div>
    ${!u ? `
    <div class="form-row">
      <div class="form-group">
        <label>Username *</label>
        <input id="u-username" placeholder="login username" style="font-family:var(--font-mono)"/>
      </div>
      <div class="form-group">
        <label>Password *</label>
        <input id="u-password" type="password" placeholder="Min 6 characters"/>
      </div>
    </div>` : ''}
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveUser(${id || 'null'})">
        ${u ? 'Update' : 'Create'} User
      </button>
    </div>`);
}

async function saveUser(id) {
  const body = {
    full_name: document.getElementById('u-name').value.trim(),
    email:     document.getElementById('u-email').value.trim(),
    role_id:   document.getElementById('u-role').value,
  };
  if (!id) {
    body.username = document.getElementById('u-username').value.trim();
    body.password = document.getElementById('u-password').value;
    if (!body.username || !body.password) { toast('Username and password required', 'error'); return; }
  }
  if (!body.full_name || !body.email || !body.role_id) { toast('Fill all required fields', 'error'); return; }

  const res = id ? await api.put(`/users/${id}`, body) : await api.post('/users', body);
  if (res.ok) {
    toast(id ? 'User updated!' : 'User created!');
    closeModal(); renderUsers();
  } else {
    toast(res.data.message || 'Error saving user', 'error');
  }
}

async function deleteUser(id, name) {
  confirmDelete(name, async () => {
    const res = await api.delete(`/users/${id}`);
    if (res.ok) { toast('User deleted'); renderUsers(); }
    else toast(res.data.message, 'error');
  });
}
