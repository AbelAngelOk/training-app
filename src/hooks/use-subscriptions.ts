import { useQuery } from '@tanstack/react-query'

import { getActiveUserSubscription, getSubscriptionPlans } from '@/api/subscriptions'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAuthStore } from '@/stores/auth-store'

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER_SUBSCRIPTION, 'plans'],
    queryFn: getSubscriptionPlans,
    staleTime: 10 * 60 * 1000,
  })
}

export function useActiveSubscription() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: QUERY_KEYS.USER_SUBSCRIPTION,
    queryFn: () => getActiveUserSubscription(user!.id),
    enabled: !!user,
  })
}

export function useIsPremium() {
  const { data: subscription } = useActiveSubscription()
  return !!subscription && (subscription.status === 'active' || subscription.status === 'grace_period')
}
