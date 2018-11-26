import { Utils } from './../../../utils/utils';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { DataDeployService } from '../../../services/dataAnalysis/dataDeploy.service';
import { DataBase } from '../../../domain/dataDeploy/dataBase';
import { WorkSheetService } from '../../../services/dataAnalysis/workSheet.service';
import { MatDialog } from '@angular/material';
import { DataVisualizeDialogComponent } from '../data-visualize-dialog';
import { EventPubSub } from '../../../common/eventPubSub';
import { MessageCodeEnum } from '../../../common/messageCodeEnum';
import { Scene } from '../../../domain/scene/scene';
import { ThemeConfigService } from '../../../services/screenDeploy/themeConfig.service';
import { DataOption } from '../../../domain/dataDeploy/dataOption';
import { ActivatedRoute } from '@angular/router';
import { Chart } from '../../../domain/workSheet/chart';
import { SaveDialogComponent } from '../save-dialog';
import { LogHelper } from '../../../common/LogHelper';
import { TooltipService } from '../../../services/tooltip.service';
import { DataTable } from '../../../domain/dataDeploy/dataTable';
import { EduTable } from '../../../domain/dataDeploy/eduTable';
import { EduDataViewService } from '../../../services/dataAnalysis/eduDataView.service';
import { DynamicFormService } from '../../../services/dataAnalysis/dynamicForm.service';
declare var echarts;
declare var dark;
@Component({
  selector: 'app-sql-create-table',
  templateUrl: './sql-create-table.component.html',
  styleUrls: ['./sql-create-table.component.scss']
})
export class SqlCreateTableComponent implements OnInit, AfterViewInit, OnDestroy {

  public dbTableData = { key: [], data: [] }; // 数据库表字段和数据
  public dataBases: DataBase.DBView[] = new Array<DataBase.DBView>(); // 数据库数组
  public chartTypes: Chart.ChartType[] = new Array<Chart.ChartType>(); // 图表类型
  public comboChartTypes: Chart.ChartType[] = new Array<Chart.ChartType>(); // 可组合的图表类型
  public currType; // 当前展示的图表类型
  private chart; // echarts
  public colorThemes: Scene.Color[] = new Array<Scene.Color>(); // 颜色列表
  public dataOptionParam: DataOption.SqlData = new DataOption.SqlData(); // 生成option参数实体
  public colorThemeId: string; // 颜色主题主键
  private currentThemesJson: any;  // 当前主题JSON;
  public chartTitleIsOpen = true; // 默认显示图表标题
  public chartLegendIsOpen = true; // 默认显示图表图例
  private dataOption; // echarts图表option
  public sqlIsFullscreen = false;
  public tableIsFullscreen = false;
  public chartId = ''; // 图表主键标识
  public isBtnDisplay = false; // 生成图表按钮是否显示
  public isDisplay = true; // div表格是否显示
  public rightIsDisplay = false; // 控制页面右侧是否显示
  public isChangeData = false; // 页面数据是否变化
  public dataSourceIsDB: boolean; // 标识选择的数据源是否是数据库
  public currDataSourceType: number; // 当前选择的数据源类型
  public dbTables: DataTable.DataTableView[] = new Array<DataTable.DataTableView>(); // 数据表数组
  public dbEduTables: EduTable.DataTableView[] = new Array<EduTable.DataTableView>(); // 教育数据表数组
  public formTables: DataTable.DataTableView[] = new Array<DataTable.DataTableView>(); // 表单数据数组

  private selectedDbId = ''; // 选中的数据源主键标识
  public currTableId: string; // 当前选择的excel工作表主键
  public currTableName: string; // 当前操作模板名称(表单数据展示时使用)
  public isEditChangeSource = false; // 编辑图表时是否切换数据源
  public minIsAuto = true; // 是否设置数值最小值,默认自动
  public maxIsAuto = true; // 是否设置数值最大值,默认自动
  public comboFields: DataOption.FilterParam[] = new Array<DataOption.FilterParam>(); // 图表类型组合字段数组
  public currAxisType: number; // 当前选择图表类型是否是坐标抽图
  public currCombinationType: number; // 当前选择图表类型是否可以组合
  private comboCharts =
    {
      'line': 0,
      'curve': 1,
      'bar': 8,
      'scatter': 15
    };
  public isShowChartTypeIconBox = false;
  public top = 0;
  public left = 0;
  private currFieldIndex: number; // 组合字段主键
  constructor(private dataDeploySer: DataDeployService, private wsSer: WorkSheetService, private dialog: MatDialog,
    private tcService: ThemeConfigService, public tooltipService: TooltipService, private route: ActivatedRoute,
    private eduSer: EduDataViewService, private formService: DynamicFormService) {
    this.subscribe();
    this.dataOptionParam.params = [];
  }

