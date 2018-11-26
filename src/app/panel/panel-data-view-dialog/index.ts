import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PanelMethodService } from '../../services/panel/panelMethod.service';
import { PanelSourceService } from '../../services/panel/panelSource.service';
import { Panel } from '../../domain/panel';
import { LogHelper } from '../../common/LogHelper';
import { TooltipService } from '../../services/tooltip.service';

@Component({
  selector: 'app-panel-data-view-dialog',
  templateUrl: './panel-data-view-dialog.component.html',
  styleUrls: ['./panel-data-view-dialog.component.scss']
})
export class PanelDataViewDialogComponent implements OnInit {

  public panelName = ''; // 看板名称
  public panelFloderId = ''; // 当前看板文件夹主键标识
  public panelfloderArray: Panel.Panelfile[]; // 看板文件夹列表
  private panelSave: Panel.PanelItem = new Panel.PanelItem();
  constructor(public tooltipService: TooltipService, public pmSer: PanelMethodService, public psSer: PanelSourceService,
    @Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<PanelDataViewDialogComponent>) { }

  ngOnInit() {
    this.panelName = this.pmSer.panelName;
    this.getPanelFloders();
  }

  // 取消按钮
  public closeDialog() {
    this.dialogRef.close({
      isAdd: false,
      panelName: this.panelName
    });
  }

  // 创建仪表盘(编辑)
  public savePanel() {
    if (this.panelName === '') {
      this.tooltipService.showMsg('仪表盘名称不能为空');
      return;
    }
    this.newPanel();
  }

  public newPanel() {
    if (this.data === null) {
      this.panelSave.dashBoardId = '';
    } else {
      this.panelSave.dashBoardId = this.data.panelId;
    }
    this.panelSave.dashBoardName = this.panelName;
    this.panelSave.parentId = this.panelFloderId;
    this.panelSave.boardType = 1;
    if (this.tooltipService.checkFormat(this.panelName)) {
      this.psSer.savePanel(this.panelSave).subscribe({
        next: (val) => {
          if (val.code === 0) {
            this.dialogRef.close({
              isAdd: true,
              panelName: this.panelName,
              parentId: this.panelFloderId,
              datas: val.data
            });
            // 刷新左侧列表
            this.pmSer.getPanelfiles('', '');
          } else {
            this.tooltipService.showMsg(val.message);
          }
        },
        error: (err) => {
          LogHelper.error('panel panel-data-view', 'panel-data-view-dialog newPanel()error,原因:' + JSON.stringify(err));
        }
      });
    }
  }

  // 获取文件夹列表
  public getPanelFloders() {
    this.psSer.getPanelFloders().subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.panelfloderArray = val.data as Panel.Panelfile[];
          // 将根目录数据推入
          this.panelfloderArray.push({
            dashBoardId: '',
            dashBoardName: '根目录',
            boardType: 1,
            parentId: '',
            showList: false,
            isSelected: true,
            panelList: []
          });
        } else {
          this.panelfloderArray = [];
        }
      },
      error: (err) => {
        LogHelper.error('panel panel-data-view', 'panel-data-view-dialog getPanelFloders()error,原因:' + JSON.stringify(err));
      }
    });
  }
}
