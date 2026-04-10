import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { KnowledgebaseItem } from '@/types/knowledgebase'

type FormValues = {
  name: string
  contents: string
}

export function KnowledgebaseItemDialog({
  open,
  title,
  item,
  isSaving = false,
  isDeleting = false,
  onClose,
  onSubmit,
  onDelete,
}: {
  open: boolean
  title: string
  item: KnowledgebaseItem | null
  isSaving?: boolean
  isDeleting?: boolean
  onClose: () => void
  onSubmit: (values: { name: string; contents: string }) => Promise<void> | void
  onDelete?: (item: KnowledgebaseItem) => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: { name: '', contents: '' },
    mode: 'onChange',
  })

  useEffect(() => {
    if (!open) {
      return
    }

    reset({
      name: item?.name ?? '',
      contents: item?.contents ?? '',
    })
  }, [item, open, reset])

  return (
    <Dialog open={open} onClose={isSaving || isDeleting ? undefined : onClose} fullWidth maxWidth="lg">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          spacing={2.5}
          sx={{ pt: 1 }}
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values)
          })}
        >
          <TextField
            label="Name"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register('name', { required: 'Item name is required' })}
          />
          <TextField
            label="Contents"
            multiline
            minRows={12}
            error={Boolean(errors.contents)}
            helperText={errors.contents?.message}
            {...register('contents', { required: 'Contents are required' })}
          />
          <DialogActions sx={{ px: 0, pb: 0 }}>
            {item && onDelete ? (
              <Button color="error" onClick={() => onDelete(item)} disabled={isSaving || isDeleting} sx={{ mr: 'auto' }}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            ) : null}
            <Button onClick={onClose} disabled={isSaving || isDeleting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={!isValid || isSaving || isDeleting}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
