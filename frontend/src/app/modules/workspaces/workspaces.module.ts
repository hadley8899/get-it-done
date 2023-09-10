import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {WorkspaceRoutingModule} from './workspace-routing/workspace-routing.module';
import { WorkspaceHomeComponent } from './components/workspace-home/workspace-home.component';
import { CreateWorkspaceComponent } from './components/create-workspace/create-workspace.component';
import { UpdateWorkspaceComponent } from './components/update-workspace/update-workspace.component';
import { WorkspaceFormComponent } from './components/workspace-form/workspace-form.component';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';
import {SweetAlert2Module} from '@sweetalert2/ngx-sweetalert2';
import { WorkspaceInviteFormComponent } from './components/workspace-invite-form/workspace-invite-form.component';
import { WorkspaceInvitesButtonComponent } from './components/workspace-home/workspace-invites-button/workspace-invites-button.component';
import { WorkspaceInvitesComponent } from './components/workspace-invites/workspace-invites.component';

@NgModule({
  declarations: [
    WorkspaceHomeComponent,
    CreateWorkspaceComponent,
    UpdateWorkspaceComponent,
    WorkspaceFormComponent,
    WorkspaceInviteFormComponent,
    WorkspaceInvitesButtonComponent,
    WorkspaceInvitesComponent
  ],
    imports: [
        CommonModule,
        WorkspaceRoutingModule,
        ReactiveFormsModule,
        SharedModule,
        SweetAlert2Module,
        NgOptimizedImage
    ]
})
export class WorkspacesModule {
}
