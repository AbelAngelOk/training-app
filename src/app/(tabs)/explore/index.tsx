import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { WolfTheme } from '@/constants/colors'
import { useOfficialPrograms } from '@/hooks/use-programs'
import { useChallenges } from '@/hooks/use-challenges'
import { SectionCarousel } from '@/components/explore/SectionCarousel'
import { ProgramCard } from '@/components/explore/ProgramCard'
import { ChallengeCard } from '@/components/explore/ChallengeCard'
import { ProgramCardSkeleton } from '@/components/training/skeletons/ProgramCardSkeleton'

export default function ExploreScreen() {
  const { data: programs, isLoading: loadingPrograms } = useOfficialPrograms()
  const { data: challenges, isLoading: loadingChallenges } = useChallenges()

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loadingPrograms ? (
          <View style={styles.skeletonSection}>
            <ProgramCardSkeleton />
          </View>
        ) : (
          <SectionCarousel
            title="Programas"
            items={programs ?? []}
            keyExtractor={(p) => p.id}
            testIDPrefix="explore-programs"
            emptyLabel="Los programas oficiales estarán disponibles próximamente."
            onViewAll={() => router.push('/(tabs)/explore/programs')}
            renderItem={(program) => (
              <ProgramCard
                variant="carousel"
                program={program}
                onPress={() => router.push(`/(tabs)/explore/${program.id}`)}
              />
            )}
          />
        )}

        {loadingChallenges ? (
          <View style={styles.skeletonSection}>
            <ProgramCardSkeleton />
          </View>
        ) : (
          <SectionCarousel
            title="Retos"
            items={challenges ?? []}
            keyExtractor={(c) => c.id}
            testIDPrefix="explore-challenges"
            emptyLabel="Los retos estarán disponibles próximamente."
            onViewAll={() => router.push('/(tabs)/explore/challenges')}
            renderItem={(challenge) => (
              <ChallengeCard
                variant="carousel"
                challenge={challenge}
                onPress={() => router.push(`/(tabs)/explore/challenge/${challenge.id}`)}
              />
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
  },
  header: {
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingTop: WolfTheme.spacing.md,
    paddingBottom: WolfTheme.spacing.sm,
  },
  title: {
    fontSize: WolfTheme.typography.h2.fontSize,
    fontWeight: WolfTheme.typography.h2.fontWeight,
    color: WolfTheme.colors.textPrimary,
  },
  scroll: {
    paddingVertical: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.xl,
    paddingBottom: WolfTheme.spacing.xxl,
  },
  skeletonSection: {
    paddingHorizontal: WolfTheme.spacing.lg,
  },
})
