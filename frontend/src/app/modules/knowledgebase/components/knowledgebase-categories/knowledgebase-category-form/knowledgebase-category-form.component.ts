import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {KnowledgebaseCategory} from '../../../../../interfaces/knowledgebase-category';
import {KnowledgebaseService} from '../../../../../services/knowledgebase.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {WorkspaceService} from '../../../../../services/workspace.service';
import {Workspace} from '../../../../../interfaces/workspace';
import {ToastrService} from 'ngx-toastr';
import {GenericErrorHandlerService} from '../../../../../services/generic-error-handler.service';

@Component({
  selector: 'app-knowledgebase-category-form',
  templateUrl: './knowledgebase-category-form.component.html',
  styleUrls: ['./knowledgebase-category-form.component.scss']
})
export class KnowledgebaseCategoryFormComponent implements OnInit {

  @Input() knowledgebaseCategory?: KnowledgebaseCategory;
  @Input() parentKnowledgebaseCategory?: KnowledgebaseCategory;

  @Output() knowledgebaseCategoryCreated: EventEmitter<any> = new EventEmitter<any>();
  @Output() knowledgebaseCategoryUpdated: EventEmitter<any> = new EventEmitter<any>();

  knowledgebaseCategoryForm!: FormGroup;

  activeWorkspace!: Workspace;

  loading = true;

  saving = false;

  constructor(
    private knowledgebaseService: KnowledgebaseService,
    private workspaceService: WorkspaceService,
    private toastr: ToastrService,
    private genericErrorExtractor: GenericErrorHandlerService,
  ) {
  }

  ngOnInit(): void {
    this.workspaceService.activeWorkspace?.subscribe((workspace) => {
      this.activeWorkspace = workspace;
      this.initForm();
    });
  }

  initForm() {
    this.loading = true;
    this.knowledgebaseCategoryForm = new FormGroup({
      name: new FormControl(this.knowledgebaseCategory?.name, [Validators.required]),
      description: new FormControl(this.knowledgebaseCategory?.description, [Validators.required]),
      parent_uuid: new FormControl(this.parentKnowledgebaseCategory?.uuid),
    })
    this.loading = false;
  }

  createKnowledgebaseCategory() {
    this.saving = true;
    this.knowledgebaseService.createKnowledgebaseCategory(this.activeWorkspace, this.knowledgebaseCategoryForm.value).subscribe({
      next: (response) => {
        this.knowledgebaseCategoryCreated.emit(response.data);
        this.saving = false;
        // Reset the form but keep the parent
        this.knowledgebaseCategoryForm.reset({
          parent_uuid: this.parentKnowledgebaseCategory?.uuid
        });
      },
      error: (error) => {
        this.genericErrorExtractor.handleError(error);
        this.saving = false;
      }
    })
  }

  updateKnowledgebaseCategory() {
    if (!this.knowledgebaseCategory) {
      return;
    }
    this.saving = true;
    this.knowledgebaseService.updateKnowledgebaseCategory(this.activeWorkspace, this.knowledgebaseCategory?.uuid, this.knowledgebaseCategoryForm.value).subscribe({
      next: (response) => {
        this.knowledgebaseCategoryUpdated.emit(response.data);
        this.saving = false;
        // Reset the form but keep the parent
        this.knowledgebaseCategoryForm.reset({
          parent_uuid: this.parentKnowledgebaseCategory?.uuid
        });
      },
      error: (error) => {
        this.genericErrorExtractor.handleError(error);
        this.saving = false;
      }
    })
  }

  save() {
    if (!this.knowledgebaseCategory) {
      this.createKnowledgebaseCategory();
    } else {
      this.updateKnowledgebaseCategory();
    }
  }
}
