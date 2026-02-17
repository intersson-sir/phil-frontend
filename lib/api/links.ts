// Links API for Phil CRM
// This module provides CRUD operations for negative links
// Currently uses mock data, ready to be replaced with real API calls

import { NegativeLink, FilterParams } from '@/types';
import { CreateLinkDto, UpdateLinkDto } from '@/types/api';
import { 
  getMockLinks, 
  addMockLink, 
  updateMockLink, 
  deleteMockLink 
} from './mock-data';
import { applyFilters } from '@/lib/utils/filters';
import { API_BASE_URL, USE_MOCK } from './config';

// Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get all links with optional filters
 * TODO: Replace with real API call when backend is ready
 */
export async function getLinks(filters?: FilterParams): Promise<NegativeLink[]> {
  if (USE_MOCK) {
    await delay();
    const links = getMockLinks();
    return filters ? applyFilters(links, filters) : links;
  }

  // TODO: Uncomment when backend is ready
  // const params = new URLSearchParams(filters as any);
  // const response = await fetch(`${API_BASE_URL}/api/links/?${params}`, {
  //   method: 'GET',
  //   headers: { 'Content-Type': 'application/json' },
  // });
  // if (!response.ok) throw new Error('Failed to fetch links');
  // return response.json();

  return [];
}

/**
 * Get a single link by ID
 * TODO: Replace with real API call when backend is ready
 */
export async function getLinkById(id: string): Promise<NegativeLink | null> {
  if (USE_MOCK) {
    await delay();
    const links = getMockLinks();
    return links.find(link => link.id === id) || null;
  }

  // TODO: Uncomment when backend is ready
  // const response = await fetch(`${API_BASE_URL}/api/links/${id}/`, {
  //   method: 'GET',
  //   headers: { 'Content-Type': 'application/json' },
  // });
  // if (!response.ok) throw new Error('Failed to fetch link');
  // return response.json();

  return null;
}

/**
 * Create a new link
 * TODO: Replace with real API call when backend is ready
 */
export async function createLink(data: CreateLinkDto): Promise<NegativeLink> {
  if (USE_MOCK) {
    await delay();
    const newLink: NegativeLink = {
      id: `link-${Date.now()}`,
      url: data.url,
      platform: data.platform,
      type: data.type,
      status: data.status || 'pending',
      detected_at: new Date().toISOString(),
      priority: data.priority || 'medium',
      manager: data.manager,
      notes: data.notes,
    };
    addMockLink(newLink);
    return newLink;
  }

  // TODO: Uncomment when backend is ready
  // const response = await fetch(`${API_BASE_URL}/api/links/`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // if (!response.ok) throw new Error('Failed to create link');
  // return response.json();

  throw new Error('Not implemented');
}

/**
 * Update an existing link
 * TODO: Replace with real API call when backend is ready
 */
export async function updateLink(id: string, data: UpdateLinkDto): Promise<NegativeLink> {
  if (USE_MOCK) {
    await delay();
    updateMockLink(id, data);
    const updated = await getLinkById(id);
    if (!updated) throw new Error('Link not found');
    return updated;
  }

  // TODO: Uncomment when backend is ready
  // const response = await fetch(`${API_BASE_URL}/api/links/${id}/`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // if (!response.ok) throw new Error('Failed to update link');
  // return response.json();

  throw new Error('Not implemented');
}

/**
 * Delete a link
 * TODO: Replace with real API call when backend is ready
 */
export async function deleteLink(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    deleteMockLink(id);
    return;
  }

  // TODO: Uncomment when backend is ready
  // const response = await fetch(`${API_BASE_URL}/api/links/${id}/`, {
  //   method: 'DELETE',
  //   headers: { 'Content-Type': 'application/json' },
  // });
  // if (!response.ok) throw new Error('Failed to delete link');
}

/**
 * Bulk update status for multiple links
 * TODO: Replace with real API call when backend is ready
 */
export async function bulkUpdateStatus(ids: string[], status: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    ids.forEach(id => {
      updateMockLink(id, { 
        status: status as any,
        removed_at: status === 'removed' ? new Date().toISOString() : undefined 
      });
    });
    return;
  }

  // TODO: Uncomment when backend is ready
  // const response = await fetch(`${API_BASE_URL}/api/links/bulk-update-status/`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ ids, status }),
  // });
  // if (!response.ok) throw new Error('Failed to bulk update status');
}

/**
 * Bulk assign manager to multiple links
 * TODO: Replace with real API call when backend is ready
 */
export async function bulkAssignManager(ids: string[], manager: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    ids.forEach(id => {
      updateMockLink(id, { manager });
    });
    return;
  }

  // TODO: Uncomment when backend is ready
  // const response = await fetch(`${API_BASE_URL}/api/links/bulk-assign-manager/`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ ids, manager }),
  // });
  // if (!response.ok) throw new Error('Failed to bulk assign manager');
}
