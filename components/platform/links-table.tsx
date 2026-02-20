// Links Table Component (Desktop)

'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ExternalLink } from 'lucide-react';
import { NegativeLink, Manager, Status } from '@/types';
import { StatusBadge } from '@/components/shared/status-badge';
import { getManagerDisplayName } from '@/lib/utils';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { PlatformIcon } from '@/components/shared/platform-icon';
import { formatDate } from '@/lib/utils/dates';
import { LINK_TYPES } from '@/lib/constants';

interface LinksTableProps {
  links: NegativeLink[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit: (link: NegativeLink) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: Status) => void;
  managers?: Manager[];
}

export function LinksTable({ 
  links, 
  selectedIds, 
  onSelectionChange, 
  onEdit, 
  onDelete,
  onStatusChange,
  managers = [],
}: LinksTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(links.map(link => link.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const isAllSelected = links.length > 0 && selectedIds.length === links.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < links.length;

  const getLinkTypeLabel = (type: string) => {
    return LINK_TYPES.find(t => t.value === type)?.label || type;
  };

  const truncateUrl = (url: string, maxLength: number = 50) => {
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
                className={isSomeSelected ? 'opacity-50' : ''}
              />
            </TableHead>
            <TableHead className="w-12">Platform</TableHead>
            <TableHead>URL</TableHead>
            <TableHead className="w-24">Type</TableHead>
            <TableHead className="w-24">Status</TableHead>
            <TableHead className="w-24">Priority</TableHead>
            <TableHead className="w-32">Manager</TableHead>
            <TableHead className="w-32">Detected</TableHead>
            <TableHead className="w-36"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                No links found
              </TableCell>
            </TableRow>
          ) : (
            links.map((link) => (
              <TableRow key={link.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(link.id)}
                    onCheckedChange={(checked) => handleSelectOne(link.id, checked as boolean)}
                    aria-label={`Select ${link.id}`}
                  />
                </TableCell>
                <TableCell>
                  <PlatformIcon platform={link.platform} />
                </TableCell>
                <TableCell className="font-mono text-sm">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary flex items-center gap-2 group"
                  >
                    <span>{truncateUrl(link.url)}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {getLinkTypeLabel(link.type)}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={link.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={link.priority} />
                </TableCell>
                <TableCell>
                  <span className="text-sm">{getManagerDisplayName(link.manager, managers)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(link.detected_at)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {onStatusChange && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-xs font-bold text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => onStatusChange(link.id, 'removed')}
                        title="Mark as Removed"
                      >
                        R
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
