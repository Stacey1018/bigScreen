import { DefConfigService } from './../defConfig.service';
import { GridsterConfigS } from 'angular-gridster2/dist/gridsterConfigS.interface';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ScreenTheme } from '../../domain/screenConfig/screenTheme';
import { AppSettingService } from '../appsetting.service';
import { DataTypeEnum } from '../../common/dataTypeEnum';
declare var html2canvas;

@Injectable()
export class CommonMethodService {
  public timer: any = null;  // 图标取数据时间
  public defSer: DefConfigService = new DefConfigService();
  public dataTypeEnum = {
    echarts: DataTypeEnum.Echarts,
    map: DataTypeEnum.Map,
    media: DataTypeEnum.Media,
    text: DataTypeEnum.Text,
    background: DataTypeEnum.Background,
    border: DataTypeEnum.Border,
    chinaMap: DataTypeEnum.ChinaMap,
    worldMap: DataTypeEnum.WorldMap,
    sphericalMap: DataTypeEnum.SphericalMap,
    image: DataTypeEnum.Image,
    pollingImage: DataTypeEnum.PollingImage,
    historyVideo: DataTypeEnum.HistoryVideo,
    realVideo: DataTypeEnum.RealVideo,
    pollingData: DataTypeEnum.PollingData,
    title: DataTypeEnum.Title,
    timer: DataTypeEnum.Timer,
    draw: DataTypeEnum.Draw,
    singleData: DataTypeEnum.singleData,
    multipleData: DataTypeEnum.multipleData,
    scrollTopData: DataTypeEnum.ScrollTopData
  };
  constructor(private appSer: AppSettingService) {
  }
  // 布局相关
  /**
   * 仪表盘,大屏页面调用方法
   */
  public gridsterInit(rows, cols, resizable, draggable, boxWidth: number, boxHeight: number, pageName, itemChange = null): GridsterConfigS {
    const fixedSizeW = (boxWidth / cols); let fixedSizeH;
    if (pageName === 'scene') {
      fixedSizeH = (boxHeight / rows);
    } else if (pageName === 'panel') {
      fixedSizeH = fixedSizeW;
    }

    const that = this;
    const options: GridsterConfigS = {
      gridType: 'fixed',
      compactType: 'none',
      itemChangeCallback: itemChange,
      itemResizeCallback: that.itemResize,
      itemInitCallback: that.itemInit,
      itemRemovedCallback: that.itemRemoved,
      margin: 0, // 边距
      outerMargin: false,
      mobileBreakpoint: 10,
      minCols: 1,
      maxCols: cols, // 最大列数
      minRows: 1,
      maxRows: rows, // 最大行数
      maxItemCols: cols, // 最大拖动列
      minItemCols: 1,
      maxItemRows: rows, // 最大拖动行
      minItemRows: 1,
      maxItemArea: 2500000,
      minItemArea: 1,
      defaultItemCols: 1,
      defaultItemRows: 1,
      fixedColWidth: fixedSizeW,    // 每个单元格的宽度
      fixedRowHeight: fixedSizeH, // 每个单元格的高度
      keepFixedHeightInMobile: true,
      keepFixedWidthInMobile: true,
      scrollSensitivity: 9,
      scrollSpeed: 9,
      enableEmptyCellClick: false,
      enableEmptyCellContextMenu: false,
      enableEmptyCellDrop: false,
      enableEmptyCellDrag: false,
      gridSizeChangedCallback: this.gridSizeChangedCallback.bind(this),
      emptyCellClickCallback: this.emptyCellClick.bind(this),
      emptyCellContextMenuCallback: this.emptyCellClick.bind(this),
      emptyCellDropCallback: this.emptyCellClick.bind(this),
      emptyCellDragCallback: this.emptyCellClick.bind(this),
      emptyCellDragMaxCols: 50,
      emptyCellDragMaxRows: 50,
      draggable: {
        delayStart: 0,
        enabled: draggable, // 是否支持推动
        ignoreContentClass: 'gridster-item-content',
        ignoreContent: false,
        dragHandleClass: 'drag-handler',
        stop: that.eventStop
      },
      disableWarnings: true,
      scrollToNewItems: false,
      resizable: {
        delayStart: 0,
        enabled: resizable, // 是否支持改变大小
        stop: that.eventStop,
        handles: {
          s: true,
          e: true,
          n: true,
          w: true,
          se: true,
          ne: true,
          sw: true,
          nw: true
        }
      },
      api: {
        resize: that.eventStop,
        optionsChanged: that.eventStop,
        getNextPossiblePosition: that.eventStop,
      },
      swap: false,
      pushItems: false, // 以上两个属性控制拖拽时不影响其他元素位置
      disablePushOnDrag: false,
      disablePushOnResize: false,
      pushDirections: { north: true, east: true, south: true, west: true },
      pushResizeItems: false,
      displayGrid: 'always',
      disableWindowResize: false
    };
    return options;
  }

