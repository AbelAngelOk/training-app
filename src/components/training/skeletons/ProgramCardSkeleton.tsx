import { StyleSheet, View } from 'react-native'

import { WolfTheme } from '@/constants/colors'
import { Skeleton } from '@/components/ui/Skeleton'

export function ProgramCardSkeleton() {
  return (
    <View style={styles.card}>
      {/* Title */}
      <Skeleton width="70%" height={20} borderRadius={4} />

      {/* Description lines */}
      <View style={styles.descriptionContainer}>
        <Skeleton width="100%" height={12} borderRadius={4} />
        <Skeleton width="85%" height={12} borderRadius={4} />
      </View>

      {/* Button */}
      <Skeleton width="100%" height={44} borderRadius={WolfTheme.radius.button} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    padding: WolfTheme.spacing.lg,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    gap: WolfTheme.spacing.md,
  },
  descriptionContainer: {
    gap: 6,
  },
})
