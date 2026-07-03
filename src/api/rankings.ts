import { supabase } from '@/lib/supabase'
import type { RankingSnapshotRow, RankingType } from '@/types/database'

export type RankingEntry = RankingSnapshotRow & {
  user_profiles: { display_name: string; avatar_url: string | null }
}

export type RankingScope = 'global' | 'country' | 'province' | 'city'

export async function getRankings(
  rankingType: RankingType,
  scope: RankingScope,
  filters?: { country?: string; province?: string; city?: string },
  limit = 50
): Promise<RankingEntry[]> {
  let query = supabase
    .from('ranking_snapshots')
    .select('*, user_profiles ( display_name, avatar_url )')
    .eq('ranking_type', rankingType)
    .order('value', { ascending: false })
    .limit(limit)

  if (scope === 'country' && filters?.country) {
    query = query.eq('country', filters.country)
  } else if (scope === 'province' && filters?.province) {
    query = query.eq('province', filters.province)
  } else if (scope === 'city' && filters?.city) {
    query = query.eq('city', filters.city)
  }

  const { data, error } = await query
  if (error) throw error
  return data as RankingEntry[]
}

export async function getFriendRankings(
  userId: string,
  rankingType: RankingType
): Promise<RankingEntry[]> {
  const { data: friendships, error: friendError } = await supabase
    .from('friendships')
    .select('user_a_id, user_b_id')
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
  if (friendError) throw friendError

  const friendIds = friendships.map((f) =>
    f.user_a_id === userId ? f.user_b_id : f.user_a_id
  )
  const userIds = [userId, ...friendIds]

  const { data, error } = await supabase
    .from('ranking_snapshots')
    .select('*, user_profiles ( display_name, avatar_url )')
    .eq('ranking_type', rankingType)
    .in('user_id', userIds)
    .order('value', { ascending: false })
  if (error) throw error
  return data as RankingEntry[]
}
