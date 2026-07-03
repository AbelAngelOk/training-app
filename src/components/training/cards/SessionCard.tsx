import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import type { Session, SessionStatus } from '@/types/training'

interface SessionCardProps {
  session: Session
  onPress: () => void
}

const STATUS_LABELS: Record<SessionStatus, string> = {
  pending: 'Pendiente',
  completed: 'Completado',
  late: 'Atrasado',
  incomplete: 'Incompleto',
}

const STATUS_COLORS: Record<SessionStatus, { bg: string; text: string; icon: string }> = {
  pending: { bg: '#F3E8FF', text: '#8B5CF6', icon: 'timer-outline' },
  completed: { bg: '#DBEAFE', text: '#3B82F6', icon: 'checkmark-circle-outline' },
  late: { bg: '#FEE2E2', text: '#EF4444', icon: 'alert-circle-outline' },
  incomplete: { bg: '#FEF3C7', text: '#F59E0B', icon: 'close-circle-outline' },
}

export function SessionCard({ session, onPress }: SessionCardProps) {
  const statusColor = STATUS_COLORS[session.status]

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.iconBox}>
        <Ionicons name={session.icon as any} size={20} color={WolfTheme.colors.primary} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{session.name}</Text>
        <Text style={styles.muscle} numberOfLines={1}>{session.muscleGroup}</Text>
        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Ionicons name="time-outline" size={12} color={WolfTheme.colors.textSecondary} />
            <Text style={styles.badgeText}>{session.estimatedMinutes} min</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="barbell-outline" size={12} color={WolfTheme.colors.textSecondary} />
            <Text style={styles.badgeText}>{session.exercises.length} ejercicios</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Ionicons name={statusColor.icon as any} size={12} color={statusColor.text} />
            <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>
              {STATUS_LABELS[session.status]}
            </Text>
          </View>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={WolfTheme.colors.textSecondary} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
    minHeight: 44,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(139,92,246,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  muscle: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: WolfTheme.colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    color: WolfTheme.colors.textSecondary,
  },
  dayText: {
    fontSize: 11,
    fontWeight: '700',
    color: WolfTheme.colors.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
})
