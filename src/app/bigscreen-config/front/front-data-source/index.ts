import { Component, OnInit, AfterViewInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { SortablejsOptions } from 'angular-sortablejs';
import * as $ from 'jquery';
import { Utils } from '../../../utils/utils';
import { ChartMethodService } from '../../../services/panel/chartMethod.service';
import { AppSettingService } from '../../../services/appsetting.service';
import { ScreenTheme } from '../../../domain/screenConfig/screenTheme';
import { LogHelper } from '../../../common/LogHelper';
import { SceneMethodService } from '../../../services/scene/sceneMethod.service';
import { Scene } from '../../../domain/scene/scene';
import { DataTypeEnum } from '../../../common/dataTypeEnum';
import { SceneSourceService } from '../../../services/scene/sceneSource.service';
@Component({
  selector: 'app-front-data-source',
  templateUrl: './front-data-source.component.html',
  styleUrls: ['../../../../assets/css/scene-panel-list-common.scss', './front-data-source.component.scss']
})
export class FrontDataSourceComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() addLayoutData = new EventEmitter<ScreenTheme.ResourceItem>();

  public bgItems: Scene.ResourceView[] = new Array<Scene.ResourceView>(); // 背景数据数组
  public borderItems: Scene.ResourceView[] = new Array<Scene.ResourceView>(); // 边框数据数组
  public dataIdList = []; // 所有已选择的数据id的list,作为中间值
  public dataList = {}; // 所有已选择的数据的list
  public selectedItemId = ''; // 已选择布局的id
  public showDataType = 'border'; // 左侧选中的组件的类型

  public imgUrl = ''; // 图表缩略图Url
  public isInteract: string; // 是否实时交互
  public isAllDataShow = true; // 控制全部数据和已选数据切换
  // 拖动图表配置项
  public optionsData: SortablejsOptions;

  // 拖动已选中的数据的配置项
  public optionsSelectedData: SortablejsOptions;

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
  // 地图
  public mapItems = [
    { 'iconName': 'chinaMapIcon', 'dataType': DataTypeEnum.ChinaMap, 'resourceName': '中国地图' },
    { 'iconName': 'worldMapIcon', 'dataType': DataTypeEnum.WorldMap, 'resourceName': '世界地图' },
    { 'iconName': 'sphericalMapIcon', 'dataType': DataTypeEnum.SphericalMap, 'resourceName': '3D球形地图' },
  ];
  // 媒体
  public materialItems = [
    { 'iconName': 'imgIcon', 'dataType': DataTypeEnum.Image, 'resourceName': '图片' },
    { 'iconName': 'PollingImage', 'dataType': DataTypeEnum.PollingImage, 'resourceName': '轮播图片' },
    { 'iconName': 'HistoryVideo', 'dataType': DataTypeEnum.HistoryVideo, 'resourceName': '视频片段' },
    { 'iconName': 'RealVideo', 'dataType': DataTypeEnum.RealVideo, 'resourceName': '实时视频' },
  ];
  // 文本
  public textItems = [
    { 'iconName': 'titleIcon', 'dataType': DataTypeEnum.Title, 'resourceName': '标题' },
    { 'iconName': 'pollingDataIcon', 'dataType': DataTypeEnum.PollingData, 'resourceName': '轮播列表' },
    { 'iconName': 'pollingDataIcon', 'dataType': DataTypeEnum.singleData, 'resourceName': '跑马灯' },
    { 'iconName': 'pollingDataIcon', 'dataType': DataTypeEnum.multipleData, 'resourceName': '多行文本' },
    { 'iconName': 'pollingDataIcon', 'dataType': DataTypeEnum.ScrollTopData, 'resourceName': '多行文本上翻' }
  ];
  // 其他
  public otherItems = [
    { 'iconName': 'timerIcon', 'dataType': DataTypeEnum.Timer, 'resourceName': '时间器' },
    { 'iconName': 'drawIcon', 'dataType': DataTypeEnum.Draw, 'resourceName': '翻牌' },
  ];
  constructor(public chartService: ChartMethodService, public smSer: SceneMethodService,
    private ssSer: SceneSourceService, public appSer: AppSettingService) {
    this.setSortablejsOptions();
  }

  ngOnInit() {
    this.borderItems = [];
    this.getMaterials(); // 加载边框和背景列表
    this.getDataSources(); // 加载数据视图列表
  }

  ngAfterViewInit() {
    $('#selectByName').on('keyup', Utils.lodash.throttle(() => {
      this.getDataSources(); // 加载数据视图列表（有异步的bug）
    }, Utils.throttleWaitTime));
    Utils.slimScroll();
  }

  ngOnDestroy() {
  }

  /**
   * 切换组件
   */
  public switchData(type) {
    this.showDataType = type;
  }
  /**
   * 左侧拖拽列表的初始化，拖拽结束之后回调
   */
  private setSortablejsOptions(): void {
    this.optionsData = Utils.getSortablejsOptions('data', false, (event) => {
      const type = $(event.item).data('type');
      const event2: any = window.event;
      if (event2.type === 'dragend') {
        const dragLeft = event2.clientX;
        const dragTop = event2.clientY;
        const id = Utils.generateUUID();
        let itemData: Scene.ResourceView = new Scene.ResourceView();
        // 边框
        if (type === DataTypeEnum.Border) {
          const index = $(event.item).data('index');
          itemData = this.borderItems[index];
        } else if (type === DataTypeEnum.Echarts) {
          // 图表
          const dataId = $(event.item).attr('id');
          const currDt = this.smSer.dataSource.filter(t => {
            return t.resourceId === dataId;
          });
          itemData = JSON.parse(JSON.stringify(currDt[0]));
        } else if (type === DataTypeEnum.ChinaMap) {
          // 中国地图
          itemData = {
            resourceId: '',
            resourceName: '中国地图',
            resourceCode: DataTypeEnum.Map,
            detailCode: DataTypeEnum.ChinaMap,
            resourceInfo: 'china'
          };
        } else if (type === DataTypeEnum.WorldMap) {
          // 世界地图
          itemData = {
            resourceId: '',
            resourceName: '世界地图',
            resourceCode: DataTypeEnum.Map,
            detailCode: DataTypeEnum.WorldMap,
            resourceInfo: 'world'
          };
        } else if (type === DataTypeEnum.SphericalMap) {
          // 3D球形地图
          itemData = {
            resourceId: '',
            resourceName: '3D球形地图',
            resourceCode: DataTypeEnum.Map,
            detailCode: DataTypeEnum.SphericalMap,
            resourceInfo: ''
          };
        } else if (type === DataTypeEnum.Title) {
          // 标题
          itemData = {
            resourceId: '',
            resourceName: '我是标题名称',
            resourceCode: DataTypeEnum.Text,
            detailCode: DataTypeEnum.Title,
            resourceInfo: '',
            configInfo: {
              fontBold: 'normal',
              fontSize: 18,
              fontFamily: '微软雅黑',
              fontColor: '#fff',
              align: 'center',
            }
          };
        } else if (type === DataTypeEnum.singleData) {
          // 单行文本跑马灯
          itemData = {
            resourceId: '',
            resourceName: '跑马灯',
            resourceCode: DataTypeEnum.Text,
            detailCode: DataTypeEnum.singleData,
            resourceInfo: '',
            configInfo: {
              fontBold: 'normal',
              fontSize: 18,
              fontFamily: '微软雅黑',
              fontColor: '#fff',
              timeInterval: 50,
              speed: 1,
            }
          };
        } else if (type === DataTypeEnum.multipleData) {
          // 多行文本跑马灯
          itemData = {
            resourceId: '',
            resourceName: '多行文本',
            resourceCode: DataTypeEnum.Text,
            detailCode: DataTypeEnum.multipleData,
            resourceInfo: '',
            configInfo: {
              fontBold: 'normal',
              fontSize: 18,
              fontFamily: '微软雅黑',
              fontColor: '#fff',
              lineHeight: 30,
            }
          };
        } else if (type === DataTypeEnum.ScrollTopData) {
          // 多行文本上滚
          itemData = {
            resourceId: '',
            resourceName: '多行文本上滚',
            resourceCode: DataTypeEnum.Text,
            detailCode: DataTypeEnum.ScrollTopData,
            resourceInfo: '',
            configInfo: {
              fontBold: 'normal',
              fontSize: 18,
              fontFamily: '微软雅黑',
              fontColor: '#fff',
              lineHeight: 30,
              timeInterval: 50
            }
          };
        } else if (type === DataTypeEnum.PollingData) {
          // 轮播列表
          itemData = {
            resourceId: '',
            resourceName: '轮播列表',
            resourceCode: DataTypeEnum.Text,
            detailCode: DataTypeEnum.PollingData,
            resourceInfo: '',
            configInfo: {
              fontFamily: '微软雅黑',
              sizeRows: 5,
              tableTitle: {
                bgColor: '#51afff',
                fontSize: 18,
                fontColor: '#fff',
                fontBold: 'normal',
                align: 'center'
              },
              oddBgColor: 'rgba(0,0,0,0.3)',
              evenBgColor: 'rgba(0,0,0,0.1)',
              serialNumber: {
                bgColor: '#51afff',
                widthRatio: 1,
                radius: 10,
                fontSize: 18,
                fontColor: '#fff',
                fontBold: 'normal',
              },
              colsData: [
                {
                  colsName: '标签1',
                  colsFieldName: 'name1',
                  widthRatio: 3,
                  fontSize: 18,
                  fontColor: '#fff',
                  fontBold: 'normal',
                  align: 'center'
                }, {
                  colsName: '标签2',
                  colsFieldName: 'name2',
                  widthRatio: 3,
                  fontSize: 18,
                  fontColor: '#fff',
                  fontBold: 'normal',
                  align: 'center'
                }, {
                  colsName: '标签3',
                  colsFieldName: 'name3',
                  widthRatio: 3,
                  fontSize: 18,
                  fontColor: '#fff',
                  fontBold: 'normal',
                  align: 'center'
                }
              ],
              pollingData: [
                {
                  name1: '数据',
                  name2: '数据',
                  name3: '数据',
                }, {
                  name1: '数据',
                  name2: '数据',
                  name3: '数据',
                }, {
                  name1: '数据',
                  name2: '数据',
                  name3: '数据',
                }, {
                  name1: '数据',
                  name2: '数据',
                  name3: '数据',
                }, {
                  name1: '数据',
                  name2: '数据',
                  name3: '数据',
                }, {
                  name1: '数据',
                  name2: '数据',
                  name3: '数据',
                }
              ]
            }
          };
        } else if (type === DataTypeEnum.Image) {
          // 图片
          itemData = {
            resourceId: '',
            resourceName: '图片',
            resourceCode: DataTypeEnum.Media,
            detailCode: DataTypeEnum.Image,
            resourceInfo: '',
          };
        } else if (type === DataTypeEnum.PollingImage) {
          // 轮播图片
          itemData = {
            resourceId: '',
            resourceName: '轮播图片',
            resourceCode: DataTypeEnum.Media,
            detailCode: DataTypeEnum.PollingImage,
            resourceInfo: '',
            configInfo: {
              imgUrl: [],
              speed: 3,
            }
          };
        } else if (type === DataTypeEnum.RealVideo) {
          // 实时视频
          itemData = {
            resourceId: '',
            resourceName: '实时视频',
            resourceCode: DataTypeEnum.Media,
            detailCode: DataTypeEnum.RealVideo,
            resourceInfo: ''
          };
        } else if (type === DataTypeEnum.HistoryVideo) {
          // 视频片段
          itemData = {
            resourceId: '',
            resourceName: '视频片段',
            resourceCode: DataTypeEnum.Media,
            detailCode: DataTypeEnum.HistoryVideo,
            resourceInfo: ''
          };
        } else if (type === DataTypeEnum.Timer) {
          // 时间器
          itemData = {
            resourceId: '',
            resourceName: '时间器',
            resourceCode: DataTypeEnum.Other,
            detailCode: DataTypeEnum.Timer,
            resourceInfo: '',
            configInfo: {
              fontBold: 'normal',
              fontSize: 18,
              fontFamily: '微软雅黑',
              fontColor: '#fff',
              align: 'center',
              timerType: 'yyyy-MM-dd hh:mm:ss',
              iconSize: 18,
              iconColor: '#fff',
              iconSpacing: 10,
              isShowIcon: true
            }
          };
        } else if (type === DataTypeEnum.Draw) {
          // 翻牌
          itemData = {
            resourceId: '',
            resourceName: '翻牌',
            resourceCode: DataTypeEnum.Other,
            detailCode: DataTypeEnum.Draw,
            resourceInfo: '',
            configInfo: {
              drawVal: '666666', // 传入值
              drawTimeInterval: 5, // 更新的时间间距
              fontSize: 28,
              fontColor: '#fff',
              drawBgColor: '#000',
              drawBorderRadius: 5
            }
          };
        }
        const chartData = {
          id: id,
          itemData: itemData,
          dragLeft: dragLeft,
          dragTop: dragTop
        };
        this.dataList[id] = JSON.parse(JSON.stringify(itemData));
        this.dataIdList.unshift(id);
        this.addLayoutData.emit(chartData);
      }
    });
    this.optionsSelectedData = Utils.getSortablejsOptions('selectedData', true, (event) => {

    });
  }

  /**
   * 加载数据视图列表
   */
  public getDataSources(): void {
    this.smSer.getChartList('', '');
  }

  // 已选数据的点击选中事件，和布局中的数据的点击选中事件
  public selectItem(itemId) {
    this.selectedItemId = itemId;
  }

  /**
   * 获取背景边框列表
   */
  private getMaterials() {
    this.ssSer.getMaterialForScene().subscribe({
      next: (val) => {
        if (val.code === 0) {
          const themes = val.data as Scene.ResourceView[];
          this.borderItems = themes.filter(t => t.detailCode === DataTypeEnum.Border);
          this.bgItems = themes.filter(t => t.detailCode === DataTypeEnum.Background);
        } else {
          LogHelper.log('bigscreen-config front', 'front-data-material getMaterials()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('bigscreen-config front', 'front-data-material getMaterials()info,原因:' + JSON.stringify(err));
      }
    });
  }


  /**
   * 二级菜单的显示和隐藏
   * @param id 一级目录文件主键标识
   */
  public showSecLevelFile(id: string) {
    for (let i = 0; i < this.smSer.chartFolderArray.length; i++) {
      if (this.smSer.chartFolderArray[i].resourceId === id) {
        if (this.smSer.chartFolderArray[i].showList) {
          this.smSer.chartFolderArray[i].showList = false;
        } else {
          this.smSer.chartFolderArray[i].showList = true;
          this.smSer.getChartList('', id);
        }
      }
    }
  }

  /**
   * 鼠标移动到图标上显示缩略图
   * @param id 数据项主键
   * @param url 图片路径
   */
  public showImg(id: string, url: string): void {
    const showBox = $('.data-ShowImg');
    this.imgUrl = url;
    $('.operate-container').hide();
    let offtop = $('#' + id).offset().top + 30;
    const bodyHeight = $('body').height();
    const boxHeight = showBox.innerHeight();
    if ((boxHeight + offtop) > bodyHeight) {
      offtop = offtop - 30 - boxHeight;
      showBox.css({
        'top': offtop,
        'left': 115,
        'background-position': '115px ' + (boxHeight - 4) + 'px'
      }).addClass('top');
    } else {
      showBox.attr('style', '');
      showBox.css({ 'top': offtop, 'left': 115 }).removeClass('top');
    }
    showBox.show();
  }

  /**
   * 鼠标离开隐藏缩略图
   * @param flag 标识数据视图还是场景
   */
  public hideImg(flag) {
    let showBox;
    switch (flag) {
      case 'data':
        showBox = $('.data-ShowImg');
        break;
    }
    showBox.hide();
  }
}
