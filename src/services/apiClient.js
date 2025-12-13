const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'API request failed');
  }
  if (response.status === 204) return null;
  return response.json();
};

export const apiClient = {
  async list(resource) {
    const res = await fetch(`${API_BASE}/${resource}`);
    return handleResponse(res);
  },
  async get(resource, id) {
    const res = await fetch(`${API_BASE}/${resource}/${id}`);
    return handleResponse(res);
  },
  async create(resource, payload) {
    const res = await fetch(`${API_BASE}/${resource}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },
  async update(resource, id, payload) {
    const res = await fetch(`${API_BASE}/${resource}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },
  async remove(resource, id) {
    const res = await fetch(`${API_BASE}/${resource}/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },
  async warmup() {
    try {
      await fetch(`${API_BASE}/health`);
    } catch (err) {
      console.warn('API warmup failed', err);
    }
  }
};
