import { StyleSheet, Text, View } from 'react-native'

import { WolfTheme } from '@/constants/colors'
import { ProgressBar } from './ProgressBar'

interface ProgressHeaderProps {
  completed: number
  total: number
  label?: string
}

export function ProgressHeader({ completed, total, label = 'ejercicios' }: ProgressHeaderProps) {
  const progress = total > 0 ? completed / total : 0
  const pct = Math.round(progress * 100)

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.count}>
          <Text style={styles.countHighlight}>{completed}</Text>
          {' / '}{total} {label}
        </Text>
        <Text style={styles.pct}>{pct}%</Text>
      </View>
      <ProgressBar progress={progress} height={8} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: WolfTheme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: {
    fontSize: 14,
    color: WolfTheme.colors.textSecondary,
  },
  countHighlight: {
    color: WolfTheme.colors.textPrimary,
    fontWeight: '600',
  },
  pct: {
    fontSize: 14,
    fontWeight: '700',
    color: WolfTheme.colors.primary,
  },
})
