import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Board} from '../interfaces/board';
import {BoardTemplate} from "../interfaces/board-template";
import {BoardTemplateItem} from "../interfaces/board-template-item";

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  fetchBoards(workspace: string): Observable<{ data: Board[] }> {
    return this.http.get<any>(this.apiUrl + 'boards/' + workspace);
  }

  boardDetails(uuid: string, workspace: string): Observable<Board> {
    return this.http.get<any>(this.apiUrl + 'boards/' + workspace + '/' + uuid);
  }

  createBoard(formData: FormData, workspace: string): Observable<Board> {
    return this.http.post<any>(this.apiUrl + 'boards/' + workspace, formData);
  }

  updateBoard(uuid: string, formData: FormData, workspace: string): Observable<Board> {
    formData.set('_method', 'PUT');
    return this.http.post<any>(this.apiUrl + 'boards/' + workspace + '/' + uuid, formData);
  }

  deleteBoard(uuid: string, workspace: string): Observable<Board> {
    return this.http.delete<any>(this.apiUrl + 'boards/' + workspace + '/' + uuid);
  }

  loadBoardTemplates(): Observable<{ data: BoardTemplate[] }> {
    return this.http.get<any>(this.apiUrl + 'board-templates/');
  }

  boardTemplateDetails(boardTemplateUuId: string): Observable<{ data: BoardTemplate }> {
    return this.http.get<any>(this.apiUrl + 'board-templates/' + boardTemplateUuId);
  }

  loadBoardTemplateItems(boardTemplateUuId: string): Observable<{ data: BoardTemplateItem[] }> {
    return this.http.get<any>(this.apiUrl + 'board-templates/items/' + boardTemplateUuId);
  }

  deleteBoardTemplateItem(boardTemplate: BoardTemplate, boardTemplateItemUuId: string): Observable<{
    data: BoardTemplateItem
  }> {
    return this.http.delete<any>(this.apiUrl + 'board-templates/items/' + boardTemplate.uuid + '/' + boardTemplateItemUuId);
  }

  reorderBoardTemplateItems(boardTemplateUuId: string, items: { boardTemplateItems: string[] }): Observable<{
    data: BoardTemplateItem[]
  }> {
    return this.http.post<any>(this.apiUrl + 'board-templates/items/' + boardTemplateUuId + '/reorder', {items});
  }

  addBoardTemplateItem(boardTemplate: BoardTemplate, formData: FormData) {
    return this.http.post<any>(this.apiUrl + 'board-templates/items/' + boardTemplate.uuid, formData);
  }

  updateBoardTemplate(boardTemplate: BoardTemplate, formData: FormData) {
    formData.append('_method', 'PUT')

    return this.http.post<any>(this.apiUrl + 'board-templates/' + boardTemplate.uuid, formData);
  }

  createBoardTemplate(formData: FormData) {
    return this.http.post(this.apiUrl + 'board-templates/', formData);
  }
}
