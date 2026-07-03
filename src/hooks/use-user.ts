import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createUserProfile,
  getUserProfile,
  getUserStats,
  updateUserProfile,
} from '@/api/users'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAuthStore } from '@/stores/auth-store'

export function useUserProfile() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: QUERY_KEYS.USER_PROFILE,
    queryFn: () => getUserProfile(user!.id),
    enabled: !!user,
  })
}

export function useUserStats() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: QUERY_KEYS.USER_STATS,
    queryFn: () => getUserStats(user!.id),
    enabled: !!user,
  })
}

export function useCreateUserProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE })
    },
  })
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateUserProfile>[1]) =>
      updateUserProfile(user!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE })
    },
  })
}
