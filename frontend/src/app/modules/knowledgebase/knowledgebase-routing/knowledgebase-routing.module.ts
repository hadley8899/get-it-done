import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
  KnowledgeBaseCategoriesHomeComponent
} from '../components/knowledge-base-categories-home/knowledge-base-categories-home.component';

const routes: Routes = [
  {path: '', component: KnowledgeBaseCategoriesHomeComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KnowledgebaseRoutingModule {
}
