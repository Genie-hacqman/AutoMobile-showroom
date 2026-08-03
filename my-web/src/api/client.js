// Thin fetch wrapper that talks to the FastAPI backend.
// The access token lives in memory only; the refresh token stays in an HTTP-only
// cookie so a page refresh can silently restore the session.

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');

let accessToken = null;
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = token || null;
}

export function getAccessToken() {
  return accessToken;
}

export function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((entry) => entry.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export class ApiError extends Error {
  constructor(message, status, fieldErrors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors || {};
  }
}

function toFieldErrors(errors) {
  if (!Array.isArray(errors)) return {};
  return errors.reduce((accumulator, item) => {
    if (item?.field) accumulator[item.field] = item.message;
    return accumulator;
  }, {});
}

async function parseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

async function rawRequest(path, { method = 'GET', body, headers = {} } = {}) {
  const requestHeaders = { ...headers };
  if (body !== undefined) requestHeaders['Content-Type'] = 'application/json';
  if (accessToken) requestHeaders.Authorization = `Bearer ${accessToken}`;

  const csrfToken = readCookie('csrf_token');
  if (csrfToken) requestHeaders['X-CSRF-Token'] = csrfToken;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await parseBody(response);
  if (!response.ok) {
    const detail = payload?.detail || 'Something went wrong. Please try again.';
    throw new ApiError(detail, response.status, toFieldErrors(payload?.errors));
  }
  return payload;
}

export async function refreshSession() {
  // Collapse concurrent refreshes into a single network call.
  if (!refreshPromise) {
    refreshPromise = rawRequest('/auth/refresh', { method: 'POST', body: {} })
      .then((tokens) => {
        setAccessToken(tokens.access_token);
        return tokens;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function request(path, options = {}) {
  try {
    return await rawRequest(path, options);
  } catch (error) {
    const canRetry = error instanceof ApiError && error.status === 401 && !options.skipRefresh;
    if (!canRetry) throw error;
    await refreshSession();
    return rawRequest(path, options);
  }
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, skipRefresh: true }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, skipRefresh: true }),
  logout: (payload = {}) => request('/auth/logout', { method: 'POST', body: payload, skipRefresh: true }),
  verifyEmail: (token) => request('/auth/verify-email', { method: 'POST', body: { token }, skipRefresh: true }),
  resendVerification: (email) =>
    request('/auth/resend-verification', { method: 'POST', body: { email }, skipRefresh: true }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email }, skipRefresh: true }),
  resetPassword: (token, newPassword) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: { token, new_password: newPassword },
      skipRefresh: true,
    }),
  changePassword: (currentPassword, newPassword) =>
    request('/auth/change-password', {
      method: 'POST',
      body: { current_password: currentPassword, new_password: newPassword },
    }),
  me: () => request('/users/me'),
  updateMe: (payload) => request('/users/me', { method: 'PUT', body: payload }),
  deleteMe: () => request('/users/me', { method: 'DELETE' }),
  adminListUsers: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null),
    ).toString();
    return request(`/admin/users${query ? `?${query}` : ''}`);
  },
  adminUpdateUser: (userId, payload) => request(`/admin/users/${userId}`, { method: 'PATCH', body: payload }),
  adminDeleteUser: (userId) => request(`/admin/users/${userId}`, { method: 'DELETE' }),
};

export default api;
