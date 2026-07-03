import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getFriends, getPendingFriendRequests, sendFriendRequest } from '@/api/social'
import { QUERY_KEYS } from '@/constants/query-keys'
import { acceptFriendRequest } from '@/services/friendship-service'
import { useAuthStore } from '@/stores/auth-store'

export function useFriends() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: QUERY_KEYS.FRIENDS,
    queryFn: () => getFriends(user!.id),
    enabled: !!user,
  })
}

export function usePendingFriendRequests() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: QUERY_KEYS.FRIEND_REQUESTS,
    queryFn: () => getPendingFriendRequests(user!.id),
    enabled: !!user,
  })
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: (receiverId: string) => sendFriendRequest(user!.id, receiverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FRIEND_REQUESTS })
    },
  })
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) => acceptFriendRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FRIEND_REQUESTS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FRIENDS })
    },
  })
}

export function useRejectFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) =>
      import('@/api/social').then(({ updateFriendRequestStatus }) =>
        updateFriendRequestStatus(requestId, 'rejected')
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FRIEND_REQUESTS })
    },
  })
}
