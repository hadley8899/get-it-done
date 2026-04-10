import { Card, Stack, Typography } from '@mui/material'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableTaskCard } from './DraggableTaskCard'
import type { BoardList } from '@/types/board'

interface DroppableListProps {
  boardList: BoardList
  onTaskClick: (taskUuid: string) => void
}

export function DroppableList({ boardList, onTaskClick }: DroppableListProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: boardList.uuid,
  })

  const taskIds = boardList.tasks.map((task) => task.uuid)

  return (
    <Card sx={{ minWidth: 280, width: 320, flexShrink: 0 }}>
      <Stack spacing={2} sx={{ p: 2.5 }}>
        <Stack spacing={0.75}>
          <Typography variant="h3" sx={{ fontSize: '1.05rem' }}>
            {boardList.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {boardList.tasks.length} task{boardList.tasks.length === 1 ? '' : 's'}
          </Typography>
        </Stack>

        <SortableContext id={boardList.uuid} items={taskIds} strategy={verticalListSortingStrategy}>
          <Stack
            ref={setNodeRef}
            spacing={1.25}
            sx={{
              minHeight: 100,
              backgroundColor: isOver ? 'action.selected' : 'action.hover',
              border: '1px dashed',
              borderColor: isOver ? 'primary.main' : 'divider',
              borderRadius: 1,
              p: 1,
              transition: 'background-color 120ms ease, border-color 120ms ease',
            }}
          >
            {boardList.tasks.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No tasks in this list yet.
              </Typography>
            ) : (
              boardList.tasks.map((task) => (
                <DraggableTaskCard
                  key={task.uuid}
                  task={task}
                  onClick={() => onTaskClick(task.uuid)}
                />
              ))
            )}
          </Stack>
        </SortableContext>
      </Stack>
    </Card>
  )
}

