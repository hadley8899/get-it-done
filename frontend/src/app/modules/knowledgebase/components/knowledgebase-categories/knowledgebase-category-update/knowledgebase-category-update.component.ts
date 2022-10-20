import {Component, OnInit} from '@angular/core';
import {Breadcrumb} from '../../../../../interfaces/breadcrumb';
import {ActivatedRoute, Router} from '@angular/router';
import {KnowledgebaseService} from '../../../../../services/knowledgebase.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {KnowledgebaseCategory} from '../../../../../interfaces/knowledgebase-category';
import {WorkspaceService} from '../../../../../services/workspace.service';
import {Workspace} from '../../../../../interfaces/workspace';

@UntilDestroy()
@Component({
  selector: 'app-knowledgebase-category-update',
  templateUrl: './knowledgebase-category-update.component.html',
  styleUrls: ['./knowledgebase-category-update.component.scss']
})
export class KnowledgebaseCategoryUpdateComponent implements OnInit {

  breadCrumbs: Breadcrumb[] = [
    {linkText: 'Home', routeItems: ['/']},
    {linkText: 'Knowledgebase Categories', routeItems: ['/knowledgebase/']},
    {linkText: 'Create Knowledgebase Category', routeItems: []},
  ];

  loadingKnowledgebaseCategory = true;
  knowledgebaseCategory!: KnowledgebaseCategory;
  activeWorkspace!: Workspace;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private knowledgebaseService: KnowledgebaseService,
    private workspaceService: WorkspaceService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (!params['uuid']) {
        this.router.navigate(['/knowledgebase/']).then();
      }

      this.workspaceService?.activeWorkspace?.pipe(untilDestroyed(this)).subscribe({
        next: (workspace) => {
          this.activeWorkspace = workspace;
          this.loadKnowledgebaseCategory(params['uuid']);
        }
      });
    })
  }

  private loadKnowledgebaseCategory(uuid: string) {
    this.loadingKnowledgebaseCategory = true;
    this.knowledgebaseService.fetchCategoryDetails(this.activeWorkspace, uuid).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.loadingKnowledgebaseCategory = false;
        this.knowledgebaseCategory = response;
      },
      error: (error) => {
        console.error(error);
        this.loadingKnowledgebaseCategory = false;
        this.router.navigate(['/knowledgebase/']).then();
      }
    });
  }

  updated() {
    this.router.navigate(['/knowledgebase/']).then();
  }
}