  ngOnInit() {
    this.chart = echarts.init(document.getElementById('divChart'), this.currentThemesJson ?
      JSON.parse(this.currentThemesJson) : 'dark'); // 初始化echarts实例
    this.getDBList();
    this.getChartTypes();
    // this.getColorThemes();
  }
  ngAfterViewInit() {
    Utils.slimScroll();
    const currThis = this;
    $(document).click(function () {
      if (!$(this).hasClass('chartTypeIcon')) {
        currThis.isShowChartTypeIconBox = false;
      }
    });
    $(window).on('resize.sql',
      Utils.lodash.throttle(() => {
        if (this.rightIsDisplay) {
          setTimeout(() => {
            this.chart = echarts.getInstanceByDom(document.getElementById('divChart'));
            this.chart.resize();
          }, 200);
        }
      }, Utils.throttleWaitTime)
    );
  }

  ngOnDestroy(): void {
    $(window).off('resize.sql');
  }

  public subscribe() {
    EventPubSub.instance.subscribe(MessageCodeEnum.dataOption, d => {
      if (d !== '' && d !== undefined) {
        this.dataOption = d;
        this.rightIsDisplay = true;
        this.isChangeData = true;
        this.loadChart(d);
      } else {
        this.tooltipService.showMsg('不支持该图表类型');
      }
    });
  }

