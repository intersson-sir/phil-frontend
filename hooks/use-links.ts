// Custom hook for managing links state with infinite scroll support

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { NegativeLink, FilterParams } from '@/types';
import { getLinksPage, createLink, updateLink, deleteLink } from '@/lib/api/links';
import { CreateLinkDto, UpdateLinkDto } from '@/types/api';

export function useLinks(initialFilters?: FilterParams) {
  const [links, setLinks] = useState<NegativeLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filters, setFilters] = useState<FilterParams>(() => initialFilters ?? {});

  const filtersForFetch = typeof initialFilters !== 'undefined' ? initialFilters : filters;

  // Ref to prevent stale-closure issues in loadMore
  const nextUrlRef = useRef<string | null>(null);
  nextUrlRef.current = nextUrl;

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { links: data, nextUrl: next, count } = await getLinksPage(filtersForFetch ?? {});
      setLinks(data);
      setNextUrl(next);
      setTotalCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch links');
    } finally {
      setLoading(false);
    }
  }, [filtersForFetch]);

  const loadMore = useCallback(async () => {
    const url = nextUrlRef.current;
    if (!url || loadingMore) return;
    try {
      setLoadingMore(true);
      const { links: more, nextUrl: next } = await getLinksPage(url);
      setLinks((prev) => [...prev, ...more]);
      setNextUrl(next);
    } catch {
      // silently fail — user can scroll to retry
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Sync internal filters from parent so setFilters/returned filters stay in sync
  useEffect(() => {
    const next = initialFilters ?? {};
    setFilters((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [initialFilters]);

  const addLink = async (data: CreateLinkDto) => {
    try {
      const newLink = await createLink(data);
      setLinks((prev) => [newLink, ...prev]);
      setTotalCount((c) => c + 1);
      return newLink;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create link');
    }
  };

  const modifyLink = async (id: string, data: UpdateLinkDto) => {
    try {
      const updated = await updateLink(id, data);
      setLinks((prev) => prev.map((link) => (link.id === id ? updated : link)));
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update link');
    }
  };

  const removeLink = async (id: string) => {
    try {
      await deleteLink(id);
      setLinks((prev) => prev.filter((link) => link.id !== id));
      setTotalCount((c) => Math.max(0, c - 1));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete link');
    }
  };

  const applyOptimisticStatus = useCallback((id: string, status: import('@/types').Status) => {
    setLinks((prev) => prev.map((link) => (link.id === id ? { ...link, status } : link)));
  }, []);

  const refresh = () => {
    fetchLinks();
  };

  return {
    links,
    loading,
    loadingMore,
    hasMore: !!nextUrl,
    totalCount,
    error,
    filters,
    setFilters,
    addLink,
    modifyLink,
    removeLink,
    refresh,
    loadMore,
    applyOptimisticStatus,
  };
}
