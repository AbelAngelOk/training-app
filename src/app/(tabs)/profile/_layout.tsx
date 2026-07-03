import { Stack } from 'expo-router'

import { WolfTheme } from '@/constants/colors'

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: WolfTheme.colors.surface },
        headerTintColor: WolfTheme.colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="edit" options={{ title: 'Editar perfil' }} />
      <Stack.Screen name="friends" options={{ title: 'Amigos' }} />
      <Stack.Screen name="achievements" options={{ title: 'Logros' }} />
      <Stack.Screen name="subscription" options={{ title: 'Suscripción Premium' }} />
      <Stack.Screen name="settings" options={{ title: 'Configuración' }} />
      <Stack.Screen name="personalization" options={{ title: 'Personalización' }} />
    </Stack>
  )
}
