import { useState } from 'react'
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'

import { WolfTheme } from '@/constants/colors'
import { supabase } from '@/lib/supabase'
import { useSetUserProgramActive, useUserProgramAssignments } from '@/hooks/use-programs'
import { SessionCard } from '@/components/training/cards/SessionCard'
import { WeekCalendar } from '@/components/training/shared/WeekCalendar'
import { ProgramDetailSkeleton } from '@/components/training/skeletons/ProgramDetailSkeleton'
import { AlertModal } from '@/components/ui/AlertModal'
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

async function getProgram(programId: string) {
  const { data, error } = await supabase
    .from('workout_programs')
    .select(`
      *,
      program_days (
        *,
        training_sessions (
          id,
          name,
          description,
          estimated_duration_minutes,
          session_exercises(count)
        )
      )
    `)
    .eq('id', programId)
    .single()

  if (error) throw error
  return data as any
}

export default function TrainingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data: program, isLoading } = useQuery({
    queryKey: ['program', id],
    queryFn: () => getProgram(id || ''),
    enabled: !!id,
  })

  const { data: assignments } = useUserProgramAssignments()
  const setActive = useSetUserProgramActive()
  const [menuVisible, setMenuVisible] = useState(false)
  const [errorAlert, setErrorAlert] = useState<string | null>(null)

  const assignment = assignments?.find((a) => a.workout_program_id === id)

  const handleDeactivate = async () => {
    setMenuVisible(false)
    if (!assignment) return
    try {
      await setActive.mutateAsync({ userProgramId: assignment.id, active: false })
      router.replace('/(tabs)/training')
    } catch {
      setErrorAlert('No se pudo desactivar el programa. Intentá de nuevo.')
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

  const weekdayToCode: Record<string, DayCode> = {
    monday: 'L',
    tuesday: 'M',
    wednesday: 'X',
    thursday: 'J',
    friday: 'V',
    saturday: 'S',
    sunday: 'D',
  }

  type SessionSummary = {
    id: string
    name: string
    dayCode: DayCode
    estimatedMinutes: number
    exerciseCount: number
  }

  const sessionMap: Partial<Record<DayCode, string>> = {}
  const sessions: SessionSummary[] = (program.program_days || []).map((pd: any) => ({
    id: pd.training_sessions.id,
    name: pd.training_sessions.name,
    dayCode: weekdayToCode[pd.weekday] as DayCode,
    estimatedMinutes: pd.training_sessions.estimated_duration_minutes || 60,
    exerciseCount: pd.training_sessions.session_exercises?.[0]?.count ?? 0,
  }))

  sessions.forEach((s) => {
    sessionMap[s.dayCode] = s.name.slice(0, 2)
  })

  const isPaused = program.active === false

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
        <TouchableOpacity style={styles.menuBtn} hitSlop={8} onPress={() => setMenuVisible(true)}>
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
          <Text style={styles.statValue}>{sessions.length}</Text>
          <Text style={styles.statLabel}>Sesiones</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Object.keys(sessionMap).length}</Text>
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
          <WeekCalendar activeDays={Object.keys(sessionMap) as DayCode[]} sessionMap={sessionMap} />
          <View style={styles.calendarLegend}>
            {sessions.map((s) => (
              <View key={s.id} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                <Text style={styles.legendDay}>{DAY_LABEL[s.dayCode]}</Text>
                <Text style={styles.legendName}>{s.name}</Text>
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
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={{
                  ...session,
                  muscleGroup: program.description || '',
                  icon: 'fitness-outline',
                  exercises: [],
                  exerciseCount: session.exerciseCount,
                  status: 'pending' as const,
                  scheduledDate: new Date(),
                }}
                onPress={() =>
                  router.push(`/(tabs)/training/session/${session.id}?programId=${program.id}`)
                }
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Program actions menu */}
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
            {assignment?.is_active && (
              <TouchableOpacity style={styles.menuOption} onPress={handleDeactivate}>
                <Ionicons name="pause-circle-outline" size={20} color={WolfTheme.colors.error} />
                <View style={styles.menuOptionMeta}>
                  <Text style={[styles.menuOptionText, { color: WolfTheme.colors.error }]}>
                    Desactivar programa
                  </Text>
                  <Text style={styles.menuOptionHint}>
                    Libera un cupo de tu plan; el historial se conserva
                  </Text>
                </View>
              </TouchableOpacity>
            )}
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
                <Text style={styles.menuOptionHint}>Activar o desactivar tus programas</Text>
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
    paddingBottom: WolfTheme.spacing.xxl,
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
})
