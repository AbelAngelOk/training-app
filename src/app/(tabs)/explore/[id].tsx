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
import { useProgram, useAssignProgram } from '@/hooks/use-programs'
import { AlertModal } from '@/components/ui/AlertModal'
import { SessionCard } from '@/components/training/cards/SessionCard'
import { WeekCalendar } from '@/components/training/shared/WeekCalendar'
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
  }>({
    visible: false,
    type: 'info' as 'success' | 'error',
    title: '',
    message: '',
  })

  const { data: program, isLoading } = useProgram(id || '')
  const { mutateAsync: assignProgram, isPending: isAssigning } = useAssignProgram()

  const handleAssignProgram = async () => {
    if (!id) return
    try {
      await assignProgram(id)
      setAlertModal({
        visible: true,
        type: 'success',
        title: '¡Listo!',
        message: 'Programa asignado correctamente. Podés verlo en tu pantalla de entrenamiento.',
      })
      setTimeout(() => {
        router.replace('/(tabs)/training')
      }, 1500)
    } catch (error) {
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
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="hourglass" size={40} color={WolfTheme.colors.textSecondary} />
          <Text style={styles.loadingText}>Cargando programa...</Text>
        </View>
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
    .map((pd: any) => ({
      id: pd.training_sessions.id,
      name: pd.training_sessions.name,
      muscleGroup: program.description || '',
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
    <>
      <AlertModal
        visible={alertModal.visible}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
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
                <View key={session.id} style={styles.sessionCardView}>
                  <Ionicons name={session.icon as any} size={20} color={WolfTheme.colors.primary} />
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionName}>{session.name}</Text>
                    <Text style={styles.sessionMeta}>
                      {session.estimatedMinutes} min • {session.exercises.length} ejercicios
                    </Text>
                  </View>
                </View>
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
              {isAssigning ? 'Asignando...' : 'Usar este programa'}
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
  sessionCardView: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    padding: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
  },
  sessionInfo: {
    flex: 1,
    gap: 2,
  },
  sessionName: {
    fontSize: 15,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  sessionMeta: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
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
