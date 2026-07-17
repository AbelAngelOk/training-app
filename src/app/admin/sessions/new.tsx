import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useCreateOfficialSession } from '@/hooks/use-sessions'
import { SessionForm } from '@/components/admin/SessionForm'

export default function NewSessionScreen() {
  const createSession = useCreateOfficialSession()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Nueva sesión</Text>
      </View>

      <SessionForm
        submitLabel="Crear sesión"
        loading={createSession.isPending}
        onSubmit={async (payload) => {
          const session = await createSession.mutateAsync(payload)
          router.replace(`/admin/sessions/${session.id}`)
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
