import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { supabase } from '@/lib/supabase'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator'

const registerSchema = z
  .object({
    displayName: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

function getErrorMessage(message: string): string {
  if (message.includes('already registered') || message.includes('already been registered')) {
    return 'El email ya está en uso'
  }
  if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
    return 'Error de conexión, intentá nuevamente'
  }
  return 'Ocurrió un error. Intentá nuevamente'
}

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [registrationSucceeded, setRegistrationSucceeded] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const passwordValue = watch('password') ?? ''

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    setErrorMessage(null)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { display_name: data.displayName } },
    })
    setLoading(false)

    if (error) {
      setErrorMessage(getErrorMessage(error.message))
    } else {
      setRegistrationSucceeded(true)
    }
  }

  if (registrationSucceeded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={72} color={WolfTheme.colors.success} />
          <Text style={styles.successTitle}>¡Cuenta creada!</Text>
          <Text testID="register-success-message" style={styles.successText}>
            Revisá tu email para confirmar tu cuenta antes de iniciar sesión.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.primaryButtonText}>Ir a iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>← Volver</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Crear cuenta</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Nombre</Text>
              <Controller
                control={control}
                name="displayName"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    testID="register-display-name-input"
                    style={[styles.input, errors.displayName && styles.inputError]}
                    placeholder="Tu nombre"
                    placeholderTextColor={WolfTheme.colors.textSecondary}
                    autoComplete="name"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.displayName && (
                <Text style={styles.errorText}>{errors.displayName.message}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    testID="register-email-input"
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="tu@email.com"
                    placeholderTextColor={WolfTheme.colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Contraseña</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <PasswordInput
                    testID="register-password-input"
                    toggleTestID="register-password-toggle-button"
                    placeholder="Mínimo 8 caracteres"
                    hasError={!!errors.password}
                    value={value ?? ''}
                    onChangeText={onChange}
                    autoComplete="new-password"
                  />
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
              <PasswordStrengthIndicator
                testID="register-password-strength-indicator"
                password={passwordValue}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <PasswordInput
                    testID="register-password-confirm-input"
                    toggleTestID="register-password-confirm-toggle-button"
                    placeholder="Repetir contraseña"
                    hasError={!!errors.confirmPassword}
                    value={value ?? ''}
                    onChangeText={onChange}
                    autoComplete="new-password"
                  />
                )}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
              )}
            </View>

            {errorMessage && (
              <Text testID="register-error-message" style={styles.formErrorText}>
                {errorMessage}
              </Text>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              testID="register-submit-button"
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={WolfTheme.colors.background} />
              ) : (
                <Text style={styles.primaryButtonText}>Crear cuenta</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>¿Ya tenés cuenta? </Text>
              <TouchableOpacity
                testID="register-login-link"
                onPress={() => router.replace('/(auth)/login')}
              >
                <Text style={styles.loginLink}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingTop: WolfTheme.spacing.md,
    paddingBottom: WolfTheme.spacing.xl,
    gap: WolfTheme.spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    gap: WolfTheme.spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    color: WolfTheme.colors.accent,
    fontSize: 16,
  },
  title: {
    fontSize: WolfTheme.typography.h1.fontSize,
    fontWeight: WolfTheme.typography.h1.fontWeight,
    color: WolfTheme.colors.textPrimary,
  },
  form: {
    gap: WolfTheme.spacing.md,
  },
  field: {
    gap: WolfTheme.spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: WolfTheme.colors.textSecondary,
  },
  input: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.input,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    height: 52,
    paddingHorizontal: WolfTheme.spacing.md,
    color: WolfTheme.colors.textPrimary,
    fontSize: 16,
  },
  inputError: {
    borderColor: WolfTheme.colors.error,
  },
  errorText: {
    fontSize: 12,
    color: WolfTheme.colors.error,
  },
  formErrorText: {
    fontSize: 14,
    color: WolfTheme.colors.error,
    textAlign: 'center',
    backgroundColor: 'rgba(223,106,106,0.1)',
    borderRadius: WolfTheme.radius.input,
    paddingVertical: WolfTheme.spacing.sm,
    paddingHorizontal: WolfTheme.spacing.md,
  },
  actions: {
    gap: WolfTheme.spacing.md,
  },
  primaryButton: {
    backgroundColor: WolfTheme.colors.primary,
    borderRadius: WolfTheme.radius.button,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: WolfTheme.colors.background,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: WolfTheme.colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: WolfTheme.colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: WolfTheme.spacing.xl,
    gap: WolfTheme.spacing.lg,
  },
  successTitle: {
    fontSize: WolfTheme.typography.h1.fontSize,
    fontWeight: WolfTheme.typography.h1.fontWeight,
    color: WolfTheme.colors.textPrimary,
    textAlign: 'center',
  },
  successText: {
    fontSize: WolfTheme.typography.body.fontSize,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
})
