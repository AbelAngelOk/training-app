import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { WolfTheme } from '@/constants/colors'
import { useMuscleGroups, useEquipment } from '@/hooks/use-exercises'
import { FormField } from '@/components/admin/FormField'
import { MultiSelectField } from '@/components/admin/MultiSelectField'
import { Button } from '@/components/ui/Button'
import { AlertModal } from '@/components/ui/AlertModal'
import { DIFFICULTY_LABEL } from '@/lib/i18n'
import type { ExercisePayload } from '@/api/exercises'
import type { ExerciseDifficulty } from '@/types/database'

const DIFFICULTIES: ExerciseDifficulty[] = ['beginner', 'intermediate', 'advanced']

const schema = z.object({
  name_es: z.string().min(2, 'Requerido'),
  name_en: z.string().min(2, 'Requerido'),
  description_es: z.string().optional(),
  description_en: z.string().optional(),
  instructions_es: z.string().optional(),
  instructions_en: z.string().optional(),
  tips_es: z.string().optional(),
  tips_en: z.string().optional(),
  image_url: z.string().optional(),
  external_id: z.string().optional(),
  fitgifs_slug: z.string().optional(),
  muscle_group_ids: z.array(z.string()).min(1, 'Elegí al menos un grupo muscular'),
  equipment_ids: z.array(z.string()).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
})

type FormValues = z.infer<typeof schema>

interface ExerciseFormProps {
  defaultValues?: Partial<FormValues>
  submitLabel: string
  loading?: boolean
  onSubmit: (payload: ExercisePayload) => Promise<void>
}

export function ExerciseForm({ defaultValues, submitLabel, loading, onSubmit }: ExerciseFormProps) {
  const { data: muscleGroups } = useMuscleGroups()
  const { data: equipmentList } = useEquipment()
  const [errorAlert, setErrorAlert] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      difficulty: 'beginner',
      muscle_group_ids: [],
      equipment_ids: [],
      ...defaultValues,
    },
  })

  const submit = async (values: FormValues) => {
    try {
      await onSubmit({
        name_es: values.name_es,
        name_en: values.name_en,
        description_es: values.description_es || null,
        description_en: values.description_en || null,
        instructions_es: values.instructions_es || null,
        instructions_en: values.instructions_en || null,
        tips_es: values.tips_es || null,
        tips_en: values.tips_en || null,
        image_url: values.image_url || null,
        external_id: values.external_id || null,
        fitgifs_slug: values.fitgifs_slug || null,
        muscle_group_ids: values.muscle_group_ids,
        equipment_ids: values.equipment_ids ?? [],
        difficulty: values.difficulty,
      })
    } catch {
      setErrorAlert('No se pudo guardar el ejercicio. Intentá de nuevo.')
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
        name="muscle_group_ids"
        render={({ field: { onChange, value } }) => (
          <FormField label="Grupo muscular *" error={errors.muscle_group_ids?.message}>
            <MultiSelectField
              options={(muscleGroups ?? []).map((mg) => ({ id: mg.id, label: mg.name_es }))}
              selectedIds={value}
              onChange={onChange}
              placeholder="Grupo muscular"
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="equipment_ids"
        render={({ field: { onChange, value } }) => (
          <FormField label="Equipo">
            <MultiSelectField
              options={(equipmentList ?? []).map((eq) => ({ id: eq.id, label: eq.name_es }))}
              selectedIds={value ?? []}
              onChange={onChange}
              placeholder="Equipo"
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="difficulty"
        render={({ field: { onChange, value } }) => (
          <FormField label="Dificultad">
            <View style={styles.chipsStatic}>
              {DIFFICULTIES.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.chip, value === d && styles.chipActive]}
                  onPress={() => onChange(d)}
                >
                  <Text style={[styles.chipText, value === d && styles.chipTextActive]}>
                    {DIFFICULTY_LABEL.es[d]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="description_es"
        render={({ field: { onChange, value } }) => (
          <FormField
            label="Descripción (Español)"
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={2}
          />
        )}
      />

      <Controller
        control={control}
        name="description_en"
        render={({ field: { onChange, value } }) => (
          <FormField
            label="Descripción (English)"
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={2}
          />
        )}
      />

      <Controller
        control={control}
        name="instructions_es"
        render={({ field: { onChange, value } }) => (
          <FormField
            label="Instrucciones (Español)"
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={4}
          />
        )}
      />

      <Controller
        control={control}
        name="instructions_en"
        render={({ field: { onChange, value } }) => (
          <FormField
            label="Instrucciones (English)"
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={4}
          />
        )}
      />

      <Controller
        control={control}
        name="tips_es"
        render={({ field: { onChange, value } }) => (
          <FormField label="Tips (Español)" value={value} onChangeText={onChange} multiline numberOfLines={2} />
        )}
      />

      <Controller
        control={control}
        name="tips_en"
        render={({ field: { onChange, value } }) => (
          <FormField label="Tips (English)" value={value} onChangeText={onChange} multiline numberOfLines={2} />
        )}
      />

      <Controller
        control={control}
        name="image_url"
        render={({ field: { onChange, value } }) => (
          <FormField label="URL de imagen" value={value} onChangeText={onChange} />
        )}
      />

      <Controller
        control={control}
        name="external_id"
        render={({ field: { onChange, value } }) => (
          <FormField
            label="ID de ExerciseDB (opcional)"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="fitgifs_slug"
        render={({ field: { onChange, value } }) => (
          <FormField
            label="Slug de fitgifs (opcional)"
            value={value}
            onChangeText={onChange}
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
