let _courses  = [];
let _collegesC = [];

async function renderCourses() {
  const [cRes, colRes] = await Promise.all([api.get('/courses'), api.get('/colleges')]);
  _courses   = cRes.data?.data   || [];
  _collegesC = colRes.data?.data || [];

  const canEdit = ['Admin','Faculty'].includes(currentUser.role);
  if (canEdit) {
    document.getElementById('topbar-actions').innerHTML = `
      <button class="btn btn-primary" onclick="openCourseModal()">
        ${icons.plus} Add Course
      </button>`;
  }

  if (currentUser.role === 'Student') {
    renderCourseCards();
  } else {
    renderCoursesTable();
  }
}

function renderCoursesTable() {
  const canDelete = currentUser.role === 'Admin';
  document.getElementById('content-area').innerHTML = `
    <div class="table-wrapper">
      <div class="table-header">
        <h3>Courses <span style="font-size:13px;color:var(--text-muted);font-weight:400">(${_courses.length})</span></h3>
        <div class="search-input">${icons.search}<input id="course-search" placeholder="Search courses…"/></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th><th>Course Name</th><th>Code</th>
            <th>Credits</th><th>College</th><th>Enrolled</th><th>Actions</th>
          </tr>
        </thead>
        <tbody id="courses-body">
          ${_courses.map((c, i) => `
            <tr>
              <td style="color:var(--text-muted)">${i + 1}</td>
              <td><strong>${c.course_name}</strong></td>
              <td><span style="font-family:var(--font-mono);font-size:12px;color:var(--primary)">${c.course_code}</span></td>
              <td><span class="credits-badge">${c.credits} cr</span></td>
              <td>${c.college_name}</td>
              <td>${c.enrolled_count}</td>
              <td>
                <div class="td-actions">
                  <button class="btn btn-sm btn-icon" onclick="openCourseModal(${c.course_id})" title="Edit">${icons.edit}</button>
                  <button class="btn btn-sm btn-icon" onclick="viewCourseStudents(${c.course_id},'${c.course_name}')" title="View students">${icons.view}</button>
                  ${canDelete ? `<button class="btn btn-sm btn-icon" onclick="deleteCourse(${c.course_id},'${c.course_name}')" title="Delete">${icons.delete}</button>` : ''}
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  setupSearch('course-search', 'courses-body', [1, 2, 4]);
}

async function renderCourseCards() {
  // Get current student's existing registrations to show "Registered" status
  const rRes = await api.get('/students/me/courses');
  const registered = new Set((rRes.data?.data || []).map(r => r.course_id));

  document.getElementById('content-area').innerHTML = `
    <div style="margin-bottom:20px;">
      <div class="search-input" style="max-width:320px">${icons.search}
        <input id="course-search-cards" placeholder="Search courses…" oninput="filterCards(this.value)"/>
      </div>
    </div>
    <div class="course-grid" id="course-grid">
      ${_courses.map(c => `
        <div class="course-card" data-name="${c.course_name.toLowerCase()}" data-code="${c.course_code.toLowerCase()}">
          <div class="course-card-code">${c.course_code}</div>
          <div class="course-card-name">${c.course_name}</div>
          <div class="course-card-meta">🏫 ${c.college_name}</div>
          <div class="course-card-desc">${c.description || 'No description available.'}</div>
          <div class="course-card-footer">
            <span class="credits-badge">${c.credits} Credits</span>
            ${registered.has(c.course_id)
              ? `<button class="btn btn-sm btn-secondary" disabled>✓ Registered</button>`
              : `<button class="btn btn-sm btn-primary" onclick="registerForCourse(${c.course_id}, this)">Register</button>`}
          </div>
        </div>`).join('')}
    </div>`;
}

function filterCards(q) {
  document.querySelectorAll('#course-grid .course-card').forEach(el => {
    const match = el.dataset.name.includes(q.toLowerCase()) || el.dataset.code.includes(q.toLowerCase());
    el.style.display = match ? '' : 'none';
  });
}

async function registerForCourse(courseId, btn) {
  btn.disabled = true;
  btn.textContent = '…';
  const res = await api.post('/registrations', { course_id: courseId });
  if (res.ok) {
    btn.textContent = '✓ Registered';
    btn.className = 'btn btn-sm btn-secondary';
    toast('Successfully registered for course!');
  } else {
    btn.disabled = false;
    btn.textContent = 'Register';
    toast(res.data.message || 'Registration failed', 'error');
  }
}

function openCourseModal(id) {
  const c = id ? _courses.find(x => x.course_id === id) : null;
  const colOpts = _collegesC.map(col =>
    `<option value="${col.college_id}" ${c?.college_id == col.college_id ? 'selected' : ''}>${col.college_name}</option>`
  ).join('');

  openModal(c ? 'Edit Course' : 'Add Course', `
    <div class="form-row">
      <div class="form-group">
        <label>Course Name *</label>
        <input id="c-name" value="${c?.course_name || ''}" placeholder="e.g. Database Management"/>
      </div>
      <div class="form-group">
        <label>Course Code *</label>
        <input id="c-code" value="${c?.course_code || ''}" placeholder="e.g. CS301" style="font-family:var(--font-mono)"/>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Credits (1–6) *</label>
        <input id="c-credits" type="number" min="1" max="6" value="${c?.credits || ''}" placeholder="4"/>
      </div>
      <div class="form-group">
        <label>College *</label>
        <select id="c-college"><option value="">Select college</option>${colOpts}</select>
      </div>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="c-desc" placeholder="Brief course description…">${c?.description || ''}</textarea>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveCourse(${id || 'null'})">
        ${c ? 'Update' : 'Create'} Course
      </button>
    </div>
  `);
}

async function saveCourse(id) {
  const body = {
    course_name: document.getElementById('c-name').value.trim(),
    course_code: document.getElementById('c-code').value.trim(),
    credits:     document.getElementById('c-credits').value,
    college_id:  document.getElementById('c-college').value,
    description: document.getElementById('c-desc').value.trim(),
  };
  if (!body.course_name || !body.course_code || !body.credits || !body.college_id) {
    toast('Please fill all required fields', 'error'); return;
  }
  const res = id ? await api.put(`/courses/${id}`, body) : await api.post('/courses', body);
  if (res.ok) {
    toast(id ? 'Course updated!' : 'Course created!');
    closeModal(); renderCourses();
  } else {
    toast(res.data.message || 'Error saving course', 'error');
  }
}

async function deleteCourse(id, name) {
  confirmDelete(name, async () => {
    const res = await api.delete(`/courses/${id}`);
    if (res.ok) { toast('Course deleted'); renderCourses(); }
    else toast(res.data.message, 'error');
  });
}

async function viewCourseStudents(id, name) {
  openModal(`Students in: ${name}`, spinner());
  const res = await api.get(`/courses/${id}/students`);
  const rows = res.data?.data || [];
  document.getElementById('modal-body').innerHTML = rows.length ? `
    <table style="width:100%">
      <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Enrolled</th></tr></thead>
      <tbody>${rows.map((s, i) => `
        <tr>
          <td>${i+1}</td><td><strong>${s.full_name}</strong></td>
          <td style="color:var(--text-muted)">${s.email}</td>
          <td>${fmtDate(s.registered_at)}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : `<p style="color:var(--text-muted);text-align:center;padding:32px">No students enrolled yet.</p>`;
}
