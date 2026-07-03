import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { WolfTheme } from '@/constants/colors'

interface AlertModalProps {
  visible: boolean
  title: string
  message: string
  type?: 'success' | 'error' | 'info'
  onDismiss: () => void
  onConfirm?: () => void
  buttonLabel?: string
}

export function AlertModal({
  visible,
  title,
  message,
  type = 'info',
  onDismiss,
  onConfirm,
  buttonLabel = 'Aceptar',
}: AlertModalProps) {
  const isError = type === 'error'
  const isSuccess = type === 'success'

  const iconColor = isError ? '#EF4444' : isSuccess ? '#22C55E' : WolfTheme.colors.primary
  const iconName = isError ? 'alert-circle' : isSuccess ? 'checkmark-circle' : 'information-circle'
  const bgColor = isError ? '#FEE2E2' : isSuccess ? '#DBEAFE' : '#F3E8FF'

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
            <Ionicons name={iconName as any} size={48} color={iconColor} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Button */}
          <TouchableOpacity
            style={[styles.button, isError && styles.buttonError, isSuccess && styles.buttonSuccess]}
            onPress={onConfirm || onDismiss}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.buttonText,
                isError && styles.buttonTextError,
                isSuccess && styles.buttonTextSuccess,
              ]}
            >
              {buttonLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    borderRadius: WolfTheme.radius.card,
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingTop: WolfTheme.spacing.xl,
    paddingBottom: WolfTheme.spacing.lg,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  button: {
    backgroundColor: WolfTheme.colors.primary,
    borderRadius: WolfTheme.radius.button,
    paddingHorizontal: WolfTheme.spacing.xl,
    paddingVertical: WolfTheme.spacing.md,
    width: '100%',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: WolfTheme.spacing.sm,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  buttonError: {
    backgroundColor: '#EF4444',
  },
  buttonTextError: {
    color: '#fff',
  },
  buttonSuccess: {
    backgroundColor: '#22C55E',
  },
  buttonTextSuccess: {
    color: '#fff',
  },
})
