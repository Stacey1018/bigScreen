import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-add-data-sourse-nav',
  templateUrl: './add-data-sourse-nav.component.html',
  styleUrls: ['./add-data-sourse-nav.component.scss']
})
export class AddDataSourseNavComponent implements OnInit {
  @Input() step = '';
  @Input() isDivDisplay;
  @Output() testLink = new EventEmitter();

  constructor() { }

  ngOnInit() {

  }

  public returnToTestLink() {
    if (this.step === 'link' && this.isDivDisplay) {
      this.testLink.emit();
    }
  }
}
