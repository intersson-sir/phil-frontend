// Filters Panel Component (Desktop)

'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { FilterParams, Status, Priority } from '@/types';
import { STATUSES, PRIORITIES, MANAGERS } from '@/lib/constants';

interface FiltersPanelProps {
  filters: FilterParams;
  onFilterChange: <K extends keyof FilterParams>(key: K, value: FilterParams[K]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function FiltersPanel({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  hasActiveFilters 
}: FiltersPanelProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-card border rounded-lg">
      {/* Status Filter */}
      <div className="flex-1 min-w-[150px]">
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
      <div className="flex-1 min-w-[150px]">
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
      <div className="flex-1 min-w-[150px]">
        <Select 
          value={filters.manager || ''} 
          onValueChange={(value) => onFilterChange('manager', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Managers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Managers</SelectItem>
            {MANAGERS.map(manager => (
              <SelectItem key={manager} value={manager}>
                {manager}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Search URL..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearFilters}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
