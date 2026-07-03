import { useQuery } from '@tanstack/react-query'

import { getFriendRankings, getRankings, type RankingScope } from '@/api/rankings'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAuthStore } from '@/stores/auth-store'
import type { RankingType } from '@/types/database'

export function useRankings(
  rankingType: RankingType,
  scope: RankingScope,
  filters?: { country?: string; province?: string; city?: string }
) {
  return useQuery({
    queryKey: QUERY_KEYS.RANKING(rankingType, scope),
    queryFn: () => getRankings(rankingType, scope, filters),
  })
}

export function useFriendRankings(rankingType: RankingType) {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: [...QUERY_KEYS.RANKINGS, 'friends', rankingType],
    queryFn: () => getFriendRankings(user!.id, rankingType),
    enabled: !!user,
  })
}
