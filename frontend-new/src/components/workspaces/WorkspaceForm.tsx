import { Button, Stack, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'

type WorkspaceFormValues = {
  name: string
  description: string
}

export function WorkspaceForm({
  defaultValues = { name: '', description: '' },
  isSubmitting = false,
  onSubmit,
  submitLabel,
}: {
  defaultValues?: WorkspaceFormValues
  isSubmitting?: boolean
  onSubmit: (values: WorkspaceFormValues) => Promise<void> | void
  submitLabel: string
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<WorkspaceFormValues>({
    defaultValues,
    mode: 'onChange',
  })

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="Name"
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
        {...register('name', { required: 'Name is required' })}
      />
      <TextField
        label="Description"
        multiline
        minRows={4}
        error={Boolean(errors.description)}
        helperText={errors.description?.message}
        {...register('description', { required: 'Description is required' })}
      />
      <Button type="submit" variant="contained" disabled={!isValid || isSubmitting}>
        {isSubmitting ? 'Saving...' : submitLabel}
      </Button>
    </Stack>
  )
}
