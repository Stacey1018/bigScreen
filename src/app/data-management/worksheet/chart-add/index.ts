import { Component, OnInit, NgZone, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SortablejsOptions, SortablejsDirective, SortablejsModule } from 'angular-sortablejs';
import { MatDialog } from '@angular/material';
import * as $ from 'jquery';

import { WorkSheetService } from '../../../services/dataAnalysis/workSheet.service';
import { DataTable } from '../../../domain/dataDeploy/dataTable';
import { Chart } from '../../../domain/workSheet/chart';
import { FilterDialogComponent } from '../filter-dialog';
import { TableDetailDialogComponent } from '../table-detail-dialog';
import { Scene } from '../../../domain/scene/scene';
import { ThemeConfigService } from '../../../services/screenDeploy/themeConfig.service';
import swal from 'sweetalert2';
import { LogHelper } from '../../../common/LogHelper';
import { DefConfigService } from '../../../services/defConfig.service';
import { TooltipService } from '../../../services/tooltip.service';
import { Utils } from '../../../utils/utils';
import { SelectWorksheetDialogComponent } from '../select-worksheet-dialog/index';
declare var echarts;
declare var dark;
@Component({
  selector: 'app-chart-add',
  templateUrl: './chart-add.component.html',
  styleUrls: ['./chart-add.component.scss']
})
export class ChartAddComponent implements OnInit, AfterViewInit, OnDestroy {

