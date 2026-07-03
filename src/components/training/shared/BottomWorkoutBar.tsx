import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { WolfTheme } from '@/constants/colors'

interface BottomWorkoutBarProps {
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

export function BottomWorkoutBar({
  elapsedSeconds,
  completedExercises,
  totalExercises,
  onFinish,
}: BottomWorkoutBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatTime(elapsedSeconds)}</Text>
          <Text style={styles.statLabel}>Tiempo</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedExercises}/{totalExercises}</Text>
          <Text style={styles.statLabel}>Ejercicios</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.finishBtn} onPress={onFinish} activeOpacity={0.85}>
        <Text style={styles.finishText}>Finalizar sesión</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: WolfTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: WolfTheme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: WolfTheme.spacing.md,
    paddingHorizontal: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 56,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 11,
    color: WolfTheme.colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: WolfTheme.colors.border,
  },
  finishBtn: {
    flex: 1,
    backgroundColor: WolfTheme.colors.primary,
    borderRadius: WolfTheme.radius.button,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
})
