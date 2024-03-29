import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {WorkspaceHomeComponent} from '../components/workspace-home/workspace-home.component';
import {CreateWorkspaceComponent} from '../components/create-workspace/create-workspace.component';
import {UpdateWorkspaceComponent} from '../components/update-workspace/update-workspace.component';
import {WorkspaceInvitesComponent} from "../components/workspace-invites/workspace-invites.component";

const workspaceRoutes: Routes = [
  {path: '', component: WorkspaceHomeComponent},
  {path: 'create', component: CreateWorkspaceComponent},
  {path: 'update/:uuid', component: UpdateWorkspaceComponent},
  {path: 'invites', component: WorkspaceInvitesComponent},
];

@NgModule({
  imports: [RouterModule.forChild(workspaceRoutes)],
  exports: [RouterModule]
})
export class WorkspaceRoutingModule {
}
