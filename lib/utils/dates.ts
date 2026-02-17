// Date utility functions for Phil CRM

import { format, parseISO, subDays, isAfter, isBefore } from 'date-fns';

export function formatDate(dateString: string, formatStr: string = 'MMM dd, yyyy'): string {
  try {
    return format(parseISO(dateString), formatStr);
  } catch {
    return 'Invalid date';
  }
}

export function formatDateTime(dateString: string): string {
  return formatDate(dateString, 'MMM dd, yyyy HH:mm');
}

export function getDateDaysAgo(days: number): string {
  return subDays(new Date(), days).toISOString();
}

export function isDateInRange(dateString: string, fromDate?: string, toDate?: string): boolean {
  if (!fromDate && !toDate) return true;
  
  const date = parseISO(dateString);
  
  if (fromDate && isBefore(date, parseISO(fromDate))) {
    return false;
  }
  
  if (toDate && isAfter(date, parseISO(toDate))) {
    return false;
  }
  
  return true;
}

export function isWithinLast7Days(dateString: string): boolean {
  const date = parseISO(dateString);
  const sevenDaysAgo = subDays(new Date(), 7);
  return isAfter(date, sevenDaysAgo);
}

export function getToday(): string {
  return new Date().toISOString();
}
