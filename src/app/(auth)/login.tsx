import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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

import { WolfTheme } from '@/constants/colors'
import { supabase } from '@/lib/supabase'
import { PasswordInput } from '@/components/ui/PasswordInput'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

function getErrorMessage(message: string): string {
  if (
    message.includes('Invalid login credentials') ||
    message.includes('invalid_credentials')
  ) {
    return 'Email o contraseña incorrectos'
  }
  if (message.includes('Email not confirmed')) {
    return 'Confirmá tu email antes de iniciar sesión'
  }
  if (message.includes('suspended')) {
    return 'Tu cuenta ha sido suspendida'
  }
  if (
    message.toLowerCase().includes('network') ||
    message.toLowerCase().includes('fetch') ||
    message.toLowerCase().includes('timeout')
  ) {
    return 'Error de conexión, intentá nuevamente'
  }
  return 'Ocurrió un error inesperado, intentá nuevamente'
}

export default function LoginScreen() {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    if (loading) return
    setLoading(true)
    setErrorMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setErrorMessage(getErrorMessage(error.message))
      setLoading(false)
      return
    }

    // onAuthStateChange updates the store; navigate explicitly to avoid
    // relying on index.tsx redirect (user is not on "/" route)
    router.replace('/(tabs)/training')
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} disabled={loading}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Iniciar sesión</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  testID="login-email-input"
                  style={[styles.input, errors.email && styles.inputError, loading && styles.inputDisabled]}
                  placeholder="tu@email.com"
                  placeholderTextColor={WolfTheme.colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={value}
                  onChangeText={onChange}
                  editable={!loading}
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
                  testID="login-password-input"
                  toggleTestID="login-password-toggle-button"
                  value={value ?? ''}
                  onChangeText={onChange}
                  hasError={!!errors.password}
                  disabled={loading}
                  autoComplete="current-password"
                />
              )}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}
          </View>

          <TouchableOpacity
            testID="login-forgot-password-link"
            onPress={() => router.push('/(auth)/forgot-password')}
            disabled={loading}
          >
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {errorMessage && (
            <Text testID="login-error-message" style={styles.formErrorText}>
              {errorMessage}
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            testID="login-submit-button"
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={WolfTheme.colors.background} size="small" />
                <Text style={styles.primaryButtonText}>Iniciando sesión...</Text>
              </View>
            ) : (
              <Text style={styles.primaryButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tenés cuenta? </Text>
            <TouchableOpacity
              testID="login-register-link"
              onPress={() => router.replace('/(auth)/register')}
              disabled={loading}
            >
              <Text style={styles.registerLink}>Registrarse</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingTop: WolfTheme.spacing.md,
    paddingBottom: WolfTheme.spacing.xl,
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
  inputDisabled: {
    opacity: 0.5,
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
  forgotText: {
    color: WolfTheme.colors.accent,
    fontSize: 14,
    textAlign: 'right',
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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: WolfTheme.colors.background,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: WolfTheme.colors.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: WolfTheme.colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
})
