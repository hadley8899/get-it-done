import { Card, Chip, Stack, Typography } from '@mui/material'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { BoardTask } from '@/types/board'

interface DraggableTaskCardProps {
  task: BoardTask
  onClick: () => void
}

export function DraggableTaskCard({ task, onClick }: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: task.uuid,
  })

  const style = {
    transform: `${CSS.Transform.toString(transform) ?? ''}${isDragging ? ' rotate(4deg)' : ''}`,
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      variant="outlined"
      sx={{
        p: 1.5,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 2,
        },
      }}
      onClick={onClick}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 600, flex: 1 }}>{task.name}</Typography>
          <span
            ref={setActivatorNodeRef}
            aria-label={`Drag ${task.name}`}
            style={{
              cursor: 'grab',
              userSelect: 'none',
              padding: '0 2px',
              lineHeight: 1,
              fontSize: '16px',
            }}
            onClick={(event) => {
              event.stopPropagation()
            }}
            {...attributes}
            {...listeners}
          >
            ≡
          </span>
        </Stack>
        {task.description ? (
          <Typography variant="body2" color="text.secondary">
            {task.description}
          </Typography>
        ) : null}
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {task.assigned_to ? (
            <Chip size="small" color="primary" label={task.assigned_to.name} />
          ) : (
            <Chip size="small" color="error" variant="outlined" label="Unassigned" />
          )}
        </Stack>
      </Stack>
    </Card>
  )
}


