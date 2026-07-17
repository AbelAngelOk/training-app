import { StyleSheet, View } from 'react-native'

import { WolfTheme } from '@/constants/colors'
import { Skeleton } from '@/components/ui/Skeleton'
import { SessionCardSkeleton } from './SessionCardSkeleton'

export function ProgramDetailSkeleton() {
  return (
    <View style={styles.scroll}>
      {/* Header */}
      <View style={styles.headerSkeleton}>
        <View style={styles.headerMeta}>
          <Skeleton width={10} height={10} borderRadius={5} />
          <Skeleton width="60%" height={20} borderRadius={4} />
        </View>
      </View>

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <Skeleton width={40} height={22} borderRadius={4} />
          <Skeleton width={50} height={12} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Skeleton width={40} height={22} borderRadius={4} />
          <Skeleton width={50} height={12} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Skeleton width={40} height={22} borderRadius={4} />
          <Skeleton width={50} height={12} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
      </View>

      {/* Calendar skeleton */}
      <View style={styles.calendarSection}>
        <Skeleton width={120} height={16} borderRadius={4} />
        <View style={styles.calendarGrid}>
          {Array(7)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} width={30} height={30} borderRadius={4} />
            ))}
        </View>
      </View>

      {/* Legend skeleton */}
      <View style={styles.legend}>
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <View key={i} style={styles.legendRow}>
              <Skeleton width={8} height={8} borderRadius={4} />
              <Skeleton width={20} height={14} borderRadius={2} />
              <Skeleton width="40%" height={14} borderRadius={2} />
            </View>
          ))}
      </View>

      {/* Sessions skeleton */}
      <View style={styles.sessionsSection}>
        <Skeleton width={140} height={16} borderRadius={4} />
        <View style={styles.sessionsList}>
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <SessionCardSkeleton key={i} />
            ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingVertical: WolfTheme.spacing.lg,
    gap: WolfTheme.spacing.lg,
  },
  headerSkeleton: {
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: WolfTheme.colors.surface,
    marginHorizontal: 0,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    paddingVertical: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: WolfTheme.colors.border,
  },
  calendarSection: {
    gap: WolfTheme.spacing.md,
  },
  calendarGrid: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'space-between',
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
    gap: 8,
  },
  sessionsSection: {
    gap: WolfTheme.spacing.md,
  },
  sessionsList: {
    gap: WolfTheme.spacing.md,
  },
})
