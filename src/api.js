const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(status, message, retryAfter = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new ApiError(0, 'Network error');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const headerValue = Number(response.headers.get('Retry-After'));
    const headerRetry = Number.isFinite(headerValue) && headerValue > 0 ? headerValue : null;
    throw new ApiError(response.status, data?.error ?? 'Request failed', data?.retryAfter ?? headerRetry);
  }
  return data;
}

const query = (userId) => `userId=${encodeURIComponent(userId)}`;

export const generate = (prompt, userId) =>
  request('/api/ai/generate', { method: 'POST', body: JSON.stringify({ prompt, userId }) });

export const fetchStatus = (userId) => request(`/api/quota/status?${query(userId)}`);

export const fetchHistory = (userId) => request(`/api/quota/history?${query(userId)}`);

export const upgradePlan = (userId) =>
  request(`/api/quota/upgrade?${query(userId)}`, { method: 'POST' });
