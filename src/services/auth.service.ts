/**
 * Auth service — all Supabase/API calls live here.
 * Components must never call Supabase directly.
 *
 * Env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

export interface AuthResult {
  userId: string;
  email: string;
}

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export async function register(_input: RegisterInput): Promise<AuthResult> {
  throw new Error("register() not implemented");
}

export async function login(_input: LoginInput): Promise<AuthResult> {
  throw new Error("login() not implemented");
}

export async function logout(): Promise<void> {
  throw new Error("logout() not implemented");
}

export async function forgotPassword(_email: string): Promise<void> {
  throw new Error("forgotPassword() not implemented");
}

export async function resetPassword(_input: ResetPasswordInput): Promise<void> {
  throw new Error("resetPassword() not implemented");
}

export async function activateDevice(_deviceCode: string): Promise<void> {
  throw new Error("activateDevice() not implemented");
}
