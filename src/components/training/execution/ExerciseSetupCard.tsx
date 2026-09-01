import { StyleSheet, Text, TextInput, View } from 'react-native'

import { WolfTheme } from '@/constants/colors'
import { useAppLanguage } from '@/hooks/use-app-language'
import { getLocalizedText } from '@/lib/i18n'
import type { SessionWithExercises } from '@/api/sessions'

type SessionExerciseWithExercise = SessionWithExercises['session_exercises'][number]

export interface SetupValues {
  sets: string
  reps: string
  weight: string
}

interface ExerciseSetupCardProps {
  sessionExercise: SessionExerciseWithExercise
  index: number
  total: number
  values: SetupValues
  onChange: (field: keyof SetupValues, value: string) => void
}

/**
 * One full-screen step of the mandatory first-time setup wizard: asks the
 * user's real starting point (sets/reps/weight) for a single exercise.
 * Controlled by the parent wizard so all values are available at save time.
 */
export function ExerciseSetupCard({
  sessionExercise,
  index,
  total,
  values,
  onChange,
}: ExerciseSetupCardProps) {
  const language = useAppLanguage()
  const exerciseName = getLocalizedText(
    sessionExercise.exercises.name_es,
    sessionExercise.exercises.name_en,
    language
  )
  const muscleGroupNames = sessionExercise.exercises.muscle_groups
    .map((mg) => getLocalizedText(mg.name_es, mg.name_en, language))
    .join(', ')

  return (
    <View style={styles.container}>
      <Text style={styles.stepLabel}>
        Ejercicio {index + 1} de {total}
      </Text>
      <Text style={styles.name}>{exerciseName}</Text>
      {muscleGroupNames ? <Text style={styles.muscle}>{muscleGroupNames}</Text> : null}

      <Text style={styles.question}>¿Con qué vas a empezar este ejercicio?</Text>

      <View style={styles.inputsRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Series</Text>
          <TextInput
            style={styles.input}
            value={values.sets}
            onChangeText={(v) => onChange('sets', v)}
            keyboardType="number-pad"
            selectTextOnFocus
            returnKeyType="done"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Reps</Text>
          <TextInput
            style={styles.input}
            value={values.reps}
            onChangeText={(v) => onChange('reps', v)}
            keyboardType="number-pad"
            selectTextOnFocus
            returnKeyType="done"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Peso (kg)</Text>
          <TextInput
            style={styles.input}
            value={values.weight}
            onChangeText={(v) => onChange('weight', v)}
            keyboardType="decimal-pad"
            selectTextOnFocus
            returnKeyType="done"
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingTop: WolfTheme.spacing.xxl,
  },
  stepLabel: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    textAlign: 'center',
  },
  muscle: {
    fontSize: 14,
    color: WolfTheme.colors.textSecondary,
  },
  question: {
    fontSize: 15,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
    marginTop: WolfTheme.spacing.lg,
    marginBottom: WolfTheme.spacing.sm,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: WolfTheme.spacing.md,
    width: '100%',
  },
  inputGroup: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: WolfTheme.colors.surfaceLight,
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
  },
})
