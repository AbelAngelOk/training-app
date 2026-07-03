import { supabase } from '@/lib/supabase'
import type { UserProfileRow, UserStatsRow } from '@/types/database'

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

export async function getUserProfile(userId: string): Promise<UserProfileRow | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createUserProfile(payload: {
  user_id: string
  display_name: string
  avatar_url?: string | null
  city?: string | null
  province?: string | null
  country?: string | null
  bio?: string | null
}): Promise<UserProfileRow> {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function checkTagAvailability(
  tag: string,
  currentUserId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('tag', tag)
    .neq('user_id', currentUserId)
    .maybeSingle()
  return !data
}

export async function updateUserProfile(
  userId: string,
  payload: {
    display_name?: string
    avatar_url?: string | null
    city?: string | null
    province?: string | null
    country?: string | null
    bio?: string | null
    tag?: string | null
    tag_updated_at?: string | null
  }
): Promise<UserProfileRow> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(payload)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getUserStats(userId: string): Promise<UserStatsRow | null> {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}
