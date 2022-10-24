import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Knowledgebase} from '../../../../../../interfaces/knowledgebase';

@Component({
  selector: 'app-knowledgebase-list',
  templateUrl: './knowledgebase-list.component.html',
  styleUrls: ['./knowledgebase-list.component.scss']
})
export class KnowledgebaseListComponent implements OnInit {

  @Input() knowledgebases: Knowledgebase[] = [];
  @Input() activeKnowledgebase!: Knowledgebase;

  @Output() knowledgebaseClick: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  selectKnowledgebase(knowledgebase: Knowledgebase) {
    this.knowledgebaseClick.emit(knowledgebase);
  }

}
