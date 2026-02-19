// Platform Grid Component for Dashboard Navigation

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlatformIcon } from '@/components/shared/platform-icon';
import { Badge } from '@/components/ui/badge';
import { Layers } from 'lucide-react';
import { Platform, PlatformStats } from '@/types';
import { PLATFORMS } from '@/lib/constants';

interface PlatformGridProps {
  platformStats: PlatformStats[];
}

function StatBadges({ active, in_work, removed, cancelled }: { active: number; in_work: number; removed: number; cancelled: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {active > 0 && (
        <Badge variant="outline" className="bg-red-900/50 text-red-300 border-red-500 text-xs">
          {active} active
        </Badge>
      )}
      {in_work > 0 && (
        <Badge variant="outline" className="bg-yellow-900/50 text-yellow-300 border-yellow-500 text-xs">
          {in_work} in work
        </Badge>
      )}
      {removed > 0 && (
        <Badge variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-500 text-xs">
          {removed} removed
        </Badge>
      )}
      {cancelled > 0 && (
        <Badge variant="outline" className="bg-gray-800/60 text-gray-400 border-gray-600 text-xs">
          {cancelled} cancelled
        </Badge>
      )}
    </div>
  );
}

export function PlatformGrid({ platformStats }: PlatformGridProps) {
  const getPlatformLabel = (platform: Platform) => {
    return PLATFORMS.find(p => p.value === platform)?.label || platform;
  };

  const totals = platformStats.reduce(
    (acc, s) => ({
      total: acc.total + s.total,
      active: acc.active + s.active,
      in_work: acc.in_work + s.in_work,
      removed: acc.removed + s.removed,
      cancelled: acc.cancelled + s.cancelled,
    }),
    { total: 0, active: 0, in_work: 0, removed: 0, cancelled: 0 }
  );

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {/* All Links card */}
      <Link href="/platform/all" className="group">
        <Card className="transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">All Links</CardTitle>
            <Layers className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">{totals.total}</div>
              <StatBadges
                active={totals.active}
                in_work={totals.in_work}
                removed={totals.removed}
                cancelled={totals.cancelled}
              />
            </div>
          </CardContent>
        </Card>
      </Link>

      {platformStats.map((stats) => (
        <Link 
          key={stats.platform} 
          href={`/platform/${stats.platform}`}
          className="group"
        >
          <Card className="transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {getPlatformLabel(stats.platform)}
              </CardTitle>
              <PlatformIcon 
                platform={stats.platform} 
                className="group-hover:text-primary transition-colors" 
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold">{stats.total}</div>
                <StatBadges
                  active={stats.active}
                  in_work={stats.in_work}
                  removed={stats.removed}
                  cancelled={stats.cancelled}
                />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
