import { useEffect, useMemo, useRef, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useSession, useUpdateSessionExercise } from '@/hooks/use-sessions'
import { useActiveWorkout, useSessionHistory, useStartWorkout } from '@/hooks/use-workouts'
import { createExerciseExecution } from '@/api/workouts'
import { useActiveWorkoutStore } from '@/stores/active-workout-store'
import {
  ExerciseTargetCard,
  type TargetPayload,
} from '@/components/training/execution/ExerciseTargetCard'
import { BumpTargetsModal, type BumpDeltas } from '@/components/training/execution/BumpTargetsModal'
import { PrimaryButton } from '@/components/training/shared/PrimaryButton'
import { AlertModal } from '@/components/ui/AlertModal'
import { ExerciseAccordionSkeleton } from '@/components/training/skeletons/ExerciseAccordionSkeleton'
import type { WorkoutExecutionWithDetails } from '@/api/workouts'

const WEIGHT_BUMP = 5
const SETS_BUMP = 1
const REPS_BUMP = 2

export default function SessionPreviewScreen() {
  const { id, programId } = useLocalSearchParams<{ id: string; programId?: string }>()

  const { data: session, isLoading: isLoadingSession } = useSession(id ?? '')
  const { data: history, isLoading: isLoadingHistory } = useSessionHistory(id ?? '')
  const { data: activeWorkout } = useActiveWorkout()
  const startWorkout = useStartWorkout()
  const updateExercise = useUpdateSessionExercise(id ?? '')
  const begin = useActiveWorkoutStore((s) => s.begin)

  const [starting, setStarting] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [bumpModalVisible, setBumpModalVisible] = useState(false)
  const [alert, setAlert] = useState<{
    title: string
    message: string
    type: 'error' | 'info'
    onConfirm?: () => void
    buttonLabel?: string
  } | null>(null)

  const isLoading = isLoadingSession || isLoadingHistory

  const sessionExercises = useMemo(
    () =>
      [...(session?.session_exercises ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    [session]
  )

  // Official sessions are shared templates: RLS forbids editing their targets.
  // Programs assigned after the deep-copy change are always personal copies.
  const canEditTargets = session?.type === 'personal'

  const hasCompletedHistory = useMemo(
    () => (history ?? []).some((entry) => entry.status === 'completed'),
    [history]
  )

  // First time on this session: never configured targets via the wizard AND
  // never completed a workout (legacy sessions with real history skip the
  // wizard even if targets_configured_at is null, since it predates this
  // column). Checking hasCompletedHistory here — not just the marker — also
  // prevents a loop: finishing the wizard doesn't create any workout
  // execution, so relying on history alone would redirect back to setup
  // forever after "Guardar y comenzar".
  const redirectedToSetupRef = useRef(false)
  useEffect(() => {
    if (isLoading || redirectedToSetupRef.current) return
    if (canEditTargets && !session?.targets_configured_at && !hasCompletedHistory) {
      redirectedToSetupRef.current = true
      router.replace(`/(tabs)/training/session/${id}/setup?programId=${programId ?? ''}`)
    }
  }, [isLoading, canEditTargets, session, hasCompletedHistory, id, programId])

  // Already used before: offer to bump targets every time this screen is entered
  const bumpPromptShownRef = useRef(false)
  useEffect(() => {
    if (isLoading || bumpPromptShownRef.current) return
    if (canEditTargets && hasCompletedHistory) {
      bumpPromptShownRef.current = true
      setBumpModalVisible(true)
    }
  }, [isLoading, canEditTargets, hasCompletedHistory])

  const isResumable = activeWorkout?.training_session_id === id

  const hydrateFromActiveWorkout = (workout: WorkoutExecutionWithDetails) => {
    const exerciseExecutionIds: Record<string, string> = {}
    for (const exec of workout.workout_exercise_executions) {
      exerciseExecutionIds[exec.session_exercise_id] = exec.id
    }
    begin({
      executionId: workout.id,
      sessionId: workout.training_session_id,
      programId: programId ?? null,
      startedAt: workout.started_at,
      exerciseExecutionIds,
    })
  }

  const handleStart = async () => {
    if (!session) return

    if (activeWorkout) {
      if (isResumable) {
        hydrateFromActiveWorkout(activeWorkout)
        router.push(`/(tabs)/training/session/${id}/execute?programId=${programId ?? ''}`)
        return
      }
      setAlert({
        title: 'Entrenamiento en curso',
        message: `Ya tenés un entrenamiento en curso (${activeWorkout.training_sessions.name}). Continualo o cancelalo antes de iniciar otro.`,
        type: 'info',
        buttonLabel: 'Ir al entrenamiento',
        onConfirm: () => {
          setAlert(null)
          router.push(`/(tabs)/training/session/${activeWorkout.training_session_id}`)
        },
      })
      return
    }

    setStarting(true)
    try {
      const execution = await startWorkout.mutateAsync(session.id)

      const exerciseExecutionIds: Record<string, string> = {}
      for (const se of sessionExercises) {
        const exec = await createExerciseExecution({
          workout_execution_id: execution.id,
          session_exercise_id: se.id,
        })
        exerciseExecutionIds[se.id] = exec.id
      }

      begin({
        executionId: execution.id,
        sessionId: session.id,
        programId: programId ?? null,
        startedAt: execution.started_at,
        exerciseExecutionIds,
      })
      router.push(`/(tabs)/training/session/${id}/execute?programId=${programId ?? ''}`)
    } catch (err) {
      setAlert({
        title: 'No se pudo iniciar la sesión',
        message: err instanceof Error ? err.message : 'Intentá de nuevo en unos segundos.',
        type: 'error',
      })
    } finally {
      setStarting(false)
    }
  }

  const handleSaveTargets = (sessionExerciseId: string, payload: TargetPayload) => {
    updateExercise.mutate({ id: sessionExerciseId, ...payload })
  }

  const handleBumpManual = () => {
    setBumpModalVisible(false)
    setEditMode(true)
  }

  const handleBumpApply = async (deltas: BumpDeltas) => {
    setBumpModalVisible(false)
    try {
      await Promise.all(
        sessionExercises.map((se) => {
          const currentWeight = se.target_weight === null ? null : Number(se.target_weight)
          const payload: TargetPayload = {
            target_sets: deltas.sets ? (se.target_sets ?? 0) + SETS_BUMP : se.target_sets,
            target_reps: deltas.reps ? (se.target_reps ?? 0) + REPS_BUMP : se.target_reps,
            target_weight: deltas.weight
              ? currentWeight !== null
                ? currentWeight + WEIGHT_BUMP
                : null
              : currentWeight,
          }
          return updateExercise.mutateAsync({ id: se.id, ...payload })
        })
      )
    } catch (err) {
      setAlert({
        title: 'No se pudieron actualizar los objetivos',
        message: err instanceof Error ? err.message : 'Intentá de nuevo en unos segundos.',
        type: 'error',
      })
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <ExerciseAccordionSkeleton key={i} />
            ))}
        </ScrollView>
      </SafeAreaView>
    )
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.notFound}>Sesión no encontrada</Text>
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
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerMeta}>
          <Text style={styles.sessionName} numberOfLines={1}>
            {session.name}
          </Text>
          <Text style={styles.sessionSub}>
            {sessionExercises.length} ejercicios · {session.estimated_duration_minutes ?? 60} min
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerBtn}
          hitSlop={8}
          onPress={() => router.push(`/(tabs)/training/session/${id}/history`)}
        >
          <Ionicons name="stats-chart-outline" size={20} color={WolfTheme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Planificación de la sesión</Text>
          {canEditTargets && (
            <TouchableOpacity
              style={styles.editBtn}
              hitSlop={8}
              onPress={() => setEditMode((prev) => !prev)}
            >
              <Ionicons
                name={editMode ? 'checkmark-circle' : 'pencil-outline'}
                size={18}
                color={editMode ? WolfTheme.colors.success : WolfTheme.colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.sectionHint}>
          {!canEditTargets
            ? 'Esta sesión pertenece a una plantilla oficial. Reasigná el programa desde Explorar para poder editar tus objetivos.'
            : editMode
              ? 'Editá el peso, las series y las repeticiones objetivo de cada ejercicio.'
              : 'Series, repeticiones y peso objetivo para esta sesión. Tocá el lápiz para editarlos.'}
        </Text>

        {sessionExercises.map((se, index) => (
          <ExerciseTargetCard
            key={se.id}
            sessionExercise={se}
            index={index}
            editable={canEditTargets && editMode}
            onSaveTargets={(payload) => handleSaveTargets(se.id, payload)}
          />
        ))}

        <View style={styles.startSection}>
          <PrimaryButton
            label={isResumable ? 'Continuar sesión' : 'Iniciar sesión'}
            onPress={handleStart}
            loading={starting}
            size="lg"
          />
        </View>
      </ScrollView>

      <BumpTargetsModal
        visible={bumpModalVisible}
        onDismiss={() => setBumpModalVisible(false)}
        onManual={handleBumpManual}
        onApplyBump={handleBumpApply}
      />

      <AlertModal
        visible={!!alert}
        title={alert?.title ?? ''}
        message={alert?.message ?? ''}
        type={alert?.type ?? 'info'}
        buttonLabel={alert?.buttonLabel}
        onConfirm={alert?.onConfirm}
        onDismiss={() => setAlert(null)}
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
    borderBottomWidth: 1,
    borderBottomColor: WolfTheme.colors.border,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMeta: {
    flex: 1,
    gap: 2,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  sessionSub: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
  },
  scroll: {
    paddingHorizontal: WolfTheme.spacing.md,
    paddingTop: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  editBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHint: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
    lineHeight: 18,
  },
  startSection: {
    marginTop: WolfTheme.spacing.md,
    paddingBottom: WolfTheme.spacing.xl,
  },
})
