import { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useAchievements, useDeleteAchievement } from '@/hooks/use-achievements'
import { getAchievementUsage } from '@/api/achievements'
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { AlertModal } from '@/components/ui/AlertModal'
import { Button } from '@/components/ui/Button'
import type { AchievementRow } from '@/types/database'

export default function AdminAchievementsScreen() {
  const [deleteTarget, setDeleteTarget] = useState<AchievementRow | null>(null)
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null)
  const [errorAlert, setErrorAlert] = useState<string | null>(null)

  const { data: achievements, isLoading } = useAchievements()
  const deleteAchievement = useDeleteAchievement()

  const columns = useMemo<DataTableColumn<AchievementRow>[]>(
    () => [
      { key: 'code', header: 'Código', width: 220, render: (row) => row.code },
      { key: 'name', header: 'Nombre', width: 260, render: (row) => row.name },
      { key: 'description', header: 'Descripción', width: 320, render: (row) => row.description ?? '—' },
    ],
    []
  )

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const usage = await getAchievementUsage(deleteTarget.id)
      if (usage.challenges > 0 || usage.usersUnlocked > 0) {
        const parts: string[] = []
        if (usage.challenges > 0) parts.push(`${usage.challenges} reto(s)`)
        if (usage.usersUnlocked > 0) parts.push(`${usage.usersUnlocked} usuario(s) que ya lo desbloquearon`)
        setBlockedMessage(
          `No se puede eliminar "${deleteTarget.name}": está en uso por ${parts.join(' y ')}. Editá o reasigná esas referencias primero.`
        )
        setDeleteTarget(null)
        return
      }
      await deleteAchievement.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      setErrorAlert('No se pudo eliminar el logro. Intentá de nuevo.')
      setDeleteTarget(null)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Logros</Text>
          <Text style={styles.subtitle}>{achievements?.length ?? 0} resultados</Text>
        </View>
        <Button label="Nuevo logro" onPress={() => router.push('/admin/achievements/new')} size="md" />
      </View>

      <DataTable
        columns={columns}
        rows={achievements ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyLabel="No hay logros creados todavía."
        renderActions={(row) => (
          <>
            <TouchableOpacity onPress={() => router.push(`/admin/achievements/${row.id}`)}>
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
        loading={deleteAchievement.isPending}
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
