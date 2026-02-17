// Platform Grid Component for Dashboard Navigation

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlatformIcon } from '@/components/shared/platform-icon';
import { Badge } from '@/components/ui/badge';
import { Platform, PlatformStats } from '@/types';
import { PLATFORMS } from '@/lib/constants';

interface PlatformGridProps {
  platformStats: PlatformStats[];
}

export function PlatformGrid({ platformStats }: PlatformGridProps) {
  const getPlatformLabel = (platform: Platform) => {
    return PLATFORMS.find(p => p.value === platform)?.label || platform;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                
                <div className="flex flex-wrap gap-2">
                  {stats.active > 0 && (
                    <Badge variant="outline" className="bg-red-900/50 text-red-300 border-red-500 text-xs">
                      {stats.active} active
                    </Badge>
                  )}
                  {stats.in_work > 0 && (
                    <Badge variant="outline" className="bg-yellow-900/50 text-yellow-300 border-yellow-500 text-xs">
                      {stats.in_work} in work
                    </Badge>
                  )}
                  {stats.removed > 0 && (
                    <Badge variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-500 text-xs">
                      {stats.removed} removed
                    </Badge>
                  )}
                </div>
                
                {stats.new_last_7_days > 0 && (
                  <div className="text-xs text-muted-foreground">
                    +{stats.new_last_7_days} new this week
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
