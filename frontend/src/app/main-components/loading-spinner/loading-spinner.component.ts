import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'spinner',
    templateUrl: './loading-spinner.component.html',
    styleUrls: ['./loading-spinner.component.scss'],
    standalone: false
})
export class LoadingSpinnerComponent implements OnInit {

  @Input() show = false;

  constructor() { }

  ngOnInit() {
  }

}
