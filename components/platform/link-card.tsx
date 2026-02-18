// Link Card Component (Mobile)

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NegativeLink, Manager } from '@/types';
import { StatusBadge } from '@/components/shared/status-badge';
import { getManagerDisplayName } from '@/lib/utils';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { PlatformIcon } from '@/components/shared/platform-icon';
import { formatDate } from '@/lib/utils/dates';
import { LINK_TYPES } from '@/lib/constants';

interface LinkCardProps {
  link: NegativeLink;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: (link: NegativeLink) => void;
  onDelete: (id: string) => void;
  managers?: Manager[];
}

export function LinkCard({ link, selected, onSelect, onEdit, onDelete, managers = [] }: LinkCardProps) {
  const getLinkTypeLabel = (type: string) => {
    return LINK_TYPES.find(t => t.value === type)?.label || type;
  };

  const truncateUrl = (url: string, maxLength: number = 40) => {
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
  };

  return (
    <Card className="transition-all hover:border-primary/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={selected}
            onCheckedChange={onSelect}
            aria-label={`Select ${link.id}`}
            className="mt-1"
          />
          
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <PlatformIcon platform={link.platform} size={18} />
                <span className="text-xs text-muted-foreground">
                  {getLinkTypeLabel(link.type)}
                </span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(link)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(link.id)}
                    className="text-red-500"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* URL */}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-mono text-sm hover:text-primary flex items-center gap-2 group"
            >
              <span className="break-all">{truncateUrl(link.url, 45)}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={link.status} />
              <PriorityBadge priority={link.priority} />
            </div>

            {/* Manager and Date */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{link.manager ? getManagerDisplayName(link.manager, managers) : 'Unassigned'}</span>
              <span>{formatDate(link.detected_at)}</span>
            </div>

            {/* Notes preview */}
            {link.notes && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {link.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
