import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'

interface StatDeltaProps {
  label: string
  value: string
  /** Previous value to compare against; omit to hide the delta indicator */
  previousValue?: number
  currentValue?: number
}

/** Stat tile showing a value plus an up/down/flat indicator vs. the previous entry */
export function StatDelta({ label, value, previousValue, currentValue }: StatDeltaProps) {
  const hasDelta = previousValue != null && currentValue != null
  const diff = hasDelta ? currentValue! - previousValue! : 0
  const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat'

  const iconName =
    direction === 'up' ? 'trending-up' : direction === 'down' ? 'trending-down' : 'remove'
  const color =
    direction === 'up'
      ? WolfTheme.colors.success
      : direction === 'down'
        ? WolfTheme.colors.error
        : WolfTheme.colors.textSecondary

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {hasDelta && diff !== 0 && (
          <Ionicons name={iconName} size={14} color={color} />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
})
