import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import type { Program } from '@/types/training'
import { ProgressBar } from '../shared/ProgressBar'

interface TrainingCardProps {
  program: Program
  onPress: () => void
  onMenuPress: () => void
}

const STATUS_LABEL: Record<Program['status'], string> = {
  active: 'Activo',
  paused: 'Pausado',
  completed: 'Completado',
}

const STATUS_COLOR: Record<Program['status'], string> = {
  active: WolfTheme.colors.success,
  paused: WolfTheme.colors.warning,
  completed: WolfTheme.colors.textSecondary,
}

export function TrainingCard({ program, onPress, onMenuPress }: TrainingCardProps) {
  const pct = Math.round(program.weeklyProgress * 100)

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: program.color + '22' }]}>
          <Ionicons name={program.icon as any} size={22} color={program.color} />
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.name} numberOfLines={1}>{program.name}</Text>
          <Text style={styles.description} numberOfLines={1}>{program.description}</Text>
        </View>

        <TouchableOpacity style={styles.menuBtn} onPress={onMenuPress} hitSlop={12}>
          <Ionicons name="ellipsis-horizontal" size={20} color={WolfTheme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Ionicons name="calendar-outline" size={14} color={WolfTheme.colors.textSecondary} />
          <Text style={styles.statText}>
            {program.weeklyDays.join(' · ')}
          </Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="layers-outline" size={14} color={WolfTheme.colors.textSecondary} />
          <Text style={styles.statText}>
            {program.sessions.length} sesiones
          </Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressBlock}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Progreso semanal</Text>
          <View style={styles.progressRight}>
            <Text style={styles.progressPct}>{pct}%</Text>
            <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[program.status] }]} />
            <Text style={[styles.statusText, { color: STATUS_COLOR[program.status] }]}>
              {STATUS_LABEL[program.status]}
            </Text>
          </View>
        </View>
        <ProgressBar progress={program.weeklyProgress} color={program.color} height={6} />
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
    padding: WolfTheme.spacing.lg,
    gap: WolfTheme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  description: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
  },
  menuBtn: {
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: WolfTheme.spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
  },
  progressBlock: {
    gap: WolfTheme.spacing.sm,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  progressRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressPct: {
    fontSize: 12,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
})
