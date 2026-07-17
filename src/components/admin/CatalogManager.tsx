import { useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { Button } from '@/components/ui/Button'
import { AlertModal } from '@/components/ui/AlertModal'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'

export interface CatalogItem {
  id: string
  name: string
}

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23503'
  )
}

interface CatalogManagerProps {
  title: string
  itemLabel: string
  items: CatalogItem[] | undefined
  isLoading: boolean
  creating?: boolean
  updating?: boolean
  deleting?: boolean
  onCreate: (name: string) => Promise<void>
  onUpdate: (id: string, name: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

/** Simple name-only catalog CRUD, shared by muscle groups and equipment. */
export function CatalogManager({
  title,
  itemLabel,
  items,
  isLoading,
  creating,
  updating,
  deleting,
  onCreate,
  onUpdate,
  onDelete,
}: CatalogManagerProps) {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<CatalogItem | null>(null)
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null)
  const [errorAlert, setErrorAlert] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      await onCreate(newName.trim())
      setNewName('')
    } catch {
      setErrorAlert(`No se pudo crear ${itemLabel}.`)
    }
  }

  const startEditing = (item: CatalogItem) => {
    setEditingId(item.id)
    setEditingName(item.name)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) return
    try {
      await onUpdate(editingId, editingName.trim())
      setEditingId(null)
    } catch {
      setErrorAlert(`No se pudo actualizar ${itemLabel}.`)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await onDelete(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      setDeleteTarget(null)
      if (isForeignKeyViolation(err)) {
        setBlockedMessage(`"${deleteTarget.name}" está en uso por uno o más ejercicios. No se puede eliminar.`)
      } else {
        setErrorAlert(`No se pudo eliminar ${itemLabel}.`)
      }
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          value={newName}
          onChangeText={setNewName}
          placeholder={`Nuevo ${itemLabel}...`}
          placeholderTextColor={WolfTheme.colors.textSecondary}
        />
        <Button label="Agregar" onPress={handleCreate} loading={creating} size="sm" />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={WolfTheme.colors.primary} style={styles.loader} />
      ) : (
        <View style={styles.list}>
          {(items ?? []).map((item) => (
            <View key={item.id} style={styles.row}>
              {editingId === item.id ? (
                <>
                  <TextInput
                    style={styles.editInput}
                    value={editingName}
                    onChangeText={setEditingName}
                    autoFocus
                  />
                  <TouchableOpacity onPress={handleSaveEdit} hitSlop={8} disabled={updating}>
                    <Ionicons name="checkmark-circle-outline" size={22} color={WolfTheme.colors.success} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setEditingId(null)} hitSlop={8}>
                    <Ionicons name="close-circle-outline" size={22} color={WolfTheme.colors.textSecondary} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.nameButton} onPress={() => startEditing(item)}>
                    <Text style={styles.rowText}>{item.name}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setDeleteTarget(item)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={20} color={WolfTheme.colors.error} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          ))}
          {(items ?? []).length === 0 && (
            <Text style={styles.emptyText}>No hay {itemLabel}s creados todavía.</Text>
          )}
        </View>
      )}

      <ConfirmDeleteModal
        visible={!!deleteTarget}
        message={`¿Eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        loading={!!deleting}
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
    maxWidth: 480,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  addRow: {
    flexDirection: 'row',
    gap: WolfTheme.spacing.sm,
    alignItems: 'center',
  },
  addInput: {
    flex: 1,
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.input,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    height: 44,
    paddingHorizontal: WolfTheme.spacing.md,
    color: WolfTheme.colors.textPrimary,
    fontSize: 15,
  },
  loader: {
    marginTop: WolfTheme.spacing.xl,
  },
  list: {
    gap: WolfTheme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
    paddingVertical: WolfTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: WolfTheme.colors.border,
  },
  nameButton: {
    flex: 1,
  },
  rowText: {
    fontSize: 14,
    color: WolfTheme.colors.textPrimary,
  },
  editInput: {
    flex: 1,
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.input,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    height: 36,
    paddingHorizontal: WolfTheme.spacing.sm,
    color: WolfTheme.colors.textPrimary,
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    color: WolfTheme.colors.textSecondary,
  },
})
