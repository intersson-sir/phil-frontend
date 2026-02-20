// Platform Icon Component

import { Facebook, Twitter, Youtube, MessageCircle, Globe, User } from 'lucide-react';
import { Platform } from '@/types';
import { cn } from '@/lib/utils';

interface PlatformIconProps {
  platform: Platform;
  className?: string;
  size?: number;
}

const platformIcons: Record<Platform, React.ComponentType<{ size?: number; className?: string }>> = {
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  reddit: MessageCircle,
  account: User,
  other: Globe,
};

export function PlatformIcon({ platform, className, size = 20 }: PlatformIconProps) {
  const Icon = platformIcons[platform];
  
  return (
    <Icon 
      size={size} 
      className={cn('text-gray-400', className)} 
    />
  );
}
