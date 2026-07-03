import { useEffect, useRef, useState } from 'react'
import {
  Alert,
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
import { ExerciseAccordion } from '@/components/training/exercise/ExerciseAccordion'
import { BottomWorkoutBar } from '@/components/training/shared/BottomWorkoutBar'
import { ProgressHeader } from '@/components/training/shared/ProgressHeader'
import type { Exercise, WorkoutSet } from '@/types/training'

export default function WorkoutSessionScreen() {
  const { id, programId } = useLocalSearchParams<{ id: string; programId: string }>()

  const program = MOCK_PROGRAMS.find((p) => p.id === programId)
  const session = program?.sessions.find((s) => s.id === id)

  const [exercises, setExercises] = useState<Exercise[]>(session?.exercises ?? [])
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

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

  const completedExercises = exercises.filter(
    (ex) => ex.sets.length > 0 && ex.sets.every((s) => s.completed)
  ).length

  const handleSetsChange = (exerciseId: string, sets: WorkoutSet[]) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, sets } : ex))
    )
  }

  const handleFinish = () => {
    Alert.alert(
      'Finalizar sesión',
      `Completaste ${completedExercises} de ${exercises.length} ejercicios. ¿Querés guardar el entrenamiento?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          style: 'default',
          onPress: () => router.replace(`/(tabs)/training/${programId}`),
        },
      ]
    )
  }

  const handleBack = () => {
    Alert.alert(
      'Salir del entrenamiento',
      'Si salís ahora perderás el progreso no guardado.',
      [
        { text: 'Continuar entrenando', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: () => router.back() },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerMeta}>
          <Text style={styles.sessionName}>{session.name}</Text>
          <Text style={styles.sessionSub}>{session.muscleGroup}</Text>
        </View>
        <View style={styles.durationBadge}>
          <Ionicons name="time-outline" size={13} color={WolfTheme.colors.textSecondary} />
          <Text style={styles.durationText}>{session.estimatedMinutes} min</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <ProgressHeader
          completed={completedExercises}
          total={exercises.length}
          label="ejercicios"
        />
      </View>

      {/* Exercise list */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {exercises.map((exercise, index) => (
          <ExerciseAccordion
            key={exercise.id}
            exercise={exercise}
            index={index}
            onSetsChange={(sets) => handleSetsChange(exercise.id, sets)}
          />
        ))}
        {/* Spacer for bottom bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed bottom bar */}
      <BottomWorkoutBar
        elapsedSeconds={elapsed}
        completedExercises={completedExercises}
        totalExercises={exercises.length}
        onFinish={handleFinish}
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
  backBtn: {
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
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: WolfTheme.colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '500',
    color: WolfTheme.colors.textSecondary,
  },
  progressSection: {
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingVertical: WolfTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: WolfTheme.colors.border,
  },
  scroll: {
    paddingHorizontal: WolfTheme.spacing.md,
    paddingTop: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
})
