import { supabase } from '@/lib/supabase'
import type { Conversation, Message } from '@/types/app.types'

export async function getConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`participant_one.eq.${userId},participant_two.eq.${userId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })
  if (error) return []

  // Fetch other user profiles
  const convs = (data ?? []) as Conversation[]
  const otherIds = convs.map(c => c.participant_one === userId ? c.participant_two : c.participant_one)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', [...new Set(otherIds)])

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  return convs.map(c => ({
    ...c,
    other_user: profileMap[c.participant_one === userId ? c.participant_two : c.participant_one],
    unread_count: 0, // TODO: count unread messages per conversation
  }))
}

export async function getOrCreateConversation(
  currentUserId: string,
  otherUserId: string,
  listingId?: string,
): Promise<Conversation> {
  // Try to find existing
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .or(
      `and(participant_one.eq.${currentUserId},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${currentUserId})`
    )
    .eq('listing_id', listingId ?? null)
    .maybeSingle()

  if (existing) return { ...existing, unread_count: 0 }

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      participant_one: currentUserId,
      participant_two: otherUserId,
      listing_id: listingId ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return { ...data, unread_count: 0 }
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) return []
  return (data ?? []) as Message[]
}

export async function sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select()
    .single()
  if (error) throw error
  return data as Message
}
