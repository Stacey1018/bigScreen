import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartInteractService } from '../../services/scene/chartInteract.service';
import { LogHelper } from '../../common/LogHelper';
import { Scene } from '../../domain/scene/scene';
import { DataTypeEnum } from '../../common/dataTypeEnum';
import { AppSettingService } from '../../services/appsetting.service';
import { DefConfigService } from '../../services/defConfig.service';
import { PagetransitionService } from '../../services/scene/pagetransition.service';
import { SceneSourceService } from '../../services/scene/sceneSource.service';
declare let echarts;
declare let dark;
@Component({
  selector: 'app-layout-iframe',
  templateUrl: './layout-iframe.component.html',
  styleUrls: ['../../../assets/css/scene-panel-common.scss', './layout-iframe.component.scss']
})
export class LayoutIframeComponent implements OnInit, AfterViewInit, OnDestroy {

  private sceneId: string; // 场景主键标识
  public sceneForm: Scene.SceneForm = new Scene.SceneForm(); // 场景实体信息
  public sceneBg: Scene.Background = new Scene.Background(); // 背景图片
  public chartObj = {};
  public pageSize = {
    width: this.defSer.screenWidth,
    height: this.defSer.screenHeight
  }; // 屏幕分辨率
  private timer = {}; // 数据刷新定时器对象
  public bgUrl = '';
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
  private switchingMode: number; // 场景切换方式
  constructor(private activatedRoute: ActivatedRoute, private chartSer: ChartInteractService,
    private appSer: AppSettingService, private defSer: DefConfigService, private pagetransitionService: PagetransitionService,
    private ssSer: SceneSourceService) {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      this.sceneId = queryParams.sceneId;
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.pagetransitionService.init(); // 动画效果初始化方法
    if (this.sceneId === '') {
      return;
    } else {
      this.switchingMode = this.defSer.switchingMode;
      this.loadScene();
    }
  }

  ngOnDestroy(): void {
    Object.keys(this.timer).forEach(key => {
      clearInterval(this.timer[key].timerItem);
    });
  }

