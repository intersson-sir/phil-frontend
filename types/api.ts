// API-specific types for Phil CRM

import { NegativeLink, Status, Platform, LinkType, Priority } from './index';

// DTO for creating a new link (API expects manager_id)
export interface CreateLinkDto {
  url: string;
  platform: Platform;
  type: LinkType;
  status?: Status;
  priority?: Priority;
  manager_id?: string | null;
  notes?: string;
}

// DTO for updating a link (API expects manager_id)
export interface UpdateLinkDto {
  url?: string;
  platform?: Platform;
  type?: LinkType;
  status?: Status;
  priority?: Priority;
  manager_id?: string | null;
  notes?: string;
  removed_at?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// Bulk operation requests
export interface BulkUpdateStatusRequest {
  ids: string[];
  status: Status;
}

export interface BulkAssignManagerRequest {
  ids: string[];
  manager_id: string;
}
