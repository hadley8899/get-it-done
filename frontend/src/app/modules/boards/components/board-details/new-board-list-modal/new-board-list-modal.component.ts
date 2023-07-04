import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-new-board-list-modal',
  templateUrl: './new-board-list-modal.component.html',
  styleUrls: ['./new-board-list-modal.component.scss']
})
export class NewBoardListModalComponent {
  @Input() loadingNewListForm!: boolean;
  @Input() newListForm!: FormGroup;
  @Input() savingNewList!: boolean;
  @Output() newListSubmit: EventEmitter<void> = new EventEmitter();

  onSubmit() {
    this.newListSubmit.emit();
  }
}
