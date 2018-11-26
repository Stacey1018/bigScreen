import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Scene } from '../../../../domain/scene/scene';
import { Utils } from '../../../../utils/utils';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit, OnDestroy {
  @Input() timerData: Scene.ResourceView = new Scene.ResourceView();
  private timer;
  public time = '';
  constructor() {
  }

  ngOnInit() {
    this.setDatetime();
  }

  setDatetime() {
    let nowDate = new Date();
    this.time = Utils.switchDatetime(nowDate, this.timerData.configInfo.timerType);
    this.timer = setInterval(() => {
      nowDate = new Date();
      this.time = Utils.switchDatetime(nowDate, this.timerData.configInfo.timerType);
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

}
