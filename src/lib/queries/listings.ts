import { supabase } from '@/lib/supabase'
import type { Listing, ListingFilters } from '@/types/app.types'

const PROFILE_FIELDS = 'id, display_name, role, is_verified_student, avatar_url'

export async function getListings(filters?: Partial<ListingFilters>): Promise<Listing[]> {
  let query = supabase
    .from('listings')
    .select(`*, profile:profiles(${PROFILE_FIELDS})`)
    .eq('status', 'ACTIVE')

  if (filters?.type && filters.type !== 'all') {
    query = query.eq('listing_type', filters.type)
  }
  if (filters?.subleaseOnly) {
    query = query.eq('is_sublease', true)
  }
  if (filters?.petFriendly) {
    query = query.eq('pet_friendly', true)
  }
  if (filters?.furnished) {
    query = query.eq('furnished', true)
  }
  if (filters?.neighborhood && filters.neighborhood !== 'all') {
    query = query.eq('neighborhood', filters.neighborhood)
  }
  if (filters?.priceMin) {
    query = query.gte('rent_per_month', filters.priceMin * 100)
  }
  if (filters?.priceMax) {
    query = query.lte('rent_per_month', filters.priceMax * 100)
  }
  if (filters?.beds && filters.beds !== 'any') {
    if (filters.beds === '3+') query = query.gte('bedrooms', 3)
    else query = query.eq('bedrooms', Number(filters.beds))
  }

  if (filters?.sortBy === 'price_asc') query = query.order('rent_per_month', { ascending: true })
  else if (filters?.sortBy === 'price_desc') query = query.order('rent_per_month', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Listing[]
}

export async function getListingById(id: string): Promise<Listing | null> {
  // Increment views
  supabase.rpc('increment_views', { listing_id: id }).then(() => {})

  const { data, error } = await supabase
    .from('listings')
    .select(`*, profile:profiles(${PROFILE_FIELDS})`)
    .eq('id', id)
    .single()
  if (error) return null
  return data as Listing
}

export async function createListing(
  payload: Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'profile' | 'saved' | 'views_count'>
): Promise<Listing> {
  const { data, error } = await supabase
    .from('listings')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as Listing
}

export async function saveListing(listingId: string, userId: string) {
  const { error } = await supabase
    .from('saved_listings')
    .insert({ user_id: userId, listing_id: listingId })
  if (error && error.code !== '23505') throw error
}

export async function unsaveListing(listingId: string, userId: string) {
  const { error } = await supabase
    .from('saved_listings')
    .delete()
    .eq('user_id', userId)
    .eq('listing_id', listingId)
  if (error) throw error
}

export async function getSavedListingIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('saved_listings')
    .select('listing_id')
    .eq('user_id', userId)
  return (data ?? []).map(r => r.listing_id)
}

export async function getSavedListings(userId: string): Promise<Listing[]> {
  const { data } = await supabase
    .from('saved_listings')
    .select(`listing:listings(*, profile:profiles(${PROFILE_FIELDS}))`)
    .eq('user_id', userId)
  const results: Listing[] = []
  for (const r of data ?? []) {
    if (r.listing) results.push({ ...(r.listing as unknown as Listing), saved: true })
  }
  return results
}

export async function getUserListings(userId: string): Promise<Listing[]> {
  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return (data ?? []) as Listing[]
}
