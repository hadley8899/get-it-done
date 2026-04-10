import { Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { FormCard } from '@/components/FormCard'
import { PageHeader } from '@/components/PageHeader'
import { WorkspaceForm } from '@/components/workspaces/WorkspaceForm'
import { notifyError, notifySuccess } from '@/services/toastService'
import { createWorkspace, setStoredActiveWorkspace } from '@/services/workspaceService'

export function CreateWorkspacePage() {
  const navigate = useNavigate()

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Workspaces"
        title="Create workspace"
        description="This React form now writes directly to the existing Laravel workspace endpoint."
      />
      <FormCard title="Workspace details" description="Create a new workspace and make it your active workspace immediately.">
        <WorkspaceForm
          submitLabel="Create workspace"
          onSubmit={async (values) => {
            try {
              const workspace = await createWorkspace(values)
              setStoredActiveWorkspace(workspace)
              notifySuccess('Workspace created successfully.')
              navigate('/workspaces')
            } catch {
              notifyError('Failed to create the workspace.')
            }
          }}
        />
      </FormCard>
    </Stack>
  )
}
