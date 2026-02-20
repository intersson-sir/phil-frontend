// Statistics API for Phil Backend
// GET /api/stats/dashboard/?period=1d|7d|30d, GET /api/stats/platform/:platform/?period=1d|7d|30d
// All real API calls go through apiRequest() which sends Authorization: Bearer <access_token> from getAccessToken() (set after login).

import {
  DashboardStats,
  PlatformStats,
  PlatformStatsResponse,
  ActivityChartData,
  Platform,
  StatsPeriod,
  ByStatus,
  ByPriorityItem,
} from '@/types';
import { getMockLinks } from './mock-data';
import { API_BASE_URL, USE_MOCK } from './config';
import { apiRequest } from './client';
import { subDays, format } from 'date-fns';

const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizePeriod(period: string | undefined): StatsPeriod {
  if (period === '1d' || period === '7d' || period === '30d') return period;
  return '30d';
}

function parsePeriodDays(period: StatsPeriod): number {
  if (period === '1d') return 1;
  if (period === '7d') return 7;
  return 30;
}

function buildMockActivityChart(
  links: Awaited<ReturnType<typeof getMockLinks>>,
  period: StatsPeriod
): ActivityChartData[] {
  const now = new Date();
  const days = parsePeriodDays(period);
  const result: ActivityChartData[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(now, i);
    const dateStr = format(date, 'yyyy-MM-dd');

    const activeOnDate = links.filter(
      (l) =>
        format(new Date(l.detected_at), 'yyyy-MM-dd') === dateStr && l.status === 'active'
    ).length;
    const removedOnDate = links.filter(
      (l) => l.removed_at && format(new Date(l.removed_at), 'yyyy-MM-dd') === dateStr
    ).length;

    result.push({ date: dateStr, active: activeOnDate, removed: removedOnDate });
  }
  return result;
}

/** Links with detected_at in the last N days */
function filterLinksInPeriod(
  links: Awaited<ReturnType<typeof getMockLinks>>,
  period: StatsPeriod
) {
  const days = parsePeriodDays(period);
  const since = subDays(new Date(), days);
  return links.filter((l) => new Date(l.detected_at) >= since);
}

/**
 * Get dashboard statistics. period: 1d | 7d | 30d. Default 30d.
 */
