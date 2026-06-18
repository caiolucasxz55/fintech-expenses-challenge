import Link from 'next/link';
import { Wallet } from 'lucide-react';
import type { ReactNode } from 'react';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

/** Moldura visual das telas de autenticação: painel de marca + formulário. */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Painel de marca (escondido no mobile) */}
      <div className="relative hidden flex-col justify-between bg-gradient-to-br from-primary via-blue-700 to-blue-900 p-12 text-primary-foreground lg:flex">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Wallet className="h-6 w-6" />
          FinCorp
        </Link>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold leading-tight">
            Controle total das finanças da sua empresa.
          </h2>
          <p className="max-w-md text-blue-100">
            Registre movimentações por categoria, acompanhe entradas e saídas e
            visualize indicadores em tempo real num só lugar.
          </p>
        </div>
        <p className="text-sm text-blue-200">
          Gestão Financeira Corporativa &middot; NestJS + Next.js
        </p>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm animate-fade-in space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <div className="mb-4 flex items-center justify-center gap-2 lg:hidden">
              <Wallet className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">FinCorp</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          <p className="text-center text-sm text-muted-foreground">{footer}</p>
        </div>
      </div>
    </div>
  );
}
