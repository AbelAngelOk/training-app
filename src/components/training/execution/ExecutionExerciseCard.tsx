import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { ExerciseVideoDisplay } from '@/components/training/ExerciseVideoDisplay'
import { SeriesCard } from '@/components/training/exercise/SeriesCard'
import { RestCountdown } from '@/components/training/execution/RestCountdown'
import type { ExecutionExercise } from '@/types/training'

interface ExecutionExerciseCardProps {
  exercise: ExecutionExercise
  index: number
  total: number
  width: number
  /** Only the visible page mounts the video (heavy) and shows the rest timer */
  isActive: boolean
  restEndsAt: number | null
  onWeightChange: (setIndex: number, value: string) => void
  onRepsChange: (setIndex: number, value: string) => void
  onCompleteSet: (setIndex: number) => void
  onAddSet: () => void
  onRestDone: () => void
  onSkipRest: () => void
}

/**
 * One full-screen page of the guided workout: video on the top half,
 * sets + rest on the bottom half.
 */
export function ExecutionExerciseCard({
  exercise,
  index,
  total,
  width,
  isActive,
  restEndsAt,
  onWeightChange,
  onRepsChange,
  onCompleteSet,
  onAddSet,
  onRestDone,
  onSkipRest,
}: ExecutionExerciseCardProps) {
  const completedSets = exercise.sets.filter((s) => s.completed).length

  return (
    <View style={[styles.page, { width }]}>
      {/* Top half: video */}
      <View style={styles.videoHalf}>
        {isActive ? (
          <ExerciseVideoDisplay exercise={exercise.exercise} showInstructions />
        ) : (
          <View style={styles.videoPlaceholder}>
            <Ionicons name="barbell-outline" size={48} color={WolfTheme.colors.textSecondary} />
          </View>
        )}
      </View>

      {/* Bottom half: sets and rest */}
      <KeyboardAvoidingView
        style={styles.setsHalf}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseMeta}>
            <Text style={styles.exerciseCount}>
              Ejercicio {index + 1} de {total}
            </Text>
            <Text style={styles.exerciseName} numberOfLines={1}>
              {exercise.name}
            </Text>
          </View>
          <View style={styles.targetBadge}>
            <Text style={styles.targetText}>
              {exercise.targetSets}×{exercise.targetReps}
              {exercise.targetWeight ? ` · ${exercise.targetWeight}kg` : ''}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.setsList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isActive && restEndsAt && (
            <RestCountdown endsAt={restEndsAt} onDone={onRestDone} onSkip={onSkipRest} />
          )}

          {exercise.sets.map((set, setIndex) => (
            <SeriesCard
              key={set.id}
              set={set}
              index={setIndex}
              totalSets={exercise.sets.length}
              onWeightChange={(value) => onWeightChange(setIndex, value)}
              onRepsChange={(value) => onRepsChange(setIndex, value)}
              onToggle={() => onCompleteSet(setIndex)}
            />
          ))}

          <TouchableOpacity style={styles.addSetBtn} onPress={onAddSet} activeOpacity={0.75}>
            <Ionicons name="add" size={18} color={WolfTheme.colors.primary} />
            <Text style={styles.addSetText}>Agregar serie</Text>
          </TouchableOpacity>

          <Text style={styles.progressText}>
            {completedSets}/{exercise.sets.length} series completadas
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  videoHalf: {
    flex: 1,
    backgroundColor: WolfTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: WolfTheme.colors.border,
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setsHalf: {
    flex: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  exerciseMeta: {
    flex: 1,
    gap: 2,
  },
  exerciseCount: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  targetBadge: {
    backgroundColor: WolfTheme.colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  targetText: {
    fontSize: 13,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
  },
  setsList: {
    paddingHorizontal: WolfTheme.spacing.md,
    paddingBottom: 120,
    gap: WolfTheme.spacing.sm,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: WolfTheme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    borderStyle: 'dashed',
  },
  addSetText: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
    paddingTop: WolfTheme.spacing.xs,
  },
})
