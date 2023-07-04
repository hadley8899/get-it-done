import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-board-control-buttons',
  templateUrl: './board-control-buttons.component.html',
  styleUrls: ['./board-control-buttons.component.scss']
})
export class BoardControlButtonsComponent {
  @Output() onBoardSettingsClick: EventEmitter<void> = new EventEmitter();
  @Output() onAddNewListClick: EventEmitter<void> = new EventEmitter();
  @Output() onDeleteBoardClick: EventEmitter<void> = new EventEmitter();

  boardSettingsClick() {
    this.onBoardSettingsClick.emit();
  }

  addNewListClick() {
    this.onAddNewListClick.emit();
  }

  deleteBoardClick() {
    this.onDeleteBoardClick.emit();
  }
}
