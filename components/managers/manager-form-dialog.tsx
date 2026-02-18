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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Manager } from '@/types';
import { CreateManagerDto } from '@/lib/api/managers';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

interface ManagerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manager: Manager | null; // null = create
  onSave: (data: CreateManagerDto) => Promise<void>;
}

export function ManagerFormDialog({
  open,
  onOpenChange,
  manager,
  onSave,
}: ManagerFormDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = !!manager;

  useEffect(() => {
    if (open) {
      setError(null);
      if (manager) {
        setName(manager.name);
        setEmail(manager.email);
      } else {
        setName('');
        setEmail('');
      }
    }
  }, [open, manager]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nameTrim = name.trim();
    const emailTrim = email.trim();
    if (!nameTrim) {
      setError('Enter name');
      return;
    }
    if (!emailTrim) {
      setError('Enter email');
      return;
    }
    if (!isValidEmail(emailTrim)) {
      setError('Invalid email format');
      return;
    }
    setLoading(true);
    try {
      await onSave({ name: nameTrim, email: emailTrim });
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Manager' : 'Add Manager'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update the manager details.' : 'Enter name and email for the new manager.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="manager-name">Name *</Label>
              <Input
                id="manager-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="manager-email">Email *</Label>
              <Input
                id="manager-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@example.com"
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
