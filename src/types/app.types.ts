export type UserRole = 'student' | 'landlord' | 'admin'
export type ListingType = 'APARTMENT' | 'HOUSE' | 'STUDIO' | 'SHARED_ROOM'
export type ListingStatus = 'ACTIVE' | 'PENDING' | 'RENTED' | 'EXPIRED'
export type SleepSchedule = 'early_bird' | 'night_owl' | 'flexible'

export interface Profile {
  id: string
  email: string
  display_name: string | null
  role: UserRole
  is_verified_student: boolean
  avatar_url: string | null
  bio: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string | null
  address: string | null
  neighborhood: string | null
  lat: number | null
  lng: number | null
  rent_per_month: number   // cents
  listing_type: ListingType
  status: ListingStatus
  bedrooms: number
  bathrooms: number
  sqft: number | null
  furnished: boolean
  pet_friendly: boolean
  utilities_included: boolean
  images: string[]
  amenities: string[]
  is_featured: boolean
  is_sublease: boolean
  scam_flagged: boolean
  available_from: string | null
  lease_duration_months: number | null
  views_count: number
  created_at: string
  updated_at: string
  profile?: Pick<Profile, 'id' | 'display_name' | 'role' | 'is_verified_student' | 'avatar_url'>
  saved?: boolean
}

export interface RoommateProfile {
  id: string
  user_id: string
  display_name: string | null
  bio: string | null
  budget_min: number | null
  budget_max: number | null
  move_in_date: string | null
  preferred_neighborhoods: string[]
  sleep_schedule: SleepSchedule
  cleanliness_level: number
  social_level: number
  has_pets: boolean
  smoking: boolean
  major: string | null
  year: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
}

export interface Conversation {
  id: string
  listing_id: string | null
  participant_one: string
  participant_two: string
  last_message: string | null
  last_message_at: string | null
  created_at: string
  other_user?: Pick<Profile, 'id' | 'display_name' | 'avatar_url'>
  unread_count: number
}

export interface SavedListing {
  id: string
  user_id: string
  listing_id: string
  created_at: string
  listing?: Listing
}

export interface ListingFilters {
  priceMin: number
  priceMax: number
  type: string
  beds: string
  subleaseOnly: boolean
  petFriendly: boolean
  furnished: boolean
  neighborhood: string
  sortBy: string
}

export const DEFAULT_FILTERS: ListingFilters = {
  priceMin: 500,
  priceMax: 4000,
  type: 'all',
  beds: 'any',
  subleaseOnly: false,
  petFriendly: false,
  furnished: false,
  neighborhood: 'all',
  sortBy: 'newest',
}
