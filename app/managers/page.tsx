'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Pencil, UserX } from 'lucide-react';
import { Manager } from '@/types';
import { useManagers } from '@/hooks/use-managers';
import { createManager, updateManager, deleteManager, CreateManagerDto } from '@/lib/api/managers';
import { ManagerFormDialog } from '@/components/managers/manager-form-dialog';
import { Badge } from '@/components/ui/badge';

export default function ManagersPage() {
  const { managers, loading, refresh } = useManagers();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);

  const handleAdd = () => {
    setEditingManager(null);
    setDialogOpen(true);
  };

  const handleEdit = (manager: Manager) => {
    setEditingManager(manager);
    setDialogOpen(true);
  };

  const handleSave = async (data: CreateManagerDto) => {
    if (editingManager) {
      await updateManager(editingManager.id, data);
    } else {
      await createManager(data);
    }
    await refresh();
  };

  const handleDelete = async (manager: Manager) => {
    if (!confirm(`Delete manager ${manager.name}? (They will be marked inactive.)`)) return;
    try {
      await deleteManager(manager.id);
      await refresh();
    } catch (e) {
      console.error('Failed to delete:', e);
      alert(e instanceof Error ? e.message : 'Failed to delete manager');
    }
  };

  if (loading) {
    return (
      <div className="container py-8 px-4">
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading managers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Managers</h1>
          <p className="text-muted-foreground">
            Manage the list of managers for link assignment
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Manager
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {managers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No managers yet. Click &quot;Add Manager&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              managers.map((manager) => (
                <TableRow key={manager.id}>
                  <TableCell className="font-medium">{manager.name}</TableCell>
                  <TableCell className="text-muted-foreground">{manager.email}</TableCell>
                  <TableCell>
                    <Badge variant={manager.is_active ? 'default' : 'secondary'}>
                      {manager.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {manager.is_active && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(manager)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(manager)}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ManagerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        manager={editingManager}
        onSave={handleSave}
      />
    </div>
  );
}
