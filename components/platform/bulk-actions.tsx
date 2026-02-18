// Bulk Actions Bar Component

'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { Status } from '@/types';
import { STATUSES } from '@/lib/constants';
import { useManagers } from '@/hooks/use-managers';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onUpdateStatus: (status: Status) => void;
  onAssignManager: (manager: string) => void;
}

export function BulkActionsBar({ 
  selectedCount, 
  onClearSelection, 
  onUpdateStatus,
  onAssignManager 
}: BulkActionsBarProps) {
  const { managers } = useManagers();
  const activeManagers = managers.filter((m) => m.is_active);
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-16 z-40 bg-primary/10 border border-primary/50 rounded-lg p-4 mb-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">{selectedCount} selected</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearSelection}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex flex-wrap gap-2">
          {/* Change Status */}
          <Select onValueChange={(value) => onUpdateStatus(value as Status)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Change Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  Set as {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Assign Manager */}
          <Select onValueChange={onAssignManager}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Assign Manager" />
            </SelectTrigger>
            <SelectContent>
              {activeManagers.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
