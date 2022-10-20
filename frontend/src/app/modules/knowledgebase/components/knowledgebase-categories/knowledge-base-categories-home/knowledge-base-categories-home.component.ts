import {Component, OnInit} from '@angular/core';
import {KnowledgebaseService} from '../../../../../services/knowledgebase.service';
import {WorkspaceService} from '../../../../../services/workspace.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {Router} from '@angular/router';
import {Workspace} from '../../../../../interfaces/workspace';
import {KnowledgebaseCategory} from '../../../../../interfaces/knowledgebase-category';
import {ToastrService} from 'ngx-toastr';
import {Breadcrumb} from '../../../../../interfaces/breadcrumb';

@UntilDestroy()
@Component({
  selector: 'app-knowledge-base-categories-home',
  templateUrl: './knowledge-base-categories-home.component.html',
  styleUrls: ['./knowledge-base-categories-home.component.scss']
})
export class KnowledgeBaseCategoriesHomeComponent implements OnInit {

  activeWorkspace!: Workspace;
  loading = true;
  knowledgebaseCategories: KnowledgebaseCategory[] = [];

  breadCrumbs: Breadcrumb[] = [];

  constructor(
    private knowledgebaseService: KnowledgebaseService,
    private workspaceService: WorkspaceService,
    private router: Router,
    private toastr: ToastrService,
  ) {
  }

  ngOnInit(): void {
    // Get the active workspace
    if (typeof this.workspaceService.activeWorkspace === 'undefined') {
      this.router.navigate(['/workspaces']);
    }

    this.workspaceService.activeWorkspace?.pipe(untilDestroyed(this)).subscribe((workspace) => {
      this.activeWorkspace = workspace;
      this.loadCategoriesForWorkspace();
    });
  }

  loadCategoriesForWorkspace(): void {
    this.loading = true;
    this.knowledgebaseService.fetchCategoriesForWorkspace(this.activeWorkspace).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.knowledgebaseCategories = response.data;
        this.loading = false;
      }, error: (error) => {
        this.loading = false;
        console.error(error);
        this.toastr.error('Failed to load categories for workspace');
      }
    })
  }

  deleteCategory(knowledgebaseCategory: KnowledgebaseCategory) {
    this.knowledgebaseService.deleteCategory(this.activeWorkspace, knowledgebaseCategory).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.toastr.success('Category deleted successfully');
        this.loadCategoriesForWorkspace();

      },
      error: (error) => {
        console.error(error);
        this.toastr.error('Failed to delete category');
      }
    });
  }
}
