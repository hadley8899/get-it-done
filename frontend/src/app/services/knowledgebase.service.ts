import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Workspace} from '../interfaces/workspace';
import {Observable} from 'rxjs';
import {KnowledgebaseCategory} from '../interfaces/knowledgebase-category';
import {Knowledgebase} from '../interfaces/knowledgebase';
import {KnowledgebaseItem} from '../interfaces/knowledgebase-item';

@Injectable({
  providedIn: 'root'
})
export class KnowledgebaseService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  fetchCategoriesForWorkspace(workspace: Workspace): Observable<{ data: KnowledgebaseCategory[] }> {
    return this.http.get<any>(`${this.apiUrl}knowledgebase/${workspace.uuid}/categories`)
  }

  createKnowledgebaseCategory(workspace: Workspace, value: FormData) {
    return this.http.post<any>(`${this.apiUrl}knowledgebase/${workspace.uuid}/categories`, value);
  }

  updateKnowledgebaseCategory(workspace: Workspace, uuid: string, value: FormData) {
    return this.http.put<any>(`${this.apiUrl}knowledgebase/${workspace.uuid}/categories/${uuid}`, value);
  }

  fetchCategoryDetails(workspace: Workspace, uuid: string): Observable<KnowledgebaseCategory> {
    return this.http.get<any>(`${this.apiUrl}knowledgebase/${workspace.uuid}/categories/${uuid}`);
  }

  deleteCategory(workspace: Workspace, knowledgebaseCategory: KnowledgebaseCategory) {
    return this.http.delete<any>(`${this.apiUrl}knowledgebase/${workspace.uuid}/categories/${knowledgebaseCategory.uuid}`);
  }

  loadChildCategories(workspace: Workspace, knowledgebaseCategory: KnowledgebaseCategory): Observable<{ data: KnowledgebaseCategory[] }> {
    return this.http.get<any>(`${this.apiUrl}knowledgebase/${workspace.uuid}/categories/${knowledgebaseCategory.uuid}/children`);
  }

  loadKnowledgebases(workspace: Workspace, activeKnowledgebaseCategory: KnowledgebaseCategory): Observable<{ data: Knowledgebase[] }> {
    return this.http.get<any>(`${this.apiUrl}knowledgebase/${workspace.uuid}/${activeKnowledgebaseCategory.uuid}/knowledgebases`);
  }

  createKnowledgebase(workspace: Workspace, knowledgebaseCategory: KnowledgebaseCategory, value: FormData) {
    return this.http.post<any>(`${this.apiUrl}knowledgebase/${workspace.uuid}/${knowledgebaseCategory.uuid}/knowledgebases`, value);
  }

  updateKnowledgebase(workspace: Workspace, activeKnowledgebaseCategory: KnowledgebaseCategory, uuid: string, value: FormData) {
    return this.http.put<any>(`${this.apiUrl}knowledgebase/${workspace.uuid}/${activeKnowledgebaseCategory.uuid}/knowledgebases/${uuid}`, value);
  }

  loadKnowledgebaseItems(workspace: Workspace, knowledgebaseCategory: KnowledgebaseCategory, selectedKnowledgebase: Knowledgebase) {
    return this.http.get<any>(`${this.apiUrl}knowledgebase/${workspace.uuid}/${knowledgebaseCategory.uuid}/knowledgebases/${selectedKnowledgebase.uuid}/items`);
  }

  createKnowledgebaseItem(workspace: Workspace, knowledgebaseCategory: KnowledgebaseCategory, knowledgebase: Knowledgebase, value: FormData) {
    console.log(workspace.uuid);
    console.log(knowledgebaseCategory.uuid);
    console.log(knowledgebase.uuid);

    return this.http.post<any>(`${this.apiUrl}knowledgebase/${workspace.uuid}/${knowledgebaseCategory.uuid}/knowledgebases/${knowledgebase.uuid}/items`, value);
  }

  updateKnowledgebaseItem(workspace: Workspace, knowledgebaseCategory: KnowledgebaseCategory, selectedKnowledgebase: Knowledgebase, knowledgebaseItem: KnowledgebaseItem, value: FormData) {
    return this.http.put<any>(`${this.apiUrl}knowledgebase/${workspace.uuid}/${knowledgebaseCategory.uuid}/knowledgebases/${selectedKnowledgebase.uuid}/items/${knowledgebaseItem.uuid}`, value);
  }
}
