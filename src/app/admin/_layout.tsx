import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native'
import { Redirect, Slot, router, usePathname } from 'expo-router'

import { WolfTheme } from '@/constants/colors'
import { useAuthStore } from '@/stores/auth-store'
import { useAdminRole } from '@/hooks/use-admin'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Button } from '@/components/ui/Button'

function AccessDenied() {
  const signOut = useAuthStore((s) => s.signOut)
  return (
    <View style={styles.center}>
      <Text style={styles.deniedTitle}>Acceso denegado</Text>
      <Text style={styles.deniedText}>Tu cuenta no tiene permisos de administrador.</Text>
      <Button
        label="Cerrar sesión"
        variant="ghost"
        onPress={async () => {
          await signOut()
          router.replace('/admin/login')
        }}
      />
    </View>
  )
}

export default function AdminLayout() {
  const pathname = usePathname()
  const { session, initialized } = useAuthStore()
  const { isAdmin, isLoading: loadingRole } = useAdminRole()

  // This portal only makes sense on web; a stray deep-link on native bails out.
  if (Platform.OS !== 'web') {
    return <Redirect href="/" />
  }

  const isLoginRoute = pathname === '/admin/login'

  if (isLoginRoute) {
    return <Slot />
  }

  if (!initialized) return null

  if (!session) {
    return <Redirect href="/admin/login" />
  }

  if (loadingRole) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={WolfTheme.colors.primary} />
      </View>
    )
  }

  if (!isAdmin) {
    return <AccessDenied />
  }

  return (
    <View style={styles.shell}>
      <AdminSidebar />
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: WolfTheme.colors.background,
  },
  content: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: WolfTheme.spacing.md,
    backgroundColor: WolfTheme.colors.background,
    padding: WolfTheme.spacing.lg,
  },
  deniedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  deniedText: {
    fontSize: 14,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
  },
})
