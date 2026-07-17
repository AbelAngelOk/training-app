import { useEffect, useRef } from 'react'
import { Animated, Modal, StyleSheet, Text, View } from 'react-native'

import { WolfTheme } from '@/constants/colors'
import { PrimaryButton } from '@/components/training/shared/PrimaryButton'

interface FinishIncompleteModalProps {
  visible: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Confirmation shown when the user presses "Finalizar sesión" while there
 * are still incomplete exercises — offers to finish anyway or go back to
 * complete the rest.
 */
export function FinishIncompleteModal({
  visible,
  onConfirm,
  onCancel,
}: FinishIncompleteModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 0 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0.8, duration: 150, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start()
    }
  }, [visible, scaleAnim, opacityAnim])

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.title}>Tenés ejercicios sin completar</Text>
          <Text style={styles.message}>
            ¿Querés finalizar la sesión igual o volver para completar los que faltan?
          </Text>
          <View style={styles.buttonsContainer}>
            <PrimaryButton
              label="Finalizar de todos modos"
              onPress={onConfirm}
              variant="filled"
              size="lg"
            />
            <PrimaryButton
              label="Volver a completar"
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
})
