'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, Tags } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: ArrowLeftRight },
  { href: '/categories', label: 'Categorias', icon: Tags },
] as const;

export function TabsNav() {
  const pathname = usePathname();

  return (
    <div className="border-b bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <nav className="flex gap-1 overflow-x-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors',
                  active
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
