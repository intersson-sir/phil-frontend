// Core domain types for Phil CRM

export type Platform = 'facebook' | 'twitter' | 'youtube' | 'reddit' | 'other';
export type LinkType = 'post' | 'comment' | 'video' | 'article';
export type Status = 'active' | 'removed' | 'in_work' | 'pending';
export type Priority = 'low' | 'medium' | 'high';

export interface NegativeLink {
  id: string;
  url: string;
  platform: Platform;
  type: LinkType;
  status: Status;
  detected_at: string; // ISO 8601 date string
  removed_at?: string; // ISO 8601 date string
  priority: Priority;
  manager?: string;
  notes?: string;
}

export interface PlatformStats {
  platform: Platform;
  total: number;
  active: number;
  removed: number;
  in_work: number;
  new_last_7_days: number;
}

export interface DashboardStats {
  total: number;
  active: number;
  removed: number;
  in_work: number;
  pending: number;
  new_last_7_days: number;
  removed_last_7_days: number;
  platforms: PlatformStats[];
  activity_chart: ActivityChartData[];
}

export interface ActivityChartData {
  date: string; // Format: YYYY-MM-DD
  active: number;
  removed: number;
}

export interface FilterParams {
  platform?: Platform;
  status?: Status;
  priority?: Priority;
  manager?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
