import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {BoardService} from "../../../../services/board.service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {BoardTemplate} from "../../../../interfaces/board-template";
import {BoardTemplateItem} from "../../../../interfaces/board-template-item";
import {SortableOptions} from "sortablejs";
import {ToastrService} from "ngx-toastr";
import {Breadcrumb} from "../../../../interfaces/breadcrumb";

@UntilDestroy()
@Component({
  selector: 'app-board-templates-edit',
  templateUrl: './board-templates-edit.component.html',
  styleUrls: ['./board-templates-edit.component.scss']
})
export class BoardTemplatesEditComponent implements OnInit {

  breadCrumbs: Breadcrumb[] = [
    {linkText: 'Home', routeItems: ['/']},
    {linkText: 'Boards', routeItems: ['/boards']},
    {linkText: 'Board Templates', routeItems: ['/boards/board-templates']},
    {linkText: 'Edit Board Template', routeItems: []}
  ];

  loadingTemplateDetails = true;
  loadingTemplateItems = true;
  boardTemplateUuId: string = '';
  boardTemplate!: BoardTemplate;
  boardTemplateItems: BoardTemplateItem[] = [];

  @ViewChild('closeTemplateItemNewModal') closeTemplateItemNewModal!: ElementRef;
  @ViewChild('closeBoardTemplateEditModal') closeBoardTemplateEditModal!: ElementRef;

  boardTemplateItemReorderOptions: SortableOptions = {
    group: 'board-lists',
    easing: "cubic-bezier(1, 0, 0, 1)",
    dataIdAttr: 'data-uuid',
    onEnd: () => {
      this.reorderBoardTemplateItems();
    }
  }

  constructor(private route: ActivatedRoute, private boardService: BoardService, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.boardTemplateUuId = params['uuid'];
      this.loadBoardTemplate();
    });
  }

  loadBoardTemplate() {
    this.loadingTemplateDetails = true;
    this.boardService.boardTemplateDetails(this.boardTemplateUuId).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.boardTemplate = response.data;
        this.loadBoardTemplateItems();
        this.loadingTemplateDetails = false;
      },
      error: (error) => {
        console.error(error);
        this.toastr.error('Failed to load board template details');
        this.loadingTemplateDetails = false;
      }
    });
  }

  loadBoardTemplateItems() {
    this.loadingTemplateItems = true;
    this.boardService.loadBoardTemplateItems(this.boardTemplateUuId).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.boardTemplateItems = response.data;
        this.loadingTemplateItems = false;
      },
      error: (error) => {
        console.error(error);
        this.toastr.error('Failed to load board template items');
        this.loadingTemplateItems = false;
      }
    });
  }

  deleteBoardListItem(boardTemplateItem: BoardTemplateItem) {
    this.boardService.deleteBoardTemplateItem(this.boardTemplate, boardTemplateItem.uuid).pipe(untilDestroyed(this)).subscribe({
      next: () => {
        this.toastr.success('Board list deleted successfully');
        this.loadBoardTemplateItems();
      }, error: (error) => {
        console.error(error);
        this.toastr.error('Failed to delete board list');
      }
    });
  }

  reorderBoardTemplateItems() {
    // Create a nice simple array of the uuids of the lists
    const boardTemplateItemsUuIds = this.boardTemplateItems.map(list => list.uuid);

    const postData = {
      boardTemplateItems: boardTemplateItemsUuIds
    }

    this.boardService.reorderBoardTemplateItems(this.boardTemplateUuId, postData).pipe(untilDestroyed(this)).subscribe({
      next: () => {
        this.toastr.success('Lists reordered successfully');
        this.loadBoardTemplateItems();
      },
      error: (error) => {
        console.error(error);
        this.toastr.error('Failed to reorder lists');
      }
    });
  }

  handleItemAdded() {
    this.toastr.success('Added');
    this.loadBoardTemplateItems();
    this.closeTemplateItemNewModal.nativeElement.click();
  }

  handleBoardTemplateUpdated() {
    this.toastr.success('Board template updated successfully');
    this.loadBoardTemplate();
    this.closeBoardTemplateEditModal.nativeElement.click();
  }
}
