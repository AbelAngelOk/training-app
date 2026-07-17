import { useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useActiveUserPrograms } from '@/hooks/use-programs'
import { useActiveChallenges, useChallengeProgress } from '@/hooks/use-challenges'
import { useActiveWorkout } from '@/hooks/use-workouts'
import { useTrainingCommitments } from '@/hooks/use-training-calendar'
import { ProgramCardSkeleton } from '@/components/training/skeletons/ProgramCardSkeleton'
import { MonthCalendar } from '@/components/training/shared/MonthCalendar'
import type { ActiveProgram } from '@/api/programs'
import type { ActiveChallenge } from '@/api/challenges'

const CHALLENGE_COLOR = WolfTheme.colors.warning

function ActiveProgramCard({ assignment }: { assignment: ActiveProgram }) {
  const program = assignment.workout_programs
  const daysPerWeek = program.program_days?.length ?? 0

  return (
    <TouchableOpacity
      style={styles.programCard}
      activeOpacity={0.85}
      onPress={() => router.push(`/(tabs)/training/${program.id}`)}
    >
      <View style={styles.programIcon}>
        <Ionicons name="barbell-outline" size={24} color={WolfTheme.colors.primary} />
      </View>
      <View style={styles.programCardContent}>
        <Text style={styles.programName} numberOfLines={1}>
          {program.name}
        </Text>
        {program.description ? (
          <Text style={styles.programDescription} numberOfLines={2}>
            {program.description}
          </Text>
        ) : null}
        <View style={styles.programMetaRow}>
          <View style={styles.programMetaBadge}>
            <Ionicons name="calendar-outline" size={12} color={WolfTheme.colors.textSecondary} />
            <Text style={styles.programMetaText}>{daysPerWeek} días/semana</Text>
          </View>
          <View style={[styles.programMetaBadge, styles.activeBadge]}>
            <View style={styles.activeDot} />
            <Text style={[styles.programMetaText, styles.activeText]}>Activo</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={WolfTheme.colors.textSecondary} />
    </TouchableOpacity>
  )
}

function ActiveChallengeCard({ assignment }: { assignment: ActiveChallenge }) {
  const challenge = assignment.workout_programs
  const sessionIds = challenge.program_days.map((d) => d.training_session_id)
  const { data: completedSessionIds } = useChallengeProgress(sessionIds)
  const completedDays = completedSessionIds?.length ?? 0

  return (
    <TouchableOpacity
      style={styles.challengeCard}
      activeOpacity={0.85}
      onPress={() => router.push(`/(tabs)/training/challenge/${challenge.id}`)}
    >
      <View style={styles.challengeIcon}>
        <Ionicons name="flame-outline" size={24} color={CHALLENGE_COLOR} />
      </View>
      <View style={styles.programCardContent}>
        <Text style={styles.programName} numberOfLines={1}>
          {challenge.name}
        </Text>
        <View style={styles.programMetaRow}>
          <View style={[styles.programMetaBadge, styles.challengeBadge]}>
            <Ionicons name="checkmark-done-outline" size={12} color={CHALLENGE_COLOR} />
            <Text style={[styles.programMetaText, styles.challengeText]}>
              {completedDays}/{challenge.duration_days} días
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={WolfTheme.colors.textSecondary} />
    </TouchableOpacity>
  )
}

