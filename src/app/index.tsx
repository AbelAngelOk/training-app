import { Redirect } from 'expo-router'

import { useAuthStore } from '@/stores/auth-store'

export default function Index() {
  const { session, initialized } = useAuthStore()

  if (!initialized) return null

  if (session) {
    return <Redirect href="/(tabs)/training" />
  }

  return <Redirect href="/(auth)/welcome" />
}
