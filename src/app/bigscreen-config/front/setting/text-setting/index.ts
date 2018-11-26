import { Component, OnInit, AfterViewInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Scene } from '../../../../domain/scene/scene';
import { Utils } from '../../../../utils/utils';

@Component({
  selector: 'app-text-setting',
  templateUrl: './text-setting.component.html',
  styleUrls: ['../../../../../assets/css/componentSetting.scss', './text-setting.component.scss']
})
export class TextSettingComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() textData: Scene.ResourceView = new Scene.ResourceView();
  @Output() changeTextData = new EventEmitter<Scene.ResourceView>();
  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    Utils.slimScroll();
  }

  ngOnDestroy() {
  }

  public changeData() {
    this.changeTextData.emit(this.textData);
  }

}
