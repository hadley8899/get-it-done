import {User} from './user';
import {TaskComment} from './task-comment';

export interface TaskDetailsFull {
  uuid: string;
  name: string;
  description: string;
  hours_worked: number;
  user: User,
  assigned_to: User;
  position: number;
  comments: TaskComment[];
  board_list: number;
  created_at: string;
  updated_at: string;
}
