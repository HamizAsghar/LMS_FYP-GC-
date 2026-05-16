const TOKEN_KEY = 'eduhub_token';
const USER_KEY = 'eduhub_user';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (typeof document !== 'undefined') {
    const maxAge = 60 * 60 * 24 * 7;
    document.cookie = `eduhub_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  if (typeof document !== 'undefined') {
    document.cookie = 'eduhub_token=; path=/; max-age=0';
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(json.message || 'Request failed');
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}

export async function uploadFile(file, folder = 'eduhub') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  const json = await apiFetch('/api/upload', { method: 'POST', body: formData });
  return json.data;
}
