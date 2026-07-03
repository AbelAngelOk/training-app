import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { MOCK_PROGRAMS } from '@/mock/programs'
import { SessionCard } from '@/components/training/cards/SessionCard'
import { WeekCalendar } from '@/components/training/shared/WeekCalendar'
import { PrimaryButton } from '@/components/training/shared/PrimaryButton'
import type { DayCode } from '@/types/training'

const DAY_LABEL: Record<DayCode, string> = {
  L: 'L',
  M: 'M',
  X: 'X',
  J: 'J',
  V: 'V',
  S: 'S',
  D: 'D',
}

export default function TrainingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const program = MOCK_PROGRAMS.find((p) => p.id === id)

  if (!program) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.notFound}>Programa no encontrado</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const sessionMap: Partial<Record<DayCode, string>> = {}
  program.sessions.forEach((s) => {
    sessionMap[s.dayCode] = s.name.slice(0, 2)
  })

  const isPaused = program.status === 'paused'

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerMeta}>
          <View style={[styles.colorDot, { backgroundColor: program.color }]} />
          <Text style={styles.headerTitle} numberOfLines={1}>{program.name}</Text>
        </View>
        <TouchableOpacity style={styles.menuBtn} hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={22} color={WolfTheme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Status badge */}
      {isPaused && (
        <View style={styles.pausedBanner}>
          <Ionicons name="pause-circle-outline" size={16} color={WolfTheme.colors.textSecondary} />
          <Text style={styles.pausedText}>Este programa está pausado</Text>
        </View>
      )}

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{program.sessions.length}</Text>
          <Text style={styles.statLabel}>Sesiones</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{program.weeklyDays.length}</Text>
          <Text style={styles.statLabel}>Días/semana</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{program.sessionsCompleted}/{program.sessionsTotal}</Text>
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
          <WeekCalendar activeDays={program.weeklyDays} sessionMap={sessionMap} />
          <View style={styles.calendarLegend}>
            {program.sessions.map((s) => (
              <View key={s.id} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: program.color }]} />
                <Text style={styles.legendDay}>{DAY_LABEL[s.dayCode]}</Text>
                <Text style={styles.legendName}>{s.name}</Text>
                <Text style={styles.legendMuscle}>— {s.muscleGroup}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Sessions section */}
        <View style={styles.sessionsSection}>
          <Text style={styles.sectionTitle}>
            {isPaused ? 'Sesiones incluidas' : 'Sesiones'}
          </Text>
          <View style={styles.sessionsList}>
            {program.sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onPress={() =>
                  router.push(`/(tabs)/training/session/${session.id}?programId=${program.id}`)
                }
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Start session CTA - hidden if paused */}
      {!isPaused && (
        <View style={styles.footer}>
          <PrimaryButton
            label="Iniciar sesión"
            onPress={() => {
              const first = program.sessions[0]
              if (first) {
                router.push(`/(tabs)/training/session/${first.id}?programId=${program.id}`)
              }
            }}
          />
        </View>
      )}
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
  pausedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
    marginHorizontal: WolfTheme.spacing.lg,
    marginBottom: WolfTheme.spacing.md,
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.sm,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    borderRadius: WolfTheme.radius.card,
  },
  pausedText: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
    fontWeight: '500',
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
    paddingBottom: 100,
    gap: WolfTheme.spacing.lg,
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: WolfTheme.colors.background,
    borderTopWidth: 1,
    borderTopColor: WolfTheme.colors.border,
    padding: WolfTheme.spacing.md,
    paddingBottom: WolfTheme.spacing.xl,
  },
})
