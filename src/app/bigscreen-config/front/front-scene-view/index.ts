import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { PagetransitionService } from '../../../services/scene/pagetransition.service';
import { Utils } from '../../../utils/utils';
import { SceneSourceService } from '../../../services/scene/sceneSource.service';
import { Scene } from '../../../domain/scene/scene';
import { AppSettingService } from '../../../services/appsetting.service';
import { DefConfigService } from '../../../services/defConfig.service';
import { DataTypeEnum } from '../../../common/dataTypeEnum';
import { ChartInteractService } from '../../../services/scene/chartInteract.service';
import { TooltipService } from '../../../services/tooltip.service';
import { EventPubSub } from '../../../common/eventPubSub';
import { MessageCodeEnum } from '../../../common/messageCodeEnum';
import { FrontSceneListComponent } from '../front-scene-list';
import { LogHelper } from '../../../common/LogHelper';
import { CommonMethodService } from '../../../services/scene/commonMethod.service';
declare let echarts;
declare let dark;
@Component({
  selector: 'app-front-scene-view',
  templateUrl: './front-scene-view.component.html',
  styleUrls: ['../../../../assets/css/scene-panel-common.scss', './front-scene-view.component.scss']
})
export class FrontSceneViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(FrontSceneListComponent)
  private frontSceneListComponent: FrontSceneListComponent;

  private $container: any;
  private $main: any;
  public pageSize = {
    width: this.defSer.screenWidth,
    height: this.defSer.screenHeight
  }; // 屏幕分辨率
  public boxRadio = 1;
  public sceneBg: Scene.Background = new Scene.Background(); // 背景图片
  public bgUrl = '';
  public sceneForm: Scene.SceneForm = new Scene.SceneForm(); // 保存场景实体信息
  public chartObj = {};
  public pollScene: Scene.SceneView = new Scene.SceneView(); // 结束轮巡的场景
  public isFullscreen = false; // 是否全屏
  public isApplySCene = false; // 是否应用场景
  public isInteractOpen = false; // 实时交互是否打开
  private timer = {}; // 数据刷新定时器对象
  public zoom = {
    min: 0.1,
    max: 2,
    step: 0.1
  };
  public notScene = false; // 判断有无场景
  constructor(public dialog: MatDialog, private pagetransitionService: PagetransitionService,
    private ssSer: SceneSourceService, private appSer: AppSettingService, private defSer: DefConfigService,
    private chartIframeSer: ChartInteractService, private toolTipSer: TooltipService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.pagetransitionService.init(); // 动画效果初始化方法
    const currThis = this;
    this.$container = $('#layout-container');
    this.$main = $('#dataBox');
    this.resizeBoxSize();
    $(window).on('resize.frontSceneView',
      Utils.lodash.throttle(() => {
        this.resizeBoxSize();
      }, Utils.throttleWaitTime)
    );
    $(document).on('keydown.frontSceneView', function (event) {
      if (currThis.isFullscreen) {
        if (event && event.keyCode === 27) { // esc
          currThis.fullScreen();
        }
      }
    });
  }
  ngOnDestroy() {
    $(window).off('resize.frontSceneView');
    $(document).off('keydown.frontSceneView');
    Object.keys(this.timer).forEach(key => {
      clearInterval(this.timer[key].timerItem);
    });
  }

  // 重置页面的比例
  private resizeBoxSize(): void {
    const padding = 70;
    const ratio = (
      (this.$container.width() - padding) / this.pageSize.width) > ((this.$container.height() - padding) / this.pageSize.height);
    let boxRadio;
    if (!ratio) {
      boxRadio = (this.$container.width() - padding) / this.pageSize.width;
    } else {
      boxRadio = (this.$container.height() - padding) / this.pageSize.height;
    }
    if (boxRadio > this.zoom.max) {
      this.boxRadio = this.zoom.max;
    } else if (boxRadio < this.zoom.min) {
      this.boxRadio = this.zoom.min;
    } else {
      this.boxRadio = parseFloat(boxRadio.toFixed(1));
    }
    this.rangeChange();
  }

  /**
   * 滑块值的change
   */
  public rangeChange() {
    this.defSer.createSceneBoxRadio = this.boxRadio;
  }

  /**
   * 场景放大缩小
   * @param type 0为缩小1为放大
   */
  public zoomInOut(type) {
    if (type === 0) {
      if (this.boxRadio > this.zoom.min) {
        this.boxRadio -= this.zoom.step;
      }
    } else {
      if (this.boxRadio < this.zoom.max) {
        this.boxRadio += this.zoom.step;
      }
    }
    this.rangeChange();
  }

  /**
   * 全屏
   */
  public fullScreen() {
    if (this.notScene) {
      return;
    }
    this.isFullscreen = !this.isFullscreen;
    setTimeout(() => {
      this.resizeBoxSize();
    }, 500);
  }

  /**
   * 切换场景
   * @param sceneId 场景主键
   */
  public changeScene(sceneInfo: Scene.SceneView): void {
    for (const key in this.timer) {
      if (this.timer.hasOwnProperty(key)) {
        clearInterval(this.timer[key].timerItem);
      }
    }
    this.timer = {};
    if (sceneInfo.sceneId === '') {
      this.notScene = true;
      this.sceneForm = new Scene.SceneForm();
      return;
    }
    let type;
    if (sceneInfo.isPolling) {
      type = sceneInfo.pollingType;
    } else {
      type = this.defSer.switchingMode;
    }
    // 若点击的场景不是当前场景 则切换效果
    if (this.sceneForm.sceneId !== sceneInfo.sceneId) {
      this.pagetransitionService.iterateClick(0, type); // 第一个参数为divIndex,第二个参数为切换方式
    }
    if (this.isInteractOpen) {
      const sceneParam: Scene.ChartInteract = new Scene.ChartInteract();
      sceneParam.id = 'changeSceneBtn';
      sceneParam.sceneId = sceneInfo.sceneId;
      sceneParam.data = {
        sceneId: sceneInfo.sceneId,
        pollingType: type
      };
      this.chartIframeSer.chartInteract(sceneParam).subscribe(); // 和iframe页大屏端交互
    }
    this.ssSer.getSceneInfo(sceneInfo.sceneId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          if (sceneInfo.isPolling) {
            this.pollScene = val.data;
          }
          this.sceneForm = val.data;
          this.sceneBg = this.sceneForm.backgroundUrl;
          this.bgUrl = this.sceneBg.bgUrl === '' ? '' : this.appSer.appsetting.viewServerUrl + this.sceneBg.bgUrl;
          this.pageSize.width = this.sceneForm.resolutionX;
          this.pageSize.height = this.sceneForm.resolutionY;
          this.resizeBoxSize();
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
        }
      },
    });
  }

  /**
   * 加载图表
   * @param itemData 数据项实体
   */
  private loadChart(itemData: Scene.SceneFormItem): void {
    const timerItem = null;
    let refreshTime = itemData.timeLength !== 0 ? itemData.timeLength : this.appSer.appsetting.timer;
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
    if (this.isInteractOpen) { // 图表交互
      const self = this;
      // this.chartObj[itemData.itemId].on('georoam', function (params) {
      //   console.log(JSON.stringify(params));
      // }); // 地图区域缩放,没有找到对应的action 先注掉代码
      this.chartObj[itemData.itemId].on('legendselectchanged', function (params) {
        self.chartInteract(params, itemData);
      });
      this.chartObj[itemData.itemId].on('legendscroll', function (params) {
        self.chartInteract(params, itemData);
      });
      this.chartObj[itemData.itemId].on('datazoom', function (params) {
        self.chartInteract(params, itemData);
      });
      this.chartObj[itemData.itemId].on('pieselectchanged', function (params) {
        self.chartInteract(params, itemData);
      });
      this.chartObj[itemData.itemId].on('mapselectchanged', function (params) {
        self.chartInteract(params, itemData);
      });
      this.chartObj[itemData.itemId].on('datarangeselected', function (params) {
        self.chartInteract(params, itemData);
      });
    }
    if (this.timer[itemData.itemId].isFirstLoad) {
      this.timer[itemData.itemId].timerItem = setInterval(d => {
        // 现在数据库中的数据不是真实数据 所以先注掉向后台发请求更新数据的代码
        // this.ssSer.getSceneItemData(this.sceneForm.sceneId, itemData.resourceId).subscribe({
        //   next: (val) => {
        //     if (val.code === 0) {
        //       this.loadChart(val.data);
        //     }
        //   }
        // });
        this.loadChart(itemData);
      }, refreshTime);
      this.timer[itemData.itemId].isFirstLoad = false;
    }
  }

  /**
   * 图表交互
   * @param params 图表回调参数
   * @param data 数据项
   */
  private chartInteract(params, data: Scene.SceneFormItem) {
    const sceneParam: Scene.ChartInteract = new Scene.ChartInteract();
    sceneParam.id = 'chartInteractBtn';
    sceneParam.data = {
      sceneId: data.sceneId,
      itemId: data.itemId,
      chartParams: params
    };
    this.chartIframeSer.chartInteract(sceneParam).subscribe();
  }

  /**
   * 销毁echarts实例
   */
  public disposeEchart(): void {
    for (const key in this.chartObj) {
      if (this.chartObj.hasOwnProperty(key)) {
        const element = this.chartObj[key];
        element.dispose();
      }
    }
    this.chartObj = {};
  }

  /**
   * 应用场景
   */
  public applyScene(): void {
    if (this.notScene) {
      return;
    }
    this.chartIframeSer.applyScene(this.sceneForm.sceneId).subscribe({
      next: (val) => {
        if (val.code === -1) {
          this.toolTipSer.showMsg(val.message);
        }
      },
      error: (err) => {
        LogHelper.error('bigscreen-config front', 'front-scene-view applyScene()error,原因:' + JSON.stringify(err));
      }
    });
  }

  /**
   * 实时交互
   */
  public screenInteract(): void {
    if (this.notScene) {
      return;
    }
    this.isInteractOpen = !this.isInteractOpen;
  }

}
