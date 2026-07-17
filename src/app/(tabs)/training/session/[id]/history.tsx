import { useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'

import { WolfTheme } from '@/constants/colors'
import { useSession } from '@/hooks/use-sessions'
import { useSessionHistory } from '@/hooks/use-workouts'
import { MiniBarChart } from '@/components/training/charts/MiniBarChart'
import type { HistoryEntryStatus, SessionHistoryEntry } from '@/services/session-history-service'

type Metric = 'volume' | 'duration' | 'reps' | 'sets'

const METRICS: { key: Metric; label: string }[] = [
  { key: 'volume', label: 'Peso' },
  { key: 'duration', label: 'Duración' },
  { key: 'reps', label: 'Reps' },
  { key: 'sets', label: 'Series' },
]

const STATUS_META: Record<
  HistoryEntryStatus,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  completed: { label: 'Completada', color: WolfTheme.colors.success, icon: 'checkmark-circle' },
  completed_off_schedule: {
    label: 'Fuera de día',
    color: WolfTheme.colors.warning,
    icon: 'alert-circle',
  },
  cancelled: { label: 'Cancelada', color: WolfTheme.colors.error, icon: 'close-circle' },
  in_progress: { label: 'En curso', color: WolfTheme.colors.primary, icon: 'time' },
}

function getMetricValue(entry: SessionHistoryEntry, metric: Metric): number {
  switch (metric) {
    case 'volume':
      return entry.volume
    case 'duration':
      return entry.durationSeconds ? entry.durationSeconds / 60 : 0
    case 'reps':
      return entry.totalReps
    case 'sets':
      return entry.setsCompleted
  }
}

function formatMetricValue(metric: Metric, value: number): string {
  switch (metric) {
    case 'volume':
      return `${Math.round(value)}kg`
    case 'duration':
      return `${Math.round(value)}m`
    case 'reps':
      return String(Math.round(value))
    case 'sets':
      return String(Math.round(value))
  }
}

export default function SessionHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: session } = useSession(id ?? '')
  const { data: history, isLoading } = useSessionHistory(id ?? '')
  const [metric, setMetric] = useState<Metric>('volume')

  const chartData = useMemo(() => {
    const entries = [...(history ?? [])].reverse() // chronological, oldest first
    return entries.map((entry) => ({
      label: format(new Date(entry.startedAt), 'dd/MM'),
      value: entry.status === 'cancelled' ? 0 : getMetricValue(entry, metric),
      muted: entry.status === 'cancelled',
    }))
  }, [history, metric])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerMeta}>
          <Text style={styles.title}>Progreso</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {session?.name ?? ''}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={WolfTheme.colors.primary} />
        </View>
      ) : !history || history.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="stats-chart-outline" size={48} color={WolfTheme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>Sin historial todavía</Text>
          <Text style={styles.emptyText}>
            Completá esta sesión al menos una vez para ver tu progreso acá.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Metric chips */}
          <View style={styles.chipsRow}>
            {METRICS.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[styles.chip, metric === m.key && styles.chipActive]}
                onPress={() => setMetric(m.key)}
              >
                <Text style={[styles.chipText, metric === m.key && styles.chipTextActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chart */}
          <View style={styles.chartCard}>
            <MiniBarChart
              data={chartData}
              formatValue={(v) => formatMetricValue(metric, v)}
            />
          </View>

          {/* Chronological list */}
          <Text style={styles.sectionTitle}>Historial</Text>
          <View style={styles.list}>
            {history.map((entry) => {
              const meta = STATUS_META[entry.status]
              return (
                <View key={entry.executionId} style={styles.entryRow}>
                  <View style={styles.entryDate}>
                    <Text style={styles.entryDateText}>
                      {format(new Date(entry.startedAt), 'dd/MM/yyyy')}
                    </Text>
                    {entry.durationSeconds != null && (
                      <Text style={styles.entryDetail}>
                        {Math.round(entry.durationSeconds / 60)} min · {Math.round(entry.volume)}kg ·{' '}
                        {entry.setsCompleted}
                        {entry.setsTarget > 0 ? `/${entry.setsTarget}` : ''} series
                      </Text>
                    )}
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: meta.color + '15' }]}>
                    <Ionicons name={meta.icon} size={13} color={meta.color} />
                    <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: WolfTheme.colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMeta: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: WolfTheme.spacing.sm,
    paddingHorizontal: WolfTheme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    marginTop: WolfTheme.spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  scroll: {
    padding: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: WolfTheme.spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: WolfTheme.colors.surfaceLight,
  },
  chipActive: {
    backgroundColor: 'rgba(139,92,246,0.18)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
  },
  chipTextActive: {
    color: WolfTheme.colors.primary,
  },
  chartCard: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    padding: WolfTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    marginTop: WolfTheme.spacing.sm,
  },
  list: {
    gap: WolfTheme.spacing.sm,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    padding: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  entryDate: {
    flex: 1,
    gap: 2,
  },
  entryDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  entryDetail: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
})
