'use client';

import { useCallback, useEffect, useState } from 'react';
import { Manager } from '@/types';
import { getManagers } from '@/lib/api/managers';

export function useManagers() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getManagers();
      setManagers(list);
    } catch (e) {
      console.error('Failed to fetch managers:', e);
      setManagers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { managers, loading, refresh };
}
