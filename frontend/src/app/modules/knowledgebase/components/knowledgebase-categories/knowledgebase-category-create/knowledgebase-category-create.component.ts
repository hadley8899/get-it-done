import {Component, OnInit} from '@angular/core';
import {KnowledgebaseService} from '../../../../../services/knowledgebase.service';
import {ToastrService} from 'ngx-toastr';
import {Breadcrumb} from '../../../../../interfaces/breadcrumb';
import {Router} from '@angular/router';

@Component({
  selector: 'app-knowledgebase-category-create',
  templateUrl: './knowledgebase-category-create.component.html',
  styleUrls: ['./knowledgebase-category-create.component.scss']
})
export class KnowledgebaseCategoryCreateComponent implements OnInit {
  breadCrumbs: Breadcrumb[] = [
    {linkText: 'Home', routeItems: ['/']},
    {linkText: 'Knowledgebase Categories', routeItems: ['/knowledgebase/']},
    {linkText: 'Create Knowledgebase Category', routeItems: []},
  ];

  constructor(
    private knowledgebaseService: KnowledgebaseService,
    private toastr: ToastrService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
  }

  created() {
    this.router.navigate(['/knowledgebase/']).then();
  }
}
