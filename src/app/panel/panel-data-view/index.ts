import { ChartMethodService } from './../../services/panel/chartMethod.service';
import { MessageCodeEnum } from './../../common/messageCodeEnum';
import { EventPubSub } from './../../common/eventPubSub';
import { Component, OnInit, EventEmitter, AfterViewInit, OnDestroy, Output, enableProdMode } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import * as $ from 'jquery';
import { PanelDataViewDialogComponent } from '../panel-data-view-dialog/index';
import { Panel } from '../../domain/panel';
import { ScreenLayout } from '../../domain/screenConfig/screenLayout';
import { Scene } from '../../domain/scene/scene';
import { CommonMethodService } from '../../services/scene/commonMethod.service';
import { DataMethodService } from '../../services/scene/dataMethod.service';
import { PanelMethodService } from '../../services/panel/panelMethod.service';
import { PanelSourceService } from '../../services/panel/panelSource.service';
import { DragDataParam } from '../../domain/scene/dragDataParam';
import { Utils } from '../../utils/utils';
import { AppSettingService } from '../../services/appsetting.service';
import { LogHelper } from '../../common/LogHelper';
declare var echarts;
declare var dark;
enableProdMode();

@Component({
  selector: 'app-panel-data-view',
  templateUrl: './panel-data-view.component.html',
  styleUrls: ['../../../assets/css/scene-panel-common.scss', './panel-data-view.component.scss']
})
export class PanelDataViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() emitter = new EventEmitter<number>();
  public layout: ScreenLayout.LayoutModel = new ScreenLayout.LayoutModel(); // 布局实体信息
  public screenId: string; // 大屏主键标识
  private rows: number; // 网格总行
  private cols: number; // 网格总列
  public dataSources: Scene.DataSourceItem[] = []; // 要添加到窗口的数据源
  public newChart: Scene.Chart = new Scene.Chart(); // echart图表
  public savePanelItems: Panel.PanelSave = new Panel.PanelSave(); // 保存看板数据
  public positionX: number;
  public positionY: number;  // 布局窗口坐标
  public itemDatas: Panel.LayoutItem[] = []; // 保存看板窗口数据
  public panelId = ''; // 当前看板主键标识
  public itemId: string; // 当前窗口主键标识
  public isReplace = false; // 标识是否是替换当前已有数据窗口里的数据
  public isFullscreen = false;
  public isDataChange = 0; // 判断数据是否被改变
  public panelFolderId: string; // 看板文件夹id
  private defaultCell = 4; // 默认窗口占的单元格数
  public realCell: number;
  public key = 0; // 标识画默认大小还是单元大小的窗口
  private $gridsterBox; // gridsterBox的dom容器
  constructor(private snackBar: MatSnackBar, private cmSer: CommonMethodService, private psSer: PanelSourceService,
    private dialog: MatDialog, public pmSer: PanelMethodService, private dmSer: DataMethodService,
    private chartService: ChartMethodService, private appSer: AppSettingService) {
    this.rows = 20 * 2; // 绘制的网格行数
    this.cols = 20; // 绘制的网格列数
    this.subscribe();
  }

  ngOnInit() {
    this.getLastPanel();
  }

  ngAfterViewInit() {
    const currThis = this;
    this.$gridsterBox = $('#gridsterBox-layout');
    this.resizeGrid(true, false, false);
    $(window).on('resize.panelMethod',
      Utils.lodash.throttle(() => {
        this.resizeGrid(false, false, false);
        this.pmSer.resizeItem();
      }, Utils.throttleWaitTime)
    );

    $(document).on('keydown.panelDataView', function (event) {
      if (currThis.isFullscreen) {
        if (event && event.keyCode === 27) { // esc
          currThis.fullScreen();
        }
      }
    });
  }

  /**
   * 生成布局
   * @param isInit 初始化
   * @param resizable 是否支持改变大小
   * @param draggable 是否支持拖动
   */
  public resizeGrid(isInit: boolean, resizable: boolean, draggable: boolean) {
    if (isInit) { this.layout.dashboard = []; }
    let boxWidth = parseInt(this.$gridsterBox.css('width'), 0) - 24;
    let boxHeight = parseInt(this.$gridsterBox.css('height'), 0);
    boxWidth -= 2;
    boxHeight -= 2;
    this.layout.options = this.cmSer.gridsterInit(this.rows, this.cols, resizable, draggable,
      boxWidth, boxHeight, 'panel', this.itemChange);
  }

  // 自适应
  public itemChange(item) {
    EventPubSub.instance.publish(MessageCodeEnum.isChange, item.id);
  }

  /**
   * 订阅页面间交互信息
   */
  public subscribe() {
    EventPubSub.instance.subscribeEx(MessageCodeEnum.changePanel, this.changePanel, this); // 订阅切换看板
    EventPubSub.instance.subscribeEx(MessageCodeEnum.dragToPanel, this.getDragInLayout, this);  // 订阅拖拽数据
    EventPubSub.instance.subscribeEx(MessageCodeEnum.deletePanel, this.afterDelete, this); // 订阅删除看板后默认展示看板
    EventPubSub.instance.subscribeEx(MessageCodeEnum.isChange, this.isChangeData, this); // 订阅看板元素是否拖拽
    EventPubSub.instance.subscribeEx(MessageCodeEnum.afterSave, this.afterSave, this); // 订阅保存看板后设置布局窗口为不可拖拽
  }

  ngOnDestroy(): void {
    EventPubSub.instance.unsubscribe(MessageCodeEnum.changePanel, this.changePanel);
    EventPubSub.instance.unsubscribe(MessageCodeEnum.dragToPanel, this.getDragInLayout);
    EventPubSub.instance.unsubscribe(MessageCodeEnum.deletePanel, this.afterDelete);
    EventPubSub.instance.unsubscribe(MessageCodeEnum.isChange, this.isChangeData);
    EventPubSub.instance.unsubscribe(MessageCodeEnum.afterSave, this.afterSave);
    $(window).off('resize.panelMethod');
    $(document).off('keydown.panelDataView');
  }

  // 看板中的数据项位置信息改变
  public isChangeData(itemId: any, params: any) {
    const _selfThis = params[0];
    setTimeout(() => {
      _selfThis.updateSiteInfo(itemId);
      _selfThis.isDataChange++;
      _selfThis.emitter.emit(_selfThis.isDataChange);
      _selfThis.pmSer.resizeItem();
    }, 100);
  }

  public afterSave(str: string, params: any) {
    const _selfThis = params[0];
    _selfThis.resizeGrid(false, false, false);
  }

  // 更新看板中数据项的位置信息
  public updateSiteInfo(itemId) {
    for (let i = 0; i < this.savePanelItems.itemData.length; i++) {
      let isChangeSize = true;
      this.layout.dashboard.forEach(elements => {
        if (this.savePanelItems.itemData[i].itemId === elements.id) {
          if (elements.id === itemId &&
            this.savePanelItems.itemData[i].sizeCol === elements.cols &&
            this.savePanelItems.itemData[i].sizeRow === elements.rows) {
            isChangeSize = false;
          }
          this.savePanelItems.itemData[i].sizeCol = elements.cols;
          this.savePanelItems.itemData[i].sizeRow = elements.rows;
          this.savePanelItems.itemData[i].positionX = elements.x;
          this.savePanelItems.itemData[i].positionY = elements.y;
        }
      });
      if (this.savePanelItems.itemData[i].itemId === itemId && isChangeSize) {
        const layoutStr = '' + this.savePanelItems.itemData[i].sizeCol + '*' +
          this.savePanelItems.itemData[i].sizeRow + '';
        this.newChart.id = 'panelItem' + this.savePanelItems.itemData[i].itemId;
        this.newChart.obj = echarts.init(document.getElementsByClassName(this.newChart.id)[0], 'dark');
        const chartIndex = this.pmSer.chartObj.findIndex(d => d.id === 'panelItem' + this.savePanelItems.itemData[i].itemId);
        this.pmSer.loadData(this.savePanelItems.itemData[i].dataSourceType, this.newChart,
          this.savePanelItems.itemData[i].option, 'panel', layoutStr, chartIndex, true);
      }
    }
  }

  public fullScreen() {
    this.isFullscreen = !this.isFullscreen;
    setTimeout(() => {
      this.resizeGrid(false, false, false);
      this.pmSer.resizeItem();
    }, 500);
  }

  // 将展示部分导出为PDF
  public exportPDF() {
    this.pmSer.exportPDF(this.pmSer.panelName);
  }

  /**
   * 删除当前展示数据后，设置默认显示看板
   * @param str
   * @param params 当前this
   */
  public afterDelete(str: any, params: any) {
    const _selfThis = params[0];
    _selfThis.getLastPanel();
  }

  public getLastPanel() {
    this.pmSer.display = false;
    this.psSer.getLatestPanel().subscribe({
      next: (val) => {
        if (val.code === 0) {
          if (val.data.itemData === null) {
            this.pmSer.flag = true;
            this.panelId = '';
            this.savePanelItems.itemData = [];
            this.itemDatas = [];
            this.layout.dashboard = [];
            this.pmSer.panelName = '';
          } else {
            this.pmSer.flag = false;
            this.savePanelItems = val.data as Panel.PanelSave;
            this.pmSer.panelName = this.savePanelItems.dashBoardName;
            this.itemDatas = this.savePanelItems.itemData; // 获取看板已有的元素集
            this.panelId = this.savePanelItems.dashBoardId;
            this.loadLayout();
            setTimeout(() => {
              this.loadPanelData();
            }, 100);
          }
        } else {
          LogHelper.log('panel panel-data-view', 'panel-data-view getLastPanel()info,原因:' + val.message);
        }
        const param = { parentId: this.savePanelItems.parentId, id: this.panelId };
        EventPubSub.instance.publish(MessageCodeEnum.hightLight, param);
      },
      error: (err) => {
        LogHelper.error('panel panel-data-view', 'panel-data-view getLastPanel()error,原因:' + JSON.stringify(err));
      }
    });
  }

  public editPanel() {
    this.pmSer.display = true;
    this.resizeGrid(false, true, true);
    EventPubSub.instance.publish(MessageCodeEnum.editPanel, '');
  }

  /**
   * 切换看板
   * @param panelInfo 当前点击看板
   * @param params 当前this
   */
  public changePanel(panelInfo: any, params: any) {
    const _selfThis = params[0];
    if (panelInfo.dashBoardId !== _selfThis.savePanelItems.dashBoardId) {
      if (_selfThis.isDataChange !== 0) {
        const isExit = window.confirm('您当前操作未保存，是否离开此页面？');
        if (isExit) {
          _selfThis.switchPanel(panelInfo);
          _selfThis.resizeGrid(false, false, false);
          _selfThis.isDataChange = 0;
          _selfThis.emitter.emit(_selfThis.isDataChange);
        }
      } else { // 没有编辑的切换
        _selfThis.switchPanel(panelInfo);
        _selfThis.isDataChange = 0;
        _selfThis.emitter.emit(_selfThis.isDataChange);
      }
    }
  }

  // 新建仪表盘
  public createPanel() {
    this.resizeGrid(false, true, true);
    this.pmSer.flag = false;
    this.pmSer.display = true;
    EventPubSub.instance.publish(MessageCodeEnum.editPanel, '');
    EventPubSub.instance.publish(MessageCodeEnum.newPanel, '');
    this.addPanel();
  }

  /**
   * @param panelInfo 要切换的看板信息
   */
  public switchPanel(panelInfo: any) {
    this.pmSer.panelName = panelInfo.dashBoardName;
    this.pmSer.display = false;
    this.panelId = panelInfo.dashBoardId;
    this.getPanelDetail(this.panelId); // 获取单条看板信息
  }

  // 刷新
  public refresh() {
    this.getPanelDetail(this.panelId);
  }

  /**
   * 获取单条看板的详细信息
   * @param panelId 看板主键标识
   */
  public getPanelDetail(panelId: string) {
    this.psSer.getPanelDetail(panelId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.savePanelItems = val.data as Panel.PanelSave;
          this.itemDatas = this.savePanelItems.itemData; // 获取看板已有的元素集
          this.loadLayout();
          setTimeout(() => {
            this.loadPanelData();
          }, 100);
        } else {
          LogHelper.log('panel panel-data-view', 'panel-data-view getPanelDetail()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('panel panel-data-view', 'panel-data-view getPanelDetail()error,原因:' + JSON.stringify(err));
      }
    });
  }

  // 加载看板中的布局窗口
  public loadLayout() {
    this.layout.dashboard = [];
    const itemDatas = this.savePanelItems.itemData;
    for (const key in itemDatas) {
      if (itemDatas.hasOwnProperty(key)) {
        this.layout.dashboard.push({
          cols: itemDatas[key].sizeCol, rows: itemDatas[key].sizeRow, x: itemDatas[key].positionX,
          y: itemDatas[key].positionY, id: itemDatas[key].itemId
        });
      }
    }
    this.resizeGrid(false, false, false);
  }

  // 加载数据项
  public loadPanelData() {
    let i = 0;
    for (const key in this.savePanelItems.itemData) {
      if (this.savePanelItems.itemData.hasOwnProperty(key)) {
        this.newChart.id = 'panelItem' + this.savePanelItems.itemData[key].itemId;
        this.newChart.obj = echarts.init(document.getElementsByClassName(this.newChart.id)[0], 'dark');
        const layoutStr = '' + this.savePanelItems.itemData[key].sizeCol + '*' +
          this.savePanelItems.itemData[key].sizeRow + '';
        this.pmSer.loadData(this.savePanelItems.itemData[key].dataSourceType, this.newChart,
          this.savePanelItems.itemData[key].option, 'panel', layoutStr, i);
        i++;
      }
    }
  }

  /**
   * 保存仪表盘
   * @param isSwitch 标识是否是编辑未保存切换
   */
  public saveAddItemToPanel(isSwitch?: boolean, panelInfo?: any) {
    const width = '480px';
    const height = '230px';
    const dialogRef = this.dialog.open(PanelDataViewDialogComponent, {
      width: width,
      height: height,
      minWidth: width,
      minHeight: height,
      disableClose: true,
      data: {
        panelId: this.panelId
      }
    });
    dialogRef.afterClosed().subscribe((d) => {
      if (d.isAdd) { // 点击确定
        // 切换页面，加载左侧仪表盘列表
        this.pmSer.display = true;
        this.pmSer.panelName = d.panelName;
        this.panelId = d.datas;
        this.panelFolderId = d.parentId;
        this.cmSer.saveImg($('#panel-container')).subscribe({ // 生成缩略图
          next: (url) => {
            this.savePanelItems.thumb = url;
            setTimeout(() => {
              this.saveDatas();
              setTimeout(() => {
                if (isSwitch) {
                  this.switchPanel(panelInfo);
                }
              }, 0);
            }, 0);
          }
        });
      } else {
        this.switchPanel(panelInfo);
      }
      this.isDataChange = 0;
      this.emitter.emit(this.isDataChange);
    });
  }

  public saveDatas() {
    // 将当前dashboard的数据更新到传给后台的对象中
    for (let i = 0; i < this.savePanelItems.itemData.length; i++) {
      this.layout.dashboard.forEach(elements => {
        if (elements.id === this.savePanelItems.itemData[i].itemId) {
          this.savePanelItems.itemData[i].positionX = elements.x;
          this.savePanelItems.itemData[i].positionY = elements.y;
          this.savePanelItems.itemData[i].sizeCol = elements.cols;
          this.savePanelItems.itemData[i].sizeRow = elements.rows;
        }
      });
    }
    this.savePanelItems.dashBoardId = this.panelId;
    this.savePanelItems.itemData = this.itemDatas;
    this.savePanelItems.dashBoardName = this.pmSer.panelName;
    this.savePanelItems.parentId = this.panelFolderId;
    this.pmSer.saveAddItemToPanel(this.savePanelItems);
  }

  // 取消编辑，回到未更改时的预览状态
  public cancel() {
    this.pmSer.display = false;
    if (this.panelId === '') { // 新建时
      this.pmSer.display = true;
      this.layout.dashboard = [];
      this.savePanelItems.itemData = [];
      this.itemDatas = [];
    } else { // 编辑时
      this.getPanelDetail(this.panelId);
      this.resizeGrid(false, false, false);
    }
    this.isDataChange = 0; // 取消后不再提示切换保存
    this.emitter.emit(this.isDataChange);
  }

  /**
   * 订阅新建看板
   * @param panel
   * @param params
   */
  public addPanel() {
    this.itemDatas = [];
    // 重置数据
    this.pmSer.display = true;
    this.pmSer.panelName = '';
    this.panelId = '';
    this.layout.dashboard = [];
    this.savePanelItems.dashBoardId = '';
    this.savePanelItems.itemData = [];
    this.pmSer.chartObj = [];
  }

  /**
   * 删除窗口数据项（此时只删除页面上的数据）
   * @param itemId 窗口主键标识
   */
  public removeDataSource(itemId: string) {
    const layoutId = this.layout.dashboard.findIndex(d => d.id === itemId);
    const itemIndex = this.savePanelItems.itemData.findIndex(d => d.itemId === itemId);
    this.disposeChart(itemId);
    this.savePanelItems.itemData.splice(itemIndex, 1);
    this.layout.dashboard.splice(layoutId, 1);
    if (this.savePanelItems.itemData.length) {
      this.isDataChange++;
      this.emitter.emit(this.isDataChange);
    } else if (this.panelId === '' && this.savePanelItems.itemData.length === 0) {
      this.isDataChange = 0;
      this.emitter.emit(this.isDataChange);
    }
  }

  // dispose掉已有的echart
  public disposeChart(itemId: string) {
    this.newChart.id = 'panelItem' + itemId;
    this.newChart.obj = echarts.init(document.getElementsByClassName(this.newChart.id)[0]);
    EventPubSub.instance.publish(MessageCodeEnum.removeChart, this.newChart.id);
    this.newChart.obj.dispose();
  }

  /**
   * 拖拽数据之后的回调（先生成布局窗口，再加载传过来的数据）
   * @param d 拖拽数据主键
   * @param params 当前this指针
   */
  private getDragInLayout(d: any, params: any): void {
    const _selfThis = params[0];
    _selfThis.openTitle = 'dataView';
    _selfThis.newChart = [];
    if (d !== '') {
      let param: DragDataParam = new DragDataParam();
      param = _selfThis.dmSer.dragParam; // 获取拖拽数据传过来的参数
      const currDt = _selfThis.chartService.dataSource.filter(t => {
        return t.chartId === param.dataSourceId;
      });
      _selfThis.computeDragLocation(); // 判断计算拖拽位置并生成布局窗口
      // 保存看板数据
      const itemData: Panel.LayoutItem = new Panel.LayoutItem();
      itemData.itemId = _selfThis.itemId;
      itemData.dataSourceId = currDt[0].chartId;
      const dashboard = _selfThis.layout.dashboard.filter(t => t.id === _selfThis.itemId);
      itemData.positionX = dashboard[0].x;
      itemData.positionY = dashboard[0].y;
      itemData.sizeCol = dashboard[0].cols;
      itemData.sizeRow = dashboard[0].rows;
      itemData.option = currDt[0].option;
      itemData.dataSourceType = currDt[0].dataSourceType;
      if (_selfThis.isReplace) {  // 将原有数据先移除
        const index = _selfThis.itemDatas.findIndex(i => i.itemId === _selfThis.itemId);
        _selfThis.disposeChart(_selfThis.itemId);
        _selfThis.itemDatas.splice(index, 1);
        _selfThis.isReplace = false;
      }
      _selfThis.itemDatas.push(itemData);
      _selfThis.savePanelItems.itemData = _selfThis.itemDatas;
      _selfThis.savePanelItems.dashBoardId = _selfThis.panelId;
      setTimeout(() => {  // 渲染数据
        _selfThis.newChart.id = 'panelItem' + _selfThis.itemId;
        _selfThis.newChart.obj = echarts.init(document.getElementsByClassName(_selfThis.newChart.id)[0], 'dark');
        const layoutStr = '' + dashboard[0].cols + '*' + dashboard[0].rows + '';
        const chartIndex = _selfThis.pmSer.chartObj.findIndex(t => t.id === _selfThis.newChart.id);
        _selfThis.pmSer.loadData(currDt[0].dataSourceType, _selfThis.newChart, currDt[0].option, 'panel', layoutStr, chartIndex);
        _selfThis.isDataChange++;
        _selfThis.emitter.emit(_selfThis.isDataChange);
      }, 500);
    }
  }

  // 判断计算拖拽位置并生成布局窗口
  private computeDragLocation() {
    // 画布的宽和高
    const width = parseInt(this.$gridsterBox.css('width'), 0) - 24;
    // 计算坐标
    const dragX = this.dmSer.dragParam.dragLeft / (width / this.cols);
    const dragY = (this.dmSer.dragParam.dragTop + $('.gridster').scrollTop()) / (width / this.cols);
    this.positionX = Math.trunc(dragX); // 返回整数部分
    this.positionY = Math.trunc(dragY);

    let i = 0; // 用来判断是否拖拽到已有布局窗口的位置
    this.layout.dashboard.forEach(elem => {
      // 拖拽到已有窗口的位置(拖拽到已有窗口的位置)
      if ((dragX >= elem.x && dragX <= elem.x + elem.cols)
        && (dragY >= elem.y && dragY <= elem.y + elem.rows)) {
        i++;
      }
    });
    if (i === 0) { // 该窗口的位置（拖拽到没有窗口的位置）
      const x0 = this.positionX;
      const x1 = this.positionX + this.defaultCell;
      const y0 = this.positionY;
      const y1 = this.positionY + this.defaultCell;
      this.recursionFun(x0, x1, y0, y1);
      this.itemId = Utils.generateUUID();

      this.layout.dashboard.push(
        { cols: this.realCell, rows: this.realCell, x: this.positionX, y: this.positionY, id: this.itemId }
      );

      this.resizeGrid(false, true, true);
    } else {  // 记录当前拖拽到的布局窗口ID
      this.isReplace = true;
      this.layout.dashboard.forEach(element1 => {
        if (this.positionX >= element1.x && this.positionX <= element1.x + element1.cols
          && this.positionY >= element1.y && this.positionY <= element1.y + element1.rows) {
          this.itemId = element1.id;
        }
      });
    }
    this.key = 0;
  }

  public recursionFun(x0: number, x1: number, y0: number, y1: number) {
    if (x1 > this.cols - 1 || y1 > this.rows - 1) { // 判断整体是否超出
      this.key = 1;
    } else { // 判断是否和已有的重复
      for (const key in this.layout.dashboard) {
        if (this.layout.dashboard.hasOwnProperty(key)) {
          const ele = this.layout.dashboard[key];
          if (((x0 > ele.x && x0 < ele.x + ele.cols) && (y0 > ele.y && y0 < ele.y + ele.rows)) ||
            ((x0 > ele.x && x0 < ele.x + ele.cols) && (y1 > ele.y && y1 < ele.y + ele.rows)) ||
            ((x1 > ele.x && x1 < ele.x + ele.cols) && (y0 > ele.y && y0 < ele.y + ele.rows)) ||
            ((x1 > ele.x && x1 < ele.x + ele.cols) && (y1 > ele.y && y1 < ele.y + ele.rows)) ||

            ((ele.x > x0 && ele.x < x1) && (ele.y > y0 && ele.y < y1)) ||
            ((ele.x > x0 && ele.x < x1) && (ele.y + ele.rows > y0 && ele.y + ele.rows < y1)) ||
            ((ele.x + ele.cols > x0 && ele.x + ele.cols < x1) && (ele.y > y0 && ele.y < y1)) ||
            ((ele.x + ele.cols > x0 && ele.x + ele.cols < x1) && (ele.y + ele.rows > y0 && ele.y + ele.rows < y1)) ||

            ((x0 === ele.x && x1 === ele.x + ele.cols) && (y0 > ele.y && y0 < ele.y + ele.rows)) ||
            ((x0 === ele.x && x1 === ele.x + ele.cols) && (y1 > ele.y && y1 < ele.y + ele.rows)) ||
            ((x0 > ele.x && x0 < ele.x + ele.cols) && (y0 === ele.y && y1 === ele.y + ele.rows)) ||
            ((x1 > ele.x && x1 < ele.x + ele.cols) && (y0 === ele.y && y1 === ele.y + ele.rows))) {
            this.key = 2;
            break;
          }
        }
      }
    }
    if (this.key > 0) {
      this.key = 0;
      this.recursionFun(x0, --x1, y0, --y1);
    } else {
      this.realCell = x1 - x0;
    }
  }
}
