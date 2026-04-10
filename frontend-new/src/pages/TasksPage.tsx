import { Stack } from '@mui/material'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { SectionCard } from '@/components/SectionCard'

export function TasksPage() {
  return (
    <Stack spacing={3}>
      <PageHeader eyebrow="Tasks" title="Task migration area" description="The route shell is established and ready for task list and task detail flows." />
      <SectionCard title="Tasks" description="Task migration has not started yet.">
        <EmptyState title="Tasks migration slice" description="This route is ready for service-based task migration using the preferred project structure." />
      </SectionCard>
    </Stack>
  )
}
