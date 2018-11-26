import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DataOption } from '../../../domain/dataDeploy/dataOption';
import { WorkSheetService } from '../../../services/dataAnalysis/workSheet.service';
import { EventPubSub } from '../../../common/eventPubSub';
import { MessageCodeEnum } from '../../../common/messageCodeEnum';
import { Chart } from '../../../domain/workSheet/chart';
import { LogHelper } from '../../../common/LogHelper';
import { Utils } from '../../../utils/utils';
import { TooltipService } from '../../../services/tooltip.service';

@Component({
  selector: 'app-data-visualize-dialog',
  templateUrl: './data-visualize-dialog.component.html',
  styleUrls: ['./data-visualize-dialog.component.scss']
})
export class DataVisualizeDialogComponent implements OnInit, AfterViewInit {

  public dataOptionParam: DataOption.SqlData = new DataOption.SqlData(); // 生成option参数实体
  public filterParam: DataOption.FilterParam[] = new Array<DataOption.FilterParam>(); // 条件参数数据
  public chartTypes: Chart.ChartType[] = new Array<Chart.ChartType>(); // 图形类型数组
  private fieldNames;
  private currDataSourceType: number; // 标识选择的数据源来源(0:数据库 1:教育 2:excel)
  constructor( @Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<DataVisualizeDialogComponent>,
    private wsSer: WorkSheetService, private tooltipService: TooltipService) {

  }

  ngOnInit() {
    this.getChartTypes();
  }

  ngAfterViewInit() {
    Utils.slimScroll();
  }

  private initData(): void {
    this.dataOptionParam.dbId = this.data.dbId;
    this.dataOptionParam.sqlInfo = this.data.sqlStr;
    this.dataOptionParam.tableId = this.data.tableId;
    this.dataOptionParam.tableName = this.data.tableName; // 模板名称(动态表单数据展示时使用)
    this.currDataSourceType = this.data.currDataSourceType;
    if (this.data.params !== null && this.data.params.length > 0) {
      this.dataOptionParam.params = this.data.params; // 编辑
      this.filterParam = this.dataOptionParam.params;
    } else { // 新增
      this.fieldNames = this.data.fieldNames;
      for (const key in this.data.fieldNames) {
        if (this.data.fieldNames.hasOwnProperty(key)) {
          const param: DataOption.FilterParam = new DataOption.FilterParam();
          param.fieldName = this.data.fieldNames[key];
          param.isDimension = false;
          param.isMeasure = false;
          param.isLegend = false;
          param.chartType = this.dataOptionParam.chartType;
          this.filterParam.push(param);
        }
      }
    }
  }

  /**
   * 获取图形类型
   */
  public getChartTypes() {
    this.wsSer.getChartTypes().subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.chartTypes = val.data;
          if (this.data.chartType !== '') {
            this.dataOptionParam.chartType = this.data.chartType; // 图表类型赋初值
          } else {
            this.dataOptionParam.chartType = this.chartTypes[0].code; // 图表类型赋初值
          }
          this.initData();
        } else {
          LogHelper.log('data-analysis sql-create-table', 'data-visualize-dialog getChartTypes()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis sql-create-table', 'data-visualize-dialog getChartTypes()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 切换类型
   */
  public changeChartType() {
    for (const key in this.filterParam) {
      if (this.filterParam.hasOwnProperty(key)) {
        this.filterParam[key].isDimension = false;
        this.filterParam[key].isMeasure = false;
        this.filterParam[key].isLegend = false;
        this.filterParam[key].chartType = this.dataOptionParam.chartType;
      }
    }
  }

  /**
   * 关闭弹框
   */
  public btnCancel() {
    this.dialogRef.close();
  }

  /**
   * 点击确定获取option数据
   */
  public btnOK() {
    const dimensionCount = this.filterParam.filter(d => d.isDimension === true).length;
    const measureCount = this.filterParam.filter(d => d.isMeasure === true).length;
    if (this.dataOptionParam.chartType == 18) { // 仪表盘只需要选择度量就可以
      if (measureCount === 0) {
        this.tooltipService.showMsg('请先勾选度量');
        return;
      }
    } else {
      if (dimensionCount === 0 || measureCount === 0) {
        this.tooltipService.showMsg('请先勾选维度和度量');
        return;
      }
    }
    for (const key in this.filterParam) {
      if (this.filterParam.hasOwnProperty(key)) {
        const element = this.filterParam[key];
        if (element.isDimension && element.isMeasure) {
          this.tooltipService.showMsg('同一字段不能既是维度又是度量');
          return;
        }
      }
    }
    const legendNum = this.filterParam.filter(t => t.isLegend === true).length;
    if (legendNum > 1) {
      this.tooltipService.showMsg('只能选择一个字段作为图例');
      return;
    }
    if (this.data.params.length === 0) {
      this.dataOptionParam.params = this.filterParam; // 新增
    }
    this.dataOptionParam.category = this.currDataSourceType;
    this.wsSer.getChartDataBySql(this.dataOptionParam).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.dataOptionParam.option = val.data;
          EventPubSub.instance.publish(MessageCodeEnum.dataOption, val.data);
        } else {
          EventPubSub.instance.publish(MessageCodeEnum.dataOption, '');
        }
        this.dialogRef.close({ dataOptionParam: this.dataOptionParam });
      },
      error: (err) => {
        LogHelper.error('data-analysis sql-create-table', 'data-visualize-dialog btnOK()error,原因:' + JSON.stringify(err));
      }
    });
  }
}
