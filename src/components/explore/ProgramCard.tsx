import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import type { WorkoutProgramRow } from '@/types/database'

interface ProgramCardProps {
  program: WorkoutProgramRow
  onPress: () => void
  /** Fixed-width carousel card vs. full-width list row */
  variant?: 'carousel' | 'list'
}

export function ProgramCard({ program, onPress, variant = 'list' }: ProgramCardProps) {
  return (
    <TouchableOpacity
      testID="explore-program-card"
      style={[styles.card, variant === 'carousel' && styles.cardCarousel]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.icon}>
        <Ionicons name="barbell-outline" size={22} color={WolfTheme.colors.primary} />
      </View>
      <Text testID="explore-program-card-name" style={styles.name} numberOfLines={1}>
        {program.name}
      </Text>
      {program.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {program.description}
        </Text>
      ) : null}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Ver detalle</Text>
        <Ionicons name="chevron-forward" size={14} color={WolfTheme.colors.primary} />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    padding: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.sm,
  },
  cardCarousel: {
    width: 200,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: WolfTheme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  description: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
    lineHeight: 17,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 'auto',
    paddingTop: 4,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: WolfTheme.colors.primary,
  },
})
