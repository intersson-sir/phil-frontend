// Stats Cards Component for Dashboard

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  icon?: React.ReactNode;
}

const variantStyles = {
  default: 'border-border',
  danger: 'border-red-500/50 bg-red-900/10',
  success: 'border-green-500/50 bg-green-900/10',
  warning: 'border-yellow-500/50 bg-yellow-900/10',
};

export function StatCard({ title, value, change, variant = 'default', icon }: StatCardProps) {
  return (
    <Card className={cn('transition-all hover:border-primary/50', variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl sm:text-3xl font-bold">{value.toLocaleString()}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            {change >= 0 ? (
              <>
                <ArrowUpIcon className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+{change}</span>
              </>
            ) : (
              <>
                <ArrowDownIcon className="h-3 w-3 text-red-500" />
                <span className="text-red-500">{change}</span>
              </>
            )}
            <span className="text-muted-foreground">vs last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  stats: {
    total: number;
    active: number;
    removed: number;
    in_work: number;
    cancelled: number;
    new_in_period: number;
    removed_in_period: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-7">
      <StatCard 
        title="Total Links" 
        value={stats.total} 
        variant="default"
      />
      <StatCard 
        title="Active" 
        value={stats.active} 
        variant="danger"
      />
      <StatCard 
        title="Removed" 
        value={stats.removed} 
        variant="success"
      />
      <StatCard 
        title="In Work" 
        value={stats.in_work} 
        variant="warning"
      />
      <StatCard 
        title="Cancelled" 
        value={stats.cancelled} 
        variant="default"
      />
      <StatCard 
        title="New" 
        value={stats.new_in_period}
        variant="default"
      />
      <StatCard 
        title="Removed in period" 
        value={stats.removed_in_period}
        variant="success"
      />
    </div>
  );
}
