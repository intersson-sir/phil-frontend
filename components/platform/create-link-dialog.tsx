// Create Link Dialog Component

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Wand2 } from 'lucide-react';
import { CreateLinkDto } from '@/types/api';
import { Platform, LinkType, Priority, Status } from '@/types';
import { PLATFORMS, LINK_TYPES, PRIORITIES, STATUSES } from '@/lib/constants';
import { useManagers } from '@/hooks/use-managers';

function detectPlatformFromUrl(url: string): Platform | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    if (hostname === 'facebook.com' || hostname === 'fb.com' || hostname.endsWith('.facebook.com')) return 'facebook';
    if (hostname === 'twitter.com' || hostname === 'x.com' || hostname === 't.co') return 'twitter';
    if (hostname === 'youtube.com' || hostname === 'youtu.be' || hostname.endsWith('.youtube.com')) return 'youtube';
    if (hostname === 'reddit.com' || hostname === 'redd.it' || hostname.endsWith('.reddit.com')) return 'reddit';
    return 'other';
  } catch {
    return null;
  }
}

interface CreateLinkDialogProps {
  onCreateLink: (data: CreateLinkDto) => Promise<void>;
  defaultPlatform?: Platform;
}

export function CreateLinkDialog({ onCreateLink, defaultPlatform }: CreateLinkDialogProps) {
  const { managers } = useManagers();
  const activeManagers = managers.filter((m) => m.is_active);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [platformAutoDetected, setPlatformAutoDetected] = useState(false);
  const [formData, setFormData] = useState<CreateLinkDto>({
    url: '',
    platform: defaultPlatform ?? 'other',
    type: 'post',
    priority: 'medium',
    status: 'pending',
  });

  const handleUrlChange = (url: string) => {
    const detected = detectPlatformFromUrl(url);
    if (detected !== null) {
      setPlatformAutoDetected(true);
      setFormData(prev => ({ ...prev, url, platform: detected }));
    } else {
      setPlatformAutoDetected(false);
      setFormData(prev => ({ ...prev, url }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Clean data before sending
      const cleanData: CreateLinkDto = {
        url: formData.url.trim(),
        platform: formData.platform,
        type: formData.type,
        priority: formData.priority,
        status: formData.status,
      };
      
      // Only add manager_id if it's a valid non-empty string
      if (formData.manager_id && formData.manager_id !== 'none') {
        cleanData.manager_id = formData.manager_id;
      }
      
      // Only add notes if not empty
      if (formData.notes && formData.notes.trim()) {
        cleanData.notes = formData.notes.trim();
      }
      
      await onCreateLink(cleanData);
      setOpen(false);
      setPlatformAutoDetected(false);
      setFormData({
        url: '',
        platform: defaultPlatform ?? 'other',
        type: 'post',
        priority: 'medium',
        status: 'pending',
      });
    } catch (error) {
      console.error('Failed to create link:', error);
      alert(`Failed to create link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setPlatformAutoDetected(false);
      setFormData({
        url: '',
        platform: defaultPlatform ?? 'other',
        type: 'post',
        priority: 'medium',
        status: 'pending',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Negative Link</DialogTitle>
            <DialogDescription>
              Enter the details of the negative link to track.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* URL */}
            <div className="grid gap-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                placeholder="https://example.com/post/123"
                value={formData.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                required
              />
            </div>

            {/* Platform */}
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="platform">Platform *</Label>
                {platformAutoDetected && (
                  <span className="flex items-center gap-1 text-xs text-primary">
                    <Wand2 className="h-3 w-3" />
                    auto-detected
                  </span>
                )}
              </div>
              <Select 
                value={formData.platform} 
                onValueChange={(value) => {
                  setPlatformAutoDetected(false);
                  setFormData({ ...formData, platform: value as Platform });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map(platform => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({ ...formData, type: value as LinkType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LINK_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value as Status })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Manager */}
            <div className="grid gap-2">
              <Label htmlFor="manager">Manager</Label>
              <Select 
                value={formData.manager_id ?? 'none'} 
                onValueChange={(value) => {
                  if (value === 'none' || value === '') {
                    setFormData({ ...formData, manager_id: undefined });
                  } else {
                    setFormData({ ...formData, manager_id: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {activeManagers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Additional notes (optional)"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.url}>
              {loading ? 'Creating...' : 'Create Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
