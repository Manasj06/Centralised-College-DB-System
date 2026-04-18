let _students = [];
let _colleges  = [];

async function renderStudents() {
  const [sRes, cRes] = await Promise.all([api.get('/students'), api.get('/colleges')]);
  _students = sRes.data?.data || [];
  _colleges = cRes.data?.data || [];

  if (currentUser.role === 'Admin') {
    document.getElementById('topbar-actions').innerHTML = `
      <button class="btn btn-primary" onclick="openStudentModal()">
        ${icons.plus} Add Student
      </button>`;
  }

  renderStudentsTable();
}

function renderStudentsTable() {
  document.getElementById('content-area').innerHTML = `
    <div class="table-wrapper">
      <div class="table-header">
        <h3>Students <span style="font-size:13px;color:var(--text-muted);font-weight:400">(${_students.length})</span></h3>
        <div class="search-input">${icons.search}<input id="student-search" placeholder="Search students…"/></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th><th>Name</th><th>Email</th><th>Gender</th>
            <th>College</th><th>Phone</th><th>Joined</th>
            ${currentUser.role === 'Admin' ? '<th>Actions</th>' : ''}
          </tr>
        </thead>
        <tbody id="students-body">
          ${_students.length ? _students.map((s, i) => `
            <tr>
              <td style="color:var(--text-muted)">${i + 1}</td>
              <td><strong>${s.full_name}</strong></td>
              <td style="color:var(--text-muted)">${s.email}</td>
              <td>${s.gender}</td>
              <td>${s.college_name}</td>
              <td>${s.phone || '—'}</td>
              <td>${fmtDate(s.created_at)}</td>
              ${currentUser.role === 'Admin' ? `
              <td>
                <div class="td-actions">
                  <button class="btn btn-sm btn-icon" title="Edit" onclick="openStudentModal(${s.student_id})">${icons.edit}</button>
                  <button class="btn btn-sm btn-icon" title="Delete" onclick="deleteStudent(${s.student_id},'${s.full_name}')">${icons.delete}</button>
                </div>
              </td>` : ''}
            </tr>`).join('') : `
            <tr><td colspan="8">
              <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                <h4>No students found</h4><p>Add your first student to get started.</p>
              </div>
            </td></tr>`}
        </tbody>
      </table>
    </div>`;
  setupSearch('student-search', 'students-body', [1, 2, 4]);
}

function openStudentModal(id) {
  const s = id ? _students.find(x => x.student_id === id) : null;
  const collegeOptions = _colleges.map(c =>
    `<option value="${c.college_id}" ${s?.college_id == c.college_id ? 'selected' : ''}>${c.college_name}</option>`
  ).join('');

  openModal(s ? 'Edit Student' : 'Add Student', `
    <div class="form-row">
      <div class="form-group">
        <label>Full Name *</label>
        <input id="s-name" value="${s?.full_name || ''}" placeholder="Full name"/>
      </div>
      <div class="form-group">
        <label>Email *</label>
        <input id="s-email" type="email" value="${s?.email || ''}" placeholder="email@example.com"/>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Date of Birth *</label>
        <input id="s-dob" type="date" value="${s?.dob ? s.dob.split('T')[0] : ''}"/>
      </div>
      <div class="form-group">
        <label>Gender *</label>
        <select id="s-gender">
          <option value="">Select gender</option>
          ${['Male','Female','Other'].map(g => `<option ${s?.gender===g?'selected':''}>${g}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Phone</label>
        <input id="s-phone" value="${s?.phone || ''}" placeholder="Phone number"/>
      </div>
      <div class="form-group">
        <label>College *</label>
        <select id="s-college"><option value="">Select college</option>${collegeOptions}</select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveStudent(${id || 'null'})">
        ${s ? 'Update' : 'Create'} Student
      </button>
    </div>
  `);
}

async function saveStudent(id) {
  const body = {
    full_name:  document.getElementById('s-name').value.trim(),
    email:      document.getElementById('s-email').value.trim(),
    dob:        document.getElementById('s-dob').value,
    gender:     document.getElementById('s-gender').value,
    phone:      document.getElementById('s-phone').value.trim(),
    college_id: document.getElementById('s-college').value,
  };
  if (!body.full_name || !body.email || !body.dob || !body.gender || !body.college_id) {
    toast('Please fill all required fields', 'error'); return;
  }
  const res = id ? await api.put(`/students/${id}`, body) : await api.post('/students', body);
  if (res.ok) {
    toast(id ? 'Student updated!' : 'Student created!');
    closeModal();
    renderStudents();
  } else {
    toast(res.data.message || 'Error saving student', 'error');
  }
}

async function deleteStudent(id, name) {
  confirmDelete(name, async () => {
    const res = await api.delete(`/students/${id}`);
    if (res.ok) { toast('Student deleted'); renderStudents(); }
    else toast(res.data.message, 'error');
  });
}
