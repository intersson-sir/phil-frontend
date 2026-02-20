// Constants for Phil CRM

import { Platform, Status, Priority, LinkType } from '@/types';

export const PLATFORMS: { value: Platform; label: string; icon: string }[] = [
  { value: 'facebook', label: 'Facebook', icon: 'facebook' },
  { value: 'twitter', label: 'Twitter/X', icon: 'twitter' },
  { value: 'youtube', label: 'YouTube', icon: 'youtube' },
  { value: 'reddit', label: 'Reddit', icon: 'reddit' },
  { value: 'account', label: 'Account', icon: 'account' },
  { value: 'other', label: 'Other', icon: 'other' },
];

export const STATUSES: { value: Status; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'red' },
  { value: 'removed', label: 'Removed', color: 'gray' },
  { value: 'in_work', label: 'In Work', color: 'yellow' },
  { value: 'pending', label: 'Pending', color: 'blue' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
];

export const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: 'red' },
  { value: 'medium', label: 'Medium', color: 'orange' },
  { value: 'low', label: 'Low', color: 'green' },
];

export const LINK_TYPES: { value: LinkType; label: string }[] = [
  { value: 'post', label: 'Post' },
  { value: 'comment', label: 'Comment' },
  { value: 'video', label: 'Video' },
  { value: 'article', label: 'Article' },
  { value: 'account', label: 'Account' },
];

export const MANAGERS = [
  'John Doe',
  'Jane Smith',
  'Mike Johnson',
  'Sarah Williams',
  'Unassigned',
];
