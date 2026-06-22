/**
 * API service — handles all HTTP requests to the Express backend.
 * Automatically attaches the auth token from localStorage.
 */

const API_BASE = '/api';

/**
 * Get the stored auth token (demo or Firebase)
 */
function getToken() {
  return localStorage.getItem('shopwave_token');
}

/**
 * Generic fetch wrapper with auth and error handling
 */
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}

// --- Auth ---
export const authApi = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),
};

// --- Products ---
export const productApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/products/${id}`),
  create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  addReview: (id, data) =>
    request(`/products/${id}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
};

// --- Categories ---
export const categoryApi = {
  getAll: () => request('/categories'),
  create: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
};

// --- Orders ---
export const orderApi = {
  getAll: () => request('/orders'),
  getById: (id) => request(`/orders/${id}`),
  create: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, data) =>
    request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// --- Payments ---
export const paymentApi = {
  getConfig: () => request('/payments/config'),
  createIntent: (amount) =>
    request('/payments/create-intent', { method: 'POST', body: JSON.stringify({ amount }) }),
};

// --- Notifications ---
export const notificationApi = {
  getVapidKey: () => request('/notifications/vapid-key'),
  subscribe: (subscription) =>
    request('/notifications/subscribe', { method: 'POST', body: JSON.stringify({ subscription }) }),
  broadcast: (data) =>
    request('/notifications/broadcast', { method: 'POST', body: JSON.stringify(data) }),
};
