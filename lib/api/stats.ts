// Statistics API for Phil CRM
// Calculates and provides dashboard statistics

import { DashboardStats, PlatformStats, ActivityChartData, Platform, Status } from '@/types';
import { getMockLinks } from './mock-data';
import { isWithinLast7Days } from '@/lib/utils/dates';
import { API_BASE_URL, USE_MOCK } from './config';
import { subDays, format } from 'date-fns';

const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCK) {
    await delay();
    const links = getMockLinks();
    
    // Calculate overall stats
    const total = links.length;
    const active = links.filter(l => l.status === 'active').length;
    const removed = links.filter(l => l.status === 'removed').length;
    const in_work = links.filter(l => l.status === 'in_work').length;
    const pending = links.filter(l => l.status === 'pending').length;
    
    // New links in last 7 days
    const new_last_7_days = links.filter(l => isWithinLast7Days(l.detected_at)).length;
    
    // Removed links in last 7 days
    const removed_last_7_days = links.filter(
      l => l.removed_at && isWithinLast7Days(l.removed_at)
    ).length;
    
    // Platform stats
    const platformList: Platform[] = ['facebook', 'twitter', 'youtube', 'reddit', 'other'];
    const platforms: PlatformStats[] = platformList.map(
      (platform) => {
        const platformLinks = links.filter(l => l.platform === platform);
        return {
          platform,
          total: platformLinks.length,
          active: platformLinks.filter(l => l.status === 'active').length,
          removed: platformLinks.filter(l => l.status === 'removed').length,
          in_work: platformLinks.filter(l => l.status === 'in_work').length,
          new_last_7_days: platformLinks.filter(l => isWithinLast7Days(l.detected_at)).length,
        };
      }
    );
    
    // Activity chart data (last 30 days)
    const activity_chart: ActivityChartData[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Count links detected on this date
      const activeOnDate = links.filter(
        l => format(new Date(l.detected_at), 'yyyy-MM-dd') === dateStr && l.status === 'active'
      ).length;
      
      const removedOnDate = links.filter(
        l => l.removed_at && format(new Date(l.removed_at), 'yyyy-MM-dd') === dateStr
      ).length;
      
      activity_chart.push({
        date: dateStr,
        active: activeOnDate,
        removed: removedOnDate,
      });
    }
    
    return {
      total,
      active,
      removed,
      in_work,
      pending,
      new_last_7_days,
      removed_last_7_days,
      platforms,
      activity_chart,
    };
  }

  // Real API call
  const response = await fetch(`${API_BASE_URL}/api/stats/dashboard/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to fetch dashboard stats');
  return response.json();
}

/**
 * Get statistics for a specific platform
 */
export async function getPlatformStats(platform: Platform): Promise<PlatformStats> {
  if (USE_MOCK) {
    await delay();
    const stats = await getDashboardStats();
    const platformStats = stats.platforms.find(p => p.platform === platform);
    if (!platformStats) {
      throw new Error(`Platform ${platform} not found`);
    }
    return platformStats;
  }

  // Real API call
  const response = await fetch(`${API_BASE_URL}/api/stats/platform/${platform}/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to fetch platform stats');
  return response.json();
}
