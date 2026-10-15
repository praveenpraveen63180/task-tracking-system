export const API = import.meta.env.VITE_API_URL || '/api';

export async function apiCall(path, opts = {}, token, onUnauthorized) {
  const res = await fetch(API + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {})
    }
  });

  let data = {};
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    if (res.status === 401 && path !== '/auth/login') {
      if (onUnauthorized) onUnauthorized();
    }
    throw new Error(data.detail || 'Something went wrong');
  }

  return data;
}
