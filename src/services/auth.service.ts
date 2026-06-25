import { supabase } from '@/lib/supabase'

export interface AuthResult {
  userId: string
  email: string
}

export interface RegisterInput {
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface ResetPasswordInput {
  password: string
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  })
  if (error) throw error
  if (!data.user) throw new Error('Registration failed')
  return {
    userId: data.user.id,
    email: data.user.email!,
  }
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  })
  if (error) throw error
  return {
    userId: data.user.id,
    email: data.user.email!,
  }
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function forgotPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: input.password,
  })
  if (error) throw error
}

export async function activateDevice(deviceCode: string): Promise<void> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) throw new Error('You must be logged in to activate a device')

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/device-verify`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ code: deviceCode.toUpperCase().replace(/\s/g, '') }),
    }
  )

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'Invalid or expired device code')
  }
}
