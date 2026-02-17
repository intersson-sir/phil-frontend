// Header Component with hooded icon

import Link from 'next/link';
import { UserCircle } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <UserCircle className="h-8 w-8 text-red-500" />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight">Phil</span>
            <span className="text-xs text-muted-foreground">Negative Link Tracker</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
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
        </nav>
      </div>
    </header>
  );
}
