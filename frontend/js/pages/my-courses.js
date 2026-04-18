async function renderMyCourses() {
  const studentRes = await api.get('/students/me');
  const myStudent = studentRes.data?.data;

  if (!myStudent) {
    document.getElementById('content-area').innerHTML = `
      <div class="card">
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <h4>No student record found</h4>
          <p>Your student profile hasn't been created yet. Please contact the administrator.</p>
        </div>
      </div>`;
    return;
  }

  const res = await api.get('/students/me/courses');
  const courses = res.data?.data || [];

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  document.getElementById('content-area').innerHTML = `
    <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px">
      <div class="stat-card">
        <div class="stat-card-icon icon-blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
        </div>
        <div class="stat-card-value">${courses.length}</div>
        <div class="stat-card-label">Courses Enrolled</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon icon-green">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        </div>
        <div class="stat-card-value">${totalCredits}</div>
        <div class="stat-card-label">Total Credits</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon icon-orange">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/></svg>
        </div>
        <div class="stat-card-value">${myStudent.college_name}</div>
        <div class="stat-card-label">My College</div>
      </div>
    </div>

    <div class="table-wrapper">
      <div class="table-header">
        <h3>My Registered Courses</h3>
      </div>
      <table>
        <thead>
          <tr><th>#</th><th>Course Name</th><th>Code</th><th>Credits</th><th>College</th><th>Registered On</th><th>Action</th></tr>
        </thead>
        <tbody>
          ${courses.length ? courses.map((c, i) => `
            <tr>
              <td style="color:var(--text-muted)">${i+1}</td>
              <td><strong>${c.course_name}</strong></td>
              <td><span style="font-family:var(--font-mono);font-size:12px;color:var(--primary)">${c.course_code}</span></td>
              <td><span class="credits-badge">${c.credits} cr</span></td>
              <td>${c.college_name}</td>
              <td>${fmtDateTime(c.registered_at)}</td>
              <td>
                <button class="btn btn-sm btn-danger" onclick="unregisterCourse(${c.reg_id},'${c.course_name}')">Unregister</button>
              </td>
            </tr>`).join('') : `
            <tr><td colspan="7">
              <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13"/></svg>
                <h4>No courses registered</h4>
                <p>Go to <strong>Browse Courses</strong> to register for courses.</p>
              </div>
            </td></tr>`}
        </tbody>
      </table>
    </div>`;
}

async function unregisterCourse(regId, courseName) {
  confirmDelete(`registration from ${courseName}`, async () => {
    const res = await api.delete(`/registrations/${regId}`);
    if (res.ok) { toast('Unregistered successfully'); renderMyCourses(); }
    else toast(res.data.message || 'Error', 'error');
  });
}
