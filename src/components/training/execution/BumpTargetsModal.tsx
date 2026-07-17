import { useEffect, useRef, useState } from 'react'
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { PrimaryButton } from '@/components/training/shared/PrimaryButton'

export interface BumpDeltas {
  weight: boolean
  sets: boolean
  reps: boolean
}

interface BumpTargetsModalProps {
  visible: boolean
  onDismiss: () => void
  onManual: () => void
  onApplyBump: (deltas: BumpDeltas) => void
}

type Step = 'confirm' | 'choose' | 'form'

const BUMP_OPTIONS: { key: keyof BumpDeltas; label: string }[] = [
  { key: 'weight', label: 'Peso (+5 kg)' },
  { key: 'sets', label: 'Series (+1)' },
  { key: 'reps', label: 'Repeticiones (+2)' },
]

/**
 * Shown when re-entering a session that already has a completed execution.
 * Small internal wizard: confirm -> choose (form/manual) -> form (checkboxes).
 */
export function BumpTargetsModal({
  visible,
  onDismiss,
  onManual,
  onApplyBump,
}: BumpTargetsModalProps) {
  const [step, setStep] = useState<Step>('confirm')
  const [deltas, setDeltas] = useState<BumpDeltas>({ weight: false, sets: false, reps: false })
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      setStep('confirm')
      setDeltas({ weight: false, sets: false, reps: false })
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

  const toggleDelta = (key: keyof BumpDeltas) => {
    setDeltas((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const hasAnyDelta = deltas.weight || deltas.sets || deltas.reps

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
          {step === 'confirm' && (
            <>
              <Text style={styles.title}>¿Querés modificar los objetivos?</Text>
              <Text style={styles.message}>
                Ya completaste esta sesión antes. Podés ajustar el peso, las series o las
                repeticiones objetivo para esta vuelta.
              </Text>
              <View style={styles.buttonsContainer}>
                <PrimaryButton
                  label="Sí, modificar"
                  onPress={() => setStep('choose')}
                  variant="filled"
                  size="lg"
                />
                <PrimaryButton
                  label="No, mantener"
                  onPress={onDismiss}
                  variant="ghost"
                  size="lg"
                />
              </View>
            </>
          )}

          {step === 'choose' && (
            <>
              <Text style={styles.title}>¿Cómo querés modificarlos?</Text>
              <Text style={styles.message}>
                Con formulario aumentás todos los ejercicios de golpe. Manualmente editás cada
                ejercicio por separado.
              </Text>
              <View style={styles.buttonsContainer}>
                <PrimaryButton
                  label="Con formulario"
                  onPress={() => setStep('form')}
                  variant="filled"
                  size="lg"
                />
                <PrimaryButton label="Manualmente" onPress={onManual} variant="outline" size="lg" />
                <PrimaryButton label="Cancelar" onPress={onDismiss} variant="ghost" size="lg" />
              </View>
            </>
          )}

          {step === 'form' && (
            <>
              <Text style={styles.title}>¿Qué querés aumentar?</Text>
              <Text style={styles.message}>Se aplica a todos los ejercicios de la sesión.</Text>

              <View style={styles.checkboxList}>
                {BUMP_OPTIONS.map((option) => {
                  const checked = deltas[option.key]
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={styles.checkboxRow}
                      onPress={() => toggleDelta(option.key)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                        {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
                      </View>
                      <Text style={styles.checkboxLabel}>{option.label}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>

              <View style={styles.buttonsContainer}>
                <PrimaryButton
                  label="Aplicar a todos los ejercicios"
                  onPress={() => onApplyBump(deltas)}
                  variant="filled"
                  size="lg"
                  disabled={!hasAnyDelta}
                />
                <PrimaryButton label="Cancelar" onPress={onDismiss} variant="ghost" size="lg" />
              </View>
            </>
          )}
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
  checkboxList: {
    gap: WolfTheme.spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
    backgroundColor: WolfTheme.colors.surfaceLight,
    borderRadius: 12,
    padding: WolfTheme.spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: WolfTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: WolfTheme.colors.primary,
    borderColor: WolfTheme.colors.primary,
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
})
