import { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import {
  useDeleteOfficialProgram,
  useProgramsAdmin,
  useSetProgramStatus,
} from '@/hooks/use-programs'
import { getProgramAssignmentCount, type ProgramAdminRow } from '@/api/programs'
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { SearchInput } from '@/components/training/shared/SearchInput'
import { AlertModal } from '@/components/ui/AlertModal'
import { Button } from '@/components/ui/Button'
import type { ContentStatus } from '@/types/database'

const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
}

const STATUS_COLOR: Record<ContentStatus, string> = {
  draft: WolfTheme.colors.warning,
  published: WolfTheme.colors.success,
  archived: WolfTheme.colors.textSecondary,
}

const STATUS_FILTERS: { value: ContentStatus | null; label: string }[] = [
  { value: null, label: 'Todos' },
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Archivado' },
]

export default function AdminProgramsScreen() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContentStatus | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProgramAdminRow | null>(null)
  const [offerArchive, setOfferArchive] = useState<ProgramAdminRow | null>(null)
  const [errorAlert, setErrorAlert] = useState<string | null>(null)

  const { data: programs, isLoading } = useProgramsAdmin({ search })
  const deleteProgram = useDeleteOfficialProgram()
  const setProgramStatus = useSetProgramStatus()

  const filteredPrograms = useMemo(
    () => (programs ?? []).filter((p) => !statusFilter || p.status === statusFilter),
    [programs, statusFilter]
  )

  const columns = useMemo<DataTableColumn<ProgramAdminRow>[]>(
    () => [
      { key: 'name', header: 'Nombre', width: 260, render: (row) => row.name },
      {
        key: 'status',
        header: 'Estado',
        width: 140,
        render: (row) => (
          <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLOR[row.status]}22` }]}>
            <Text style={[styles.statusText, { color: STATUS_COLOR[row.status] }]}>
              {STATUS_LABEL[row.status]}
            </Text>
          </View>
        ),
      },
      {
        key: 'days',
        header: 'Días configurados',
        width: 160,
        render: (row) => `${row.program_days?.[0]?.count ?? 0}`,
      },
    ],
    []
  )

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const assignmentCount = await getProgramAssignmentCount(deleteTarget.id)
      if (assignmentCount > 0) {
        setOfferArchive(deleteTarget)
        setDeleteTarget(null)
        return
      }
      await deleteProgram.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      setErrorAlert('No se pudo eliminar el programa. Intentá de nuevo.')
      setDeleteTarget(null)
    }
  }

  const handleArchive = async () => {
    if (!offerArchive) return
    try {
      await setProgramStatus.mutateAsync({ id: offerArchive.id, status: 'archived' })
    } catch {
      setErrorAlert('No se pudo archivar el programa.')
    } finally {
      setOfferArchive(null)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Programas</Text>
          <Text style={styles.subtitle}>{filteredPrograms.length} resultados</Text>
        </View>
        <Button label="Nuevo programa" onPress={() => router.push('/admin/programs/new')} size="md" />
      </View>

      <SearchInput value={search} onChangeText={setSearch} placeholder="Buscar por nombre..." />

      <View style={styles.filtersBlock}>
        <Text style={styles.filterLabel}>Estado</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {STATUS_FILTERS.map((s) => (
            <TouchableOpacity
              key={s.label}
              style={[styles.chip, statusFilter === s.value && styles.chipActive]}
              onPress={() => setStatusFilter(s.value)}
            >
              <Text style={[styles.chipText, statusFilter === s.value && styles.chipTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <DataTable
        columns={columns}
        rows={filteredPrograms}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyLabel="No hay programas que coincidan con los filtros."
        renderActions={(row) => (
          <>
            <TouchableOpacity onPress={() => router.push(`/admin/programs/${row.id}`)}>
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
        loading={deleteProgram.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <AlertModal
        visible={!!offerArchive}
        type="error"
        title="No se puede eliminar"
        message={`"${offerArchive?.name}" tiene usuarios con este programa asignado. ¿Querés archivarlo en su lugar? Dejará de estar disponible para nuevas asignaciones, pero los usuarios que ya lo tienen lo conservan.`}
        buttonLabel="Archivar"
        onConfirm={handleArchive}
        onDismiss={() => setOfferArchive(null)}
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
})
