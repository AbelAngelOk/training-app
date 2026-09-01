import { useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { WolfTheme } from '@/constants/colors'
import { FormField } from '@/components/admin/FormField'
import { Button } from '@/components/ui/Button'
import { AlertModal } from '@/components/ui/AlertModal'
import type { CatalogItemPayload } from '@/api/exercises'

const schema = z.object({
  name_es: z.string().min(2, 'Requerido'),
  name_en: z.string().min(2, 'Requerido'),
  description_es: z.string().optional(),
  description_en: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface CatalogItemFormProps {
  itemLabel: string
  defaultValues?: Partial<FormValues>
  submitLabel: string
  loading?: boolean
  onSubmit: (payload: CatalogItemPayload) => Promise<void>
}

/** Formulario compartido por grupos musculares y equipo: nombre + descripción bilingües. */
export function CatalogItemForm({
  itemLabel,
  defaultValues,
  submitLabel,
  loading,
  onSubmit,
}: CatalogItemFormProps) {
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
        name_es: values.name_es,
        name_en: values.name_en,
        description_es: values.description_es || null,
        description_en: values.description_en || null,
      })
    } catch {
      setErrorAlert(`No se pudo guardar ${itemLabel}. Intentá de nuevo.`)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Controller
        control={control}
        name="name_es"
        render={({ field: { onChange, value } }) => (
          <FormField
            label="Nombre (Español) *"
            value={value}
            onChangeText={onChange}
            error={errors.name_es?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="name_en"
        render={({ field: { onChange, value } }) => (
          <FormField
            label="Nombre (English) *"
            value={value}
            onChangeText={onChange}
            error={errors.name_en?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="description_es"
        render={({ field: { onChange, value } }) => (
          <FormField
            label="Descripción detallada (Español)"
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={3}
          />
        )}
      />

      <Controller
        control={control}
        name="description_en"
        render={({ field: { onChange, value } }) => (
          <FormField
            label="Descripción detallada (English)"
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={3}
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
