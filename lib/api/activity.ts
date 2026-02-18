// Activity log API for Phil Backend
// GET /api/activity/ — list with pagination and filters
// GET /api/activity/link/:link_id/ — log for one link
// Uses same auth as links/stats: Authorization: Bearer <access_token>

import {
  ActivityRecord,
  ActivityListResponse,
  ActivityFilters,
  ActivityAction,
} from '@/types';
import { API_BASE_URL } from './config';
import { apiRequest } from './client';

function normalizeRecord(raw: Record<string, unknown>): ActivityRecord {
  return {
    id: String(raw.id ?? ''),
    user: raw.user != null ? Number(raw.user) : null,
    username: raw.username != null ? String(raw.username) : null,
    action: (raw.action as ActivityAction) ?? 'updated',
    entity_type: (raw.entity_type as ActivityRecord['entity_type']) ?? 'link',
    entity_id: String(raw.entity_id ?? ''),
    old_value:
      raw.old_value != null && typeof raw.old_value === 'object' && !Array.isArray(raw.old_value)
        ? (raw.old_value as Record<string, unknown>)
        : null,
    new_value:
      raw.new_value != null && typeof raw.new_value === 'object' && !Array.isArray(raw.new_value)
        ? (raw.new_value as Record<string, unknown>)
        : null,
    timestamp: String(raw.timestamp ?? ''),
    ip_address: raw.ip_address != null ? String(raw.ip_address) : null,
  };
}

function buildQuery(params: ActivityFilters): string {
  const search = new URLSearchParams();
  if (params.user != null) search.set('user', String(params.user));
  if (params.action) search.set('action', params.action);
  if (params.entity_type) search.set('entity_type', params.entity_type);
  if (params.date_from) search.set('date_from', params.date_from);
  if (params.date_to) search.set('date_to', params.date_to);
  if (params.page != null) search.set('page', String(params.page));
  const q = search.toString();
  return q ? `?${q}` : '';
}

/**
 * Fetch paginated activity list with optional filters.
 * GET /api/activity/?page=1&action=...&user=...&date_from=...&date_to=...&entity_type=...
 */
export async function getActivityList(
  filters: ActivityFilters = {}
): Promise<ActivityListResponse> {
  const query = buildQuery(filters);
  const data = await apiRequest<Record<string, unknown>>(
    `${API_BASE_URL}/api/activity/${query}`,
    { method: 'GET' }
  );

  const results = Array.isArray(data.results) ? data.results : [];
  return {
    count: Number(data.count ?? 0),
    next: data.next != null ? String(data.next) : null,
    previous: data.previous != null ? String(data.previous) : null,
    results: results.map((item) => normalizeRecord(item as Record<string, unknown>)),
  };
}

/**
 * Fetch activity log for a single link. GET /api/activity/link/:link_id/?page=1
 */
export async function getActivityByLinkId(
  linkId: string,
  page: number = 1
): Promise<ActivityListResponse> {
  const query = page > 1 ? `?page=${page}` : '';
  const data = await apiRequest<Record<string, unknown>>(
    `${API_BASE_URL}/api/activity/link/${linkId}/${query}`,
    { method: 'GET' }
  );

  const results = Array.isArray(data.results) ? data.results : [];
  return {
    count: Number(data.count ?? 0),
    next: data.next != null ? String(data.next) : null,
    previous: data.previous != null ? String(data.previous) : null,
    results: results.map((item) => normalizeRecord(item as Record<string, unknown>)),
  };
}
