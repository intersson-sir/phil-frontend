'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserCircle, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const displayName =
    user?.first_name || user?.last_name
      ? [user.first_name, user.last_name].filter(Boolean).join(' ')
      : user?.username ?? '';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <UserCircle className="h-8 w-8 text-red-500" />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight">Phil</span>
            <span className="text-xs text-muted-foreground">Negative Link Tracker</span>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          {isAuthenticated && (
            <>
              <Link
                href="/"
                className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/platform/facebook"
                className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
              >
                Platforms
              </Link>
              <Link
                href="/managers"
                className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
              >
                Managers
              </Link>
              <Link
                href="/activity"
                className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
              >
                Activity
              </Link>
            </>
          )}

          {isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-foreground/80 hover:text-foreground"
                >
                  <span className="max-w-[120px] truncate" title={displayName || user.email}>
                    {displayName || user.username}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  );
}
