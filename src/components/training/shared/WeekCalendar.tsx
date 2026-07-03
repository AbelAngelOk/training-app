import { StyleSheet, Text, View } from 'react-native'

import { WolfTheme } from '@/constants/colors'
import type { DayCode } from '@/types/training'

const ALL_DAYS: DayCode[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

interface WeekCalendarProps {
  activeDays: DayCode[]
  sessionMap?: Partial<Record<DayCode, string>>
}

export function WeekCalendar({ activeDays, sessionMap = {} }: WeekCalendarProps) {
  return (
    <View style={styles.row}>
      {ALL_DAYS.map((day) => {
        const isActive = activeDays.includes(day)
        const label = sessionMap[day]
        return (
          <View key={day} style={styles.col}>
            <View style={[styles.dayCircle, isActive && styles.dayCircleActive]}>
              <Text style={[styles.dayLabel, isActive && styles.dayLabelActive]}>
                {label ?? day}
              </Text>
            </View>
            <Text style={styles.dayName}>{day}</Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    alignItems: 'center',
    gap: 4,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: WolfTheme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: {
    backgroundColor: WolfTheme.colors.primary,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: WolfTheme.colors.textSecondary,
  },
  dayLabelActive: {
    color: '#fff',
  },
  dayName: {
    fontSize: 10,
    color: WolfTheme.colors.textSecondary,
  },
})
