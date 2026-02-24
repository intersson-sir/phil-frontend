'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
  hasActiveFilters,
}: FiltersDrawerProps) {
  const { managers } = useManagers();
  const activeManagers = managers.filter((m) => m.is_active);
  const [open, setOpen] = useState(false);

  const activeCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== '' && v !== null
  ).length - 1; // subtract platform filter

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && activeCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="w-full max-w-none rounded-t-xl px-0 pb-0">
        <SheetHeader className="px-4 pb-2">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-2 grid grid-cols-2 gap-x-3 gap-y-4">
          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select
              value={filters.status ?? ''}
              onValueChange={(value) => onFilterChange('status', value as Status)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Priority</Label>
            <Select
              value={filters.priority ?? ''}
              onValueChange={(value) => onFilterChange('priority', value as Priority)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Priorities</SelectItem>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Manager */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Manager</Label>
            <Select
              value={filters.manager ?? ''}
              onValueChange={(value) => onFilterChange('manager', value)}
            >
              <SelectTrigger className="w-full">
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
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Search URL</Label>
            <Input
              className="w-full"
              placeholder="Search..."
              value={filters.search ?? ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex gap-2 px-4 py-3 border-t border-border mt-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClearFilters();
              }}
              className="flex-1 gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Clear All
            </Button>
          )}
          <SheetClose asChild>
            <Button size="sm" className={hasActiveFilters ? 'flex-1' : 'w-full'}>
              Close
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
