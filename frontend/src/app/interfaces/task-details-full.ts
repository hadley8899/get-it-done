import {User} from './user';
import {TaskComment} from './task-comment';

export interface TaskDetailsFull {
  uuid: string;
  name: string;
  description: string;
  user: User,
  assigned_to: User;
  position: number;
  comments: TaskComment[];
  created_at: string;
  updated_at: string;
}
