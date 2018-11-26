import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit } from '@angular/core';
import { Scene } from '../../../../domain/scene/scene';
import { Utils } from '../../../../utils/utils';
import { TooltipService } from '../../../../services/tooltip.service';

@Component({
  selector: 'app-polling-data-setting',
  templateUrl: './polling-data-setting.component.html',
  styleUrls: ['../../../../../assets/css/componentSetting.scss', './polling-data-setting.component.scss']
})
export class PollingDataSettingComponent implements OnInit, AfterViewInit {
  @Output() changePollingData = new EventEmitter<Scene.ResourceView>();
  @Input() pollingData: Scene.ResourceView = new Scene.ResourceView();
  public isShowDataList = false; // 数据和配置的切换标志
  public currColDataIndex = 0; // 当前展示的列的索引值
  public pollingDataString = ''; // 数据的string格式
  constructor(public tooltipService: TooltipService) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.pollingDataString = JSON.stringify(this.pollingData.configInfo.pollingData);
    Utils.slimScroll();
  }

  /**
   * 配置项发生变化
   */
  public changeData() {
    this.changePollingData.emit(this.pollingData);
  }

  /**
   * 提交数据
   */
  public submit() {
    this.pollingData.configInfo.pollingData = JSON.parse(this.pollingDataString);
    this.changeData();
  }

  /**
   * 添加一列
   */
  public addLabel() {
    const colsDataItem: Scene.ColsData = {
      colsName: '标签',
      colsFieldName: 'name999',
      widthRatio: 3,
      fontSize: 18,
      fontColor: '#fff',
      fontBold: 'normal',
      align: 'center'
    };
    this.pollingData.configInfo.colsData.push(colsDataItem);
    this.changeData();
  }

  /**
   * 删除一列
   */
  public deleteLabel() {
    if (this.pollingData.configInfo.colsData.length === 1) {
      this.tooltipService.showMsg('不可以再删除了');
      return;
    }
    this.pollingData.configInfo.colsData.splice(this.currColDataIndex, 1);
    if (this.currColDataIndex !== 0) {
      this.currColDataIndex = this.currColDataIndex - 1;
    } else {
      this.currColDataIndex = 0;
    }
    this.changeData();
  }
}
