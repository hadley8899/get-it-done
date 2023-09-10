import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {WorkspaceMember} from '../interfaces/workspace-member';
import {Observable} from 'rxjs';
import {WorkspaceInvite} from "../interfaces/workspace-invite";

@Injectable({
  providedIn: 'root'
})
export class WorkspaceMembersService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  getWorkspaceMembers(uuid: string):Observable<WorkspaceMember[]> {
    return this.http.get<any>(this.apiUrl + 'workspaces/' + uuid + '/members');
  }

  inviteMemberToWorkspace(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl + 'workspace-members/invite', formData);
  }

  acceptInvite(invite: WorkspaceInvite) {
    return this.http.post<any>(this.apiUrl + 'workspace-members/accept-invite/', {invite: invite.uuid});
  }

  rejectInvite(invite: WorkspaceInvite) {
    return this.http.post<any>(this.apiUrl + 'workspace-members/reject-invite/', {invite: invite.uuid});
  }

  invitesForUser(): Observable<{data: WorkspaceInvite[]}> {
    return this.http.get<any>(this.apiUrl + 'workspace-members/invites-for-user');
  }

  removeMember(workspaceMemberUuId: string) {
    return this.http.delete(this.apiUrl + 'workspace-members/remove-member/' + workspaceMemberUuId);
  }
}