export async function getDashboardStats(period: StatsPeriod = '30d'): Promise<DashboardStats> {
  const p = normalizePeriod(period);

  if (USE_MOCK) {
    await delay();
    const allLinks = getMockLinks();
    const links = filterLinksInPeriod(allLinks, p);

    const total = links.length;
    const active = links.filter((l) => l.status === 'active').length;
    const removed = links.filter((l) => l.status === 'removed').length;
    const in_work = links.filter((l) => l.status === 'in_work').length;
    const pending = links.filter((l) => l.status === 'pending').length;
    const cancelled = links.filter((l) => l.status === 'cancelled').length;
    const new_in_period = total;
    const removed_in_period = links.filter((l) => l.removed_at != null).length;

    const by_status: ByStatus = { active, removed, in_work, pending, cancelled };

    const platformList: Platform[] = ['facebook', 'twitter', 'youtube', 'reddit', 'other'];
    const platforms: PlatformStats[] = platformList.map((platform) => {
      const pl = links.filter((l) => l.platform === platform);
      return {
        platform,
        total: pl.length,
        active: pl.filter((l) => l.status === 'active').length,
        removed: pl.filter((l) => l.status === 'removed').length,
        in_work: pl.filter((l) => l.status === 'in_work').length,
        pending: pl.filter((l) => l.status === 'pending').length,
        cancelled: pl.filter((l) => l.status === 'cancelled').length,
      };
    });

    const by_priority: ByPriorityItem[] = [
      { priority: 'low', count: links.filter((l) => l.priority === 'low').length },
      { priority: 'medium', count: links.filter((l) => l.priority === 'medium').length },
      { priority: 'high', count: links.filter((l) => l.priority === 'high').length },
    ];

    const activity_chart = buildMockActivityChart(links, p);

    return {
      period: p,
      total,
      active,
      removed,
      in_work,
      pending,
      cancelled,
      new_in_period,
      removed_in_period,
      by_status,
      platforms,
      by_priority,
      activity_chart,
    };
  }

  const params = new URLSearchParams({ period: p });
  // apiRequest adds Authorization: Bearer <access_token> automatically
  const data = await apiRequest<Record<string, unknown>>(
    `${API_BASE_URL}/api/stats/dashboard/?${params}`,
    { method: 'GET' }
  );

  const rawByStatus = (data.by_status as Record<string, unknown>) ?? {};
  const by_status: ByStatus = {
    active: Number(rawByStatus.active ?? 0),
    removed: Number(rawByStatus.removed ?? 0),
    in_work: Number(rawByStatus.in_work ?? 0),
    pending: Number(rawByStatus.pending ?? 0),
    cancelled: Number(rawByStatus.cancelled ?? 0),
  };
  const rawPlatforms = Array.isArray(data.platforms) ? data.platforms : [];
  const platforms: PlatformStats[] = rawPlatforms.map((plat: Record<string, unknown>) => ({
    platform: (plat.platform as Platform) ?? 'other',
    total: Number(plat.total ?? 0),
    active: Number(plat.active ?? 0),
    removed: Number(plat.removed ?? 0),
    in_work: Number(plat.in_work ?? 0),
    pending: Number(plat.pending ?? 0),
    cancelled: Number(plat.cancelled ?? 0),
  }));

  return {
    period: (data.period as StatsPeriod) ?? p,
    total: Number(data.total ?? 0),
    active: Number(data.active ?? 0),
    removed: Number(data.removed ?? 0),
    in_work: Number(data.in_work ?? 0),
    pending: Number(data.pending ?? 0),
    cancelled: Number(data.cancelled ?? 0),
    new_in_period: Number(data.new_in_period ?? 0),
    removed_in_period: Number(data.removed_in_period ?? 0),
    by_status,
    platforms,
    by_priority: (data.by_priority as ByPriorityItem[]) ?? [],
    activity_chart: Array.isArray(data.activity_chart)
      ? (data.activity_chart as ActivityChartData[])
      : [],
  };
}

/**
 * Get statistics for a specific platform. period: 1d | 7d | 30d. Default 30d.
 */
export async function getPlatformStats(
  platform: Platform,
  period: StatsPeriod = '30d'
): Promise<PlatformStatsResponse> {
  const p = normalizePeriod(period);

  if (USE_MOCK) {
    await delay();
    const allLinks = getMockLinks();
    const links = filterLinksInPeriod(
      allLinks.filter((l) => l.platform === platform),
      p
    );

    return {
      period: p,
      platform,
      total: links.length,
      active: links.filter((l) => l.status === 'active').length,
      removed: links.filter((l) => l.status === 'removed').length,
      in_work: links.filter((l) => l.status === 'in_work').length,
      pending: links.filter((l) => l.status === 'pending').length,
      cancelled: links.filter((l) => l.status === 'cancelled').length,
      by_priority: [
        { priority: 'low', count: links.filter((l) => l.priority === 'low').length },
        { priority: 'medium', count: links.filter((l) => l.priority === 'medium').length },
        { priority: 'high', count: links.filter((l) => l.priority === 'high').length },
      ],
    };
  }

  const params = new URLSearchParams({ period: p });
  const data = await apiRequest<Record<string, unknown>>(
    `${API_BASE_URL}/api/stats/platform/${platform}/?${params}`,
    { method: 'GET' }
  );

  return {
    period: (data.period as StatsPeriod) ?? p,
    platform: (data.platform as Platform) ?? platform,
    total: Number(data.total ?? 0),
    active: Number(data.active ?? 0),
    removed: Number(data.removed ?? 0),
    in_work: Number(data.in_work ?? 0),
    pending: Number(data.pending ?? 0),
    cancelled: Number(data.cancelled ?? 0),
    by_priority: (data.by_priority as ByPriorityItem[]) ?? [],
  };
}
