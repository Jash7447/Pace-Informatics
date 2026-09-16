'use client';

import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Boxes, LogOut, Search } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <header className="app-header sticky top-0 z-10 shrink-0 border-b">
      <div className="flex min-h-20 flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="brand-icon"><Boxes className="size-5" aria-hidden="true" /></span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Pace Informatics</h1>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Inventory workspace</p>
          </div>
        </div>
        <div className="flex w-full items-center justify-center gap-3 sm:max-w-md sm:flex-1">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              aria-label="Search products"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 w-full bg-muted/60 pl-9"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

