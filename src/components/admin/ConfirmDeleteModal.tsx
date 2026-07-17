import { useEffect, useRef } from 'react'
import { Animated, Modal, StyleSheet, Text, View } from 'react-native'

import { WolfTheme } from '@/constants/colors'
import { Button } from '@/components/ui/Button'

interface ConfirmDeleteModalProps {
  visible: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Generic delete confirmation for the admin portal, reused across all resource tables. */
export function ConfirmDeleteModal({
  visible,
  title = 'Confirmar eliminación',
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: visible ? 1 : 0.8, useNativeDriver: true, bounciness: 0 }),
      Animated.timing(opacityAnim, { toValue: visible ? 1 : 0, duration: visible ? 200 : 150, useNativeDriver: true }),
    ]).start()
  }, [visible, scaleAnim, opacityAnim])

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <Button label={confirmLabel} onPress={onConfirm} variant="danger" loading={loading} />
            <Button label={cancelLabel} onPress={onCancel} variant="ghost" disabled={loading} />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: WolfTheme.colors.background,
    borderRadius: WolfTheme.radius.modal,
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingVertical: WolfTheme.spacing.xl,
    width: '90%',
    maxWidth: 400,
    gap: WolfTheme.spacing.lg,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttons: {
    gap: WolfTheme.spacing.sm,
  },
})
