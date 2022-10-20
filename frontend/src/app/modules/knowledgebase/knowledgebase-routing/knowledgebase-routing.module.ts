import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
  KnowledgeBaseCategoriesHomeComponent
} from '../components/knowledgebase-categories/knowledge-base-categories-home/knowledge-base-categories-home.component';
import {
  KnowledgebaseCategoryCreateComponent
} from '../components/knowledgebase-categories/knowledgebase-category-create/knowledgebase-category-create.component';
import {
  KnowledgebaseCategoryUpdateComponent
} from '../components/knowledgebase-categories/knowledgebase-category-update/knowledgebase-category-update.component';
import {KnowledgebaseCategoryComponent} from '../components/knowledgebase-categories/knowledgebase-category/knowledgebase-category.component';

const routes: Routes = [
  {path: '', component: KnowledgeBaseCategoriesHomeComponent},
  {path: 'category/create', component: KnowledgebaseCategoryCreateComponent},
  {path: 'category/update/:uuid', component: KnowledgebaseCategoryUpdateComponent},
  {path: 'category/:uuid', component: KnowledgebaseCategoryComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KnowledgebaseRoutingModule {
}
