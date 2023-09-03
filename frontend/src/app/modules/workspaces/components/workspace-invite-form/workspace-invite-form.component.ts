import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {WorkspaceMembersService} from "../../../../services/workspace-members.service";
import {ToastrService} from "ngx-toastr";
import {LaravelErrorExtractorService} from "../../../../services/laravel-error-extractor.service";

@Component({
  selector: 'app-workspace-invite-form',
  templateUrl: './workspace-invite-form.component.html',
  styleUrls: ['./workspace-invite-form.component.scss']
})
export class WorkspaceInviteFormComponent implements OnInit {

  @Input() workspaceUuid!: string;

  workspaceInviteForm!: FormGroup;
  loadingForm: boolean = true;

  constructor(
    private workspaceMemberService: WorkspaceMembersService,
    private toastr: ToastrService,
    private errorHandler: LaravelErrorExtractorService
  ) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.loadingForm = true;
    this.workspaceInviteForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
    this.loadingForm = false;
  }

  handleSubmit() {
    if (this.workspaceInviteForm.valid) {

      const formData = new FormData();
      formData.append('email', this.workspaceInviteForm.value.email);
      formData.append('workspace_uuid', this.workspaceUuid);

      this.workspaceMemberService.inviteMemberToWorkspace(formData).subscribe({
        next: () => {
          this.toastr.success('Invitation sent.');
          this.initForm();
        },
        error: (error) => {
          this.errorHandler.handleErrors(error);
        }
      });

    } else {
      this.toastr.error('Form is not valid.');
    }
  }

  isValid(field: string): boolean {
    const control = this.workspaceInviteForm.get(field);
    if (control) {
      return control.touched ? control.valid : true;
    }
    return true;
  }

  getErrorMessage(field: string): string {
    const control = this.workspaceInviteForm.get(field);
    if (control && control.touched && control.errors) {
      if (control.errors?.['required']) {
        return 'This field is required.';
      }
      if (control.errors?.['email']) {
        return 'Not a valid email.';
      }
    }
    return '';
  }
}
