/** Domínio de autenticação — reflete os DTOs e respostas do AuthModule. */

export interface User {
  id: string;
  name: string;
  email: string;
}

/** Resposta de POST /auth/register e POST /auth/login. */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/** Resposta de POST /auth/refresh. */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}
