let _users = [];
let _roles  = [];
let _studentProfiles = [];
let _userColleges = [];

async function renderUsers() {
  const [uRes, rRes, sRes, cRes] = await Promise.all([
    api.get('/users'),
    api.get('/roles'),
    api.get('/students'),
    api.get('/colleges'),
  ]);
  _users = uRes.data?.data || [];
  _roles = rRes.data?.data || [];
  _studentProfiles = sRes.data?.data || [];
  _userColleges = cRes.data?.data || [];

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

function getRoleById(roleId) {
  return _roles.find(r => String(r.role_id) === String(roleId));
}

function getUserStudentProfile(user) {
  return _studentProfiles.find(s => s.email === user?.email) || null;
}

function toggleUserStudentFields() {
  const roleId = document.getElementById('u-role')?.value;
  const role = getRoleById(roleId);
  const studentFields = document.getElementById('user-student-fields');
  if (!studentFields) return;
  studentFields.classList.toggle('hidden', role?.role_name !== 'Student');
}

function openUserModal(id) {
  const u = id ? _users.find(x => x.user_id === id) : null;
  const studentProfile = getUserStudentProfile(u);
  const selectedRoleId = u ? (_roles.find(r => r.role_name === u.role_name)?.role_id || '') : '';
  const roleOpts = _roles.map(r =>
    `<option value="${r.role_id}" ${String(selectedRoleId) === String(r.role_id) ? 'selected' : ''}>${r.role_name}</option>`
  ).join('');
  const collegeOpts = _userColleges.map(c =>
    `<option value="${c.college_id}" ${studentProfile?.college_id == c.college_id ? 'selected' : ''}>${c.college_name}</option>`
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
      <select id="u-role" onchange="toggleUserStudentFields()"><option value="">Select role</option>${roleOpts}</select>
    </div>
    <div id="user-student-fields" class="${u?.role_name === 'Student' ? '' : 'hidden'}">
      <div class="form-row">
        <div class="form-group">
          <label>Date of Birth *</label>
          <input id="u-student-dob" type="date" value="${studentProfile?.dob ? studentProfile.dob.split('T')[0] : ''}"/>
        </div>
        <div class="form-group">
          <label>Gender *</label>
          <select id="u-student-gender">
            <option value="">Select gender</option>
            ${['Male','Female','Other'].map(g => `<option value="${g}" ${studentProfile?.gender === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Phone</label>
          <input id="u-student-phone" value="${studentProfile?.phone || ''}" placeholder="Phone number"/>
        </div>
        <div class="form-group">
          <label>College *</label>
          <select id="u-student-college"><option value="">Select college</option>${collegeOpts}</select>
        </div>
      </div>
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

  toggleUserStudentFields();
}

async function saveUser(id) {
  const selectedRole = getRoleById(document.getElementById('u-role').value);
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
  if (selectedRole?.role_name === 'Student') {
    body.student_profile = {
      dob:        document.getElementById('u-student-dob').value,
      gender:     document.getElementById('u-student-gender').value,
      phone:      document.getElementById('u-student-phone').value.trim(),
      college_id: document.getElementById('u-student-college').value,
    };

    if (!body.student_profile.dob || !body.student_profile.gender || !body.student_profile.college_id) {
      toast('Student date of birth, gender, and college are required', 'error');
      return;
    }
  }

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
