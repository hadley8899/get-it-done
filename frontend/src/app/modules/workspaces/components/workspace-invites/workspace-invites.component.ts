import {Component, OnInit} from '@angular/core';
import {WorkspaceMembersService} from "../../../../services/workspace-members.service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {WorkspaceInvite} from "../../../../interfaces/workspace-invite";
import {Breadcrumb} from "../../../../interfaces/breadcrumb";
import {LaravelErrorExtractorService} from "../../../../services/laravel-error-extractor.service";

@UntilDestroy()
@Component({
  selector: 'app-workspace-invites',
  templateUrl: './workspace-invites.component.html',
  styleUrls: ['./workspace-invites.component.scss']
})
export class WorkspaceInvitesComponent implements OnInit {

  loading = true;
  invites: WorkspaceInvite[] = [];

  breadCrumbs: Breadcrumb[] = [
    {linkText: 'Home', routeItems: ['/']},
    {linkText: 'Workspaces', routeItems: ['workspaces']},
    {linkText: 'Invites', routeItems: []}
  ];

  constructor(private workspaceMembersService: WorkspaceMembersService,
              private errorHandler: LaravelErrorExtractorService) {
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

  acceptInvite(invite: WorkspaceInvite) {
    this.workspaceMembersService.acceptInvite(invite).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        if (response.success) {
          this.invites = this.invites.filter((i) => i.uuid !== invite.uuid);
        }
      },
      error: (err) => {
        this.errorHandler.handleErrors(err);
      }
    });
  }

  rejectInvite(invite: WorkspaceInvite) {
    this.workspaceMembersService.rejectInvite(invite).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        if (response.success) {
          this.invites = this.invites.filter((i) => i.uuid !== invite.uuid);
        }
      },
      error: (err) => {
        this.errorHandler.handleErrors(err);
      }
    });
  }
}
