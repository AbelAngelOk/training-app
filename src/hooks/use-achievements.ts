import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createAchievement,
  deleteAchievement,
  getAchievements,
  getAchievementUsage,
  getUserAchievements,
  updateAchievement,
  type AchievementPayload,
} from '@/api/achievements'
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

function useInvalidateAchievements() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACHIEVEMENTS })
}

export function useCreateAchievement() {
  const invalidate = useInvalidateAchievements()
  return useMutation({
    mutationFn: (payload: AchievementPayload) => createAchievement(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateAchievement() {
  const invalidate = useInvalidateAchievements()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<AchievementPayload>) =>
      updateAchievement(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteAchievement() {
  const invalidate = useInvalidateAchievements()
  return useMutation({
    mutationFn: (id: string) => deleteAchievement(id),
    onSuccess: invalidate,
  })
}

export function useAchievementUsage(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ACHIEVEMENTS, id, 'usage'],
    queryFn: () => getAchievementUsage(id),
    enabled: !!id,
  })
}
