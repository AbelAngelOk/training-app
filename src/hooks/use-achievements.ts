import { useQuery } from '@tanstack/react-query'

import { getAchievements, getUserAchievements } from '@/api/achievements'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAuthStore } from '@/stores/auth-store'

export function useAchievements() {
  return useQuery({
    queryKey: QUERY_KEYS.ACHIEVEMENTS,
    queryFn: getAchievements,
    staleTime: Infinity,
  })
}

export function useUserAchievements() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: QUERY_KEYS.USER_ACHIEVEMENTS,
    queryFn: () => getUserAchievements(user!.id),
    enabled: !!user,
  })
}
