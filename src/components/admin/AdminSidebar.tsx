import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, usePathname } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useAuthStore } from '@/stores/auth-store'

interface NavItem {
  href: string
  label: string
  icon: keyof typeof Ionicons.glyphMap
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: 'grid-outline' },
  { href: '/admin/exercises', label: 'Ejercicios', icon: 'barbell-outline' },
  { href: '/admin/programs', label: 'Programas', icon: 'calendar-outline' },
  { href: '/admin/challenges', label: 'Retos', icon: 'flame-outline' },
  { href: '/admin/sessions', label: 'Sesiones', icon: 'list-outline' },
  { href: '/admin/achievements', label: 'Logros', icon: 'trophy-outline' },
  { href: '/admin/muscle-groups', label: 'Grupos musculares', icon: 'body-outline' },
  { href: '/admin/equipment', label: 'Equipamiento', icon: 'construct-outline' },
  { href: '/admin/users', label: 'Usuarios', icon: 'people-outline' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const signOut = useAuthStore((s) => s.signOut)

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin</Text>

      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          return (
            <TouchableOpacity
              key={item.href}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => router.push(item.href as never)}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={active ? WolfTheme.colors.primary : WolfTheme.colors.textSecondary}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <TouchableOpacity
        style={styles.signOutBtn}
        onPress={async () => {
          await signOut()
          router.replace('/admin/login')
        }}
      >
        <Ionicons name="log-out-outline" size={18} color={WolfTheme.colors.error} />
        <Text style={styles.signOutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    backgroundColor: WolfTheme.colors.surface,
    borderRightWidth: 1,
    borderRightColor: WolfTheme.colors.border,
    paddingVertical: WolfTheme.spacing.lg,
    paddingHorizontal: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    paddingHorizontal: WolfTheme.spacing.sm,
  },
  nav: {
    flex: 1,
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
    paddingHorizontal: WolfTheme.spacing.sm,
    paddingVertical: 10,
    borderRadius: WolfTheme.radius.input,
  },
  navItemActive: {
    backgroundColor: 'rgba(139,92,246,0.12)',
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: WolfTheme.colors.textSecondary,
  },
  navLabelActive: {
    color: WolfTheme.colors.primary,
    fontWeight: '700',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
    paddingHorizontal: WolfTheme.spacing.sm,
    paddingVertical: 10,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.error,
  },
})
