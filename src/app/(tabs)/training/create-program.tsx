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

import { WolfTheme } from '@/constants/colors'
import { useCreateProgram } from '@/hooks/use-programs'

const schema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

type FormData = z.infer<typeof schema>

export default function CreateProgramScreen() {
  const { mutateAsync: createProgram, isPending } = useCreateProgram()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      setErrorMessage(null)
      await createProgram({ name: data.name, description: data.description ?? null })
      router.back()
    } catch {
      setErrorMessage('No se pudo crear el programa. Intentá nuevamente.')
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Nombre del programa</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    testID="program-create-name-input"
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="Ej: Fuerza 5 días"
                    placeholderTextColor={WolfTheme.colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name.message}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Descripción (opcional)</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    testID="program-create-description-input"
                    style={[styles.textarea, errors.description && styles.inputError]}
                    placeholder="Describí el objetivo del programa..."
                    placeholderTextColor={WolfTheme.colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                )}
              />
              {errors.description && (
                <Text style={styles.errorText}>{errors.description.message}</Text>
              )}
            </View>

            {errorMessage && (
              <Text testID="program-create-error-message" style={styles.formErrorText}>
                {errorMessage}
              </Text>
            )}
          </View>

          <TouchableOpacity
            testID="program-create-submit-button"
            style={[styles.primaryButton, isPending && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color={WolfTheme.colors.background} />
            ) : (
              <Text style={styles.primaryButtonText}>Crear programa</Text>
            )}
          </TouchableOpacity>
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
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingTop: WolfTheme.spacing.lg,
    paddingBottom: WolfTheme.spacing.xl,
    gap: WolfTheme.spacing.xl,
    justifyContent: 'space-between',
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
  textarea: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.input,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    minHeight: 100,
    padding: WolfTheme.spacing.md,
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
})
