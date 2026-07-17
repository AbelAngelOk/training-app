import { supabase } from '@/lib/supabase'
import type { FriendRequestRow, FriendshipRow, UserProfileRow } from '@/types/database'

export type UserSearchResult = Pick<
  UserProfileRow,
  'user_id' | 'display_name' | 'avatar_url' | 'tag'
>

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  if (query.length < 2) return []
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id, display_name, avatar_url, tag')
    .or(`display_name.ilike.%${query}%,tag.ilike.%${query}%`)
    .limit(20)
  if (error) throw error
  return data as UserSearchResult[]
}

export async function getUserPublicProfile(userId: string): Promise<UserProfileRow | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export type FriendRequestWithProfiles = FriendRequestRow & {
  sender: { display_name: string; avatar_url: string | null }
  receiver: { display_name: string; avatar_url: string | null }
}

export type FriendshipWithProfile = FriendshipRow & {
  friend: { user_id: string; display_name: string; avatar_url: string | null }
}

export async function sendFriendRequest(
  senderId: string,
  receiverId: string
): Promise<FriendRequestRow> {
  const { data, error } = await supabase
    .from('friend_requests')
    .insert({ sender_id: senderId, receiver_id: receiverId, status: 'pending' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getPendingFriendRequests(userId: string): Promise<FriendRequestWithProfiles[]> {
  const { data, error } = await supabase
    .from('friend_requests')
    .select(`
      *,
      sender:user_profiles!friend_requests_sender_id_fkey ( display_name, avatar_url ),
      receiver:user_profiles!friend_requests_receiver_id_fkey ( display_name, avatar_url )
    `)
    .eq('receiver_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as FriendRequestWithProfiles[]
}

export async function updateFriendRequestStatus(
  requestId: string,
  status: 'accepted' | 'rejected'
): Promise<FriendRequestRow> {
  const { data, error } = await supabase
    .from('friend_requests')
    .update({ status })
    .eq('id', requestId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getFriends(userId: string): Promise<FriendshipWithProfile[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select(`
      *,
      profile_a:user_profiles!friendships_user_a_id_fkey ( user_id, display_name, avatar_url ),
      profile_b:user_profiles!friendships_user_b_id_fkey ( user_id, display_name, avatar_url )
    `)
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .order('created_at', { ascending: false })
  if (error) throw error

  return data.map((f: any) => ({
    ...f,
    friend: f.user_a_id === userId ? f.profile_b : f.profile_a,
  })) as FriendshipWithProfile[]
}
