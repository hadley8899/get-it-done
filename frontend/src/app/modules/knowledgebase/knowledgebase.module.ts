import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  KnowledgeBaseCategoriesHomeComponent
} from './components/knowledgebase-categories/knowledge-base-categories-home/knowledge-base-categories-home.component';
import {KnowledgebaseRoutingModule} from './knowledgebase-routing/knowledgebase-routing.module';
import {SharedModule} from '../shared/shared.module';
import {SweetAlert2Module} from '@sweetalert2/ngx-sweetalert2';
import { KnowledgebaseCategoryCreateComponent } from './components/knowledgebase-categories/knowledgebase-category-create/knowledgebase-category-create.component';
import { KnowledgebaseCategoryFormComponent } from './components/knowledgebase-categories/knowledgebase-category-form/knowledgebase-category-form.component';
import {ReactiveFormsModule} from '@angular/forms';
import { KnowledgebaseCategoryUpdateComponent } from './components/knowledgebase-categories/knowledgebase-category-update/knowledgebase-category-update.component';
import { KnowledgebaseCategoryComponent } from './components/knowledgebase-categories/knowledgebase-category/knowledgebase-category.component';
import { KnowledgebaseFormComponent } from './components/knowledgebase-form/knowledgebase-form.component';
import {DataTablesModule} from 'angular-datatables';
import { KnowledgebaseItemFormComponent } from './components/knowledgebase-item-form/knowledgebase-item-form.component';
import {MarkdownModule} from 'ngx-markdown';
import { KnowledgebaseItemsTableComponent } from './components/knowledgebase-categories/knowledgebase-category/knowledgebase-items-table/knowledgebase-items-table.component';
import { KnowledgebaseListComponent } from './components/knowledgebase-categories/knowledgebase-category/knowledgebase-list/knowledgebase-list.component';
import { KnowledgebaseCategoryChildListComponent } from './components/knowledgebase-categories/knowledgebase-category/knowledgebase-category-child-list/knowledgebase-category-child-list.component';

@NgModule({
  declarations: [
    KnowledgeBaseCategoriesHomeComponent,
    KnowledgebaseCategoryCreateComponent,
    KnowledgebaseCategoryFormComponent,
    KnowledgebaseCategoryUpdateComponent,
    KnowledgebaseCategoryComponent,
    KnowledgebaseFormComponent,
    KnowledgebaseItemFormComponent,
    KnowledgebaseItemsTableComponent,
    KnowledgebaseListComponent,
    KnowledgebaseCategoryChildListComponent,
  ],
  imports: [
    CommonModule,
    KnowledgebaseRoutingModule,
    SharedModule,
    SweetAlert2Module,
    ReactiveFormsModule,
    DataTablesModule,
    MarkdownModule.forChild(),
  ]
})
export class KnowledgebaseModule {
}
