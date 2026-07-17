import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewToken,
} from 'react-native'
import { Redirect, router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useSession } from '@/hooks/use-sessions'
import {
  useActiveWorkout,
  useCancelWorkout,
  useCompleteWorkout,
  useLogSet,
  useUpdateSet,
} from '@/hooks/use-workouts'
import { useActiveWorkoutStore } from '@/stores/active-workout-store'
import { ExecutionExerciseCard } from '@/components/training/execution/ExecutionExerciseCard'
import { FinishSessionCard } from '@/components/training/execution/FinishSessionCard'
import { FinishIncompleteModal } from '@/components/training/execution/FinishIncompleteModal'
import { ConfirmExitModal } from '@/components/ui/ConfirmExitModal'
import { AlertModal } from '@/components/ui/AlertModal'
import type { ExecutionExercise, WorkoutSet } from '@/types/training'

const SYNC_DEBOUNCE_MS = 600
const FINISH_PAGE_KEY = '__finish__'

type Page = ExecutionExercise | typeof FINISH_PAGE_KEY

export default function WorkoutExecuteScreen() {
  const { id, programId } = useLocalSearchParams<{ id: string; programId?: string }>()
  const width = Dimensions.get('window').width

  const executionId = useActiveWorkoutStore((s) => s.executionId)
  const storeSessionId = useActiveWorkoutStore((s) => s.sessionId)
  const startedAt = useActiveWorkoutStore((s) => s.startedAt)
  const currentIndex = useActiveWorkoutStore((s) => s.currentIndex)
  const exerciseExecutionIds = useActiveWorkoutStore((s) => s.exerciseExecutionIds)
  const restEndsAt = useActiveWorkoutStore((s) => s.restEndsAt)
  const setCurrentIndex = useActiveWorkoutStore((s) => s.setCurrentIndex)
  const startRest = useActiveWorkoutStore((s) => s.startRest)
  const clearRest = useActiveWorkoutStore((s) => s.clearRest)
  const reset = useActiveWorkoutStore((s) => s.reset)

  const { data: session } = useSession(id ?? '')
  const { data: activeWorkout } = useActiveWorkout()
  const logSetMutation = useLogSet()
  const updateSetMutation = useUpdateSet()
  const completeWorkout = useCompleteWorkout()
  const cancelWorkout = useCancelWorkout()

  const [exercises, setExercises] = useState<ExecutionExercise[]>([])
  const [exitModalVisible, setExitModalVisible] = useState(false)
  const [finishIncompleteModalVisible, setFinishIncompleteModalVisible] = useState(false)
  const [errorAlert, setErrorAlert] = useState<string | null>(null)
  const [finishing, setFinishing] = useState(false)
  const [now, setNow] = useState(Date.now())

  const listRef = useRef<FlatList<Page>>(null)
  const initializedRef = useRef(false)
  const syncTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  // Rest finished on a fully-completed exercise -> advance to the next one
  const pendingAdvanceRef = useRef(false)

  // Derived stopwatch: survives remounts and backgrounding
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])
  const elapsedSeconds = startedAt
    ? Math.max(0, Math.floor((now - Date.parse(startedAt)) / 1000))
    : 0

  // Build local exercise state once from session targets + already-logged sets (resume)
  useEffect(() => {
    if (initializedRef.current || !session) return

    const loggedByExecution: Record<string, { setNumber: number; weight: number; reps: number; dbId: string }[]> = {}
    if (activeWorkout?.id === executionId) {
      for (const exec of activeWorkout.workout_exercise_executions) {
        loggedByExecution[exec.id] = exec.workout_sets.map((ws) => ({
          setNumber: ws.set_number,
          weight: Number(ws.weight ?? 0),
          reps: ws.reps ?? 0,
          dbId: ws.id,
        }))
      }
    }

    const sorted = [...session.session_exercises].sort((a, b) => a.sort_order - b.sort_order)
    const built: ExecutionExercise[] = sorted.map((se) => {
      const executionIdForExercise = exerciseExecutionIds[se.id] ?? null
      const logged = executionIdForExercise ? (loggedByExecution[executionIdForExercise] ?? []) : []
      const targetSets = se.target_sets ?? 3
      const setCount = Math.max(targetSets, logged.length)

      const sets: WorkoutSet[] = Array(setCount)
        .fill(null)
        .map((_, i) => {
          const loggedSet = logged.find((l) => l.setNumber === i + 1)
          if (loggedSet) {
            return {
              id: `${se.id}-s${i + 1}`,
              setNumber: i + 1,
              weight: loggedSet.weight,
              reps: loggedSet.reps,
              completed: true,
              dbId: loggedSet.dbId,
            }
          }
          return {
            id: `${se.id}-s${i + 1}`,
            setNumber: i + 1,
            weight: Number(se.target_weight ?? 0),
            reps: se.target_reps ?? 0,
            completed: false,
          }
        })

      return {
        sessionExerciseId: se.id,
        exerciseExecutionId: executionIdForExercise,
        name: se.exercises.name,
        muscleGroup: se.exercises.muscle_groups?.name ?? '',
        targetSets,
        targetReps: se.target_reps ?? 0,
        targetWeight: se.target_weight === null ? null : Number(se.target_weight),
        restSeconds: se.rest_seconds ?? 60,
        exercise: se.exercises,
        sets,
      }
    })

    setExercises(built)
    initializedRef.current = true
  }, [session, activeWorkout, executionId, exerciseExecutionIds])

  useEffect(() => {
    const timers = syncTimersRef.current
    return () => {
      Object.values(timers).forEach(clearTimeout)
    }
  }, [])

  const completedExercises = exercises.filter(
    (ex) => ex.sets.length > 0 && ex.sets.every((s) => s.completed)
  ).length

  // The pager appends one non-sticky "finish" page after the last exercise
  const pages = useMemo<Page[]>(() => [...exercises, FINISH_PAGE_KEY], [exercises])

  const scrollToNextIncomplete = useCallback(
    (fromIndex: number) => {
      const next = exercises.findIndex(
        (ex, i) => i > fromIndex && !ex.sets.every((s) => s.completed)
      )
      const target =
        next !== -1 ? next : exercises.findIndex((ex) => !ex.sets.every((s) => s.completed))
      if (target !== -1 && target !== fromIndex) {
        listRef.current?.scrollToIndex({ index: target, animated: true })
        setCurrentIndex(target)
      }
    },
    [exercises, setCurrentIndex]
  )

  const updateLocalSet = (exIndex: number, setIndex: number, patch: Partial<WorkoutSet>) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? { ...ex, sets: ex.sets.map((s, j) => (j === setIndex ? { ...s, ...patch } : s)) }
          : ex
      )
    )
  }

  /** Debounced DB sync for edits on an already-logged set */
  const scheduleSetSync = (dbId: string, weight: number, reps: number) => {
    if (syncTimersRef.current[dbId]) clearTimeout(syncTimersRef.current[dbId])
    syncTimersRef.current[dbId] = setTimeout(() => {
      updateSetMutation.mutate({ id: dbId, weight, reps })
      delete syncTimersRef.current[dbId]
    }, SYNC_DEBOUNCE_MS)
  }

  const handleWeightChange = (exIndex: number, setIndex: number, value: string) => {
    const weight = Number(value.replace(',', '.')) || 0
    updateLocalSet(exIndex, setIndex, { weight })
    const set = exercises[exIndex]?.sets[setIndex]
    if (set?.dbId) scheduleSetSync(set.dbId, weight, set.reps)
  }

  const handleRepsChange = (exIndex: number, setIndex: number, value: string) => {
    const reps = Number(value) || 0
    updateLocalSet(exIndex, setIndex, { reps })
    const set = exercises[exIndex]?.sets[setIndex]
    if (set?.dbId) scheduleSetSync(set.dbId, set.weight, reps)
  }

  const handleCompleteSet = async (exIndex: number, setIndex: number) => {
    const exercise = exercises[exIndex]
    const set = exercise?.sets[setIndex]
    // Logged sets are immutable history: no un-complete, edits sync via inputs
    if (!exercise || !set || set.completed) return

    if (!exercise.exerciseExecutionId) {
      setErrorAlert('No se encontró el registro del ejercicio. Salí y reanudá la sesión.')
      return
    }

    try {
      const logged = await logSetMutation.mutateAsync({
        workout_exercise_execution_id: exercise.exerciseExecutionId,
        set_number: set.setNumber ?? setIndex + 1,
        weight: set.weight,
        reps: set.reps,
      })
      updateLocalSet(exIndex, setIndex, { completed: true, dbId: logged.id })

      const isLastSet = exercise.sets.every((s, j) => j === setIndex || s.completed)
      pendingAdvanceRef.current = isLastSet
      startRest(exercise.restSeconds)
    } catch (err) {
      setErrorAlert(
        err instanceof Error ? err.message : 'No se pudo guardar la serie. Revisá tu conexión.'
      )
    }
  }

  const handleAddSet = (exIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIndex) return ex
        const nextNumber = ex.sets.length + 1
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              id: `${ex.sessionExerciseId}-s${nextNumber}`,
              setNumber: nextNumber,
              weight: ex.targetWeight ?? 0,
              reps: ex.targetReps,
              completed: false,
            },
          ],
        }
      })
    )
  }

  const handleRestFinished = useCallback(() => {
    clearRest()
    if (pendingAdvanceRef.current) {
      pendingAdvanceRef.current = false
      scrollToNextIncomplete(useActiveWorkoutStore.getState().currentIndex)
    }
  }, [clearRest, scrollToNextIncomplete])

  /** Actually completes the workout — no confirmation, called once the user's intent is clear */
  const performFinish = useCallback(async () => {
    if (!executionId || finishing) return
    setFinishing(true)
    try {
      await completeWorkout.mutateAsync(executionId)
      reset()
      router.replace(
        `/(tabs)/training/session/${id}/summary?executionId=${executionId}&programId=${programId ?? ''}`
      )
    } catch (err) {
      setErrorAlert(
        err instanceof Error ? err.message : 'No se pudo finalizar el entrenamiento.'
      )
    } finally {
      setFinishing(false)
    }
  }, [executionId, finishing, completeWorkout, reset, id, programId])

  /** "Finalizar sesión" button: confirms first if there are incomplete exercises */
  const handleFinishPress = () => {
    if (completedExercises < exercises.length) {
      setFinishIncompleteModalVisible(true)
      return
    }
    performFinish()
  }

  const handleConfirmFinishIncomplete = () => {
    setFinishIncompleteModalVisible(false)
    performFinish()
  }

  /** Exit modal's "finalizar incompleto" option: intent is already explicit, no extra confirm */
  const handleFinishIncompleteFromExit = () => {
    setExitModalVisible(false)
    performFinish()
  }

  const handleExitKeepProgress = () => {
    setExitModalVisible(false)
    reset()
    router.back()
  }

  const handleCancelWorkout = async () => {
    setExitModalVisible(false)
    if (executionId) {
      try {
        await cancelWorkout.mutateAsync(executionId)
      } catch {
        // Cancelling is best-effort: the workout stays resumable if it fails
      }
    }
    reset()
    router.back()
  }

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const visible = viewableItems.find((v) => v.isViewable)
      if (visible?.index != null) {
        useActiveWorkoutStore.getState().setCurrentIndex(visible.index)
      }
    }
  ).current

  // Guard: execution must have been started from the pre-session screen
  if (!executionId || storeSessionId !== id) {
    return <Redirect href={`/(tabs)/training/session/${id}?programId=${programId ?? ''}`} />
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setExitModalVisible(true)}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerMeta}>
          <Text style={styles.sessionName} numberOfLines={1}>
            {session?.name ?? 'Entrenamiento'}
          </Text>
        </View>
        {/* Page dots */}
        <View style={styles.dots}>
          {exercises.map((ex, i) => (
            <View
              key={ex.sessionExerciseId}
              style={[
                styles.dot,
                i === currentIndex && styles.dotActive,
                ex.sets.length > 0 && ex.sets.every((s) => s.completed) && styles.dotDone,
              ]}
            />
          ))}
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => (item === FINISH_PAGE_KEY ? FINISH_PAGE_KEY : item.sessionExerciseId)}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        initialScrollIndex={0}
        windowSize={3}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) =>
          item === FINISH_PAGE_KEY ? (
            <FinishSessionCard
              width={width}
              elapsedSeconds={elapsedSeconds}
              completedExercises={completedExercises}
              totalExercises={exercises.length}
              onFinish={handleFinishPress}
            />
          ) : (
            <ExecutionExerciseCard
              exercise={item}
              index={index}
              total={exercises.length}
              width={width}
              isActive={index === currentIndex}
              restEndsAt={restEndsAt}
              onWeightChange={(setIndex, value) => handleWeightChange(index, setIndex, value)}
              onRepsChange={(setIndex, value) => handleRepsChange(index, setIndex, value)}
              onCompleteSet={(setIndex) => handleCompleteSet(index, setIndex)}
              onAddSet={() => handleAddSet(index)}
              onRestDone={handleRestFinished}
              onSkipRest={handleRestFinished}
            />
          )
        }
      />

      <ConfirmExitModal
        visible={exitModalVisible}
        title="Salir del entrenamiento"
        message="Tus series ya están guardadas. Podés continuar más tarde o cancelar el entrenamiento definitivamente."
        saveLabel="Guardar y salir"
        exitLabel="Cancelar entrenamiento"
        cancelLabel="Seguir entrenando"
        onCancel={() => setExitModalVisible(false)}
        onExit={handleCancelWorkout}
        onSaveAndExit={handleExitKeepProgress}
        onFinishIncomplete={handleFinishIncompleteFromExit}
      />

      <FinishIncompleteModal
        visible={finishIncompleteModalVisible}
        onConfirm={handleConfirmFinishIncomplete}
        onCancel={() => setFinishIncompleteModalVisible(false)}
      />

      <AlertModal
        visible={!!errorAlert}
        title="Ocurrió un problema"
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.sm,
    gap: WolfTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: WolfTheme.colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMeta: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: WolfTheme.colors.surfaceLight,
  },
  dotActive: {
    backgroundColor: WolfTheme.colors.primary,
    width: 9,
    height: 9,
  },
  dotDone: {
    backgroundColor: WolfTheme.colors.success,
  },
})
