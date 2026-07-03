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
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useAuthStore } from '@/stores/auth-store'
import {
  useFriends,
  usePendingFriendRequests,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
} from '@/hooks/use-social'
import { searchUsers, type UserSearchResult } from '@/api/social'

export default function FriendsScreen() {
  const { user } = useAuthStore()
  const { data: friends, isLoading: loadingFriends } = useFriends()
  const { data: pendingRequests, isLoading: loadingRequests } = usePendingFriendRequests()
  const { mutate: sendRequest, variables: sendingToId, isPending: isSending } = useSendFriendRequest()
  const { mutate: acceptRequest, isPending: isAccepting } = useAcceptFriendRequest()
  const { mutate: rejectRequest, isPending: isRejecting } = useRejectFriendRequest()

  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [sentIds, setSentIds] = useState<Set<string>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchUsers(query)
        setSearchResults(results.filter((r) => r.user_id !== user?.id))
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, user?.id])

  const friendIds = new Set(friends?.map((f) => f.friend.user_id) ?? [])

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={WolfTheme.colors.textSecondary} />
          <TextInput
            testID="profile-friends-search-input"
            style={styles.searchInput}
            placeholder="Buscar por nombre o @tag"
            placeholderTextColor={WolfTheme.colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
          {searching && <ActivityIndicator size="small" color={WolfTheme.colors.textSecondary} />}
        </View>

        {query.length >= 2 && (
          <View testID="profile-friends-search-result-list" style={styles.section}>
            <Text style={styles.sectionTitle}>Resultados</Text>
            {searchResults.length === 0 && !searching ? (
              <Text style={styles.emptyText}>Sin resultados</Text>
            ) : (
              searchResults.map((result) => {
                const alreadyFriend = friendIds.has(result.user_id)
                const requestSent = sentIds.has(result.user_id)
                return (
                  <View
                    key={result.user_id}
                    testID="profile-friends-search-result-item"
                    style={styles.userRow}
                  >
                    <TouchableOpacity
                      style={styles.userInfo}
                      onPress={() => router.push(`/user/${result.user_id}`)}
                    >
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {result.display_name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.userName}>{result.display_name}</Text>
                        {result.tag && (
                          <Text style={styles.userTag}>@{result.tag}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                    {!alreadyFriend && !requestSent && (
                      <TouchableOpacity
                        testID="profile-friends-send-request-button"
                        style={styles.addButton}
                        onPress={() => {
                          sendRequest(result.user_id)
                          setSentIds((prev) => new Set(prev).add(result.user_id))
                        }}
                      >
                        <Text style={styles.addButtonText}>Agregar</Text>
                      </TouchableOpacity>
                    )}
                    {(alreadyFriend || requestSent) && (
                      <Text style={styles.mutualLabel}>
                        {alreadyFriend ? 'Amigos' : 'Enviado'}
                      </Text>
                    )}
                  </View>
                )
              })
            )}
          </View>
        )}

        {/* Pending requests */}
        {(pendingRequests?.length ?? 0) > 0 && (
          <View testID="profile-friends-pending-list" style={styles.section}>
            <Text style={styles.sectionTitle}>Solicitudes pendientes</Text>
            {pendingRequests!.map((req) => (
              <View
                key={req.id}
                testID="profile-friends-pending-item"
                style={styles.userRow}
              >
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {req.sender.display_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.userName}>{req.sender.display_name}</Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    testID="profile-friends-accept-button"
                    style={styles.acceptButton}
                    onPress={() => acceptRequest(req.id)}
                    disabled={isAccepting}
                  >
                    <Ionicons name="checkmark" size={18} color={WolfTheme.colors.background} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    testID="profile-friends-reject-button"
                    style={styles.rejectButton}
                    onPress={() => rejectRequest(req.id)}
                    disabled={isRejecting}
                  >
                    <Ionicons name="close" size={18} color={WolfTheme.colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Friends list */}
        <View testID="profile-friends-list" style={styles.section}>
          <Text style={styles.sectionTitle}>
            Amigos {friends ? `(${friends.length})` : ''}
          </Text>
          {loadingFriends ? (
            <ActivityIndicator color={WolfTheme.colors.primary} />
          ) : (friends?.length ?? 0) === 0 ? (
            <View testID="profile-friends-empty-state" style={styles.emptyState}>
              <Ionicons name="people-outline" size={40} color={WolfTheme.colors.textSecondary} />
              <Text style={styles.emptyText}>Todavía no tenés amigos en la app.</Text>
            </View>
          ) : (
            friends!.map((friendship) => (
              <TouchableOpacity
                key={friendship.id}
                testID="profile-friends-item"
                style={styles.userRow}
                onPress={() => router.push(`/user/${friendship.friend.user_id}`)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {friendship.friend.display_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.userName}>{friendship.friend.display_name}</Text>
                <Ionicons name="chevron-forward" size={16} color={WolfTheme.colors.textSecondary} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
  },
  content: {
    padding: WolfTheme.spacing.lg,
    gap: WolfTheme.spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.input,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    paddingHorizontal: WolfTheme.spacing.md,
    height: 48,
    gap: WolfTheme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: WolfTheme.colors.textPrimary,
    fontSize: 15,
  },
  section: {
    gap: WolfTheme.spacing.sm,
  },
  sectionTitle: {
    fontSize: WolfTheme.typography.caption.fontSize,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    padding: WolfTheme.spacing.md,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    gap: WolfTheme.spacing.md,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: WolfTheme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.primary,
  },
  userName: {
    fontSize: 15,
    fontWeight: '500',
    color: WolfTheme.colors.textPrimary,
  },
  userTag: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  addButton: {
    backgroundColor: WolfTheme.colors.primary,
    borderRadius: WolfTheme.radius.button,
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.xs,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: WolfTheme.colors.background,
  },
  mutualLabel: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  requestActions: {
    flexDirection: 'row',
    gap: WolfTheme.spacing.sm,
  },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: WolfTheme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: WolfTheme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
    paddingVertical: WolfTheme.spacing.xl,
  },
  emptyText: {
    fontSize: WolfTheme.typography.caption.fontSize,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
  },
})
