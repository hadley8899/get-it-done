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
import {Knowledgebase} from '../../../../../interfaces/knowledgebase';
import {DateService} from '../../../../../services/date.service';
import {KnowledgebaseItem} from '../../../../../interfaces/knowledgebase-item';

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

  knowledgebases: Knowledgebase[] = [];
  activeKnowledgebase!: Knowledgebase;
  loadingKnowledgebases = true;
  selectingKnowledgebase = true;

  loadingKnowledgebaseItems = false;
  knowledgebaseItems: KnowledgebaseItem[] = [];

  activeKnowledgebaseItem!: KnowledgebaseItem;
  editingKnowledgebaseItem = false;

  loading = true;

  @ViewChild('childCategoryCloseButton') childCategoryCloseButton!: ElementRef;
  @ViewChild('knowledgebaseCategoryUpdateModalCloseButton') knowledgebaseCategoryUpdateModalCloseButton!: ElementRef;
  @ViewChild('knowledgebaseModalCloseButton') knowledgebaseModalCloseButton!: ElementRef;
  @ViewChild('updateKnowledgebaseModalCloseButton') updateKnowledgebaseModalCloseButton!: ElementRef;
  @ViewChild('knowledgebaseItemModalCloseButton') knowledgebaseItemModalCloseButton!: ElementRef;
  @ViewChild('knowledgebaseItemCloseButton') knowledgebaseItemCloseButton!: ElementRef;

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
    this.loadingKnowledgebases = true;
    this.selectingKnowledgebase = true;
    this.knowledgebaseService.loadKnowledgebases(this.activeWorkspace, this.activeKnowledgebaseCategory).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.knowledgebases = response.data;
        // If the count of knowledgebases is greater than 0, then select the first one
        if (this.knowledgebases.length > 0) {
          this.activeKnowledgebase = this.knowledgebases[0];
          this.loadKnowledgebaseItems();
        }
        this.loadingKnowledgebases = false;
        this.selectingKnowledgebase = false;
      },
      error: (error) => {
        this.genericErrorHandlerService.handleError(error);
        this.loadingKnowledgebases = false;
        this.selectingKnowledgebase = false;
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

  handleKnowledgebaseCategoryUpdated() {
    this.loadKnowledgebaseCategoryDetails(this.activeKnowledgebaseCategory.uuid);
    this.toastr.success('Knowledgebase updated');
    this.knowledgebaseCategoryUpdateModalCloseButton.nativeElement.click();
  }

  formatDate(date: string) {
    return DateService.formatDate(date);
  }

  selectKnowledgebase(knowledgebase: Knowledgebase) {
    this.selectingKnowledgebase = true;
    this.activeKnowledgebase = knowledgebase;
    this.loadKnowledgebaseItems();
    // This is a bit of a hack, But delaying the selection of knowledgebase rerenders the child form
    setTimeout(() => {
      this.selectingKnowledgebase = false;
    }, 100);
  }

  loadKnowledgebaseItems() {
    this.loadingKnowledgebaseItems = true;
    this.knowledgebaseService.loadKnowledgebaseItems(this.activeWorkspace, this.activeKnowledgebaseCategory, this.activeKnowledgebase).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.knowledgebaseItems = response.data;
        this.loadingKnowledgebaseItems = false;
      },
      error: (error) => {
        this.genericErrorHandlerService.handleError(error);
        this.loadingKnowledgebaseItems = false;
      }
    });
  }

  handleKnowledgebaseItemCreated() {
    this.loadKnowledgebaseItems();
    this.toastr.success('Knowledgebase item created');
    this.knowledgebaseItemModalCloseButton.nativeElement.click();
  }

  selectKnowledgebaseItem(knowledgebaseItem: KnowledgebaseItem) {
    this.activeKnowledgebaseItem = knowledgebaseItem;
  }

  handleKnowledgebaseItemUpdated(knowledgebaseItem: KnowledgebaseItem) {
    this.activeKnowledgebaseItem = knowledgebaseItem;
    this.loadKnowledgebaseItems();
    this.toastr.success('Knowledgebase item updated');
    this.editingKnowledgebaseItem = false;
  }

  handleKnowledgebaseUpdated() {
    this.loadKnowledgebases();
    this.toastr.success('Knowledgebase updated');
    this.updateKnowledgebaseModalCloseButton.nativeElement.click();
  }
}
