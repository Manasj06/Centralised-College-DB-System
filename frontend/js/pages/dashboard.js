async function renderDashboard() {
  const res = await api.get('/dashboard/stats');
  if (!res.ok) {
    document.getElementById('content-area').innerHTML = `<p class="text-muted">Failed to load dashboard.</p>`;
    return;
  }
  const d = res.data.data;

  document.getElementById('content-area').innerHTML = `
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-card-icon icon-blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <div class="stat-card-value">${d.totalStudents}</div>
        <div class="stat-card-label">Total Students</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon icon-green">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
        </div>
        <div class="stat-card-value">${d.totalCourses}</div>
        <div class="stat-card-label">Total Courses</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon icon-orange">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
        </div>
        <div class="stat-card-value">${d.totalColleges}</div>
        <div class="stat-card-label">Colleges</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon icon-purple">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
        </div>
        <div class="stat-card-value">${d.totalRegistrations}</div>
        <div class="stat-card-label">Registrations</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon icon-red">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <div class="stat-card-value">${d.totalUsers}</div>
        <div class="stat-card-label">System Users</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Top Enrolled Courses</h3>
        <ul class="top-courses-list">
          ${d.topCourses.length ? d.topCourses.map((c, i) => `
            <li class="course-rank-item">
              <div class="rank-num">${i + 1}</div>
              <div class="rank-name">${c.course_name}<br><span style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono)">${c.course_code}</span></div>
              <div class="rank-count">${c.enrolled} students</div>
            </li>`).join('') : '<li style="color:var(--text-muted);font-size:14px;padding:12px 0">No data yet</li>'}
        </ul>
      </div>

      <div class="card">
        <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Recent Registrations</h3>
        <ul class="activity-list">
          ${d.recentRegistrations.length ? d.recentRegistrations.map(r => `
            <li class="activity-item">
              <div class="activity-dot"></div>
              <div class="activity-text"><strong>${r.student}</strong> enrolled in ${r.course}</div>
              <div class="activity-time">${fmtDate(r.registered_at)}</div>
            </li>`).join('') : '<li style="color:var(--text-muted);font-size:14px;padding:12px 0">No registrations yet</li>'}
        </ul>
      </div>
    </div>`;
}