  /**
   * 初始化获取场景
   */
  private loadScene(): void {
    // 切换效果
    this.pagetransitionService.iterateClick(0, this.switchingMode); // 第一个参数为divIndex,第二个参数为切换方式
    this.chartSer.getSceneIframe(this.sceneId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.sceneForm = val.data as Scene.SceneForm;
          this.sceneBg = this.sceneForm.backgroundUrl;
          this.bgUrl = this.sceneBg.bgUrl === '' ? '' : this.appSer.appsetting.viewServerUrl + this.sceneBg.bgUrl;
          this.pageSize.width = this.sceneForm.resolutionX;
          this.pageSize.height = this.sceneForm.resolutionY;
          this.sceneForm.itemList.sort((a, b) => {
            return a.layerNum - b.layerNum;
          });
          this.disposeEchart();
          setTimeout(() => {
            this.sceneForm.itemList.forEach(element => {
              if (element.resourceCode === DataTypeEnum.Echarts) { // 图表
                this.loadChart(element);
              }
            });
          }, 200);
        } else {
          LogHelper.log('layout-iframe', 'layout-iframe loadScene()info,原因:' + val.message);
        }
      },
      error: (err) => {
        LogHelper.error('layout-iframe', 'layout-iframe loadScene()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 加载图表
   * @param itemData 数据项实体
   */
  private loadChart(itemData: Scene.SceneFormItem): void {
    const timerItem = null;
    if (!(itemData.itemId in this.timer)) {
      this.timer[itemData.itemId] = {
        isFirstLoad: true,
        timerItem: timerItem
      };
    }
    if (this.timer[itemData.itemId].isFirstLoad) {
      const newChart: Scene.Chart = new Scene.Chart();
      newChart.id = 'dataItemBox' + itemData.itemId;
      newChart.obj = echarts.init(document.getElementById(newChart.id), 'dark');
      this.chartObj[itemData.itemId] = newChart.obj;
    } else {
      this.chartObj[itemData.itemId].clear();
    }
    this.chartObj[itemData.itemId].setOption(itemData.resourceInfo);
    if (this.timer[itemData.itemId].isFirstLoad) {
      this.timer[itemData.itemId].timerItem = setInterval(d => {
        //   this.ssSer.getSceneItemData(this.sceneForm.sceneId, itemData.resourceId).subscribe({
        //     next: (val) => {
        //       if (val.code === 0) {
        //         this.loadChart(val.data);
        //       }
        //     }
        //   });
        this.loadChart(itemData);
      }, this.appSer.appsetting.timer);
      this.timer[itemData.itemId].isFirstLoad = false;
    }
  }

  /**
   * 销毁echarts实例
   */
  private disposeEchart(): void {
    for (const key in this.chartObj) {
      if (this.chartObj.hasOwnProperty(key)) {
        const element = this.chartObj[key];
        element.dispose();
      }
    }
    this.chartObj = {};
  }

  /**
   * 切换场景
   */
  public changeScene(): void {
    const data: string = document.getElementById('changeSceneBtn').getAttribute('data');
    const params = JSON.parse(data);
    this.sceneId = params.sceneId;
    this.switchingMode = params.pollingType !== null || params.pollingType !== undefined ? params.pollingType : this.defSer.switchingMode;
    this.sceneForm.itemList = [];
    for (const key in this.timer) {
      if (this.timer.hasOwnProperty(key)) {
        clearInterval(this.timer[key].timerItem);
      }
    }
    this.timer = {};
    this.loadScene();
  }

  /**
   * 图表交互
   */
  public chartInteract(): void {
    const data: string = document.getElementById('chartInteractBtn').getAttribute('data');
    const params = JSON.parse(data);
    switch (params.chartParams.type) {
      case 'legendselectchanged': // 切换图例的选中状态
        this.operateLegend('legendToggleSelect', params.chartParams, params.itemId);
        break;
      case 'legendscroll': // 控制图例的滚动,当legend.type为'scroll'时有效
        this.legendScroll(params.chartParams, params.itemId);
        break;
      case 'datazoom': // 数据区域缩放
        this.operateDataZoom('datazoom', params.chartParams, params.itemId);
        break;
      case 'pieselectchanged': // 饼图扇形切换选中状态的事件
        this.operatePie('pieToggleSelect', params.chartParams, params.itemId);
        break;
      case 'mapselectchanged': // 切换指定的地图区域选中状态
        this.operatePie('mapToggleSelect', params.chartParams, params.itemId);
        break;
      case 'mouserover':
        this.showTip(params.chartParams, params.itemId);
        break;
      case 'mouseout':
        this.hideTip(params.chartParams, params.itemId);
        break;
      case 'datarangeselected': // range值改变后触发的事件
        this.visualMap('selectDataRange', params.chartParams, params.itemId);
        break;
      case 'focusnodeadjacency': // 关系图邻接节点高亮事件
        this.operateGraph('focusNodeAdjacency', params.chartParams, params.itemId);
        break;
      case 'unfocusnodeadjacency': // 关系图邻接节点取消高亮事件
        this.operateGraph('unfocusNodeAdjacency', params.chartParams, params.itemId);
        break;
    }
  }

  /**
   * 图例交互
   * @param type 操作类型
   * @param param event事件回调参数
   */
  public operateLegend(type: string, param: any, itemId: string) {
    const echart = echarts.init(document.getElementById('dataItemBox'), itemId);
    echart.dispatchAction({
      type: type,
      name: param.chartParams.name // 图例名称
    });
  }

  /**
   * 控制图例的滚动
   * @param scrollDataIndex 索引下标
   * @param legendId 操作图例主键
   */
  public legendScroll(param: any, itemId: string) {
    const echart = echarts.init(document.getElementById('dataItemBox'), itemId);
    echart.dispatchAction({
      type: 'legendScroll',
      scrollDataIndex: param.scrollDataIndex,
      legendId: param.legendId
    });
  }

  /**
   * 数据区域缩放
   * @param type action类型
   * @param param event事件回调参数
   */
  public operateDataZoom(type: string, param: any, itemId: string) {
    const echart = echarts.init(document.getElementById('dataItemBox'), itemId);
    echart.dispatchAction({
      type: type,
      dataZoomIndex: 0, // 可选，dataZoom 组件的 index，多个 dataZoom 组件时有用，默认为 0
      start: param.batch[0].start, // 开始位置的百分比，0 - 100
      end: param.batch[0].end, // 结束位置的百分比，0 - 100
      startValue: param.batch[0].startValue, // 回调参数中没有 开始位置的数值
      endValue: param.batch[0].endValue // 回调参数中没有 结束位置的数值
    });
  }

  /**
   * pie、map操作
   * @param type action类型
   * @param param event事件回调参数
   */
  public operatePie(type: string, param: any, itemId: string) {
    const echart = echarts.init(document.getElementById('dataItemBox'), itemId);
    echart.dispatchAction({
      type: type,
      seriesIndex: param.seriesIndex, // 可选,系列index，可以是一个数组指定多个系列
      seriesName: param.seriesName, // 可选,系列名称，可以是一个数组指定多个系列
      dataIndex: param.dataIndex, // 数据的 index，如果不指定也可以通过 name 属性根据名称指定数据
      name: param.name  // 可选,数据名称，在有 dataIndex 的时候忽略
    });
  }

  /**
   * 关系图操作
   * @param type action类型
   * @param param event事件回调参数
   */
  public operateGraph(type: string, param: any, itemId: string) {
    const echart = echarts.init(document.getElementById('dataItemBox'), itemId);
    echart.dispatchAction({
      type: type,
      seriesId: param.seriesId, // 使用 seriesId 或 seriesIndex 或 seriesName 来定位 series.
      seriesIndex: param.seriesIndex,
      seriesName: param.seriesName,
      dataIndex: param.dataIndex // 使用 dataIndex 来定位节点。
    });
  }

  /**
   * 鼠标悬浮显示提示框
   * @param param 回调参数
   */
  public showTip(param: any, itemId: string) {
    const echart = echarts.init(document.getElementById('dataItemBox'), itemId);
    echart.dispatchAction({
      type: 'showTip',
      seriesIndex: param.seriesIndex, // 系列的 index，在 tooltip 的 trigger 为 axis 的时候可选。
      dataIndex: param.dataIndex, // 数据的 index，如果不指定也可以通过 name 属性根据名称指定数据
      name: param.name, // 可选，数据名称，在有 dataIndex 的时候忽略
      // position: Array.<number>|string|Function // 缺省则使用 option 中定义的 tooltip 位置。
    });
  }

  /**
   * 隐藏提示框
   */
  public hideTip(param: any, itemId: string) {
    const echart = echarts.init(document.getElementById('dataItemBox'), itemId);
    echart.dispatchAction({
      type: 'hideTip',
    });
  }

  /**
   * 选取映射的数值范围
   * @param type action类型
   * @param params 回调参数
   */
  public visualMap(type: string, param: any, itemId: string) {
    const echart = echarts.init(document.getElementById('dataItemBox'), itemId);
    echart.dispatchAction({
      type: type,
      selected: param.selected, // 选取20到40的值范围
    });
  }
}
