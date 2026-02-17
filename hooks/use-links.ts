// Custom hook for managing links state

'use client';

import { useState, useEffect, useCallback } from 'react';
import { NegativeLink, FilterParams } from '@/types';
import { getLinks, createLink, updateLink, deleteLink } from '@/lib/api/links';
import { CreateLinkDto, UpdateLinkDto } from '@/types/api';

export function useLinks(initialFilters?: FilterParams) {
  const [links, setLinks] = useState<NegativeLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterParams>(initialFilters || {});

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLinks(filters);
      setLinks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch links');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const addLink = async (data: CreateLinkDto) => {
    try {
      const newLink = await createLink(data);
      setLinks(prev => [newLink, ...prev]);
      return newLink;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create link');
    }
  };

  const modifyLink = async (id: string, data: UpdateLinkDto) => {
    try {
      const updated = await updateLink(id, data);
      setLinks(prev => prev.map(link => link.id === id ? updated : link));
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update link');
    }
  };

  const removeLink = async (id: string) => {
    try {
      await deleteLink(id);
      setLinks(prev => prev.filter(link => link.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete link');
    }
  };

  const refresh = () => {
    fetchLinks();
  };

  return {
    links,
    loading,
    error,
    filters,
    setFilters,
    addLink,
    modifyLink,
    removeLink,
    refresh,
  };
}
