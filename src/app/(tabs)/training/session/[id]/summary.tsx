import { useMemo } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useWorkout } from '@/hooks/use-workouts'
import { TargetVsActualRow } from '@/components/training/execution/TargetVsActualRow'
import { PrimaryButton } from '@/components/training/shared/PrimaryButton'

function formatDuration(seconds: number | null): string {
  if (!seconds) return '0 min'
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}min` : `${m} min`
}

export default function WorkoutSummaryScreen() {
  const { executionId, programId } = useLocalSearchParams<{
    id: string
    executionId: string
    programId?: string
  }>()

  const { data: workout, isLoading } = useWorkout(executionId ?? '')

  const executions = useMemo(
    () =>
      [...(workout?.workout_exercise_executions ?? [])].sort(
        (a, b) => a.session_exercises.sort_order - b.session_exercises.sort_order
      ),
    [workout]
  )

  const totals = useMemo(() => {
    let volume = 0
    let setsDone = 0
    let setsTarget = 0
    for (const exec of executions) {
      setsTarget += exec.session_exercises.target_sets ?? 0
      for (const set of exec.workout_sets) {
        setsDone += 1
        volume += Number(set.weight ?? 0) * (set.reps ?? 0)
      }
    }
    return { volume, setsDone, setsTarget }
  }, [executions])

  const handleClose = () => {
    if (programId) {
      router.replace(`/(tabs)/training/${programId}`)
    } else {
      router.replace('/(tabs)/training')
    }
  }

  if (isLoading || !workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={WolfTheme.colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Celebration header */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="trophy" size={40} color={WolfTheme.colors.primary} />
          </View>
          <Text style={styles.heroTitle}>¡Entrenamiento completado!</Text>
          <Text style={styles.heroSubtitle}>{workout.training_sessions.name}</Text>
        </View>

        {/* Totals strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDuration(workout.duration_seconds)}</Text>
            <Text style={styles.statLabel}>Duración</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {totals.setsDone}
              {totals.setsTarget > 0 ? `/${totals.setsTarget}` : ''}
            </Text>
            <Text style={styles.statLabel}>Series</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(totals.volume)} kg</Text>
            <Text style={styles.statLabel}>Volumen</Text>
          </View>
        </View>

        {/* Per-exercise comparison */}
        <Text style={styles.sectionTitle}>Objetivo vs. realizado</Text>
        {executions.map((exec, index) => (
          <TargetVsActualRow key={exec.id} execution={exec} index={index} />
        ))}

        <View style={styles.legend}>
          <View style={styles.legendRow}>
            <Ionicons name="checkmark-circle" size={16} color={WolfTheme.colors.success} />
            <Text style={styles.legendText}>Objetivo cumplido</Text>
          </View>
          <View style={styles.legendRow}>
            <Ionicons name="arrow-up-circle" size={16} color={WolfTheme.colors.primary} />
            <Text style={styles.legendText}>Superaste el objetivo</Text>
          </View>
          <View style={styles.legendRow}>
            <Ionicons name="arrow-down-circle" size={16} color={WolfTheme.colors.warning} />
            <Text style={styles.legendText}>Por debajo del objetivo</Text>
          </View>
        </View>

        <PrimaryButton label="Volver al programa" onPress={handleClose} size="lg" />
        <View style={{ height: WolfTheme.spacing.xl }} />
      </ScrollView>
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
  },
  scroll: {
    paddingHorizontal: WolfTheme.spacing.md,
    paddingTop: WolfTheme.spacing.lg,
    gap: WolfTheme.spacing.md,
  },
  hero: {
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
    paddingVertical: WolfTheme.spacing.md,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: WolfTheme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: WolfTheme.spacing.sm,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: WolfTheme.colors.textSecondary,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: WolfTheme.colors.surface,
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
    fontSize: 18,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    marginTop: WolfTheme.spacing.sm,
  },
  legend: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    padding: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
  },
  legendText: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
  },
})
