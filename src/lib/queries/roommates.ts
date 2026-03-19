import { supabase } from '@/lib/supabase'
import type { RoommateProfile } from '@/types/app.types'

export async function getRoommateProfiles(): Promise<RoommateProfile[]> {
  const { data, error } = await supabase
    .from('roommate_profiles')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as RoommateProfile[]
}

export async function getMyRoommateProfile(userId: string): Promise<RoommateProfile | null> {
  const { data, error } = await supabase
    .from('roommate_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data as RoommateProfile
}

export async function upsertRoommateProfile(
  userId: string,
  updates: Partial<Omit<RoommateProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<RoommateProfile> {
  const { data, error } = await supabase
    .from('roommate_profiles')
    .upsert({ ...updates, user_id: userId }, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw error
  return data as RoommateProfile
}

export function calcCompatibility(a: RoommateProfile, b: RoommateProfile): number {
  let score = 0

  // Budget overlap (30 pts)
  if (a.budget_min != null && a.budget_max != null && b.budget_min != null && b.budget_max != null) {
    const overlapMin = Math.max(a.budget_min, b.budget_min)
    const overlapMax = Math.min(a.budget_max, b.budget_max)
    if (overlapMax >= overlapMin) score += 30
  }

  // Sleep schedule (25 pts)
  if (a.sleep_schedule === b.sleep_schedule) score += 25

  // Cleanliness within 1 (20 pts)
  if (Math.abs(a.cleanliness_level - b.cleanliness_level) <= 1) score += 20

  // Social level within 1 (15 pts)
  if (Math.abs(a.social_level - b.social_level) <= 1) score += 15

  // Neighborhood overlap (10 pts)
  const shared = a.preferred_neighborhoods.filter(n => b.preferred_neighborhoods.includes(n))
  if (shared.length > 0) score += 10

  return score
}
