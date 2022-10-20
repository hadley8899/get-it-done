import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {KnowledgebaseService} from '../../../../services/knowledgebase.service';
import {WorkspaceService} from '../../../../services/workspace.service';
import {Workspace} from '../../../../interfaces/workspace';
import {untilDestroyed} from '@ngneat/until-destroy';
import {ToastrService} from 'ngx-toastr';
import {KnowledgebaseCategory} from '../../../../interfaces/knowledgebase-category';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-knowledgebase-form',
  templateUrl: './knowledgebase-form.component.html',
  styleUrls: ['./knowledgebase-form.component.scss']
})
export class KnowledgebaseFormComponent implements OnInit {

  @Input() knowledgebaseCategory!: KnowledgebaseCategory;

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
    this.knowledgebaseForm = new FormGroup({
      name: new FormControl(this.knowledgebaseCategory?.name, [Validators.required]),
      description: new FormControl(this.knowledgebaseCategory?.description, [Validators.required]),
    });
  }

}
