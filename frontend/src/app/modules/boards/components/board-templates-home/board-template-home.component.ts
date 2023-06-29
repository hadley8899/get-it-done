import {Component, OnInit} from '@angular/core';
import {BoardTemplate} from "../../../../interfaces/board-template";
import {BoardService} from "../../../../services/board.service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {Breadcrumb} from "../../../../interfaces/breadcrumb";

@UntilDestroy()

@Component({
  selector: 'app-board-templates-home',
  templateUrl: './board-template-home.component.html',
  styleUrls: ['./board-template-home.component.scss']
})
export class BoardTemplateHomeComponent implements OnInit {
  loadingBoardTemplates = true;
  boardTemplates: BoardTemplate[] = [];

  breadCrumbs: Breadcrumb[] = [
    {linkText: 'home', routeItems: ['/home']},
    {linkText: 'Boards', routeItems: ['/boards']},
    {linkText: 'Board Templates', routeItems: []},
  ];

  constructor(private boardService: BoardService) {
  }

  ngOnInit(): void {
    this.loadBoardTemplates();
  }

  loadBoardTemplates() {
    this.boardService.loadBoardTemplates().pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.boardTemplates = response.data;
        this.loadingBoardTemplates = false;
      },
      error: (error) => {
        console.error(error);
        this.loadingBoardTemplates = false;
      }
    })
  }


}
