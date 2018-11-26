import { Utils } from './../../../utils/utils';
import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Chart } from '../../../domain/workSheet/chart';
import { WorkSheetService } from '../../../services/dataAnalysis/workSheet.service';
import { FilterType } from '../../../domain/workSheet/filterType';
import { TooltipService } from '../../../services/tooltip.service';
declare let flatpickr;
import { Mandarin } from 'flatpickr/dist/l10n/zh.js';

@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.scss']
})
export class FilterDialogComponent implements OnInit, AfterViewInit {

  private dbTableId: string; // 字段所属的表主键
  public type: string; // 筛选类型
  public fieldName: string; // 字段名称
  public filter: Chart.Filter = new Chart.Filter(); // 筛选实体
  public minValue; // 度量筛选区间最小值
  public maxValue; // 度量筛选区间最大值
  public dimensionValueArr = []; // 精确筛选字段值
  public filterArr: Chart.Filter[] = new Array<Chart.Filter>(); // 筛选数组
  public conditionItemFilter: Chart.ConditionItemFilter = new Chart.ConditionItemFilter(); // 维度条件筛选单项实体
  public titleType = 0; // 区分精确筛选和条件筛选
  public isCheckedAll = false; // 全选
  public filterType = {
    'Null': FilterType.ConditionType.Null,
    'Contain': FilterType.ConditionType.Contain,
    'NotContain': FilterType.ConditionType.NotContain,
    'Equal': FilterType.ConditionType.Equal,
    'NotEqual': FilterType.ConditionType.NotEqual,
    'MoreThan': FilterType.ConditionType.MoreThan,
    'LessThan': FilterType.ConditionType.LessThan,
    'MoreThanOrEqual': FilterType.ConditionType.MoreThanOrEqual,
    'LessThanOrEqual': FilterType.ConditionType.LessThanOrEqual,
    'ValueInterval': FilterType.ConditionType.ValueInterval,
    'NotNull': FilterType.ConditionType.NotNull
  };
  public fieldValue = ''; // 字段数据搜索
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<FilterDialogComponent>,
    private wsSer: WorkSheetService, private tooltipService: TooltipService) {
    if (this.data !== null && this.data !== undefined) {
      this.dbTableId = this.data.dbTableId;
      this.type = this.data.type;
      this.fieldName = this.data.fieldName;
      this.filter.fieldId = this.data.fieldId;
      this.filter.isDimensions = parseInt(this.type, 0);
    }
    if (this.data.filterArr.length) {
      this.filterArr = this.data.filterArr;
      const index = this.filterArr.findIndex(d => d.fieldId === this.data.fieldId);
      if (index >= 0 && this.filterArr[index].conditions) {
        this.filter = this.filterArr[index];
      } else {
        this.loadCondition();
      }
    } else {
      this.loadCondition();
    }
  }

  ngOnInit() {
    if (parseInt(this.type, 0) === 1) { // 维度
      this.getDataField();
    }
  }
  ngAfterViewInit(): void {
    Utils.slimScroll();
    const timeInput_startTime = document.getElementById('startTime');
    const timeInput_endTime = document.getElementById('endTime');
    if (timeInput_startTime != null) {
      flatpickr('#startTime', {
        enableTime: true,
        enableSeconds: true,
        locale: Mandarin,
        time_24hr: true,
        onChange: (d) => {
        }
      });
    }
    if (timeInput_endTime != null) {
      flatpickr('#endTime', {
        enableTime: true,
        enableSeconds: true,
        locale: Mandarin,
        time_24hr: true,
        onChange: (d) => {
        }
      });
    }
    $('.searchInput').on('keyup', Utils.lodash.throttle(() => {
      this.getDataField();
    }, Utils.throttleWaitTime));
  }

  private loadCondition() {
    this.filter.conditionRange = FilterType.Range.All;
    this.filter.filterType = FilterType.DimensionType.Accurate;
    this.filter.condition = FilterType.ConditionType.Null;
    this.filter.fieldValue = [];
    this.filter.conditions = [];
    this.filter.colName = this.fieldName;
    this.conditionItemFilter.condition = FilterType.ConditionType.Null;
    if (parseInt(this.type, 0) === 1) { // 维度
      this.filter.conditions.push(this.conditionItemFilter);
    }
  }

  /**
   * 增加一条筛选条件
   */
  public addConditionItemFilter() {
    this.conditionItemFilter = new Chart.ConditionItemFilter();
    this.conditionItemFilter.condition = FilterType.ConditionType.Null;
    this.filter.conditions.push(this.conditionItemFilter);
  }

  /**
   * 删除一条筛选条件
   * @param i 索引
   */
  public deleteConditionItemFilter(i: number): void {
    this.filter.conditions.splice(i, 1);
  }

  /**
   * 取消
   */
  public btnCancel() {
    this.dialogRef.close({ isConfirm: false });
  }

  /**
   * 确定
   */
  public btnOK() {
    if (parseInt(this.type, 0) === 0) { // 度量
      if (this.filter.condition == FilterType.ConditionType.ValueInterval) { // 由于类型问题先用双等于作判断
        this.filter.conditionValue = this.minValue + '~' + this.maxValue;
      }
    }
    const index = this.filterArr.findIndex(d => d.fieldId === this.data.fieldId);
    if (index >= 0) {
      this.filterArr.splice(index, 1);
    }
    this.filterArr.push(this.filter);
    this.dialogRef.close({ filterArr: this.filterArr, isConfirm: true });
  }

  /**
   * 勾选值
   */
  public checkField(fieldValue: string, isDisplay: boolean) {
    const info: Chart.FilterView = new Chart.FilterView();
    info.value = fieldValue;
    info.isChecked = isDisplay;
    if (isDisplay) {
      this.filter.fieldValue.push(info);
    } else {
      const index = this.filter.fieldValue.findIndex(d => d.value === fieldValue);
      if (index >= 0) {
        this.filter.fieldValue.splice(index, 1);
      }
    }
  }

  /**
   * 全选
   */
  public checkAll() {
    for (const key in this.dimensionValueArr) {
      if (this.dimensionValueArr.hasOwnProperty(key)) {
        if (this.isCheckedAll) { // 全选
          this.dimensionValueArr[key].isChecked = true;
          const info: Chart.FilterView = new Chart.FilterView();
          info.value = this.dimensionValueArr[key][this.fieldName];
          info.isChecked = this.isCheckedAll;
          this.filter.fieldValue.push(info);
        } else { // 取消全选
          this.dimensionValueArr[key].isChecked = false;
          const index = this.filter.fieldValue.findIndex(d => d.value === this.dimensionValueArr[key][this.fieldName]);
          if (index >= 0) {
            this.filter.fieldValue.splice(index, 1);
          }
        }
      }
    }
  }

  /**
   * 切换精确筛选/条件筛选
   * @param type 类型
   */
  public switch(type) {
    this.titleType = type;
    this.filter.filterType = type;
  }

  /**
   * 获取字段的数据
   * @param fields 字段主键数组
   */
  public getDataField() {
    this.wsSer.getDataField(this.dbTableId, this.filter.fieldId, this.fieldValue).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.dimensionValueArr = val.data; // 字段数组
          const index = this.filterArr.findIndex(d => d.fieldId === this.data.fieldId);
          if (index >= 0) {
            for (const i in this.filterArr[index].fieldValue) {
              if (this.filterArr[index].fieldValue.hasOwnProperty(i)) {
                for (const j in this.dimensionValueArr) {
                  if (this.dimensionValueArr.hasOwnProperty(j)) {
                    if (this.filterArr[index].fieldValue[i].value === this.dimensionValueArr[j][this.fieldName]) {
                      this.dimensionValueArr[j].isChecked = this.filterArr[index].fieldValue[i].isChecked;
                      break;
                    }
                  }
                }
              }
            }
          }
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        this.tooltipService.showMsg(JSON.stringify(err));
      }
    });
  }
}
