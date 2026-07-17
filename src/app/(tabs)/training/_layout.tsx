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
      <Stack.Screen name="manage-programs" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="session/[id]/index" options={{ headerShown: false }} />
      <Stack.Screen name="session/[id]/history" options={{ headerShown: false }} />
      <Stack.Screen
        name="session/[id]/setup"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="session/[id]/execute"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="session/[id]/summary"
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack>
  )
}
