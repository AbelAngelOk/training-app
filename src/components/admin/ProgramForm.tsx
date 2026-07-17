import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { WolfTheme } from '@/constants/colors'
import { FormField } from '@/components/admin/FormField'
import { Button } from '@/components/ui/Button'
import { AlertModal } from '@/components/ui/AlertModal'
import type { OfficialProgramPayload } from '@/api/programs'
import type { ContentStatus } from '@/types/database'

const STATUSES: { value: ContentStatus; label: string }[] = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Archivado' },
]

const schema = z.object({
  name: z.string().min(2, 'Requerido'),
  description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
})

type FormValues = z.infer<typeof schema>

interface ProgramFormProps {
  defaultValues?: Partial<FormValues>
  submitLabel: string
  loading?: boolean
  onSubmit: (payload: OfficialProgramPayload) => Promise<void>
}

export function ProgramForm({ defaultValues, submitLabel, loading, onSubmit }: ProgramFormProps) {
  const [errorAlert, setErrorAlert] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'draft',
      ...defaultValues,
    },
  })

  const submit = async (values: FormValues) => {
    try {
      await onSubmit({
        name: values.name,
        description: values.description || null,
        status: values.status,
      })
    } catch {
      setErrorAlert('No se pudo guardar el programa. Intentá de nuevo.')
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
        name="status"
        render={({ field: { onChange, value } }) => (
          <FormField label="Estado">
            <View style={styles.chipsStatic}>
              {STATUSES.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[styles.chip, value === s.value && styles.chipActive]}
                  onPress={() => onChange(s.value)}
                >
                  <Text style={[styles.chipText, value === s.value && styles.chipTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </FormField>
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
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: WolfTheme.colors.surfaceLight,
    marginRight: WolfTheme.spacing.sm,
  },
  chipsStatic: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WolfTheme.spacing.sm,
  },
  chipActive: {
    backgroundColor: 'rgba(139,92,246,0.18)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
  },
  chipTextActive: {
    color: WolfTheme.colors.primary,
  },
})
