let _collegesList = [];

async function renderColleges() {
  const res = await api.get('/colleges');
  _collegesList = res.data?.data || [];

  document.getElementById('topbar-actions').innerHTML = `
    <button class="btn btn-primary" onclick="openCollegeModal()">
      ${icons.plus} Add College
    </button>`;

  document.getElementById('content-area').innerHTML = `
    <div class="table-wrapper">
      <div class="table-header">
        <h3>Colleges <span style="font-size:13px;color:var(--text-muted);font-weight:400">(${_collegesList.length})</span></h3>
        <div class="search-input">${icons.search}<input id="college-search" placeholder="Search colleges…"/></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th><th>College Name</th><th>City</th><th>Est. Year</th>
            <th>Email</th><th>Students</th><th>Courses</th><th>Actions</th>
          </tr>
        </thead>
        <tbody id="colleges-body">
          ${_collegesList.map((c, i) => `
            <tr>
              <td style="color:var(--text-muted)">${i+1}</td>
              <td><strong>${c.college_name}</strong></td>
              <td>${c.city || '—'}</td>
              <td>${c.established_year || '—'}</td>
              <td style="color:var(--text-muted)">${c.email || '—'}</td>
              <td>${c.student_count}</td>
              <td>${c.course_count}</td>
              <td>
                <div class="td-actions">
                  <button class="btn btn-sm btn-icon" onclick="openCollegeModal(${c.college_id})" title="Edit">${icons.edit}</button>
                  <button class="btn btn-sm btn-icon" onclick="deleteCollege(${c.college_id},'${c.college_name}')" title="Delete">${icons.delete}</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  setupSearch('college-search', 'colleges-body', [1, 2]);
}

function openCollegeModal(id) {
  const c = id ? _collegesList.find(x => x.college_id === id) : null;
  openModal(c ? 'Edit College' : 'Add College', `
    <div class="form-group">
      <label>College Name *</label>
      <input id="col-name" value="${c?.college_name || ''}" placeholder="College name"/>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>City</label>
        <input id="col-city" value="${c?.city || ''}" placeholder="City"/>
      </div>
      <div class="form-group">
        <label>Established Year</label>
        <input id="col-year" type="number" value="${c?.established_year || ''}" placeholder="e.g. 1980"/>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Email</label>
        <input id="col-email" type="email" value="${c?.email || ''}" placeholder="contact@college.edu"/>
      </div>
      <div class="form-group">
        <label>Phone</label>
        <input id="col-phone" value="${c?.phone || ''}" placeholder="Phone number"/>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveCollege(${id || 'null'})">
        ${c ? 'Update' : 'Create'} College
      </button>
    </div>`);
}

async function saveCollege(id) {
  const body = {
    college_name:     document.getElementById('col-name').value.trim(),
    city:             document.getElementById('col-city').value.trim(),
    established_year: document.getElementById('col-year').value || null,
    email:            document.getElementById('col-email').value.trim(),
    phone:            document.getElementById('col-phone').value.trim(),
  };
  if (!body.college_name) { toast('College name is required', 'error'); return; }
  const res = id ? await api.put(`/colleges/${id}`, body) : await api.post('/colleges', body);
  if (res.ok) {
    toast(id ? 'College updated!' : 'College created!');
    closeModal(); renderColleges();
  } else {
    toast(res.data.message || 'Error saving college', 'error');
  }
}

async function deleteCollege(id, name) {
  confirmDelete(name, async () => {
    const res = await api.delete(`/colleges/${id}`);
    if (res.ok) { toast('College deleted'); renderColleges(); }
    else toast(res.data.message, 'error');
  });
}
