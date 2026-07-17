import {
  useCreateMuscleGroup,
  useDeleteMuscleGroup,
  useMuscleGroups,
  useUpdateMuscleGroup,
} from '@/hooks/use-exercises'
import { CatalogManager } from '@/components/admin/CatalogManager'

export default function AdminMuscleGroupsScreen() {
  const { data: muscleGroups, isLoading } = useMuscleGroups()
  const createMuscleGroup = useCreateMuscleGroup()
  const updateMuscleGroup = useUpdateMuscleGroup()
  const deleteMuscleGroup = useDeleteMuscleGroup()

  return (
    <CatalogManager
      title="Grupos musculares"
      itemLabel="grupo muscular"
      items={muscleGroups}
      isLoading={isLoading}
      creating={createMuscleGroup.isPending}
      updating={updateMuscleGroup.isPending}
      deleting={deleteMuscleGroup.isPending}
      onCreate={async (name) => {
        await createMuscleGroup.mutateAsync(name)
      }}
      onUpdate={async (id, name) => {
        await updateMuscleGroup.mutateAsync({ id, name })
      }}
      onDelete={(id) => deleteMuscleGroup.mutateAsync(id)}
    />
  )
}
