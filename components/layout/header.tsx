'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/platform/all', label: 'Platforms' },
  { href: '/managers', label: 'Managers' },
  { href: '/activity', label: 'Activity' },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    router.push('/login');
  };

  const displayName =
    user?.first_name || user?.last_name
      ? [user.first_name, user.last_name].filter(Boolean).join(' ')
      : user?.username ?? '';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
        >
          <Image
            src="/logo-avatar.png"
            alt="Phil"
            width={32}
            height={32}
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover ring-1 ring-red-500/50"
          />
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-bold tracking-tight leading-none">Phil</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight hidden sm:block">
              Negative Link Tracker
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        {isAuthenticated && (
          <nav className="hidden sm:flex items-center gap-6">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname === href
                    ? 'text-foreground'
                    : 'text-foreground/60 hover:text-foreground'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Desktop user menu */}
          {isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-foreground/80 hover:text-foreground hidden sm:flex"
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

          {/* Mobile burger button */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              className="flex sm:hidden p-2"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="px-6 py-5 border-b border-border/40">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-avatar.png"
                alt="Phil"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-red-500/50 shrink-0"
              />
              <div>
                <SheetTitle className="text-base leading-tight">Phil</SheetTitle>
                <p className="text-xs text-muted-foreground leading-tight">Negative Link Tracker</p>
              </div>
            </div>
          </SheetHeader>

          {/* Nav links */}
          <nav className="flex flex-col px-3 py-4 gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <SheetClose asChild key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    pathname === href
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {label}
                </Link>
              </SheetClose>
            ))}
          </nav>

          {/* User block at bottom */}
          {user && (
            <div className="mt-auto border-t border-border/40 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Image
                  src="/logo-avatar.png"
                  alt="Phil"
                  width={20}
                  height={20}
                  className="h-5 w-5 rounded-full object-cover shrink-0"
                />
                <span className="text-sm truncate text-foreground/80">
                  {displayName || user.username}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoading}
                className="text-destructive hover:text-destructive shrink-0 p-2"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </header>
  );
}
