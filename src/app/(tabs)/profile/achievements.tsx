import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useAchievements, useUserAchievements } from '@/hooks/use-achievements'

export default function AchievementsScreen() {
  const { data: allAchievements, isLoading: loadingAll } = useAchievements()
  const { data: userAchievements, isLoading: loadingUser } = useUserAchievements()

  const isLoading = loadingAll || loadingUser

  const unlockedIds = new Set(userAchievements?.map((ua) => ua.achievement_id) ?? [])

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator color={WolfTheme.colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View testID="profile-achievements-list" style={styles.grid}>
          {(allAchievements ?? []).map((achievement) => {
            const unlocked = unlockedIds.has(achievement.id)
            const userAchievement = userAchievements?.find(
              (ua) => ua.achievement_id === achievement.id
            )
            return (
              <TouchableOpacity
                key={achievement.id}
                testID={unlocked ? 'profile-achievements-item-unlocked' : 'profile-achievements-item-locked'}
                style={[styles.card, !unlocked && styles.cardLocked]}
              >
                <View style={[styles.iconContainer, !unlocked && styles.iconContainerLocked]}>
                  <Ionicons
                    name="trophy"
                    size={28}
                    color={unlocked ? WolfTheme.colors.warning : WolfTheme.colors.textSecondary}
                  />
                </View>
                <Text style={[styles.achievementName, !unlocked && styles.textLocked]}>
                  {achievement.name}
                </Text>
                <Text style={styles.achievementDesc} numberOfLines={2}>
                  {achievement.description}
                </Text>
                {unlocked && userAchievement && (
                  <Text style={styles.unlockedDate}>
                    {new Date(userAchievement.unlocked_at).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                )}
                {!unlocked && (
                  <View style={styles.lockedBadge}>
                    <Ionicons name="lock-closed" size={10} color={WolfTheme.colors.textSecondary} />
                    <Text style={styles.lockedText}>Bloqueado</Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
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
    padding: WolfTheme.spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WolfTheme.spacing.md,
  },
  card: {
    width: '47%',
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    padding: WolfTheme.spacing.md,
    alignItems: 'center',
    gap: WolfTheme.spacing.xs,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
  },
  cardLocked: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(242,186,98,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: WolfTheme.spacing.xs,
  },
  iconContainerLocked: {
    backgroundColor: WolfTheme.colors.surfaceLight,
  },
  achievementName: {
    fontSize: 13,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
    textAlign: 'center',
  },
  textLocked: {
    color: WolfTheme.colors.textSecondary,
  },
  achievementDesc: {
    fontSize: 11,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  unlockedDate: {
    fontSize: 10,
    color: WolfTheme.colors.success,
    marginTop: 2,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  lockedText: {
    fontSize: 10,
    color: WolfTheme.colors.textSecondary,
  },
})
