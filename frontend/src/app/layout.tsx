import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { QueryProvider } from '@/context/QueryProvider';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Caixa — Gestão Financeira Corporativa',
  description:
    'Plataforma interna para registro e acompanhamento de movimentações financeiras por categoria.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
