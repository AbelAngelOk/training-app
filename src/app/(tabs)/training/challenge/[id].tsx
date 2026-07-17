import { useState } from 'react'
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useActiveChallenges, useChallenge, useChallengeProgress } from '@/hooks/use-challenges'
import { useSetUserProgramActive } from '@/hooks/use-programs'
import { AlertModal } from '@/components/ui/AlertModal'
import { ProgramDetailSkeleton } from '@/components/training/skeletons/ProgramDetailSkeleton'

const CHALLENGE_COLOR = WolfTheme.colors.warning

/**
 * Detail screen for a challenge the user already has active — reached from
 * the training tab's "Retos activos" card. Separate from
 * explore/challenge/[id].tsx (which is for browsing/starting a new one):
 * this one has no "Comenzar reto" CTA (it would just re-trigger the plan
 * limit, since the challenge already occupies the active slot), instead it
 * lets you jump straight into any day's session and deactivate from here.
 */
export default function ActiveChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: challenge, isLoading } = useChallenge(id || '')
  const { data: activeChallenges } = useActiveChallenges()
  const setActive = useSetUserProgramActive()
  const [menuVisible, setMenuVisible] = useState(false)
  const [errorAlert, setErrorAlert] = useState<string | null>(null)

  const assignment = activeChallenges?.find((a) => a.workout_program_id === id)
  const sessionIds = challenge?.program_days.map((d) => d.training_sessions.id) ?? []
  const { data: completedSessionIds } = useChallengeProgress(sessionIds)
  const completedDays = completedSessionIds?.length ?? 0

  const handleDeactivate = async () => {
    setMenuVisible(false)
    if (!assignment) return
    try {
      await setActive.mutateAsync({ userProgramId: assignment.id, active: false })
      router.replace('/(tabs)/training')
    } catch {
      setErrorAlert('No se pudo desactivar el reto. Intentá de nuevo.')
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ProgramDetailSkeleton />
        </ScrollView>
      </SafeAreaView>
    )
  }

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.notFound}>Reto no encontrado</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerMeta}>
          <View style={styles.iconDot}>
            <Ionicons name="flame-outline" size={14} color={CHALLENGE_COLOR} />
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {challenge.name}
          </Text>
        </View>
        <TouchableOpacity style={styles.menuBtn} hitSlop={8} onPress={() => setMenuVisible(true)}>
          <Ionicons name="ellipsis-horizontal" size={22} color={WolfTheme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {completedDays}/{challenge.duration_days}
          </Text>
          <Text style={styles.statLabel}>Progreso</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{challenge.program_days.length}</Text>
          <Text style={styles.statLabel}>Sesiones</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {challenge.description && <Text style={styles.description}>{challenge.description}</Text>}

        {challenge.achievements && (
          <View style={styles.achievementCard}>
            <Ionicons name="trophy" size={28} color={CHALLENGE_COLOR} />
            <View style={styles.achievementMeta}>
              <Text style={styles.achievementLabel}>Logro al completar</Text>
              <Text style={styles.achievementName}>{challenge.achievements.name}</Text>
              {challenge.achievements.description && (
                <Text style={styles.achievementDescription}>
                  {challenge.achievements.description}
                </Text>
              )}
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Días del reto</Text>
        <View style={styles.daysList}>
          {challenge.program_days.map((day) => {
            const session = day.training_sessions
            const exercise = session.session_exercises[0]
            const isDone = completedSessionIds?.includes(session.id) ?? false
            return (
              <TouchableOpacity
                key={day.day_number}
                style={styles.dayRow}
                activeOpacity={0.8}
                onPress={() => router.push(`/(tabs)/training/session/${session.id}`)}
              >
                <View style={[styles.dayNumberBox, isDone && styles.dayNumberBoxDone]}>
                  {isDone ? (
                    <Ionicons name="checkmark" size={16} color={WolfTheme.colors.success} />
                  ) : (
                    <Text style={styles.dayNumberText}>{day.day_number}</Text>
                  )}
                </View>
                <View style={styles.dayMeta}>
                  <Text style={styles.dayName}>{session.name}</Text>
                  {exercise && (
                    <Text style={styles.dayDetail}>
                      {exercise.exercises.name} — {exercise.target_sets}×{exercise.target_reps}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={WolfTheme.colors.textSecondary} />
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      {/* Challenge actions menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuSheet}>
            <TouchableOpacity style={styles.menuOption} onPress={handleDeactivate}>
              <Ionicons name="pause-circle-outline" size={20} color={WolfTheme.colors.error} />
              <View style={styles.menuOptionMeta}>
                <Text style={[styles.menuOptionText, { color: WolfTheme.colors.error }]}>
                  Desactivar reto
                </Text>
                <Text style={styles.menuOptionHint}>
                  Libera un cupo de tu plan; el progreso se conserva
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setMenuVisible(false)
                router.push('/(tabs)/training/manage-programs')
              }}
            >
              <Ionicons name="albums-outline" size={20} color={WolfTheme.colors.textPrimary} />
              <View style={styles.menuOptionMeta}>
                <Text style={styles.menuOptionText}>Gestionar programas</Text>
                <Text style={styles.menuOptionHint}>Activar o desactivar tus programas y retos</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuOption, styles.menuCancel]}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.menuCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <AlertModal
        visible={!!errorAlert}
        title="Error"
        message={errorAlert ?? ''}
        type="error"
        onDismiss={() => setErrorAlert(null)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: WolfTheme.spacing.md,
  },
  notFound: {
    color: WolfTheme.colors.textPrimary,
    fontSize: 18,
  },
  backLink: {
    color: WolfTheme.colors.primary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
  },
  iconDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    flex: 1,
  },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: WolfTheme.colors.surface,
    marginHorizontal: WolfTheme.spacing.lg,
    marginBottom: WolfTheme.spacing.md,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    paddingVertical: WolfTheme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: WolfTheme.colors.border,
  },
  scroll: {
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingBottom: WolfTheme.spacing.xxl,
    gap: WolfTheme.spacing.lg,
  },
  description: {
    fontSize: 15,
    color: WolfTheme.colors.textSecondary,
    lineHeight: 22,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    borderRadius: WolfTheme.radius.card,
    padding: WolfTheme.spacing.md,
  },
  achievementMeta: {
    flex: 1,
    gap: 2,
  },
  achievementLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: CHALLENGE_COLOR,
    textTransform: 'uppercase',
  },
  achievementName: {
    fontSize: 15,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  achievementDescription: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  daysList: {
    gap: WolfTheme.spacing.sm,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    padding: WolfTheme.spacing.md,
  },
  dayNumberBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberBoxDone: {
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: CHALLENGE_COLOR,
  },
  dayMeta: {
    flex: 1,
    gap: 2,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  dayDetail: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: WolfTheme.colors.surface,
    borderTopLeftRadius: WolfTheme.radius.modal,
    borderTopRightRadius: WolfTheme.radius.modal,
    padding: WolfTheme.spacing.lg,
    paddingBottom: WolfTheme.spacing.xl,
    gap: WolfTheme.spacing.sm,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.md,
    paddingHorizontal: WolfTheme.spacing.sm,
  },
  menuOptionMeta: {
    flex: 1,
    gap: 2,
  },
  menuOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  menuOptionHint: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  menuCancel: {
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: WolfTheme.colors.border,
    marginTop: WolfTheme.spacing.xs,
  },
  menuCancelText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
  },
})
