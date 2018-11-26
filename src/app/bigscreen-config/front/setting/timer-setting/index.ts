import { Component, OnInit, EventEmitter, Output, Input, AfterViewInit } from '@angular/core';
import { Scene } from '../../../../domain/scene/scene';
import { Utils } from '../../../../utils/utils';

@Component({
  selector: 'app-timer-setting',
  templateUrl: './timer-setting.component.html',
  styleUrls: ['../../../../../assets/css/componentSetting.scss', './timer-setting.component.scss']
})
export class TimerSettingComponent implements OnInit, AfterViewInit {
  @Output() changeTimerData = new EventEmitter<Scene.ResourceView>();
  @Input() timerData: Scene.ResourceView = new Scene.ResourceView();

  constructor() { }

  ngOnInit() {
  }
  ngAfterViewInit() {
    Utils.slimScroll();
  }
  public changeData() {
    this.changeTimerData.emit(this.timerData);
  }

}
