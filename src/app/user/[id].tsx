import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'

import { WolfTheme } from '@/constants/colors'
import { useAuthStore } from '@/stores/auth-store'
import { getUserPublicProfile } from '@/api/social'
import { getUserStats } from '@/api/users'
import { useSendFriendRequest } from '@/hooks/use-social'

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user: currentUser } = useAuthStore()
  const { mutate: sendRequest, isPending, isSuccess } = useSendFriendRequest()

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['public-profile', id],
    queryFn: () => getUserPublicProfile(id),
    enabled: !!id,
  })

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['public-stats', id],
    queryFn: () => getUserStats(id),
    enabled: !!id,
  })

  const isLoading = loadingProfile || loadingStats

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: true, title: '', headerStyle: { backgroundColor: WolfTheme.colors.surface }, headerTintColor: WolfTheme.colors.textPrimary, headerShadowVisible: false }} />
        <View style={styles.centered}>
          <ActivityIndicator color={WolfTheme.colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: true, title: '', headerStyle: { backgroundColor: WolfTheme.colors.surface }, headerTintColor: WolfTheme.colors.textPrimary, headerShadowVisible: false }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Usuario no encontrado</Text>
        </View>
      </SafeAreaView>
    )
  }

  const displayName = profile.display_name
  const totalHours = stats ? Math.floor(stats.total_training_seconds / 3600) : 0
  const isOwnProfile = currentUser?.id === id

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: profile.display_name,
          headerStyle: { backgroundColor: WolfTheme.colors.surface },
          headerTintColor: WolfTheme.colors.textPrimary,
          headerShadowVisible: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View testID="user-profile-avatar" style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text testID="user-profile-display-name" style={styles.displayName}>{displayName}</Text>
          {profile.tag && (
            <Text testID="user-profile-tag" style={styles.tag}>@{profile.tag}</Text>
          )}
          {!isOwnProfile && (
            isSuccess ? (
              <View testID="user-profile-request-sent-label" style={styles.sentBadge}>
                <Ionicons name="checkmark-circle" size={16} color={WolfTheme.colors.success} />
                <Text style={styles.sentText}>Solicitud enviada</Text>
              </View>
            ) : (
              <TouchableOpacity
                testID="user-profile-send-request-button"
                style={[styles.addButton, isPending && styles.buttonDisabled]}
                onPress={() => sendRequest(id)}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color={WolfTheme.colors.background} />
                ) : (
                  <>
                    <Ionicons name="person-add-outline" size={16} color={WolfTheme.colors.background} />
                    <Text style={styles.addButtonText}>Agregar amigo</Text>
                  </>
                )}
              </TouchableOpacity>
            )
          )}
        </View>

        <View style={styles.statsGrid}>
          {[
            { label: 'Horas', value: `${totalHours}h`, icon: 'time-outline' as const },
            { label: 'Sesiones', value: `${stats?.total_workouts ?? 0}`, icon: 'barbell-outline' as const },
            { label: 'Peso levantado', value: `${Math.round(stats?.total_weight_lifted ?? 0)} kg`, icon: 'trending-up-outline' as const },
            { label: 'Racha', value: `${stats?.current_streak ?? 0}`, icon: 'flame-outline' as const },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon} size={20} color={WolfTheme.colors.accent} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
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
  tag: {
    fontSize: 14,
    color: WolfTheme.colors.textSecondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.xs,
    backgroundColor: WolfTheme.colors.primary,
    borderRadius: WolfTheme.radius.button,
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingVertical: WolfTheme.spacing.sm,
    marginTop: WolfTheme.spacing.sm,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.background,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  sentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.xs,
    marginTop: WolfTheme.spacing.sm,
  },
  sentText: {
    fontSize: 14,
    color: WolfTheme.colors.success,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WolfTheme.spacing.sm,
  },
  statCard: {
    width: '47%',
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    padding: WolfTheme.spacing.md,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: WolfTheme.typography.body.fontSize,
    color: WolfTheme.colors.textSecondary,
  },
})