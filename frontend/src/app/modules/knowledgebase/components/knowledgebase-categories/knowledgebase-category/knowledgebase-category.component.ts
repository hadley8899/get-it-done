import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {WorkspaceService} from '../../../../../services/workspace.service';
import {KnowledgebaseService} from '../../../../../services/knowledgebase.service';
import {Workspace} from '../../../../../interfaces/workspace';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ActivatedRoute, Router} from '@angular/router';
import {KnowledgebaseCategory} from '../../../../../interfaces/knowledgebase-category';
import {ToastrService} from 'ngx-toastr';
import {Breadcrumb} from '../../../../../interfaces/breadcrumb';

@UntilDestroy()
@Component({
  selector: 'app-knowledgebase-category',
  templateUrl: './knowledgebase-category.component.html',
  styleUrls: ['./knowledgebase-category.component.scss']
})
export class KnowledgebaseCategoryComponent implements OnInit {

  headingText = 'Knowledgebase Category';
  breadCrumbs: Breadcrumb[] = [
    {linkText: 'Home', routeItems: ['/']},
    {linkText: 'Knowledgebase Categories', routeItems: ['/knowledgebase/']},
    {linkText: 'Knowledgebase Category', routeItems: []},
  ];

  activeWorkspace!: Workspace;
  activeKnowledgebaseCategory!: KnowledgebaseCategory;
  childCategories: KnowledgebaseCategory[] = [];
  knowledgebases: any[] = [];

  loading = true;

  @ViewChild('childCategoryCloseButton') childCategoryCloseButton!: ElementRef;

  constructor(
    private workspaceService: WorkspaceService,
    private knowledgebaseService: KnowledgebaseService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.workspaceService.activeWorkspace?.pipe(untilDestroyed(this)).subscribe({
      next: (workspace) => {
        this.activeWorkspace = workspace;
        this.route.params.pipe(untilDestroyed(this)).subscribe({
          next: (params) => {
            this.loadKnowledgebaseCategoryDetails(params['uuid']);
          }
        });
      }
    });
  }

  loadKnowledgebaseCategoryDetails(uuid: string) {
    this.knowledgebaseService.fetchCategoryDetails(this.activeWorkspace, uuid).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.activeKnowledgebaseCategory = response;

        // Need to think about breadcrumbs here, Do I make a tree of the parents of this category?

        this.headingText = this.activeKnowledgebaseCategory.name;
        this.loadKnowledgebaseChildCategories();
        this.loadKnowledgebases();
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.toastr.error('Failed to load knowledgebase category details');
        this.router.navigate(['/knowledgebase/']).then();
      }
    });
  }

  loadKnowledgebaseChildCategories() {
    this.knowledgebaseService.loadChildCategories(this.activeWorkspace, this.activeKnowledgebaseCategory).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.childCategories = response.data;
      }
    });
  }

  loadKnowledgebases() {
    this.knowledgebaseService.loadKnowledgebases(this.activeWorkspace, this.activeKnowledgebaseCategory).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        console.table(response);
      },
      error: (error) => {
        console.error(error);
        this.toastr.error('Failed to load knowledgebases');
      }
    });
  }

  handleKnowledgebaseCategoryCreated() {
    this.loadKnowledgebaseChildCategories();
    this.toastr.success('Knowledgebase category created');
    this.childCategoryCloseButton.nativeElement.click();
  }
}
