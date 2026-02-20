// Platform Page - Dynamic route for each platform

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { LinksTable } from '@/components/platform/links-table';
import { LinkCard } from '@/components/platform/link-card';
import { KanbanBoard } from '@/components/platform/KanbanBoard';
import { FiltersPanel } from '@/components/platform/filters-panel';
import { FiltersDrawer } from '@/components/platform/filters-drawer';
import { BulkActionsBar } from '@/components/platform/bulk-actions';
import { CreateLinkDialog } from '@/components/platform/create-link-dialog';
import { LinkEditorDialog } from '@/components/platform/link-editor-dialog';
import { PlatformIcon } from '@/components/shared/platform-icon';
import { Layers } from 'lucide-react';
import { useLinks } from '@/hooks/use-links';
import { useFilters } from '@/hooks/use-filters';
import { useIsMobile } from '@/hooks/use-media-query';
import { useManagers } from '@/hooks/use-managers';
import { NegativeLink, Platform, Status } from '@/types';
import { CreateLinkDto, UpdateLinkDto } from '@/types/api';
import { bulkUpdateStatus, bulkAssignManager } from '@/lib/api/links';
import { PLATFORMS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

const VIEW_STORAGE_KEY = 'phil-platform-view';
type ViewMode = 'table' | 'kanban';

function getStoredView(): ViewMode {
  if (typeof window === 'undefined') return 'table';
  try {
    const v = window.localStorage.getItem(VIEW_STORAGE_KEY);
    return v === 'kanban' ? 'kanban' : 'table';
  } catch {
    return 'table';
  }
}

export default function PlatformPage() {
  const params = useParams();
  const slug = params.slug as string;
  const isAll = slug === 'all';
  const platform = isAll ? undefined : (slug as Platform);
  const isMobile = useIsMobile();
  
  const { filters, updateFilter, clearAllFilters, hasActiveFilters, setFilters } = useFilters(
    isAll ? {} : { platform }
  );
  
  const { links, loading, addLink, modifyLink, removeLink, refresh, applyOptimisticStatus } = useLinks(filters);
  const { managers } = useManagers();
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingLink, setEditingLink] = useState<NegativeLink | null>(null);
  const [viewMode, setViewModeState] = useState<ViewMode>(() => getStoredView());

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VIEW_STORAGE_KEY, mode);
    }
  };

  const handleKanbanStatusChange = async (linkId: string, newStatus: Status) => {
    applyOptimisticStatus(linkId, newStatus);
    try {
      await modifyLink(linkId, { status: newStatus });
    } catch {
      refresh();
    }
  };

  // Clear selection when filters change
  useEffect(() => {
    setSelectedIds([]);
  }, [filters]);

  const handleCreateLink = async (data: CreateLinkDto) => {
    await addLink(data);
    refresh();
  };

  const handleUpdateLink = async (id: string, data: UpdateLinkDto) => {
    await modifyLink(id, data);
    refresh();
  };

  const handleDeleteLink = async (id: string) => {
    await removeLink(id);
    setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
  };

  const handleBulkUpdateStatus = async (status: Status) => {
    await bulkUpdateStatus(selectedIds, status);
    setSelectedIds([]);
    refresh();
  };

  const handleBulkAssignManager = async (manager: string) => {
    await bulkAssignManager(selectedIds, manager);
    setSelectedIds([]);
    refresh();
  };

  const handleFilterChange = <K extends keyof typeof filters>(
    key: K,
    value: typeof filters[K]
  ) => {
    if (value === '__all__' || value === '') {
      clearAllFilters();
      if (!isAll) setFilters({ platform });
    } else {
      updateFilter(key, value);
    }
  };

  const platformLabel = isAll
    ? 'All Links'
    : PLATFORMS.find(p => p.value === platform)?.label || slug;

  return (
    <div className="container py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {isAll ? (
            <Layers className="text-primary shrink-0 size-7 sm:size-8" />
          ) : (
            <PlatformIcon platform={platform!} size={28} className="text-primary shrink-0 sm:size-8" />
          )}
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight truncate">{platformLabel}</h1>
            <p className="text-muted-foreground text-sm">
              {loading ? 'Loading...' : `${links.length} links found`}
            </p>
          </div>
        </div>
        
        <CreateLinkDialog onCreateLink={handleCreateLink} defaultPlatform={platform} />
      </div>

      {/* View toggle + Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'gap-1.5',
              viewMode === 'table' && 'bg-background shadow-sm'
            )}
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
            Table
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'gap-1.5',
              viewMode === 'kanban' && 'bg-background shadow-sm'
            )}
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="h-4 w-4" />
            Kanban
          </Button>
        </div>
        {isMobile ? (
          <FiltersDrawer
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={() => {
              clearAllFilters();
              setFilters({ platform });
            }}
            hasActiveFilters={hasActiveFilters}
          />
        ) : (
          <FiltersPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={() => {
              clearAllFilters();
              setFilters({ platform });
            }}
            hasActiveFilters={hasActiveFilters}
          />
        )}
      </div>

      {/* Bulk Actions */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        totalCount={links.length}
        onClearSelection={() => setSelectedIds([])}
        onSelectAll={() => setSelectedIds(links.map(l => l.id))}
        onUpdateStatus={handleBulkUpdateStatus}
        onAssignManager={handleBulkAssignManager}
      />

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading links...</p>
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          links={links}
          managers={managers}
          onEdit={setEditingLink}
          onDelete={handleDeleteLink}
          onStatusChange={handleKanbanStatusChange}
        />
      ) : isMobile ? (
        <div className="space-y-3">
          {links.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              selected={selectedIds.includes(link.id)}
              onSelect={(checked) => {
                if (checked) {
                  setSelectedIds([...selectedIds, link.id]);
                } else {
                  setSelectedIds(selectedIds.filter(id => id !== link.id));
                }
              }}
              onEdit={setEditingLink}
              onDelete={handleDeleteLink}
              managers={managers}
            />
          ))}
        </div>
      ) : (
        <LinksTable
          links={links}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onEdit={setEditingLink}
          onDelete={handleDeleteLink}
          managers={managers}
        />
      )}

      {/* Edit Dialog */}
      <LinkEditorDialog
        link={editingLink}
        open={!!editingLink}
        onClose={() => setEditingLink(null)}
        onUpdateLink={handleUpdateLink}
        onDeleteLink={handleDeleteLink}
      />
    </div>
  );
}
