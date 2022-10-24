import {Component, Input, OnInit} from '@angular/core';
import {KnowledgebaseCategory} from '../../../../../../interfaces/knowledgebase-category';

@Component({
  selector: 'app-knowledgebase-category-child-list',
  templateUrl: './knowledgebase-category-child-list.component.html',
  styleUrls: ['./knowledgebase-category-child-list.component.scss']
})
export class KnowledgebaseCategoryChildListComponent implements OnInit {

  @Input() backLink: string[] = [];
  @Input() childCategories: KnowledgebaseCategory[] = [];

  constructor() {
  }

  ngOnInit(): void {
  }

}
