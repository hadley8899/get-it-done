import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Board} from '../../../../interfaces/board';
import {BoardService} from '../../../../services/board.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {WorkspaceService} from '../../../../services/workspace.service';
import {Workspace} from '../../../../interfaces/workspace';
import {ToastrService} from 'ngx-toastr';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {LaravelErrorExtractorService} from '../../../../services/laravel-error-extractor.service';
import {BoardTemplate} from "../../../../interfaces/board-template";

@UntilDestroy()
@Component({
  selector: 'app-board-form',
  templateUrl: './board-form.component.html',
  styleUrls: ['./board-form.component.scss']
})
export class BoardFormComponent implements OnInit {

  @Input() board?: Board;
  @Output() boardCreated: EventEmitter<Board> = new EventEmitter<Board>();
  @Output() boardUpdated: EventEmitter<Board> = new EventEmitter<Board>();

  activeWorkspace!: Workspace;

  loading = true;
  saving = false;

  imageSource: any;

  boardForm!: FormGroup;
  boardTemplates: BoardTemplate[] = [];

  constructor(
    private boardService: BoardService,
    private workspaceService: WorkspaceService,
    private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.workspaceService.activeWorkspace?.subscribe(
      (workspace: Workspace) => {
        this.activeWorkspace = workspace;
        if (this.activeWorkspace) {
          this.initForm();
        }
      });
  }

  initForm() {
    this.loading = true;
    this.loadBoardTemplates();
  }

  loadBoardTemplates() {
    this.boardService.loadBoardTemplates().pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.boardTemplates = response.data;
        this.initBoardForm();
        this.loading = false;
      }
    });
  }

  initBoardForm() {
    this.boardForm = new FormGroup<any>({
      name: new FormControl(this.board?.name, [Validators.required]),
      description: new FormControl(this.board?.description),
      boardTemplate: new FormControl(this.board?.boardTemplate ? this.board.boardTemplate : ''),
    });
  }

  handleSubmit() {
    if (this.board?.uuid) {
      this.updateBoard();
    } else {
      this.addBoard();
    }
  }

  updateBoard() {
    this.saving = true;

    const formData = new FormData();
    formData.append('name', this.boardForm.value.name);
    formData.append('description', this.boardForm.value.description);
    if (this.imageSource) {
      formData.append('image', this.imageSource);
    }
    if (this.board?.uuid) {
      this.boardService.updateBoard(this.board.uuid, formData, this.activeWorkspace.uuid).pipe(untilDestroyed(this)).subscribe({
        next: (board: Board) => {
          this.saving = false;
          this.boardUpdated.emit(board);
        },
        error: (error) => {
          console.error(error);
          const errors = LaravelErrorExtractorService.extractErrorMessagesFromErrorResponse(error);

          if (errors.length > 0) {
            for (const error of errors) {
              this.toastr.error(error);
            }
          } else {
            this.toastr.error('Something went wrong');
          }

          this.saving = false;
        }
      })
    } else {
      this.toastr.error('Board not found');
    }
  }

  addBoard() {
    this.saving = true;

    const formData = new FormData();
    formData.append('name', this.boardForm.value.name);
    formData.append('description', this.boardForm.value.description);
    if (this.imageSource) {
      formData.append('image', this.imageSource);
    }
    formData.append('board_template_uuid', this.boardForm.value.boardTemplate);

    this.boardService.createBoard(formData, this.activeWorkspace.uuid).pipe(untilDestroyed(this)).subscribe({
      next: (board: Board) => {
        this.saving = false;
        this.boardCreated.emit(board);
      },
      error: (error) => {
        console.error(error);
        const errors = LaravelErrorExtractorService.extractErrorMessagesFromErrorResponse(error);

        if (errors.length > 0) {
          for (const error of errors) {
            this.toastr.error(error);
          }
        } else {
          this.toastr.error('Something went wrong');
        }

        this.saving = false;
      }
    });
  }

  onFileChange($event: any) {
    if ($event.target.files.length > 0) {
      this.imageSource = $event?.target?.files[0];
    }
  }
}
