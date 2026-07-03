import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { supabase } from '@/lib/supabase'
import { PasswordInput } from '@/components/ui/PasswordInput'

type ActiveSection = null | 'email' | 'password'

export default function SettingsScreen() {
  const [activeSection, setActiveSection] = useState<ActiveSection>(null)

  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const toggleSection = (section: ActiveSection) => {
    setActiveSection(activeSection === section ? null : section)
    setEmailError(null)
    setPasswordError(null)
    setEmailSuccess(false)
    setPasswordSuccess(false)
  }

  const handleChangeEmail = async () => {
    if (!newEmail.includes('@')) {
      setEmailError('Email inválido')
      return
    }
    setEmailLoading(true)
    setEmailError(null)
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    setEmailLoading(false)
    if (error) {
      setEmailError('No se pudo actualizar el email. Verificá tus datos.')
    } else {
      setEmailSuccess(true)
      setNewEmail('')
    }
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
      return
    }
    setPasswordLoading(true)
    setPasswordError(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordLoading(false)
    if (error) {
      setPasswordError('No se pudo actualizar la contraseña.')
    } else {
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.menuCard}>
          <TouchableOpacity
            testID="settings-change-email-button"
            style={styles.menuItem}
            onPress={() => toggleSection('email')}
          >
            <Ionicons name="mail-outline" size={20} color={WolfTheme.colors.textSecondary} />
            <Text style={styles.menuLabel}>Cambiar email</Text>
            <Ionicons
              name={activeSection === 'email' ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={WolfTheme.colors.textSecondary}
            />
          </TouchableOpacity>

          {activeSection === 'email' && (
            <View style={styles.expandedSection}>
              <Text style={styles.sectionNote}>
                Se enviará un link de confirmación a tu nuevo email.
              </Text>
              <TextInput
                testID="settings-new-email-input"
                style={styles.input}
                placeholder="Nuevo email"
                placeholderTextColor={WolfTheme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={newEmail}
                onChangeText={setNewEmail}
              />
              {emailError && (
                <Text testID="settings-error-message" style={styles.errorText}>{emailError}</Text>
              )}
              {emailSuccess && (
                <Text testID="settings-success-message" style={styles.successText}>
                  Revisá tu nuevo email para confirmar el cambio.
                </Text>
              )}
              <TouchableOpacity
                testID="settings-save-button"
                style={[styles.actionButton, emailLoading && styles.buttonDisabled]}
                onPress={handleChangeEmail}
                disabled={emailLoading}
              >
                {emailLoading ? (
                  <ActivityIndicator color={WolfTheme.colors.background} />
                ) : (
                  <Text style={styles.actionButtonText}>Actualizar email</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.menuDivider} />

          <TouchableOpacity
            testID="settings-change-password-button"
            style={styles.menuItem}
            onPress={() => toggleSection('password')}
          >
            <Ionicons name="lock-closed-outline" size={20} color={WolfTheme.colors.textSecondary} />
            <Text style={styles.menuLabel}>Cambiar contraseña</Text>
            <Ionicons
              name={activeSection === 'password' ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={WolfTheme.colors.textSecondary}
            />
          </TouchableOpacity>

          {activeSection === 'password' && (
            <View style={styles.expandedSection}>
              <PasswordInput
                testID="settings-current-password-input"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Contraseña actual"
                autoComplete="current-password"
              />
              <PasswordInput
                testID="settings-new-password-input"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nueva contraseña (mín. 8 caracteres)"
                autoComplete="new-password"
              />
              <PasswordInput
                testID="settings-confirm-password-input"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmar nueva contraseña"
                autoComplete="new-password"
              />
              {passwordError && (
                <Text testID="settings-error-message" style={styles.errorText}>{passwordError}</Text>
              )}
              {passwordSuccess && (
                <Text testID="settings-success-message" style={styles.successText}>
                  Contraseña actualizada correctamente.
                </Text>
              )}
              <TouchableOpacity
                testID="settings-save-button"
                style={[styles.actionButton, passwordLoading && styles.buttonDisabled]}
                onPress={handleChangePassword}
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <ActivityIndicator color={WolfTheme.colors.background} />
                ) : (
                  <Text style={styles.actionButtonText}>Actualizar contraseña</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
  },
  content: {
    padding: WolfTheme.spacing.lg,
  },
  menuCard: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: WolfTheme.typography.body.fontSize,
    color: WolfTheme.colors.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: WolfTheme.colors.border,
  },
  expandedSection: {
    paddingHorizontal: WolfTheme.spacing.md,
    paddingBottom: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.sm,
  },
  sectionNote: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
    lineHeight: 18,
  },
  input: {
    backgroundColor: WolfTheme.colors.background,
    borderRadius: WolfTheme.radius.input,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    height: 52,
    paddingHorizontal: WolfTheme.spacing.md,
    color: WolfTheme.colors.textPrimary,
    fontSize: 16,
  },
  errorText: {
    fontSize: 13,
    color: WolfTheme.colors.error,
  },
  successText: {
    fontSize: 13,
    color: WolfTheme.colors.success,
  },
  actionButton: {
    backgroundColor: WolfTheme.colors.primary,
    borderRadius: WolfTheme.radius.button,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: WolfTheme.spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: WolfTheme.colors.background,
  },
})
