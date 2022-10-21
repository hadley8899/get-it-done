import {Component, Input, OnInit} from '@angular/core';
import {GenericErrorHandlerService} from '../../../../services/generic-error-handler.service';
import {ToastrService} from 'ngx-toastr';
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
    private toastr: ToastrService,
    private genericErrorHandlerService: GenericErrorHandlerService,
    private workspaceService: WorkspaceService,
  ) {
  }

  activeWorkspace!: Workspace;

  loading = true;
  knowledgebaseItemForm!: FormGroup;

  @Input() knowledgebaseItem!: KnowledgebaseItem;
  @Input() knowledgebase!: Knowledgebase;
  @Input() knowledgebaseCategory !: KnowledgebaseCategory;

  ngOnInit(): void {
    this.workspaceService.activeWorkspace?.pipe(untilDestroyed(this)).subscribe((workspace) => {
      this.activeWorkspace = workspace;
      this.initForm();
    });
  }

  initForm(): void {
    this.loading = true;
    this.knowledgebaseItemForm = new FormGroup({
      title: new FormControl(this.knowledgebaseItem.name, [Validators.required]),
      content: new FormControl(this.knowledgebaseItem.contents, [Validators.required]),
    });

    this.loading = false;
  }

  save() {
    if (this.knowledgebaseItem) {
      this.update();
      return;
    }

    this.create();
  }

  update(): void {
  }

  create(): void {
    this.knowledgebaseService.createKnowledgebaseItem(this.activeWorkspace, this.knowledgebaseCategory, this.knowledgebase, this.knowledgebaseItemForm.value).subscribe(
      (response) => {
        this.toastr.success('Knowledgebase Item created successfully');
      });
  }
}
