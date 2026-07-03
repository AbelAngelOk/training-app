import { useState } from 'react'
import { Alert, ActivityIndicator, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'

import { WolfTheme } from '@/constants/colors'
import { useAuthStore } from '@/stores/auth-store'
import { useUserStats } from '@/hooks/use-user'
import { useIsPremium } from '@/hooks/use-subscriptions'

interface StatCardProps {
  label: string
  value: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  testID?: string
}

function StatCard({ label, value, icon, testID }: StatCardProps) {
  return (
    <View testID={testID} style={statStyles.card}>
      <Ionicons name={icon} size={20} color={WolfTheme.colors.accent} />
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  )
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    padding: WolfTheme.spacing.md,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  label: {
    fontSize: 11,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
  },
})

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore()
  const isPremium = useIsPremium()
  const { data: stats } = useUserStats()
  const queryClient = useQueryClient()
  const [signingOut, setSigningOut] = useState(false)

  const displayName = user?.user_metadata?.display_name ?? 'Atleta'
  const totalHours = stats ? Math.floor(stats.total_training_seconds / 3600) : 0
  const totalWeightKg = stats ? Math.round(stats.total_weight_lifted) : 0

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true)
            try {
              // Clear all cached server data before invalidating the session
              queryClient.clear()
              await signOut()
              // Navigation is handled automatically by the tabs layout guard
              // which redirects to /(auth)/welcome when session becomes null
            } catch {
              setSigningOut(false)
              Alert.alert(
                'Error',
                'No se pudo cerrar sesión. Verificá tu conexión e intentá nuevamente.',
                [{ text: 'OK' }]
              )
            }
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View testID="profile-avatar" style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text testID="profile-display-name" style={styles.displayName}>{displayName}</Text>
          <View style={styles.badgeContainer}>
            <View
              testID="profile-subscription-badge"
              style={isPremium ? styles.premiumBadge : styles.freeBadge}
            >
              <Text style={isPremium ? styles.premiumBadgeText : styles.freeBadgeText}>
                {isPremium ? 'Premium' : 'Free'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsGrid}>
            <StatCard
              testID="profile-stats-hours"
              label="Horas"
              value={`${totalHours}h`}
              icon="time-outline"
            />
            <StatCard
              testID="profile-stats-sessions"
              label="Sesiones"
              value={`${stats?.total_workouts ?? 0}`}
              icon="barbell-outline"
            />
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              testID="profile-stats-weight"
              label="Peso levantado"
              value={`${totalWeightKg} kg`}
              icon="trending-up-outline"
            />
            <StatCard
              testID="profile-stats-streak"
              label="Racha"
              value={`${stats?.current_streak ?? 0} días`}
              icon="flame-outline"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity
              testID="profile-edit-button"
              style={styles.menuItem}
              onPress={() => router.push('/profile/edit')}
            >
              <Ionicons name="person-outline" size={20} color={WolfTheme.colors.textSecondary} />
              <Text style={styles.menuLabel}>Editar perfil</Text>
              <Ionicons name="chevron-forward" size={16} color={WolfTheme.colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              testID="profile-friends-button"
              style={styles.menuItem}
              onPress={() => router.push('/profile/friends')}
            >
              <Ionicons name="people-outline" size={20} color={WolfTheme.colors.textSecondary} />
              <Text style={styles.menuLabel}>Amigos</Text>
              <Ionicons name="chevron-forward" size={16} color={WolfTheme.colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              testID="profile-achievements-button"
              style={styles.menuItem}
              onPress={() => router.push('/profile/achievements')}
            >
              <Ionicons name="trophy-outline" size={20} color={WolfTheme.colors.textSecondary} />
              <Text style={styles.menuLabel}>Logros</Text>
              <Ionicons name="chevron-forward" size={16} color={WolfTheme.colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              testID="profile-subscription-button"
              style={styles.menuItem}
              onPress={() => router.push('/profile/subscription')}
            >
              <Ionicons name="star-outline" size={20} color={WolfTheme.colors.warning} />
              <Text style={[styles.menuLabel, { color: WolfTheme.colors.warning }]}>
                Suscripción Premium
              </Text>
              <Ionicons name="chevron-forward" size={16} color={WolfTheme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.menuCard}>
            <TouchableOpacity
              testID="profile-settings-button"
              style={styles.menuItem}
              onPress={() => router.push('/profile/settings')}
            >
              <Ionicons name="settings-outline" size={20} color={WolfTheme.colors.textSecondary} />
              <Text style={styles.menuLabel}>Configuración</Text>
              <Ionicons name="chevron-forward" size={16} color={WolfTheme.colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              testID="profile-personalization-button"
              style={styles.menuItem}
              onPress={() => router.push('/profile/personalization')}
            >
              <Ionicons
                name="color-palette-outline"
                size={20}
                color={WolfTheme.colors.textSecondary}
              />
              <Text style={styles.menuLabel}>Personalización</Text>
              <Ionicons name="chevron-forward" size={16} color={WolfTheme.colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              testID="profile-signout-button"
              style={styles.menuItem}
              onPress={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? (
                <>
                  <ActivityIndicator size="small" color={WolfTheme.colors.error} />
                  <Text style={[styles.menuLabel, { color: WolfTheme.colors.error }]}>
                    Cerrando sesión...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="log-out-outline" size={20} color={WolfTheme.colors.error} />
                  <Text style={[styles.menuLabel, { color: WolfTheme.colors.error }]}>
                    Cerrar sesión
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
  },
  scroll: {
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingBottom: WolfTheme.spacing.xl,
    gap: WolfTheme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: WolfTheme.spacing.lg,
    gap: WolfTheme.spacing.sm,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: WolfTheme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: WolfTheme.colors.primary,
  },
  displayName: {
    fontSize: WolfTheme.typography.h2.fontSize,
    fontWeight: WolfTheme.typography.h2.fontWeight,
    color: WolfTheme.colors.textPrimary,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  freeBadge: {
    backgroundColor: WolfTheme.colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: WolfTheme.spacing.sm,
    paddingVertical: 3,
  },
  freeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
  },
  premiumBadge: {
    backgroundColor: 'rgba(242,186,98,0.15)',
    borderRadius: 12,
    paddingHorizontal: WolfTheme.spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: WolfTheme.colors.warning,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: WolfTheme.colors.warning,
  },
  section: {
    gap: WolfTheme.spacing.sm,
  },
  sectionTitle: {
    fontSize: WolfTheme.typography.caption.fontSize,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: WolfTheme.spacing.sm,
  },
  menuCard: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: WolfTheme.typography.body.fontSize,
    color: WolfTheme.colors.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: WolfTheme.colors.border,
    marginLeft: WolfTheme.spacing.md + 20 + WolfTheme.spacing.md,
  },
})