  private eventStop(item, itemComponent, event) {
  }

  private itemResize(item, itemComponent) {
  }

  private itemInit(item, itemComponent) {
  }

  private gridSizeChangedCallback(itemComponent) {
  }
  private itemRemoved(item, itemComponent) {

  }
  private emptyCellClick(event, item) {

  }

  /**
   * 转换图片路径
   */
  public switchImg(backgroundArray): Observable<ScreenTheme.ThemeItem[]> {
    return Observable.create(observer => {
      for (const key in backgroundArray) {
        if (backgroundArray.hasOwnProperty(key)) {
          backgroundArray[key].imgUrl = JSON.stringify(this.appSer.appsetting.viewServerUrl + backgroundArray[key].resourcesUrl);
        }
      }
      observer.next(backgroundArray);
    });
  }

  /**
   * 生成缩略图
   */
  public saveImg(dom): Observable<string> {
    return Observable.create(observer => {
      html2canvas(dom, {
        useCORS: true,
        onrendered: function (canvas) {
          observer.next(canvas.toDataURL('image/png', 0.5));
        }
      });
    });
  }

  /**
   * 在前台和全屏页面用到 设置字体大小
   * @param option echarts中的配置项
   * @param pageType 标识是大屏web数据源、仪表盘数据源、大屏端数据源
   * @param layoutStr 标识是几乘几的布局
   */
  public changeSizeOption(option: any, pageType: string, layoutStr: string): Observable<any> {
    return Observable.create(observer => {
      const newOption = option;
      let labelSize, yNameTextSize, xNameTextSize, xAxisMargin,
        titleTextSize, legendItemSize, legendBottomSize, titleTop,
        marginSize, gridTopSize, gridLeftSize, gridBottomSize,
        gridRightSize, toolBoxItemSize, axisLineWidth, fontColor;
      switch (pageType) {
        case 'panel':
          fontColor = 'black';
          switch (layoutStr) {
            case '1*1':
              labelSize = '35%';
              yNameTextSize = '40%';
              xNameTextSize = '100%';
              xAxisMargin = 3;
              titleTextSize = '50%';
              legendItemSize = 7;
              legendBottomSize = '-8px';
              titleTop = '0%';
              marginSize = 0;
              gridTopSize = '12%';
              gridLeftSize = '5%';
              gridBottomSize = '10%';
              gridRightSize = '2%';
              toolBoxItemSize = 10;
              axisLineWidth = 20;
              break;
            case '8*8':
              labelSize = '100%';
              yNameTextSize = '80%';
              xNameTextSize = '100%';
              xAxisMargin = 6;
              titleTextSize = '120%';
              legendItemSize = 10;
              legendBottomSize = '0px';
              titleTop = '2%';
              marginSize = 0;
              gridTopSize = '8%';
              gridLeftSize = '4%';
              gridBottomSize = '10%';
              gridRightSize = '4%';
              toolBoxItemSize = 15;
              axisLineWidth = 50;
              break;
            default:
              labelSize = '70% ';
              yNameTextSize = '80% ';
              xNameTextSize = '100% ';
              xAxisMargin = 6;
              titleTextSize = '100% ';
              legendItemSize = 15;
              legendBottomSize = '0px';
              titleTop = '2%';
              marginSize = 0;
              gridTopSize = '12%';
              gridLeftSize = '5%';
              gridBottomSize = '20%';
              gridRightSize = '5%';
              toolBoxItemSize = 10;
              axisLineWidth = 30;
              break;
          }
          break;
      }
      if (newOption.yAxis !== null && newOption.yAxis !== undefined) {
        newOption.yAxis.axisLabel.fontSize = labelSize;
        newOption.yAxis.nameTextStyle.fontSize = yNameTextSize;
        newOption.yAxis.nameTextStyle.color = fontColor;
        newOption.yAxis.axisLabel.margin = 8;
        newOption.yAxis.axisLabel.color = fontColor;
      }
      if (newOption.xAxis !== null && newOption.xAxis !== undefined) {
        newOption.xAxis.axisLabel.margin = xAxisMargin;
        newOption.xAxis.axisLabel.fontSize = labelSize;
        newOption.xAxis.axisLabel.color = fontColor;
        newOption.xAxis.nameTextStyle.fontSize = xNameTextSize;
        newOption.xAxis.nameTextStyle.color = fontColor;
      }
      if (newOption.grid !== null && newOption.grid !== undefined) {
        newOption.grid.top = gridTopSize;
        newOption.grid.left = gridLeftSize;
        newOption.grid.bottom = gridBottomSize;
        newOption.grid.right = gridRightSize;
      }
      if (newOption.title !== null && newOption.title !== undefined) {
        newOption.title.textStyle.fontSize = titleTextSize;
        newOption.title.textStyle.margin = marginSize;
        newOption.title.textStyle.color = fontColor;
        newOption.title.top = titleTop;
      }
      if (newOption.series !== null && newOption.series !== undefined) {
        for (const i in newOption.series) {
          if (newOption.series.hasOwnProperty(i)) {
            const label = newOption.series[i].label;
            if (label !== undefined && label.normal !== undefined && label.normal.fontSize !== undefined) {
              label.normal.fontSize = labelSize;
            }
            if (label !== undefined && label.normal !== undefined && label.normal.color !== undefined) {
              label.normal.color = fontColor; // 饼图扇叶字体颜色
            }
            const labelLine = newOption.series[i].labelLine; // 饼图
            if (labelLine !== undefined && labelLine.normal !== undefined && labelLine.normal.lineStyle !== undefined
              && labelLine.normal.lineStyle.color !== undefined) {
              labelLine.normal.lineStyle.color = fontColor;
            }
            const axisLine = newOption.series[i].axisLine; // 仪表盘
            if (axisLine !== undefined && axisLine.lineStyle !== undefined) {
              axisLine.lineStyle.width = axisLineWidth;
            }
            const axisLabel = newOption.series[i].axisLabel; // 仪表盘
            if (axisLabel !== undefined && axisLabel.textStyle !== undefined) {
              axisLabel.textStyle.fontSize = labelSize;
              axisLabel.textStyle.color = fontColor;
            }
            if (newOption.series[i].detail !== undefined && newOption.series[i].detail !== null) {
              newOption.series[i].detail.fontSize = labelSize; // 仪表盘
            }
          }
        }
      }
      if (newOption.legend !== null && newOption.legend !== undefined) {
        newOption.legend.textStyle.fontSize = labelSize;
        newOption.legend.textStyle.color = fontColor;
        newOption.legend.itemGap = legendItemSize;
        newOption.legend.itemWidth = legendItemSize;
        newOption.legend.itemHeight = legendItemSize;
        newOption.legend.bottom = legendBottomSize;
      }
      if (newOption.toolbox !== null && newOption.toolbox !== undefined) {
        newOption.toolbox.itemSize = toolBoxItemSize;
      }
      if (newOption.radar !== null && newOption.radar !== undefined) { // 雷达图
        newOption.radar.name.color = fontColor;
        newOption.radar.name.fontSize = labelSize;
      }
      if (newOption.dataRange !== null && newOption.dataRange !== undefined) { // 地图
        newOption.dataRange.textStyle.color = fontColor;
      }
      observer.next(newOption);
    });
  }

}
