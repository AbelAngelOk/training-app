import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
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
import { useOfficialPrograms, useActiveUserProgram } from '@/hooks/use-programs'
import { SessionCard } from '@/components/training/cards/SessionCard'
import { WeekCalendar } from '@/components/training/shared/WeekCalendar'
import { SearchInput } from '@/components/training/shared/SearchInput'
import { SectionTitle } from '@/components/training/shared/SectionTitle'
import type { DayCode, Session } from '@/types/training'

const DAY_LABEL: Record<DayCode, string> = {
  L: 'L',
  M: 'M',
  X: 'X',
  J: 'J',
  V: 'V',
  S: 'S',
  D: 'D',
}

const weekdayToCode: Record<string, DayCode> = {
  monday: 'L',
  tuesday: 'M',
  wednesday: 'X',
  thursday: 'J',
  friday: 'V',
  saturday: 'S',
  sunday: 'D',
}

export default function TrainingListScreen() {
  const [search, setSearch] = useState('')

  const { data: activeUserProgram, isLoading: isLoadingActive } = useActiveUserProgram()
  const { data: allPrograms, isLoading: isLoadingPrograms } = useOfficialPrograms()

  const filtered = (allPrograms ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  // Show loading while checking for active program
  if (isLoadingActive) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={WolfTheme.colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  // If there's an active program, show it as the main view
  const activeProgram = activeUserProgram?.workout_programs
  if (activeProgram) {
    const programDays = activeUserProgram?.workout_programs?.program_days || []
    const weeklyDays = programDays.map((pd: any) => weekdayToCode[pd.weekday] || 'L') as DayCode[]

    const sessionMap: Partial<Record<DayCode, string>> = {}
    programDays.forEach((pd: any) => {
      const dayCode = weekdayToCode[pd.weekday]
      if (pd.training_sessions) {
        sessionMap[dayCode] = pd.training_sessions.name.slice(0, 2)
      }
    })

    const sessions: Session[] = programDays
      .map((pd: any, idx: number) => ({
        id: pd.training_sessions.id,
        name: pd.training_sessions.name,
        muscleGroup: activeProgram.description || '',
        dayCode: weekdayToCode[pd.weekday] as DayCode,
        icon: 'fitness-outline',
        estimatedMinutes: pd.training_sessions.estimated_duration_minutes || 60,
        exercises: [],
        status: 'pending' as const,
        scheduledDate: new Date(),
      }))
      .sort((a, b) => {
        const dayOrder = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
        return dayOrder.indexOf(a.dayCode) - dayOrder.indexOf(b.dayCode)
      })

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Custom header */}
        <View style={styles.header}>
          <View style={styles.headerMeta}>
            <View style={[styles.colorDot, { backgroundColor: '#8B5CF6' }]} />
            <Text style={styles.headerTitle} numberOfLines={1}>
              {activeProgram.name}
            </Text>
          </View>
          <TouchableOpacity style={styles.menuBtn} hitSlop={8}>
            <Ionicons name="ellipsis-horizontal" size={22} color={WolfTheme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{sessions.length}</Text>
            <Text style={styles.statLabel}>Sesiones</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{weeklyDays.length}</Text>
            <Text style={styles.statLabel}>Días/semana</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0/{sessions.length}</Text>
            <Text style={styles.statLabel}>Esta semana</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Calendar section */}
          <View style={styles.calendarSection}>
            <Text style={styles.sectionTitle}>Calendario de entrenamientos</Text>
            <WeekCalendar activeDays={weeklyDays} sessionMap={sessionMap} />
            <View style={styles.calendarLegend}>
              {sessions.map((s) => (
                <View key={s.id} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                  <Text style={styles.legendDay}>{DAY_LABEL[s.dayCode]}</Text>
                  <Text style={styles.legendName}>{s.name}</Text>
                  <Text style={styles.legendMuscle}>— {s.muscleGroup}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Sessions section */}
          <View style={styles.sessionsSection}>
            <Text style={styles.sectionTitle}>Sesiones</Text>
            <View style={styles.sessionsList}>
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onPress={() =>
                    router.push(
                      `/(tabs)/training/session/${session.id}?programId=${activeProgram.id}`
                    )
                  }
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // No active program - show empty state with options
  if (isLoadingPrograms) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={WolfTheme.colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollEmpty}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Empty state */}
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIcon}>
            <Ionicons name="barbell-outline" size={64} color={WolfTheme.colors.primary} />
          </View>

          <Text style={styles.emptyStateTitle}>Sin programa activo</Text>

          <Text style={styles.emptyStateDescription}>
            Para comenzar a entrenar, debes seleccionar o crear un programa de entrenamiento personalizado.
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

          {/* Secondary action - Create program */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(tabs)/training/create-program')}
            activeOpacity={0.85}
          >
            <Ionicons name="add-outline" size={20} color={WolfTheme.colors.primary} />
            <Text style={styles.secondaryButtonText}>Crear programa</Text>
          </TouchableOpacity>
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
    paddingBottom: WolfTheme.spacing.xxl,
    gap: WolfTheme.spacing.lg,
    paddingTop: WolfTheme.spacing.md,
  },
  scrollEmpty: {
    flexGrow: 1,
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingBottom: WolfTheme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  headerMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  calendarSection: {
    gap: WolfTheme.spacing.md,
  },
  calendarLegend: {
    gap: WolfTheme.spacing.sm,
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    padding: WolfTheme.spacing.md,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDay: {
    width: 20,
    fontSize: 14,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  legendName: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  legendMuscle: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
    flex: 1,
  },
  sessionsSection: {
    gap: WolfTheme.spacing.md,
  },
  sessionsList: {
    gap: WolfTheme.spacing.md,
  },
  title: {
    fontSize: WolfTheme.typography.h2.fontSize,
    fontWeight: WolfTheme.typography.h2.fontWeight,
    color: WolfTheme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
    marginTop: 2,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: WolfTheme.colors.primary,
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.sm,
    borderRadius: WolfTheme.radius.button,
    minHeight: 44,
  },
  newBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    gap: WolfTheme.spacing.md,
  },
  cards: {
    gap: WolfTheme.spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: WolfTheme.spacing.xxl,
    gap: WolfTheme.spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  programCardWrapper: {
    overflow: 'hidden',
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
