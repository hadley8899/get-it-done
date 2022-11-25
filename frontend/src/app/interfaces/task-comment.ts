import {User} from './user';

export interface TaskComment {
  uuid: string;
  comment: string;
  created_at: string;
  updated_at: string;
  user: User;
}
