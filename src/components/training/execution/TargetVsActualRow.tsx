import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import type { WorkoutExecutionWithDetails } from '@/api/workouts'

type ExerciseExecution = WorkoutExecutionWithDetails['workout_exercise_executions'][number]

interface TargetVsActualRowProps {
  execution: ExerciseExecution
  index: number
}

type SetOutcome = 'met' | 'above' | 'below'

function getOutcome(
  actualWeight: number,
  actualReps: number,
  targetWeight: number | null,
  targetReps: number | null
): SetOutcome {
  const actualVolume = actualWeight * actualReps
  const targetVolume = (targetWeight ?? 0) * (targetReps ?? 0)
  if (targetVolume === 0) {
    // No weight target (e.g. bodyweight): compare reps only
    if (targetReps == null || actualReps === targetReps) return 'met'
    return actualReps > targetReps ? 'above' : 'below'
  }
  if (actualVolume === targetVolume) return 'met'
  return actualVolume > targetVolume ? 'above' : 'below'
}

const OUTCOME_META: Record<SetOutcome, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  met: { icon: 'checkmark-circle', color: WolfTheme.colors.success },
  above: { icon: 'arrow-up-circle', color: WolfTheme.colors.primary },
  below: { icon: 'arrow-down-circle', color: WolfTheme.colors.warning },
}

/**
 * Post-workout comparison of one exercise: configured targets vs the sets
 * that were actually logged.
 */
export function TargetVsActualRow({ execution, index }: TargetVsActualRowProps) {
  const se = execution.session_exercises
  const sets = [...execution.workout_sets].sort((a, b) => a.set_number - b.set_number)

  const targetLabel = `${se.target_sets ?? '-'}×${se.target_reps ?? '-'}${
    se.target_weight ? ` · ${Number(se.target_weight)}kg` : ''
  }`

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.indexBox}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {se.exercises.name}
        </Text>
        <View style={styles.targetBadge}>
          <Text style={styles.targetBadgeText}>Objetivo {targetLabel}</Text>
        </View>
      </View>

      {sets.length === 0 ? (
        <Text style={styles.skipped}>Ejercicio salteado</Text>
      ) : (
        <View style={styles.setsList}>
          {sets.map((set) => {
            const weight = Number(set.weight ?? 0)
            const reps = set.reps ?? 0
            const outcome = getOutcome(
              weight,
              reps,
              se.target_weight === null ? null : Number(se.target_weight),
              se.target_reps
            )
            const meta = OUTCOME_META[outcome]
            return (
              <View key={set.id} style={styles.setRow}>
                <Text style={styles.setNumber}>Serie {set.set_number}</Text>
                <Text style={styles.setTarget}>
                  {se.target_reps ?? '-'}
                  {se.target_weight ? ` × ${Number(se.target_weight)}kg` : ' reps'}
                </Text>
                <Ionicons name="arrow-forward" size={12} color={WolfTheme.colors.textSecondary} />
                <Text style={styles.setActual}>
                  {reps}
                  {weight > 0 ? ` × ${weight}kg` : ' reps'}
                </Text>
                <Ionicons name={meta.icon} size={18} color={meta.color} style={styles.outcomeIcon} />
              </View>
            )
          })}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    padding: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
  },
  indexBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: WolfTheme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: 13,
    fontWeight: '700',
    color: WolfTheme.colors.primary,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  targetBadge: {
    backgroundColor: WolfTheme.colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
  },
  skipped: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
    fontStyle: 'italic',
  },
  setsList: {
    gap: WolfTheme.spacing.sm,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
  },
  setNumber: {
    width: 60,
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  setTarget: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  setActual: {
    fontSize: 13,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  outcomeIcon: {
    marginLeft: 'auto',
  },
})
