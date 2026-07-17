import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useCreateOfficialProgram } from '@/hooks/use-programs'
import { ProgramForm } from '@/components/admin/ProgramForm'

export default function NewProgramScreen() {
  const createProgram = useCreateOfficialProgram()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo programa</Text>
      </View>

      <ProgramForm
        submitLabel="Crear programa"
        loading={createProgram.isPending}
        onSubmit={async (payload) => {
          await createProgram.mutateAsync(payload)
          router.replace('/admin/programs')
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
    padding: WolfTheme.spacing.xl,
    paddingBottom: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
})
