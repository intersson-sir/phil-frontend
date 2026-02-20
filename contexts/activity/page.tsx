'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityLog } from '@/components/activity/ActivityLog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ActivityAction, ActivityEntityType, ActivityFilters } from '@/types';
import { Filter } from 'lucide-react';

const ACTIONS: { value: ActivityAction; label: string }[] = [
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'deleted', label: 'Deleted' },
  { value: 'status_changed', label: 'Status changed' },
  { value: 'assigned', label: 'Assigned' },
];

const ENTITY_TYPES: { value: ActivityEntityType; label: string }[] = [
  { value: 'link', label: 'Link' },
  { value: 'manager', label: 'Manager' },
];

export default function ActivityPage() {
  const [action, setAction] = useState<ActivityAction | ''>('');
  const [entityType, setEntityType] = useState<ActivityEntityType | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userId, setUserId] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filters: ActivityFilters = useMemo(() => {
    const f: ActivityFilters = {};
    if (action) f.action = action;
    if (entityType) f.entity_type = entityType;
    if (dateFrom) f.date_from = dateFrom;
    if (dateTo) f.date_to = dateTo;
    const uid = userId.trim() ? Number(userId) : undefined;
    if (uid != null && !Number.isNaN(uid)) f.user = uid;
    return f;
  }, [action, entityType, dateFrom, dateTo, userId]);

  const hasActiveFilters =
    !!action || !!entityType || !!dateFrom || !!dateTo || !!userId.trim();

  const clearFilters = () => {
    setAction('');
    setEntityType('');
    setDateFrom('');
    setDateTo('');
    setUserId('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Activity log</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters((v) => !v)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide filters' : 'Filters'}
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-xs">
              on
            </span>
          )}
        </Button>
      </div>

      {showFilters && (
        <Card className="mb-6 border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filter by</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <div className="grid gap-2">
              <Label className="text-xs text-muted-foreground">Action</Label>
              <Select
                value={action || '__all__'}
                onValueChange={(v) => setAction(v === '__all__' ? '' : (v as ActivityAction))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {ACTIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs text-muted-foreground">Entity type</Label>
              <Select
                value={entityType || '__all__'}
                onValueChange={(v) =>
                  setEntityType(v === '__all__' ? '' : (v as ActivityEntityType))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {ENTITY_TYPES.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs text-muted-foreground">User ID</Label>
              <Input
                type="number"
                placeholder="User ID"
                className="w-[120px]"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs text-muted-foreground">From date</Label>
              <Input
                type="date"
                className="w-[160px]"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs text-muted-foreground">To date</Label>
              <Input
                type="date"
                className="w-[160px]"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            {hasActiveFilters && (
              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">All activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityLog filters={filters} />
        </CardContent>
      </Card>
    </div>
  );
}
