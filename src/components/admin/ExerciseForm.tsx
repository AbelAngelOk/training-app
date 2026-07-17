import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { WolfTheme } from '@/constants/colors'
import { useMuscleGroups, useEquipment } from '@/hooks/use-exercises'
import { FormField } from '@/components/admin/FormField'
import { Button } from '@/components/ui/Button'
import { AlertModal } from '@/components/ui/AlertModal'
import type { ExercisePayload } from '@/api/exercises'
import type { ExerciseDifficulty } from '@/types/database'

const DIFFICULTIES: { value: ExerciseDifficulty; label: string }[] = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
]

const schema = z.object({
  name: z.string().min(2, 'Requerido'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  tips: z.string().optional(),
  image_url: z.string().optional(),
  external_id: z.string().optional(),
  muscle_group_id: z.string().min(1, 'Elegí un grupo muscular'),
  equipment_id: z.string().optional(),
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
      ...defaultValues,
    },
  })

  const submit = async (values: FormValues) => {
    try {
      await onSubmit({
        name: values.name,
        description: values.description || null,
        instructions: values.instructions || null,
        tips: values.tips || null,
        image_url: values.image_url || null,
        external_id: values.external_id || null,
        muscle_group_id: values.muscle_group_id,
        equipment_id: values.equipment_id || null,
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
        name="name"
        render={({ field: { onChange, value } }) => (
          <FormField label="Nombre *" value={value} onChangeText={onChange} error={errors.name?.message} />
        )}
      />

      <Controller
        control={control}
        name="muscle_group_id"
        render={({ field: { onChange, value } }) => (
          <FormField label="Grupo muscular *" error={errors.muscle_group_id?.message}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(muscleGroups ?? []).map((mg) => (
                <TouchableOpacity
                  key={mg.id}
                  style={[styles.chip, value === mg.id && styles.chipActive]}
                  onPress={() => onChange(mg.id)}
                >
                  <Text style={[styles.chipText, value === mg.id && styles.chipTextActive]}>
                    {mg.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="equipment_id"
        render={({ field: { onChange, value } }) => (
          <FormField label="Equipo">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.chip, !value && styles.chipActive]}
                onPress={() => onChange(undefined)}
              >
                <Text style={[styles.chipText, !value && styles.chipTextActive]}>Ninguno</Text>
              </TouchableOpacity>
              {(equipmentList ?? []).map((eq) => (
                <TouchableOpacity
                  key={eq.id}
                  style={[styles.chip, value === eq.id && styles.chipActive]}
                  onPress={() => onChange(eq.id)}
                >
                  <Text style={[styles.chipText, value === eq.id && styles.chipTextActive]}>
                    {eq.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
                  key={d.value}
                  style={[styles.chip, value === d.value && styles.chipActive]}
                  onPress={() => onChange(d.value)}
                >
                  <Text style={[styles.chipText, value === d.value && styles.chipTextActive]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <FormField label="Descripción" value={value} onChangeText={onChange} multiline numberOfLines={2} />
        )}
      />

      <Controller
        control={control}
        name="instructions"
        render={({ field: { onChange, value } }) => (
          <FormField label="Instrucciones" value={value} onChangeText={onChange} multiline numberOfLines={4} />
        )}
      />

      <Controller
        control={control}
        name="tips"
        render={({ field: { onChange, value } }) => (
          <FormField label="Tips" value={value} onChangeText={onChange} multiline numberOfLines={2} />
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
