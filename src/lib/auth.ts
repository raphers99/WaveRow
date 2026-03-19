import { supabase } from './supabase'
import type { UserRole } from '@/types/app.types'

export function isEduEmail(email: string): boolean {
  return email.toLowerCase().endsWith('.edu')
}

export function isTulaneEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@tulane.edu')
}

export async function sendOTP(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  })
  if (error) throw error
}

export async function verifyOTP(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

export async function createProfile(
  userId: string,
  email: string,
  role: UserRole,
  displayName?: string
) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      role,
      display_name: displayName ?? null,
      is_verified_student: isTulaneEmail(email),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}
