import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Scene } from '../../../../domain/scene/scene';

@Component({
  selector: 'app-real-video-setting',
  templateUrl: './real-video-setting.component.html',
  styleUrls: ['../../../../../assets/css/componentSetting.scss', './real-video-setting.component.scss']
})
export class RealVideoSettingComponent implements OnInit {
  @Output() changeVideoData = new EventEmitter<Scene.ResourceView>();
  @Input() videoData: Scene.ResourceView = new Scene.ResourceView();
  constructor() { }

  ngOnInit() {
  }

  public playVideo(): void {
    this.changeVideoData.emit(this.videoData);
  }

}
