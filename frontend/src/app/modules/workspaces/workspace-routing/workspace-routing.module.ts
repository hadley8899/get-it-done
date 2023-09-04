import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {WorkspaceHomeComponent} from '../components/workspace-home/workspace-home.component';
import {CreateWorkspaceComponent} from '../components/create-workspace/create-workspace.component';
import {UpdateWorkspaceComponent} from '../components/update-workspace/update-workspace.component';
import {AcceptWorkspaceInviteComponent} from "../components/accept-workspace-invite/accept-workspace-invite.component";
import {AuthGuard} from "../../../guards/auth.guard";

const workspaceRoutes: Routes = [
  {path: '', component: WorkspaceHomeComponent, canActivate: [AuthGuard]},
  {path: 'create', component: CreateWorkspaceComponent, canActivate: [AuthGuard]},
  {path: 'update/:uuid', component: UpdateWorkspaceComponent, canActivate: [AuthGuard]},
  {path: 'accept-invite/:token', component: AcceptWorkspaceInviteComponent}, // Public route
];

@NgModule({
  imports: [RouterModule.forChild(workspaceRoutes)],
  exports: [RouterModule]
})
export class WorkspaceRoutingModule {
}
