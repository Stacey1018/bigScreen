import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Scene } from '../../../../domain/scene/scene';

@Component({
  selector: 'app-scroll-top-setting',
  templateUrl: './scroll-top-setting.component.html',
  styleUrls: ['../../../../../assets/css/componentSetting.scss', './scroll-top-setting.component.scss']
})
export class ScrollTopSettingComponent implements OnInit {
  @Output() changeScrollTopData = new EventEmitter<Scene.ResourceView>();
  @Input() scrollTopData: Scene.ResourceView = new Scene.ResourceView();
  constructor() { }

  ngOnInit() {
  }

  public changeData() {
    this.changeScrollTopData.emit(this.scrollTopData);
  }

}
