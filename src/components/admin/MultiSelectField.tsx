import { useState } from 'react'
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'

export interface MultiSelectOption {
  id: string
  label: string
}

interface MultiSelectFieldProps {
  options: MultiSelectOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  placeholder?: string
}

/**
 * Trigger cerrado con chips removibles + modal de checkboxes (tocar togglea,
 * no cierra) con botón "Listo" para confirmar. Sin buscador — pensado para
 * listas chicas (grupo muscular/equipo, ~13-21 ítems). Se usa como children
 * de FormField, sin label propio.
 */
export function MultiSelectField({
  options,
  selectedIds,
  onChange,
  placeholder = 'Seleccionar...',
}: MultiSelectFieldProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const selectedOptions = options.filter((o) => selectedIds.includes(o.id))

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]
    )
  }

  const remove = (id: string) => {
    onChange(selectedIds.filter((i) => i !== id))
  }

  return (
    <View>
      <TouchableOpacity style={styles.trigger} onPress={() => setModalOpen(true)}>
        {selectedOptions.length === 0 ? (
          <Text style={styles.placeholder}>{placeholder}</Text>
        ) : (
          <View style={styles.chips}>
            {selectedOptions.map((o) => (
              <View key={o.id} style={styles.chip}>
                <Text style={styles.chipText} numberOfLines={1}>
                  {o.label}
                </Text>
                <TouchableOpacity onPress={() => remove(o.id)} hitSlop={8}>
                  <Ionicons name="close" size={14} color={WolfTheme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <Ionicons name="chevron-down" size={18} color={WolfTheme.colors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={modalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{placeholder}</Text>
            <ScrollView style={styles.modalList}>
              {options.map((o) => {
                const checked = selectedIds.includes(o.id)
                return (
                  <TouchableOpacity
                    key={o.id}
                    style={styles.modalItem}
                    onPress={() => toggle(o.id)}
                  >
                    <Ionicons
                      name={checked ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={checked ? WolfTheme.colors.primary : WolfTheme.colors.textSecondary}
                    />
                    <Text style={styles.modalItemText}>{o.label}</Text>
                  </TouchableOpacity>
                )
              })}
              {options.length === 0 && <Text style={styles.modalEmpty}>No hay opciones cargadas.</Text>}
            </ScrollView>
            <TouchableOpacity onPress={() => setModalOpen(false)} style={styles.doneButton}>
              <Text style={styles.doneButtonText}>Listo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 44,
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.input,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: WolfTheme.spacing.sm,
  },
  placeholder: {
    fontSize: 15,
    color: WolfTheme.colors.textSecondary,
  },
  chips: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WolfTheme.spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: WolfTheme.colors.background,
    borderRadius: WolfTheme.radius.button,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    paddingHorizontal: WolfTheme.spacing.sm,
    paddingVertical: 4,
    maxWidth: 180,
  },
  chipText: {
    fontSize: 13,
    color: WolfTheme.colors.textPrimary,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
    paddingVertical: WolfTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: WolfTheme.colors.border,
  },
  modalItemText: {
    fontSize: 14,
    color: WolfTheme.colors.textPrimary,
    flex: 1,
  },
  modalEmpty: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
    paddingVertical: WolfTheme.spacing.sm,
  },
  doneButton: {
    alignSelf: 'flex-end',
    backgroundColor: WolfTheme.colors.primary,
    borderRadius: WolfTheme.radius.button,
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingVertical: WolfTheme.spacing.sm,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: WolfTheme.colors.background,
  },
})
