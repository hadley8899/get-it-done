import { Card, Chip, Stack, Typography } from '@mui/material'
import type { BoardList } from '@/types/board'

export function BoardListColumn({ boardList }: { boardList: BoardList }) {
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

        <Stack spacing={1.25}>
          {boardList.tasks.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No tasks in this list yet.
            </Typography>
          ) : (
            boardList.tasks.map((task) => (
              <Card key={task.uuid} variant="outlined" sx={{ p: 1.5 }}>
                <Stack spacing={1}>
                  <Typography sx={{ fontWeight: 600 }}>{task.name}</Typography>
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
            ))
          )}
        </Stack>
      </Stack>
    </Card>
  )
}
