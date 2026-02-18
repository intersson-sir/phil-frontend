'use client';

import { useDroppable } from '@dnd-kit/core';
import { NegativeLink, Manager, Status } from '@/types';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

const COLUMN_STATUSES: Status[] = [
  'pending',
  'in_work',
  'active',
  'removed',
  'cancelled',
];

const STATUS_LABELS: Record<Status, string> = {
  pending: 'Pending',
  in_work: 'In Work',
  active: 'Active',
  removed: 'Removed',
  cancelled: 'Cancelled',
};

interface KanbanColumnProps {
  status: Status;
  links: NegativeLink[];
  managers?: Manager[];
  onEdit: (link: NegativeLink) => void;
  onDelete: (id: string) => void;
}

export function KanbanColumn({ status, links, managers, onEdit, onDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col w-[280px] flex-shrink-0 rounded-lg border border-border bg-muted/30 transition-colors',
        isOver && 'ring-2 ring-primary/50 bg-muted/50'
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-sm font-medium text-foreground">
          {STATUS_LABELS[status]}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {links.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px]">
        {links.map((link) => (
          <KanbanCard
            key={link.id}
            link={link}
            managers={managers}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export { COLUMN_STATUSES, STATUS_LABELS };
