import {TaskDetailsFull} from './task-details-full';

export interface BoardList {
  uuid: string;
  name: string;
  tasks: TaskDetailsFull[];
  position: number;
}