  public dbId: string; // 数据库主键
  public dbTableId: string; // 数据表主键
  public dbTableName: string; // 数据表名称
  public measureFields: DataTable.TableFiled[] = new Array<DataTable.TableFiled>(); // 数据表度量字段数组
  public dimensionsFields: DataTable.TableFiled[] = new Array<DataTable.TableFiled>(); // 数据表维度字段数组
  public dateFields: DataTable.DateField[] = new Array<DataTable.DateField>(); // 日期字段数组
  public dragendMeasureFields: DataTable.TableFiled[] = new Array<DataTable.TableFiled>(); // 拖拽度量字段数组
  public dragendDimensionsFields: DataTable.TableFiled[] = new Array<DataTable.TableFiled>(); // 拖拽维度字段数组
  public dragendFilterFields: DataTable.TableFiled[] = new Array<DataTable.TableFiled>(); // 拖拽筛选器字段数组
  public chartTypes: Chart.ChartType[] = new Array<Chart.ChartType>(); // 图表类型
  public comboChartTypes: Chart.ChartType[] = new Array<Chart.ChartType>(); // 可组合的图表类型
  public isTableDivDisplay = false; // div表格是否显示
  public isChartDivDisplay = false; // echarts图表是否显示
  private chart; // echarts
  public options: SortablejsOptions = {}; // 拖动配置项
  public dbFields: DataTable.TableFiled[] = new Array<DataTable.TableFiled>(); // 数据表字段数组
  public dbData; // 表格数据
  public filterArr: Chart.Filter[] = new Array<Chart.Filter>(); // 筛选数组
  public optionCondition: Chart.OptionCondition = new Chart.OptionCondition(); // 拖拽生成图表参数实体
  public isShowRightNav = false;
  public top = 0;
  public left = 0;
  public isShowChartTypeNav = false;
  public fieldId: string; // 当前操作字段主键
  public colorThemes: Scene.Color[] = new Array<Scene.Color>(); // 颜色列表
  public colorThemeId: string; // 颜色主题主键
  public currentThemesJson: any;  // 当前主题JSON;
  private dataOption; // echarts图表option
  public chartTitleIsOpen = true; // 默认图表标题显示
  public chartLegendIsOpen = true; // 默认显示图表图例
  public chartId: string; // 编辑时图表主键
  public isCalculate: boolean;
  public orderType = {
    'Asc': Chart.OrderType.asc,
    'Desc': Chart.OrderType.desc
  }; // 排序规则枚举
  public mathRule = {
    'Sum': Chart.MathRule.sum,
    'Avg': Chart.MathRule.avg,
    'Count': Chart.MathRule.count,
    'Max': Chart.MathRule.max,
    'Min': Chart.MathRule.min,
    'Percentage': Chart.MathRule.percentage
  }; // 计算规则
  public locationArr = ['dragend', 'dimensions', 'measure'];
  public currType = -1; // 当前选中的图表类型
  public dateArr = ['年', '月', '日', '时', '分', '秒'];
  public currItem: DataTable.TableFiled = new DataTable.TableFiled(); // 当前操作的字段实体
  public chartSetState = false; // 图表设置
  public minIsAuto = true; // 是否设置数值最小值,默认自动
  public maxIsAuto = true; // 是否设置数值最大值,默认自动
  public currAxisType: number; // 当前选择图表类型是否是坐标抽图
  public currCombinationType: number; // 当前选择图表类型是否可以组合
  private comboCharts =
    {
      'line': 0,
      'curve': 1,
      'bar': 8,
      'scatter': 15
    };
  public unitName = [
    { text: '请选择', value: 1 },
    { text: '千', value: 1000 },
    { text: '万', value: 10000 },
    { text: '千万', value: 10000000 },
    { text: '亿', value: 100000000 },
  ];
  constructor(public activatedRoute: ActivatedRoute, private dialog: MatDialog, private wsSer: WorkSheetService,
    private zone: NgZone, private tooltipService: TooltipService, private tcService: ThemeConfigService, private defSer: DefConfigService) {
    activatedRoute.queryParams.subscribe(params => {
      this.dbId = params['dbId'] === undefined ? '' : params['dbId'];
      this.dbTableId = params['dbTableId'] === undefined ? '' : params['dbTableId'];
      this.dbTableName = params['dbTableName'] === undefined ? '' : params['dbTableName'];
      this.chartId = params['chartId'] === undefined ? '' : params['chartId'];
      if (this.dbTableId !== null && this.dbTableId !== '') {
        this.getTableFields();
      }
    });
    this.optionCondition.dbId = this.dbId; // 初始化
    this.optionCondition.tableId = this.dbTableId;
    this.optionCondition.chartConditions = [];
    this.optionCondition.chartName = '';
    this.optionCondition.unitName = 1;
    this.options = {
      group: { name: 'test', pull: false, put: false, },
      sort: false, //  以上两项配置页面上禁止排序
      onEnd: (event: any) => {
        const fieldType = $(event.item).data('id');
        const event2: any = window.event;
        if (event2.type === 'dragend') {
          const liOffsetLeft = event2.clientX;
          const liOffsetTop = event2.clientY;
          for (const key in this.locationArr) {
            if (this.locationArr.hasOwnProperty(key)) {
              const minX = $('#' + this.locationArr[key]).offset().left;
              const minY = $('#' + this.locationArr[key]).offset().top;
              const maxX = minX + parseInt($('#' + this.locationArr[key]).css('width'), 0);
              const maxY = minY + parseInt($('#' + this.locationArr[key]).css('height'), 0);
              if (liOffsetLeft > minX && liOffsetLeft < maxX && liOffsetTop > minY && liOffsetTop < maxY) {
                const dragField: DataTable.TableFiled = new DataTable.TableFiled();
                let fieldId, colName, remarkName;
                const fieldInfo: Chart.ChartCondition = new Chart.ChartCondition();
                this.isChartDivDisplay = false;
                this.currType = -1;
                if (fieldType !== 2) { // 非日期类型字段
                  fieldId = $(event.item).attr('id');
                  colName = $(event.item).data('title');
                  remarkName = $(event.item).attr('title');
                } else { // 日期类型的字段
                  const name = $(event.item).attr('title');
                  if (this.dateArr.indexOf(name) === -1) { // 拖拽的是日期字段本身
                    fieldId = $(event.item).attr('id');
                    colName = $(event.item).data('title');
                    remarkName = $(event.item).attr('title') + '(日)';
                    fieldInfo.dateRule = Chart.DateRule.day;
                  } else { // 拖拽的是年月日时分秒
                    fieldId = $(event.item).data('title');
                    colName = $(event.item).data('name');
                    const dateRuleIndex = $(event.item).attr('id');
                    switch (parseInt(dateRuleIndex, 0) + 1) {
                      case 1:
                        fieldInfo.dateRule = Chart.DateRule.year;
                        break;
                      case 2:
                        fieldInfo.dateRule = Chart.DateRule.month;
                        break;
                      case 3:
                        fieldInfo.dateRule = Chart.DateRule.day;
                        break;
                      case 4:
                        fieldInfo.dateRule = Chart.DateRule.hour;
                        break;
                      case 5:
                        fieldInfo.dateRule = Chart.DateRule.minute;
                        break;
                      case 6:
                        fieldInfo.dateRule = Chart.DateRule.second;
                        break;
                    }
                    remarkName = $(event.item).data('name') + '(' + this.dateArr[parseInt(dateRuleIndex, 0)] + ')';
                  }
                }
                let fieldFilter: DataTable.TableFiled = new DataTable.TableFiled();

                if (fieldType === 0) {
                  fieldFilter = this.measureFields.filter(d => d.fieldId === fieldId)[0];
                } else if (fieldType === 1) {
                  fieldFilter = this.dimensionsFields.filter(d => d.fieldId === fieldId)[0];
                } else if (fieldType === 2) {
                  fieldFilter = this.dateFields.filter(d => d.fieldId === fieldId)[0];
                }
                dragField.fieldId = fieldFilter.fieldId;
                dragField.colName = fieldFilter.colName;
                dragField.isDimensions = fieldFilter.isDimensions;
                dragField.isDisplay = fieldFilter.isDisplay;
                dragField.parentId = fieldFilter.parentId;
                dragField.tableId = fieldFilter.tableId;
                dragField.typeName = fieldFilter.typeName;
                dragField.remarkName = remarkName; // 以上赋值为了解决引用类型值改变影响原来数组问题
                fieldInfo.fieldId = fieldId;
                fieldInfo.isDimensions = fieldFilter.isDimensions;
                fieldInfo.mathRule = Chart.MathRule.null;
                fieldInfo.orderType = Chart.OrderType.null;
                fieldInfo.colName = colName;
                fieldInfo.remarkName = remarkName;
                if (this.locationArr[key] === 'dragend') { // 筛选器
                  if (this.dragendFilterFields.length) {
                    const field = this.dragendFilterFields.filter(d => d.fieldId === fieldId);
                    if (field.length) {
                      this.tooltipService.showMsg('不能拖拽相同字段');
                      return;
                    }
                  }
                  this.zone.run(() => { this.openDialog(dragField); });
                } else if (this.locationArr[key] === 'dimensions') { // 维度
                  const field = this.dragendDimensionsFields.filter(d => d.fieldId === fieldId);
                  if (field.length) {
                    this.tooltipService.showMsg('不能拖拽相同字段');
                    return;
                  } else {
                    if (dragField.isDimensions === 0) {
                      this.tooltipService.showMsg('不能将度量拖拽到维度列表中');
                      return;
                    }
                  }
                  this.zone.run(() => {
                    this.dragendDimensionsFields.push(dragField);
                    this.optionCondition.chartConditions.push(fieldInfo);
                    this.getDataFieldByQuery(this.optionCondition);
                  });
                } else if (this.locationArr[key] === 'measure') { // 度量
                  const field = this.dragendMeasureFields.filter(d => d.fieldId === fieldId);
                  if (field.length) {
                    this.tooltipService.showMsg('不能拖拽相同字段');
                    return;
                  } else {
                    if (dragField.isDimensions === 1 || dragField.isDimensions === 2) {
                      this.tooltipService.showMsg('不能将维度拖拽到度量列表中');
                      return;
                    }
                  }
                  this.zone.run(() => {
                    this.dragendMeasureFields.push(dragField);
                    this.optionCondition.chartConditions.push(fieldInfo);
                    this.getDataFieldByQuery(this.optionCondition);
                  });
                }
              }
            }
          }
        }
      },
    };
  }

