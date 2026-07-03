import { Redirect, Tabs } from 'expo-router'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useAuthStore } from '@/stores/auth-store'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

interface TabIconProps {
  name: IoniconsName
  activeName: IoniconsName
  focused: boolean
  size: number
}

function TabIcon({ name, activeName, focused, size }: TabIconProps) {
  return (
    <Ionicons
      name={focused ? activeName : name}
      size={size}
      color={focused ? WolfTheme.colors.primary : WolfTheme.colors.textSecondary}
    />
  )
}

export default function TabLayout() {
  const { session, initialized } = useAuthStore()
  const insets = useSafeAreaInsets()

  // Don't render anything until auth state is resolved
  if (!initialized) return null

  // Redirect unauthenticated users to the auth flow.
  // This also handles the automatic redirect after logout.
  if (!session) {
    return <Redirect href="/(auth)/welcome" />
  }

  // On Android with edge-to-edge enabled (default in RN 0.76+), the system
  // navigation bar is transparent and the app renders behind it. React Navigation
  // applies paddingBottom: insets.bottom automatically to push icons above the
  // nav bar. Adding insets.bottom to the total height ensures 64px of usable
  // content area regardless of whether the device uses gesture or button navigation.
  const tabBarHeight = Platform.OS === 'ios' ? 88 : 64 + insets.bottom

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: WolfTheme.colors.surface,
          borderTopColor: WolfTheme.colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          height: tabBarHeight,
        },
        tabBarActiveTintColor: WolfTheme.colors.primary,
        tabBarInactiveTintColor: WolfTheme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          paddingBottom: Platform.OS === 'ios' ? 0 : 6,
        },
      }}
    >
      <Tabs.Screen
        name="training"
        options={{
          title: 'Entrenamiento',
          tabBarIcon: ({ focused, size }) => (
            <TabIcon name="fitness-outline" activeName="fitness" focused={focused} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ focused, size }) => (
            <TabIcon name="compass-outline" activeName="compass" focused={focused} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="rankings"
        options={{
          title: 'Rankings',
          tabBarIcon: ({ focused, size }) => (
            <TabIcon name="trophy-outline" activeName="trophy" focused={focused} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, size }) => (
            <TabIcon name="person-outline" activeName="person" focused={focused} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}