export default function TrainingListScreen() {
  const { data: activePrograms, isLoading } = useActiveUserPrograms()
  const { data: activeChallenges } = useActiveChallenges()
  const { data: activeWorkout } = useActiveWorkout()
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const { data: commitments } = useTrainingCommitments(calendarMonth)

  const resumeBanner = activeWorkout ? (
    <TouchableOpacity
      style={styles.resumeBanner}
      activeOpacity={0.85}
      onPress={() =>
        router.push(`/(tabs)/training/session/${activeWorkout.training_session_id}`)
      }
    >
      <View style={styles.resumeIcon}>
        <Ionicons name="play" size={18} color="#fff" />
      </View>
      <View style={styles.resumeMeta}>
        <Text style={styles.resumeTitle}>Entrenamiento en curso</Text>
        <Text style={styles.resumeSubtitle} numberOfLines={1}>
          {activeWorkout.training_sessions.name} — tocá para continuar
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={WolfTheme.colors.textSecondary} />
    </TouchableOpacity>
  ) : null

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.skeletonsContainer}>
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <ProgramCardSkeleton key={i} />
            ))}
        </View>
      </SafeAreaView>
    )
  }

  const hasPrograms = (activePrograms?.length ?? 0) > 0
  const hasChallenges = (activeChallenges?.length ?? 0) > 0
  const hasAnyCommitment = hasPrograms || hasChallenges

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerMeta}>
          <Text style={styles.title}>Entrenamiento</Text>
          <Text style={styles.subtitle}>
            {hasPrograms
              ? `${activePrograms!.length} programa${activePrograms!.length > 1 ? 's' : ''} activo${activePrograms!.length > 1 ? 's' : ''}`
              : 'Sin programas activos'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.manageBtn}
          hitSlop={8}
          onPress={() => router.push('/(tabs)/training/manage-programs')}
        >
          <Ionicons name="albums-outline" size={22} color={WolfTheme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={hasPrograms ? styles.scroll : styles.scrollEmpty}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {resumeBanner}

        {hasAnyCommitment && (
          <MonthCalendar
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            commitments={commitments ?? {}}
          />
        )}

        {hasChallenges && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Retos activos</Text>
            <View style={styles.cards}>
              {activeChallenges!.map((assignment) => (
                <ActiveChallengeCard key={assignment.id} assignment={assignment} />
              ))}
            </View>
          </View>
        )}

        {hasPrograms ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Programas</Text>
            <View style={styles.cards}>
              {activePrograms!.map((assignment) => (
                <ActiveProgramCard key={assignment.id} assignment={assignment} />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="barbell-outline" size={64} color={WolfTheme.colors.primary} />
            </View>

            <Text style={styles.emptyStateTitle}>Sin programa activo</Text>

            <Text style={styles.emptyStateDescription}>
              Para comenzar a entrenar, debes seleccionar o crear un programa de entrenamiento
              personalizado. Si desactivaste un programa, podés reactivarlo desde &quot;Mis programas&quot;.
            </Text>

            {/* Primary action - Explore programs */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(tabs)/explore')}
              activeOpacity={0.85}
            >
              <Ionicons name="compass-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Explorar programas</Text>
            </TouchableOpacity>

            {/* Secondary action - Manage programs */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(tabs)/training/manage-programs')}
              activeOpacity={0.85}
            >
              <Ionicons name="albums-outline" size={20} color={WolfTheme.colors.primary} />
              <Text style={styles.secondaryButtonText}>Mis programas</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingVertical: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  headerMeta: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: WolfTheme.typography.h2.fontSize,
    fontWeight: WolfTheme.typography.h2.fontWeight,
    color: WolfTheme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
  },
  manageBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingBottom: WolfTheme.spacing.xxl,
    gap: WolfTheme.spacing.md,
    paddingTop: WolfTheme.spacing.xs,
  },
  scrollEmpty: {
    flexGrow: 1,
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingBottom: WolfTheme.spacing.xxl,
    paddingTop: WolfTheme.spacing.xs,
    gap: WolfTheme.spacing.md,
  },
  section: {
    gap: WolfTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  cards: {
    gap: WolfTheme.spacing.md,
  },
  programCard: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    padding: WolfTheme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    gap: WolfTheme.spacing.md,
  },
  programIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: WolfTheme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  programCardContent: {
    flex: 1,
    gap: 4,
  },
  programName: {
    fontSize: 15,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  programDescription: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
  },
  programMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
    marginTop: 2,
  },
  programMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: WolfTheme.colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  programMetaText: {
    fontSize: 11,
    fontWeight: '500',
    color: WolfTheme.colors.textSecondary,
  },
  activeBadge: {
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: WolfTheme.colors.success,
  },
  activeText: {
    color: WolfTheme.colors.success,
  },
  challengeCard: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    padding: WolfTheme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    gap: WolfTheme.spacing.md,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeBadge: {
    backgroundColor: 'rgba(245,158,11,0.12)',
  },
  challengeText: {
    color: CHALLENGE_COLOR,
  },
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.35)',
    borderRadius: WolfTheme.radius.card,
    padding: WolfTheme.spacing.md,
  },
  resumeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: WolfTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeMeta: {
    flex: 1,
    gap: 2,
  },
  resumeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  resumeSubtitle: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
  },
  skeletonsContainer: {
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingVertical: WolfTheme.spacing.xl,
    gap: WolfTheme.spacing.md,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: WolfTheme.spacing.xxl,
    gap: WolfTheme.spacing.lg,
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: WolfTheme.colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 15,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: WolfTheme.spacing.sm,
    backgroundColor: WolfTheme.colors.primary,
    paddingHorizontal: WolfTheme.spacing.xl,
    paddingVertical: WolfTheme.spacing.md,
    borderRadius: WolfTheme.radius.button,
    minHeight: 48,
    width: '100%',
    marginTop: WolfTheme.spacing.md,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: WolfTheme.spacing.sm,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: WolfTheme.colors.primary,
    paddingHorizontal: WolfTheme.spacing.xl,
    paddingVertical: WolfTheme.spacing.md,
    borderRadius: WolfTheme.radius.button,
    minHeight: 48,
    width: '100%',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: WolfTheme.colors.primary,
  },
})
