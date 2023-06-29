import {NgModule} from '@angular/core';

import {RouterModule, Routes} from '@angular/router';
import {BoardsHomeComponent} from '../components/boards-home/boards-home.component';
import {BoardDetailsComponent} from '../components/board-details/board-details.component';
import {UpdateBoardComponent} from '../components/update-board/update-board.component';
import {CreateBoardComponent} from '../components/create-board/create-board.component';
import {BoardTemplateHomeComponent} from "../components/board-templates-home/board-template-home.component";
import {BoardTemplatesEditComponent} from "../components/board-templates-edit/board-templates-edit.component";

const boardRoutes: Routes = [
  {path: 'board-templates', component: BoardTemplateHomeComponent},
  {path: 'board-templates/edit/:uuid', component: BoardTemplatesEditComponent},
  {path: '', component: BoardsHomeComponent},
  {path: 'create', component: CreateBoardComponent},
  {path: 'update/:uuid', component: UpdateBoardComponent},
  {path: ':uuid', component: BoardDetailsComponent},
];

@NgModule({
  imports: [RouterModule.forChild(boardRoutes)],
  exports: [RouterModule]
})
export class BoardsRoutingModule {
}
