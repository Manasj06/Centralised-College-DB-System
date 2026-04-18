const API_BASE = '/api';

const api = {
  token: () => localStorage.getItem('cms_token'),

  headers() {
    const h = { 'Content-Type': 'application/json' };
    if (this.token()) h['Authorization'] = `Bearer ${this.token()}`;
    return h;
  },

  async request(method, path, body) {
    try {
      const opts = { method, headers: this.headers() };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(API_BASE + path, opts);
      const data = await res.json();
      if (res.status === 401 || res.status === 403) {
        if (res.status === 401) { doLogout(); return; }
      }
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      return { ok: false, data: { message: 'Network error: ' + err.message } };
    }
  },

  get:    (path)       => api.request('GET',    path),
  post:   (path, body) => api.request('POST',   path, body),
  put:    (path, body) => api.request('PUT',    path, body),
  delete: (path)       => api.request('DELETE', path),
};
