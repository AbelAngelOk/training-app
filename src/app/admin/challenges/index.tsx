import { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import {
  useChallengesAdmin,
  useDeleteChallenge,
  useSetChallengeStatus,
} from '@/hooks/use-challenges'
import { getProgramAssignmentCount } from '@/api/programs'
import type { ChallengeAdminRow } from '@/api/challenges'
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

export default function AdminChallengesScreen() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContentStatus | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ChallengeAdminRow | null>(null)
  const [offerArchive, setOfferArchive] = useState<ChallengeAdminRow | null>(null)
  const [errorAlert, setErrorAlert] = useState<string | null>(null)

  const { data: challenges, isLoading } = useChallengesAdmin({ search })
  const deleteChallenge = useDeleteChallenge()
  const setChallengeStatus = useSetChallengeStatus()

  const filteredChallenges = useMemo(
    () => (challenges ?? []).filter((c) => !statusFilter || c.status === statusFilter),
    [challenges, statusFilter]
  )

  const columns = useMemo<DataTableColumn<ChallengeAdminRow>[]>(
    () => [
      { key: 'name', header: 'Nombre', width: 240, render: (row) => row.name },
      { key: 'duration', header: 'Duración', width: 100, render: (row) => `${row.duration_days} días` },
      {
        key: 'achievement',
        header: 'Logro',
        width: 200,
        render: (row) => row.achievements?.name ?? '—',
      },
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
      await deleteChallenge.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      setErrorAlert('No se pudo eliminar el reto. Intentá de nuevo.')
      setDeleteTarget(null)
    }
  }

  const handleArchive = async () => {
    if (!offerArchive) return
    try {
      await setChallengeStatus.mutateAsync({ id: offerArchive.id, status: 'archived' })
    } catch {
      setErrorAlert('No se pudo archivar el reto.')
    } finally {
      setOfferArchive(null)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Retos</Text>
          <Text style={styles.subtitle}>{filteredChallenges.length} resultados</Text>
        </View>
        <Button label="Nuevo reto" onPress={() => router.push('/admin/challenges/new')} size="md" />
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
        rows={filteredChallenges}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyLabel="No hay retos que coincidan con los filtros."
        renderActions={(row) => (
          <>
            <TouchableOpacity onPress={() => router.push(`/admin/challenges/${row.id}`)}>
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
        loading={deleteChallenge.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <AlertModal
        visible={!!offerArchive}
        type="error"
        title="No se puede eliminar"
        message={`"${offerArchive?.name}" tiene usuarios con este reto asignado. ¿Querés archivarlo en su lugar? Dejará de estar disponible para nuevas asignaciones, pero los usuarios que ya lo tienen lo conservan.`}
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
