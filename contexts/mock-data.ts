// Mock data generator for Phil CRM

import { NegativeLink, Platform, LinkType, Status, Priority } from '@/types';

const platforms: Platform[] = ['facebook', 'twitter', 'youtube', 'reddit', 'account', 'other'];
const types: LinkType[] = ['post', 'comment', 'video', 'article', 'account'];
const statuses: Status[] = ['active', 'removed', 'in_work', 'pending', 'cancelled'];
const priorities: Priority[] = ['low', 'medium', 'high'];
const managerIds = ['1', '2', '3', '4']; // match MOCK_MANAGERS in managers.ts

const sampleUrls: Record<Platform, string[]> = {
  facebook: [
    'https://facebook.com/post/abc123',
    'https://facebook.com/user/post/456',
    'https://facebook.com/page/789/posts/xyz',
  ],
  twitter: [
    'https://twitter.com/user/status/1234567890',
    'https://x.com/account/status/9876543210',
    'https://twitter.com/username/status/555',
  ],
  youtube: [
    'https://youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com/watch?v=abc123def456',
    'https://youtube.com/watch?v=xyz789',
  ],
  reddit: [
    'https://reddit.com/r/subreddit/comments/abc123',
    'https://reddit.com/r/news/comments/xyz789',
    'https://reddit.com/r/technology/comments/def456',
  ],
  account: [
    'https://facebook.com/profile/user123',
    'https://twitter.com/username',
    'https://instagram.com/account_name',
  ],
  other: [
    'https://example.com/article/123',
    'https://newssite.com/post/456',
    'https://blog.example.com/2024/post',
  ],
};

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
}

function generateMockLink(id: number): NegativeLink {
  const platform = randomElement(platforms);
  const status = randomElement(statuses);
  const detectedAt = randomDate(90); // Last 90 days
  
  return {
    id: `link-${id}`,
    url: randomElement(sampleUrls[platform]) + `?id=${id}`,
    platform,
    type: randomElement(types),
    status,
    detected_at: detectedAt,
    removed_at: status === 'removed' ? randomDate(30) : undefined,
    priority: randomElement(priorities),
    manager: Math.random() > 0.3 ? randomElement(managerIds) : undefined,
    notes: Math.random() > 0.5 
      ? 'Sample note: This link contains negative content that needs review.'
      : undefined,
  };
}

// Generate 100 mock links
export const mockLinks: NegativeLink[] = Array.from({ length: 100 }, (_, i) => 
  generateMockLink(i + 1)
);

// In-memory storage (simulates backend state)
let linksStore = [...mockLinks];

export function getMockLinks(): NegativeLink[] {
  return [...linksStore];
}

export function addMockLink(link: NegativeLink): void {
  linksStore.push(link);
}

export function updateMockLink(id: string, updates: Partial<NegativeLink>): void {
  const index = linksStore.findIndex(link => link.id === id);
  if (index !== -1) {
    linksStore[index] = { ...linksStore[index], ...updates };
  }
}

export function deleteMockLink(id: string): void {
  linksStore = linksStore.filter(link => link.id !== id);
}

export function resetMockData(): void {
  linksStore = [...mockLinks];
}
