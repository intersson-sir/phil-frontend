// Custom hook for managing filter state

'use client';

import { useState } from 'react';
import { FilterParams } from '@/types';

export function useFilters(initialFilters?: FilterParams) {
  const [filters, setFilters] = useState<FilterParams>(initialFilters || {});

  const updateFilter = <K extends keyof FilterParams>(
    key: K,
    value: FilterParams[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilter = (key: keyof FilterParams) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return {
    filters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    setFilters,
  };
}
