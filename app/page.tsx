// Dashboard Page - Main entry point

'use client';

import { useEffect, useState } from 'react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { PlatformGrid } from '@/components/dashboard/platform-grid';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { getDashboardStats } from '@/lib/api/stats';
import { DashboardStats } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
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
        <div className="text-center text-muted-foreground">
          Failed to load dashboard data
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of negative link tracking and management
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Platform Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Platforms</h2>
        <PlatformGrid platformStats={stats.platforms} />
      </div>

      {/* Activity Chart */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Activity</h2>
        <ActivityChart data={stats.activity_chart} />
      </div>
    </div>
  );
}
