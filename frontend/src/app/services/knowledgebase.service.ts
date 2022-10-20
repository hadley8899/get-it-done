import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Workspace} from '../interfaces/workspace';
import {Observable} from 'rxjs';
import {KnowledgebaseCategory} from '../interfaces/knowledgebase-category';

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

  deleteCategory(activeWorkspace: Workspace, knowledgebaseCategory: KnowledgebaseCategory) {
    return this.http.delete<any>(`${this.apiUrl}knowledgebase/${activeWorkspace.uuid}/categories/${knowledgebaseCategory.uuid}`);
  }

  loadChildCategories(activeWorkspace: Workspace, knowledgebaseCategory: KnowledgebaseCategory): Observable<{ data: KnowledgebaseCategory[] }> {
    return this.http.get<any>(`${this.apiUrl}knowledgebase/${activeWorkspace.uuid}/categories/${knowledgebaseCategory.uuid}/children`);
  }

  loadKnowledgebases(activeWorkspace: Workspace, activeKnowledgebaseCategory: KnowledgebaseCategory) {
    return this.http.get(`${this.apiUrl}knowledgebase/${activeWorkspace.uuid}/${activeKnowledgebaseCategory.uuid}/knowledgebases`);
  }

  createKnowledgebase(activeWorkspace: Workspace, activeKnowledgebaseCategory: KnowledgebaseCategory, value: FormData) {
    return this.http.post<any>(`${this.apiUrl}knowledgebase/${activeWorkspace.uuid}/${activeKnowledgebaseCategory.uuid}/knowledgebases`, value);
  }
}
