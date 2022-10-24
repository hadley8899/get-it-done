import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {KnowledgebaseService} from '../../../../services/knowledgebase.service';
import {WorkspaceService} from '../../../../services/workspace.service';
import {Workspace} from '../../../../interfaces/workspace';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ToastrService} from 'ngx-toastr';
import {KnowledgebaseCategory} from '../../../../interfaces/knowledgebase-category';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Knowledgebase} from '../../../../interfaces/knowledgebase';
import {GenericErrorHandlerService} from '../../../../services/generic-error-handler.service';

@UntilDestroy()
@Component({
  selector: 'app-knowledgebase-form',
  templateUrl: './knowledgebase-form.component.html',
  styleUrls: ['./knowledgebase-form.component.scss']
})
export class KnowledgebaseFormComponent implements OnInit {

  @Input() knowledgebaseCategory!: KnowledgebaseCategory;
  @Input() knowledgebase!: Knowledgebase;

  @Output() knowledgebaseCreated: EventEmitter<any> = new EventEmitter<any>();
  @Output() knowledgebaseUpdated: EventEmitter<any> = new EventEmitter<any>();

  knowledgebaseForm!: FormGroup;

  activeWorkspace!: Workspace;

  loading = true;
  saving = false;

  constructor(
    private knowledgebaseService: KnowledgebaseService,
    private workspaceService: WorkspaceService,
    private toastr: ToastrService,
    private genericErrorHandler: GenericErrorHandlerService
  ) {
  }

  ngOnInit(): void {
    this.workspaceService.activeWorkspace?.pipe(untilDestroyed(this)).subscribe({
      next: (workspace) => {
        this.activeWorkspace = workspace;
        this.initForm();
      }
    })
  }

  initForm() {
    this.loading = true;
    this.knowledgebaseForm = new FormGroup({
      name: new FormControl(this.knowledgebase?.name, [Validators.required]),
      description: new FormControl(this.knowledgebase?.description, [Validators.required]),
    });
    this.loading = false;
  }

  save() {
    if (!this.knowledgebase) {
      this.add();
      return;
    }

    this.update();
  }

  add() {
    this.saving = true;
    this.knowledgebaseService.createKnowledgebase(this.activeWorkspace, this.knowledgebaseCategory, this.knowledgebaseForm.value).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.knowledgebaseCreated.emit(response.data);
        this.knowledgebaseForm.reset();
        this.saving = false;
      }, error: (error) => {
        this.genericErrorHandler.handleError(error);
        this.saving = false;
      }
    });
  }

  update() {
    this.saving = true;
    this.knowledgebaseService.updateKnowledgebase(this.activeWorkspace, this.knowledgebaseCategory, this.knowledgebase.uuid, this.knowledgebaseForm.value).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.knowledgebaseUpdated.emit(response.data);
        this.knowledgebaseForm.reset();
        this.saving = false;
      }, error: (error) => {
        this.genericErrorHandler.handleError(error);
        this.saving = false;
      }
    });
  }
}
