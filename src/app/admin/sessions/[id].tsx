import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import {
  useAddExerciseToSession,
  useRemoveExerciseFromSession,
  useRemoveProgramDayByDayNumber,
  useRemoveProgramDayByWeekday,
  useSession,
  useSessionProgramAssociations,
  useUpdateOfficialSession,
  useUpdateSessionExercise,
} from '@/hooks/use-sessions'
import { useExercises } from '@/hooks/use-exercises'
import { SessionForm } from '@/components/admin/SessionForm'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { AlertModal } from '@/components/ui/AlertModal'
import { Button } from '@/components/ui/Button'
import type { SessionWithExercises } from '@/api/sessions'
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

type SessionExerciseWithExercise = SessionWithExercises['session_exercises'][number]

function toNumberOrNull(value: string): number | null {
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export default function EditSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: session, isLoading } = useSession(id ?? '')
  const { data: associations } = useSessionProgramAssociations(id ?? '')
  const updateSession = useUpdateOfficialSession()
  const addExercise = useAddExerciseToSession(id ?? '')
  const updateExercise = useUpdateSessionExercise(id ?? '')
  const removeExercise = useRemoveExerciseFromSession(id ?? '')
  const removeByWeekday = useRemoveProgramDayByWeekday()
  const removeByDayNumber = useRemoveProgramDayByDayNumber()

  const [pickerVisible, setPickerVisible] = useState(false)
  const [editTarget, setEditTarget] = useState<SessionExerciseWithExercise | null>(null)
  const [removeTarget, setRemoveTarget] = useState<SessionExerciseWithExercise | null>(null)
  const [errorAlert, setErrorAlert] = useState<string | null>(null)

  if (isLoading || !session) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={WolfTheme.colors.primary} />
      </View>
    )
  }

  const handleRemoveAssociation = async (assoc: NonNullable<typeof associations>[number]) => {
    try {
      if (assoc.weekday) {
        await removeByWeekday.mutateAsync({ programId: assoc.workout_programs.id, weekday: assoc.weekday })
      } else if (assoc.day_number) {
        await removeByDayNumber.mutateAsync({
          programId: assoc.workout_programs.id,
          dayNumber: assoc.day_number,
        })
      }
    } catch {
      setErrorAlert('No se pudo quitar la asociación.')
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar sesión</Text>
      </View>

      <SessionForm
        submitLabel="Guardar cambios"
        loading={updateSession.isPending}
        defaultValues={{
          name: session.name,
          description: session.description ?? '',
          estimated_duration_minutes: session.estimated_duration_minutes
            ? String(session.estimated_duration_minutes)
            : '',
        }}
        onSubmit={async (payload) => {
          await updateSession.mutateAsync({ id: id!, ...payload })
        }}
      />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ejercicios</Text>
          <Button label="Agregar ejercicio" onPress={() => setPickerVisible(true)} size="sm" />
        </View>

        {session.session_exercises.length === 0 ? (
          <Text style={styles.emptyText}>Esta sesión todavía no tiene ejercicios.</Text>
        ) : (
          session.session_exercises.map((se) => (
            <View key={se.id} style={styles.exerciseRow}>
              <TouchableOpacity style={styles.exerciseInfo} onPress={() => setEditTarget(se)}>
                <Text style={styles.exerciseName}>{se.exercises.name_es}</Text>
                <Text style={styles.exerciseTargets}>
                  {se.target_sets ?? '—'}×{se.target_reps ?? '—'}
                  {se.target_weight ? ` @ ${se.target_weight}kg` : ''}
                  {se.rest_seconds ? ` · descanso ${se.rest_seconds}s` : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setRemoveTarget(se)} hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color={WolfTheme.colors.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Asociaciones</Text>
        {(associations ?? []).length === 0 ? (
          <Text style={styles.emptyText}>
            Esta sesión no está asignada a ningún día de programa o reto todavía.
          </Text>
        ) : (
          (associations ?? []).map((a) => (
            <View key={a.id} style={styles.assocRow}>
              <Text style={styles.assocText}>
                {a.workout_programs.name} —{' '}
                {a.weekday ? WEEKDAY_LABEL[a.weekday] : `Día ${a.day_number}`}
              </Text>
              <TouchableOpacity onPress={() => handleRemoveAssociation(a)} hitSlop={8}>
                <Ionicons name="close-circle-outline" size={20} color={WolfTheme.colors.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
        <Text style={styles.daysNote}>
          Para asociar esta sesión a un día, hacelo desde el detalle del programa o reto.
        </Text>
      </View>

      <ExercisePickerModal
        visible={pickerVisible}
        existingCount={session.session_exercises.length}
        onClose={() => setPickerVisible(false)}
        onAdd={async (exerciseId, targets) => {
          try {
            await addExercise.mutateAsync({
              training_session_id: id!,
              exercise_id: exerciseId,
              sort_order: session.session_exercises.length,
              ...targets,
            })
            setPickerVisible(false)
          } catch {
            setErrorAlert('No se pudo agregar el ejercicio.')
          }
        }}
      />

      <TargetEditModal
        visible={!!editTarget}
        sessionExercise={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={async (targets) => {
          if (!editTarget) return
          try {
            await updateExercise.mutateAsync({ id: editTarget.id, ...targets })
            setEditTarget(null)
          } catch {
            setErrorAlert('No se pudieron guardar los cambios.')
          }
        }}
      />

      <ConfirmDeleteModal
        visible={!!removeTarget}
        message={`¿Quitar "${removeTarget?.exercises.name_es}" de esta sesión?`}
        loading={removeExercise.isPending}
        onConfirm={async () => {
          if (!removeTarget) return
          try {
            await removeExercise.mutateAsync(removeTarget.id)
          } catch {
            setErrorAlert('No se pudo quitar el ejercicio.')
          } finally {
            setRemoveTarget(null)
          }
        }}
        onCancel={() => setRemoveTarget(null)}
      />

      <AlertModal
        visible={!!errorAlert}
        type="error"
        title="Error"
        message={errorAlert ?? ''}
        onDismiss={() => setErrorAlert(null)}
      />
    </ScrollView>
  )
}

interface Targets {
  target_sets: number | null
  target_reps: number | null
  target_weight: number | null
  rest_seconds: number | null
}

function TargetsFields({
  sets,
  setSets,
  reps,
  setReps,
  weight,
  setWeight,
  rest,
  setRest,
}: {
  sets: string
  setSets: (v: string) => void
  reps: string
  setReps: (v: string) => void
  weight: string
  setWeight: (v: string) => void
  rest: string
  setRest: (v: string) => void
}) {
  return (
    <View style={styles.targetsRow}>
      <View style={styles.targetField}>
        <Text style={styles.targetLabel}>Series</Text>
        <TextInput style={styles.targetInput} value={sets} onChangeText={setSets} keyboardType="numeric" />
      </View>
      <View style={styles.targetField}>
        <Text style={styles.targetLabel}>Reps</Text>
        <TextInput style={styles.targetInput} value={reps} onChangeText={setReps} keyboardType="numeric" />
      </View>
      <View style={styles.targetField}>
        <Text style={styles.targetLabel}>Peso (kg)</Text>
        <TextInput style={styles.targetInput} value={weight} onChangeText={setWeight} keyboardType="numeric" />
      </View>
      <View style={styles.targetField}>
        <Text style={styles.targetLabel}>Descanso (s)</Text>
        <TextInput style={styles.targetInput} value={rest} onChangeText={setRest} keyboardType="numeric" />
      </View>
    </View>
  )
}

function ExercisePickerModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean
  existingCount: number
  onClose: () => void
  onAdd: (exerciseId: string, targets: Targets) => Promise<void>
}) {
  const { data: exercises } = useExercises()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [rest, setRest] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return exercises ?? []
    return (exercises ?? []).filter((e) => e.name_es.toLowerCase().includes(term))
  }, [exercises, search])

  const reset = () => {
    setSearch('')
    setSelectedId(null)
    setSets('')
    setReps('')
    setWeight('')
    setRest('')
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {!selectedId ? (
            <>
              <Text style={styles.modalTitle}>Elegí un ejercicio</Text>
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar..."
                placeholderTextColor={WolfTheme.colors.textSecondary}
              />
              <ScrollView style={styles.modalList}>
                {filtered.slice(0, 50).map((e) => (
                  <TouchableOpacity key={e.id} style={styles.modalItem} onPress={() => setSelectedId(e.id)}>
                    <Text style={styles.modalItemText}>{e.name_es}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : (
            <>
              <Text style={styles.modalTitle}>
                {(exercises ?? []).find((e) => e.id === selectedId)?.name_es}
              </Text>
              <TargetsFields
                sets={sets}
                setSets={setSets}
                reps={reps}
                setReps={setReps}
                weight={weight}
                setWeight={setWeight}
                rest={rest}
                setRest={setRest}
              />
              <Button
                label="Agregar"
                onPress={async () => {
                  await onAdd(selectedId, {
                    target_sets: toNumberOrNull(sets),
                    target_reps: toNumberOrNull(reps),
                    target_weight: toNumberOrNull(weight),
                    rest_seconds: toNumberOrNull(rest),
                  })
                  reset()
                }}
              />
            </>
          )}
          <TouchableOpacity
            onPress={() => {
              reset()
              onClose()
            }}
            style={styles.modalCancelButton}
          >
            <Text style={styles.modalCancel}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

function TargetEditModal({
  visible,
  sessionExercise,
  onClose,
  onSave,
}: {
  visible: boolean
  sessionExercise: SessionExerciseWithExercise | null
  onClose: () => void
  onSave: (targets: Targets) => Promise<void>
}) {
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [rest, setRest] = useState('')

  useEffect(() => {
    if (sessionExercise) {
      setSets(String(sessionExercise.target_sets ?? ''))
      setReps(String(sessionExercise.target_reps ?? ''))
      setWeight(String(sessionExercise.target_weight ?? ''))
      setRest(String(sessionExercise.rest_seconds ?? ''))
    }
  }, [sessionExercise])

  if (!sessionExercise) return null

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{sessionExercise.exercises.name_es}</Text>
          <TargetsFields
            sets={sets}
            setSets={setSets}
            reps={reps}
            setReps={setReps}
            weight={weight}
            setWeight={setWeight}
            rest={rest}
            setRest={setRest}
          />
          <Button
            label="Guardar"
            onPress={() =>
              onSave({
                target_sets: toNumberOrNull(sets),
                target_reps: toNumberOrNull(reps),
                target_weight: toNumberOrNull(weight),
                rest_seconds: toNumberOrNull(rest),
              })
            }
          />
          <TouchableOpacity onPress={onClose} style={styles.modalCancelButton}>
            <Text style={styles.modalCancel}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: WolfTheme.spacing.xl,
    gap: WolfTheme.spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  section: {
    maxWidth: 640,
    gap: WolfTheme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: WolfTheme.colors.textSecondary,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: WolfTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: WolfTheme.colors.border,
  },
  exerciseInfo: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  exerciseTargets: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  assocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: WolfTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: WolfTheme.colors.border,
  },
  assocText: {
    fontSize: 14,
    color: WolfTheme.colors.textPrimary,
  },
  daysNote: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
    marginTop: WolfTheme.spacing.xs,
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
    maxWidth: 420,
    maxHeight: '80%',
    gap: WolfTheme.spacing.md,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  searchInput: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.input,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    height: 44,
    paddingHorizontal: WolfTheme.spacing.md,
    color: WolfTheme.colors.textPrimary,
    fontSize: 15,
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
  modalCancelButton: {
    alignSelf: 'flex-end',
  },
  modalCancel: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
  },
  targetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WolfTheme.spacing.sm,
  },
  targetField: {
    gap: 4,
  },
  targetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
  },
  targetInput: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.input,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    height: 40,
    width: 90,
    paddingHorizontal: WolfTheme.spacing.sm,
    color: WolfTheme.colors.textPrimary,
    fontSize: 14,
  },
})
