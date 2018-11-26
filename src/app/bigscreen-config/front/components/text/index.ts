import { Component, OnInit, AfterViewInit, Input, OnDestroy, Output, EventEmitter, OnChanges } from '@angular/core';
import { Scene } from '../../../../domain/scene/scene';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() textData: Scene.ResourceView = new Scene.ResourceView();
  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
  }

  ngOnChanges(): void {
  }

}
