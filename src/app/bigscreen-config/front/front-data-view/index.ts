import { Component, OnInit, AfterViewInit, OnDestroy, NgZone, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import * as $ from 'jquery';
import { SceneMethodService } from '../../../services/scene/sceneMethod.service';
import { Scene } from '../../../domain/scene/scene';
import { Utils } from '../../../utils/utils';
import { LogHelper } from '../../../common/LogHelper';
import { AppSettingService } from '../../../services/appsetting.service';
import { SceneSourceService } from '../../../services/scene/sceneSource.service';
import { TooltipService } from '../../../services/tooltip.service';
import { DefConfigService } from '../../../services/defConfig.service';
import swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { FrontDataSourceComponent } from '../front-data-source';
import { ScreenTheme } from '../../../domain/screenConfig/screenTheme';
import { DataTypeEnum } from '../../../common/dataTypeEnum';
import { CommonMethodService } from '../../../services/scene/commonMethod.service';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
declare let echarts;
declare let dark;

@Component({
  selector: 'app-front-data-view',
  templateUrl: './front-data-view.component.html',
  styleUrls: ['../../../../assets/css/scene-panel-common.scss', './front-data-view.component.scss']
})
export class FrontDataViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() emitter = new EventEmitter<number>();
  @ViewChild(FrontDataSourceComponent)

  public frontDataSourceComponent: FrontDataSourceComponent;
  private $container: any;
  private $main: any;
  public pageSize = {
    width: this.defSer.screenWidth,
    height: this.defSer.screenHeight
  }; // 屏幕分辨率
  public defaultCell = {
    width: 300,
    height: 300
  }; // 默认窗口占的宽高
  public defaultTextCell = {
    width: 300,
    height: 60
  }; // 默认窗口占的宽高

  public zoom = {
    min: 0.1,
    max: 2,
    step: 0.1
  };

  public boxRadio = 1; // 盒子的缩放比例
  public sceneId = ''; // 当前场景主键标识
  public isDataChange = 0; // 判断数据是否被改变
  public sceneBg: Scene.Background = new Scene.Background(); // 背景图片、颜色
  public bgUrl = '';
  public layoutList: Scene.LayoutItem[] = new Array<Scene.LayoutItem>(); // 布局的list
  public sceneForm: Scene.SceneForm = new Scene.SceneForm(); // 保存场景实体信息
  public chartObj = {};
  public isFullscreen = false;
  public contextmenuLayoutItemId; // 右击的布局的id
  public contextmenuMsg = {
    top: 0,
    left: 0,
    isContextmenu: false
  }; // 展示右击的信息
  private timer = {}; // 数据刷新定时器对象
  constructor(private router: Router, private zone: NgZone, private toolTipSer: TooltipService,
    private smSer: SceneMethodService, private ssSer: SceneSourceService, private appSer: AppSettingService,
    public defSer: DefConfigService, private route: ActivatedRoute, private cmSer: CommonMethodService) {
    this.sceneForm.itemList = [];
    this.sceneForm.sceneName = '';

    this.route.queryParams.subscribe(params => {
      this.sceneId = params['sceneId'] === undefined ? '' : params['sceneId'];
      if (this.sceneId !== '') { // 编辑场景
        this.getSceneInfo();
      } else {
        // 场景的默认背景颜色
        this.sceneBg.bgColor = '#071E63';
        this.sceneBg.bgUrl = '';
      }
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    const currThis = this;
    this.$container = $('#layout-container');
    this.$main = $('#dataBox');
    this.dragFun();
    this.resizeBoxSize();
    $(window).on('resize.frontDataView',
      Utils.lodash.throttle(() => {
        this.resizeBoxSize();
      }, Utils.throttleWaitTime)
    );

    $(document).on('click.frontDataView', () => {
      this.contextmenuMsg.isContextmenu = false;
    });

    $(document).on('keydown.frontDataView', function (event) {
      if (currThis.isFullscreen) {
        if (event && event.keyCode === 27) { // esc
          currThis.fullScreen();
        }
      }
    });
  }

  ngOnDestroy() {
    $(window).off('resize.frontDataView');
    $(document).off('click.frontDataView');
    $(document).off('keydown.frontDataView');
    Object.keys(this.timer).forEach(key => {
      clearInterval(this.timer[key].timerItem);
    });
  }

  /**
   * 右击
   */
  public contextmenu(e, layoutItemId): void {
    e.preventDefault();
    this.frontDataSourceComponent.selectItem(layoutItemId);
    this.contextmenuMsg.top = e.pageY;
    this.contextmenuMsg.left = e.pageX;
    this.contextmenuMsg.isContextmenu = true;
    this.contextmenuLayoutItemId = layoutItemId;
  }

  /**
   * 全屏
   */
  public fullScreen(): void {
    this.isFullscreen = !this.isFullscreen;
    setTimeout(() => {
      this.resizeBoxSize();
    }, 500);
  }

  /**
   * 编辑场景
   */
  private getSceneInfo(): void {
    this.ssSer.getSceneInfo(this.sceneId).subscribe({
      next: (val) => {
        if (val.code === 0) {
          this.sceneForm = val.data;
          this.sceneBg = this.sceneForm.backgroundUrl;
          this.pageSize.width = this.sceneForm.resolutionX;
          this.pageSize.height = this.sceneForm.resolutionY;
          this.bgUrl = this.sceneBg.bgUrl === '' ? '' : this.appSer.appsetting.viewServerUrl + this.sceneBg.bgUrl;
          this.sceneForm.itemList.sort((a, b) => {
            return a.layerNum - b.layerNum;
          });
          this.sceneForm.itemList.forEach(ele => {
            this.layoutList.push({
              itemId: ele.itemId,
              sizeCol: ele.sizeCol,
              sizeRow: ele.sizeRow,
              positionY: ele.positionY,
              positionX: ele.positionX,
              itemData: ele as Scene.ResourceView
            });
            if (ele.resourceCode === DataTypeEnum.Echarts) {
              setTimeout(() => {
                this.loadChart(ele as Scene.ResourceView, ele.itemId);
              }, 200);
            }
            this.frontDataSourceComponent.dataList[ele.itemId] = JSON.parse(JSON.stringify(ele));
            this.frontDataSourceComponent.dataIdList.unshift(ele.itemId);
          });
        } else {
          this.toolTipSer.showMsg(val.message);
        }
      },
      error: (err) => {
      }
    });
  }

  /**
   * 设置背景图片
   * @param src 背景图片
   */
  public setBg(bgData: Scene.Background): void {
    this.sceneBg = bgData;
    this.bgUrl = this.sceneBg.bgUrl === '' ? '' : this.appSer.appsetting.viewServerUrl + this.sceneBg.bgUrl;
  }

  /**
   * 添加数据
   * @param layoutData 数据实体
   */
  public addLayoutData(layoutData: ScreenTheme.ResourceItem): void {
    this.zone.run(() => {
      const dragLeft = Math.ceil(layoutData.dragLeft - this.$main.offset().left);
      const dragTop = Math.ceil(layoutData.dragTop - this.$main.offset().top);
      let size;
      if (layoutData.itemData.detailCode === DataTypeEnum.Title ||
        layoutData.itemData.detailCode === DataTypeEnum.Timer ||
        layoutData.itemData.detailCode === DataTypeEnum.Draw ||
        layoutData.itemData.detailCode === DataTypeEnum.singleData
      ) {
        size = this.defaultTextCell;
      } else {
        size = this.defaultCell;
      }
      this.layoutList.push({
        itemId: layoutData.id,
        sizeCol: size.width,
        sizeRow: size.height,
        positionY: Math.round(dragTop / this.boxRadio),
        positionX: Math.round(dragLeft / this.boxRadio),
        itemData: layoutData.itemData
      });
      if (layoutData.itemData.resourceCode === DataTypeEnum.Echarts) {
        setTimeout(() => {
          this.loadChart(layoutData.itemData, layoutData.id);
        }, 500);
      }
      this.isDataChange++;
      this.emitter.emit(this.isDataChange);
    });
  }

  /**
   * 图表属性修改
   */
  public changeEchartData(layoutData: ScreenTheme.ResourceItem): void {
    const layoutIndex = this.layoutList.findIndex(t => t.itemId === this.frontDataSourceComponent.selectedItemId);
    this.layoutList[layoutIndex].itemData.resourceInfo = layoutData.itemData.resourceInfo;
    this.layoutList[layoutIndex].itemData.timeLength = layoutData.itemData.timeLength;
    this.frontDataSourceComponent.dataList[this.frontDataSourceComponent.selectedItemId] = layoutData.itemData;
    this.loadChart(layoutData.itemData, layoutData.id);
    this.isDataChange++;
    this.emitter.emit(this.isDataChange);
  }

  /**
   * id 数据的id
   * boxId 盒子的id
   */
  public loadChart(itemData: Scene.ResourceView, boxId): void {
    const timerItem = null;
    if (!(boxId in this.timer)) {
      this.timer[boxId] = {
        isFirstLoad: true,
        timerItem: timerItem
      };
    }
    if (this.timer[boxId].isFirstLoad) {
      const newChart: Scene.Chart = new Scene.Chart();
      newChart.id = 'dataItemBox' + boxId;
      newChart.obj = echarts.init(document.getElementById(newChart.id), 'dark');
      this.chartObj[boxId] = newChart.obj;
    } else {
      this.chartObj[boxId].clear();
    }
    this.chartObj[boxId].setOption(itemData.resourceInfo);
    if (this.timer[boxId].isFirstLoad) {
      this.timer[boxId].timerItem = setInterval(d => {
        // this.ssSer.getSceneItemData(this.sceneForm.sceneId, itemData.resourceId).subscribe({
        //   next: (val) => {
        //     if (val.code === 0) {
        //       this.loadChart(val.data, boxId);
        //     }
        //   }
        // });
        this.loadChart(itemData, boxId);
      }, this.appSer.appsetting.timer);
      this.timer[boxId].isFirstLoad = false;
    }
  }

  public itemChangeFun(itemData: Scene.LayoutItem) {
    if (itemData.itemData.resourceCode === DataTypeEnum.Echarts) {
      this.chartObj[itemData.itemId].resize();
    } else if (itemData.itemData.resourceCode === DataTypeEnum.Map) {
      itemData.itemData.resourceId = Utils.generateUUID();
    }
  }

  // 重置页面的比例
  private resizeBoxSize(): void {
    const pageWidth = this.sceneId === '' ? this.defSer.screenWidth : this.pageSize.width;
    const pageHeight = this.sceneId === '' ? this.defSer.screenHeight : this.pageSize.height;
    const padding = 70;
    const ratio = (
      (this.$container.width() - padding) / pageWidth) > ((this.$container.height() - padding) / pageHeight);
    let boxRadio;
    if (!ratio) {
      boxRadio = (this.$container.width() - padding) / pageWidth;
    } else {
      boxRadio = (this.$container.height() - padding) / pageHeight;
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
   * 文本、图片、时间器的配置信息发生改变触发该方法去改变样式数据
   */
  public changeData(data: Scene.ResourceView) {
    const currTextData = this.layoutList.filter(ele => {
      return ele.itemId === this.frontDataSourceComponent.selectedItemId;
    });
    currTextData[0].itemData = data;
    this.frontDataSourceComponent.dataList[this.frontDataSourceComponent.selectedItemId] = data;
    this.isDataChange++;
    this.emitter.emit(this.isDataChange);
  }

  // 该方法会先销毁中间组件然后再重新渲染
  public changeData1(data: Scene.ResourceView) {
    const currTextDataIndex = this.layoutList.findIndex(ele =>
      ele.itemId === this.frontDataSourceComponent.selectedItemId
    );
    const currTextData: Scene.LayoutItem = JSON.parse(JSON.stringify(this.layoutList[currTextDataIndex]));
    currTextData.itemData = data;
    this.layoutList.splice(currTextDataIndex, 1, currTextData);
    this.frontDataSourceComponent.dataList[this.frontDataSourceComponent.selectedItemId] = data;
  }

  /**
   * 保存场景
   */
  public saveScene(): void {
    swal({
      title: '保存场景',
      input: 'text',
      padding: 0,
      width: '400px',
      showCancelButton: true,
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入场景名称',
      inputAttributes: { maxlength: '25' },
      confirmButtonColor: this.defSer.swalConfirmButtonColor,
      cancelButtonClass: 'cancelButtonClass',
      showCloseButton: true,
      inputValue: this.sceneForm.sceneName,
      inputValidator: (value) => {
        return new Promise((resolve, reject) => {
          if (value) {
            const reg = /^[\w\u4e00-\u9fa5]+$/;
            if (!reg.test(value)) {
              swal.showValidationError('只允许输入中文、字母、数字、下划线');
              swal.enableInput();
              swal.enableButtons();
              return;
            }
            // 保存场景之前将更新的数据进行更新
            this.sceneForm.sceneName = value;
            this.sceneForm.backgroundUrl = JSON.parse(JSON.stringify(this.sceneBg));
            this.sceneForm.itemList = [];
            this.sceneForm.resolutionX = this.defSer.screenWidth;
            this.sceneForm.resolutionY = this.defSer.screenHeight;
            this.layoutList.forEach(ele => {
              const sceneFormItem: Scene.SceneFormItem = new Scene.SceneFormItem(); // 场景窗口实体
              sceneFormItem.positionX = ele.positionX;
              sceneFormItem.positionY = ele.positionY;
              sceneFormItem.sizeCol = ele.sizeCol;
              sceneFormItem.sizeRow = ele.sizeRow;
              sceneFormItem.resourceId = ele.itemData.resourceId;
              sceneFormItem.resourceName = ele.itemData.resourceName;
              sceneFormItem.resourceInfo = ele.itemData.resourceInfo;
              sceneFormItem.itemId = ele.itemId;
              sceneFormItem.layerNum =
                this.frontDataSourceComponent.dataIdList.length - this.frontDataSourceComponent.dataIdList.indexOf(ele.itemId);
              sceneFormItem.resourceCode = ele.itemData.resourceCode;
              sceneFormItem.detailCode = ele.itemData.detailCode;
              sceneFormItem.configInfo = ele.itemData.configInfo;
              if (ele.itemData.detailCode === DataTypeEnum.Echarts) {
                sceneFormItem.timeLength = ele.itemData.timeLength;
              }
              this.sceneForm.itemList.push(sceneFormItem);
            });
            // this.cmSer.saveImg(this.$main).subscribe({
            //   next: (d) => {
            //     this.sceneForm.thumbnail = d; // 缩略图地址
            this.ssSer.saveScene(this.sceneForm).subscribe({
              next: (val) => {
                if (val.code === 0) {
                  resolve();
                  this.toolTipSer.showMsg('保存场景成功');
                  this.sceneForm.sceneName = '';
                  this.isDataChange = 0;
                  this.emitter.emit(this.isDataChange);
                  this.router.navigate(['/dashboard/bigScreen/front/sceneView']);
                } else {
                  swal.showValidationError(val.message);
                  swal.enableInput();
                  swal.enableButtons();
                }
              },
              error: (err) => {
                LogHelper.error('front', 'front-data-view saveScene()error,原因:' + JSON.stringify(err));
              }
            });
            //   },
            // });
          } else {
            swal.showValidationError('请输入场景名称');
            swal.enableInput();
            swal.enableButtons();
          }
        });
      }
    });
  }

  /**
   * 拖拽的预设方法
   */
  public dragFun(): void {
    const currThis = this;
    $(document).mousemove(function (e) {
      if (!!this.move) {
        const posix = !this.move_target ? { 'x': 0, 'y': 0 } : this.move_target.posix,
          callback = this.call_down || function () {
            // $(this.move_target).css({
            //   'top': e.pageY - currThis.$main.offset().top - posix.y,
            //   'left': e.pageX - currThis.$main.offset().left - posix.x
            // });
          };
        callback.call(this, e, posix);
      }
    }).mouseup(function (e) {
      if (!!this.move) {
        const callback = this.call_up || function () { };
        callback.call(this, e);
        $.extend(this, {
          'move': false,
          'move_target': null,
          'call_down': false,
          'call_up': false
        });
      }
    });
  }

  /**
   * 下移一层
   */
  public moveDown(): void {
    const dataIdIndex = this.frontDataSourceComponent.dataIdList.indexOf(this.contextmenuLayoutItemId);
    if (dataIdIndex === this.frontDataSourceComponent.dataIdList.length - 1) {
      return;
    } else {
      this.frontDataSourceComponent.dataIdList[dataIdIndex] = this.frontDataSourceComponent.dataIdList.splice(
        dataIdIndex + 1, 1, this.frontDataSourceComponent.dataIdList[dataIdIndex])[0];
    }

  }

  /**
   * 上移一层
   */
  public moveUp(): void {
    // 页面加置灰样式
    const dataIdIndex = this.frontDataSourceComponent.dataIdList.indexOf(this.contextmenuLayoutItemId);
    if (dataIdIndex === 0) {
      return;
    } else {
      this.frontDataSourceComponent.dataIdList[dataIdIndex] = this.frontDataSourceComponent.dataIdList.splice(
        dataIdIndex - 1, 1, this.frontDataSourceComponent.dataIdList[dataIdIndex])[0];
    }
    this.isDataChange++;
    this.emitter.emit(this.isDataChange);
  }

  /**
   * 置顶/置底
   */
  public move(flag: string) {
    const dataIdIndex = this.frontDataSourceComponent.dataIdList.indexOf(this.contextmenuLayoutItemId);
    const dataIdItem = this.frontDataSourceComponent.dataIdList[dataIdIndex];
    if (flag === 'bottom') { // 置底
      if (dataIdIndex === this.frontDataSourceComponent.dataIdList.length - 1) {
        return;
      }
      this.frontDataSourceComponent.dataIdList.splice(dataIdIndex, 1);
      this.frontDataSourceComponent.dataIdList.push(dataIdItem);
    } else { // 置顶
      if (dataIdIndex === 0) {
        return;
      }
      this.frontDataSourceComponent.dataIdList.splice(dataIdIndex, 1);
      this.frontDataSourceComponent.dataIdList.unshift(dataIdItem);
    }
    this.isDataChange++;
    this.emitter.emit(this.isDataChange);
  }

  /**
   * 删除组件
   */
  public deleteCom(): void {
    const layoutIndex = this.layoutList.findIndex(t => t.itemId === this.contextmenuLayoutItemId);
    this.layoutList.splice(layoutIndex, 1);
    delete this.frontDataSourceComponent.dataList[this.contextmenuLayoutItemId];
    this.frontDataSourceComponent.dataIdList.splice(this.frontDataSourceComponent.dataIdList.indexOf(this.contextmenuLayoutItemId), 1);
    this.isDataChange++;
    this.emitter.emit(this.isDataChange);
  }
}
