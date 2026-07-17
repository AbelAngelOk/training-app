import { useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'

import { WolfTheme } from '@/constants/colors'
import type { CalendarCommitments } from '@/services/training-calendar-service'

const PROGRAM_COLOR = WolfTheme.colors.primary
const CHALLENGE_COLOR = WolfTheme.colors.warning
const WEEK_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

interface MonthCalendarProps {
  month: Date
  onMonthChange: (month: Date) => void
  commitments: CalendarCommitments
}

/**
 * Self-contained monthly grid (no calendar library). Days with an active
 * program show a violet dot, days with an active challenge an amber dot;
 * filled dots mean the session was completed, hollow means it's pending.
 */
export function MonthCalendar({ month, onMonthChange, commitments }: MonthCalendarProps) {
  const weeks = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
    const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

    const chunks: Date[][] = []
    for (let i = 0; i < days.length; i += 7) {
      chunks.push(days.slice(i, i + 7))
    }
    return chunks
  }, [month])

  return (
    <View style={styles.container}>
      {/* Month nav */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => onMonthChange(subMonths(month, 1))}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={18} color={WolfTheme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{format(month, 'MMMM yyyy', { locale: es })}</Text>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => onMonthChange(addMonths(month, 1))}
          hitSlop={8}
        >
          <Ionicons name="chevron-forward" size={18} color={WolfTheme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Week day labels */}
      <View style={styles.weekRow}>
        {WEEK_LABELS.map((label) => (
          <Text key={label} style={styles.weekLabel}>
            {label}
          </Text>
        ))}
      </View>

      {/* Grid */}
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const commitment = commitments[dateKey]
            const inMonth = isSameMonth(day, month)
            const today = isToday(day)

            return (
              <View key={dateKey} style={styles.dayCell}>
                <View style={[styles.dayCircle, today && styles.dayCircleToday]}>
                  <Text
                    style={[
                      styles.dayNumber,
                      !inMonth && styles.dayNumberOutside,
                      today && styles.dayNumberToday,
                    ]}
                  >
                    {format(day, 'd')}
                  </Text>
                </View>
                <View style={styles.dotsRow}>
                  {commitment?.program && (
                    <View
                      style={[
                        styles.dot,
                        { borderColor: PROGRAM_COLOR },
                        commitment.programCompleted && { backgroundColor: PROGRAM_COLOR },
                      ]}
                    />
                  )}
                  {commitment?.challenge && (
                    <View
                      style={[
                        styles.dot,
                        { borderColor: CHALLENGE_COLOR },
                        commitment.challengeCompleted && { backgroundColor: CHALLENGE_COLOR },
                      ]}
                    />
                  )}
                </View>
              </View>
            )
          })}
        </View>
      ))}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { borderColor: PROGRAM_COLOR, backgroundColor: PROGRAM_COLOR }]} />
          <Text style={styles.legendText}>Programas</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { borderColor: CHALLENGE_COLOR, backgroundColor: CHALLENGE_COLOR }]} />
          <Text style={styles.legendText}>Retos</Text>
        </View>
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
    padding: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.sm,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  navBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    textTransform: 'capitalize',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 3,
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleToday: {
    backgroundColor: WolfTheme.colors.primary + '20',
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: WolfTheme.colors.textPrimary,
  },
  dayNumberOutside: {
    color: WolfTheme.colors.textSecondary,
    opacity: 0.4,
  },
  dayNumberToday: {
    fontWeight: '700',
    color: WolfTheme.colors.primary,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    height: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
  },
  legend: {
    flexDirection: 'row',
    gap: WolfTheme.spacing.lg,
    paddingTop: WolfTheme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: WolfTheme.colors.border,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendText: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
})
