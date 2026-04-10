import { Button, MenuItem, Stack, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import type { BoardTemplate } from '@/types/board'

type BoardFormValues = {
  name: string
  description: string
  boardTemplateUuid: string
  image: FileList
}

export function BoardForm({
  templates,
  isSubmitting = false,
  onSubmit,
}: {
  templates: BoardTemplate[]
  isSubmitting?: boolean
  onSubmit: (values: { name: string; description: string; boardTemplateUuid?: string; image?: File | null }) => Promise<void> | void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<BoardFormValues>({
    defaultValues: {
      name: '',
      description: '',
      boardTemplateUuid: '',
    },
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
          boardTemplateUuid: values.boardTemplateUuid || undefined,
          image: values.image?.[0] ?? null,
        })
      })}
    >
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
        {...register('description')}
      />
      <TextField select label="Board template" defaultValue="" {...register('boardTemplateUuid')}>
        <MenuItem value="">No template</MenuItem>
        {templates.map((template) => (
          <MenuItem key={template.uuid} value={template.uuid}>
            {template.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        type="file"
        slotProps={{ inputLabel: { shrink: true } }}
        label="Image"
        {...register('image')}
      />
      <Button type="submit" variant="contained" disabled={!isValid || isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Create board'}
      </Button>
    </Stack>
  )
}
