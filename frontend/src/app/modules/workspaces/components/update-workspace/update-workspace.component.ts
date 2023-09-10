import {Component, OnInit} from '@angular/core';
import {Breadcrumb} from '../../../../interfaces/breadcrumb';
import {Workspace} from '../../../../interfaces/workspace';
import {ActivatedRoute, Router} from '@angular/router';
import {WorkspaceService} from '../../../../services/workspace.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ToastrService} from 'ngx-toastr';
import {LaravelErrorExtractorService} from "../../../../services/laravel-error-extractor.service";
import {WorkspaceMember} from "../../../../interfaces/workspace-member";
import {environment} from "../../../../../environments/environment";
import {AuthService} from "../../../../services/auth.service";
import {LoggedInUser} from "../../../../interfaces/logged-in-user";
import {WorkspaceMembersService} from "../../../../services/workspace-members.service";

@UntilDestroy()
@Component({
  selector: 'app-update-workspace',
  templateUrl: './update-workspace.component.html',
  styleUrls: ['./update-workspace.component.scss']
})
export class UpdateWorkspaceComponent implements OnInit {
  loading = true;
  loadingMembers = true;
  workspace!: Workspace;
  workspaceMembers: WorkspaceMember[] = [];
  apiUrl = environment.apiUrl;
  loggedInUser!: LoggedInUser;

  breadCrumbs: Breadcrumb[] = [
    {linkText: 'home', routeItems: ['/home']},
    {linkText: 'Workspaces', routeItems: ['/workspaces']},
    {linkText: 'Update Workspace', routeItems: []},
  ];

  constructor(
    private route: ActivatedRoute,
    private workspaceService: WorkspaceService,
    private workspaceMembersService: WorkspaceMembersService,
    private toastr: ToastrService,
    private router: Router,
    private errorHandler: LaravelErrorExtractorService,
    private authService: AuthService,) {
  }

  ngOnInit(): void {
    this.authService.loggedInUser().pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.loggedInUser = response;
        this.route.params.subscribe(params => {
          this.loadWorkspace(params['uuid']);
        })
      }
    });
  }

  loadWorkspace(uuid: string) {
    this.workspaceService.details(uuid).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.workspace = response;
        this.loadWorkspaceMembers();
        this.loading = false;
      }
    });
  }

  workspaceUpdated() {
    this.workspaceService.refreshWorkspaceList();
    this.toastr.success('Workspace updated successfully');
    this.router.navigate(['/workspaces']);
  }

  loadWorkspaceMembers() {
    this.loadingMembers = true;
    this.workspaceService.workspaceMembers(this.workspace.uuid).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.workspaceMembers = response;
        this.loadingMembers = false;
      },
      error: (error) => {
        this.errorHandler.handleErrors(error);
        this.loadingMembers = false;
      }
    });
  }

  removeMember(workspaceMemberUuId: string) {
    this.workspaceMembersService.removeMember(workspaceMemberUuId).pipe(untilDestroyed(this)).subscribe({
      next: () => {
        this.loadWorkspaceMembers();
        this.toastr.success('Member removed successfully');
      },
      error: (error) => {
        this.errorHandler.handleErrors(error);
      }
    });
  }
}
