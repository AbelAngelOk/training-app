import { useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { WolfTheme } from '@/constants/colors'
import { FormField } from '@/components/admin/FormField'
import { Button } from '@/components/ui/Button'
import { AlertModal } from '@/components/ui/AlertModal'
import type { AchievementPayload } from '@/api/achievements'

const schema = z.object({
  code: z
    .string()
    .min(2, 'Requerido')
    .regex(/^[A-Z0-9_]+$/, 'Solo mayúsculas, números y guion bajo (ej. FIRST_WORKOUT)'),
  name: z.string().min(2, 'Requerido'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface AchievementFormProps {
  defaultValues?: Partial<FormValues>
  submitLabel: string
  loading?: boolean
  onSubmit: (payload: AchievementPayload) => Promise<void>
}

export function AchievementForm({
  defaultValues,
  submitLabel,
  loading,
  onSubmit,
}: AchievementFormProps) {
  const [errorAlert, setErrorAlert] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const submit = async (values: FormValues) => {
    try {
      await onSubmit({
        code: values.code,
        name: values.name,
        description: values.description || null,
      })
    } catch {
      setErrorAlert('No se pudo guardar el logro. Intentá de nuevo.')
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Controller
        control={control}
        name="code"
        render={({ field: { onChange, value } }) => (
          <FormField
            label="Código *"
            value={value}
            onChangeText={(text) => onChange(text.toUpperCase())}
            error={errors.code?.message}
            autoCapitalize="characters"
            placeholder="FIRST_WORKOUT"
          />
        )}
      />

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <FormField label="Nombre *" value={value} onChangeText={onChange} error={errors.name?.message} />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <FormField label="Descripción" value={value} onChangeText={onChange} multiline numberOfLines={3} />
        )}
      />

      <Button label={submitLabel} onPress={handleSubmit(submit)} loading={loading} />

      <AlertModal
        visible={!!errorAlert}
        type="error"
        title="Error"
        message={errorAlert ?? ''}
        onDismiss={() => setErrorAlert(null)}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: WolfTheme.spacing.xl,
    gap: WolfTheme.spacing.md,
    maxWidth: 640,
  },
})
