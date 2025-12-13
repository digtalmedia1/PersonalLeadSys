import { apiClient } from './apiClient';

const resourceMap = {
  empire_projects: 'projects',
  empire_channels: 'channels',
  empire_contacts: 'contacts',
  empire_leads: 'leads',
  empire_messages: 'messages',
  empire_tasks: 'tasks',
  empire_faq_templates: 'faq_templates'
};

const cache = {};
const original = typeof window !== 'undefined' ? window.localStorage : null;

const syncResource = async (key, records) => {
  const resource = resourceMap[key];
  if (!resource) return;
  try {
    const existing = await apiClient.list(resource);
    await Promise.all((existing || []).map((item) => apiClient.remove(resource, item.id)));
    await Promise.all((records || []).map((item) => apiClient.create(resource, item)));
  } catch (err) {
    console.warn('Failed to sync resource', key, err);
  }
};

const patchStorage = () => {
  if (!original) return;
  const originalGet = original.getItem.bind(original);
  const originalSet = original.setItem.bind(original);
  const originalRemove = original.removeItem.bind(original);

  original.getItem = (key) => {
    if (cache[key] !== undefined) return cache[key];
    return originalGet(key);
  };

  original.setItem = (key, value) => {
    cache[key] = value;
    if (resourceMap[key]) {
      try {
        const parsed = JSON.parse(value || '[]');
        syncResource(key, parsed);
      } catch (err) {
        console.warn('Failed to parse storage payload', err);
      }
      originalSet(key, value);
    } else {
      originalSet(key, value);
    }
  };

  original.removeItem = (key) => {
    delete cache[key];
    if (resourceMap[key]) {
      syncResource(key, []);
    } else {
      originalRemove(key);
    }
  };
};

export const initializeApiStorage = async () => {
  if (!original) return;
  try {
    await Promise.all(
      Object.entries(resourceMap).map(async ([key, resource]) => {
        const data = await apiClient.list(resource);
        const serialized = JSON.stringify(data || []);
        cache[key] = serialized;
        original.setItem(key, serialized);
      })
    );
  } catch (err) {
    console.warn('Failed to preload API storage', err);
  } finally {
    patchStorage();
  }
};
