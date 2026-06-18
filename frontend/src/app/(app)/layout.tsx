'use client';

import type { ReactNode } from 'react';
import { PrivateRoute } from '@/components/layout/PrivateRoute';
import { AppHeader } from '@/components/layout/AppHeader';
import { TabsNav } from '@/components/layout/TabsNav';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <PrivateRoute>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <TabsNav />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </PrivateRoute>
  );
}
