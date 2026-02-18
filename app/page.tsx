// Dashboard Page - Main entry point

'use client';

import { useEffect, useState, useCallback } from 'react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { PlatformGrid } from '@/components/dashboard/platform-grid';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { getDashboardStats } from '@/lib/api/stats';
import { DashboardStats } from '@/types';
import type { StatsPeriod } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const PERIOD_STORAGE_KEY = 'phil_dashboard_period';
const DEFAULT_PERIOD: StatsPeriod = '30d';

const PERIOD_LABELS: Record<StatsPeriod, string> = {
  '1d': '1 day',
  '7d': '7 days',
  '30d': '30 days',
};

const PERIOD_HEADINGS: Record<StatsPeriod, string> = {
  '1d': 'for the last day',
  '7d': 'for the last 7 days',
  '30d': 'for the last 30 days',
};

const FETCH_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    ),
  ]);
}

function getStoredPeriod(): StatsPeriod {
  if (typeof window === 'undefined') return DEFAULT_PERIOD;
  const raw = window.localStorage.getItem(PERIOD_STORAGE_KEY);
  if (raw === '1d' || raw === '7d' || raw === '30d') return raw;
  return DEFAULT_PERIOD;
}

function setStoredPeriod(period: StatsPeriod): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PERIOD_STORAGE_KEY, period);
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<StatsPeriod>(() => getStoredPeriod());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (p: StatsPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const data = await withTimeout(getDashboardStats(p), FETCH_TIMEOUT_MS);
      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(message);
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(period);
  }, [period, fetchStats]);

  const handlePeriodChange = (value: string) => {
    const p = value as StatsPeriod;
    setPeriod(p);
    setStoredPeriod(p);
  };

  const periodHeading = `Statistics ${stats ? PERIOD_HEADINGS[stats.period] : PERIOD_HEADINGS[period]}`;
  const activityHeading = `Activity ${stats ? PERIOD_HEADINGS[stats.period] : PERIOD_HEADINGS[period]}`;

  if (loading && !stats) {
    return (
      <div className="container py-8 px-4">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container py-8 px-4">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">
            {error || 'Failed to load dashboard data'}
          </p>
          <button
            type="button"
            onClick={() => fetchStats(period)}
            className="text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container relative py-8 px-4 space-y-8">
      {/* Header + Period Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">{periodHeading}</p>
        </div>
        <Tabs value={period} onValueChange={handlePeriodChange}>
          <TabsList variant="line" className="h-auto p-0 bg-transparent gap-0 border-b border-border">
            {(['1d', '7d', '30d'] as const).map((p) => (
              <TabsTrigger
                key={p}
                value={p}
                className={cn(
                  'rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent',
                  '-mb-px px-4 py-2'
                )}
              >
                {PERIOD_LABELS[p]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Loading overlay when switching period */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[2px] rounded-lg min-h-[200px] animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Updating...</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="transition-opacity duration-200" style={{ opacity: loading ? 0.7 : 1 }}>
        <StatsCards stats={stats} />
      </div>

      {/* Platform Grid */}
      <div className="space-y-4 transition-opacity duration-200" style={{ opacity: loading ? 0.7 : 1 }}>
        <h2 className="text-2xl font-semibold tracking-tight">Platforms</h2>
        <PlatformGrid platformStats={stats.platforms} />
      </div>

      {/* Activity Chart */}
      <div className="space-y-4 transition-opacity duration-200" style={{ opacity: loading ? 0.7 : 1 }}>
        <h2 className="text-2xl font-semibold tracking-tight">{activityHeading}</h2>
        <ActivityChart data={stats.activity_chart} period={stats.period} />
      </div>
    </div>
  );
}
