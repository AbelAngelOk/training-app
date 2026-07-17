import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { PrimaryButton } from '@/components/training/shared/PrimaryButton'

interface FinishSessionCardProps {
  width: number
  elapsedSeconds: number
  completedExercises: number
  totalExercises: number
  onFinish: () => void
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Last page of the guided workout pager (reached by swiping past the final
 * exercise). Not a sticky/fixed bar — a normal, scrollable-in-place view with
 * the session stats and the "Finalizar sesión" action.
 */
export function FinishSessionCard({
  width,
  elapsedSeconds,
  completedExercises,
  totalExercises,
  onFinish,
}: FinishSessionCardProps) {
  const allDone = completedExercises === totalExercises

  return (
    <View style={[styles.page, { width }]}>
      <View style={styles.icon}>
        <Ionicons
          name={allDone ? 'checkmark-done-circle' : 'flag-outline'}
          size={56}
          color={WolfTheme.colors.primary}
        />
      </View>

      <Text style={styles.title}>
        {allDone ? '¡Completaste todos los ejercicios!' : 'Fin de la sesión'}
      </Text>
      <Text style={styles.subtitle}>
        {allDone
          ? 'Cuando quieras, finalizá para guardar tu entrenamiento.'
          : 'Todavía tenés ejercicios sin completar. Podés volver o finalizar igual.'}
      </Text>

      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatTime(elapsedSeconds)}</Text>
          <Text style={styles.statLabel}>Tiempo</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {completedExercises}/{totalExercises}
          </Text>
          <Text style={styles.statLabel}>Ejercicios</Text>
        </View>
      </View>

      <View style={styles.finishButton}>
        <PrimaryButton label="Finalizar sesión" onPress={onFinish} size="lg" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: WolfTheme.spacing.xl,
    gap: WolfTheme.spacing.md,
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: WolfTheme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: WolfTheme.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: WolfTheme.spacing.xl,
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    paddingVertical: WolfTheme.spacing.md,
    paddingHorizontal: WolfTheme.spacing.xl,
    marginTop: WolfTheme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    fontVariant: ['tabular-nums'],
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
  finishButton: {
    width: '100%',
    marginTop: WolfTheme.spacing.lg,
  },
})
