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
}
