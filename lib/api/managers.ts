// Managers API for Phil Backend
// GET /api/managers/, POST /api/managers/, GET /api/managers/:id/, PATCH /api/managers/:id/, DELETE /api/managers/:id/
// All requests use Authorization: Bearer <access_token>

import { Manager } from '@/types';
import { API_BASE_URL, USE_MOCK } from './config';
import { apiRequest } from './client';

const delay = (ms: number = 200) => new Promise((r) => setTimeout(r, ms));

const MOCK_MANAGERS: Manager[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', is_active: true },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', is_active: true },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', is_active: true },
  { id: '4', name: 'Sarah Williams', email: 'sarah@example.com', is_active: true },
];

let mockStore = [...MOCK_MANAGERS];

export interface CreateManagerDto {
  name: string;
  email: string;
  is_active?: boolean;
}

export interface UpdateManagerDto {
  name?: string;
  email?: string;
  is_active?: boolean;
}

function normalizeManager(m: Record<string, unknown>): Manager {
  return {
    id: String(m.id),
    name: String(m.name ?? ''),
    email: String(m.email ?? ''),
    is_active: Boolean(m.is_active),
    created_at: m.created_at != null ? String(m.created_at) : undefined,
    updated_at: m.updated_at != null ? String(m.updated_at) : undefined,
  };
}

export async function getManagers(): Promise<Manager[]> {
  if (USE_MOCK) {
    await delay();
    return [...mockStore];
  }
  const data = await apiRequest<unknown>(`${API_BASE_URL}/api/managers/`, { method: 'GET' });
  const arr = Array.isArray(data) ? data : (data as { results?: unknown[] })?.results;
  if (!Array.isArray(arr)) return [];
  return arr.map((m) => normalizeManager(m as Record<string, unknown>));
}

export async function getManager(id: string): Promise<Manager | null> {
  if (USE_MOCK) {
    await delay();
    const m = mockStore.find((x) => x.id === id);
    return m ?? null;
  }
  try {
    const data = await apiRequest<Record<string, unknown>>(
      `${API_BASE_URL}/api/managers/${id}/`,
      { method: 'GET' }
    );
    return normalizeManager(data);
  } catch {
    return null;
  }
}

export async function createManager(dto: CreateManagerDto): Promise<Manager> {
  if (USE_MOCK) {
    await delay();
    const newManager: Manager = {
      id: `m-${Date.now()}`,
      name: dto.name,
      email: dto.email,
      is_active: dto.is_active ?? true,
    };
    mockStore.push(newManager);
    return newManager;
  }
  const data = await apiRequest<Record<string, unknown>>(`${API_BASE_URL}/api/managers/`, {
    method: 'POST',
    body: JSON.stringify({
      name: dto.name,
      email: dto.email,
      ...(dto.is_active !== undefined && { is_active: dto.is_active }),
    }),
  });
  return normalizeManager(data);
}

export async function updateManager(id: string, dto: UpdateManagerDto): Promise<Manager> {
  if (USE_MOCK) {
    await delay();
    const idx = mockStore.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error('Manager not found');
    mockStore[idx] = { ...mockStore[idx], ...dto };
    return mockStore[idx];
  }
  const data = await apiRequest<Record<string, unknown>>(
    `${API_BASE_URL}/api/managers/${id}/`,
    {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }
  );
  return normalizeManager(data);
}

/** Soft delete: backend sets is_active to false. GET /api/managers/ still returns all. */
export async function deleteManager(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockStore.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error('Manager not found');
    mockStore[idx] = { ...mockStore[idx], is_active: false };
    return;
  }
  await apiRequest(`${API_BASE_URL}/api/managers/${id}/`, { method: 'DELETE' });
}

/** @deprecated Use deleteManager for soft delete. Kept for compatibility. */
export async function deactivateManager(id: string): Promise<void> {
  return deleteManager(id);
}
