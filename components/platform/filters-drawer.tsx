// Filters Drawer Component (Mobile)

'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, X } from 'lucide-react';
import { FilterParams, Status, Priority } from '@/types';
import { STATUSES, PRIORITIES } from '@/lib/constants';
import { useManagers } from '@/hooks/use-managers';

interface FiltersDrawerProps {
  filters: FilterParams;
  onFilterChange: <K extends keyof FilterParams>(key: K, value: FilterParams[K]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function FiltersDrawer({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  hasActiveFilters 
}: FiltersDrawerProps) {
  const { managers } = useManagers();
  const activeManagers = managers.filter((m) => m.is_active);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs">
              {Object.keys(filters).length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={filters.status || ''} 
              onValueChange={(value) => onFilterChange('status', value as Status)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Statuses</SelectItem>
                {STATUSES.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select 
              value={filters.priority || ''} 
              onValueChange={(value) => onFilterChange('priority', value as Priority)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Priorities</SelectItem>
                {PRIORITIES.map(priority => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Manager Filter */}
          <div className="space-y-2">
            <Label>Manager</Label>
            <Select 
              value={filters.manager || ''} 
              onValueChange={(value) => onFilterChange('manager', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Managers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Managers</SelectItem>
                {activeManagers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label>Search URL</Label>
            <Input
              placeholder="Enter URL to search..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
          </div>

          {/* Actions */}
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              className="w-full gap-2"
            >
              <X className="h-4 w-4" />
              Clear All Filters
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
