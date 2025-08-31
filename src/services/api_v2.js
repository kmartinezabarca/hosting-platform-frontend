// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const getToken = () => localStorage.getItem('auth_token');

const buildHeaders = (extra = {}, isForm = false) => {
  const token = getToken();
  const base = {
    Accept: 'application/json',
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return { ...base, ...extra };
};

/**
 * apiFetch: pequeño wrapper sobre fetch con manejo de JSON y errores
 */
export async function apiFetch(path, { method = 'GET', headers = {}, body, isForm = false } = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: buildHeaders(headers, isForm),
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  // 204 No Content
  if (res.status === 204) return { success: true };

  let data;
  try {
    data = await res.json();
  } catch {
    // Si no es JSON
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { success: true };
  }

  if (!res.ok) {
    const message = data?.message || `HTTP ${res.status}`;
    const error = new Error(message);
    error.payload = data;
    throw error;
  }
  return data;
}
