import { useState } from 'react'
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import {
  useRemoveProgramDayByDayNumber,
  useRemoveProgramDayByWeekday,
  useSessionsAdmin,
  useSetProgramDayByDayNumber,
  useSetProgramDayByWeekday,
} from '@/hooks/use-sessions'
import type { Weekday } from '@/types/database'

const WEEKDAY_LABEL: Record<Weekday, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
}

const WEEKDAY_ORDER: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

interface DaySlotAssignment {
  key: Weekday | number
  session: { id: string; name: string } | null
}

interface ProgramDaySelectorProps {
  programId: string
  scheduleType: 'weekday' | 'day_number'
  durationDays?: number
  assignments: DaySlotAssignment[]
}

/**
 * Fills each schedule slot (7 weekdays for a program, 1..duration_days for a
 * challenge) with a session, or lets the admin clear one. Shared by
 * program/challenge detail screens — the "days" side of the association;
 * the session detail screen shows the same links read-only from its side.
 */
export function ProgramDaySelector({
  programId,
  scheduleType,
  durationDays,
  assignments,
}: ProgramDaySelectorProps) {
  const [pickerSlot, setPickerSlot] = useState<Weekday | number | null>(null)
  const { data: sessions } = useSessionsAdmin()
  const setByWeekday = useSetProgramDayByWeekday()
  const setByDayNumber = useSetProgramDayByDayNumber()
  const removeByWeekday = useRemoveProgramDayByWeekday()
  const removeByDayNumber = useRemoveProgramDayByDayNumber()

  const slots: { key: Weekday | number; label: string }[] =
    scheduleType === 'weekday'
      ? WEEKDAY_ORDER.map((w) => ({ key: w, label: WEEKDAY_LABEL[w] }))
      : Array.from({ length: durationDays ?? 0 }, (_, i) => ({ key: i + 1, label: `Día ${i + 1}` }))

  const sessionFor = (key: Weekday | number) =>
    assignments.find((a) => a.key === key)?.session ?? null

  const assign = async (sessionId: string) => {
    if (pickerSlot === null) return
    if (scheduleType === 'weekday') {
      await setByWeekday.mutateAsync({
        workout_program_id: programId,
        weekday: pickerSlot as Weekday,
        training_session_id: sessionId,
      })
    } else {
      await setByDayNumber.mutateAsync({
        workout_program_id: programId,
        day_number: pickerSlot as number,
        training_session_id: sessionId,
      })
    }
    setPickerSlot(null)
  }

  const remove = async (key: Weekday | number) => {
    if (scheduleType === 'weekday') {
      await removeByWeekday.mutateAsync({ programId, weekday: key as Weekday })
    } else {
      await removeByDayNumber.mutateAsync({ programId, dayNumber: key as number })
    }
  }

  return (
    <View style={styles.container}>
      {slots.map((slot) => {
        const session = sessionFor(slot.key)
        return (
          <View key={String(slot.key)} style={styles.slotRow}>
            <Text style={styles.slotLabel}>{slot.label}</Text>
            {session ? (
              <View style={styles.slotAssigned}>
                <Text style={styles.slotSessionName} numberOfLines={1}>
                  {session.name}
                </Text>
                <TouchableOpacity onPress={() => remove(slot.key)} hitSlop={8}>
                  <Ionicons name="close-circle-outline" size={18} color={WolfTheme.colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setPickerSlot(slot.key)}>
                <Text style={styles.assignLink}>Asignar sesión</Text>
              </TouchableOpacity>
            )}
          </View>
        )
      })}

      <Modal visible={pickerSlot !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Elegí una sesión</Text>
            <ScrollView style={styles.modalList}>
              {(sessions ?? []).map((s) => (
                <TouchableOpacity key={s.id} style={styles.modalItem} onPress={() => assign(s.id)}>
                  <Text style={styles.modalItemText}>{s.name}</Text>
                </TouchableOpacity>
              ))}
              {(sessions ?? []).length === 0 && (
                <Text style={styles.modalEmpty}>No hay sesiones oficiales creadas todavía.</Text>
              )}
            </ScrollView>
            <TouchableOpacity onPress={() => setPickerSlot(null)} style={styles.modalCancelButton}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: WolfTheme.spacing.xs,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: WolfTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: WolfTheme.colors.border,
  },
  slotLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
    width: 90,
  },
  slotAssigned: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: WolfTheme.spacing.sm,
  },
  slotSessionName: {
    fontSize: 14,
    color: WolfTheme.colors.textPrimary,
  },
  assignLink: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: WolfTheme.colors.background,
    borderRadius: WolfTheme.radius.modal,
    padding: WolfTheme.spacing.lg,
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
    gap: WolfTheme.spacing.md,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  modalList: {
    flexGrow: 0,
  },
  modalItem: {
    paddingVertical: WolfTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: WolfTheme.colors.border,
  },
  modalItemText: {
    fontSize: 14,
    color: WolfTheme.colors.textPrimary,
  },
  modalEmpty: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
    paddingVertical: WolfTheme.spacing.sm,
  },
  modalCancelButton: {
    alignSelf: 'flex-end',
  },
  modalCancel: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
  },
})
