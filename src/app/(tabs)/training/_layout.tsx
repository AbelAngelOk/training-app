import { Stack } from 'expo-router'

import { WolfTheme } from '@/constants/colors'

export default function TrainingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: WolfTheme.colors.background },
        headerTintColor: WolfTheme.colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: WolfTheme.colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create-program" options={{ title: 'Crear programa' }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="session/[id]" options={{ headerShown: false, gestureEnabled: false }} />
    </Stack>
  )
}
