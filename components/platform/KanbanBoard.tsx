'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { NegativeLink, Manager, Status } from '@/types';
import { KanbanColumn, COLUMN_STATUSES } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  links: NegativeLink[];
  managers?: Manager[];
  onEdit: (link: NegativeLink) => void;
  onDelete: (id: string) => void;
  onStatusChange: (linkId: string, newStatus: Status) => Promise<void>;
}

export function KanbanBoard({
  links,
  managers = [],
  onEdit,
  onDelete,
  onStatusChange,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const linksByStatus = useMemo(() => {
    const map: Record<Status, NegativeLink[]> = {
      pending: [],
      in_work: [],
      active: [],
      removed: [],
      cancelled: [],
    };
    for (const link of links) {
      if (map[link.status]) map[link.status].push(link);
    }
    return map;
  }, [links]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const linkId = String(active.id);
    const newStatus = over.id as Status;
    if (!COLUMN_STATUSES.includes(newStatus)) return;

    const link = links.find((l) => l.id === linkId);
    if (!link || link.status === newStatus) return;

    try {
      await onStatusChange(linkId, newStatus);
    } catch {
      // Caller should revert via refresh; card returns to previous column
    }
  };

  const activeLink = activeId ? links.find((l) => l.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={cn(
          'flex gap-4 overflow-x-auto pb-2',
          'min-h-[400px]'
        )}
      >
        {COLUMN_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            links={linksByStatus[status]}
            managers={managers}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLink ? (
          <div className="w-[280px] rotate-2 scale-105">
            <KanbanCard
              link={activeLink}
              managers={managers}
              onEdit={onEdit}
              onDelete={onDelete}
              disabled
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
