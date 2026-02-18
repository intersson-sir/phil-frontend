// Filter utility functions for Phil CRM

import { NegativeLink, FilterParams, Manager } from '@/types';
import { isDateInRange } from './dates';

function getManagerId(manager: NegativeLink['manager']): string | undefined {
  if (manager == null) return undefined;
  if (typeof manager === 'object' && 'id' in manager) return (manager as Manager).id;
  return typeof manager === 'string' ? manager : undefined;
}

export function applyFilters(links: NegativeLink[], filters: FilterParams): NegativeLink[] {
  return links.filter((link) => {
    // Platform filter
    if (filters.platform && link.platform !== filters.platform) {
      return false;
    }

    // Status filter
    if (filters.status && link.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority && link.priority !== filters.priority) {
      return false;
    }

    // Manager filter (compare manager id)
    if (filters.manager && getManagerId(link.manager) !== filters.manager) {
      return false;
    }

    // Date range filter
    if (!isDateInRange(link.detected_at, filters.dateFrom, filters.dateTo)) {
      return false;
    }

    // Search filter (URL)
    if (filters.search && !link.url.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    return true;
  });
}

export function sortLinks(
  links: NegativeLink[],
  sortBy: keyof NegativeLink,
  sortOrder: 'asc' | 'desc' = 'desc'
): NegativeLink[] {
  return [...links].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (aVal === undefined || bVal === undefined) return 0;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return 0;
  });
}
