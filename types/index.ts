// Core domain types for Phil CRM

export type Platform = 'facebook' | 'twitter' | 'youtube' | 'reddit' | 'other' | 'account';
export type LinkType = 'post' | 'comment' | 'video' | 'article' | 'account';
export type Status = 'active' | 'removed' | 'in_work' | 'pending' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high';

/** Manager as returned in link responses (or from GET /api/managers/) */
export interface Manager {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NegativeLink {
  id: string;
  url: string;
  platform: Platform;
  type: LinkType;
  status: Status;
  detected_at: string; // ISO 8601 date string
  removed_at?: string; // ISO 8601 date string
  priority: Priority;
  /** Manager object or null from API; legacy mock may use string id */
  manager?: Manager | string | null;
  notes?: string;
}

/** By-status counts (dashboard and platform) */
export interface ByStatus {
  active: number;
  removed: number;
  in_work: number;
  pending: number;
  cancelled: number;
}

export interface ByPriorityItem {
  priority: Priority;
  count: number;
}

/** Platform stats in dashboard response */
export interface PlatformStats {
  platform: Platform;
  total: number;
  active: number;
  removed: number;
  in_work: number;
  pending: number;
  cancelled: number;
}

/** Dashboard stats response: GET /api/stats/dashboard/?period=1d|7d|30d */
export interface DashboardStats {
  period: StatsPeriod;
  total: number;
  active: number;
  removed: number;
  in_work: number;
  pending: number;
  cancelled: number;
  new_in_period: number;
  removed_in_period: number;
  by_status: ByStatus;
  platforms: PlatformStats[];
  by_priority: ByPriorityItem[];
  activity_chart: ActivityChartData[];
}

export interface ActivityChartData {
  /** ISO date YYYY-MM-DD (one element per day in period) */
  date: string;
  active: number;
  removed: number;
}

/** Query param: 1d | 7d | 30d. Default 30d. */
export type StatsPeriod = '1d' | '7d' | '30d';

/** Platform stats response: GET /api/stats/platform/:platform/?period=1d|7d|30d */
export interface PlatformStatsResponse {
  period: StatsPeriod;
  platform: Platform;
  total: number;
  active: number;
  removed: number;
  in_work: number;
  pending: number;
  cancelled: number;
  by_priority: ByPriorityItem[];
}

export interface FilterParams {
  platform?: Platform;
  status?: Status;
  priority?: Priority;
  /** Manager UUID for filter (sent as manager_id to API) */
  manager?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

/** Activity log: action type */
export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'status_changed'
  | 'assigned';

/** Activity log: entity type */
export type ActivityEntityType = 'link' | 'manager';

/** Single activity log record from GET /api/activity/ or GET /api/activity/link/:id/ */
export interface ActivityRecord {
  id: string;
  user: number | null;
  username: string | null;
  action: ActivityAction;
  entity_type: ActivityEntityType;
  entity_id: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  timestamp: string;
  ip_address: string | null;
}

/** Paginated activity list response (DRF-style) */
export interface ActivityListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ActivityRecord[];
}

/** Filters for GET /api/activity/ */
export interface ActivityFilters {
  user?: number;
  action?: ActivityAction;
  entity_type?: ActivityEntityType;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  page?: number;
}
