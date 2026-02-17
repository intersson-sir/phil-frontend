// Status Badge Component

import { Badge } from '@/components/ui/badge';
import { Status } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-red-900/50 text-red-300 border-red-500 hover:bg-red-900/70',
  },
  removed: {
    label: 'Removed',
    className: 'bg-gray-700/50 text-gray-300 border-gray-500 hover:bg-gray-700/70',
  },
  in_work: {
    label: 'In Work',
    className: 'bg-yellow-900/50 text-yellow-300 border-yellow-500 hover:bg-yellow-900/70',
  },
  pending: {
    label: 'Pending',
    className: 'bg-blue-900/50 text-blue-300 border-blue-500 hover:bg-blue-900/70',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
