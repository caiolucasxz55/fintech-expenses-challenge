'use client';

import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { useRegister } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { RegisterPayload } from '@/types';

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPayload>();
  const registerMutation = useRegister();

  const onSubmit = (data: RegisterPayload) => registerMutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Seu nome"
          {...register('name', { required: 'Informe seu nome' })}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          {...register('email', { required: 'Informe seu e-mail' })}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo de 6 caracteres"
          {...register('password', {
            required: 'Informe uma senha',
            minLength: { value: 6, message: 'A senha deve ter ao menos 6 caracteres' },
          })}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        Criar conta
      </Button>
    </form>
  );
}
