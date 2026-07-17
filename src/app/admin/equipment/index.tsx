import {
  useCreateEquipment,
  useDeleteEquipment,
  useEquipment,
  useUpdateEquipment,
} from '@/hooks/use-exercises'
import { CatalogManager } from '@/components/admin/CatalogManager'

export default function AdminEquipmentScreen() {
  const { data: equipment, isLoading } = useEquipment()
  const createEquipment = useCreateEquipment()
  const updateEquipment = useUpdateEquipment()
  const deleteEquipment = useDeleteEquipment()

  return (
    <CatalogManager
      title="Equipamiento"
      itemLabel="equipo"
      items={equipment}
      isLoading={isLoading}
      creating={createEquipment.isPending}
      updating={updateEquipment.isPending}
      deleting={deleteEquipment.isPending}
      onCreate={async (name) => {
        await createEquipment.mutateAsync(name)
      }}
      onUpdate={async (id, name) => {
        await updateEquipment.mutateAsync({ id, name })
      }}
      onDelete={(id) => deleteEquipment.mutateAsync(id)}
    />
  )
}
