import { Button, Stack, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'

type FormValues = {
  name: string
  description: string
}

export function KnowledgebaseCategoryForm({
  defaultValues = { name: '', description: '' },
  submitLabel,
  isSubmitting = false,
  onSubmit,
}: {
  defaultValues?: FormValues
  submitLabel: string
  isSubmitting?: boolean
  onSubmit: (values: { name: string; description: string }) => Promise<void> | void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues,
    mode: 'onChange',
  })

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          name: values.name,
          description: values.description,
        })
      })}
    >
      <TextField
        label="Name"
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
        {...register('name', { required: 'Category name is required' })}
      />
      <TextField label="Description" multiline minRows={4} {...register('description')} />
      <Button type="submit" variant="contained" disabled={!isValid || isSubmitting}>
        {isSubmitting ? 'Saving...' : submitLabel}
      </Button>
    </Stack>
  )
}
