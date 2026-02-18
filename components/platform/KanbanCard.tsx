'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NegativeLink, Manager } from '@/types';
import { getManagerDisplayName } from '@/lib/utils';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { PlatformIcon } from '@/components/shared/platform-icon';
import { formatDate } from '@/lib/utils/dates';
import { MoreHorizontal, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  link: NegativeLink;
  managers?: Manager[];
  onEdit: (link: NegativeLink) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

function truncateUrl(url: string, maxLength: number = 36) {
  if (url.length <= maxLength) return url;
  return url.slice(0, maxLength).trim() + '…';
}

export function KanbanCard({ link, managers = [], onEdit, onDelete, disabled }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: link.id,
    data: { type: 'link', link },
    disabled,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-shadow cursor-grab active:cursor-grabbing border-border bg-card hover:border-primary/40',
        isDragging && 'opacity-90 shadow-lg ring-2 ring-primary z-50'
      )}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-foreground hover:text-primary flex items-center gap-1 truncate group"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="truncate">{truncateUrl(link.url)}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100" />
            </a>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <PlatformIcon platform={link.platform} size={14} />
              <PriorityBadge priority={link.priority} className="text-[10px] px-1.5 py-0" />
            </div>
            <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
              <span className="truncate">
                {link.manager ? getManagerDisplayName(link.manager, managers) : '—'}
              </span>
              <span>{formatDate(link.detected_at, 'MMM d')}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem asChild>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  View
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(link)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(link.id)}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
