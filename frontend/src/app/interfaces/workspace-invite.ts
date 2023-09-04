import {Workspace} from "./workspace";
import {User} from "./user";

export interface WorkspaceInvite {
  uuid: string;
  workspace: Workspace;
  user: User;
  email: string;
  token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}
