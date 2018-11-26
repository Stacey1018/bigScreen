import { Utils } from './../../../../../../src/app/utils/utils';
import { Component, OnInit } from '@angular/core';
import { ScreenConnect } from '../../../../domain/screenConfig/screenConnect';
import { ScreenConfigService } from '../../../../services/screenDeploy/screenConfig.service';
import { TooltipService } from '../../../../services/tooltip.service';
import { LogHelper } from '../../../../common/LogHelper';
import { DefConfigService } from '../../../../services/defConfig.service';

@Component({
  selector: 'app-screen-connect-home',
  templateUrl: './screen-connect-home.component.html',
  styleUrls: ['./screen-connect-home.component.scss']
})
export class ScreenConnectHomeComponent implements OnInit {

  public saveRenderInfo: ScreenConnect.SaveRender = new ScreenConnect.SaveRender(); // 保存实体信息
  private renderInfo: ScreenConnect.RenderView = new ScreenConnect.RenderView(); // 渲染机信息
  private renderIsNull = false;
  private allIsNull = false;
  private sequenceNum = 1; // 渲染机输出卡编号
  constructor(public tooltipService: TooltipService, private scSer: ScreenConfigService, private defSer: DefConfigService) {
    this.renderInfo.sequenceNum = this.sequenceNum;
    this.saveRenderInfo.itemList = [];
    this.saveRenderInfo.itemList.push(this.renderInfo);
  }

  ngOnInit() {
    this.getRenderInfo();
  }

  /**
   * 保存
   */
  public btnSaveRenderInfo() {
    this.judgeAllIsNull();
    if (this.allIsNull) {
      return;
    }
    const renderSum = this.saveRenderInfo.itemList.length;
    this.scSer.saveRenderInfo(this.saveRenderInfo).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('保存成功');
          this.getRenderInfo();
          // 保存成功之后重写屏幕宽高
          this.defSer.screenWidth = this.saveRenderInfo.resolutionX;
          this.defSer.screenHeight = this.saveRenderInfo.resolutionY;
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('back-setting screen-connect', 'screen-connect-home btnSaveRenderInfo()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 重置
   */
  public btnReset() {
    this.getRenderInfo();
  }

  /**
   * 新增一条渲染机信息
   */
  public addRenderInfo() {
    this.judgeRenderIsNull();
    if (this.renderIsNull) {
      return;
    }
    this.sequenceNum++;
    this.renderInfo = new ScreenConnect.RenderView();
    this.renderInfo.sequenceNum = this.sequenceNum;
    this.saveRenderInfo.itemList.push(this.renderInfo);
  }

  /**
   * 删除一条渲染机信息
   */
  public deleteRenderInfo(i: number): void {
    this.saveRenderInfo.itemList.splice(i, 1);
    this.sequenceNum--;
  }

  /**
   * 编辑时查看信息
   */

  public getRenderInfo() {
    this.scSer.getRender().subscribe({
      next: (val) => {
        if (val.code === 0) {
          if (val.data !== undefined) {
            this.saveRenderInfo.itemList = [];
            this.saveRenderInfo = val.data;
            this.sequenceNum = this.saveRenderInfo.itemList.length;
          } else {
            this.saveRenderInfo.isUpdate = false;
          }
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('back-setting screen-connect', 'screen-connect-home getRenderInfo()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 判断名称是否重复
   * @param name 输出名称
   * @param i 数组下标
   */
  public judgeRenderNameIsRepeated(name: string, i: number) {
    for (const key in this.saveRenderInfo.itemList) {
      if (this.saveRenderInfo.itemList.hasOwnProperty(key)) {
        const element = this.saveRenderInfo.itemList[key];
        if (parseInt(key, 0) !== i) {
          if (element.renderName === name) {
            $('.errorMsgBox.render' + i).html('该名称已存在');
            $('.errorMsgBox.render' + i).show();
            return;
          }
        }
      }
    }
  }

  /**
   * 判断渲染机信息是否为空
   */
  private judgeRenderIsNull() {
    this.renderIsNull = false;
    let errorLength = 0;
    for (const key in this.saveRenderInfo.itemList) {
      if (this.saveRenderInfo.itemList.hasOwnProperty(key)) {
        const ele = this.saveRenderInfo.itemList[key];
        if (Utils.strIsEmptyOrNull(ele.renderIp) || Utils.strIsEmptyOrNull(ele.renderName)
          || Utils.strIsEmptyOrNull(ele.renderPort)) {
          $('.errorMsgBox.render' + key).show();
          errorLength++;
        } else {
          $('.errorMsgBox.render' + key).hide();
        }
      }
    }
    if (errorLength !== 0) {
      this.renderIsNull = true;
    } else {
      this.renderIsNull = false;
    }
  }

  /**
   * 判断输入框内容是否为空
   */
  private judgeAllIsNull() {
    this.allIsNull = false;
    this.judgeRenderIsNull();
  }
}
