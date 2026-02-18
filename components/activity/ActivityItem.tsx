'use client';

import { ActivityRecord } from '@/types';
import { formatRelativeTime } from '@/lib/utils/dates';
import { cn } from '@/lib/utils';
import {
  UserCircle,
  Cpu,
  PlusCircle,
  Pencil,
  Trash2,
  RefreshCw,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';

const ACTION_CONFIG: Record<
  ActivityRecord['action'],
  { label: string; Icon: LucideIcon; color: string }
> = {
  created: { label: 'Created', Icon: PlusCircle, color: 'text-emerald-500' },
  updated: { label: 'Updated', Icon: Pencil, color: 'text-blue-500' },
  deleted: { label: 'Deleted', Icon: Trash2, color: 'text-red-500' },
  status_changed: { label: 'Status changed', Icon: RefreshCw, color: 'text-amber-500' },
  assigned: { label: 'Assigned', Icon: UserPlus, color: 'text-violet-500' },
};

function getActionLabel(record: ActivityRecord): string {
  const { action, entity_type, old_value, new_value } = record;
  const entity = entity_type === 'link' ? 'link' : 'manager';

  if (action === 'created') {
    return entity_type === 'link' ? 'Created link' : 'Created manager';
  }
  if (action === 'deleted') {
    return entity_type === 'link' ? 'Deleted link' : 'Deleted manager';
  }
  if (action === 'status_changed' && new_value?.status) {
    return `Changed status to ${String(new_value.status)}`;
  }
  if (action === 'assigned') {
    return 'Assigned manager';
  }
  if (action === 'updated') {
    const parts: string[] = [];
    if (old_value?.status != null && new_value?.status != null) {
      parts.push(`status: ${old_value.status} → ${new_value.status}`);
    }
    if (old_value?.manager_id !== new_value?.manager_id) {
      parts.push('manager changed');
    }
    if (parts.length) return parts.join('; ');
    return `Updated ${entity}`;
  }
  return ACTION_CONFIG[action]?.label ?? action;
}

function getChangeSummary(record: ActivityRecord): string | null {
  const { old_value, new_value, action } = record;
  if (!old_value && !new_value) return null;
  if (action === 'status_changed' && old_value?.status != null && new_value?.status != null) {
    return `${old_value.status} → ${new_value.status}`;
  }
  if (action === 'updated') {
    const parts: string[] = [];
    if (old_value?.status != null && new_value?.status != null && old_value.status !== new_value.status) {
      parts.push(`status: ${old_value.status} → ${new_value.status}`);
    }
    if (parts.length) return parts.join('; ');
  }
  return null;
}

interface ActivityItemProps {
  record: ActivityRecord;
  isLast?: boolean;
}

export function ActivityItem({ record, isLast = false }: ActivityItemProps) {
  const config = ACTION_CONFIG[record.action];
  const Icon = config?.Icon ?? Pencil;
  const displayName = record.username ?? 'System';
  const changeSummary = getChangeSummary(record);
  const actionText = getActionLabel(record);

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div
          className="absolute left-5 top-10 bottom-0 w-px bg-border"
          aria-hidden
        />
      )}

      {/* Avatar / icon */}
      <div
        className={cn(
          'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/80',
          config?.color ?? 'text-muted-foreground'
        )}
      >
        {record.user == null ? (
          <Cpu className="h-5 w-5" />
        ) : (
          <UserCircle className="h-5 w-5" />
        )}
      </div>

      <div className="flex-1 min-w-0 pb-6">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-medium text-foreground">{displayName}</span>
          <span className="text-muted-foreground">{actionText}</span>
        </div>
        {changeSummary && (
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-mono text-foreground/80">{changeSummary}</span>
          </p>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatRelativeTime(record.timestamp)}
        </p>
      </div>
    </div>
  );
}
