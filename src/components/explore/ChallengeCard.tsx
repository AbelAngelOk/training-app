import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import type { ChallengeRow } from '@/api/challenges'

interface ChallengeCardProps {
  challenge: ChallengeRow
  onPress: () => void
  variant?: 'carousel' | 'list'
}

const CHALLENGE_COLOR = WolfTheme.colors.warning

export function ChallengeCard({ challenge, onPress, variant = 'list' }: ChallengeCardProps) {
  return (
    <TouchableOpacity
      testID="explore-challenge-card"
      style={[styles.card, variant === 'carousel' && styles.cardCarousel]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.icon}>
        <Ionicons name="flame-outline" size={22} color={CHALLENGE_COLOR} />
      </View>
      <Text testID="explore-challenge-card-name" style={styles.name} numberOfLines={1}>
        {challenge.name}
      </Text>
      {challenge.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {challenge.description}
        </Text>
      ) : null}
      <View style={styles.durationBadge}>
        <Ionicons name="calendar-outline" size={12} color={CHALLENGE_COLOR} />
        <Text style={styles.durationText}>{challenge.duration_days} días</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
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
    backgroundColor: 'rgba(245,158,11,0.12)',
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
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 'auto',
    paddingTop: 4,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: CHALLENGE_COLOR,
  },
})
