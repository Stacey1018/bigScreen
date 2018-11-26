import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Panel } from '../../domain/panel';
import { Inject } from '@angular/core';
import { PanelSourceService } from '../../services/panel/panelSource.service';
import { PanelMethodService } from '../../services/panel/panelMethod.service';
import { LogHelper } from '../../common/LogHelper';
import { TooltipService } from '../../services/tooltip.service';

@Component({
  selector: 'app-panel-data-source-dialog',
  templateUrl: './panel-data-source-dialog.component.html',
  styleUrls: ['./panel-data-source-dialog.component.scss']
})
export class PanelDataSourceDialogComponent implements OnInit {

  public panelFloderId = ''; // 选择一个目标文件夹，默认为根目录
  public sourcePanelId: string; // 要移动的看板主键标识
  public panelfloderArray: Panel.Panelfile[]; // 看板文件夹列表
  public panelMoveArray: Panel.PanelItem = new Panel.PanelItem(); // 要移入文件夹的文件
  public panelUpdateName = '';
  constructor(public psSer: PanelSourceService, public tooltipService: TooltipService, public pmSer: PanelMethodService,
    @Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<PanelDataSourceDialogComponent>) {
    this.panelUpdateName = data.name;
  }

  ngOnInit() {
    this.getPanelFloders();
    this.sourcePanelId = this.data.id;

  }

  // 关闭弹框
  public closeDialog() {
    this.dialogRef.close();
  }

  // 获取文件夹列表
  public getPanelFloders() {
    this.psSer.getPanelFloders().subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.panelFloderId = this.data.parentId;
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
        LogHelper.error('panel panel-data-source', 'panel-data-source-dialog getPanelFloders()error,原因:' + JSON.stringify(err));
      }
    });
  }

  // 确认移入
  public confirmremove() {
    this.panelMoveArray.dashBoardId = this.sourcePanelId;
    this.panelMoveArray.parentId = this.panelFloderId;
    this.movePanel(this.sourcePanelId, this.panelFloderId);
  }

  public movePanel(id: string, parentId: string) {
    this.psSer.movePanel(id, parentId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('移动仪表盘' + this.data.name + '成功');
          this.closeDialog();
          // 刷新左侧列表
          this.pmSer.getPanelfiles('', '', parentId, id);
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('panel panel-data-source', 'panel-data-source-dialog movePanel()error,原因:' + JSON.stringify(err));
      }
    });
  }
}
