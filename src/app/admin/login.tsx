import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { WolfTheme } from '@/constants/colors'
import { supabase } from '@/lib/supabase'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

function getErrorMessage(message: string): string {
  if (message.includes('Invalid login credentials') || message.includes('invalid_credentials')) {
    return 'Email o contraseña incorrectos'
  }
  if (message.includes('Email not confirmed')) {
    return 'Confirmá tu email antes de iniciar sesión'
  }
  return 'Ocurrió un error inesperado, intentá nuevamente'
}

/** Desktop admin login — separate from the mobile (auth)/login flow on purpose. */
export default function AdminLoginScreen() {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

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

    router.replace('/admin')
  }

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>Panel de administración</Text>
        <Text style={styles.subtitle}>Iniciá sesión con tu cuenta de administrador.</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="admin@ejemplo.com"
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
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Contraseña</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <PasswordInput
                  value={value ?? ''}
                  onChangeText={onChange}
                  hasError={!!errors.password}
                  disabled={loading}
                  autoComplete="current-password"
                />
              )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>

          {errorMessage && <Text style={styles.formErrorText}>{errorMessage}</Text>}
        </View>

        <Button label="Entrar" onPress={handleSubmit(onSubmit)} loading={loading} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: WolfTheme.spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    padding: WolfTheme.spacing.xl,
    gap: WolfTheme.spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
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
    backgroundColor: WolfTheme.colors.background,
    borderRadius: WolfTheme.radius.input,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    height: 48,
    paddingHorizontal: WolfTheme.spacing.md,
    color: WolfTheme.colors.textPrimary,
    fontSize: 15,
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
  },
})
