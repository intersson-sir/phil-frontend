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
  const [filters, setFilters] = useState<FilterParams>(() => initialFilters ?? {});

  // Use parent filters for fetching when they change (by value, to avoid ref loops)
  const filtersForFetch = typeof initialFilters !== 'undefined' ? initialFilters : filters;

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLinks(filtersForFetch ?? {});
      setLinks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch links');
    } finally {
      setLoading(false);
    }
  }, [filtersForFetch]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Sync internal filters from parent so setFilters/returned filters stay in sync
  useEffect(() => {
    const next = initialFilters ?? {};
    setFilters(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [initialFilters]);

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

  /** Optimistic update: set link status in UI immediately (e.g. for Kanban drag). Revert by calling refresh() on API failure. */
  const applyOptimisticStatus = useCallback((id: string, status: import('@/types').Status) => {
    setLinks(prev => prev.map(link => link.id === id ? { ...link, status } : link));
  }, []);

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
    applyOptimisticStatus,
  };
}
