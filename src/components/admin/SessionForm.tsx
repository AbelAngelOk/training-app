import { useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { WolfTheme } from '@/constants/colors'
import { FormField } from '@/components/admin/FormField'
import { Button } from '@/components/ui/Button'
import { AlertModal } from '@/components/ui/AlertModal'
import type { OfficialSessionPayload } from '@/api/sessions'

const schema = z.object({
  name: z.string().min(2, 'Requerido'),
  description: z.string().optional(),
  estimated_duration_minutes: z
    .string()
    .optional()
    .refine((v) => !v || /^\d+$/.test(v), 'Solo números'),
})

type FormValues = z.infer<typeof schema>

interface SessionFormProps {
  defaultValues?: Partial<FormValues>
  submitLabel: string
  loading?: boolean
  onSubmit: (payload: OfficialSessionPayload) => Promise<void>
}

export function SessionForm({ defaultValues, submitLabel, loading, onSubmit }: SessionFormProps) {
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
        name: values.name,
        description: values.description || null,
        estimated_duration_minutes: values.estimated_duration_minutes
          ? Number(values.estimated_duration_minutes)
          : null,
      })
    } catch {
      setErrorAlert('No se pudo guardar la sesión. Intentá de nuevo.')
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      <Controller
        control={control}
        name="estimated_duration_minutes"
        render={({ field: { onChange, value } }) => (
          <FormField
            label="Duración estimada (min)"
            value={value}
            onChangeText={onChange}
            error={errors.estimated_duration_minutes?.message}
            keyboardType="numeric"
          />
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
