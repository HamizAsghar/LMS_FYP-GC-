'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api-client';

export function useApi(path, options = {}) {
  const { immediate = true, deps = [] } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!path) return;
    if (!data) setLoading(true);
    setError(null);
    try {
      const json = await apiFetch(path);
      setData(json.data ?? json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    if (immediate && path) refetch();
  }, [path, immediate, refetch, ...deps]);

  return { data, loading, error, refetch };
}
