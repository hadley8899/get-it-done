import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {WorkspaceMembersService} from "../../../../services/workspace-members.service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {WorkspaceInvite} from "../../../../interfaces/workspace-invite";
import {environment} from "../../../../../environments/environment";

@UntilDestroy()
@Component({
  selector: 'app-accept-workspace-invite',
  templateUrl: './accept-workspace-invite.component.html',
  styleUrls: ['./accept-workspace-invite.component.scss']
})
export class AcceptWorkspaceInviteComponent implements OnInit {
  siteName = environment.appName;
  token: string = '';
  workspaceInvite!: WorkspaceInvite;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private workspaceMembersService: WorkspaceMembersService) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.route.params.subscribe(params => {
      this.token = params['token'];
      this.workspaceMembersService.checkCode(this.token).pipe(untilDestroyed(this)).subscribe({
        next: (response) => {
          this.workspaceInvite = response.data;
          this.loading = false;
        }
      });
    });
  }

  acceptInvite() {
    this.workspaceMembersService.acceptInvite(this.token).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        console.log(response);
      }
    });
  }
}
