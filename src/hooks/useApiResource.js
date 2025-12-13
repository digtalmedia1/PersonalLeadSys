import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/services/apiClient';

export const useApiResource = (resource) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.list(resource);
      setItems(data || []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createItem = async (payload) => {
    const created = await apiClient.create(resource, payload);
    setItems((prev) => [created, ...prev]);
    return created;
  };

  const updateItem = async (id, payload) => {
    const updated = await apiClient.update(resource, id, payload);
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  };

  const deleteItem = async (id) => {
    await apiClient.remove(resource, id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return { items, loading, error, refresh, createItem, updateItem, deleteItem, setItems };
};
