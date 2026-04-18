let _regs = [];

async function renderRegistrations() {
  const res = await api.get('/registrations');
  _regs = res.data?.data || [];

  document.getElementById('content-area').innerHTML = `
    <div class="table-wrapper">
      <div class="table-header">
        <h3>All Registrations <span style="font-size:13px;color:var(--text-muted);font-weight:400">(${_regs.length})</span></h3>
        <div class="search-input">${icons.search}<input id="reg-search" placeholder="Search…"/></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th><th>Student</th><th>Student Email</th>
            <th>Course</th><th>Code</th><th>College</th><th>Credits</th><th>Registered On</th>
            ${currentUser.role === 'Admin' ? '<th>Actions</th>' : ''}
          </tr>
        </thead>
        <tbody id="regs-body">
          ${_regs.length ? _regs.map((r, i) => `
            <tr>
              <td style="color:var(--text-muted)">${i+1}</td>
              <td><strong>${r.student_name}</strong></td>
              <td style="color:var(--text-muted);font-size:13px">${r.student_email}</td>
              <td>${r.course_name}</td>
              <td><span style="font-family:var(--font-mono);font-size:12px;color:var(--primary)">${r.course_code}</span></td>
              <td>${r.college_name}</td>
              <td><span class="credits-badge">${r.credits} cr</span></td>
              <td>${fmtDateTime(r.registered_at)}</td>
              ${currentUser.role === 'Admin' ? `
              <td>
                <button class="btn btn-sm btn-icon" onclick="deleteReg(${r.reg_id},'${r.student_name}')" title="Remove">${icons.delete}</button>
              </td>` : ''}
            </tr>`).join('') : `
            <tr><td colspan="9">
              <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                <h4>No registrations yet</h4><p>Students haven't registered for courses yet.</p>
              </div>
            </td></tr>`}
        </tbody>
      </table>
    </div>`;
  setupSearch('reg-search', 'regs-body', [1, 3, 5]);
}

async function deleteReg(id, studentName) {
  confirmDelete(`registration for ${studentName}`, async () => {
    const res = await api.delete(`/registrations/${id}`);
    if (res.ok) { toast('Registration removed'); renderRegistrations(); }
    else toast(res.data.message, 'error');
  });
}
