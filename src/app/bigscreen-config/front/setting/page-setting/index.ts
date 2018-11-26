import { Component, OnInit, EventEmitter, Output, Input, AfterViewInit } from '@angular/core';
import { Scene } from '../../../../domain/scene/scene';
import { LogHelper } from '../../../../common/LogHelper';
import { DataTypeEnum } from '../../../../common/dataTypeEnum';
import { SceneSourceService } from '../../../../services/scene/sceneSource.service';
import { AppSettingService } from '../../../../services/appsetting.service';
import { Utils } from '../../../../utils/utils';

@Component({
  selector: 'app-page-setting',
  templateUrl: './page-setting.component.html',
  styleUrls: ['./page-setting.component.scss', '../../../../../assets/css/componentSetting.scss']
})
export class PageSettingComponent implements OnInit, AfterViewInit {
  @Input() bgData: Scene.Background = new Scene.Background();
  @Output() changeBgData = new EventEmitter<Scene.Background>();
  public bgItems: Scene.ResourceView[] = new Array<Scene.ResourceView>(); // 背景数据数组
  constructor(private ssSer: SceneSourceService, public appSer: AppSettingService) {
    this.getMaterials();
  }

  ngOnInit() {
  }
  ngAfterViewInit() {
    Utils.slimScroll();
  }

  public changeData() {
    this.changeBgData.emit(this.bgData);
  }

  public selectBg(item: Scene.ResourceView) {
    if (item.resourceInfo === this.bgData.bgUrl) {
      this.bgData.bgUrl = '';
    } else {
      this.bgData.bgUrl = item.resourceInfo;
    }
    this.changeBgData.emit(this.bgData);
  }

  /**
   * 获取背景边框列表
   */
  private getMaterials() {
    this.ssSer.getMaterialForScene().subscribe({
      next: (val) => {
        if (val.code === 0) {
          const themes = val.data as Scene.ResourceView[];
          this.bgItems = themes.filter(t => t.detailCode === DataTypeEnum.Background);
        } else {
          LogHelper.log('bigscreen-config front', 'front-data-material getMaterials()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('bigscreen-config front', 'front-data-material getMaterials()info,原因:' + JSON.stringify(err));
      }
    });
  }

}
