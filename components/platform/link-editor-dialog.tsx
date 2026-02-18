// Link Editor Dialog Component

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NegativeLink, Status, Priority } from '@/types';
import { UpdateLinkDto } from '@/types/api';
import { STATUSES, PRIORITIES } from '@/lib/constants';
import { useManagers } from '@/hooks/use-managers';
import { ActivityLog } from '@/components/activity/ActivityLog';

interface LinkEditorDialogProps {
  link: NegativeLink | null;
  open: boolean;
  onClose: () => void;
  onUpdateLink: (id: string, data: UpdateLinkDto) => Promise<void>;
  onDeleteLink: (id: string) => Promise<void>;
}

export function LinkEditorDialog({ 
  link, 
  open, 
  onClose, 
  onUpdateLink, 
  onDeleteLink 
}: LinkEditorDialogProps) {
  const { managers } = useManagers();
  const activeManagers = managers.filter((m) => m.is_active);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateLinkDto>({});

  useEffect(() => {
    if (link) {
      const managerId =
        link.manager != null && typeof link.manager === 'object'
          ? link.manager.id
          : (typeof link.manager === 'string' ? link.manager : undefined);
      setFormData({
        status: link.status,
        priority: link.priority,
        manager_id: managerId ?? null,
        notes: link.notes,
      });
    }
  }, [link]);

  if (!link) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onUpdateLink(link.id, formData);
      onClose();
    } catch (error) {
      console.error('Failed to update link:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    
    setLoading(true);
    try {
      await onDeleteLink(link.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete link:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
          <DialogDescription className="break-all">
            {link.url}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">История изменений</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-4">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-2">
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
                <div className="grid gap-2">
                  <Label htmlFor="manager">Manager</Label>
                  <Select 
                    value={formData.manager_id ?? ''} 
                    onValueChange={(value) => setFormData({ ...formData, manager_id: value || null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {activeManagers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Additional notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 mt-4">
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={loading}
                >
                  Delete
                </Button>
                <div className="flex-1" />
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <div className="max-h-[360px] overflow-y-auto pr-1">
              <ActivityLog linkId={link.id} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
