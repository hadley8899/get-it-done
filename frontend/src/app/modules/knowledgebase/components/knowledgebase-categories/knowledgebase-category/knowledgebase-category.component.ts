import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {WorkspaceService} from '../../../../../services/workspace.service';
import {KnowledgebaseService} from '../../../../../services/knowledgebase.service';
import {Workspace} from '../../../../../interfaces/workspace';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ActivatedRoute, Router} from '@angular/router';
import {KnowledgebaseCategory} from '../../../../../interfaces/knowledgebase-category';
import {ToastrService} from 'ngx-toastr';
import {Breadcrumb} from '../../../../../interfaces/breadcrumb';
import {GenericErrorHandlerService} from '../../../../../services/generic-error-handler.service';

@UntilDestroy()
@Component({
  selector: 'app-knowledgebase-category',
  templateUrl: './knowledgebase-category.component.html',
  styleUrls: ['./knowledgebase-category.component.scss']
})
export class KnowledgebaseCategoryComponent implements OnInit {

  headingText = 'Knowledgebase Category';
  subHeaderText: string = '';

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
  @ViewChild('knowledgebaseCategoryUpdateModalCloseButton') knowledgebaseCategoryUpdateModalCloseButton!: ElementRef;
  @ViewChild('knowledgebaseModalCloseButton') knowledgebaseModalCloseButton!: ElementRef;


  constructor(
    private workspaceService: WorkspaceService,
    private knowledgebaseService: KnowledgebaseService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
    private genericErrorHandlerService: GenericErrorHandlerService
  ) {
    // Force the component to reload
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
    this.workspaceService.activeWorkspace?.pipe(untilDestroyed(this)).subscribe({
      next: (workspace) => {
        this.activeWorkspace = workspace;
        this.route.params.pipe(untilDestroyed(this)).subscribe({
          next: (params) => {
            this.loadKnowledgebaseCategoryDetails(params['uuid']);
          },
          error: (error) => {
            this.genericErrorHandlerService.handleError(error);
          }
        });
      }
    });
  }

  loadKnowledgebaseCategoryDetails(uuid: string) {
    this.knowledgebaseService.fetchCategoryDetails(this.activeWorkspace, uuid).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.activeKnowledgebaseCategory = response;

        this.headingText = this.activeKnowledgebaseCategory.name;
        this.subHeaderText = this.activeKnowledgebaseCategory.description;
        this.loadKnowledgebaseChildCategories();
        this.loadKnowledgebases();
        this.loading = false;
      },
      error: (error) => {
        this.genericErrorHandlerService.handleError(error);
      }
    });
  }

  loadKnowledgebaseChildCategories() {
    this.knowledgebaseService.loadChildCategories(this.activeWorkspace, this.activeKnowledgebaseCategory).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.childCategories = response.data;
      },
      error: (error) => {
        this.genericErrorHandlerService.handleError(error);
      }
    });
  }

  loadKnowledgebases() {
    this.knowledgebaseService.loadKnowledgebases(this.activeWorkspace, this.activeKnowledgebaseCategory).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.knowledgebases = response.data;
      },
      error: (error) => {
        this.genericErrorHandlerService.handleError(error);
      }
    });
  }

  handleKnowledgebaseCategoryCreated() {
    this.loadKnowledgebaseChildCategories();
    this.toastr.success('Knowledgebase category created');
    this.childCategoryCloseButton.nativeElement.click();
  }

  handleKnowledgebaseCreated() {
    this.loadKnowledgebases();
    this.toastr.success('Knowledgebase created');
    this.knowledgebaseModalCloseButton.nativeElement.click();
  }

  backLink() {
    if (!this.loading) {
      if (this.activeKnowledgebaseCategory.parent) {
        return ['/knowledgebase/category', this.activeKnowledgebaseCategory.parent.uuid];
      } else {
        return ['/knowledgebase'];
      }
    }

    return [];
  }

  handleKnowledgebaseUpdated() {
    this.loadKnowledgebaseCategoryDetails(this.activeKnowledgebaseCategory.uuid);
    this.toastr.success('Knowledgebase updated');
    this.knowledgebaseCategoryUpdateModalCloseButton.nativeElement.click();
  }
}
