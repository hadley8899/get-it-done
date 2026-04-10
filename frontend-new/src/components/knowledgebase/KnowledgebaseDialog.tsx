import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { Knowledgebase } from '@/types/knowledgebase'

type FormValues = {
  name: string
  description: string
  position: string
}

export function KnowledgebaseDialog({
  open,
  title,
  knowledgebase,
  isSaving = false,
  onClose,
  onSubmit,
}: {
  open: boolean
  title: string
  knowledgebase: Knowledgebase | null
  isSaving?: boolean
  onClose: () => void
  onSubmit: (values: { name: string; description: string; position?: number | null }) => Promise<void> | void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      position: '',
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (!open) {
      return
    }

    reset({
      name: knowledgebase?.name ?? '',
      description: knowledgebase?.description ?? '',
      position: typeof knowledgebase?.position === 'number' ? String(knowledgebase.position) : '',
    })
  }, [knowledgebase, open, reset])

  return (
    <Dialog open={open} onClose={isSaving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          spacing={2.5}
          sx={{ pt: 1 }}
          onSubmit={handleSubmit(async (values) => {
            await onSubmit({
              name: values.name,
              description: values.description,
              position: values.position === '' ? null : Number(values.position),
            })
          })}
        >
          <TextField
            label="Name"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register('name', { required: 'Knowledgebase name is required' })}
          />
          <TextField label="Description" multiline minRows={4} {...register('description')} />
          <TextField label="Position" type="number" {...register('position')} />
          <DialogActions sx={{ px: 0, pb: 0 }}>
            <Button onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={!isValid || isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
