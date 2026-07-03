import { Stack } from 'expo-router'

import { WolfTheme } from '@/constants/colors'

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: WolfTheme.colors.background },
        animation: 'fade',
      }}
    />
  )
}
