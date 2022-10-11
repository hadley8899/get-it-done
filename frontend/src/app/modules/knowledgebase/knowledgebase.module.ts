import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  KnowledgeBaseCategoriesHomeComponent
} from './components/knowledge-base-categories-home/knowledge-base-categories-home.component';
import {KnowledgebaseRoutingModule} from './knowledgebase-routing/knowledgebase-routing.module';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [
    KnowledgeBaseCategoriesHomeComponent
  ],
  imports: [
    CommonModule,
    KnowledgebaseRoutingModule,
    SharedModule,
  ]
})
export class KnowledgebaseModule {
}
