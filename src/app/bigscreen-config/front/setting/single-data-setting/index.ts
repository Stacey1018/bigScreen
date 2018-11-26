import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Scene } from '../../../../domain/scene/scene';

@Component({
  selector: 'app-single-data-setting',
  templateUrl: './single-data-setting.component.html',
  styleUrls: ['../../../../../assets/css/componentSetting.scss', './single-data-setting.component.scss']
})
export class SingleDataSettingComponent implements OnInit {
  @Input() singleTextData: Scene.ResourceView = new Scene.ResourceView();
  @Output() changeSingleTextData = new EventEmitter<Scene.ResourceView>();

  constructor() { }

  ngOnInit() {
  }
  public changeData() {
    this.changeSingleTextData.emit(this.singleTextData);
  }
}
