import { StyleSheet, View } from 'react-native'

import { WolfTheme } from '@/constants/colors'
import { Skeleton } from '@/components/ui/Skeleton'

export function ExerciseAccordionSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Skeleton width={32} height={32} borderRadius={10} />
        <View style={styles.headerContent}>
          <Skeleton width="60%" height={15} borderRadius={4} />
          <Skeleton width="40%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
        <Skeleton width={20} height={20} borderRadius={2} />
      </View>

      {/* Body (expanded state) */}
      <View style={styles.body}>
        {/* Video thumbnail */}
        <Skeleton
          width="100%"
          height={150}
          borderRadius={WolfTheme.radius.card}
          style={{ aspectRatio: '16/9' }}
        />

        {/* Last perf line */}
        <View style={styles.perfLine}>
          <Skeleton width={80} height={12} borderRadius={2} />
          <Skeleton width={100} height={13} borderRadius={2} />
        </View>

        {/* Series skeleton (3 items) */}
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <View key={i} style={styles.seriesItem}>
              <View style={styles.seriesHeader}>
                <Skeleton width={60} height={14} borderRadius={2} />
                <Skeleton width={70} height={14} borderRadius={2} />
              </View>
              {i < 2 && <View style={styles.restSection} />}
            </View>
          ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
    minHeight: 64,
  },
  headerContent: {
    flex: 1,
    gap: 4,
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: WolfTheme.colors.border,
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  perfLine: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: WolfTheme.spacing.md,
  },
  seriesItem: {
    gap: WolfTheme.spacing.sm,
  },
  seriesHeader: {
    flexDirection: 'row',
    gap: 8,
  },
  restSection: {
    height: 60,
    marginTop: WolfTheme.spacing.sm,
    paddingLeft: 40,
  },
})
