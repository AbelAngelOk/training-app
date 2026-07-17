import { useMemo, useState } from 'react'
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { WolfTheme } from '@/constants/colors'
import { useSetUserRole, useUsersAdmin } from '@/hooks/use-admin'
import { useAuthStore } from '@/stores/auth-store'
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable'
import { SearchInput } from '@/components/training/shared/SearchInput'
import { AlertModal } from '@/components/ui/AlertModal'
import type { AdminUserRow } from '@/api/admin'
import type { UserRole } from '@/types/database'

const ROLE_LABEL: Record<UserRole, string> = {
  free_user: 'Usuario gratuito',
  premium_user: 'Usuario premium',
  coach: 'Coach',
  admin: 'Admin',
}

const ROLES: UserRole[] = ['free_user', 'premium_user', 'coach', 'admin']

export default function AdminUsersScreen() {
  const [search, setSearch] = useState('')
  const [roleTarget, setRoleTarget] = useState<AdminUserRow | null>(null)
  const [errorAlert, setErrorAlert] = useState<string | null>(null)
  const currentUserId = useAuthStore((s) => s.user?.id)

  const { data: users, isLoading } = useUsersAdmin({ search })
  const setUserRole = useSetUserRole()

  const columns = useMemo<DataTableColumn<AdminUserRow>[]>(
    () => [
      { key: 'email', header: 'Email', width: 260, render: (row) => row.email },
      {
        key: 'role',
        header: 'Rol',
        width: 200,
        render: (row) =>
          row.id === currentUserId ? (
            <Text style={styles.selfText}>{ROLE_LABEL[row.role]} (vos)</Text>
          ) : (
            <TouchableOpacity onPress={() => setRoleTarget(row)}>
              <Text style={styles.roleButton}>{ROLE_LABEL[row.role]}</Text>
            </TouchableOpacity>
          ),
      },
      {
        key: 'created_at',
        header: 'Registrado',
        width: 140,
        render: (row) => new Date(row.created_at).toLocaleDateString('es-AR'),
      },
    ],
    [currentUserId]
  )

  const handleSetRole = async (role: UserRole) => {
    if (!roleTarget) return
    try {
      await setUserRole.mutateAsync({ userId: roleTarget.id, role })
      setRoleTarget(null)
    } catch {
      setErrorAlert('No se pudo cambiar el rol. Intentá de nuevo.')
      setRoleTarget(null)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Usuarios</Text>
        <Text style={styles.subtitle}>{users?.length ?? 0} resultados</Text>
      </View>

      <SearchInput value={search} onChangeText={setSearch} placeholder="Buscar por email..." />

      <DataTable
        columns={columns}
        rows={users ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyLabel="No hay usuarios que coincidan con la búsqueda."
      />

      <Modal visible={!!roleTarget} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cambiar rol de {roleTarget?.email}</Text>
            {ROLES.map((role) => (
              <TouchableOpacity key={role} style={styles.modalItem} onPress={() => handleSetRole(role)}>
                <Text style={styles.modalItemText}>{ROLE_LABEL[role]}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setRoleTarget(null)} style={styles.modalCancelButton}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  roleButton: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.primary,
  },
  selfText: {
    fontSize: 14,
    color: WolfTheme.colors.textSecondary,
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
    gap: WolfTheme.spacing.sm,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    marginBottom: WolfTheme.spacing.xs,
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
    marginTop: WolfTheme.spacing.xs,
  },
  modalCancel: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
  },
})
