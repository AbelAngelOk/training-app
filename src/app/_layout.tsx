import { useEffect } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import * as SystemUI from 'expo-system-ui'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'

import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/auth-store'
import { WolfTheme } from '@/constants/colors'

SplashScreen.preventAutoHideAsync()

// Set the system background color once at module level so it takes effect
// before the first render. This prevents a white/grey flash behind the
// transparent Android navigation bar during startup and screen transitions.
SystemUI.setBackgroundColorAsync(WolfTheme.colors.background)

export default function RootLayout() {
  const { initialized, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  useEffect(() => {
    if (initialized) {
      SplashScreen.hideAsync()
    }
  }, [initialized])

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </GestureHandlerRootView>
    </QueryClientProvider>
  )
}
