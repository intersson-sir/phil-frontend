// Links API for Phil Backend
// GET/POST/PATCH /api/links/ — manager is object { id, name, email, is_active } or null; send manager_id.
// Filter: manager_id=<uuid>. Bulk assign: POST body { ids, manager_id }.

import { NegativeLink, FilterParams, Manager } from '@/types';
import { CreateLinkDto, UpdateLinkDto } from '@/types/api';
import {
  getMockLinks,
  addMockLink,
  updateMockLink,
  deleteMockLink,
} from './mock-data';
import { applyFilters } from '@/lib/utils/filters';
import { API_BASE_URL, USE_MOCK } from './config';
import { apiRequest } from './client';

const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeManager(m: unknown): Manager | null {
  if (m == null) return null;
  if (typeof m !== 'object' || Array.isArray(m)) return null;
  const o = m as Record<string, unknown>;
  if (typeof o.id !== 'string') return null;
  return {
    id: o.id,
    name: String(o.name ?? ''),
    email: String(o.email ?? ''),
    is_active: Boolean(o.is_active),
    created_at: o.created_at != null ? String(o.created_at) : undefined,
    updated_at: o.updated_at != null ? String(o.updated_at) : undefined,
  };
}

function normalizeLink(raw: Record<string, unknown>): NegativeLink {
  const manager = normalizeManager(raw.manager);
  return {
    id: String(raw.id),
    url: String(raw.url ?? ''),
    platform: (raw.platform as NegativeLink['platform']) ?? 'other',
    type: (raw.type as NegativeLink['type']) ?? 'post',
    status: (raw.status as NegativeLink['status']) ?? 'pending',
    detected_at: String(raw.detected_at ?? ''),
    removed_at: raw.removed_at != null ? String(raw.removed_at) : undefined,
    priority: (raw.priority as NegativeLink['priority']) ?? 'medium',
    manager: manager ?? undefined,
    notes: raw.notes != null ? String(raw.notes) : undefined,
  };
}

/** Build query string for GET /api/links/. Uses manager_id for manager filter. */
function buildLinksQuery(filters?: FilterParams): string {
  if (!filters || Object.keys(filters).length === 0) return '';
  const params = new URLSearchParams();
  if (filters.platform) params.set('platform', filters.platform);
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.manager) params.set('manager_id', filters.manager);
  if (filters.dateFrom) params.set('date_from', filters.dateFrom);
  if (filters.dateTo) params.set('date_to', filters.dateTo);
  if (filters.search) params.set('search', filters.search);
  const q = params.toString();
  return q ? `?${q}` : '';
}

export async function getLinks(filters?: FilterParams): Promise<NegativeLink[]> {
  if (USE_MOCK) {
    await delay();
    const links = getMockLinks();
    return filters ? applyFilters(links, filters) : links;
  }

  const query = buildLinksQuery(filters);
  const data = await apiRequest<unknown>(`${API_BASE_URL}/api/links/${query}`, { method: 'GET' });
  const arr = Array.isArray(data) ? data : (data as { results?: unknown[] })?.results;
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => normalizeLink(item as Record<string, unknown>));
}

export async function getLinkById(id: string): Promise<NegativeLink | null> {
  if (USE_MOCK) {
    await delay();
    const links = getMockLinks();
    const link = links.find((l) => l.id === id) || null;
    return link;
  }

  try {
    const data = await apiRequest<Record<string, unknown>>(
      `${API_BASE_URL}/api/links/${id}/`,
      { method: 'GET' }
    );
    return normalizeLink(data);
  } catch {
    return null;
  }
}

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
      manager: data.manager_id ? { id: data.manager_id, name: '', email: '', is_active: true } : undefined,
      notes: data.notes,
    };
    addMockLink(newLink);
    return newLink;
  }

  const body: Record<string, unknown> = {
    url: data.url,
    platform: data.platform,
    type: data.type,
    status: data.status ?? 'pending',
    priority: data.priority ?? 'medium',
  };
  
  // Only include notes if not empty
  if (data.notes && data.notes.trim()) {
    body.notes = data.notes.trim();
  }
  
  // Only include manager_id if valid UUID (not undefined, not empty string)
  if (data.manager_id && data.manager_id.trim()) {
    body.manager_id = data.manager_id.trim();
  }

  const raw = await apiRequest<Record<string, unknown>>(`${API_BASE_URL}/api/links/`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return normalizeLink(raw);
}

export async function updateLink(id: string, data: UpdateLinkDto): Promise<NegativeLink> {
  if (USE_MOCK) {
    await delay();
    const updates: Partial<NegativeLink> = { ...data };
    if (data.manager_id !== undefined) {
      updates.manager = data.manager_id
        ? { id: data.manager_id, name: '', email: '', is_active: true }
        : null;
    }
    updateMockLink(id, updates);
    const updated = await getLinkById(id);
    if (!updated) throw new Error('Link not found');
    return updated;
  }

  const body: Record<string, unknown> = { ...data };
  if (data.manager_id !== undefined) body.manager_id = data.manager_id;

  const raw = await apiRequest<Record<string, unknown>>(
    `${API_BASE_URL}/api/links/${id}/`,
    { method: 'PATCH', body: JSON.stringify(body) }
  );
  return normalizeLink(raw);
}

export async function deleteLink(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    deleteMockLink(id);
    return;
  }
  await apiRequest(`${API_BASE_URL}/api/links/${id}/`, { method: 'DELETE' });
}

export async function bulkUpdateStatus(ids: string[], status: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    ids.forEach((id) => {
      updateMockLink(id, {
        status: status as NegativeLink['status'],
        removed_at: status === 'removed' ? new Date().toISOString() : undefined,
      });
    });
    return;
  }
  await apiRequest(`${API_BASE_URL}/api/links/bulk-update-status/`, {
    method: 'POST',
    body: JSON.stringify({ ids, status }),
  });
}

/** Bulk assign manager. Body: { ids, manager_id }. */
export async function bulkAssignManager(ids: string[], manager_id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    ids.forEach((id) => {
      updateMockLink(id, {
        manager: { id: manager_id, name: '', email: '', is_active: true },
      });
    });
    return;
  }
  await apiRequest(`${API_BASE_URL}/api/links/bulk-assign-manager/`, {
    method: 'POST',
    body: JSON.stringify({ ids, manager_id }),
  });
}
