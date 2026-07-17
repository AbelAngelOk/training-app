import { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import {
  useDeactivateExercise,
  useDeleteExercise,
  useExercisesAdmin,
  useMuscleGroups,
  useEquipment,
} from '@/hooks/use-exercises'
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { SearchInput } from '@/components/training/shared/SearchInput'
import { AlertModal } from '@/components/ui/AlertModal'
import { Button } from '@/components/ui/Button'
import type { ExerciseWithDetails } from '@/api/exercises'

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23503'
  )
}

export default function AdminExercisesScreen() {
  const [search, setSearch] = useState('')
  const [muscleGroupId, setMuscleGroupId] = useState<string | null>(null)
  const [equipmentId, setEquipmentId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ExerciseWithDetails | null>(null)
  const [offerDeactivate, setOfferDeactivate] = useState<ExerciseWithDetails | null>(null)
  const [errorAlert, setErrorAlert] = useState<string | null>(null)

  const { data: muscleGroups } = useMuscleGroups()
  const { data: equipmentList } = useEquipment()
  const { data: exercises, isLoading } = useExercisesAdmin({
    search,
    muscleGroupId: muscleGroupId ?? undefined,
    equipmentId: equipmentId ?? undefined,
  })
  const deleteExercise = useDeleteExercise()
  const deactivateExercise = useDeactivateExercise()

  const columns = useMemo<DataTableColumn<ExerciseWithDetails>[]>(
    () => [
      { key: 'name', header: 'Nombre', width: 240, render: (row) => row.name },
      {
        key: 'muscle_group',
        header: 'Grupo muscular',
        width: 160,
        render: (row) => row.muscle_groups?.name ?? '—',
      },
      {
        key: 'equipment',
        header: 'Equipo',
        width: 160,
        render: (row) => row.equipment?.name ?? '—',
      },
      {
        key: 'difficulty',
        header: 'Dificultad',
        width: 120,
        render: (row) => DIFFICULTY_LABEL[row.difficulty] ?? row.difficulty,
      },
      {
        key: 'active',
        header: 'Estado',
        width: 110,
        render: (row) => (row.active ? 'Activo' : 'Inactivo'),
      },
    ],
    []
  )

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteExercise.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      if (isForeignKeyViolation(err)) {
        setOfferDeactivate(deleteTarget)
        setDeleteTarget(null)
      } else {
        setErrorAlert('No se pudo eliminar el ejercicio. Intentá de nuevo.')
        setDeleteTarget(null)
      }
    }
  }

  const handleDeactivate = async () => {
    if (!offerDeactivate) return
    try {
      await deactivateExercise.mutateAsync(offerDeactivate.id)
    } catch {
      setErrorAlert('No se pudo desactivar el ejercicio.')
    } finally {
      setOfferDeactivate(null)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Ejercicios</Text>
          <Text style={styles.subtitle}>{exercises?.length ?? 0} resultados</Text>
        </View>
        <Button label="Nuevo ejercicio" onPress={() => router.push('/admin/exercises/new')} size="md" />
      </View>

      <SearchInput value={search} onChangeText={setSearch} placeholder="Buscar por nombre..." />

      <View style={styles.filtersBlock}>
        <Text style={styles.filterLabel}>Grupo muscular</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          <TouchableOpacity
            style={[styles.chip, !muscleGroupId && styles.chipActive]}
            onPress={() => setMuscleGroupId(null)}
          >
            <Text style={[styles.chipText, !muscleGroupId && styles.chipTextActive]}>Todos</Text>
          </TouchableOpacity>
          {(muscleGroups ?? []).map((mg) => (
            <TouchableOpacity
              key={mg.id}
              style={[styles.chip, muscleGroupId === mg.id && styles.chipActive]}
              onPress={() => setMuscleGroupId(mg.id)}
            >
              <Text style={[styles.chipText, muscleGroupId === mg.id && styles.chipTextActive]}>
                {mg.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.filterLabel}>Equipo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          <TouchableOpacity
            style={[styles.chip, !equipmentId && styles.chipActive]}
            onPress={() => setEquipmentId(null)}
          >
            <Text style={[styles.chipText, !equipmentId && styles.chipTextActive]}>Todos</Text>
          </TouchableOpacity>
          {(equipmentList ?? []).map((eq) => (
            <TouchableOpacity
              key={eq.id}
              style={[styles.chip, equipmentId === eq.id && styles.chipActive]}
              onPress={() => setEquipmentId(eq.id)}
            >
              <Text style={[styles.chipText, equipmentId === eq.id && styles.chipTextActive]}>
                {eq.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <DataTable
        columns={columns}
        rows={exercises ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyLabel="No hay ejercicios que coincidan con los filtros."
        renderActions={(row) => (
          <>
            <TouchableOpacity onPress={() => router.push(`/admin/exercises/${row.id}`)}>
              <Ionicons name="create-outline" size={20} color={WolfTheme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteTarget(row)}>
              <Ionicons name="trash-outline" size={20} color={WolfTheme.colors.error} />
            </TouchableOpacity>
          </>
        )}
      />

      <ConfirmDeleteModal
        visible={!!deleteTarget}
        message={`¿Eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        loading={deleteExercise.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <AlertModal
        visible={!!offerDeactivate}
        type="error"
        title="No se puede eliminar"
        message={`"${offerDeactivate?.name}" está en uso en una o más sesiones. ¿Querés desactivarlo en su lugar? Dejará de aparecer en el catálogo, pero las sesiones existentes lo conservan.`}
        buttonLabel="Desactivar"
        onConfirm={handleDeactivate}
        onDismiss={() => setOfferDeactivate(null)}
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

const styles = StyleSheet.create({
  container: {
    padding: WolfTheme.spacing.xl,
    gap: WolfTheme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
  },
  filtersBlock: {
    gap: WolfTheme.spacing.xs,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
    marginTop: WolfTheme.spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: WolfTheme.colors.surfaceLight,
    marginRight: WolfTheme.spacing.sm,
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
})
