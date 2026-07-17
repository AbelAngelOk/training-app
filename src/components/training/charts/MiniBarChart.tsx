import { StyleSheet, Text, View } from 'react-native'

import { WolfTheme } from '@/constants/colors'

export interface MiniBarChartPoint {
  label: string
  value: number
  /** Distinguishes non-standard points (e.g. cancelled) with a muted bar */
  muted?: boolean
}

interface MiniBarChartProps {
  data: MiniBarChartPoint[]
  color?: string
  height?: number
  formatValue?: (value: number) => string
}

const CHART_HEIGHT = 120
const MIN_BAR_HEIGHT = 4

/**
 * Simple proportional bar chart built from Views (no chart library).
 * Bars are ordered as given — pass data chronologically (oldest to newest).
 */
export function MiniBarChart({
  data,
  color = WolfTheme.colors.primary,
  height = CHART_HEIGHT,
  formatValue = (v) => String(Math.round(v)),
}: MiniBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.emptyText}>Sin datos todavía</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { height }]}>
      {data.map((point, index) => {
        const barHeight = Math.max(
          MIN_BAR_HEIGHT,
          (point.value / maxValue) * (height - 32)
        )
        return (
          <View key={`${point.label}-${index}`} style={styles.column}>
            <Text style={styles.valueLabel} numberOfLines={1}>
              {point.value > 0 ? formatValue(point.value) : ''}
            </Text>
            <View
              style={[
                styles.bar,
                {
                  height: barHeight,
                  backgroundColor: point.muted ? WolfTheme.colors.surfaceLight : color,
                },
              ]}
            />
            <Text style={styles.axisLabel} numberOfLines={1}>
              {point.label}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    paddingHorizontal: WolfTheme.spacing.sm,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  valueLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
  },
  bar: {
    width: '70%',
    minWidth: 8,
    borderRadius: 4,
  },
  axisLabel: {
    fontSize: 10,
    color: WolfTheme.colors.textSecondary,
  },
  emptyText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: WolfTheme.colors.textSecondary,
    fontSize: 13,
  },
})
