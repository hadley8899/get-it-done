import {Component, Input, Output, EventEmitter} from '@angular/core';
import {BoardList} from '../../../../../interfaces/board-list';
import {Board} from '../../../../../interfaces/board';
import {SortableOptions} from 'sortablejs';
import {untilDestroyed} from '@ngneat/until-destroy';
import {BoardListService} from '../../../../../services/board-list.service';
import {Workspace} from '../../../../../interfaces/workspace';

@Component({
  selector: 'app-board-settings-modal',
  templateUrl: './board-settings-modal.component.html',
  styleUrls: ['./board-settings-modal.component.scss']
})
export class BoardSettingsModalComponent {
  @Input() activeBoard!: Board;
  @Input() loadingBoardSettingsForm!: boolean;
  @Input() boardLists!: BoardList[];
  @Input() loadingBoardListsAndTasks!: boolean;
  @Input() activeWorkspace!: Workspace;
  @Output() boardUpdated: EventEmitter<any> = new EventEmitter();
  @Output() deleteBoardList: EventEmitter<BoardList> = new EventEmitter();

  boardListsReorderOptions: SortableOptions = {
    group: 'board-lists',
    easing: "cubic-bezier(1, 0, 0, 1)",
    dataIdAttr: 'data-uuid',
    onEnd: () => {
      this.reorderBoardLists();
    }
  }

  constructor(private boardListService: BoardListService) {
  }

  reorderBoardLists() {
    // Create a nice simple array of the uuids of the lists
    const listUuids = this.boardLists.map(list => list.uuid);

    const postData = {
      boardLists: listUuids
    }

    return this.boardListService.reorderBoardLists(this.activeWorkspace.uuid, this.activeBoard.uuid, postData).pipe(untilDestroyed(this)).subscribe({
      next: () => {
        this.boardUpdated.emit();
      }
    });
  }

  onBoardUpdated(event: any) {
    this.boardUpdated.emit(event);
  }

  onDeleteBoardList(boardList: any) {
    this.deleteBoardList.emit(boardList);
  }
}
