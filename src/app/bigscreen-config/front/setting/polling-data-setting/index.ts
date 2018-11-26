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
  public isShowDataList = false; // ���ݺ����õ��л���־
  public currColDataIndex = 0; // ��ǰչʾ���е�����ֵ
  public pollingDataString = ''; // ���ݵ�string��ʽ
  constructor(public tooltipService: TooltipService) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.pollingDataString = JSON.stringify(this.pollingData.configInfo.pollingData);
    Utils.slimScroll();
  }

  /**
   * ��������仯
   */
  public changeData() {
    this.changePollingData.emit(this.pollingData);
  }

  /**
   * �ύ����
   */
  public submit() {
    this.pollingData.configInfo.pollingData = JSON.parse(this.pollingDataString);
    this.changeData();
  }

  /**
   * ���һ��
   */
  public addLabel() {
    const colsDataItem: Scene.ColsData = {
      colsName: '��ǩ',
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
   * ɾ��һ��
   */
  public deleteLabel() {
    if (this.pollingData.configInfo.colsData.length === 1) {
      this.tooltipService.showMsg('��������ɾ����');
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
