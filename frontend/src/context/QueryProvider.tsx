'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * Provider global do React Query.
 *
 * Decisão de arquitetura (documentada no README): os dados das telas são, em
 * sua maioria, "server state" (transações, categorias, dashboard). O React
 * Query cuida de cache, revalidação, paginação e estados de loading/erro sem
 * boilerplate. O pouco de estado global de cliente (sessão/token) fica no
 * AuthContext (Context API). Sem Redux/Zustand — alinhado ao "evite
 * over-engineering" do desafio.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
