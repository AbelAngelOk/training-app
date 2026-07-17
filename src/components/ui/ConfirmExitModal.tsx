import { useEffect, useRef } from 'react'
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { WolfTheme } from '@/constants/colors'
import { PrimaryButton } from '@/components/training/shared/PrimaryButton'

interface ConfirmExitModalProps {
  visible: boolean
  onCancel: () => void
  onExit: () => void
  onSaveAndExit: () => void
  title?: string
  message?: string
  saveLabel?: string
  exitLabel?: string
  cancelLabel?: string
  /** Optional 4th action: complete the workout now, incomplete exercises and all */
  onFinishIncomplete?: () => void
  finishIncompleteLabel?: string
}

export function ConfirmExitModal({
  visible,
  onCancel,
  onExit,
  onSaveAndExit,
  title = 'Salir del entrenamiento',
  message = 'Si sales ahora, el progreso no guardado de esta sesión podría perderse.',
  saveLabel = 'Guardar y salir',
  exitLabel = 'Salir sin guardar',
  cancelLabel = 'Cancelar',
  onFinishIncomplete,
  finishIncompleteLabel = 'Finalizar entrenamiento incompleto',
}: ConfirmExitModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 0,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible, scaleAnim, opacityAnim])

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: opacityAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {/* Save and exit button */}
            <PrimaryButton
              label={saveLabel}
              onPress={onSaveAndExit}
              variant="filled"
              size="lg"
            />

            {/* Finish now, incomplete */}
            {onFinishIncomplete && (
              <PrimaryButton
                label={finishIncompleteLabel}
                onPress={onFinishIncomplete}
                variant="outline"
                size="lg"
              />
            )}

            {/* Exit without saving button */}
            <TouchableOpacity style={styles.destructiveButton} onPress={onExit}>
              <Text style={styles.destructiveButtonText}>{exitLabel}</Text>
            </TouchableOpacity>

            {/* Cancel button */}
            <PrimaryButton
              label={cancelLabel}
              onPress={onCancel}
              variant="ghost"
              size="lg"
            />
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
    width: '85%',
    maxWidth: 360,
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
  buttonsContainer: {
    gap: WolfTheme.spacing.sm,
  },
  destructiveButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: WolfTheme.colors.error,
    borderRadius: WolfTheme.radius.button,
    paddingHorizontal: WolfTheme.spacing.xl,
    paddingVertical: WolfTheme.spacing.md,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  destructiveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: WolfTheme.colors.error,
  },
})
