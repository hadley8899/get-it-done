import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {BoardTemplate} from "../../../../interfaces/board-template";
import {ToastrService} from "ngx-toastr";
import {BoardService} from "../../../../services/board.service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";

@UntilDestroy()

@Component({
  selector: 'app-board-template-form',
  templateUrl: './board-template-form.component.html',
  styleUrls: ['./board-template-form.component.scss']
})
export class boardTemplateForm implements OnInit {

  @Input() boardTemplate?: BoardTemplate;

  loadingForm = true;
  boardTemplateForm!: FormGroup;

  @Output() boardTemplateUpdated: any = new EventEmitter<any>();
  @Output() boardTemplateCreated: any = new EventEmitter<any>();
  saving = false;

  constructor(private boardService: BoardService, private toastr: ToastrService) {
  }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.loadingForm = true;
    this.boardTemplateForm = new FormGroup({
      name: new FormControl(this.boardTemplate ? this.boardTemplate.name : '', Validators.required),
      description: new FormControl(this.boardTemplate ? this.boardTemplate.description : '', Validators.required),
    });
    this.loadingForm = false;
  }

  formSubmit() {
    this.saving = true;
    const formData = new FormData();

    formData.append('name', this.boardTemplateForm.get('name')?.value);
    formData.append('description', this.boardTemplateForm.get('description')?.value);

    if (this.boardTemplate) {
      this.boardService.updateBoardTemplate(this.boardTemplate, formData).pipe(untilDestroyed(this)).subscribe({
        next: (response) => {
          this.boardTemplateUpdated.emit(response);
          this.saving = false;
        },
        error: (error) => {
          console.error(error);
          this.toastr.error('Failed updating board template');
          this.saving = false;
        }
      });
    } else {
      this.boardService.createBoardTemplate(formData).pipe(untilDestroyed(this)).subscribe({
        next: (response) => {
          this.boardTemplateCreated.emit(response);
          this.saving = false;
        },
        error: (error) => {
          console.error(error);
          this.toastr.error('Failed creating board template');
          this.saving = false;
        }
      });
    }
  }
}
