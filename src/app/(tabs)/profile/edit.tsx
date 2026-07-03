import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
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
import { useUserProfile, useUpdateUserProfile } from '@/hooks/use-user'
import { useAuthStore } from '@/stores/auth-store'
import { checkTagAvailability } from '@/api/users'

const TAG_REGEX = /^[a-zA-Z0-9_]{3,30}$/
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

const schema = z.object({
  display_name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  tag: z
    .string()
    .regex(TAG_REGEX, 'Solo letras, números y guión bajo (3-30 caracteres)')
    .optional()
    .or(z.literal('')),
  bio: z.string().max(200, 'Máximo 200 caracteres').optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
})

type FormData = z.infer<typeof schema>

type TagStatus = 'idle' | 'checking' | 'available' | 'taken' | 'locked'

export default function EditProfileScreen() {
  const { user } = useAuthStore()
  const { data: profile, isLoading } = useUserProfile()
  const { mutateAsync: updateProfile, isPending } = useUpdateUserProfile()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [tagStatus, setTagStatus] = useState<TagStatus>('idle')
  const tagDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tagLockedUntil = profile?.tag_updated_at
    ? new Date(new Date(profile.tag_updated_at).getTime() + SEVEN_DAYS_MS)
    : null
  const isTagLocked = !!tagLockedUntil && tagLockedUntil > new Date()

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: '',
      tag: '',
      bio: '',
      city: '',
      province: '',
      country: '',
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        display_name: profile.display_name,
        tag: profile.tag ?? '',
        bio: profile.bio ?? '',
        city: profile.city ?? '',
        province: profile.province ?? '',
        country: profile.country ?? '',
      })
    }
  }, [profile, reset])

  const watchedTag = watch('tag')

  useEffect(() => {
    if (!watchedTag || watchedTag === profile?.tag || isTagLocked) {
      setTagStatus('idle')
      return
    }
    if (!TAG_REGEX.test(watchedTag)) {
      setTagStatus('idle')
      return
    }
    setTagStatus('checking')
    if (tagDebounceRef.current) clearTimeout(tagDebounceRef.current)
    tagDebounceRef.current = setTimeout(async () => {
      if (!user) return
      const available = await checkTagAvailability(watchedTag, user.id)
      setTagStatus(available ? 'available' : 'taken')
    }, 500)
    return () => {
      if (tagDebounceRef.current) clearTimeout(tagDebounceRef.current)
    }
  }, [watchedTag, profile?.tag, isTagLocked, user])

  const onSubmit = async (data: FormData) => {
    try {
      setErrorMessage(null)
      const tagChanged = data.tag !== (profile?.tag ?? '')
      await updateProfile({
        display_name: data.display_name,
        bio: data.bio || null,
        city: data.city || null,
        province: data.province || null,
        country: data.country || null,
        ...(tagChanged && data.tag
          ? { tag: data.tag, tag_updated_at: new Date().toISOString() }
          : {}),
      })
      router.back()
    } catch (e: any) {
      if (e?.message?.includes('unique') || e?.message?.includes('duplicate')) {
        setErrorMessage('Ese tag ya está en uso')
      } else {
        setErrorMessage('No se pudieron guardar los cambios. Intentá nuevamente.')
      }
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator color={WolfTheme.colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Nombre visible</Text>
            <Controller
              control={control}
              name="display_name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  testID="profile-edit-display-name-input"
                  style={[styles.input, errors.display_name && styles.inputError]}
                  placeholder="Tu nombre"
                  placeholderTextColor={WolfTheme.colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.display_name && (
              <Text style={styles.errorText}>{errors.display_name.message}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tag único</Text>
            <Controller
              control={control}
              name="tag"
              render={({ field: { onChange, value } }) => (
                <View style={styles.tagRow}>
                  <TextInput
                    testID="profile-edit-tag-input"
                    style={[
                      styles.input,
                      styles.tagInput,
                      errors.tag && styles.inputError,
                      isTagLocked && styles.inputDisabled,
                    ]}
                    placeholder="@tu_tag"
                    placeholderTextColor={WolfTheme.colors.textSecondary}
                    autoCapitalize="none"
                    editable={!isTagLocked}
                    value={value}
                    onChangeText={onChange}
                  />
                  <TagIndicator
                    testID="profile-edit-tag-availability"
                    status={tagStatus}
                  />
                </View>
              )}
            />
            {errors.tag && (
              <Text style={styles.errorText}>{errors.tag.message}</Text>
            )}
            {isTagLocked && tagLockedUntil && (
              <Text style={styles.lockedText}>
                Podés cambiar tu tag el{' '}
                {tagLockedUntil.toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'long',
                })}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Descripción</Text>
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  testID="profile-edit-bio-input"
                  style={[styles.textarea, errors.bio && styles.inputError]}
                  placeholder="Contá algo sobre vos..."
                  placeholderTextColor={WolfTheme.colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Ciudad</Text>
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  testID="profile-edit-city-input"
                  style={styles.input}
                  placeholder="Tu ciudad"
                  placeholderTextColor={WolfTheme.colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Provincia</Text>
            <Controller
              control={control}
              name="province"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  testID="profile-edit-province-input"
                  style={styles.input}
                  placeholder="Tu provincia"
                  placeholderTextColor={WolfTheme.colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>País</Text>
            <Controller
              control={control}
              name="country"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  testID="profile-edit-country-input"
                  style={styles.input}
                  placeholder="Tu país"
                  placeholderTextColor={WolfTheme.colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>

          {errorMessage && (
            <Text testID="profile-edit-error-message" style={styles.formErrorText}>
              {errorMessage}
            </Text>
          )}
        </View>

        <TouchableOpacity
          testID="profile-edit-save-button"
          style={[styles.primaryButton, (isPending || !isDirty) && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending || !isDirty}
        >
          {isPending ? (
            <ActivityIndicator color={WolfTheme.colors.background} />
          ) : (
            <Text style={styles.primaryButtonText}>Guardar cambios</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function TagIndicator({ status, testID }: { status: TagStatus; testID?: string }) {
  if (status === 'idle') return null
  if (status === 'checking') {
    return (
      <View testID={testID} style={tagStyles.container}>
        <ActivityIndicator size="small" color={WolfTheme.colors.textSecondary} />
      </View>
    )
  }
  return (
    <View testID={testID} style={tagStyles.container}>
      <Ionicons
        name={status === 'available' ? 'checkmark-circle' : 'close-circle'}
        size={20}
        color={status === 'available' ? WolfTheme.colors.success : WolfTheme.colors.error}
      />
    </View>
  )
}

const tagStyles = StyleSheet.create({
  container: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    padding: WolfTheme.spacing.lg,
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
    flex: 1,
  },
  inputError: {
    borderColor: WolfTheme.colors.error,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
  },
  tagInput: {
    flex: 1,
  },
  textarea: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.input,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    minHeight: 80,
    padding: WolfTheme.spacing.md,
    color: WolfTheme.colors.textPrimary,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    color: WolfTheme.colors.error,
  },
  lockedText: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
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
