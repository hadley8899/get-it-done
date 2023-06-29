import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {BoardService} from "../../../../services/board.service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {ToastrService} from "ngx-toastr";
import {BoardTemplate} from "../../../../interfaces/board-template";

@UntilDestroy()
@Component({
  selector: 'app-board-templates-item-form',
  templateUrl: './board-templates-item-form.component.html',
  styleUrls: ['./board-templates-item-form.component.scss']
})
export class BoardTemplatesItemFormComponent implements OnInit {
  loadingForm = true;
  boardTemplateItemForm!: FormGroup;
  saving = false;

  @Input() boardTemplate!: BoardTemplate;
  @Output() boardTemplateItemAdded: EventEmitter<any> = new EventEmitter<any>();

  constructor(private boardService: BoardService, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.loadingForm = true;
    this.boardTemplateItemForm = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
    });
    this.loadingForm = false;
  }

  formSubmit() {
    this.saving = true;

    // Collect data from the form
    const formData = new FormData();
    formData.append('name', this.boardTemplateItemForm.get('name')?.value);
    formData.append('description', this.boardTemplateItemForm.get('description')?.value);

    this.boardService.addBoardTemplateItem(this.boardTemplate, formData).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.saving = false;
        this.boardTemplateItemForm.reset();
        this.boardTemplateItemAdded.emit(response);
      },
      error: (error) => {
        this.saving = false;
        console.error(error);
        this.toastr.error('Failed saving board template item');
      }
    });
  }
}
