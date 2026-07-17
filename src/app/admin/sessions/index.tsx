import { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useDeleteOfficialSession, useSessionsAdmin } from '@/hooks/use-sessions'
import { getSessionProgramDayUsage } from '@/api/sessions'
import type { SessionAdminRow } from '@/api/sessions'
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { SearchInput } from '@/components/training/shared/SearchInput'
import { AlertModal } from '@/components/ui/AlertModal'
import { Button } from '@/components/ui/Button'

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23503'
  )
}

export default function AdminSessionsScreen() {
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<SessionAdminRow | null>(null)
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null)
  const [errorAlert, setErrorAlert] = useState<string | null>(null)

  const { data: sessions, isLoading } = useSessionsAdmin({ search })
  const deleteSession = useDeleteOfficialSession()

  const columns = useMemo<DataTableColumn<SessionAdminRow>[]>(
    () => [
      { key: 'name', header: 'Nombre', width: 260, render: (row) => row.name },
      {
        key: 'duration',
        header: 'Duración estimada',
        width: 160,
        render: (row) =>
          row.estimated_duration_minutes ? `${row.estimated_duration_minutes} min` : '—',
      },
      {
        key: 'exercises',
        header: 'Ejercicios',
        width: 120,
        render: (row) => `${row.session_exercises?.[0]?.count ?? 0}`,
      },
    ],
    []
  )

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const dayUsage = await getSessionProgramDayUsage(deleteTarget.id)
      if (dayUsage > 0) {
        setBlockedMessage(
          `"${deleteTarget.name}" está asignada a ${dayUsage} día(s) de programa/reto. Quitá esas asociaciones antes de eliminarla.`
        )
        setDeleteTarget(null)
        return
      }
      await deleteSession.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      if (isForeignKeyViolation(err)) {
        setBlockedMessage(
          `"${deleteTarget.name}" tiene historial de entrenamientos registrado y no se puede eliminar.`
        )
      } else {
        setErrorAlert('No se pudo eliminar la sesión. Intentá de nuevo.')
      }
      setDeleteTarget(null)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sesiones</Text>
          <Text style={styles.subtitle}>{sessions?.length ?? 0} resultados</Text>
        </View>
        <Button label="Nueva sesión" onPress={() => router.push('/admin/sessions/new')} size="md" />
      </View>

      <SearchInput value={search} onChangeText={setSearch} placeholder="Buscar por nombre..." />

      <DataTable
        columns={columns}
        rows={sessions ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyLabel="No hay sesiones que coincidan con la búsqueda."
        renderActions={(row) => (
          <>
            <TouchableOpacity onPress={() => router.push(`/admin/sessions/${row.id}`)}>
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
        loading={deleteSession.isPending}
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
