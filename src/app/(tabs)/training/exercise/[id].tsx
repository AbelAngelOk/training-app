import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'

import { WolfTheme } from '@/constants/colors'
import { supabase } from '@/lib/supabase'
import { ExerciseVideoDisplay } from '@/components/training/ExerciseVideoDisplay'
import type { ExerciseRow } from '@/types/database'

async function getExerciseByName(name: string): Promise<ExerciseRow | null> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('name', name)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching exercise:', error)
    throw error
  }

  return data as ExerciseRow | null
}

export default function ExerciseDetailScreen() {
  const { name, id } = useLocalSearchParams<{ name: string; id: string }>()

  const { data: exercise, isLoading, error } = useQuery({
    queryKey: ['exercise', name],
    queryFn: () => getExerciseByName(name || ''),
    enabled: !!name,
  })

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="hourglass" size={40} color={WolfTheme.colors.textSecondary} />
          <Text style={styles.loadingText}>Cargando ejercicio...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!exercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={WolfTheme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ejercicio no encontrado</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <Text style={styles.notFound}>No se encontró el ejercicio</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {exercise.name}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Video/Instructions Display */}
      <ExerciseVideoDisplay exercise={exercise} showInstructions={true} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: WolfTheme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: WolfTheme.colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  notFound: {
    color: WolfTheme.colors.textPrimary,
    fontSize: 18,
  },
  backLink: {
    color: WolfTheme.colors.primary,
    fontSize: 16,
  },
  loadingText: {
    color: WolfTheme.colors.textSecondary,
    fontSize: 16,
  },
})
