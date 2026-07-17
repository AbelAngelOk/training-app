import { StyleSheet, View } from 'react-native'

import { WolfTheme } from '@/constants/colors'
import { Skeleton } from '@/components/ui/Skeleton'

export function SessionCardSkeleton() {
  return (
    <View style={styles.card}>
      {/* Icon box */}
      <Skeleton width={44} height={44} borderRadius={12} />

      {/* Content */}
      <View style={styles.content}>
        {/* Name line */}
        <Skeleton width="60%" height={15} borderRadius={4} />
        {/* Subtitle line */}
        <Skeleton width="80%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
        {/* Badges row */}
        <View style={styles.badgesRow}>
          <Skeleton width={70} height={20} borderRadius={6} />
          <Skeleton width={70} height={20} borderRadius={6} />
          <Skeleton width={90} height={20} borderRadius={6} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
    minHeight: 44,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
})