  ngOnInit() {
    this.chart = echarts.init(document.getElementById('chart'), this.currentThemesJson ?
      JSON.parse(this.currentThemesJson) : 'dark'); // 初始化echarts实例
    this.getChartTypes();
    // this.getColorThemes();
    if (this.chartId !== null && this.chartId !== '') {
      this.getChartInfo();
    }
  }

  ngAfterViewInit() {
    Utils.slimScroll();
    const currThis = this;
    $(document).click(function () {
      if (!$(this).hasClass('editIcon')) {
        currThis.isShowRightNav = false;
      }
      if (!$(this).hasClass('chartTypeIcon')) {
        currThis.isShowChartTypeNav = false;
      }
    });
    $(window).on('resize.chartAdd',
      Utils.lodash.throttle(() => {
        if (!this.isTableDivDisplay) {
          setTimeout(() => {
            this.chart = echarts.getInstanceByDom(document.getElementById('chart'));
            this.chart.resize();
          }, 200);
        }
      }, Utils.throttleWaitTime)
    );
  }

  ngOnDestroy(): void {
    $(window).off('resize.chartAdd');
  }

  /**
   * 编辑时获取图表信息
   */
  public getChartInfo() {
    this.wsSer.getChartInfo(this.chartId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.isTableDivDisplay = false;
          this.isChartDivDisplay = true;
          this.dataOption = val.data.option;
          this.loadChart(this.dataOption);
          this.filterArr = val.data.filters;
          this.optionCondition.chartConditions = val.data.chartConditions;
          this.optionCondition.category = val.data.category;
          this.optionCondition.chartName = val.data.chartName;
          this.optionCondition.chartType = val.data.chartType;
          this.optionCondition.dbId = val.data.dbId;
          this.optionCondition.filters = val.data.filters;
          this.optionCondition.tableId = val.data.tableId;
          this.optionCondition.unitName = val.data.unitName;
          this.optionCondition.yAxisName = val.data.yAxisName;
          this.optionCondition.max = val.data.max;
          this.optionCondition.min = val.data.min;
          this.maxIsAuto = val.data.max !== null ? true : false;
          this.minIsAuto = val.data.min !== null ? true : false;
          this.dbTableId = val.data.tableId;
          this.dbTableName = val.data.tableName;
          this.currType = val.data.chartType;
          this.dbFields.length = 1; // 样式有问题(为了调试方便先这样赋值 下次提交代码时再修改)
          if (val.data.filters) {
            this.dragendFilterFields = val.data.filters;
          } else {
            this.dragendFilterFields = [];
          }
          this.dragendMeasureFields = this.optionCondition.chartConditions.filter(d => d.isDimensions === 0);
          this.dragendDimensionsFields = this.optionCondition.chartConditions.filter(d => d.isDimensions === 1 || d.isDimensions === 2);
          const chartTypeItem = this.chartTypes.filter(t => t.code === val.data.chartType);
          for (const key in this.dragendMeasureFields) {
            if (this.dragendMeasureFields.hasOwnProperty(key)) {
              this.dragendMeasureFields[key].iconName = chartTypeItem[0].iconName;
            }
          }
          this.currAxisType = chartTypeItem[0].axisType;
          this.currCombinationType = chartTypeItem[0].combinationType;
          this.getTableFields();
        } else {
          LogHelper.log('data-analysis worksheet', 'chart-add getChartInfo()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'chart-add getChartInfo()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 获取颜色主题列表
   */
  public getColorThemes(): void {
    this.tcService.getColorThemes().subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.colorThemes = val.data as Scene.Color[];
          this.colorThemeId = this.colorThemes[0].themeId;
        } else {
          LogHelper.log('data-analysis worksheet', 'chart-add getColorThemes()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'chart-add getColorThemes()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 切换颜色
   * @param colorTheme 颜色主题实体
   */
  public changeColorTheme() {
    if (this.isChartDivDisplay) {
      this.tcService.getColorThemeInfoById(this.colorThemeId).subscribe({
        next: (val) => {
          if (val.code === 0) {
            this.currentThemesJson = val.data.themeJson;
            this.loadChart(this.dataOption);
          } else {
            this.tooltipService.showMsg(val.message);
          }
        },
        error: (err) => {
          LogHelper.error('data-analysis worksheet', 'chart-add changeColorTheme()error,原因:' + JSON.stringify(err));
        }
      });
    }
  }

  public setChart() {
    this.chartSetState = !this.chartSetState;
  }

  /**
   * 切换图表标题是否显示
   */
  public changeChartTitleState() {
    if (this.dataOption) {
      for (const key in this.dataOption.series) {
        if (this.dataOption.series.hasOwnProperty(key)) {
          this.dataOption.series[key].label.normal.show = this.chartTitleIsOpen;
        }
      }
      this.loadChart(this.dataOption);
    }
  }

  /**
   * 图例开关
   */
  public changeLegendState(): void {
    if (this.dataOption) {
      this.dataOption.legend.show = this.chartLegendIsOpen;
      this.loadChart(this.dataOption);
    }
  }

  /**
  * 更改最大、最小值状态(用户是否要自己设置最大最小值)
  * @param type 值类型
  */
  public changeAutoState(type: string) {
    if (type === 'min') {
      if (this.minIsAuto) {
        this.dataOption.yAxis.min = null;
      } else {
        this.dataOption.yAxis.min = this.optionCondition.min;
      }
      if (this.dataOption.yAxis.min !== undefined) {
        this.loadChart(this.dataOption);
      }
    } else {
      if (this.maxIsAuto) {
        this.dataOption.yAxis.max = null;
      } else {
        this.dataOption.yAxis.max = this.optionCondition.max;
      }
      if (this.dataOption.yAxis.max !== undefined) {
        this.loadChart(this.dataOption);
      }
    }
  }

  /**
   * 设置最大最小值
   * @param type 值类型
   */
  public changeValue(e, type: string) {
    if (e.keyCode === 13) {
      if (type === 'min') {
        if (this.dataOption) {
          this.dataOption.yAxis.min = this.optionCondition.min;
        }
      } else {
        if (this.dataOption) {
          this.dataOption.yAxis.max = this.optionCondition.max;
        }
      }
      this.loadChart(this.dataOption);
    }
  }

  /**
   * 设置单位
   */
  public setUnit() {
    this.optionCondition.option = null;
    this.getChartOption();
  }

  /**
   * 点击拖拽的某字段显示下拉菜单
   * @param e
   * @param item 字段实体
   */
  public setting(e, item: DataTable.TableFiled): void {
    this.top = $(e.target).offset().top + 20;
    this.left = $(e.target).offset().left - 60;
    this.isShowRightNav = true;
    this.fieldId = item.fieldId;
    this.currItem = item;
    this.isCalculate = item.isDimensions === 0 ? true : false;
  }

  /**
  * 点击拖拽的某字段显示下拉菜单
  * @param e
  * @param item 字段实体
  */
  public showChartType(e, item: DataTable.TableFiled): void {
    this.top = $(e.target).offset().top + 20;
    this.left = $(e.target).offset().left;
    this.isShowChartTypeNav = true;
    this.fieldId = item.fieldId;
    this.currItem = item;
  }

  /**
   * 切换字段组合图形
   * @param item 图形类型实体
   */
  public selectChartType(item: Chart.ChartType): void {
    const dragendIndex = this.dragendMeasureFields.findIndex(t => t.fieldId === this.fieldId);
    this.dragendMeasureFields[dragendIndex].iconName = item.iconName;
    const conditionIndex = this.optionCondition.chartConditions.findIndex(t => t.fieldId === this.fieldId);
    this.optionCondition.chartConditions[conditionIndex].chartType = item.code;
    this.getChartOption();
  }


  /**
   * 字段排序
   */
  public fieldSort(value): void {
    this.currType = -1;
    const index = this.optionCondition.chartConditions.findIndex(d => d.fieldId === this.fieldId);
    this.optionCondition.chartConditions[index].orderType = value;
    this.currItem.orderType = value;
    this.getDataFieldByQuery(this.optionCondition);
  }

  /**
   * 字段计算规则
   */
  public fieldCalcRules(value): void {
    this.currType = -1;
    const index = this.optionCondition.chartConditions.findIndex(d => d.fieldId === this.fieldId);
    this.optionCondition.chartConditions[index].mathRule = value;
    this.currItem.mathRule = value;
    this.getDataFieldByQuery(this.optionCondition);
  }

  /**
   * 移除维度/度量中的某个字段
   */
  public removeField(): void {
    const index = this.optionCondition.chartConditions.findIndex(d => d.fieldId === this.fieldId);
    if (this.optionCondition.chartConditions[index].isDimensions === 0) { // 度量
      const delIndex = this.dragendMeasureFields.findIndex(d => d.fieldId === this.fieldId);
      this.dragendMeasureFields.splice(delIndex, 1);
    } else if (this.optionCondition.chartConditions[index].isDimensions === 1 ||
      this.optionCondition.chartConditions[index].isDimensions === 2) { // 维度和日期
      const delIndex = this.dragendDimensionsFields.findIndex(d => d.fieldId === this.fieldId);
      this.dragendDimensionsFields.splice(delIndex, 1);
    }
    this.optionCondition.chartConditions.splice(index, 1);
    this.getDataFieldByQuery(this.optionCondition);
    this.currType = -1;
  }

  /**
   * 打开筛选器
   * @param item 字段实体
   */
  public openDialog(item: DataTable.TableFiled): void {
    let height = '240px';
    if (item.isDimensions === 1) {
      height = '370px';
    } else if (item.isDimensions === 0) {
      height = '180px';
    }
    const dialogRef = this.dialog.open(FilterDialogComponent, {
      width: '400px',
      height: height,
      disableClose: true,
      data: {
        type: item.isDimensions, fieldName: item.colName, fieldId: item.fieldId,
        filterArr: this.filterArr, dbTableId: this.dbTableId
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.isConfirm) { // 点击确定关闭弹框
        this.isChartDivDisplay = false;
        this.isTableDivDisplay = false;
        const fields = this.dragendFilterFields.filter(d => d.fieldId === item.fieldId);
        if (fields.length === 0) {
          this.dragendFilterFields.push(item);
        }
        this.filterArr = result.filterArr;
        this.optionCondition.filters = this.filterArr;
        this.getDataFieldByQuery(this.optionCondition);
      }
    });
  }

  /**
   * 移除筛选器字段
   * @param item 字段实体
   */
  public removeFilter(item: DataTable.TableFiled): void {
    const delIndex = this.dragendFilterFields.findIndex(d => d.fieldId === item.fieldId);
    if (delIndex >= 0) {
      this.dragendFilterFields.splice(delIndex, 1);
    }
    const filterIndex = this.optionCondition.filters.findIndex(d => d.fieldId === item.fieldId);
    if (filterIndex >= 0) {
      this.optionCondition.filters.splice(filterIndex, 1);
    }
    this.getDataFieldByQuery(this.optionCondition);
  }

  /**
   * 获取字段列表
   */
  public getTableFields(): void {
    this.wsSer.getFields(this.dbTableId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.dateFields = val.data.TimeVal;
          this.dimensionsFields = val.data.TextVal;
          this.measureFields = val.data.NumVal;
          for (const key1 in this.dateFields) {
            if (this.dateFields.hasOwnProperty(key1)) {
              this.dateFields[key1].isShow = false;
              const item = this.dateFields[key1];
              const fieldSecArr = [];
              for (const key2 in this.dateArr) {
                if (this.dateArr.hasOwnProperty(key2)) {
                  const fieldInfo: DataTable.TableFiled = new DataTable.TableFiled();
                  fieldInfo.fieldId = key2;
                  fieldInfo.parentId = item.fieldId;
                  fieldInfo.remarkName = this.dateArr[key2];
                  fieldInfo.isDimensions = item.isDimensions;
                  fieldSecArr.push(fieldInfo);
                }
              }
              this.dateFields[key1].fields = fieldSecArr;
            }
          }
        } else {
          LogHelper.log('data-analysis worksheet', 'chart-add getTableFields()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'chart-add getTableFields()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 日期类型字段展开收起
   * @param item 日期类型字段实体
   */
  public operateBox(item: DataTable.DateField): void {
    item.isShow = !item.isShow;
  }

  /**
   * 获取字段的数据
   * @param fields 字段主键数组
   */
  public getDataFieldByQuery(optionCondition: Chart.OptionCondition): void {
    this.wsSer.getDataFieldByQuery(optionCondition).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.isChartDivDisplay = false;
          if (val.data.fileName !== null) {
            this.dbFields = val.data.fileName;
            this.dbData = val.data.tableData;
            this.isTableDivDisplay = true;
          } else {
            this.dbFields = [];
            this.dbData = [];
            this.isTableDivDisplay = false;
          }
        } else {
          LogHelper.log('data-analysis worksheet', 'chart-add getDataFieldByQuery()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'chart-add getDataFieldByQuery()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 字段维度度量转换
   * @param fieldId 字段主键
   * @param isDimensions 维度度量标识
   */
  public convertFieldType(fieldId: string, isDimensions: number): void {
    this.wsSer.convertFieldType(fieldId, isDimensions).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.getTableFields();
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'chart-add convertFieldType()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 点击表名查看表详情
   */
  public getTableData(): void {
    this.dialog.open(TableDetailDialogComponent, {
      width: '400px',
      height: '320px',
      disableClose: true,
      data: { dbTableId: this.dbTableId }
    });
  }

  /**
   * 切换工作表
   */
  public selectWorkSheet(): void {
    const dialogRef = this.dialog.open(SelectWorksheetDialogComponent, {
      width: '400px',
      height: '420px',
      disableClose: true,
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.isConfirm) { // 点击确定关闭弹框
        this.dbTableId = result.dbTableId;
        this.dbTableName = result.remarkName;
        this.getTableFields();
        this.dragendFilterFields = [];
        this.dbFields = [];
        this.dbData = [];
        this.isTableDivDisplay = false;
        this.isChartDivDisplay = false;
        this.dragendFilterFields = [];
        this.dragendDimensionsFields = [];
        this.dragendMeasureFields = [];
        this.optionCondition = new Chart.OptionCondition();
        this.optionCondition.chartConditions = [];
        this.optionCondition.filters = [];
        this.optionCondition.dbId = result.dbId;
        this.optionCondition.tableId = this.dbTableId;
        this.currType = null;
      }
    });
  }

  /**
   * 获取图表类型
   */
  public getChartTypes(): void {
    this.wsSer.getChartTypes().subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.chartTypes = val.data;
          this.comboChartTypes = this.chartTypes.filter(t => t.combinationType === 1 &&
            (t.iconName === 'line' || t.iconName === 'bar' || t.iconName === 'curve' || t.iconName === 'scatter'));
        } else {
          LogHelper.log('data-analysis worksheet', 'chart-add getChartTypes()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'chart-add getChartTypes()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 切换图表类型
   * @param item 图表类型实体
   */
  public changeChartType(item: Chart.ChartType): void {
    if (item.code === 18) { // 仪表盘只需要选择度量就可以
      if (this.dragendMeasureFields.length === 0) {
        this.tooltipService.showMsg('请先拖拽度量');
        return;
      }
    } else {
      if (this.dragendDimensionsFields.length === 0 || this.dragendMeasureFields.length === 0) {
        this.tooltipService.showMsg('请先拖拽维度和度量');
        return;
      }
    }
    for (const key in this.dragendMeasureFields) {
      if (this.dragendMeasureFields.hasOwnProperty(key)) {
        this.dragendMeasureFields[key].iconName = item.iconName;
      }
    }
    let chartCode;
    if (item.iconName.indexOf('line') !== -1) {
      chartCode = this.comboCharts.line;
    } else if (item.iconName.indexOf('bar') !== -1) {
      chartCode = this.comboCharts.bar;
    } else if (item.iconName.indexOf('curve') !== -1) {
      chartCode = this.comboCharts.curve;
    } else if (item.iconName.indexOf('scatter') !== -1) {
      chartCode = this.comboCharts.scatter;
    }
    for (const key in this.optionCondition.chartConditions) {
      if (this.optionCondition.chartConditions.hasOwnProperty(key)) {
        if (this.optionCondition.chartConditions[key].isDimensions === 0) {
          this.optionCondition.chartConditions[key].chartType = chartCode;
        }
      }
    }
    this.optionCondition.chartType = item.code;
    this.currType = item.code;
    this.currAxisType = item.axisType;
    this.currCombinationType = item.combinationType;
    this.optionCondition.option = null;
    this.getChartOption();
  }

  /**
   * 提取的方法(获取图表option)
   */
  private getChartOption(): void {
    this.wsSer.getChartOption(this.optionCondition).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.dataOption = val.data;
          this.optionCondition.option = val.data;
          if (this.dataOption !== null) {
            this.loadChart(this.dataOption);
          }
        } else {
          if (val.message !== null) {
            this.tooltipService.showMsg(val.message);
          } else {
            this.tooltipService.showMsg('不支持该图表类型');
          }
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'chart-add getChartOption()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 加载图表
   * @param data 数据option
   */
  public loadChart(data): void {
    this.isTableDivDisplay = false;
    this.isChartDivDisplay = true;
    setTimeout(() => {
      this.chart.dispose();
      this.chart = echarts.init(document.getElementById('chart'), this.currentThemesJson ?
        JSON.parse(this.currentThemesJson) : 'dark');
      this.chart.setOption(data);
    }, 100);
  }

  /**
   * 保存图表
   */
  public saveDialog(): void {
    swal({
      title: '保存图表',
      input: 'text',
      showCancelButton: true,
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入图表名称',
      inputValue: this.optionCondition.chartName,
      inputAttributes: { maxlength: '25' },
      confirmButtonColor: this.defSer.swalConfirmButtonColor,
      cancelButtonClass: 'cancelButtonClass',
      showCloseButton: true,
      padding: 0,
      width: '400px',
      inputValidator: (value) => {
        return new Promise((resolve, reject) => {
          if (value) {
            this.optionCondition.chartName = value;
            this.saveDragChartInfo((val) => {
              if (val.code === 0) {
                resolve();
              } else {
                swal.showValidationError(val.message);
                swal.enableInput();
                swal.enableButtons();
              }
            });
          } else {
            swal.showValidationError('请输入图表名称');
            swal.enableInput();
            swal.enableButtons();
          }
        });
      }
    }).then((result) => {
    });
  }

  /**
   * 保存图表信息调用后台接口
   * @param callback 回调函数
   */
  public saveDragChartInfo(callback: any): void {
    this.optionCondition.category = 3; // 3表示是拖拽生成图表
    this.optionCondition.thumb = this.chart.getDataURL(); // 缩略图
    this.optionCondition.option = this.dataOption;
    this.optionCondition.colorThemeId = this.colorThemeId;
    this.wsSer.saveDragChartInfo(this.optionCondition).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('保存成功');
        }
        //  else {
        //   this.tooltipService.showMsg('保存失败');
        // }
        callback(val);
      },
      error: (err) => {
        LogHelper.error('data-analysis worksheet', 'chart-add saveDragChartInfo()error,原因:' + JSON.stringify(err));
      }
    });
  }
}
