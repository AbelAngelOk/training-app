import { supabase } from '@/lib/supabase'
import type { FriendshipRow } from '@/types/database'

export async function acceptFriendRequest(requestId: string): Promise<FriendshipRow> {
  const { data, error } = await supabase.functions.invoke('accept-friend-request', {
    body: { request_id: requestId },
  })

  if (error) throw error
  if (!data.success) throw new Error(data.error ?? 'Failed to accept friend request')

  return data.data as FriendshipRow
}
