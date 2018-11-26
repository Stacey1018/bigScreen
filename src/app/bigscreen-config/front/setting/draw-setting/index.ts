import { Component, OnInit, AfterViewInit, Output, EventEmitter, Input } from '@angular/core';
import { Scene } from '../../../../domain/scene/scene';

@Component({
  selector: 'app-draw-setting',
  templateUrl: './draw-setting.component.html',
  styleUrls: ['../../../../../assets/css/componentSetting.scss', './draw-setting.component.scss']
})
export class DrawSettingComponent implements OnInit, AfterViewInit {
  @Output() changeDrawData = new EventEmitter<Scene.ResourceView>();
  @Input() drawData: Scene.ResourceView = new Scene.ResourceView();

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
  }

  public changeData() {
    this.changeDrawData.emit(this.drawData);
  }

}
