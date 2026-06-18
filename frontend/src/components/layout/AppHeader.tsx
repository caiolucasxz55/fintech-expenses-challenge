'use client';

import { Wallet, LogOut } from 'lucide-react';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AppHeader() {
  const { user } = useAuth();
  const logout = useLogout();
  const initials = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="size-5" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">Caixa</span>
            <span className="text-xs text-muted-foreground">Gestão financeira</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Menu do usuário"
                className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
              >
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
