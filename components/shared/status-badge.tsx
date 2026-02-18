// Status Badge Component

import { Badge } from '@/components/ui/badge';
import { Status } from '@/types';
import { cn } from '@/lib/utils';
import { Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string; icon?: React.ReactNode }> = {
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
  cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-800/60 text-gray-400 border-gray-600 hover:bg-gray-800/80',
    icon: <Ban className="size-3.5 shrink-0" />,
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.icon && <span className="mr-1">{config.icon}</span>}
      {config.label}
    </Badge>
  );
}
