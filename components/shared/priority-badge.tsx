// Priority Badge Component

import { Badge } from '@/components/ui/badge';
import { Priority } from '@/types';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  high: {
    label: 'High',
    className: 'bg-red-900/50 text-red-300 border-red-500 hover:bg-red-900/70',
  },
  medium: {
    label: 'Medium',
    className: 'bg-orange-900/50 text-orange-300 border-orange-500 hover:bg-orange-900/70',
  },
  low: {
    label: 'Low',
    className: 'bg-green-900/50 text-green-300 border-green-500 hover:bg-green-900/70',
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
