import {NgModule} from '@angular/core';
import {BoardsRoutingModule} from './boards-routing/boards-routing.module';
import { BoardsHomeComponent } from './components/boards-home/boards-home.component';
import {SharedModule} from '../shared/shared.module';
import {CommonModule} from '@angular/common';
import { CreateBoardComponent } from './components/create-board/create-board.component';
import { UpdateBoardComponent } from './components/update-board/update-board.component';
import { BoardFormComponent } from './components/board-form/board-form.component';
import { BoardDetailsComponent } from './components/board-details/board-details.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SweetAlert2Module} from '@sweetalert2/ngx-sweetalert2';
import {MarkdownModule} from 'ngx-markdown';
import {SortablejsModule} from "nxt-sortablejs";
import { BoardTemplateHomeComponent } from './components/board-templates-home/board-template-home.component';
import { BoardTemplatesEditComponent } from './components/board-templates-edit/board-templates-edit.component';
import { BoardTemplatesItemFormComponent } from './components/board-templates-item-form/board-templates-item-form.component';
import { BoardTemplatesEditFormComponent } from './components/board-templates-edit-form/board-templates-edit-form.component';

@NgModule({
  imports: [
    BoardsRoutingModule,
    SharedModule,
    CommonModule,
    ReactiveFormsModule,
    SortablejsModule,
    FormsModule,
    SweetAlert2Module,
    MarkdownModule,
  ],
  declarations: [
    BoardsHomeComponent,
    CreateBoardComponent,
    UpdateBoardComponent,
    BoardFormComponent,
    BoardDetailsComponent,
    BoardTemplateHomeComponent,
    BoardTemplatesEditComponent,
    BoardTemplatesItemFormComponent,
    BoardTemplatesEditFormComponent
  ]
})
export class BoardsModule {
}
