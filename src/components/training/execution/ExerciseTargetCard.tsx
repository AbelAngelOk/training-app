import { useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import type { SessionWithExercises } from '@/api/sessions'

type SessionExerciseWithExercise = SessionWithExercises['session_exercises'][number]

export interface TargetPayload {
  target_sets: number | null
  target_reps: number | null
  target_weight: number | null
}

interface ExerciseTargetCardProps {
  sessionExercise: SessionExerciseWithExercise
  index: number
  editable: boolean
  onSaveTargets: (payload: TargetPayload) => void
}

export function toNumberOrNull(value: string): number | null {
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

/**
 * Pre-session card: shows one exercise with its editable target values
 * (sets / reps / weight). Changes are committed on blur.
 */
export function ExerciseTargetCard({
  sessionExercise,
  index,
  editable,
  onSaveTargets,
}: ExerciseTargetCardProps) {
  const [sets, setSets] = useState(String(sessionExercise.target_sets ?? ''))
  const [reps, setReps] = useState(String(sessionExercise.target_reps ?? ''))
  const [weight, setWeight] = useState(String(sessionExercise.target_weight ?? ''))

  useEffect(() => {
    setSets(String(sessionExercise.target_sets ?? ''))
    setReps(String(sessionExercise.target_reps ?? ''))
    setWeight(String(sessionExercise.target_weight ?? ''))
  }, [sessionExercise.target_sets, sessionExercise.target_reps, sessionExercise.target_weight])

  const handleBlur = () => {
    const payload: TargetPayload = {
      target_sets: toNumberOrNull(sets),
      target_reps: toNumberOrNull(reps),
      target_weight: toNumberOrNull(weight),
    }
    const currentWeight =
      sessionExercise.target_weight === null ? null : Number(sessionExercise.target_weight)
    const changed =
      payload.target_sets !== sessionExercise.target_sets ||
      payload.target_reps !== sessionExercise.target_reps ||
      payload.target_weight !== currentWeight
    if (changed) onSaveTargets(payload)
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.indexBox}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        <View style={styles.headerMeta}>
          <Text style={styles.name} numberOfLines={2}>
            {sessionExercise.exercises.name}
          </Text>
          <Text style={styles.muscle}>
            {sessionExercise.exercises.muscle_groups?.name ?? ''}
          </Text>
        </View>
        <View style={styles.restBadge}>
          <Ionicons name="timer-outline" size={13} color={WolfTheme.colors.textSecondary} />
          <Text style={styles.restText}>{sessionExercise.rest_seconds ?? 60}s</Text>
        </View>
      </View>

      <View style={styles.targetsRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Series</Text>
          <TextInput
            style={[styles.input, !editable && styles.inputDisabled]}
            value={sets}
            onChangeText={setSets}
            onBlur={handleBlur}
            keyboardType="number-pad"
            editable={editable}
            selectTextOnFocus
            returnKeyType="done"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Reps</Text>
          <TextInput
            style={[styles.input, !editable && styles.inputDisabled]}
            value={reps}
            onChangeText={setReps}
            onBlur={handleBlur}
            keyboardType="number-pad"
            editable={editable}
            selectTextOnFocus
            returnKeyType="done"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Peso (kg)</Text>
          <TextInput
            style={[styles.input, !editable && styles.inputDisabled]}
            value={weight}
            onChangeText={setWeight}
            onBlur={handleBlur}
            keyboardType="decimal-pad"
            editable={editable}
            selectTextOnFocus
            returnKeyType="done"
          />
        </View>
      </View>
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
    gap: WolfTheme.spacing.md,
  },
  indexBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: WolfTheme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: 14,
    fontWeight: '700',
    color: WolfTheme.colors.primary,
  },
  headerMeta: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  muscle: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  restBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: WolfTheme.colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  restText: {
    fontSize: 12,
    fontWeight: '500',
    color: WolfTheme.colors.textSecondary,
  },
  targetsRow: {
    flexDirection: 'row',
    gap: WolfTheme.spacing.md,
  },
  inputGroup: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    color: WolfTheme.colors.textSecondary,
  },
  input: {
    width: '100%',
    height: 44,
    backgroundColor: WolfTheme.colors.surfaceLight,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
  },
  inputDisabled: {
    opacity: 0.5,
  },
})
