'use client';

import type { ReactNode } from 'react';
import { PrivateRoute } from '@/components/layout/PrivateRoute';
import { Sidebar } from '@/components/layout/Sidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <PrivateRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-64">
          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </PrivateRoute>
  );
}
