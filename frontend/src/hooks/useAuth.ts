'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import { useAuthContext } from '@/context/AuthContext';
import type {
  AuthResponse,
  LoginPayload,
  NormalizedApiError,
  RegisterPayload,
} from '@/types';

/** Acesso ao estado de sessão (usuário/status). */
export function useAuth() {
  return useAuthContext();
}

/** Mutation de login — executa POST /auth/login via React Query. */
export function useLogin() {
  const { setSession } = useAuthContext();
  const router = useRouter();

  return useMutation<AuthResponse, NormalizedApiError, LoginPayload>({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setSession(data);
      toast.success(`Bem-vindo, ${data.user.name.split(' ')[0]}!`);
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message || 'Não foi possível entrar.');
    },
  });
}

/** Mutation de registro — executa POST /auth/register via React Query. */
export function useRegister() {
  const { setSession } = useAuthContext();
  const router = useRouter();

  return useMutation<AuthResponse, NormalizedApiError, RegisterPayload>({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setSession(data);
      toast.success('Conta criada com sucesso!');
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message || 'Não foi possível criar a conta.');
    },
  });
}

/** Encerra a sessão e redireciona ao login. */
export function useLogout() {
  const { signOut } = useAuthContext();
  const router = useRouter();

  return async () => {
    await signOut();
    toast.success('Sessão encerrada.');
    router.push('/login');
  };
}
