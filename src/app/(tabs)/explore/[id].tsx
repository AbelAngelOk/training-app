import { useState } from 'react'
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
import { useProgramWithExercises, useAssignProgram } from '@/hooks/use-programs'
import { useProgramLimits } from '@/hooks/use-program-limits'
import { useAppLanguage } from '@/hooks/use-app-language'
import { getLocalizedText } from '@/lib/i18n'
import { ProgramLimitError } from '@/api/programs'
import { AlertModal } from '@/components/ui/AlertModal'
import { SessionAccordion } from '@/components/training/cards/SessionAccordion'
import { WeekCalendar } from '@/components/training/shared/WeekCalendar'
import { ProgramDetailSkeleton } from '@/components/training/skeletons/ProgramDetailSkeleton'
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

export default function ExploreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [alertModal, setAlertModal] = useState<{
    visible: boolean
    type: 'success' | 'error'
    title: string
    message: string
    ctaLabel?: string
    onCta?: () => void
  }>({
    visible: false,
    type: 'info' as 'success' | 'error',
    title: '',
    message: '',
  })

  const language = useAppLanguage()
  const { data: program, isLoading } = useProgramWithExercises(id || '')
  const { mutateAsync: assignProgram, isPending: isAssigning } = useAssignProgram()
  const { canActivate, maxAllowed, isPremium } = useProgramLimits('program')

  const showLimitAlert = () => {
    setAlertModal({
      visible: true,
      type: 'error',
      title: 'Límite de programas alcanzado',
      message: isPremium
        ? `Tu plan premium permite hasta ${maxAllowed} programas activos. Desactivá uno desde "Mis programas" para usar este.`
        : 'Tu plan free permite 1 programa activo. Desactivá el actual desde "Mis programas" para usar este, o pasate a premium para tener hasta 3.',
      ctaLabel: 'Ir a Mis programas',
      onCta: () => {
        setAlertModal((prev) => ({ ...prev, visible: false }))
        router.push('/(tabs)/training/manage-programs')
      },
    })
  }

  const handleAssignProgram = async () => {
    if (!id) return
    if (!canActivate) {
      showLimitAlert()
      return
    }
    try {
      await assignProgram(id)
      setAlertModal({
        visible: true,
        type: 'success',
        title: '¡Listo!',
        message: 'Programa asignado correctamente. Podés verlo en tu pantalla de entrenamiento.',
      })
      setTimeout(() => {
        // Reset the explore stack back to its index first — otherwise the
        // next time the user taps the "Explorar" tab, it resumes right here
        // (this program's detail screen) instead of showing the explore list.
        router.dismissAll()
        router.replace('/(tabs)/training')
      }, 1500)
    } catch (error) {
      if (error instanceof ProgramLimitError) {
        showLimitAlert()
        return
      }
      console.error('Error assigning program:', error)
      setAlertModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo asignar el programa. Intentá nuevamente.',
      })
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

  const programDays = program.program_days || []
  const weeklyDays = programDays.map((pd: any) => weekdayToCode[pd.weekday] || 'L') as DayCode[]

  const sessionMap: Partial<Record<DayCode, string>> = {}
  programDays.forEach((pd: any) => {
    const dayCode = weekdayToCode[pd.weekday]
    if (pd.training_sessions) {
      sessionMap[dayCode] = pd.training_sessions.name.slice(0, 2)
    }
  })

  const sessions: Session[] = programDays
    .map((pd: any) => {
      const sessionExercises = pd.training_sessions.session_exercises ?? []
      return {
        id: pd.training_sessions.id,
        name: pd.training_sessions.name,
        muscleGroup: program.description || '',
        dayCode: weekdayToCode[pd.weekday] as DayCode,
        icon: 'fitness-outline',
        estimatedMinutes: pd.training_sessions.estimated_duration_minutes || 60,
        exercises: sessionExercises.map((se: any) => ({
          id: se.id,
          name: getLocalizedText(se.exercises.name_es, se.exercises.name_en, language),
          muscleGroup: (se.exercises.muscle_groups ?? [])
            .map((mg: { name_es: string; name_en: string }) => getLocalizedText(mg.name_es, mg.name_en, language))
            .join(', '),
          targetSets: se.target_sets ?? 3,
          targetReps: se.target_reps ?? 10,
          restSeconds: se.rest_seconds ?? 60,
          lastWeight: 0,
          lastReps: 0,
          sets: [],
        })),
        exerciseCount: sessionExercises.length,
        status: 'pending' as const,
        scheduledDate: new Date(),
      }
    })
    .sort((a, b) => {
      const dayOrder = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
      return dayOrder.indexOf(a.dayCode) - dayOrder.indexOf(b.dayCode)
    })

  return (
    <>
      <AlertModal
        visible={alertModal.visible}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        buttonLabel={alertModal.ctaLabel}
        onConfirm={alertModal.onCta}
        onDismiss={() => setAlertModal({ ...alertModal, visible: false })}
      />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={WolfTheme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerMeta}>
            <View style={[styles.colorDot, { backgroundColor: '#8B5CF6' }]} />
            <Text style={styles.headerTitle} numberOfLines={1}>
              {program.name}
            </Text>
          </View>
          <View style={{ width: 40 }} />
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
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Description */}
          {program.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.description}>{program.description}</Text>
            </View>
          )}

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
                </View>
              ))}
            </View>
          </View>

          {/* Sessions section */}
          <View style={styles.sessionsSection}>
            <Text style={styles.sectionTitle}>Sesiones incluidas</Text>
            <View style={styles.sessionsList}>
              {sessions.map((session) => (
                <SessionAccordion key={session.id} session={session} />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Assign button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.assignButton, isAssigning && styles.buttonDisabled]}
            onPress={handleAssignProgram}
            disabled={isAssigning}
          >
            <Text style={styles.assignButtonText}>
              {isAssigning ? 'Suscribiendo...' : 'Suscribirme al programa'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
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
  loadingText: {
    color: WolfTheme.colors.textSecondary,
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
  descriptionSection: {
    gap: WolfTheme.spacing.md,
  },
  description: {
    fontSize: 15,
    color: WolfTheme.colors.textSecondary,
    lineHeight: 22,
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
  assignButton: {
    backgroundColor: WolfTheme.colors.primary,
    borderRadius: WolfTheme.radius.button,
    paddingVertical: WolfTheme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  assignButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
})
