'use client';

import { useState, useEffect, useCallback } from 'react';
import { ActivityRecord, ActivityFilters } from '@/types';
import { getActivityList, getActivityByLinkId } from '@/lib/api/activity';
import { ActivityItem } from './ActivityItem';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ActivityLogProps {
  /** When set, show only activity for this link */
  linkId?: string;
  /** For global log: filters (user, action, entity_type, date_from, date_to) */
  filters?: Omit<ActivityFilters, 'page'>;
  /** Max height for scroll area (optional) */
  className?: string;
}

export function ActivityLog({ linkId, filters = {}, className }: ActivityLogProps) {
  const [items, setItems] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchPage = useCallback(
    async (pageNum: number, append: boolean) => {
      if (linkId) {
        const res = await getActivityByLinkId(linkId, pageNum);
        setItems((prev) => (append ? [...prev, ...res.results] : res.results));
        setHasMore(!!res.next);
      } else {
        const res = await getActivityList({ ...filters, page: pageNum });
        setItems((prev) => (append ? [...prev, ...res.results] : res.results));
        setHasMore(!!res.next);
      }
    },
    [linkId, filters]
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPage(1);
    if (linkId) {
      getActivityByLinkId(linkId, 1)
        .then((res) => {
          setItems(res.results);
          setHasMore(!!res.next);
        })
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load activity'))
        .finally(() => setLoading(false));
    } else {
      getActivityList({ ...filters, page: 1 })
        .then((res) => {
          setItems(res.results);
          setHasMore(!!res.next);
        })
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load activity'))
        .finally(() => setLoading(false));
    }
  }, [linkId, JSON.stringify(filters)]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      if (linkId) {
        const res = await getActivityByLinkId(linkId, nextPage);
        setItems((prev) => [...prev, ...res.results]);
        setHasMore(!!res.next);
      } else {
        const res = await getActivityList({ ...filters, page: nextPage });
        setItems((prev) => [...prev, ...res.results]);
        setHasMore(!!res.next);
      }
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className={className} data-slot="activity-log">
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} data-slot="activity-log">
        <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={className} data-slot="activity-log">
        <p className="py-8 text-center text-muted-foreground">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className={className} data-slot="activity-log">
      <ul className="list-none space-y-0 p-0">
        {items.map((record) => (
          <li key={record.id}>
            <ActivityItem
              record={record}
              isLast={record.id === items[items.length - 1]?.id}
            />
          </li>
        ))}
      </ul>
      {hasMore && (
        <div className="flex justify-center pt-4 pb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Load more'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
