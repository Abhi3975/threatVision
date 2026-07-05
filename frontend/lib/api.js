export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getCameras: () => request('/api/cameras'),
  addCamera: (body) => request('/api/cameras', { method: 'POST', body: JSON.stringify(body) }),
  setCameraStatus: (id, status) =>
    request(`/api/cameras/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  removeCamera: (id) => request(`/api/cameras/${id}`, { method: 'DELETE' }),

  getEvents: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ).toString();
    return request(`/api/events${query ? `?${query}` : ''}`);
  },
  acknowledgeEvent: (id) => request(`/api/events/${id}/acknowledge`, { method: 'PATCH' }),
  deleteEvent: (id) => request(`/api/events/${id}`, { method: 'DELETE' }),

  getEvidence: () => request('/api/evidence'),
  getAnalytics: () => request('/api/analytics/summary'),
};

export function frameUrl(snapshot) {
  return snapshot ? `${API_URL}/frames/${snapshot}` : null;
}
