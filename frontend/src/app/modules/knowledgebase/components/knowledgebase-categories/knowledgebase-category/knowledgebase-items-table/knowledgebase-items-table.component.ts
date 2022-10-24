import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {KnowledgebaseItem} from '../../../../../../interfaces/knowledgebase-item';
import {DateService} from '../../../../../../services/date.service';

@Component({
  selector: 'app-knowledgebase-items-table',
  templateUrl: './knowledgebase-items-table.component.html',
  styleUrls: ['./knowledgebase-items-table.component.scss']
})
export class KnowledgebaseItemsTableComponent implements OnInit {

  @Input() loadingKnowledgebaseItems = false;
  @Input() knowledgebaseItems: KnowledgebaseItem[] = [];

  @Output() knowledgebaseItemClick: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit(): void {
  }

  selectKnowledgebaseItem(knowledgebaseItem: KnowledgebaseItem) {
    this.knowledgebaseItemClick.emit(knowledgebaseItem);
  }

  formatDate(date: string) {
    return DateService.formatDate(date);
  }
}
