// Platform Page - Dynamic route for each platform

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { LinksTable } from '@/components/platform/links-table';
import { LinkCard } from '@/components/platform/link-card';
import { FiltersPanel } from '@/components/platform/filters-panel';
import { FiltersDrawer } from '@/components/platform/filters-drawer';
import { BulkActionsBar } from '@/components/platform/bulk-actions';
import { CreateLinkDialog } from '@/components/platform/create-link-dialog';
import { LinkEditorDialog } from '@/components/platform/link-editor-dialog';
import { PlatformIcon } from '@/components/shared/platform-icon';
import { useLinks } from '@/hooks/use-links';
import { useFilters } from '@/hooks/use-filters';
import { useIsMobile } from '@/hooks/use-media-query';
import { NegativeLink, Platform, Status } from '@/types';
import { CreateLinkDto, UpdateLinkDto } from '@/types/api';
import { bulkUpdateStatus, bulkAssignManager } from '@/lib/api/links';
import { PLATFORMS } from '@/lib/constants';

export default function PlatformPage() {
  const params = useParams();
  const platform = params.slug as Platform;
  const isMobile = useIsMobile();
  
  const { filters, updateFilter, clearAllFilters, hasActiveFilters, setFilters } = useFilters({
    platform,
  });
  
  const { links, loading, addLink, modifyLink, removeLink, refresh } = useLinks(filters);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingLink, setEditingLink] = useState<NegativeLink | null>(null);

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
      setFilters({ platform });
    } else {
      updateFilter(key, value);
    }
  };

  const platformLabel = PLATFORMS.find(p => p.value === platform)?.label || platform;

  return (
    <div className="container py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PlatformIcon platform={platform} size={32} className="text-primary" />
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{platformLabel}</h1>
            <p className="text-muted-foreground">
              {loading ? 'Loading...' : `${links.length} links found`}
            </p>
          </div>
        </div>
        
        <CreateLinkDialog onCreateLink={handleCreateLink} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
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
        onClearSelection={() => setSelectedIds([])}
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
