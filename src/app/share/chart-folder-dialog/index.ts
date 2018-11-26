import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Chart } from '../../domain/workSheet/chart';
import { ChartSourceService } from '../../services/panel/chartSource.service';
import { ChartMethodService } from '../../services/panel/chartMethod.service';
import { LogHelper } from '../../common/LogHelper';
import { TooltipService } from '../../services/tooltip.service';

@Component({
  selector: 'app-chart-folder-dialog',
  templateUrl: './chart-folder-dialog.component.html',
  styleUrls: ['../../panel/panel-data-source-dialog/panel-data-source-dialog.component.scss']
})
export class ChartFolderDialogComponent implements OnInit {

  public chartFloderArray: Chart.ChartView[] = []; // 文件夹列表
  public chartFloderId = ''; // 选中的文件夹
  public chartUpdateName = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public csService: ChartSourceService,
    public tooltipService: TooltipService, public dialogRef: MatDialogRef<ChartFolderDialogComponent>,
    public chartService: ChartMethodService) {
    this.chartUpdateName = data.name;
  }

  ngOnInit() {
    this.getChartFolderList();  // 加载图表文件夹列表
  }

  // 取消
  public closeDialog() {
    this.dialogRef.close();
  }

  // 确认移入
  public confirmremove() {
    this.moveChart(this.data.id, this.chartFloderId);
  }

  /**
   * 移动图表到文件夹
   * @param id 图表id
   * @param floderId 文件夹id
   */
  public moveChart(id: string, floderId: string) {
    this.csService.moveChart(id, floderId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('移动图表' + this.data.name + '成功');
          this.closeDialog();
          // 刷新列表
          this.chartService.getChartList('', '');
        } else {
          this.tooltipService.showMsg(val.message);
        }
      }, error: (err) => {
        LogHelper.error('share', 'chart-folder-dialog moveChart()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 图表文件夹列表
   */
  public getChartFolderList() {
    this.csService.getChartList('', '').subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.chartFloderId = this.data.parentId;
          if (val.data.length > 0) {
            const datas = val.data as Chart.ChartView[];
            for (let i = 0; i < datas.length; i++) {
              if (!datas[i].isData) {
                this.chartFloderArray.push(datas[i]);
              }
            }
            this.chartFloderArray.push({
              chartId: '',
              chartName: '根目录',
              isData: false,
              list: [],
              sqlInfo: null,
              parentId: null,
              dbId: null,
              tableId: null,
              chartType: null,
              params: null,
              isSelected: false,
              showList: false
            });
          }
        } else {
          LogHelper.log('share', 'chart-folder-dialog getChartFolderList()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('share', 'chart-folder-dialog getChartFolderList()error,原因:' + JSON.stringify(err));
      }
    });
  }
}
