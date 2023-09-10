import {Component, OnInit} from '@angular/core';
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {WorkspaceInvite} from "../../../../../interfaces/workspace-invite";
import {WorkspaceMembersService} from "../../../../../services/workspace-members.service";

@UntilDestroy()
@Component({
  selector: 'app-workspace-invites-button',
  templateUrl: './workspace-invites-button.component.html',
  styleUrls: ['./workspace-invites-button.component.scss']
})
export class WorkspaceInvitesButtonComponent implements OnInit {

  invites: WorkspaceInvite[] = [];
  loading = true;

  constructor(private workspaceMembersService: WorkspaceMembersService) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.workspaceMembersService.invitesForUser().pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.invites = response.data;
        this.loading = false;
      }
    });
  }
}
