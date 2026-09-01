import { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useDeleteMuscleGroup, useMuscleGroups } from '@/hooks/use-exercises'
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { AlertModal } from '@/components/ui/AlertModal'
import { Button } from '@/components/ui/Button'
import type { MuscleGroupRow } from '@/types/database'

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23503'
  )
}

export default function AdminMuscleGroupsScreen() {
  const [deleteTarget, setDeleteTarget] = useState<MuscleGroupRow | null>(null)
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null)
  const [errorAlert, setErrorAlert] = useState<string | null>(null)

  const { data: muscleGroups, isLoading } = useMuscleGroups()
  const deleteMuscleGroup = useDeleteMuscleGroup()

  const columns = useMemo<DataTableColumn<MuscleGroupRow>[]>(
    () => [
      { key: 'name_es', header: 'Nombre (Español)', width: 220, render: (row) => row.name_es },
      { key: 'name_en', header: 'Nombre (English)', width: 220, render: (row) => row.name_en },
    ],
    []
  )

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMuscleGroup.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      setDeleteTarget(null)
      if (isForeignKeyViolation(err)) {
        setBlockedMessage(
          `"${deleteTarget.name_es}" está en uso por uno o más ejercicios. No se puede eliminar.`
        )
      } else {
        setErrorAlert('No se pudo eliminar el grupo muscular. Intentá de nuevo.')
      }
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Grupos musculares</Text>
          <Text style={styles.subtitle}>{muscleGroups?.length ?? 0} resultados</Text>
        </View>
        <Button label="Nuevo grupo muscular" onPress={() => router.push('/admin/muscle-groups/new')} size="md" />
      </View>

      <DataTable
        columns={columns}
        rows={muscleGroups ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyLabel="No hay grupos musculares creados todavía."
        renderActions={(row) => (
          <>
            <TouchableOpacity onPress={() => router.push(`/admin/muscle-groups/${row.id}`)}>
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
        message={`¿Eliminar "${deleteTarget?.name_es}"? Esta acción no se puede deshacer.`}
        loading={deleteMuscleGroup.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <AlertModal
        visible={!!blockedMessage}
        type="error"
        title="No se puede eliminar"
        message={blockedMessage ?? ''}
        onDismiss={() => setBlockedMessage(null)}
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
})
