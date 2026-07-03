import { supabase } from '@/lib/supabase'
import type { SubscriptionPlanRow, UserSubscriptionRow } from '@/types/database'

export type UserSubscriptionWithPlan = UserSubscriptionRow & {
  subscription_plans: SubscriptionPlanRow
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlanRow[]> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('active', true)
    .order('duration_months')
  if (error) throw error
  return data
}

export async function getActiveUserSubscription(
  userId: string
): Promise<UserSubscriptionWithPlan | null> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*, subscription_plans (*)')
    .eq('user_id', userId)
    .in('status', ['active', 'grace_period'])
    .order('expires_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as UserSubscriptionWithPlan | null
}
