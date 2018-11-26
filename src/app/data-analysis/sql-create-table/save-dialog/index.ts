import { Component, OnInit } from '@angular/core';
import { WorkSheetService } from '../../../services/dataAnalysis/workSheet.service';
import { MatDialogRef } from '@angular/material';
import { Chart } from '../../../domain/workSheet/chart';
import { LogHelper } from '../../../common/LogHelper';
import { TooltipService } from '../../../services/tooltip.service';

@Component({
  selector: 'app-save-dialog',
  templateUrl: './save-dialog.component.html',
  styleUrls: ['./save-dialog.component.scss']
})
export class SaveDialogComponent implements OnInit {

  public chartFolders: Chart.ChartView[] = new Array<Chart.ChartView>(); // 文件夹数组
  public chartFolderId = ''; // 文件夹主键
  public chartName = ''; // 图表名称
  constructor(private wsSer: WorkSheetService, public dialogRef: MatDialogRef<SaveDialogComponent>,
    public tooltipService: TooltipService, ) { }

  ngOnInit() {
    this.getChartDataFiles();
  }

  public getChartDataFiles() {
    this.wsSer.getChartDataFiles().subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.chartFolders = val.data;
          this.chartFolders.push({
            chartId: '', // 图表或文件夹id
            chartName: '根目录', // 图表名称
            isData: false, // 标识是图表还是文件夹
            list: [], // 文件夹下的数据
            sqlInfo: null, // sql语句
            parentId: null, // 文件夹Id
            dbId: null, // 数据库ID
            tableId: null, // 工作表ID
            chartType: null, // 图表类型
            params: null, // 字段信息
            isSelected: true,
            showList: false
          });
        } else {
          LogHelper.log('data-analysis sql-create-table', 'save-dialog getChartDataFiles(),info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis sql-create-table', 'save-dialog getChartDataFiles(),error,原因：' + JSON.stringify(err));
      }
    });
  }

  /**
   * 关闭弹框
   */
  public btnCancel() {
    this.dialogRef.close();
  }

  /**
   * 点击确定
   */
  public btnConfirm() {
    this.dialogRef.close({ chartFolderId: this.chartFolderId, chartName: this.chartName });
  }
}
