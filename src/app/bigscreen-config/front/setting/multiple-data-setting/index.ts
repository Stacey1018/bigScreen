import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Scene } from '../../../../domain/scene/scene';

@Component({
  selector: 'app-multiple-data-setting',
  templateUrl: './multiple-data-setting.component.html',
  styleUrls: ['../../../../../assets/css/componentSetting.scss', './multiple-data-setting.component.scss']
})
export class MultipleDataSettingComponent implements OnInit {
  @Input() multipleTextData: Scene.ResourceView = new Scene.ResourceView();
  @Output() changeMultipleTextData = new EventEmitter<Scene.ResourceView>();

  constructor() { }

  ngOnInit() {
  }
  public changeData() {
    this.changeMultipleTextData.emit(this.multipleTextData);
  }

}
