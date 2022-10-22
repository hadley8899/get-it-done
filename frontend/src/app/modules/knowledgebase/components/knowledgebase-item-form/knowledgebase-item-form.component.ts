import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GenericErrorHandlerService} from '../../../../services/generic-error-handler.service';
import {KnowledgebaseService} from '../../../../services/knowledgebase.service';
import {KnowledgebaseItem} from '../../../../interfaces/knowledgebase-item';
import {KnowledgebaseCategory} from '../../../../interfaces/knowledgebase-category';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {WorkspaceService} from '../../../../services/workspace.service';
import {Workspace} from '../../../../interfaces/workspace';
import {Knowledgebase} from '../../../../interfaces/knowledgebase';

@UntilDestroy()
@Component({
  selector: 'app-knowledgebase-item-form',
  templateUrl: './knowledgebase-item-form.component.html',
  styleUrls: ['./knowledgebase-item-form.component.scss']
})
export class KnowledgebaseItemFormComponent implements OnInit {

  constructor(
    private knowledgebaseService: KnowledgebaseService,
    private genericErrorHandlerService: GenericErrorHandlerService,
    private workspaceService: WorkspaceService,
  ) {
  }

  activeWorkspace!: Workspace;

  loading = true;
  saving = false;
  knowledgebaseItemForm!: FormGroup;

  @Input() knowledgebaseItem!: KnowledgebaseItem;
  @Input() knowledgebase!: Knowledgebase;
  @Input() knowledgebaseCategory !: KnowledgebaseCategory;

  @Output() knowledgebaseItemCreated: EventEmitter<any> = new EventEmitter<any>();
  @Output() knowledgebaseItemUpdated: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit(): void {
    console.log('init');
    this.workspaceService.activeWorkspace?.pipe(untilDestroyed(this)).subscribe((workspace) => {
      this.activeWorkspace = workspace;
      this.initForm();
    });
  }

  initForm(): void {
    this.loading = true;
    this.knowledgebaseItemForm = new FormGroup({
      name: new FormControl(this.knowledgebaseItem?.name, [Validators.required]),
      contents: new FormControl(this.knowledgebaseItem?.contents, [Validators.required]),
    });

    this.loading = false;
  }

  save() {
    this.saving = true;
    if (this.knowledgebaseItem) {
      this.update();
      return;
    }

    this.create();
  }

  update(): void {
    this.knowledgebaseService.updateKnowledgebaseItem(this.activeWorkspace, this.knowledgebaseCategory, this.knowledgebase, this.knowledgebaseItem, this.knowledgebaseItemForm.value).subscribe({
      next: (knowledgebaseItem) => {
        this.knowledgebaseItemUpdated.emit(knowledgebaseItem);
        this.saving = false;
      },
      error: (error) => {
        this.genericErrorHandlerService.handleError(error);
        this.saving = false;
      }
    });
  }

  create(): void {
    this.knowledgebaseService.createKnowledgebaseItem(this.activeWorkspace, this.knowledgebaseCategory, this.knowledgebase, this.knowledgebaseItemForm.value).subscribe({
        next: (response) => {
          this.knowledgebaseItemCreated.emit(response);
          this.saving = false;
        },
        error: (error) => {
          this.genericErrorHandlerService.handleError(error);
          this.saving = false;
        }
      }
    );
  }
}