  /**
   * 编辑时获取图表信息
   */
  public getChartInfo(): void {
    this.wsSer.getChartInfo(this.chartId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          if (val.data) {
            this.dataOptionParam.chartName = val.data.chartName;
            this.dataOptionParam.colorThemeId = val.data.colorThemeId;
            this.dataOptionParam.option = val.data.option;
            this.dataOptionParam.sqlInfo = val.data.sqlInfo;
            this.dataOptionParam.dbId = val.data.dbId;
            this.dataOptionParam.chartType = val.data.chartType;
            this.dataOptionParam.unitName = val.data.unitName;
            this.dataOptionParam.yAxisName = val.data.yAxisName;
            this.dataOptionParam.max = val.data.max;
            this.dataOptionParam.min = val.data.min;
            this.maxIsAuto = val.data.max !== null ? true : false;
            this.minIsAuto = val.data.min !== null ? true : false;
            this.currType = val.data.chartType;
            this.dataOptionParam.params = val.data.params;
            this.colorThemeId = val.data.colorThemeId;
            this.dataOption = val.data.option;
            this.currTableId = val.data.tableId;
            this.dataOptionParam.tableId = val.data.tableId;
            const dbInfo = this.dataBases.filter(d => d.dbId === val.data.dbId);
            this.currDataSourceType = dbInfo[0].isDB;
            this.comboFields = this.dataOptionParam.params.filter(t => t.isMeasure === true);
            const chartTypeItem = this.chartTypes.filter(t => t.code === val.data.chartType);
            this.currAxisType = chartTypeItem[0].axisType;
            this.currCombinationType = chartTypeItem[0].combinationType;
            for (const key in this.comboFields) {
              if (this.comboFields.hasOwnProperty(key)) {
                this.comboFields[key].iconName = chartTypeItem[0].iconName;
              }
            }
            switch (dbInfo[0].isDB) {
              case 0:
                this.dataSourceIsDB = false;
                this.getExcelTableList(val.data.dbId);
                break;
              case 1:
                this.dataSourceIsDB = true;
                break;
              case 2:
                this.dataSourceIsDB = false;
                this.getEduDataList(val.data.dbId);
                break;
              case 3:
                this.dataSourceIsDB = false;
                this.getMongoDbDataById(val.data.dbId);
                break;
            }
            this.changeColorTheme(); // 加载颜色主题和图表
          }
        } else {
          LogHelper.log('data-analysis sql-create-table', 'sql-create-table getChartInfo()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis sql-create-table', 'sql-create-table getChartInfo()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 加载图表
   * @param data 数据option
   */
  public loadChart(data): void {
    this.isDisplay = false;
    setTimeout(() => {
      this.chart.dispose();
      this.chart = echarts.init(document.getElementById('divChart'), this.currentThemesJson ?
        JSON.parse(this.currentThemesJson) : 'dark'); // 初始化echarts实例
      this.chart.setOption(data, true);
    }, 100);
  }

  /**
   * 运行SQL语句获取数据
   */
  public operation(): void {
    this.wsSer.getDataBySql(this.dataOptionParam.sqlInfo, this.dataOptionParam.dbId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.isBtnDisplay = true;
          this.isDisplay = true;
          this.rightIsDisplay = false;
          this.currType = '';
          const fields = val.data;
          const keyArr = [];

          if (fields.length) {
            for (const key in fields[0]) {
              if (fields[0].hasOwnProperty(key)) {
                keyArr.push(key);
              }
            }
            this.dbTableData.key = keyArr;
            this.dbTableData.data = fields;
          } else {
            this.isBtnDisplay = false;
            this.dbTableData.key = [];
            this.dbTableData.data = [];
          }
          this.dataOptionParam.params = [];
        } else {
          this.tooltipService.showMsg('请检查sql语句');
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis sql-create-table', 'sql-create-table operation()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 获取所有连接实例下的数据库列表
   */
  public getDBList(): void {
    this.dataDeploySer.getDBList().subscribe({
      next: (val) => {
        if (val.code === 0) {
          if (val.data) {
            this.dataBases = val.data;
            this.route.queryParams.subscribe(params => {
              this.chartId = params['chartId'] === undefined ? '' : params['chartId'];
              const type = params['chartType'] === undefined ? '' : params['chartType'];
              this.dataOptionParam.category = parseInt(type, 0);
              if (this.chartId !== '' && this.chartId !== null) {
                this.getChartInfo();
              } else {
                this.dataOptionParam.dbId = this.dataBases[0].dbId;
                this.dataSourceIsDB = this.dataBases[0].isDB === 1 ? true : false;
                this.currDataSourceType = this.dataBases[0].isDB;
                switch (this.dataBases[0].isDB) {
                  case 0:
                    this.getExcelTableList(this.dataBases[0].dbId);
                    break;
                  case 2:
                    this.getEduDataList(this.dataBases[0].dbId);
                    break;
                  case 3:
                    this.getMongoDbDataById(this.dataBases[0].dbId);
                    break;
                }
              }
            });
          }
        } else {
          LogHelper.log('data-analysis sql-create-table', 'sql-create-table getDBList()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis sql-create-table', 'sql-create-table getDBList()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 切换数据源
   * @param dataSourceId 数据源主键标识
   */
  public changeDataSource(dataSourceId: string): void {
    this.isEditChangeSource = true;
    const dbInfo = this.dataBases.filter(d => d.dbId === dataSourceId);
    this.dataSourceIsDB = dbInfo[0].isDB === 1 ? true : false;
    this.currDataSourceType = dbInfo[0].isDB;
    this.dbTableData.key = [];
    this.dbTableData.data = [];
    switch (dbInfo[0].isDB) {
      case 0:
        this.getExcelTableList(dataSourceId);
        break;
      case 1:
        this.dataOptionParam.sqlInfo = '';
        this.rightIsDisplay = false;
        this.isBtnDisplay = false;
        this.chart.dispose();
        break;
      case 2:
        this.getEduDataList(dataSourceId);
        break;
      case 3:
        this.getMongoDbDataById(dataSourceId);
        break;
    }
  }

  /**
   * 获取数据表
   * @param dbId 数据库主键
   */
  public getExcelTableList(dbId: string): void {
    this.selectedDbId = dbId;
    this.dataDeploySer.getTableListById(dbId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          const dbTables = val.data as DataTable.DataTableView[];
          this.dbTables = dbTables.filter(d => d.isDisplay === true);
          if (this.chartId === '') {
            if (this.dbTables.length) {
              this.loadExcelData(this.dbTables[0]);
            }
          } else {
            if (this.isEditChangeSource) {
              if (this.dbTables.length) {
                this.loadExcelData(this.dbTables[0]);
              }
            }
          }
        } else {
          LogHelper.log('data-analysis sql-create-table', 'sql-create-table getExcelTableList()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.log('data-analysis sql-create-table', 'sql-create-table getExcelTableList()info,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 获取数据表(教育)
   * @param id 主键
   */
  public getEduDataList(id: string): void {
    this.selectedDbId = id;
    this.eduSer.getEduDataList(id).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.dbEduTables = val.data as EduTable.DataTableView[];
          if (this.chartId === '') {
            if (this.dbEduTables.length) {
              this.loadEduDataBySql(this.dbEduTables[0]);
            }
          } else {
            if (this.isEditChangeSource) {
              if (this.dbEduTables.length) {
                this.loadEduDataBySql(this.dbEduTables[0]);
              }
            }
          }
        } else {
          LogHelper.log('data-analysis sql-create-table', 'sql-create-table getEduDataList()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.log('data-analysis sql-create-table', 'sql-create-table getEduDataList()info,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 根据DBId获取当前库表的列表（mongoDB模板的列表）
   * @param id 主键
   */
  public getMongoDbDataById(id: string): void {
    this.selectedDbId = id;
    this.formService.getMongoDbDataById(id).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.formTables = val.data as DataTable.DataTableView[];
          if (this.chartId === '') {
            if (this.formTables.length) {
              this.getTemplateData(this.formTables[0]);
            }
          } else {
            if (this.isEditChangeSource) {
              if (this.formTables.length) {
                this.getTemplateData(this.formTables[0]);
              }
            }
          }
        } else {
          LogHelper.log('data-analysis sql-create-table', 'sql-create-table getMongoDbDataById()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.log('data-analysis sql-create-table', 'sql-create-table getMongoDbDataById()info,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 获取模板的数据
   * @param table 工作表实体
   */
  public getTemplateData(table: DataTable.DataTableView): void {
    this.currTableId = table.tableId;
    this.currTableName = table.tableName;
    this.formService.getTemplateData(table.tableName).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.loadTable(val.data);
          this.dataOptionParam.params = [];
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis sql-create-table', 'sql-create-table getTemplateData()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 切换表获取数据(教育)
   * @param table 工作表实体
   */
  public loadEduDataBySql(table: EduTable.DataTableView): void {
    this.currTableId = table.id;
    this.dataOptionParam.sqlInfo = table.databaseSql;
    this.eduSer.getEduDataBySql(table.databaseSql).subscribe({
      next: (result) => {
        if (result.code === 0) {
          this.loadTable(result.data);
          this.dataOptionParam.params = [];
        } else {
          this.tooltipService.showMsg('请检查sql语句');
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis sql-create-table', 'sql-create-table loadEduDataBySql()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 切换excel表获取数据
   * @param table excel工作表实体
   */
  public loadExcelData(table: DataTable.DataTableView): void {
    this.currTableId = table.tableId;
    this.wsSer.getSheetTableData(table.tableId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.loadTable(val.data);
          this.dataOptionParam.params = [];
        } else {
          this.tooltipService.showMsg('请检查sql语句');
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis sql-create-table', 'sql-create-table loadExcelData()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 提取的加载表格数据方法
   * @param data 接口返回字段和数据值
   */
  public loadTable(data): void {
    if (data !== null) {
      this.isBtnDisplay = true;
      this.isDisplay = true;
      this.rightIsDisplay = false;
      this.currType = '';
      const fields = data;
      const keyArr = [];
      for (const key in fields[0]) {
        if (fields[0].hasOwnProperty(key)) {
          keyArr.push(key);
        }
      }
      this.dbTableData.key = keyArr;
      this.dbTableData.data = fields;
    } else {
      this.dbTableData.key = [];
      this.dbTableData.data = [];
    }
  }

  /**
   * 获取图形类型
   */
  public getChartTypes(): void {
    this.wsSer.getChartTypes().subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.chartTypes = val.data;
          this.comboChartTypes = this.chartTypes.filter(t => t.combinationType === 1 &&
            (t.iconName === 'line' || t.iconName === 'bar' || t.iconName === 'curve' || t.iconName === 'scatter'));
        } else {
          LogHelper.log('data-analysis sql-create-table', 'sql-create-table getChartTypes()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis sql-create-table', 'sql-create-table getChartTypes()error,原因:' + JSON.stringify(err));
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
          this.colorThemeId = this.colorThemes[0].themeId; // 设置颜色主题默认值
        } else {
          LogHelper.log('data-analysis sql-create-table', 'sql-create-table getColorThemes()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis sql-create-table', 'sql-create-table getColorThemes()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 切换图表类型
   * @param item 图表类型实体
   */
  public changeChartType(item: Chart.ChartType): void {
    this.dataOptionParam.chartType = item.code;
    this.currAxisType = item.axisType;
    this.currCombinationType = item.combinationType;
    this.currType = item.code;
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
    for (const key in this.comboFields) {
      if (this.comboFields.hasOwnProperty(key)) {
        this.comboFields[key].chartType = chartCode;
        this.comboFields[key].iconName = item.iconName;
      }
    }
    for (const key in this.dataOptionParam.params) {
      if (this.dataOptionParam.params.hasOwnProperty(key)) {
        this.dataOptionParam.params[key].chartType = chartCode;
      }
    }
    this.dataOptionParam.option = null;
    this.getChartDataBySql();
  }

  /**
   * 提取的方法(获取图表option)
   */
  private getChartDataBySql(): void {
    this.wsSer.getChartDataBySql(this.dataOptionParam).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.rightIsDisplay = true;
          this.dataOption = val.data;
          this.dataOptionParam.option = val.data;
          this.isChangeData = true;
          this.loadChart(val.data);
        } else {
          if (val.message !== null) {
            LogHelper.log('data-analysis sql-create-table', 'sql-create-table getChartDataBySql()info,原因:' + val.message);
          } else {
            this.tooltipService.showMsg('不支持该图表类型');
          }
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis sql-create-table', 'sql-create-table getChartDataBySql()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 切换颜色
   * @param colorTheme 颜色主题实体
   */
  public changeColorTheme(): void {
    this.tcService.getColorThemeInfoById(this.colorThemeId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          if (this.currentThemesJson) {
            this.isChangeData = true;
          }
          this.currentThemesJson = val.data.themeJson;
          this.rightIsDisplay = true;
          this.isBtnDisplay = true;
          this.loadChart(this.dataOption);
        } else {
          this.tooltipService.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis sql-create-table', 'sql-create-table changeColorTheme()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 切换图表标签是否显示
   */
  public changeTitleState(): void {
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
  public changeAutoState(type: string): void {
    if (type === 'min') {
      if (this.minIsAuto) {
        this.dataOption.yAxis.min = null;
      } else {
        this.dataOption.yAxis.min = this.dataOptionParam.min;
      }
      if (this.dataOption.yAxis.min !== undefined) {
        this.loadChart(this.dataOption);
      }
    } else {
      if (this.maxIsAuto) {
        this.dataOption.yAxis.max = null;
      } else {
        this.dataOption.yAxis.max = this.dataOptionParam.max;
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
  public changeValue(e, type: string): void {
    if (e.keyCode === 13) {
      if (type === 'min') {
        if (this.dataOption) {
          this.dataOption.yAxis.min = this.dataOptionParam.min;
        }
      } else {
        if (this.dataOption) {
          this.dataOption.yAxis.max = this.dataOptionParam.max;
        }
      }
      this.loadChart(this.dataOption);
    }
  }

  /**
   * 设置单位
   */
  public setUnit(): void {
    this.dataOptionParam.option = null;
    this.getChartDataBySql();
  }

  /**
   * 组合方式，展示图表
   */
  public showChartTypeIconBox(index, event) {
    this.top = $(event.target).offset().top + 30;
    this.left = $(event.target).offset().left;
    this.isShowChartTypeIconBox = true;
    this.currFieldIndex = index;
  }

  /**
   * 修改组合字段展示图形类型
   * @param item 组合字段实体
   */
  public changeComboChartType(item: Chart.ChartType): void {
    const index = this.dataOptionParam.params.findIndex(t => t.fieldName === this.comboFields[this.currFieldIndex].fieldName);
    this.dataOptionParam.params[index].chartType = item.code;
    this.comboFields[this.currFieldIndex].chartType = item.code;
    this.comboFields[this.currFieldIndex].iconName = item.iconName;
    this.getChartDataBySql();
  }

  /**
   * 打开弹框(生成图表)
   */
  public openDialog(): void {
    const dialogRef = this.dialog.open(DataVisualizeDialogComponent, {
      width: '650px',
      height: '500px',
      minWidth: '650px',
      minHeight: '500px',
      disableClose: true,
      data: {
        dbId: this.dataOptionParam.dbId, sqlStr: this.dataOptionParam.sqlInfo, fieldNames: this.dbTableData.key,
        params: this.dataOptionParam.params, chartType: this.currType, currDataSourceType: this.currDataSourceType,
        tableId: this.currTableId, tableName: this.currTableName
      }
    });
    dialogRef.afterClosed().subscribe((d) => {
      if (d !== undefined) {
        const param = d.dataOptionParam as DataOption.SqlData;
        this.dataOptionParam = param;
        this.dataOptionParam.unitName = 1;
        this.currType = this.dataOptionParam.chartType;
        const chartTypeItem = this.chartTypes.filter(t => t.code == this.dataOptionParam.chartType);
        this.currAxisType = chartTypeItem[0].axisType;
        this.currCombinationType = chartTypeItem[0].combinationType;
        let chartCode;
        if (chartTypeItem[0].iconName.indexOf('line') !== -1) {
          chartCode = this.comboCharts.line;
        } else if (chartTypeItem[0].iconName.indexOf('bar') !== -1) {
          chartCode = this.comboCharts.bar;
        } else if (chartTypeItem[0].iconName.indexOf('curve') !== -1) {
          chartCode = this.comboCharts.curve;
        } else if (chartTypeItem[0].iconName.indexOf('scatter') !== -1) {
          chartCode = this.comboCharts.scatter;
        }
        for (const key in this.dataOptionParam.params) {
          if (this.dataOptionParam.params.hasOwnProperty(key)) {
            this.dataOptionParam.params[key].chartType = chartCode;
          }
        }
        this.comboFields = this.dataOptionParam.params.filter(t => t.isMeasure === true);
        for (const key in this.comboFields) {
          if (this.comboFields.hasOwnProperty(key)) {
            this.comboFields[key].iconName = chartTypeItem[0].iconName;
          }
        }
      }
    });
  }

  /**
   * 保存打开弹框
   */
  public saveOpenDialog(): void {
    const dialogRef = this.dialog.open(SaveDialogComponent, {
      width: '400px',
      height: '200px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((d) => {
      if (d !== undefined) {
        this.dataOptionParam.parentId = d.chartFolderId;
        this.dataOptionParam.chartName = d.chartName;
        if (Utils.strIsEmptyOrNull(this.dataOptionParam.chartName)) {
          this.tooltipService.showMsg('图表名称不能为空');
          return;
        }
        if (this.tooltipService.checkFormat(this.dataOptionParam.chartName)) {
          this.save();
        }
      }
    });
  }

  /**
   * 另存为打开弹框
   */
  public saveASOpenDialog(): void {
    const dialogRef = this.dialog.open(SaveDialogComponent, {
      width: '400px',
      height: '200px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((d) => {
      if (d !== undefined) {
        this.dataOptionParam.parentId = d.chartFolderId;
        if (Utils.strIsEmptyOrNull(this.dataOptionParam.chartName)) {
          this.tooltipService.showMsg('图表名称不能为空');
          return;
        }
        if (this.tooltipService.checkFormat(this.dataOptionParam.chartName)) {
          this.saveAs();
        }
      }
    });
  }

  /**
   * 另存为
   */
  public saveAs(): void {
    this.saveChartInfo();
  }

  /**
   * 新建/编辑的保存
   */
  public save(): void {
    if (this.chartId !== '') {
      this.dataOptionParam.chartId = this.chartId; // 编辑
    }
    this.saveChartInfo();
  }

  /**
   * 保存图表-调用后台接口
   */
  public saveChartInfo(): void {
    this.dataOptionParam.colorThemeId = this.colorThemeId;
    this.dataOptionParam.thumb = this.chart.getDataURL();
    this.dataOptionParam.option = this.dataOption;
    this.dataOptionParam.category = this.currDataSourceType;
    this.dataOptionParam.tableId = this.currTableId;
    this.wsSer.saveChartInfo(this.dataOptionParam).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.tooltipService.showMsg('保存成功');
          this.isChangeData = false;
        } else {
          this.tooltipService.showMsg('保存失败');
        }
      },
      error: (err) => {
        LogHelper.error('data-analysis sql-create-table', 'sql-create-table saveChartInfo()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 全屏
   * @param type 类型
   */
  public fullscreen(type: string): void {
    if (type === 'sql') {
      this.sqlIsFullscreen = !this.sqlIsFullscreen;
    } else if (type === 'table') {
      this.tableIsFullscreen = !this.tableIsFullscreen;
      if (this.rightIsDisplay) {
        setTimeout(() => {
          this.chart.resize();
        }, 200);
      }
    }
  }
}
